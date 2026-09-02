(function (window, document) {
    "use strict";

    var cases = [
        { id: "restritiva-1", text: "Apenas os alunos que estudaram passaram.", expected: [{ surface: "Apenas os alunos", type: "restritiva" }] },
        { id: "restritiva-2", text: "Somente as cartas que ele escreveu sobreviveram.", expected: [{ surface: "Somente as cartas", type: "restritiva" }] },
        { id: "explicativa-brasil", text: "O Brasil, que é gigante, tem muitas culturas.", expected: [{ surface: "O Brasil", type: "explicativa" }] },
        { id: "explicativa-machado", text: "Machado de Assis, que escreveu Memórias Póstumas, é genial.", expected: [{ surface: "Machado de Assis", type: "explicativa" }] },
        { id: "explicativa-baleias", text: "As baleias, que têm sangue quente, são mamíferos.", expected: [{ surface: "As baleias", type: "explicativa" }] },
        { id: "ambigua", text: "Os alunos que estudaram passaram.", expected: [{ surface: "Os alunos", type: "ambigua" }] },
        { id: "complemento-acha", text: "Eu acho que chove hoje.", expected: [] },
        { id: "o-que", text: "O que você quer?", expected: [] },
        { id: "vazio-espacos", text: "   ", expected: [] },
        { id: "vazio", text: "", expected: [] },
        { id: "gsd-dois", text: "Quais são os fatores que geram câncer nas pessoas que residem nas cidades ou no campo?", expected: [{ surface: "os fatores", type: "ambigua" }, { surface: "nas pessoas", type: "ambigua" }] },
        { id: "gsd-em-que", text: "Na área em que atuo.", expected: [{ surface: "Na área", type: "ambigua" }] },
        { id: "gsd-duma", text: "duma agenda que obstaculiza os princípios fundamentais da prevenção da Aids.", expected: [{ surface: "duma agenda", type: "ambigua" }] },
        { id: "gsd-outro", text: "Outro disco que participou foi Contrastes.", expected: [{ surface: "Outro disco", type: "ambigua" }] },
        { id: "gsd-neste", text: "Neste projeto que levamos para o superintendente do Banco do Brasil, serão 20 pessoas contratadas diretamente.", expected: [{ surface: "Neste projeto", type: "ambigua" }] },
        { id: "gsd-entender", text: "As forças policiais vão entender que elas de fato podem apertar o gatilho.", expected: [] },
        { id: "gsd-sabemos", text: "Sabemos que o Paulo tem uma importância muito grande para o grupo.", expected: [] },
        { id: "gsd-misto", text: "O documento cita um parecer do juiz Bitencourt, que afirma que todos os atos praticados estariam dentro do conceito amplo de gestão fraudulenta.", expected: [{ surface: "um parecer do juiz Bitencourt", type: "ambigua" }] },
        { id: "gsd-regioes", text: "As regiões que têm menos fluxo de veículos são esquecidas.", expected: [{ surface: "As regiões", type: "ambigua" }] }
    ];
    var index = 0;
    var passed = 0;
    var worker = null;
    var timer = null;
    var totalStarted = 0;
    var button = document.getElementById("start-test");
    var box = document.getElementById("result-box");
    var resultWord = document.getElementById("result-word");
    var resultDetail = document.getElementById("result-detail");
    var progressFill = document.getElementById("progress-fill");
    var technicalNote = document.getElementById("technical-note");

    function now() {
        if (window.performance && typeof window.performance.now === "function") return window.performance.now();
        return new Date().getTime();
    }

    function discard() {
        if (timer) { window.clearTimeout(timer); timer = null; }
        if (worker) { worker.terminate(); worker = null; }
    }

    function finish(success, message) {
        var elapsed = Math.round(now() - totalStarted);
        discard();
        button.disabled = false;
        button.innerHTML = "Testar novamente";
        resultWord.innerHTML = success ? "PASSOU" : "NÃO PASSOU";
        resultDetail.innerHTML = message;
        technicalNote.innerHTML = String(passed) + "/" + String(cases.length) +
            " casos · " + String(elapsed) + " ms · nenhuma cápsula residente";
    }

    function validate(item, response) {
        var findings = response.findings || [];
        var expected = item.expected;
        var i;
        var surface;
        if (findings.length !== expected.length) return false;
        for (i = 0; i < expected.length; i += 1) {
            surface = item.text.substring(findings[i].span[0], findings[i].span[1]);
            if (surface !== expected[i].surface) return false;
            if (findings[i].message.indexOf("(" + expected[i].type + ",") < 0) return false;
        }
        return true;
    }

    function runNext() {
        var item;
        discard();
        if (index >= cases.length) {
            finish(true, "A engine atravessou 19 casos e foi descartada.");
            return;
        }
        item = cases[index];
        resultDetail.innerHTML = "Caso " + String(index + 1) + " de " + String(cases.length) + ".";
        progressFill.style.width = String((index / cases.length) * 100) + "%";
        try {
            worker = new window.Worker("js/relative-clause-worker.js");
        } catch (error) {
            finish(false, "A cápsula não abriu no caso " + String(index + 1) + ".");
            return;
        }
        timer = window.setTimeout(function () {
            finish(false, "O caso " + String(index + 1) + " demorou além do limite.");
        }, 8000);
        worker.onerror = function () {
            finish(false, "A engine encontrou um erro no caso " + String(index + 1) + ".");
        };
        worker.onmessage = function (event) {
            var response = event.data || {};
            if (response.type !== "result" || !validate(item, response)) {
                finish(false, "A resposta divergiu no caso " + String(index + 1) + ".");
                return;
            }
            passed += 1;
            index += 1;
            progressFill.style.width = String((index / cases.length) * 100) + "%";
            discard();
            window.setTimeout(runNext, 80);
        };
        worker.postMessage({ type: "analyze", text: item.text });
    }

    function start() {
        if (!window.Worker) {
            box.removeAttribute("hidden");
            resultWord.innerHTML = "NÃO PASSOU";
            resultDetail.innerHTML = "Este navegador não abriu a cápsula.";
            return;
        }
        discard();
        index = 0;
        passed = 0;
        totalStarted = now();
        box.removeAttribute("hidden");
        resultWord.innerHTML = "Testando…";
        resultDetail.innerHTML = "Preparando o primeiro caso.";
        technicalNote.innerHTML = "";
        progressFill.style.width = "0";
        button.disabled = true;
        button.innerHTML = "Testando…";
        window.setTimeout(runNext, 100);
    }

    button.onclick = start;
    window.addEventListener("pagehide", discard, false);
}(window, document));
