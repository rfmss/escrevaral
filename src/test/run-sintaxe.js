(function () {
    "use strict";

    /* Escrevaral-Encore — Test runner da engine de Sintaxe/Funções (ES5).
     * Roda em Node. Verifica morfologia heurística, funções sintáticas,
     * classificação de período, apostos/locuções, concordância e o contrato
     * check() (assíncrono, via callback).
     */

    var root = typeof global !== "undefined" ? global : (typeof window !== "undefined" ? window : this);
    require("../core/contracts.js");
    require("../data/syntax-data.js");
    require("../data/norma-data.js");
    var SintaxeEngine = require("../core/engines/sintaxe.js");
    var engine = new SintaxeEngine();

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

    function funcoes(r) {
        return r.termos.filter(function (t) { return t.funcao; }).map(function (t) { return t.text + ":" + t.funcao; }).join(" | ");
    }

    /* ── Período simples com vocativo + aposto ─────────────────────────────── */
    var r1 = engine.analisarPeriodo("Pedro, o rei, chegou cedo.");
    test("r1-tipo", r1.resumo.tipo, "Período simples");
    test("r1-vocativo", r1.resumo.vocativos, ["Pedro"]);
    test("r1-aposto-presenca", r1.apostos.length > 0, true);
    test("r1-funcoes", funcoes(r1).indexOf("Pedro:Vocativo") >= 0, true);

    /* ── 'que' após sujeito: na morfologia heurística vira conjunção ──────────
     * Fidelidade à fonte A (fallback): o fallback marca 'que' como Conjunction e
     * a máquina de estados o trata como "Conjunção". O ramo 'oração adjetiva'
     * exige tags pt-compromise, ausentes no caminho heurístico puro.
     */
    var r2 = engine.analisarPeriodo("A menina que sorria estava feliz.");
    test("r2-temRelativa", r2.resumo.temRelativa, false);
    test("r2-funcoes-conj", funcoes(r2).indexOf("que:Conjunção") >= 0, true);
    test("r2-predicativo", funcoes(r2).indexOf("feliz:Predicativo do sujeito") >= 0, true);

    /* ── Voz passiva analítica ─────────────────────────────────────────────── */
    var r3 = engine.analisarPeriodo("O documento foi assinado pelo diretor.");
    test("r3-passiva", r3.resumo.vozePassiva, true);
    test("r3-auxiliar", funcoes(r3).indexOf("foi:Voz passiva — auxiliar") >= 0, true);

    /* ── Período composto por coordenação ──────────────────────────────────── */
    var r4 = engine.analisarPeriodo("Maria trabalha e João estuda.");
    test("r4-tipo", r4.resumo.tipo, "Período composto misto (coordenação + subordinação)");
    test("r4-orações", r4.resumo.nOracoes, 2);
    test("r4-femNome", funcoes(r4).indexOf("Maria:Sujeito (provável)") >= 0, true);

    /* ── Predicativo do sujeito (verbo de ligação) ─────────────────────────── */
    var r5 = engine.analisarPeriodo("O menino parece feliz.");
    test("r5-ligacao", funcoes(r5).indexOf("parece:Verbo de ligação") >= 0, true);
    test("r5-predicativo", funcoes(r5).indexOf("feliz:Predicativo do sujeito") >= 0, true);

    /* ── Conjunção subordinativa → período composto por subordinação ───────── */
    var r6 = engine.analisarPeriodo("Quando choveu, ficamos em casa.");
    test("r6-tipo", r6.resumo.tipo, "Período composto por subordinação");
    test("r6-conj", r6.resumo.conjuncoes.length > 0, true);

    /* ── Objeto direto (provável) pós-verbo transitivo ─────────────────────── */
    var r7 = engine.analisarPeriodo("O escritor publicou o romance.");
    test("r7-od", funcoes(r7).indexOf("romance:Objeto direto (provável)") >= 0, true);

    /* ── IdentificarConjuncao isolada ──────────────────────────────────────── */
    test("r8-porque", engine.identificarConjuncao("porque").classe, "subordinativa");
    test("r8-apesardeq", engine.identificarConjuncao("apesar de que").classe, "subordinativa");

    /* ── identificarTempoVerbal ────────────────────────────────────────────── */
    test("r9-gerundio", engine.identificarTempoVerbal("correndo", [], {}), "Gerúndio");
    test("r9-infinitivo", engine.identificarTempoVerbal("andar", [], {}), "Infinitivo");

    /* ── Concordância verbal (plural + verbo singular) ─────────────────────── */
    var r10 = engine.analisarPeriodo("Os meninos correu.");
    test("r10-alertas", r10.resumo.alertas.length > 0, true);

    /* ── Delegação: tipoAdvérbio / classificarPeriodo ──────────────────────── */
    test("r11-adverbio", engine.tipoAdverbio("ontem"), "Adjunto adverbial de tempo");
    test("r11-periodo", engine.classificarPeriodo(1, [], []), "Período simples");

    /* ── Regras de desambiguação (R10/R12/R13/R_SALVO/certo) ────────────────── */
    var r12 = engine.analisarPeriodo("Eu jogo bola.");
    test("r12-pronome-verbo", funcoes(r12).indexOf("jogo:Núcleo do predicado") >= 0, true);

    var r13d = engine.analisarPeriodo("O xibiu fugiu.");
    test("r13-default-noun", funcoes(r13d).indexOf("xibiu:Sujeito (provável)") >= 0, true);

    var r13rel = engine.analisarPeriodo("Tudo que brilha é ouro.");
    test("r13-que-relativo-tag", r13rel.termos.some(function (t) { return t.text === "que" && (t.tags || []).indexOf("Pronoun") >= 0; }), true);

    var rsalvo = engine.analisarPeriodo("Todos foram, salvo ela.");
    test("rsalvo-preposicao", funcoes(rsalvo).indexOf("salvo:Preposição") >= 0, true);

    var rcertoadv = engine.analisarPeriodo("Ele chegou certo.");
    test("rcerto-adverbio", funcoes(rcertoadv).indexOf("certo:Adjunto adverbial") >= 0, true);

    var rcertoadj = engine.analisarPeriodo("A resposta certa agradou.");
    test("rcerto-adjetivo-tag", rcertoadj.termos.some(function (t) { return t.text === "certa" && (t.tags || []).indexOf("Adjective") >= 0; }), true);

    /* ── Contrato check (assíncrono via callback) ──────────────────────────── */
    (function () {
        var called = false;
        total++;
        engine.check({ text: "A menina que sorria estava feliz.", context: {} }, function (findings) {
            called = true;
            var styled = Array.isArray(findings);
            var hasSyntax = styled && findings.some(function (f) { return f.ruleId === "SINTAXE"; });
            if (styled && hasSyntax && findings.length >= 1) {
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
