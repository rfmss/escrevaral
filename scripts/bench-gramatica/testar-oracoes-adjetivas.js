#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "../..");
const sandbox = { console };
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);

for (const file of ["relative-clause-engine.js", "punctuation-engine.js"]) {
  const source = fs.readFileSync(path.join(ROOT, file), "utf8");
  vm.runInContext(source, sandbox, { filename: file });
}

const relative = sandbox.VeredaRelativeClauses;
const punctuation = sandbox.VeredaPunctuation;

function classification(text) {
  const analyses = relative.analyze(text);
  assert.equal(analyses.length, 1, `Esperava uma oração relativa em: ${text}`);
  return analyses[0];
}

function ruleIds(text) {
  return punctuation.analyze(text).issues.map(issue => issue.ruleId);
}

const brasil = classification("O Brasil que ocupa grande parte da América do Sul abriga muitos biomas.");
assert.equal(brasil.type, "explicativa");
assert.equal(brasil.confidence, "alta");
assert.match(brasil.evidence.join(" "), /referente único/i);

const baleias = classification("As baleias que têm sangue quente precisam subir à superfície para respirar.");
assert.equal(baleias.type, "explicativa");
assert.equal(baleias.confidence, "alta");
assert.match(baleias.evidence.join(" "), /propriedade geral/i);

const estudantes = classification("Os estudantes que chegaram cedo ocuparam as primeiras cadeiras da sala.");
assert.equal(estudantes.type, "ambigua");
assert.equal(estudantes.confidence, "baixa");
assert.match(estudantes.guidance, /intenção autoral decide/i);

const universal = classification("Todos os estudantes que chegaram cedo receberam o material antes da aula.");
assert.equal(universal.type, "ambigua");
assert.equal(universal.confidence, "baixa");

const delimitada = classification("Apenas os estudantes, que entregaram o trabalho, receberam o certificado hoje.");
assert.equal(delimitada.type, "restritiva");
assert.equal(delimitada.confidence, "alta");
assert.match(delimitada.evidence.join(" "), /delimitador explícito/i);

const indefinida = classification("Encontrei uma pesquisadora, que havia estudado o tema, durante o congresso.");
assert.equal(indefinida.type, "ambigua");
assert.equal(indefinida.confidence, "baixa");

const machado = classification("Machado de Assis que escreveu Dom Casmurro nasceu no Rio de Janeiro.");
assert.equal(machado.type, "explicativa");
assert.equal(machado.confidence, "alta");

assert.equal(
  relative.analyze("A escritora disse que entregaria o romance completo amanhã.").length,
  0,
  "Conjunção integrante depois de verbo dicendi não pode ser tratada como oração adjetiva",
);
assert.equal(
  relative.analyze("Ele fez o que considerou necessário durante a revisão final.").length,
  0,
  "Pronome demonstrativo em 'o que' não pode virar antecedente nominal",
);

const homonimo = classification("Havia dois João Silva na turma. O João Silva que chegou cedo sentou na frente.");
assert.equal(homonimo.type, "ambigua");
assert.equal(homonimo.confidence, "baixa");

assert.ok(
  ruleIds("O Brasil que ocupa grande parte da América do Sul abriga muitos biomas e culturas.").includes("PONT-18"),
  "PONT-18 deve sinalizar ausência de vírgula com referente único e leitura explicativa segura",
);
assert.ok(
  ruleIds("Apenas os estudantes, que entregaram o trabalho, receberam o certificado oficial da escola.").includes("PONT-19"),
  "PONT-19 deve sinalizar vírgula com delimitador restritivo explícito",
);
assert.ok(
  !ruleIds("Todos os estudantes que chegaram cedo receberam o material completo antes da aula.").includes("PONT-18"),
  "PONT-18 deve se abster quando 'todos' ainda delimita um subconjunto",
);
assert.ok(
  !ruleIds("Encontrei uma pesquisadora, que havia estudado o tema, durante o congresso nacional ontem.").includes("PONT-19"),
  "PONT-19 deve se abster quando o indefinido pode introduzir referente específico",
);

const contextualIssue = punctuation
  .analyze("O Brasil que ocupa grande parte da América do Sul abriga muitos biomas e culturas.")
  .issues.find(issue => issue.ruleId === "PONT-18");
assert.equal(contextualIssue.contextual, true);
assert.equal(contextualIssue.confidence, "alta");
assert.ok(contextualIssue.score >= 0.9);
assert.ok(contextualIssue.evidence.length > 0);

for (const ruleId of ["PONT-18", "PONT-19"]) {
  const rule = punctuation.getRules().find(item => item.id === ruleId);
  assert.ok(rule, `Regra ${ruleId} deve existir`);
  assert.ok(!ruleIds(`${rule.exemplo} Este complemento mantém o teste acima de dez palavras.`).includes(ruleId), `${ruleId} não pode rejeitar o próprio exemplo correto`);
  assert.ok(ruleIds(`${rule.contraexemplo} Este complemento mantém o teste acima de dez palavras.`).includes(ruleId), `${ruleId} deve reconhecer o próprio contraexemplo`);
}

console.log("OK — 22 verificações contextuais de PONT-18/PONT-19");