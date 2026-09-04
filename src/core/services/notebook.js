(function (root, factory) {
    "use strict";
    var api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.EscrevaralNotebook = api;
}(this, function () {
    "use strict";

    var SCHEMA_VERSION = 1;
    var INDEX_KEY = "escrevaral.encore.notes.v1";
    var NOTE_PREFIX = "escrevaral.encore.note.";

    function parse(value, fallback) {
        try {
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function copy(value) {
        return parse(JSON.stringify(value), null);
    }

    function cleanTitle(value) {
        return String(value == null ? "" : value).replace(/^\s+|\s+$/g, "");
    }

    function Store(storage, options) {
        options = options || {};
        if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") {
            throw new Error("STORAGE_REQUIRED");
        }
        this.storage = storage;
        this.now = options.now || function () { return new Date().getTime(); };
        this.random = options.random || Math.random;
    }

    Store.prototype._noteKey = function (id) {
        return NOTE_PREFIX + id;
    };

    Store.prototype._readIndex = function () {
        var index = parse(this.storage.getItem(INDEX_KEY), []);
        return index && typeof index.length === "number" ? index : [];
    };

    Store.prototype._write = function (key, value) {
        try {
            this.storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    };

    Store.prototype._makeId = function (createdAt) {
        var suffix = Math.floor(this.random() * 1679616).toString(36);
        return "n" + createdAt.toString(36) + "-" + suffix;
    };

    Store.prototype._replaceIndexItem = function (note) {
        var index = this._readIndex();
        var next = [];
        var i;
        for (i = 0; i < index.length; i += 1) {
            if (index[i].id !== note.id) next.push(index[i]);
        }
        next.push({
            id: note.id,
            title: note.title,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        });
        next.sort(function (a, b) {
            if (a.createdAt !== b.createdAt) return b.createdAt - a.createdAt;
            return a.id < b.id ? -1 : 1;
        });
        return this._write(INDEX_KEY, next);
    };

    Store.prototype.create = function (title, body) {
        var createdAt = this.now();
        var note;
        var key;
        title = cleanTitle(title);
        if (!title) return { ok: false, code: "TITLE_REQUIRED" };
        note = {
            schemaVersion: SCHEMA_VERSION,
            id: this._makeId(createdAt),
            title: title,
            body: String(body == null ? "" : body),
            createdAt: createdAt,
            updatedAt: createdAt
        };
        key = this._noteKey(note.id);
        if (!this._write(key, note)) return { ok: false, code: "STORAGE_WRITE_FAILED" };
        if (!this._replaceIndexItem(note)) {
            try { if (typeof this.storage.removeItem === "function") this.storage.removeItem(key); } catch (ignore) {}
            return { ok: false, code: "INDEX_WRITE_FAILED" };
        }
        return { ok: true, note: copy(note) };
    };

    Store.prototype.get = function (id) {
        var note = parse(this.storage.getItem(this._noteKey(id)), null);
        if (!note || note.schemaVersion !== SCHEMA_VERSION) return null;
        return copy(note);
    };

    Store.prototype.update = function (id, changes) {
        var note = this.get(id);
        var previous;
        var title;
        var key;
        if (!note) return { ok: false, code: "NOTE_NOT_FOUND" };
        changes = changes || {};
        title = cleanTitle(typeof changes.title === "undefined" ? note.title : changes.title);
        if (!title) return { ok: false, code: "TITLE_REQUIRED" };
        previous = copy(note);
        note.title = title;
        if (typeof changes.body !== "undefined") note.body = String(changes.body);
        note.updatedAt = this.now();
        if (note.updatedAt < note.createdAt) note.updatedAt = note.createdAt;
        key = this._noteKey(id);
        if (!this._write(key, note)) return { ok: false, code: "STORAGE_WRITE_FAILED" };
        if (!this._replaceIndexItem(note)) {
            this._write(key, previous);
            return { ok: false, code: "INDEX_WRITE_FAILED" };
        }
        return { ok: true, note: copy(note) };
    };

    Store.prototype.list = function () {
        return copy(this._readIndex());
    };

    return {
        Store: Store,
        SCHEMA_VERSION: SCHEMA_VERSION,
        INDEX_KEY: INDEX_KEY,
        NOTE_PREFIX: NOTE_PREFIX
    };
}));
