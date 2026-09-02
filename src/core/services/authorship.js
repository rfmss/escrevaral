(function (root) {
    "use strict";

    /* Escrevaral Encore — protocolo mínimo de autoria verificável.
     * ES5, sem rede e sem conteúdo no rastro de eventos.
     *
     * O relógio do aparelho é declarado, não confiável. A ordem das cápsulas e
     * o tempo relativo da sessão são locais. Anterioridade independente só
     * existe quando a raiz recebe uma testemunha externa posterior.
     */

    var Encore = root.Encore = root.Encore || {};
    Encore.core = Encore.core || {};
    Encore.core.services = Encore.core.services || {};

    function isArray(value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    }

    function stableStringify(value) {
        var keys;
        var parts;
        var i;
        if (value === null) return "null";
        if (typeof value === "string") return JSON.stringify(value);
        if (typeof value === "number") return isFinite(value) ? String(value) : "null";
        if (typeof value === "boolean") return value ? "true" : "false";
        if (isArray(value)) {
            parts = [];
            for (i = 0; i < value.length; i += 1) parts.push(stableStringify(value[i]));
            return "[" + parts.join(",") + "]";
        }
        if (typeof value === "object") {
            keys = Object.keys(value).sort();
            parts = [];
            for (i = 0; i < keys.length; i += 1) {
                if (typeof value[keys[i]] !== "undefined") {
                    parts.push(JSON.stringify(keys[i]) + ":" + stableStringify(value[keys[i]]));
                }
            }
            return "{" + parts.join(",") + "}";
        }
        return "null";
    }

    function integer(value, fallback) {
        var number = Number(value);
        if (!isFinite(number)) return fallback || 0;
        return Math.round(number);
    }

    function text(value) {
        return typeof value === "string" ? value : String(value || "");
    }

    function normalizeText(value) {
        return text(value).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    function sanitizeEvent(event) {
        var source = event || {};
        return {
            kind: text(source.kind || "change"),
            atMs: Math.max(0, integer(source.atMs, 0)),
            beforeLength: Math.max(0, integer(source.beforeLength, 0)),
            afterLength: Math.max(0, integer(source.afterLength, 0)),
            inserted: Math.max(0, integer(source.inserted, 0)),
            deleted: Math.max(0, integer(source.deleted, 0))
        };
    }

    function sanitizeEvents(events) {
        var safe = [];
        var i;
        events = isArray(events) ? events : [];
        for (i = 0; i < events.length; i += 1) safe.push(sanitizeEvent(events[i]));
        return safe;
    }

    function copyCapsuleWithoutHash(capsule) {
        return {
            protocol: capsule.protocol,
            version: capsule.version,
            noteId: capsule.noteId,
            sessionId: capsule.sessionId,
            sequence: capsule.sequence,
            previousHash: capsule.previousHash,
            document: capsule.document,
            process: capsule.process,
            time: capsule.time
        };
    }

    function requireHash(hashFunction) {
        if (typeof hashFunction !== "function") throw new Error("SHA-256 indisponível");
        return hashFunction;
    }

    function buildCapsule(request, hashFunction) {
        var hash = requireHash(hashFunction);
        var title = text(request.title);
        var body = text(request.text);
        var events = sanitizeEvents(request.events);
        var payload = {
            protocol: "scrvrl-authorship",
            version: 1,
            noteId: text(request.noteId),
            sessionId: text(request.sessionId),
            sequence: Math.max(1, integer(request.sequence, 1)),
            previousHash: text(request.previousHash || "GENESIS"),
            document: {
                titleHash: hash(title),
                textHash: hash(body),
                normalizedTitleHash: hash(normalizeText(title)),
                normalizedTextHash: hash(normalizeText(body)),
                normalization: "line-endings-v1",
                titleLength: title.length,
                characterCount: body.length
            },
            process: {
                eventCount: events.length,
                events: events
            },
            time: {
                deviceTimeMs: Math.max(0, integer(request.deviceTimeMs, 0)),
                sessionElapsedStartMs: Math.max(0, integer(request.elapsedStartMs, 0)),
                sessionElapsedEndMs: Math.max(0, integer(request.elapsedEndMs, 0)),
                clockSource: "device-declared",
                clockStatus: text(request.clockStatus || "unwitnessed"),
                independentWitness: "pending"
            }
        };
        var capsule = copyCapsuleWithoutHash(payload);
        capsule.capsuleHash = hash(stableStringify(payload));
        return capsule;
    }

    function createPackage(note, capsules) {
        return {
            format: "scrvrl",
            version: 1,
            product: "Escrevaral Encore",
            promise: "Editor sem IA. Texto no seu aparelho. Processo registrado. Anterioridade verificável.",
            note: {
                id: text(note.id),
                title: text(note.title),
                text: text(note.text)
            },
            capsules: isArray(capsules) ? capsules : [],
            witness: {
                status: "pending",
                type: "none",
                receipt: null
            }
        };
    }

    function verifyPackage(packageData, hashFunction) {
        var hash = requireHash(hashFunction);
        var data = packageData || {};
        var capsules = isArray(data.capsules) ? data.capsules : [];
        var previous = "GENESIS";
        var capsule;
        var expected;
        var i;
        if (data.format !== "scrvrl" || data.version !== 1) {
            return { valid: false, reason: "formato-invalido" };
        }
        if (!data.note || capsules.length === 0) {
            return { valid: false, reason: "prova-vazia" };
        }
        for (i = 0; i < capsules.length; i += 1) {
            capsule = capsules[i];
            if (capsule.protocol !== "scrvrl-authorship" || capsule.version !== 1) {
                return { valid: false, reason: "protocolo-invalido", index: i };
            }
            if (capsule.noteId !== text(data.note.id)) {
                return { valid: false, reason: "nota-incompativel", index: i };
            }
            if (capsule.sequence !== i + 1) return { valid: false, reason: "sequencia-quebrada", index: i };
            if (capsule.previousHash !== previous) return { valid: false, reason: "elo-quebrado", index: i };
            expected = hash(stableStringify(copyCapsuleWithoutHash(capsule)));
            if (expected !== capsule.capsuleHash) return { valid: false, reason: "capsula-alterada", index: i };
            previous = capsule.capsuleHash;
        }
        capsule = capsules[capsules.length - 1];
        if (hash(text(data.note.title)) !== capsule.document.titleHash) {
            return { valid: false, reason: "titulo-alterado" };
        }
        if (hash(text(data.note.text)) !== capsule.document.textHash) {
            return { valid: false, reason: "texto-alterado" };
        }
        if (capsule.document.normalizedTitleHash &&
                hash(normalizeText(data.note.title)) !== capsule.document.normalizedTitleHash) {
            return { valid: false, reason: "titulo-normalizado-alterado" };
        }
        if (capsule.document.normalizedTextHash &&
                hash(normalizeText(data.note.text)) !== capsule.document.normalizedTextHash) {
            return { valid: false, reason: "texto-normalizado-alterado" };
        }
        return {
            valid: true,
            reason: "integro",
            rootHash: previous,
            capsuleCount: capsules.length,
            witnessStatus: data.witness && data.witness.status ? data.witness.status : "pending"
        };
    }

    function exportPackage(packageData, hashFunction) {
        var result = verifyPackage(packageData, hashFunction);
        if (!result.valid) throw new Error("Pacote inválido: " + result.reason);
        return stableStringify(packageData);
    }

    function importPackage(serialized, hashFunction) {
        var packageData;
        var result;
        try {
            packageData = JSON.parse(text(serialized));
        } catch (ignore) {
            return { valid: false, reason: "json-invalido", packageData: null };
        }
        result = verifyPackage(packageData, hashFunction);
        return {
            valid: result.valid,
            reason: result.reason,
            rootHash: result.rootHash || null,
            capsuleCount: result.capsuleCount || 0,
            packageData: result.valid ? packageData : null
        };
    }

    function classifyChange(beforeLength, afterLength, pasted) {
        var before = Math.max(0, integer(beforeLength, 0));
        var after = Math.max(0, integer(afterLength, 0));
        var inserted = Math.max(0, after - before);
        var deleted = Math.max(0, before - after);
        var kind = pasted ? "paste" : (inserted > 0 ? "insert" : (deleted > 0 ? "delete" : "replace"));
        return {
            kind: kind,
            inserted: inserted,
            deleted: deleted,
            beforeLength: before,
            afterLength: after
        };
    }

    var service = {
        stableStringify: stableStringify,
        normalizeText: normalizeText,
        sanitizeEvents: sanitizeEvents,
        classifyChange: classifyChange,
        buildCapsule: buildCapsule,
        createPackage: createPackage,
        verifyPackage: verifyPackage,
        exportPackage: exportPackage,
        importPackage: importPackage
    };

    Encore.core.services.Authorship = service;
    if (typeof module === "object" && module.exports) module.exports = service;
}(typeof self !== "undefined" ? self : (typeof global !== "undefined" ? global : this)));
