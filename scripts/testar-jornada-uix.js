#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");

const app = read("app.js");
const grammar = read("grammar-controller.js");
const index = read("index.html");
const stateStore = read("state-store.js");
const shellCss = read("css/02-shell-navigation.css");

const checks = [
  {
    name: "a entrada principal ativa a primeira folha sem distrações",
    run() {
      assert.match(
        app,
        /if \(goTo === "blank"\) \{[\s\S]{0,400}enterFirstWriting\(\)/,
      );
    },
  },
  {
    name: "o estado da primeira sessão usa o mesmo contrato no JavaScript e no CSS",
    run() {
      assert.match(grammar, /shell\.classList\.add\("is-first-writing-session"\)/);
      assert.match(grammar, /shell\.classList\.remove\("is-first-writing-session"\)/);
      assert.match(shellCss, /\.app-shell\.is-first-writing-session/);
    },
  },
  {
    name: "a escritora pode revelar as ferramentas sem precisar digitar",
    run() {
      assert.match(app, /"finish-first-writing-session"\s*:\s*\(\)\s*=>\s*exitFirstWriting\(\)/);
    },
  },
  {
    name: "o salvamento é anunciado por tecnologia assistiva",
    run() {
      assert.match(
        index,
        /<span class="statusbar-save" data-save-status data-save-state="idle" role="status" aria-live="polite" aria-atomic="true">/,
      );
    },
  },
  {
    name: "o estado salvo informa claramente onde o texto ficou",
    run() {
      assert.match(stateStore, /Salvo neste navegador às \$\{hhmm\}/);
      assert.match(stateStore, /saveStatus\.dataset\.saveState = "saved"/);
      assert.match(app, /saveStatus\.dataset\.saveState = "saving"/);
    },
  },
  {
    name: "falhas de armazenamento têm estado visual próprio",
    run() {
      assert.match(stateStore, /saveStatus\.dataset\.saveState = "error"/);
      assert.match(shellCss, /\.statusbar-save\[data-save-state="error"\]/);
    },
  },
  {
    name: "a entrada explica salvamento automático e cópia de segurança",
    run() {
      assert.match(index, /salvo automaticamente neste navegador/i);
      assert.match(index, /cópia de segurança/i);
    },
  },
];

let passed = 0;
for (const check of checks) {
  try {
    check.run();
    passed += 1;
    console.log(`✓ ${check.name}`);
  } catch (error) {
    console.error(`✗ ${check.name}`);
    console.error(`  ${error.message.split("\n")[0]}`);
  }
}

assert.equal(passed, checks.length, `${passed}/${checks.length} contratos UIX atendidos`);
console.log(`\nJornada UIX: ${passed}/${checks.length} contratos OK.`);