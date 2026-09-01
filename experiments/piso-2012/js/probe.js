(function (window, document) {
    "use strict";

    var worker = null;
    var cursor = 0;
    var revision = "";
    var cycles = 0;
    var findings = 0;
    var startedAt = 0;
    var workerSerial = 0;

    var textArea = document.getElementById("probe-text");
    var loadStep = document.getElementById("load-step");
    var findButton = document.getElementById("find-button");
    var nextButton = document.getElementById("next-button");
    var resetButton = document.getElementById("reset-button");
    var cacheStatus = document.getElementById("cache-status");
    var networkStatus = document.getElementById("network-status");
    var capsuleStatus = document.getElementById("capsule-status");
    var findingBox = document.getElementById("finding");
    var findingNumber = document.getElementById("finding-number");
    var findingQuote = document.getElementById("finding-quote");
    var findingMessage = document.getElementById("finding-message");
    var metricEntries = document.getElementById("metric-entries");
    var metricTime = document.getElementById("metric-time");
    var metricCursor = document.getElementById("metric-cursor");
    var metricCycles = document.getElementById("metric-cycles");
    var eventLog = document.getElementById("event-log");

    function now() {
        if (window.performance && typeof window.performance.now === "function") {
            return window.performance.now();
        }
        return new Date().getTime();
    }

    function simpleRevision(text) {
        var hash = 2166136261;
        var i;
        for (i = 0; i < text.length; i += 1) {
            hash ^= text.charCodeAt(i);
            hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
        }
        return String(hash >>> 0) + ":" + String(text.length);
    }

    function timeLabel() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        function two(value) { return value < 10 ? "0" + value : String(value); }
        return two(hours) + ":" + two(minutes) + ":" + two(seconds);
    }

    function log(message) {
        var item = document.createElement("li");
        item.appendChild(document.createTextNode(timeLabel() + " — " + message));
        eventLog.insertBefore(item, eventLog.firstChild);
        while (eventLog.childNodes.length > 12) {
            eventLog.removeChild(eventLog.lastChild);
        }
    }

    function saveText() {
        try {
            window.localStorage.setItem("encore-piso-2012-text", textArea.value);
        } catch (ignore) {}
    }

    function restoreText() {
        var saved;
        try {
            saved = window.localStorage.getItem("encore-piso-2012-text");
            if (saved !== null) textArea.value = saved;
        } catch (ignore) {}
    }

    function updateNetwork() {
        networkStatus.innerHTML = window.navigator.onLine === false ? "sem rede" : "com rede";
    }

    function cacheEventText(event) {
        var names = {
            checking: "verificando arquivos…",
            downloading: "instalando…",
            cached: "pronta para ficar sem rede",
            noupdate: "pronta; nenhum arquivo novo",
            updateready: "atualização pronta",
            obsolete: "manifesto obsoleto",
            error: "falha na instalação"
        };
        if (event.type === "progress") {
            if (event.total) return "instalando " + event.loaded + " de " + event.total + "…";
            return "instalando arquivos…";
        }
        return names[event.type] || event.type;
    }

    function handleCacheEvent(event) {
        cacheStatus.innerHTML = cacheEventText(event);
        if (event.type === "cached" || event.type === "noupdate" || event.type === "updateready") {
            log("instalação offline confirmada pelo navegador");
        }
        if (event.type === "error") log("o cache legado informou erro");
    }

    function prepareCacheStatus() {
        var events = window.__encoreCacheEvents || [];
        var i;
        if (!window.applicationCache) {
            cacheStatus.innerHTML = "indisponível neste navegador";
            log("Application Cache indisponível");
            return;
        }
        for (i = 0; i < events.length; i += 1) handleCacheEvent(events[i]);
        window.applicationCache.addEventListener("checking", handleCacheEvent, false);
        window.applicationCache.addEventListener("downloading", handleCacheEvent, false);
        window.applicationCache.addEventListener("progress", handleCacheEvent, false);
        window.applicationCache.addEventListener("cached", handleCacheEvent, false);
        window.applicationCache.addEventListener("noupdate", handleCacheEvent, false);
        window.applicationCache.addEventListener("updateready", handleCacheEvent, false);
        window.applicationCache.addEventListener("obsolete", handleCacheEvent, false);
        window.applicationCache.addEventListener("error", handleCacheEvent, false);
        if (!events.length) cacheStatus.innerHTML = "aguardando resposta do navegador…";
    }

    function terminateWorker(reason) {
        if (worker) {
            worker.terminate();
            worker = null;
            capsuleStatus.innerHTML = "descartada";
            log("cápsula " + workerSerial + " descartada" + (reason ? ": " + reason : ""));
        }
    }

    function showFinding(result) {
        findings += 1;
        findingBox.removeAttribute("hidden");
        findingNumber.innerHTML = "Achado " + findings;
        findingQuote.innerHTML = "“" + result.value + "”";
        findingMessage.innerHTML = result.message;
        cursor = result.nextCursor;
        metricCursor.innerHTML = String(cursor);
        nextButton.disabled = false;
    }

    function handleWorkerMessage(event) {
        var result = event.data || {};
        if (result.type === "result") {
            cycles += 1;
            metricEntries.innerHTML = String(result.entries) + " entradas; soma " + String(result.checksum);
            metricTime.innerHTML = String(Math.round(now() - startedAt)) + " ms";
            metricCycles.innerHTML = String(cycles);
            if (result.finding) {
                showFinding(result.finding);
                log("um achado devolvido; varredura interrompida");
            } else {
                findingBox.removeAttribute("hidden");
                findingNumber.innerHTML = "Fim do trecho";
                findingQuote.innerHTML = "Nenhum novo achado.";
                findingMessage.innerHTML = "A cápsula percorreu o restante do trecho e parou.";
                nextButton.disabled = true;
                cursor = result.nextCursor;
                metricCursor.innerHTML = String(cursor);
                log("fim do trecho devolvido");
            }
            terminateWorker("resposta recebida");
            findButton.disabled = false;
            resetButton.disabled = false;
        } else if (result.type === "error") {
            log("erro da cápsula: " + result.message);
            capsuleStatus.innerHTML = "erro";
            terminateWorker("erro");
            findButton.disabled = false;
            resetButton.disabled = false;
        }
    }

    function run(from) {
        var text = textArea.value;
        var currentRevision = simpleRevision(text);
        if (!window.Worker) {
            capsuleStatus.innerHTML = "Web Worker indisponível";
            log("teste interrompido: Web Worker indisponível");
            return;
        }
        if (revision && revision !== currentRevision) {
            cursor = 0;
            findings = 0;
            from = 0;
            log("texto mudou; posição de análise reiniciada");
        }
        revision = currentRevision;
        terminateWorker("substituída antes de nova execução");
        workerSerial += 1;
        startedAt = now();
        worker = new window.Worker("js/capsule-worker.js");
        worker.onmessage = handleWorkerMessage;
        worker.onerror = function (event) {
            log("erro não tratado: " + (event.message || "sem mensagem"));
            terminateWorker("falha não tratada");
            findButton.disabled = false;
            resetButton.disabled = false;
        };
        capsuleStatus.innerHTML = "ativa: " + workerSerial;
        log("cápsula " + workerSerial + " criada; degrau " + loadStep.value);
        findButton.disabled = true;
        nextButton.disabled = true;
        resetButton.disabled = true;
        worker.postMessage({
            type: "scan",
            text: text,
            from: typeof from === "number" ? from : 0,
            revision: revision,
            profile: loadStep.value
        });
    }

    function reset() {
        terminateWorker("reinício manual");
        cursor = 0;
        revision = simpleRevision(textArea.value);
        cycles = 0;
        findings = 0;
        findingBox.setAttribute("hidden", "hidden");
        metricEntries.innerHTML = "—";
        metricTime.innerHTML = "—";
        metricCursor.innerHTML = "0";
        metricCycles.innerHTML = "0";
        nextButton.disabled = true;
        findButton.disabled = false;
        log("sessão de análise reiniciada");
    }

    findButton.onclick = function () {
        cursor = 0;
        findings = 0;
        run(0);
    };
    nextButton.onclick = function () { run(cursor); };
    resetButton.onclick = reset;
    textArea.oninput = function () { saveText(); };
    window.addEventListener("online", updateNetwork, false);
    window.addEventListener("offline", updateNetwork, false);
    window.addEventListener("pagehide", function () { terminateWorker("página encerrada"); }, false);

    restoreText();
    revision = simpleRevision(textArea.value);
    updateNetwork();
    prepareCacheStatus();
    log("prova pronta; nenhuma cápsula residente");
}(window, document));
