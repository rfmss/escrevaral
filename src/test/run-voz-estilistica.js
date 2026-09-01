(function () {
    "use strict";

    /* Escrevaral-Encore — Test runner da engine de Voz e Estilística (ES5).
     * Roda em Node. Verifica métricas (TTR, densidade, extensão de frase), gesto
     * de voz, classificação de campo/emoção e o contrato check().
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../core/contracts.js");
    var VoiceEngine = require("../core/engines/voz-estilistica.js");
    var engine = new VoiceEngine();

    var total = 0, passed = 0, failures = [];

    function test(name, got, expected) {
        total++;
        var g = JSON.stringify(got), e = JSON.stringify(expected);
        if (g === e) {
            passed++;
            console.log("PASS [" + name + "] got=" + g);
        } else {
            failures.push(name + ": esperado " + e + ", got " + g);
            console.error("FAIL [" + name + "] esperado=" + e + ", got=" + g);
        }
    }

    function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

    /* Acentos → stopword precisa funcionar ("são" é function word não-stripada?) */
    var r1 = engine.analyze("A casa é um lugar de memória e silêncio.", {});
    test("count-words-neg", r1.counts.words > 4, true);
    test("field-casa", r1.fields[0] ? r1.fields[0].label : null, "casa");
    test("confianca-curta", r1.confianca, "baixa");

    /* TTR/densidade: texto com poucas palavras repetidas */
    var r2 = engine.analyze("O rio corre entre a rocha e a vereda, carrega a água, o barro e a lua sobre a serra calma.", {});
    test("ttr-alto", r2.metrics.ttr > 50, true);
    test("densidade-ok", r2.metrics.lexicalDensity >= 40, true);

    /* gesto heurístico: melancolia curta → seco (frase média baixa) */
    var mel = "A saudade chegou com a noite. O silêncio guardava a memória. A sombra apagou a distância. O luto permaneceu no espelho. A solidão tomou a janela. O vazio era profundo.";
    var r3 = engine.analyze(mel, {});
    test("gesture-seco", r3.voice.gesture, "seco");

    /* tensão/conflito longo → tensão emocional presente */
    var drama = "O homem correu pelo beco escuro, perseguido, com medo de ser pego. O sangue esquentava e os gritos cortavam o ar da rua cheia. A pressa e o risco tomavam conta de todos naquela noite violenta. O confronto era inevitável quando a arma apareceu na esquina. O disparo ecoou na multidão e o pânico se espalhou. Crianças choravam e a morte rondava o asfalto." +
        "A polícia chegou atrasada, mas a tensão já tinha marcado cada rosto naquela madrugada. O segredo do crime ficou enterrado com o corpo no morro vazio. O medo permaneceu nos olhos de quem testemunhou toda a tragédia. O rancor e a raiva atravessaram as calçadas como uma maldição. Ninguém falou nada, mas todos sabiam da culpa e da vingança. A traição tinha sido o estopim de tudo naquele fim de semana." +
        "O julgamento veio rápido e a condenação silenciou o bairro inteiro. O luto invadiu cada casa e cada coração partido da comunidade. A dor era profunda, mas a esperança de recomeçar nunca morreu de todo. O tempo passou, e com ele as cicatrizes foram se fechando devagar. A memória do acontecido ficou gravada em cada esquina do bairro. A verdade finalmente veio à tona e a culpa encontrou seu lugar.";
    var r4 = engine.analyze(drama, {});
    test("drama-emocional", r4.emotional.length > 0, true);
    test("drama-confianca-media", r4.confianca, "média");

    /* pensamento → ensaístico quando densidade alta e campo pensamento */
    var ensaio = "O tempo não é uma linha, é uma espiral que se repete em cada escolha. A verdade e a dúvida habitam a mesma consciência. O dilema entre o instinto e a razão define o sentido de toda decisão. Talvez a filosofia seja a arte de interrogar o mundo sem nunca concluir. O pensamento cria o paradoxo, e o paradoxo devora o pensamento. Cada pergunta abre uma nova pergunta sobre o mesmo mistério.";
    var r5 = engine.analyze(ensaio, {});
    test("ensaio-gesto", ["ensaístico", "contemplativo"].indexOf(r5.voice.gesture) !== -1, true);
    test("ensaio-campo", r5.fields[0] ? r5.fields[0].label : null, "pensamento");

    /* contrato check() */
    (function checkContract() {
        total++;
        var called = false;
        engine.check({ text: drama }, function (findings) {
            called = true;
            var styled = Array.isArray(findings);
            var voiceMsg = styled && findings.some(function (f) { return f.ruleId === "VOICE" && /Voz:/.test(f.message); });
            if (styled && voiceMsg && findings.length >= 3) {
                passed++;
                console.log("PASS [check-contrato] findings=" + findings.length);
            } else {
                failures.push("check-contrato: findings=" + JSON.stringify(findings));
                console.error("FAIL [check-contrato]");
            }
        });
        if (!called) {
            failures.push("check-contrato: callback não invocado");
            console.error("FAIL [check-contrato] callback não invocado");
        }
    })();

    console.log("-----");
    console.log("RESULTADO: " + passed + "/" + total + " passando");
    if (failures.length) {
        console.error("FALHAS:");
        failures.forEach(function (f) { console.error("  - " + f); });
        process.exit(1);
    }
})();
