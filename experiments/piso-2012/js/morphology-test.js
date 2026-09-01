(function (window, document) {
    "use strict";

    var text = "Ontem cantávamos. Depois, ele veio e pediu para fazê-lo. Talvez comam antes.";
    var expected = "cantávamos|veio|fazê-lo|comam";
    var worker = null;
    var timer = null;
    var startedAt = 0;

    var button = document.getElementById("start-test");
    var box = document.getElementById("result-box");
    var word = document.getElementById("result-word");
    var detail = document.getElementById("result-detail");
    var verbs = document.getElementById("verbs");

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

    function finish(passed, message, found) {
        discard();
        button.disabled = false;
        button.innerHTML = "Testar novamente";
        box.removeAttribute("hidden");
        word.innerHTML = passed ? "PASSOU" : "NÃO PASSOU";
        detail.innerHTML = message;
        verbs.innerHTML = found || "";
    }

    function start() {
        var foundWords = [];

        discard();
        box.setAttribute("hidden", "hidden");
        button.disabled = true;
        button.innerHTML = "Testando…";

        if (!window.Worker) {
            finish(false, "Este navegador não abriu a cápsula.", "");
            return;
        }

        try {
            worker = new window.Worker("js/morphology-worker.js");
        } catch (error) {
            finish(false, "A cápsula de morfologia não abriu.", "");
            return;
        }

        startedAt = now();

        timer = window.setTimeout(function () {
            finish(false, "A engine demorou além do limite.", "");
        }, 8000);

        worker.onerror = function () {
            finish(false, "A engine encontrou um erro.", "");
        };

        worker.onmessage = function (event) {
            var response = event.data || {};
            var findings = response.findings || [];
            var i;
            var elapsed;

            if (response.type === "error") {
                finish(false, response.message || "A engine encontrou um erro.", "");
                return;
            }

            for (i = 0; i < findings.length; i += 1) {
                foundWords.push(text.substring(findings[i].span[0], findings[i].span[1]));
            }

            elapsed = Math.round(now() - startedAt);

            if (response.type === "result" &&
                    response.engineId === "VERB-MORPH" &&
                    foundWords.join("|") === expected) {
                finish(
                    true,
                    "A engine real encontrou quatro verbos em " + String(elapsed) + " ms e foi descartada.",
                    foundWords.join(" · ")
                );
            } else {
                finish(
                    false,
                    "A resposta chegou diferente do esperado.",
                    foundWords.length ? foundWords.join(" · ") : "Nenhum verbo encontrado."
                );
            }
        };

        worker.postMessage({ type: "analyze", text: text });
    }

    button.onclick = start;
    window.addEventListener("pagehide", discard, false);
}(window, document));
