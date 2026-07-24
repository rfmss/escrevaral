#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const StateIntegrity = require(path.join(ROOT, "state-integrity.js"));
const ScreenplayCodec = require(path.join(ROOT, "screenplay-codec.js"));

function manuscript(overrides = {}) {
  return {
    id: "texto-1",
    title: "Rascunho",
    text: "Linha inicial",
    html: "<p>Linha inicial</p>",
    updatedAt: "2026-07-23T20:00:00.000Z",
    ...overrides,
  };
}

function state(ms, overrides = {}) {
  return {
    activeId: ms?.id || null,
    manuscripts: ms ? [ms] : [],
    proofs: {},
    versions: {},
    proofValidations: {},
    meta: { revision: 1, lastSavedAt: "2026-07-23T20:00:00.000Z" },
    ...overrides,
  };
}

function testResetUrlCannotEraseStorage() {
  const source = fs.readFileSync(path.join(ROOT, "state-store.js"), "utf8");
  assert.equal(
    /localStorage\.clear\s*\(/.test(source),
    false,
    "state-store.js não pode apagar toda a origem por URL"
  );
  assert.match(
    source,
    /navigator\.locks\?\.request/,
    "gravações concorrentes devem usar Web Locks quando disponíveis"
  );
}

function testScreenplayStructuredRoundTrip() {
  const blocks = [
    {
      type: "scene",
      slug: "INT. COZINHA — AMANHECER",
      action: "A chaleira apita.\nA PORTA ABRE.",
    },
    {
      type: "dialogue",
      character: "LIA",
      lines: ["Você ouviu?", "Nada responde."],
    },
    {
      type: "action",
      text: "O relógio para.",
    },
  ];
  const text = ScreenplayCodec.toText(blocks);
  assert.equal(
    text,
    "INT. COZINHA — AMANHECER\nA chaleira apita.\nA PORTA ABRE.\n\nLIA\nVocê ouviu?\nNada responde.\n\nO relógio para."
  );
  assert.deepEqual(
    ScreenplayCodec.fromStored({
      text: "texto legado que não deve substituir os campos",
      editorData: { format: "screenplay", version: 1, blocks },
    }),
    blocks
  );
}

function testLegacyScreenplayMigration() {
  const legacy = "INT. COZINHA — AMANHECER\nA chaleira apita.\n\nLIA\nVocê ouviu?";
  assert.deepEqual(ScreenplayCodec.parseText(legacy), [
    {
      type: "scene",
      slug: "INT. COZINHA — AMANHECER",
      action: "A chaleira apita.",
    },
    {
      type: "dialogue",
      character: "LIA",
      lines: ["Você ouviu?"],
    },
  ]);
}

function testDisjointTabEditsMerge() {
  const baseMs = manuscript();
  const base = state(baseMs);
  const local = state(manuscript({
    title: "Título da aba B",
    updatedAt: "2026-07-23T20:01:00.000Z",
  }));
  const remote = state(manuscript({
    text: "Corpo escrito na aba A",
    html: "<p>Corpo escrito na aba A</p>",
    updatedAt: "2026-07-23T20:02:00.000Z",
  }), { meta: { revision: 2, lastSavedAt: "2026-07-23T20:02:00.000Z" } });

  const result = StateIntegrity.mergeConcurrentStates(base, local, remote, {
    at: "2026-07-23T20:03:00.000Z",
  });

  assert.equal(result.conflicts.length, 0);
  assert.equal(result.state.manuscripts.length, 1);
  assert.equal(result.state.manuscripts[0].title, "Título da aba B");
  assert.equal(result.state.manuscripts[0].text, "Corpo escrito na aba A");
}

function testSameFieldConflictPreservesBothVersions() {
  const baseMs = manuscript();
  const base = state(baseMs, { proofs: { "texto-1": { source: "base" } } });
  const local = state(manuscript({
    text: "Versão local",
    html: "<p>Versão local</p>",
    updatedAt: "2026-07-23T20:01:00.000Z",
  }), { proofs: { "texto-1": { source: "local" } } });
  const remote = state(manuscript({
    text: "Versão remota",
    html: "<p>Versão remota</p>",
    updatedAt: "2026-07-23T20:02:00.000Z",
  }), {
    proofs: { "texto-1": { source: "remote" } },
    meta: { revision: 2, lastSavedAt: "2026-07-23T20:02:00.000Z" },
  });

  const result = StateIntegrity.mergeConcurrentStates(base, local, remote, {
    at: "2026-07-23T20:03:00.000Z",
  });

  assert.equal(result.conflicts.length, 1);
  assert.equal(result.state.manuscripts.length, 2);
  assert.equal(result.state.manuscripts[0].id, "texto-1");
  assert.equal(result.state.manuscripts[0].text, "Versão remota");

  const preserved = result.state.manuscripts[1];
  assert.match(preserved.id, /^texto-1-conflito-/);
  assert.equal(preserved.text, "Versão local");
  assert.match(preserved.title, /conflito preservado/);
  assert.equal(result.state.activeId, preserved.id);
  assert.deepEqual(result.state.proofs["texto-1"], { source: "remote" });
  assert.deepEqual(result.state.proofs[preserved.id], { source: "local" });
}

function testConcurrentProofEventsAreUnited() {
  const baseMs = manuscript();
  const baseProof = {
    activeSessionId: "sessao-1",
    sessions: [{ id: "sessao-1", events: [{ id: "evento-base", key: "a" }] }],
  };
  const localProof = {
    activeSessionId: "sessao-1",
    sessions: [{ id: "sessao-1", events: [
      { id: "evento-base", key: "a" },
      { id: "evento-local", key: "b" },
    ] }],
  };
  const remoteProof = {
    activeSessionId: "sessao-1",
    sessions: [{ id: "sessao-1", events: [
      { id: "evento-base", key: "a" },
      { id: "evento-remoto", key: "c" },
    ] }],
  };
  const base = state(baseMs, { proofs: { "texto-1": baseProof } });
  const local = state(baseMs, { proofs: { "texto-1": localProof } });
  const remote = state(baseMs, {
    proofs: { "texto-1": remoteProof },
    meta: { revision: 2, lastSavedAt: "2026-07-23T20:02:00.000Z" },
  });

  const result = StateIntegrity.mergeConcurrentStates(base, local, remote);
  const events = result.state.proofs["texto-1"].sessions[0].events;
  assert.deepEqual(events.map((event) => event.id), [
    "evento-base",
    "evento-remoto",
    "evento-local",
  ]);
}

function testReleaseVersionAndOfflineAssetsStayAligned() {
  const index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const serviceWorker = fs.readFileSync(path.join(ROOT, "service-worker.js"), "utf8");
  const version = serviceWorker.match(/ASSET_VERSION\s*=\s*"([^"]+)"/)?.[1];
  assert.ok(version, "ASSET_VERSION precisa existir");
  assert.match(index, new RegExp(`state-integrity\\.js\\?v=${version}`));
  assert.match(index, new RegExp(`screenplay-codec\\.js\\?v=${version}`));
  assert.match(serviceWorker, /state-integrity\.js/);
  assert.match(serviceWorker, /screenplay-codec\.js/);
}

const tests = [
  testResetUrlCannotEraseStorage,
  testScreenplayStructuredRoundTrip,
  testLegacyScreenplayMigration,
  testDisjointTabEditsMerge,
  testSameFieldConflictPreservesBothVersions,
  testConcurrentProofEventsAreUnited,
  testReleaseVersionAndOfflineAssetsStayAligned,
];

for (const test of tests) {
  test();
  process.stdout.write(`✓ ${test.name}\n`);
}
process.stdout.write(`\n${tests.length} testes de integridade passaram.\n`);
