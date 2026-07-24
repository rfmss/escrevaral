#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.ESCREVARAL_TEST_URL || "http://127.0.0.1:8799";
const STORAGE_KEY = "vereda.manuscripts.v1";
const TERMS_KEY = "escrevaral-termos-v1";

function baseState(overrides = {}) {
  const at = "2026-07-23T20:00:00.000Z";
  return {
    activeId: "texto-1",
    manuscripts: [{
      id: "texto-1",
      title: "Rascunho",
      text: "Linha inicial",
      html: "<p>Linha inicial</p>",
      kind: "Rascunho",
      type: "manuscrito",
      status: "Em escrita",
      chapter: "Primeira cena",
      progress: 0,
      description: "",
      tags: [],
      pinned: false,
      folder: "Ficção",
      createdAt: at,
      updatedAt: at,
    }],
    focus: { fontSize: 19, width: 720, ruler: false },
    lexical: {},
    template: { selectedId: null, side: "left", width: 340, open: false },
    archive: { filter: "all", search: "", sort: "updated", statusFilter: "all" },
    layout: { leftCollapsed: false, rightCollapsed: true },
    appearance: { theme: "scriptorium" },
    proofs: {},
    versions: {},
    proofValidations: {},
    meta: { revision: 1, lastSavedAt: at },
    ...overrides,
  };
}

async function seed(page, value) {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.evaluate(({ key, termsKey, state }) => {
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.setItem(termsKey, new Date().toISOString());
  }, { key: STORAGE_KEY, termsKey: TERMS_KEY, state: value });
  await page.reload({ waitUntil: "networkidle" });
}

async function readStored(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
}

async function waitForSave(page) {
  await page.waitForTimeout(800);
}

async function testResetUrl(page) {
  await seed(page, baseState());
  await page.goto(`${BASE_URL}/?reset=true`, { waitUntil: "networkidle" });
  const stored = await readStored(page);
  assert.equal(stored.manuscripts.length, 1);
  assert.equal(stored.manuscripts[0].text, "Linha inicial");
}

async function testScreenplayRoundTrip(page) {
  const screenplayState = baseState({
    template: { selectedId: "roteiro-tv", side: "left", width: 340, open: false },
    manuscripts: [{
      ...baseState().manuscripts[0],
      title: "Roteiro",
      text: "",
      html: "",
      kind: "Roteiro de TV",
      templateId: "roteiro-tv",
      folder: "Roteiro",
    }],
  });
  await seed(page, screenplayState);

  const slug = page.locator("[data-sp-slug]").first();
  const action = page.locator("[data-sp-action]").first();
  await slug.waitFor({ state: "visible" });
  await slug.fill("INT. COZINHA — AMANHECER");
  await action.fill("A chaleira apita. A janela devolve um céu sem rua.");
  await waitForSave(page);

  const before = await readStored(page);
  assert.equal(before.manuscripts[0].editorData.format, "screenplay");
  assert.equal(before.manuscripts[0].editorData.blocks[0].action, "A chaleira apita. A janela devolve um céu sem rua.");

  await page.reload({ waitUntil: "networkidle" });
  await slug.waitFor({ state: "visible" });
  assert.equal(await slug.inputValue(), "INT. COZINHA — AMANHECER");
  assert.equal(await action.inputValue(), "A chaleira apita. A janela devolve um céu sem rua.");
}

async function testTwoTabsMergeDisjointChanges(context) {
  const pageA = await context.newPage();
  await seed(pageA, baseState());
  const pageB = await context.newPage();
  await pageB.goto(BASE_URL, { waitUntil: "networkidle" });

  await pageA.locator(".writing-area").fill("Corpo escrito na aba A");
  await waitForSave(pageA);
  await pageB.locator(".title-input").fill("Título da aba B");
  await waitForSave(pageB);

  const stored = await readStored(pageB);
  assert.equal(stored.manuscripts.length, 1);
  assert.equal(stored.manuscripts[0].title, "Título da aba B");
  assert.equal(stored.manuscripts[0].text, "Corpo escrito na aba A");
  await pageA.close();
  await pageB.close();
}

async function testTwoTabsPreserveDivergentText(context) {
  const pageA = await context.newPage();
  await seed(pageA, baseState());
  const pageB = await context.newPage();
  await pageB.goto(BASE_URL, { waitUntil: "networkidle" });

  await pageA.locator(".writing-area").fill("Versão escrita na aba A");
  await waitForSave(pageA);
  await pageB.locator(".writing-area").fill("Versão escrita na aba B");
  await waitForSave(pageB);

  const stored = await readStored(pageB);
  assert.equal(stored.manuscripts.length, 2);
  assert.ok(stored.manuscripts.some((item) => item.text === "Versão escrita na aba A"));
  assert.ok(stored.manuscripts.some((item) => item.text === "Versão escrita na aba B"));
  assert.ok(stored.manuscripts.some((item) => /conflito preservado/.test(item.title)));
  await pageA.close();
  await pageB.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const tests = [
      ["reset por URL", () => testResetUrl(page)],
      ["round-trip de roteiro", () => testScreenplayRoundTrip(page)],
      ["merge entre abas", () => testTwoTabsMergeDisjointChanges(context)],
      ["preservação de conflito", () => testTwoTabsPreserveDivergentText(context)],
    ];

    for (const [name, test] of tests) {
      await test();
      process.stdout.write(`✓ ${name}\n`);
      if (name === "round-trip de roteiro") await page.close();
    }
    await context.close();
    process.stdout.write(`\n${tests.length} testes de navegador passaram.\n`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
