(function (global) {
    "use strict";

    /* Escrevaral-Encore — contratos de engine (ES5).
     * Baseado no contrato canônico do antigravity (js/core/linguistic-core/contracts.js).
     * Piso: iPad 2012 (iOS 9) / Android 4.4 (Chromium 30). Sem IA no runtime.
     */

    var Encore = global.Encore = global.Encore || {};

    /* Finding — um resultado de análise pontual.
     * ruleId: identificador da regra/engine;
     * span: [start, end] no texto original;
     * message: explicar para o leitor;
     * severity: 1..3 (leve, médio, grave);
     * confidence: 0..1.
     */
    function Finding(ruleId, span, message, severity, confidence) {
        this.ruleId = ruleId;
        this.span = span || [0, 0];
        this.message = message || "";
        this.severity = severity || 1;
        this.confidence = confidence || 1.0;
    }

    /* LinguisticSnapshot — o que uma engine recebe para analisar.
     * text: a fatia de texto (palavra, frase ou documento, conforme a engine);
     * context: metadados opcionais (tipo de texto, gênero, configurações do usuário).
     */
    function LinguisticSnapshot(text, context) {
        this.text = text;
        this.context = context || {};
    }

    /* Contrato de engine:
     * Uma engine é um objeto { id, domain, version, check(snapshot, done) }.
     * check() é SEMPRE assíncrono por contrato (chama done(findings)) para que
     * o runtime possa executar UM engine por vez (roletagem, baixa RAM) sem travar.
     */
    Encore.contracts = {
        Finding: Finding,
        LinguisticSnapshot: LinguisticSnapshot,
        checkEngine: function (engine, text, done) {
            var snap = new LinguisticSnapshot(text);
            engine.check(snap, function (findings) {
                done(findings || []);
            });
        }
    };
})(typeof global !== "undefined" ? global : window);
