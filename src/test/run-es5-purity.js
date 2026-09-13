(function () {
    "use strict";

    /* Escrevaral/Cofre — Auditoria de pureza ES5 + integridade dos dados embutidos.
     * v2 (pós-avaliação do Astra):
     *   - GATE REAL de sintaxe: parse com acorn ecmaVersion:5 (parser de verdade, não
     *     scanner de marcadores). Detecta `\p{`, lookbehind, flags /u, shorthand de
     *     objeto, template literals, rest/spread, `?.`, arrow, const/let, for..of,
     *     normalize("NFD") é checado por marcador (é API, não sintaxe).
     *   - acorn 8.18.0 vendored (MIT) em vendor/acorn.js para o gate rodar offline.
     *   - Integridade: dados embutidos == JSONs originais de escrevaral (0 diffs) E
     *     proveniência pinada por sha256 (fonte divergente = FAIL, não SKIP).
     *   - Nada conta como PASS sem evidência: fonte ausente = FAIL, vetores vazios = FAIL.
     */

    var fs = require("fs");
    var path = require("path");
    var crypto = require("crypto");
    var acorn = require("./vendor/acorn.js");

    var ROOT = path.join(__dirname, "..");
    var ENCORE = [
        path.join(ROOT, "core", "engines", "analise-literaria.js"),
        path.join(ROOT, "core", "engines", "lexico-classes.js"),
        path.join(ROOT, "core", "contracts.js"),
        path.join(ROOT, "core", "runtime.js"),
        path.join(ROOT, "core", "services", "tokenizer.js")
    ];

    /* Proveniência: sha256 dos JSONs-oráculo no store escrevaral (revisão `2a0d3ff`).
     * Se o store mudar, atualize aqui E propague para os dados embutidos de propósito. */
    var PIN = {
        "lexical-data.json": { sha: "d0e1e3f39b59cca73992dda9d60f240bab739eda8cd29ca6541abd7712e1036f", mod: path.join(ROOT, "data", "lexical-data.js"), key: "lexicalData" },
        "norma-data.json":   { sha: "d8aca87b3b2b70775cc24f9a2a8e3cc09f2550a49b817da994945addc1d52763", mod: path.join(ROOT, "data", "lexical-norma-data.js"), key: "lexicalNormaData" }
    };

    /* Oráculo de proveniência: usa o store escrevaral quando presente (argv[2]); senão,
     * o snapshot vendado byte-a-byte em src/test/provenance/ (mesmo sha256). Nunca SKIP:
     * sem fonte E sem snapshot é FALHA. */
    var SNAP = path.join(__dirname, "provenance");

    function resolveProvenance(name) {
        var live = path.join(escr, name);
        if (fs.existsSync(live)) return live;
        var snap = path.join(SNAP, name);
        return fs.existsSync(snap) ? snap : null;
    }

    var total = 0, passed = 0, failures = [];

    function sha256(p) { return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); }

    /* strip(): remove comentários e strings ' ' / " " (mantém estrutura) — usado só
     * nos marcadores de DIAGNÓSTICO (o gate é o parse do acorn). */
    function strip(code) {
        var out = "", i = 0, n = code.length, st = 0;
        while (i < n) {
            var c = code[i], d = code[i + 1];
            if (st === 0) {
                if (c === "/" && d === "/") { st = 3; i += 2; continue; }
                if (c === "/" && d === "*") { st = 4; i += 2; continue; }
                if (c === "'") { st = 1; i++; continue; }
                if (c === '"') { st = 2; i++; continue; }
                out += c; i++; continue;
            }
            if (st === 1) {
                if (c === "\\") { i += 2; continue; }
                if (c === "'") { st = 0; }
                i++; continue;
            }
            if (st === 2) {
                if (c === "\\") { i += 2; continue; }
                if (c === '"') { st = 0; }
                i++; continue;
            }
            if (st === 3) {
                if (c === "\n") { st = 0; out += " "; }
                i++; continue;
            }
            if (c === "*" && d === "/") { st = 0; i += 2; continue; }
            i++;
        }
        return out;
    }

    /* Marcadores ES6/ES2018/APIs modernas PARA DIAGNÓSTICO (não gating — o parse com
     * acorn é o gate; marcadores ajudam a explicar o porquê do FAIL). */
    var MARKERS = [
        { name: "regEx \\p{", re: /\\p\{/ },
        { name: "lookbehind (?<=", re: /\(\?<=/ },
        { name: "lookbehind (?<!", re: /\(\?<!/ },
        { name: "flag /u", re: /\/u/g },
        { name: "flag /v", re: /\/v/g },
        { name: "normalize(", re: /\bnormalize\s*\(/ },
        { name: "arrow =>", re: /=>/ },
        { name: "template `", re: /`/ },
        { name: "encadeamento ?.", re: /\?\s*\./ },
        { name: "spread ...", re: /\.\.\./ },
        { name: "const", re: /\bconst\b/ },
        { name: "let", re: /\blet\b/ },
        { name: "new Set|Map(", re: /\bnew\s+(Set|Map)\s*\(/ },
        { name: "for..of", re: /\bfor\s*\([^)]*\)\s*of\b/ }
    ];

    for (var e = 0; e < ENCORE.length; e++) {
        var file = ENCORE[e];
        var code = fs.readFileSync(file, "utf8");
        var name = path.basename(file);
        var markers = [];
        var clean = strip(code);
        for (var m = 0; m < MARKERS.length; m++) {
            MARKERS[m].re.lastIndex = 0;
            if (MARKERS[m].re.test(clean)) markers.push(MARKERS[m].name);
        }
        var parseErr = null;
        try { acorn.parse(code, { ecmaVersion: 5 }); } catch (e) { parseErr = e; }
        total++;
        if (parseErr) {
            failures.push("ES5 parse " + name + " -> " + parseErr.message.split("\n")[0]);
            console.log("FAIL [ES5 parse " + name + " -> " + parseErr.message.split("\n")[0] + (markers.length ? " | marcadores: " + markers.join(", ") : "") + "]");
        } else {
            passed++;
            console.log("PASS [ES5 parse " + name + (markers.length ? " — atenção: marcadores " + markers.join(", ") + " (revisar)" : " — 0 marcadores modernos") + "]");
        }
    }

    var escr = process.argv[2] || "/home/rafamass/projetos/escrevaral";
    var srcNames = Object.keys(PIN);
    if (!srcNames.length) { failures.push("vetor de proveniência vazio"); process.exit(1); }

    function deepEq(a, b) {
        if (a === b) return true;
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length !== b.length) return false;
            for (var i = 0; i < a.length; i++) if (!deepEq(a[i], b[i])) return false;
            return true;
        }
        if (a && b && typeof a === "object" && typeof b === "object") {
            var ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
            if (ka.length !== kb.length) return false;
            for (var j = 0; j < ka.length; j++) {
                if (ka[j] !== kb[j]) return false;
                if (!deepEq(a[ka[j]], b[ka[j]])) return false;
            }
            return true;
        }
        return false;
    }

    for (var s = 0; s < srcNames.length; s++) {
        var p = PIN[srcNames[s]];
        var srcPath = resolveProvenance(srcNames[s]);
        total++;
        if (!srcPath) {
            failures.push("proveniência " + srcNames[s] + " -> fonte ausente (store " + escr + " e snapshot vendado) — SKIP rebaixado a FALHA");
            console.log("FAIL [proveniência " + srcNames[s] + " — fonte ausente (store e snapshot), SKIP rebaixado a FALHA]");
            continue;
        }
        var got = sha256(srcPath);
        if (got !== p.sha) {
            failures.push("proveniência " + srcNames[s] + " diverge do pin (" + got.slice(0, 12) + "...) -> propagar de propósito e atualizar o pin");
            console.log("FAIL [proveniência " + srcNames[s] + " diverge do pin (" + got.slice(0, 12) + "...) — propagar de propósito e atualizar PIN]");
        } else {
            passed++;
            console.log("PASS [proveniência " + srcNames[s] + " — sha256 bate com o pin (" + got.slice(0, 12) + "...)] " + (srcPath.indexOf(escr) === 0 ? "(store " + escr + ")" : "(snapshot vendado src/test/provenance/)"));
        }
    }

    var root = typeof global !== "undefined" ? global : window;
    root.Encore = root.Encore || {};
    root.Encore.data = root.Encore.data || {};
    var loaded = {};
    for (var d = 0; d < srcNames.length; d++) {
        var p2 = PIN[srcNames[d]];
        try {
            delete require.cache[require.resolve(p2.mod)];
            require(p2.mod);
            loaded[srcNames[d]] = root.Encore.data[p2.key];
        } catch (e) {
            loaded[srcNames[d]] = { __LOAD_ERR__: e.message };
        }
    }

    for (var q = 0; q < srcNames.length; q++) {
        var pair = PIN[srcNames[q]];
        var srcPath2 = resolveProvenance(srcNames[q]);
        if (!srcPath2 || pair.sha !== sha256(srcPath2)) {
            continue; /* já contabilizado no gate de proveniência acima */
        }
        total++;
        var original = JSON.parse(fs.readFileSync(srcPath2, "utf8"));
        var embedded = loaded[srcNames[q]];
        if (!embedded || embedded.__LOAD_ERR__) {
            failures.push("dados " + srcNames[q] + " -> falha ao carregar módulo: " + (embedded && embedded.__LOAD_ERR__));
            console.log("FAIL [dados " + srcNames[q] + " -> erro de carga]");
        } else if (deepEq(original, embedded)) {
            passed++;
            console.log("PASS [dados " + srcNames[q] + " — idêntico ao original (" + Object.keys(original).length + " chaves)]");
        } else {
            failures.push("dados " + srcNames[q] + " diverge do original");
            console.log("FAIL [dados " + srcNames[q] + " diverge do original]");
        }
    }

    if (!passed && !failures.length) { failures.push("nenhuma verificação executada"); }

    console.log("-----\nRESULTADO: " + passed + "/" + total + " passando");
    if (failures.length) {
        for (var x = 0; x < failures.length; x++) console.error("FALHA: " + failures[x]);
        process.exit(1);
    }
})();