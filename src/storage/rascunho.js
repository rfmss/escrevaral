(function (documento) {
  'use strict';
  var prefix = 'escrevaral.next.mesa.v1.';
  function parse(raw) {
    var record = JSON.parse(raw);
    if (!documento.valid(record)) { throw new Error('invalid'); }
    return record;
  }
  function create(storage, writerId) {
    var currentKey = prefix + 'current', previousKey = prefix + 'previous';
    var rescueKey = prefix + 'rescue.' + writerId;
    function read() {
      var raw;
      if (!storage) { return { record: documento.fresh(), raw: null, problem: 'unavailable' }; }
      try {
        raw = storage.getItem(currentKey);
        return { record: raw === null ? documento.fresh() : parse(raw), raw: raw, problem: null };
      } catch (error) {
        return { record: documento.fresh(), raw: raw, problem: 'unreadable' };
      }
    }
    function save(record, expected) {
      var raw, observed;
      if (!storage) { return { ok: false, reason: 'unavailable' }; }
      if (!documento.valid(record)) { return { ok: false, reason: 'invalid' }; }
      raw = JSON.stringify(record);
      try {
        /* A cópia desta sessão é independente da disputa pela folha principal. */
        storage.setItem(rescueKey, raw);
        if (storage.getItem(rescueKey) !== raw) { throw new Error('rescue'); }
        observed = storage.getItem(currentKey);
        if (observed !== expected) { return { ok: false, reason: 'conflict', rescued: true }; }
        if (observed !== null) {
          parse(observed);
          storage.setItem(previousKey, observed);
        }
        storage.setItem(currentKey, raw);
        if (storage.getItem(currentKey) !== raw) { return { ok: false, reason: 'conflict', rescued: true }; }
        return { ok: true, raw: raw };
      } catch (error) { return { ok: false, reason: 'write' }; }
    }
    function recoveries() {
      var items = [], unreadable = 0, i, key, record, current, same;
      if (!storage) { return { items: items, unreadable: 0 }; }
      try {
        current = read();
        for (i = 0; i < storage.length; i += 1) {
          key = storage.key(i);
          if (key !== previousKey && key.indexOf(prefix + 'rescue.') !== 0) { continue; }
          try {
            record = parse(storage.getItem(key));
            same = !current.problem && record.title === current.record.title && record.text === current.record.text;
            if (!same) { items.push({ key: key, record: record }); }
          } catch (error) { unreadable += 1; }
        }
      } catch (error) { unreadable += 1; }
      items.sort(function (a, b) { return b.record.updated - a.record.updated; });
      return { items: items, unreadable: unreadable };
    }
    return { read: read, save: save, recoveries: recoveries, key: currentKey };
  }
  return { create: create };
})
