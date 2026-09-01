(function (window, document) {
    "use strict";

    var profiles = [
        { name: "small", label: "pequeno", entries: 1024 },
        { name: "medium", label: "médio", entries: 8192 },
        { name: "large", label: "grande", entries: 32768 }
    ];
    var index = 0;
    var worker = null;
    var timer = null;
    var startedAt = 0;
    var results = [];

    var startButton = document.getElementById("start-test");
    var progressBox = document.getElementById("progress-box");
    var finalBox = document.getElementById("final-box");
    var statusDetail = document.getElementById("status-detail");
    var progressFill = document.getElementById("progress-fill");
    var finalWord = document.getElementById("final-word");
    var finalDetail = document.getElementById("final-detail");
    var technicalNote = document.getElementById("technical-note");

    function now() {
        if (window.performance && typeof window.performance.now === "function") {
            return window.performance.now();
        }
        return new Date().getTime();
    }

    function discard() {
        if (timer) {
            window.clearTimeout(timer);
            timer = null;
        }
        if (worker) {
            worker.terminate();
            worker = null;
        }
    }

    function finish(passed, message) {
        var notes = [];
        var i;
        discard();
        progressBox.setAttribute("hidden", "hidden");
        finalBox.removeAttribute("hidden");
        startButton.disabled = false;
        startButton.innerHTML = "Testar novamente";
        finalWord.innerHTML = passed ? "PASSOU" : "NÃO PASSOU";
        finalDetail.innerHTML = message;
        for (i = 0; i < results.length; i += 1) {
            notes.push(results[i].entries + " entradas: " + results[i].time + " ms");
        }
        technicalNote.innerHTML = notes.join(" · ");
    }

    function fail(message) {
        finish(false, message || "O teste parou antes do fim.");
    }

    function runNext() {
        var profile;
        var completed;

        discard();

        if (index >= profiles.length) {
            finish(true, "O iPad atravessou os três blocos sem manter nenhuma cápsula aberta.");
            return;
        }

        profile = profiles[index];
        completed = index;
        statusDetail.innerHTML = "Bloco " + String(index + 1) + " de " + String(profiles.length) + ".";
        progressFill.style.width = String((completed / profiles.length) * 100) + "%";

        try {
            worker = new window.Worker("js/capsule-worker.js");
        } catch (error) {
            fail("O navegador não conseguiu abrir a cápsula.");
            return;
        }

        startedAt = now();

        timer = window.setTimeout(function () {
            fail("O bloco " + profile.label + " demorou além do limite.");
        }, 8000);

        worker.onerror = function () {
            fail("O bloco " + profile.label + " encontrou um erro.");
        };

        worker.onmessage = function (event) {
            var response = event.data || {};
            var elapsed = Math.round(now() - startedAt);

            if (response.type !== "result" || response.entries !== profile.entries) {
                fail("O bloco " + profile.label + " devolveu uma resposta incompleta.");
                return;
            }

            results.push({ entries: response.entries, time: elapsed });
            discard();
            index += 1;
            progressFill.style.width = String((index / profiles.length) * 100) + "%";
            window.setTimeout(runNext, 300);
        };

        worker.postMessage({
            type: "scan",
            text: "A casa ficou em silêncio. Era uma coisa pequena.",
            from: 0,
            revision: "easy-test",
            profile: profile.name
        });
    }

    function start() {
        if (!window.Worker) {
            finish(false, "Este navegador não oferece a cápsula necessária.");
            return;
        }
        discard();
        index = 0;
        results = [];
        finalBox.setAttribute("hidden", "hidden");
        progressBox.removeAttribute("hidden");
        progressFill.style.width = "0";
        statusDetail.innerHTML = "Preparando o primeiro bloco.";
        startButton.disabled = true;
        startButton.innerHTML = "Testando…";
        window.setTimeout(runNext, 100);
    }

    startButton.onclick = start;
    window.addEventListener("pagehide", discard, false);
}(window, document));
