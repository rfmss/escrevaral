(function (global) {
    "use strict";

    /* Fatia ES5 do léxico de lemas do Mass Notes.
     * Origem: rfmss/escrevaral@816ca7ea2140f49b93a5bfaeabd0b898871760e5
     * mass-notes-next/src/engines/verbMorphology/verbLemmaLexicon.ts
     * Acréscimos "concluir", "evitar" e "revisar" vêm da banca congelada
     * verb-morphology-evaluation.json do mesmo commit.
     */
    var Encore = global.Encore = global.Encore || {};
    Encore.data = Encore.data || {};
    Encore.data.verbLemmasCore = [
        "abrir", "acabar", "achar", "ajudar", "amar", "analisar", "andar", "aprender",
        "buscar", "cantar", "carregar", "chamar", "chegar", "chover", "começar", "comer",
        "concluir", "conhecer", "continuar", "correr", "cortar", "criar", "deixar", "dever",
        "dormir", "escrever", "esperar", "estudar", "evitar", "falar", "fechar", "ficar",
        "gostar", "largar", "ler", "lembrar", "morar", "mover", "nascer", "olhar", "ouvir",
        "partir", "passar", "pensar", "perceber", "perder", "permanecer", "precisar",
        "procurar", "publicar", "receber", "resolver", "responder", "revisar", "sair",
        "seguir", "sentir", "tentar", "terminar", "trabalhar", "usar", "vender", "viver",
        "voltar", "varrer"
    ];
}(typeof global !== "undefined" ? global :
    (typeof window !== "undefined" ? window :
        (typeof self !== "undefined" ? self : this))));
