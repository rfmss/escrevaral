#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = { console };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);

for (const file of ["vrda-engine.js", "backup-engine.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
}

const state = {
  activeId: "manuscrito-1",
  manuscripts: [{ id: "manuscrito-1", title: "Texto", type: "manuscrito", text: "Conteúdo local" }],
  focus: { fontSize: 21, width: 680, ruler: true },
  lexical: { selectedWord: "texto" },
  archive: { filter: "all", sort: "updated" },
  template: { selectedId: "romance", side: "right", width: 420, open: true },
  layout: { leftCollapsed: true, rightCollapsed: false },
  appearance: { theme: "noite" },
  proofs: { "manuscrito-1": { signedAt: "2026-07-15" } },
  versions: { "manuscrito-1": [{ id: "version-1" }] },
  proofValidations: { "version-1": true },
  proofAuthor: { name: "Autora Teste", artisticName: "A. Teste", signedAt: "2026-07-15" },
};

const backup = sandbox.VeredaBackup.createBackup(state);
const restored = sandbox.VeredaBackup.restoreBackup({ manuscripts: [], focus: {}, lexical: {}, archive: {} }, backup);

for (const field of ["template", "layout", "appearance", "proofAuthor"]) {
  assert.deepEqual(restored[field], state[field], `${field} foi perdido no round-trip do backup`);
}

console.log("OK — round-trip de backup preserva preferências e autoria");
