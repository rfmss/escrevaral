(function (root) {
    "use strict";

    /* Escrevaral Encore — transporte segmentado de pacotes .scrvrl.
     *
     * O emissor antigo mostra um bloco por vez. Cada bloco se identifica,
     * confere seu próprio conteúdo e carrega o hash do pacote completo.
     * Nenhum relógio, rede, câmera, módulo ou API moderna participa daqui.
     */

    var Encore = root.Encore = root.Encore || {};
    var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var CRC_TABLE = buildCrcTable();
    var PROTOCOL = "S1";

    Encore.core = Encore.core || {};
    Encore.core.services = Encore.core.services || {};

    function buildCrcTable() {
        var table = [];
        var value;
        var i;
        var bit;
        for (i = 0; i < 256; i += 1) {
            value = i;
            for (bit = 0; bit < 8; bit += 1) {
                value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
            }
            table.push(value >>> 0);
        }
        return table;
    }

    function padHex(value, width) {
        var result = value;
        while (result.length < width) result = "0" + result;
        return result;
    }

    function crc32(value) {
        var crc = 0 ^ -1;
        var i;
        value = String(value || "");
        for (i = 0; i < value.length; i += 1) {
            crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ value.charCodeAt(i)) & 0xff];
        }
        return padHex(((crc ^ -1) >>> 0).toString(16), 8);
    }

    function utf8Bytes(value) {
        var bytes = [];
        var code;
        var next;
        var point;
        var i;
        value = String(value || "");
        for (i = 0; i < value.length; i += 1) {
            code = value.charCodeAt(i);
            if (code < 0x80) {
                bytes.push(code);
            } else if (code < 0x800) {
                bytes.push(0xc0 | (code >>> 6));
                bytes.push(0x80 | (code & 0x3f));
            } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < value.length) {
                next = value.charCodeAt(i + 1);
                if (next >= 0xdc00 && next <= 0xdfff) {
                    point = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
                    bytes.push(0xf0 | (point >>> 18));
                    bytes.push(0x80 | ((point >>> 12) & 0x3f));
                    bytes.push(0x80 | ((point >>> 6) & 0x3f));
                    bytes.push(0x80 | (point & 0x3f));
                    i += 1;
                } else {
                    bytes.push(0xef, 0xbf, 0xbd);
                }
            } else if (code >= 0xd800 && code <= 0xdfff) {
                bytes.push(0xef, 0xbf, 0xbd);
            } else {
                bytes.push(0xe0 | (code >>> 12));
                bytes.push(0x80 | ((code >>> 6) & 0x3f));
                bytes.push(0x80 | (code & 0x3f));
            }
        }
        return bytes;
    }

    function base64Encode(value) {
        var bytes = utf8Bytes(value);
        var output = [];
        var first;
        var second;
        var third;
        var i;
        for (i = 0; i < bytes.length; i += 3) {
            first = bytes[i];
            second = i + 1 < bytes.length ? bytes[i + 1] : -1;
            third = i + 2 < bytes.length ? bytes[i + 2] : -1;
            output.push(ALPHABET.charAt(first >>> 2));
            output.push(ALPHABET.charAt(((first & 3) << 4) | (second < 0 ? 0 : second >>> 4)));
            output.push(second < 0 ? "=" : ALPHABET.charAt(((second & 15) << 2) | (third < 0 ? 0 : third >>> 6)));
            output.push(third < 0 ? "=" : ALPHABET.charAt(third & 63));
        }
        return output.join("");
    }

    function utf8Decode(bytes) {
        var output = [];
        var first;
        var point;
        var i = 0;
        while (i < bytes.length) {
            first = bytes[i];
            if (first < 0x80) {
                output.push(String.fromCharCode(first));
                i += 1;
            } else if ((first & 0xe0) === 0xc0 && i + 1 < bytes.length) {
                point = ((first & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
                output.push(String.fromCharCode(point));
                i += 2;
            } else if ((first & 0xf0) === 0xe0 && i + 2 < bytes.length) {
                point = ((first & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f);
                output.push(String.fromCharCode(point));
                i += 3;
            } else if ((first & 0xf8) === 0xf0 && i + 3 < bytes.length) {
                point = ((first & 7) << 18) | ((bytes[i + 1] & 0x3f) << 12) |
                    ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
                point -= 0x10000;
                output.push(String.fromCharCode(0xd800 + (point >>> 10)));
                output.push(String.fromCharCode(0xdc00 + (point & 0x3ff)));
                i += 4;
            } else {
                throw new Error("utf8-invalido");
            }
        }
        return output.join("");
    }

    function base64Decode(value) {
        var clean = String(value || "");
        var bytes = [];
        var a;
        var b;
        var c;
        var d;
        var i;
        if (!clean || clean.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(clean)) {
            throw new Error("base64-invalido");
        }
        for (i = 0; i < clean.length; i += 4) {
            a = ALPHABET.indexOf(clean.charAt(i));
            b = ALPHABET.indexOf(clean.charAt(i + 1));
            c = clean.charAt(i + 2) === "=" ? -1 : ALPHABET.indexOf(clean.charAt(i + 2));
            d = clean.charAt(i + 3) === "=" ? -1 : ALPHABET.indexOf(clean.charAt(i + 3));
            if (a < 0 || b < 0 || (c < 0 && clean.charAt(i + 2) !== "=") ||
                    (d < 0 && clean.charAt(i + 3) !== "=")) {
                throw new Error("base64-invalido");
            }
            bytes.push((a << 2) | (b >>> 4));
            if (c >= 0) bytes.push(((b & 15) << 4) | (c >>> 2));
            if (d >= 0) bytes.push(((c & 3) << 6) | d);
        }
        return utf8Decode(bytes);
    }

    function requireHash(hashFunction) {
        if (typeof hashFunction !== "function") throw new Error("SHA-256 indisponível");
        return hashFunction;
    }

    function createTransfer(serialized, hashFunction, requestedSize) {
        var hash = requireHash(hashFunction);
        var source = String(serialized || "");
        var chunkSize = Math.round(Number(requestedSize || 128));
        var encoded;
        var packageHash;
        var total;
        if (!source) throw new Error("pacote-vazio");
        if (!isFinite(chunkSize) || chunkSize < 32 || chunkSize > 512) {
            throw new Error("tamanho-de-bloco-invalido");
        }
        encoded = base64Encode(source);
        packageHash = hash(source);
        total = Math.ceil(encoded.length / chunkSize);
        if (total < 1 || total > 99999) throw new Error("pacote-grande-demais");
        return {
            protocol: PROTOCOL,
            id: packageHash.slice(0, 12),
            packageHash: packageHash,
            encoded: encoded,
            chunkSize: chunkSize,
            total: total
        };
    }

    function frameAt(transfer, zeroBasedIndex) {
        var index = Math.round(Number(zeroBasedIndex));
        var payload;
        if (!transfer || transfer.protocol !== PROTOCOL) throw new Error("transporte-invalido");
        if (index < 0 || index >= transfer.total) throw new Error("bloco-fora-do-intervalo");
        payload = transfer.encoded.slice(index * transfer.chunkSize, (index + 1) * transfer.chunkSize);
        return [
            PROTOCOL,
            transfer.id,
            String(index + 1),
            String(transfer.total),
            transfer.packageHash,
            crc32(payload),
            payload
        ].join("|");
    }

    function parseFrame(raw) {
        var parts = String(raw || "").split("|");
        var index;
        var total;
        var frame;
        if (parts.length !== 7 || parts[0] !== PROTOCOL) return { valid: false, reason: "protocolo-invalido" };
        index = Number(parts[2]);
        total = Number(parts[3]);
        if (!/^[0-9a-f]{12}$/.test(parts[1]) || !/^[0-9a-f]{64}$/.test(parts[4])) {
            return { valid: false, reason: "identidade-invalida" };
        }
        if (index % 1 !== 0 || total % 1 !== 0 || index < 1 || total < 1 || index > total || total > 99999) {
            return { valid: false, reason: "posicao-invalida" };
        }
        if (!parts[6] || !/^[A-Za-z0-9+/=]+$/.test(parts[6])) return { valid: false, reason: "dados-invalidos" };
        if (crc32(parts[6]) !== parts[5]) return { valid: false, reason: "bloco-alterado" };
        frame = {
            valid: true,
            protocol: parts[0],
            id: parts[1],
            index: index,
            total: total,
            packageHash: parts[4],
            checksum: parts[5],
            data: parts[6],
            raw: String(raw)
        };
        return frame;
    }

    function createReceiver(hashFunction, savedFrames) {
        var hash = requireHash(hashFunction);
        var identity = null;
        var cells = [];
        var rawFrames = [];
        var received = 0;

        function missing() {
            var result = [];
            var i;
            if (!identity) return result;
            for (i = 0; i < identity.total; i += 1) {
                if (typeof cells[i] !== "string") result.push(i + 1);
            }
            return result;
        }

        function status(extra) {
            var result = {
                valid: true,
                complete: false,
                received: received,
                total: identity ? identity.total : 0,
                missing: missing()
            };
            var key;
            extra = extra || {};
            for (key in extra) {
                if (Object.prototype.hasOwnProperty.call(extra, key)) result[key] = extra[key];
            }
            return result;
        }

        function add(raw) {
            var parsed = parseFrame(raw);
            var joined;
            var serialized;
            if (!parsed.valid) return { valid: false, reason: parsed.reason, complete: false };
            if (!identity) {
                identity = { id: parsed.id, total: parsed.total, packageHash: parsed.packageHash };
                cells = new Array(parsed.total);
            }
            if (parsed.id !== identity.id || parsed.total !== identity.total ||
                    parsed.packageHash !== identity.packageHash) {
                return { valid: false, reason: "transferencia-misturada", complete: false };
            }
            if (typeof cells[parsed.index - 1] === "string") {
                if (cells[parsed.index - 1] !== parsed.data) {
                    return { valid: false, reason: "bloco-conflitante", complete: false };
                }
                return status({ duplicate: true });
            }
            cells[parsed.index - 1] = parsed.data;
            rawFrames[parsed.index - 1] = parsed.raw;
            received += 1;
            if (received !== identity.total) return status({ accepted: true });
            joined = cells.join("");
            try {
                serialized = base64Decode(joined);
            } catch (error) {
                return { valid: false, reason: error.message || "base64-invalido", complete: false };
            }
            if (hash(serialized) !== identity.packageHash) {
                return { valid: false, reason: "pacote-alterado", complete: false };
            }
            return status({ complete: true, serialized: serialized, packageHash: identity.packageHash });
        }

        function exportState() {
            var compact = [];
            var i;
            for (i = 0; i < rawFrames.length; i += 1) {
                if (typeof rawFrames[i] === "string") compact.push(rawFrames[i]);
            }
            return { protocol: PROTOCOL, frames: compact };
        }

        function restore(state) {
            var frames = state && Object.prototype.toString.call(state.frames) === "[object Array]" ? state.frames : [];
            var result = status();
            var i;
            for (i = 0; i < frames.length; i += 1) {
                result = add(frames[i]);
                if (!result.valid) return result;
            }
            return result;
        }

        if (savedFrames) restore(savedFrames);
        return { add: add, missing: missing, exportState: exportState, restore: restore };
    }

    function buildFrames(serialized, hashFunction, chunkSize) {
        var transfer = createTransfer(serialized, hashFunction, chunkSize);
        var frames = [];
        var i;
        for (i = 0; i < transfer.total; i += 1) frames.push(frameAt(transfer, i));
        return frames;
    }

    var service = {
        protocol: PROTOCOL,
        crc32: crc32,
        base64Encode: base64Encode,
        base64Decode: base64Decode,
        createTransfer: createTransfer,
        frameAt: frameAt,
        parseFrame: parseFrame,
        createReceiver: createReceiver,
        buildFrames: buildFrames
    };

    Encore.core.services.ScrvrlTransport = service;
    if (typeof module === "object" && module.exports) module.exports = service;
}(typeof self !== "undefined" ? self : (typeof global !== "undefined" ? global : this)));
