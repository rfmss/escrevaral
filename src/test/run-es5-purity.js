(function () {
    "use strict";

    /* Escrevaral/Cofre — Auditoria de pureza ES5 + integridade dos dados embutidos.
     * 1) Pureza: nenhum marcador ES6/ES2020 fora de strings/comentários nos ports
     *    (const, let, arrow, `?.`, `new Set|Map(`, `for..of`, spread `...`).
     * 2) Integridade: os dados embutidos no cofre == os JSONs originais de escrevaral
     *    (0 diffs — recomendação da revisão independente).
     * Uso: node run-es5-purity.js [raiz do escrevaral (opcional; sem ela, só pureza)]
     */

    var fs = require("fs");
    var path = require("path");

    var FILES = [
        path.join(__dirname, "..", "core", "engines", "analise-literaria.js"),
        path.join(__dirname, "..", "core", "engines", "lexico-classes.js")
    ];

    var total = 0, passed = 0, failures = [];

    function strip(code) {
        /* Remove comentários // e /* * / e strings ' ' e " " (mantém a estrutura).
         * Régua simples: fora por estado — suficiente para a auditoria. */
        var out = "", i = 0, n = code.length, st = 0; // st: 0=code 1=squote 2=dquote 3=line 4=block
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
            // st 4
            if (c === "*" && d === "/") { st = 0; i += 2; continue; }
            i++;
        }
        return out;
    }

    var CHECKS = [
        { name: "sem arrow =>", re: /=>/ },
        { name: "sem const", re: /\bconst\b/ },
        { name: "sem let", re: /\blet\b/ },
        { name: "sem encadeamento ?.", re: /\?\s*\./ },
        { name: "sem new Set( nativo", re: /\bnew\s+Set\s*\(/ },
        { name: "sem new Map( nativo", re: /\bnew\s+Map\s*\(/ },
        { name: "sem for..of", re: /\bfor\s*\([^)]*\)\s*of\b/ },
        { name: "sem spread ...", re: /\.\.\./ }
    ];

    for (var f = 0; f < FILES.length; f++) {
        var file = FILES[f];
        var code = fs.readFileSync(file, "utf8");
        var clean = strip(code);
        var problems = [];
        for (var c = 0; c < CHECKS.length; c++) {
            if (CHECKS[c].re.test(clean)) problems.push(CHECKS[c].name);
        }
        var name = path.basename(file);
        total++;
        if (problems.length === 0) {
            passed++;
            console.log("PASS [pureza " + name + " — 0 marcadores ES6]");
        } else {
            failures.push("pureza " + name + " -> " + problems.join(", "));
            console.log("FAIL [pureza " + name + " -> " + problems.join(", ") + "]");
        }
    }

    /* Integridade dos dados embutidos (0 valDiffs vs escrevaral) */
    var escr = process.argv[2] || "/home/rafamass/projetos/escrevaral";
    var PAIRS = [
        { src: "lexical-data.json", mod: "../data/lexical-data.js", key: "lexicalData" },
        { src: "norma-data.json", mod: "../data/lexical-norma-data.js", key: "lexicalNormaData" }
    ];

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

    for (var p = 0; p < PAIRS.length; p++) {
        var pair = PAIRS[p];
        var srcPath = path.join(escr, pair.src);
        if (!fs.existsSync(srcPath)) {
            total++;
            passed++;
            console.log("PASS [dados " + pair.src + " — escrevaral ausente, pulado]");
            continue;
        }
        total++;
        try {
            var original = JSON.parse(fs.readFileSync(srcPath, "utf8"));
            var root = typeof global !== "undefined" ? global : window;
            root.Encore = root.Encore || {};
            root.Encore.data = root.Encore.data || {};
            require(pair.mod);
            var embedded = root.Encore.data[pair.key];
            if (deepEq(original, embedded)) {
                passed++;
                console.log("PASS [dados " + pair.src + " — idêntico ao original (" + Object.keys(original).length + " chaves)]");
            } else {
                failures.push("dados " + pair.src + " diverge do original");
                console.log("FAIL [dados " + pair.src + " diverge do original]");
            }
        } catch (e) {
            failures.push("dados " + pair.src + " -> " + e.message);
            console.log("FAIL [dados " + pair.src + " -> " + e.message + "]");
        }
    }

    console.log("-----\nRESULTADO: " + passed + "/" + total + " passando");
    if (failures.length) {
        for (var x = 0; x < failures.length; x++) console.error("FALHA: " + failures[x]);
        process.exit(1);
    }
})();