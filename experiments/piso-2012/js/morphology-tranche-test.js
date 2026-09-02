(function (window, document) {
    "use strict";

    var cases = [{"id":"eval-inf-pessoal-nos-expresso","text":"Ela fechou a porta para nós trabalharmos em silêncio.","query":"trabalharmos","includes":["trabalhar","Infinitivo pessoal","1ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"eval-inf-pessoal-tu-expresso","text":"Sem tu perceberes o risco, a decisão pareceria simples.","query":"perceberes","includes":["perceber","Infinitivo pessoal","2ª pessoa do singular"],"excludes":["Futuro do subjuntivo"]},{"id":"eval-inf-pessoal-eles-expresso","text":"É importante eles chegarem antes da abertura.","query":"chegarem","includes":["chegar","Infinitivo pessoal","3ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"eval-inf-pessoal-nos-oculto","text":"É melhor sairmos agora para evitar a chuva.","query":"sairmos","includes":["sair","Infinitivo pessoal","1ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"eval-inf-pessoal-vos-formal","text":"Antes de partirdes, deixai as chaves sobre a mesa.","query":"partirdes","includes":["partir","Infinitivo pessoal","2ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"eval-inf-pessoal-eu-nao-flexionado","text":"O relatório ficou para eu revisar amanhã.","query":"revisar","includes":["revisar","Infinitivo pessoal","1ª pessoa do singular"],"excludes":["Futuro do subjuntivo"]},{"id":"eval-inf-pessoal-ela-nao-flexionado","text":"O prazo existe para ela concluir a leitura.","query":"concluir","includes":["concluir","Infinitivo pessoal","3ª pessoa do singular"],"excludes":["Futuro do subjuntivo"]},{"id":"eval-inf-pessoal-sujeitos-distintos","text":"Ela trouxe café para nós terminarmos a revisão.","query":"terminarmos","includes":["terminar","Infinitivo pessoal","1ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"eval-inf-impessoal-generico","text":"É melhor revisar o texto antes da entrega.","query":"revisar","includes":["revisar","Infinitivo"],"excludes":["Infinitivo pessoal"]},{"id":"eval-inf-impessoal-mesmo-sujeito","text":"Ela saiu cedo para evitar o trânsito.","query":"evitar","includes":["evitar","Infinitivo"],"excludes":["Infinitivo pessoal"]},{"id":"eval-inf-futuro-subjuntivo-homografo","text":"Quando eles chegarem, abriremos a sala.","query":"chegarem","includes":["chegar","Futuro do subjuntivo","3ª pessoa do plural"],"excludes":["Infinitivo pessoal"]},{"id":"eval-inf-substantivado","text":"O escrever diário exige disciplina.","query":"escrever","includes":["escrever","Infinitivo"],"excludes":["Infinitivo pessoal"]},{"id":"mass-dev-canto-substantivo","text":"O canto da sala é escuro.","query":"canto","expectFinding":false,"includes":[],"excludes":[]},{"id":"mass-dev-sabia-adjetivo","text":"A mulher sábia respondeu com calma.","query":"sábia","expectFinding":false,"includes":[],"excludes":[]},{"id":"mass-dev-larga-adjetivo","text":"A estrada larga cortava o vale.","query":"larga","expectFinding":false,"includes":[],"excludes":[]},{"id":"mass-dev-publica-adjetivo","text":"A instituição pública local abriu as portas.","query":"pública","expectFinding":false,"includes":[],"excludes":[]},{"id":"mass-log-melancolia-sobregeracao","text":"Melancolia atravessa a casa sem pedir licença.","query":"Melancolia","expectFinding":false,"includes":[],"excludes":[]},{"id":"mass-sample-andares-substantivo","text":"O elevador parou entre dois andares.","query":"andares","expectFinding":false,"includes":[],"excludes":[]},{"id":"legacy-cliche-deveres-substantivo","text":"homens de honra não fugiam de seus deveres","query":"deveres","expectFinding":false,"includes":[],"excludes":[]},{"id":"legacy-cliche-olhares-substantivo","text":"quando os olhares se cruzam tudo muda","query":"olhares","expectFinding":false,"includes":[],"excludes":[]},{"id":"legacy-sinonimo-deveres-substantivo","text":"direitos e deveres","query":"deveres","expectFinding":false,"includes":[],"excludes":[]},{"id":"gsd-noun-deveres","text":"dos poderes, dos deveres e da responsabilidade","query":"deveres","expectFinding":false,"includes":[],"excludes":[]},{"id":"gsd-noun-olhares","text":"sob os olhares atentos do técnico","query":"olhares","expectFinding":false,"includes":[],"excludes":[]},{"id":"gsd-noun-andares","text":"um prédio de três andares no Tatuapé","query":"andares","expectFinding":false,"includes":[],"excludes":[]},{"id":"gsd-verb-trabalharem","text":"além de trabalharem com o equilíbrio","query":"trabalharem","expectFinding":true,"includes":["trabalhar","Infinitivo pessoal","3ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"gsd-verb-passarem","text":"Ao passarem pela barreira","query":"passarem","expectFinding":true,"includes":["passar","Infinitivo pessoal","3ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"gsd-verb-receberem","text":"após receberem um alerta","query":"receberem","expectFinding":true,"includes":["receber","Infinitivo pessoal","3ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"gsd-verb-partirem","text":"previstos para partirem de16 horas","query":"partirem","expectFinding":true,"includes":["partir","Infinitivo pessoal","3ª pessoa do plural"],"excludes":["Futuro do subjuntivo"]},{"id":"gsd-verb-chegarem","text":"as duas só se enfrentam se chegarem à final","query":"chegarem","expectFinding":true,"includes":["chegar","Futuro do subjuntivo","3ª pessoa do plural"],"excludes":["Infinitivo pessoal"]}];
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
        var selected = null;
        var i;
        var surface;

        for (i = 0; i < findings.length; i += 1) {
            surface = item.text.substring(findings[i].span[0], findings[i].span[1]);
            if (surface === item.query) {
                selected = findings[i];
                break;
            }
        }
        if (item.expectFinding === false) return selected === null;
        if (!selected) return false;

        for (i = 0; i < item.includes.length; i += 1) {
            if (selected.message.indexOf(item.includes[i]) < 0) return false;
        }
        for (i = 0; i < item.excludes.length; i += 1) {
            if (selected.message.indexOf(item.excludes[i]) >= 0) return false;
        }
        return true;
    }

    function runNext() {
        var item;

        discard();

        if (index >= cases.length) {
            finish(true, "A engine atravessou 29 casos e foi descartada.");
            return;
        }

        item = cases[index];
        resultDetail.innerHTML = "Caso " + String(index + 1) + " de " +
            String(cases.length) + ".";
        progressFill.style.width = String((index / cases.length) * 100) + "%";

        try {
            worker = new window.Worker("js/morphology-worker.js");
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
