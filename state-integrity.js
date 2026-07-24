// state-integrity.js — three-way merge seguro para edições em múltiplas abas
(function exposeStateIntegrity(global) {
  "use strict";

  const RECORD_MAP_KEYS = ["proofs", "versions", "proofValidations"];
  const DERIVED_MANUSCRIPT_KEYS = new Set(["updatedAt"]);

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (!value || typeof value !== "object") return value;
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = stable(value[key]);
      return result;
    }, {});
  }

  function equal(a, b) {
    return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
  }

  function indexManuscripts(state) {
    return new Map((state?.manuscripts || []).map((manuscript) => [manuscript.id, manuscript]));
  }

  function mergeManuscript(base, local, remote) {
    if (equal(local, remote)) return { value: clone(local), conflictingKeys: [] };
    if (equal(local, base)) return { value: clone(remote), conflictingKeys: [] };
    if (equal(remote, base)) return { value: clone(local), conflictingKeys: [] };

    if (!local || !remote) {
      return { value: null, conflictingKeys: ["__deleted__"] };
    }

    const keys = new Set([
      ...Object.keys(base || {}),
      ...Object.keys(local),
      ...Object.keys(remote),
    ]);
    const merged = {};
    const conflictingKeys = [];

    for (const key of keys) {
      if (DERIVED_MANUSCRIPT_KEYS.has(key)) continue;
      const baseValue = base?.[key];
      const localValue = local[key];
      const remoteValue = remote[key];

      if (equal(localValue, remoteValue)) {
        merged[key] = clone(localValue);
      } else if (equal(localValue, baseValue)) {
        merged[key] = clone(remoteValue);
      } else if (equal(remoteValue, baseValue)) {
        merged[key] = clone(localValue);
      } else {
        conflictingKeys.push(key);
      }
    }

    if (conflictingKeys.length) return { value: null, conflictingKeys };

    const localUpdated = Date.parse(local.updatedAt || 0) || 0;
    const remoteUpdated = Date.parse(remote.updatedAt || 0) || 0;
    merged.updatedAt = localUpdated >= remoteUpdated ? local.updatedAt : remote.updatedAt;
    return { value: merged, conflictingKeys: [] };
  }

  function conflictIdFor(originalId, at, occupiedIds) {
    const stamp = String(at || new Date().toISOString()).replace(/\D/g, "").slice(0, 14);
    const baseId = `${originalId}-conflito-${stamp || "local"}`;
    let candidate = baseId;
    let suffix = 2;
    while (occupiedIds.has(candidate)) {
      candidate = `${baseId}-${suffix}`;
      suffix += 1;
    }
    occupiedIds.add(candidate);
    return candidate;
  }

  function conflictTitle(title) {
    const baseTitle = String(title || "Texto sem título").replace(/\s+\(conflito preservado\)$/i, "");
    return `${baseTitle} (conflito preservado)`;
  }

  function mergeConcurrentValue(baseValue, localValue, remoteValue) {
    if (equal(localValue, remoteValue)) return clone(localValue);
    if (equal(localValue, baseValue)) return clone(remoteValue);
    if (equal(remoteValue, baseValue)) return clone(localValue);

    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      const identityOf = (item) => item && typeof item === "object" && item.id
        ? `id:${item.id}`
        : `value:${JSON.stringify(stable(item))}`;
      const baseByIdentity = new Map((Array.isArray(baseValue) ? baseValue : []).map((item) => [identityOf(item), item]));
      const localByIdentity = new Map(localValue.map((item) => [identityOf(item), item]));
      const remoteByIdentity = new Map(remoteValue.map((item) => [identityOf(item), item]));
      const identities = [];
      for (const item of [...remoteValue, ...localValue]) {
        const identity = identityOf(item);
        if (!identities.includes(identity)) identities.push(identity);
      }
      const combined = [];
      for (const identity of identities) {
        const localItem = localByIdentity.get(identity);
        const remoteItem = remoteByIdentity.get(identity);
        if (localItem !== undefined && remoteItem !== undefined) {
          combined.push(mergeConcurrentValue(
            baseByIdentity.get(identity),
            localItem,
            remoteItem
          ));
        } else {
          combined.push(clone(localItem !== undefined ? localItem : remoteItem));
        }
      }
      return combined;
    }

    if (
      localValue && remoteValue
      && typeof localValue === "object" && !Array.isArray(localValue)
      && typeof remoteValue === "object" && !Array.isArray(remoteValue)
    ) {
      const result = {};
      const keys = new Set([
        ...Object.keys(baseValue || {}),
        ...Object.keys(localValue),
        ...Object.keys(remoteValue),
      ]);
      for (const key of keys) {
        result[key] = mergeConcurrentValue(
          baseValue?.[key],
          localValue[key],
          remoteValue[key]
        );
      }
      return result;
    }

    // Metadados escalares podem divergir (por exemplo, sessão ativa). A aba
    // atual vence, mas coleções e eventos já foram unidos acima.
    return clone(localValue);
  }

  function copyRecordMaps(merged, base, local, remote, conflicts) {
    for (const key of RECORD_MAP_KEYS) {
      const baseMap = base?.[key] || {};
      const localMap = local?.[key] || {};
      const remoteMap = remote?.[key] || {};
      const nextMap = {};
      const ids = new Set([
        ...Object.keys(baseMap),
        ...Object.keys(localMap),
        ...Object.keys(remoteMap),
      ]);

      for (const id of ids) {
        nextMap[id] = mergeConcurrentValue(baseMap[id], localMap[id], remoteMap[id]);
      }

      for (const conflict of conflicts) {
        if (Object.prototype.hasOwnProperty.call(remoteMap, conflict.originalId)) {
          nextMap[conflict.originalId] = clone(remoteMap[conflict.originalId]);
        }
        if (Object.prototype.hasOwnProperty.call(localMap, conflict.originalId)) {
          nextMap[conflict.preservedId] = clone(localMap[conflict.originalId]);
        }
      }
      merged[key] = nextMap;
    }
  }

  function mergeConcurrentStates(baseState, localState, remoteState, options = {}) {
    const at = options.at || new Date().toISOString();
    const base = clone(baseState || {});
    const local = clone(localState || {});
    const remote = clone(remoteState || {});
    const baseById = indexManuscripts(base);
    const localById = indexManuscripts(local);
    const remoteById = indexManuscripts(remote);
    const orderedIds = [];

    for (const manuscript of remote.manuscripts || []) orderedIds.push(manuscript.id);
    for (const manuscript of local.manuscripts || []) {
      if (!orderedIds.includes(manuscript.id)) orderedIds.push(manuscript.id);
    }
    for (const manuscript of base.manuscripts || []) {
      if (!orderedIds.includes(manuscript.id)) orderedIds.push(manuscript.id);
    }

    const occupiedIds = new Set(orderedIds);
    const manuscripts = [];
    const conflicts = [];
    let nextActiveId = local.activeId || remote.activeId || null;

    for (const id of orderedIds) {
      const baseManuscript = baseById.get(id) || null;
      const localManuscript = localById.get(id) || null;
      const remoteManuscript = remoteById.get(id) || null;
      const result = mergeManuscript(baseManuscript, localManuscript, remoteManuscript);

      if (!result.conflictingKeys.length) {
        if (result.value) manuscripts.push(result.value);
        continue;
      }

      // A versão já gravada conserva o id original. A versão desta aba recebe
      // um novo id, de modo que nenhuma das duas possa apagar a outra.
      if (remoteManuscript) manuscripts.push(clone(remoteManuscript));
      if (localManuscript) {
        const preservedId = conflictIdFor(id, at, occupiedIds);
        const preserved = {
          ...clone(localManuscript),
          id: preservedId,
          title: conflictTitle(localManuscript.title),
          conflictOf: id,
          conflictCreatedAt: at,
          updatedAt: at,
        };
        manuscripts.push(preserved);
        conflicts.push({
          originalId: id,
          preservedId,
          conflictingKeys: result.conflictingKeys,
        });
        if (local.activeId === id) nextActiveId = preservedId;
      } else {
        conflicts.push({
          originalId: id,
          preservedId: null,
          conflictingKeys: result.conflictingKeys,
        });
      }
    }

    const merged = {
      ...remote,
      ...local,
      manuscripts,
      activeId: manuscripts.some((item) => item.id === nextActiveId) ? nextActiveId : (manuscripts[0]?.id || null),
    };
    copyRecordMaps(merged, base, local, remote, conflicts);

    return { state: merged, conflicts };
  }

  const api = Object.freeze({
    clone,
    equal,
    mergeConcurrentStates,
  });

  global.VeredaStateIntegrity = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
