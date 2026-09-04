(function () {
    "use strict";

    var cacheStatus = document.getElementById("cache-status");
    var workshopStatus = document.getElementById("workshop-status");
    var residentStatus = document.getElementById("resident-status");
    var testButton = document.getElementById("test-button");
    var testHelp = document.getElementById("test-help");
    var verdict = document.getElementById("verdict");
    var metricPassed = document.getElementById("metric-passed");
    var metricSlowest = document.getElementById("metric-slowest");
    var metricLag = document.getElementById("metric-lag");
    var metricResident = document.getElementById("metric-resident");
    var resultList = document.getElementById("result-list");
    var cacheMarker = "encore-engine-house-offline-v11";
    var activeWorker = null;
    var activeTimeout = null;
    var running = false;
    var resident = 0;
    var maxResident = 0;
    var passed = 0;
    var slowest = 0;
    var maxLag = 0;
    var heartbeat = null;
    var lastBeat = 0;

    var cases = [
        { id: "VERB-MORPH", label: "Morfologia", text: "Ao passarem por três andares, nós cantávamos.", expect: /lema|verbo/i },
        { id: "REL-CLAUSE", label: "Orações adjetivas", text: "O Brasil, que é gigante, é rico.", expect: /explicativa/i },
        { id: "RIMA-METRICA", label: "Rima e métrica", text: "O amor é fogo que arde sem se ver\né ferida que dói e não se sente", expect: /verso|rima|métrica/i },
        { id: "VOICE", label: "Voz e estilo", text: "O tempo não é uma linha. Talvez toda pergunta abra outra pergunta sobre o mesmo mistério.", expect: /voz/i },
        { id: "PONTUACAO", label: "Pontuação", text: "O resultado contudo foi satisfatório. Ela tentou mas não conseguiu.", expect: /PONT-/ },
        { id: "DECOLONIAL", label: "Vocabulário decolonial", text: "A história do escravo naquele período.", expect: /escravo/i },
        { id: "SINTAXE", label: "Sintaxe", text: "A menina que sorria estava feliz.", expect: /período/i }
    ];

    function now() {
        if (window.performance && typeof window.performance.now === "function") return window.performance.now();
        return new Date().getTime();
    }

    function setResident(value) {
        resident = value;
        if (resident > maxResident) maxResident = resident;
        residentStatus.innerHTML = String(resident);
        metricResident.innerHTML = String(maxResident);
    }

    function stopWorker() {
        if (activeTimeout) window.clearTimeout(activeTimeout);
        activeTimeout = null;
        if (activeWorker) activeWorker.terminate();
        activeWorker = null;
        setResident(0);
    }

    function addResult(ok, label, elapsed, detail) {
        var item = document.createElement("li");
        item.innerHTML = (ok ? "PASSOU" : "NÃO PASSOU") + " — " + label + " — " + elapsed + " ms" + (detail ? " — " + detail : "");
        resultList.appendChild(item);
    }

    function finish() {
        running = false;
        stopWorker();
        if (heartbeat) window.clearInterval(heartbeat);
        heartbeat = null;
        workshopStatus.innerHTML = "todas descartadas";
        metricPassed.innerHTML = passed + " de " + cases.length;
        metricSlowest.innerHTML = slowest + " ms";
        metricLag.innerHTML = Math.round(maxLag) + " ms";
        verdict.innerHTML = passed === cases.length && maxResident === 1 ? "PASSOU " + passed + "/" + cases.length : "NÃO PASSOU";
        testButton.disabled = false;
        testButton.innerHTML = "Testar novamente";
        testHelp.innerHTML = passed === cases.length ?
            "Agora repita em modo avião." :
            "Fotografe esta tela para vermos qual oficina falhou.";
    }

    function runCase(index) {
        var item;
        var started;
        if (index >= cases.length) {
            finish();
            return;
        }

        item = cases[index];
        workshopStatus.innerHTML = item.label + " — " + (index + 1) + " de " + cases.length;
        started = now();
        activeWorker = new window.Worker("../../src/core/engine-capsule-worker.js");
        setResident(1);
        activeTimeout = window.setTimeout(function () {
            stopWorker();
            addResult(false, item.label, Math.round(now() - started), "tempo esgotado");
            window.setTimeout(function () { runCase(index + 1); }, 80);
        }, 30000);

        activeWorker.onerror = function () {
            var elapsed = Math.round(now() - started);
            stopWorker();
            addResult(false, item.label, elapsed, "não carregou");
            window.setTimeout(function () { runCase(index + 1); }, 80);
        };

        activeWorker.onmessage = function (event) {
            var response = event.data || {};
            var elapsed = Math.round(now() - started);
            var findings = response.findings || [];
            var message = findings.length ? String(findings[0].message || "") : "";
            var ok = response.type === "result" && response.engineId === item.id && findings.length === 1 && item.expect.test(message);
            stopWorker();
            if (elapsed > slowest) slowest = elapsed;
            if (ok) passed += 1;
            metricPassed.innerHTML = passed + " de " + cases.length;
            metricSlowest.innerHTML = slowest + " ms";
            addResult(ok, item.label, elapsed, ok ? "cápsula descartada" : "resposta inesperada");
            window.setTimeout(function () { runCase(index + 1); }, 80);
        };

        activeWorker.postMessage({
            type: "analyze",
            requestId: index + 1,
            engineId: item.id,
            text: item.text
        });
    }

    function begin() {
        if (running || !window.Worker) return;
        running = true;
        passed = 0;
        slowest = 0;
        maxLag = 0;
        maxResident = 0;
        resultList.innerHTML = "";
        verdict.innerHTML = "TESTANDO";
        metricPassed.innerHTML = "0 de " + cases.length;
        metricSlowest.innerHTML = "—";
        metricLag.innerHTML = "medindo…";
        metricResident.innerHTML = "0";
        testButton.disabled = true;
        testButton.innerHTML = "Testando…";
        testHelp.innerHTML = "Não toque em nada. A tela deve continuar respirando.";
        lastBeat = now();
        heartbeat = window.setInterval(function () {
            var current = now();
            var lag = current - lastBeat - 100;
            if (lag > maxLag) maxLag = lag;
            lastBeat = current;
            metricLag.innerHTML = Math.round(maxLag) + " ms";
        }, 100);
        runCase(0);
    }

    function hasInstalledCache() {
        try {
            return window.localStorage.getItem(cacheMarker) === "1";
        } catch (error) {
            return false;
        }
    }

    function markInstalledCache() {
        try {
            window.localStorage.setItem(cacheMarker, "1");
        } catch (error) {
            /* AppCache continua válido mesmo se o armazenamento local estiver bloqueado. */
        }
    }

    function readyOffline(message, remember) {
        if (remember) markInstalledCache();
        cacheStatus.innerHTML = message || "pronto";
        testButton.disabled = false;
        testButton.innerHTML = "Testar agora";
        testHelp.innerHTML = "Toque uma vez. O restante acontece sozinho.";
    }

    function cacheEvent(event) {
        if (event.type === "checking") cacheStatus.innerHTML = "verificando";
        if (event.type === "downloading") cacheStatus.innerHTML = "guardando arquivos";
        if (event.type === "progress") cacheStatus.innerHTML = "guardando " + event.loaded + " de " + event.total;
        if (event.type === "cached" || event.type === "noupdate") readyOffline("pronto", true);
        if (event.type === "updateready") readyOffline("atualização pronta", true);
        if (event.type === "error") {
            if (hasInstalledCache() || window.applicationCache.status === window.applicationCache.IDLE) {
                readyOffline("pronto — sem rede", false);
                testHelp.innerHTML = "O pacote instalado está sendo usado. Pode testar.";
            } else {
                cacheStatus.innerHTML = "não ficou offline";
                testHelp.innerHTML = "Recarregue com a internet ligada.";
            }
        }
    }

    testButton.onclick = begin;

    if (!window.Worker) {
        cacheStatus.innerHTML = "incompatível";
        verdict.innerHTML = "NÃO PASSOU";
        testHelp.innerHTML = "Este navegador não oferece Worker.";
        return;
    }

    if (!window.applicationCache) {
        cacheStatus.innerHTML = "sem AppCache";
        verdict.innerHTML = "NÃO PASSOU";
        testHelp.innerHTML = "O modo offline legado não está disponível.";
        return;
    }

    var events = window.__engineHouseCacheEvents || [];
    var eventNames = ["checking", "downloading", "progress", "cached", "noupdate", "updateready", "error"];
    var i;
    for (i = 0; i < events.length; i += 1) cacheEvent(events[i]);
    for (i = 0; i < eventNames.length; i += 1) window.applicationCache.addEventListener(eventNames[i], cacheEvent, false);
    if (window.applicationCache.status === window.applicationCache.IDLE) readyOffline("pronto", true);
    if (window.applicationCache.status === window.applicationCache.UPDATEREADY) readyOffline("atualização pronta", true);

    window.addEventListener("pagehide", stopWorker, false);
}());
