/* dict-ptbr format 1. No dependencies; one payload and one pending script. */
(function (root) {
    "use strict";
    if (root.D) { throw new Error("dict-ptbr: namespace D occupied"); }
    var manifest = null, base = "", timeout = 10000, configured = false;
    var cache = null, pending = null, blocked = false, loads = 0;
    var lower = "àáâãäåèéêëìíîïòóôõöùúûüçñýÿ";
    var upper = "ÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇÑÝŸ";
    var plain = "aaaaaaeeeeiiiiooooouuuucnyy";
    var marks = [768,769,770,771,776,778,768,769,770,776,
        768,769,770,776,768,769,770,771,776,768,769,770,776,807,771,769,776];

    function error(code, message) { return {code: code, message: message}; }
    function canonical(text) {
        var out = "", i, c, n, j, next;
        for (i = 0; i < text.length; i += 1) {
            c = text.charAt(i); n = text.charCodeAt(i);
            if (n >= 65 && n <= 90) { c = String.fromCharCode(n + 32); }
            j = upper.indexOf(c);
            if (j !== -1) { c = lower.charAt(j); }
            next = text.charCodeAt(i + 1);
            for (j = 0; j < marks.length; j += 1) {
                if (plain.charAt(j) === c && marks[j] === next) {
                    c = lower.charAt(j); i += 1; break;
                }
            }
            out += c;
        }
        return out;
    }
    function key(text) {
        var s = canonical(text), out = "", i, p;
        for (i = 0; i < s.length; i += 1) {
            p = lower.indexOf(s.charAt(i));
            out += p < 0 ? s.charAt(i) : plain.charAt(p);
        }
        return out;
    }
    function bytes(text) {
        var total = 0, i, c, next;
        for (i = 0; i < text.length; i += 1) {
            c = text.charCodeAt(i);
            if (c >= 55296 && c <= 56319) {
                next = text.charCodeAt(i + 1);
                if (!(next >= 56320 && next <= 57343)) { return -1; }
                i += 1; total += 4;
            } else if (c >= 56320 && c <= 57343) { return -1;
            } else { total += c < 128 ? 1 : (c < 2048 ? 2 : 3); }
        }
        return total;
    }
    function decode(field) {
        var out = "", i, c;
        for (i = 0; i < field.length; i += 1) {
            c = field.charAt(i);
            if (c === "\\") {
                i += 1; c = field.charAt(i);
                if (c === "p") { c = "|"; }
                else if (c === "n") { c = "\n"; }
                else if (c === "r") { c = "\r"; }
                else if (c === "t") { c = "\t"; }
                else if (c === "c") { c = ","; }
                else if (c !== "\\") { throw error("E_FORMAT", "Invalid escape"); }
            }
            out += c;
        }
        return out;
    }
    function row(line) {
        var fields = line.split("|"), i;
        if (fields.length !== 4) { throw error("E_FORMAT", "Expected four fields"); }
        for (i = 0; i < fields.length; i += 1) { fields[i] = decode(fields[i]); }
        if (!fields[0] || !fields[1] || fields[0].length > 128 ||
                fields[1].length > 128 || fields[0] !== key(fields[1]) ||
                /[\x00-\x1f\x7f]/.test(fields[0] + fields[1]) ||
                (fields[2] === "") !== (fields[3] === "") ||
                (fields[3] && !/^[asjnpvdrci]$/.test(fields[3])) ||
                (fields[2] && !/^.+\.[asjnpvdrci][1-9][0-9]*$/.test(fields[2])) ||
                (fields[2] && fields[2].slice(fields[2].lastIndexOf(".") + 1, fields[2].lastIndexOf(".") + 2) !== fields[3])) {
            throw error("E_FORMAT", "Invalid form record");
        }
        return fields;
    }
    function compare(a, b) {
        var i;
        for (i = 0; i < 4; i += 1) {
            if (a[i] < b[i]) { return -1; }
            if (a[i] > b[i]) { return 1; }
        }
        return 0;
    }
    function validate(text, desc) {
        var start = 0, end, count = 0, fields, previous = null;
        if (typeof text !== "string" || text.length > 300000 ||
                bytes(text) !== desc.payloadBytes || desc.payloadBytes > 300000 ||
                /[\x00-\x09\x0b-\x1f\x7f]/.test(text) ||
                (text && text.charAt(text.length - 1) !== "\n")) {
            throw error("E_FORMAT", "Invalid payload size or encoding");
        }
        while (start < text.length) {
            end = text.indexOf("\n", start);
            if (end === start || end - start > 16384) { throw error("E_FORMAT", "Invalid line"); }
            fields = row(text.slice(start, end));
            if (fields[0].indexOf(desc.prefix) !== 0 || (previous && compare(previous, fields) >= 0)) {
                throw error("E_FORMAT", "Prefix, ordering or duplicate record");
            }
            previous = fields; count += 1; start = end + 1;
        }
        if (count !== desc.records) { throw error("E_FORMAT", "Record count mismatch"); }
    }
    function search(text, word, normalized) {
        var start = 0, end, fields, entries = [], wanted = canonical(word);
        while (start < text.length) {
            end = text.indexOf("\n", start); fields = row(text.slice(start, end));
            if (fields[0] > normalized) { break; }
            if (fields[0] === normalized && canonical(fields[1]) === wanted) {
                if (entries.length === 64) { throw error("E_LIMIT", "Too many readings"); }
                entries.push({key: fields[0], form: fields[1], lid: fields[2], cl: fields[3]});
            }
            start = end + 1;
        }
        return {status: entries.length ? "found" :
            (manifest.kind === "fixture" ? "absent-in-fixture" : "absent-in-package"),
            key: normalized, entries: entries};
    }
    function result(text, word, normalized, done) {
        var value, failure = null;
        try { value = search(text, word, normalized); } catch (e) { failure = e; }
        done(failure, value);
    }
    function install(m) {
        var names = ["f", "x", "l", "d", "e", "s"], i, j, layer, desc, previous, total;
        if (manifest || !m || m.project !== "dict-ptbr" || m.formatVersion !== 1 ||
                m.normalization !== "ptbr-key-1" || m.encoding !== "UTF-8/NFC/LF" ||
                m.maxFileBytes !== 300000 || !m.dataVersion ||
                (m.kind !== "fixture" && m.kind !== "release") || !m.layers) {
            throw error("E_MANIFEST", "Unsupported or repeated manifest");
        }
        for (i = 0; i < names.length; i += 1) {
            layer = m.layers[names[i]];
            if (!layer || !Array.isArray(layer.fragments) || !Array.isArray(layer.metadata)) {
                throw error("E_MANIFEST", "Missing layer");
            }
            total = 0; previous = "";
            for (j = 0; j < layer.fragments.length; j += 1) {
                desc = layer.fragments[j];
                if (!desc || typeof desc.prefix !== "string" || !desc.prefix ||
                        (previous && (previous >= desc.prefix || desc.prefix.indexOf(previous) === 0)) ||
                        desc.id !== names[i] + "/" + desc.prefix ||
                        typeof desc.path !== "string" ||
                        !(new RegExp("^" + names[i] + "/[a-z0-9-]+\\.js$")).test(desc.path) ||
                        desc.records !== Math.floor(desc.records) || desc.records < 1 ||
                        desc.bytes !== Math.floor(desc.bytes) || desc.bytes < 1 || desc.bytes > 300000 ||
                        desc.payloadBytes !== Math.floor(desc.payloadBytes) || desc.payloadBytes < 1 || desc.payloadBytes > 300000 ||
                        !/^[a-f0-9]{64}$/.test(desc.sha256) || !/^[a-f0-9]{64}$/.test(desc.payloadSha256) ||
                        !Array.isArray(desc.sources) || !desc.sources.length || !/^[ahv]$/.test(desc.rev) || !desc.batch) {
                    throw error("E_MANIFEST", "Invalid fragment descriptor");
                }
                previous = desc.prefix; total += desc.records;
            }
            if (total !== layer.records) { throw error("E_MANIFEST", "Invalid layer count"); }
        }
        /* Copy: callers cannot mutate the validated routing table after install. */
        manifest = JSON.parse(JSON.stringify(m));
    }
    function configure(options) {
        if (pending) { throw error("E_BUSY", "Read in progress"); }
        if (!options || typeof options.base !== "string" || !options.base ||
                options.base.charAt(options.base.length - 1) !== "/" ||
                (options.timeout !== undefined &&
                (typeof options.timeout !== "number" || !isFinite(options.timeout) || options.timeout < 1))) {
            throw error("E_CONFIG", "Expected base directory and positive timeout");
        }
        base = options.base; timeout = options.timeout === undefined ? 10000 : options.timeout;
        configured = true; cache = null;
    }
    function receive(id, text) {
        if (!pending || blocked) { return; }
        if (pending.desc.id !== id || pending.received) {
            pending.failure = error("E_REGISTER", "Unexpected or repeated registration"); return;
        }
        pending.received = true;
        try { validate(text, pending.desc); pending.text = text; }
        catch (e) { pending.failure = e; }
    }
    function lookup(word, done) {
        var normalized, fragments, i, desc = null, doc, script, parent, request;
        if (typeof done !== "function") { throw error("E_INPUT", "Callback required"); }
        if (typeof word !== "string" || !word || word.length > 128 || bytes(word) < 0 || /[\x00-\x1f\x7f]/.test(word)) {
            done(error("E_INPUT", "Invalid word")); return;
        }
        if (!manifest || !configured) { done(error("E_CONFIG", "Manifest and configuration required")); return; }
        if (pending) { done(error("E_BUSY", "Read in progress")); return; }
        if (blocked) { done(error("E_TRANSPORT_BLOCKED", "Reload after timed-out script")); return; }
        normalized = key(word); fragments = manifest.layers.f.fragments;
        for (i = 0; i < fragments.length; i += 1) {
            if (normalized.indexOf(fragments[i].prefix) === 0) { desc = fragments[i]; break; }
        }
        if (!desc) { result("", word, normalized, done); return; }
        if (cache && cache.id === desc.id) { result(cache.text, word, normalized, done); return; }
        doc = root.document;
        if (!doc || !doc.createElement) { done(error("E_DOM", "Script transport needs a document")); return; }
        parent = doc.getElementsByTagName("head")[0] || doc.documentElement;
        script = doc.createElement("script"); script.type = "text/javascript"; script.charset = "utf-8";
        script.async = true; script.src = base + desc.path;
        cache = null;
        request = {desc: desc, received: false, text: null, failure: null, timer: null};
        pending = request; loads += 1;
        function finish(failure) {
            var text;
            if (pending !== request) { return; }
            root.clearTimeout(request.timer);
            script.onload = null; script.onerror = null;
            if (script.parentNode) { script.parentNode.removeChild(script); }
            failure = failure || request.failure;
            if (!failure && !request.received) { failure = error("E_REGISTER", "Script did not register payload"); }
            text = request.text; request.text = null; pending = null;
            if (failure) { done(failure); return; }
            cache = {id: desc.id, text: text}; result(text, word, normalized, done);
        }
        script.onload = function () { finish(null); };
        script.onerror = function () { finish(error("E_LOAD", "Fragment unavailable")); };
        request.timer = root.setTimeout(function () {
            blocked = true; finish(error("E_TIMEOUT", "Script deadline exceeded; reload required"));
        }, timeout);
        try { parent.appendChild(script); }
        catch (e) { finish(error("E_LOAD", "Could not attach script")); }
    }
    root.D = {m: install, f: receive, configure: configure, key: key, lookup: lookup,
        clear: function () { cache = null; },
        stats: function () { return {cachedFragments: cache ? 1 : 0,
            payloadChars: cache ? cache.text.length : 0, loads: loads,
            pending: !!pending, blocked: blocked}; }};
}(this));
