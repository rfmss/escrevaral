(function () {
    "use strict";

    var Notebook = require("../core/services/notebook.js");
    var values = {};
    var clock = 1000;
    var passed = 0;
    var total = 0;
    var memory = {
        getItem: function (key) { return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null; },
        setItem: function (key, value) { values[key] = String(value); },
        removeItem: function (key) { delete values[key]; }
    };
    var store = new Notebook.Store(memory, {
        now: function () { return clock; },
        random: function () { return 0.25; }
    });

    function check(name, condition) {
        total += 1;
        if (condition) {
            passed += 1;
            console.log("PASS [" + name + "]");
        } else {
            console.error("FAIL [" + name + "]");
        }
    }

    check("titulo-obrigatorio", store.create("   ", "texto").code === "TITLE_REQUIRED");

    var first = store.create("Primeiro papel", "um").note;
    clock = 2000;
    var second = store.create("Segundo papel", "dois").note;
    check("duas-notas-separadas", !!memory.getItem(Notebook.NOTE_PREFIX + first.id) && !!memory.getItem(Notebook.NOTE_PREFIX + second.id));
    check("ordem-por-criacao", store.list()[0].id === second.id && store.list()[1].id === first.id);

    clock = 3000;
    var edited = store.update(first.id, { title: "Primeiro revisto", body: "um revisto" }).note;
    check("criacao-imutavel", edited.createdAt === 1000 && edited.updatedAt === 3000);
    check("edicao-nao-move", store.list()[0].id === second.id && store.list()[1].id === first.id);

    var reopened = new Notebook.Store(memory, { now: function () { return 4000; } });
    check("recupera-apos-reabrir", reopened.get(first.id).body === "um revisto" && reopened.list().length === 2);
    check("indice-sem-conteudo", memory.getItem(Notebook.INDEX_KEY).indexOf("um revisto") === -1);

    console.log("-----");
    console.log("CADERNO LOCAL: " + passed + "/" + total + " passando");
    if (passed !== total) process.exit(1);
}());
