(function () {
    "use strict";
    var result = document.getElementById("result"), cache = window.applicationCache;
    var status = document.getElementById("cache-status"), report = {};
    var isOffline = !!document.documentElement.getAttribute("manifest");
    function show(node, text) {
        while (node.firstChild) { node.removeChild(node.firstChild); }
        node.appendChild(document.createTextNode(text));
    }
    function evidence() { document.getElementById("evidence").value = JSON.stringify(report, null, 2); }
    function run(word) {
        var start = new Date().getTime();
        D.clear();
        D.lookup(word, function (error, value) {
            report = {date: new Date().toISOString(), userAgent: navigator.userAgent,
                protocol: location.protocol, word: word, elapsedMs: new Date().getTime() - start,
                result: value || null, error: error || null, stats: D.stats(),
                appCacheStatus: cache ? cache.status : null,
                note: "Identificar aparelho/SO manualmente; user agent não certifica versão."};
            show(result, error ? error.code + ": " + error.message :
                value.status + ": " + (value.entries.length ? value.entries[0].form : "sem registro exato"));
            evidence();
        });
    }
    D.configure({base: "../dist/", timeout: 10000});
    document.getElementById("lookup").onsubmit = function () {
        run(document.getElementById("word").value); return false;
    };
    document.getElementById("run-test").onclick = function () { run("café"); };
    if (isOffline) {
        if (!cache) { show(status, "AppCache indisponível; offline não confirmado."); }
        else {
            cache.addEventListener("cached", function () {
                show(status, "Cache concluído. Desconecte e reabra para verificar offline.");
            }, false);
            cache.addEventListener("noupdate", function () {
                show(status, "Cache existente. Reabertura sem rede ainda precisa de teste.");
            }, false);
            cache.addEventListener("updateready", function () {
                show(status, "Nova versão baixada. Feche e reabra antes do teste offline.");
            }, false);
            cache.addEventListener("error", function () {
                show(status, "Falha ao verificar/atualizar cache. Não declarar instalação offline.");
            }, false);
        }
    }
    run("café");
}());
