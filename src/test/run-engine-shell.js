(function () {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var root = path.resolve(__dirname, "../..");
    var html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    var manifest = fs.readFileSync(path.join(root, "encore.appcache"), "utf8");
    var worker = fs.readFileSync(path.join(root, "src/core/engine-capsule-worker.js"), "utf8");
    var floorRoot = path.join(root, "experiments/piso-2012");
    var floorHtml = fs.readFileSync(path.join(floorRoot, "engine-house.html"), "utf8");
    var floorScript = fs.readFileSync(path.join(floorRoot, "js/engine-house-test.js"), "utf8");
    var floorManifest = fs.readFileSync(path.join(floorRoot, "cache.appcache"), "utf8");
    var checks = [
        ["manifest-ligado", /<html[^>]+manifest="encore\.appcache"/.test(html)],
        ["sem-engine-na-pagina", !/<script[^>]+src="src\/core\/engines\//.test(html)],
        ["sem-dados-na-pagina", !/<script[^>]+src="src\/data\//.test(html)],
        ["worker-descartavel", /activeWorker\.terminate\(\)/.test(html) && /worker\.close\(\)/.test(worker)],
        ["um-achado-por-vez", /\[currentFindings\[currentIndex\]\]/.test(worker)],
        ["manifest-tem-worker", manifest.indexOf("src/core/engine-capsule-worker.js") !== -1],
        ["gate-um-toque", /id="test-button"/.test(floorHtml) && /runCase\(0\)/.test(floorScript)],
        ["gate-sete-oficinas", (floorScript.match(/id: "[A-Z-]+"/g) || []).length === 7],
        ["gate-descarta-worker", /activeWorker\.terminate\(\)/.test(floorScript)],
        ["gate-lembra-cache-instalado", /localStorage\.setItem\(cacheMarker, "1"\)/.test(floorScript)],
        ["gate-distingue-erro-offline", /pronto — sem rede/.test(floorScript) && /hasInstalledCache\(\)/.test(floorScript)]
    ];
    var manifestPaths = manifest.split(/\r?\n/).filter(function (line) {
        return line && line.charAt(0) !== "#" && line !== "CACHE:" && line !== "NETWORK:" && line !== "*" && line !== "CACHE MANIFEST";
    });
    var i;
    var passed = 0;

    checks.push(["manifest-sem-caminho-quebrado", manifestPaths.every(function (relative) {
        return fs.existsSync(path.join(root, relative));
    })]);
    var floorManifestPaths = floorManifest.split(/\r?\n/).filter(function (line) {
        return line && line.charAt(0) !== "#" && line !== "CACHE:" && line !== "NETWORK:" && line !== "*" && line !== "CACHE MANIFEST";
    });
    checks.push(["gate-offline-sem-caminho-quebrado", floorManifestPaths.every(function (relative) {
        return fs.existsSync(path.join(floorRoot, relative));
    })]);

    for (i = 0; i < checks.length; i++) {
        if (checks[i][1]) {
            passed++;
            console.log("PASS [" + checks[i][0] + "]");
        } else {
            console.error("FAIL [" + checks[i][0] + "]");
        }
    }

    console.log("-----");
    console.log("CASA DAS ENGINES: " + passed + "/" + checks.length + " passando");
    if (passed !== checks.length) process.exit(1);
})();
