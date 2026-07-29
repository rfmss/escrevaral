# Contrato de produto — M0.9 Candidata Integrada do Escrevaral

Data: 2026-07-29

Estado: em execução

## Objetivo

Medir o Mass Notes Next como produto integrado antes de qualquer nova feature ou promoção.

## Perguntas de saída

O milestone emite respostas independentes para:

1. beta fechada;
2. lançamento público;
3. substituição do Escrevaral antigo.

## Regras

- auditar antes de corrigir;
- suspender novas features;
- manter PR em rascunho;
- manter `main` e aplicação pública intactas;
- não editar branch de preview;
- não enfraquecer teste para obter verde;
- corrigir durante a auditoria somente bloqueio P0 ou impedimento da medição;
- documentar decisão, achado e evidência no momento em que mudam;
- repetir matriz completa após correção;
- nenhum texto autoral pode sair em requisição de rede.

## Memória operacional

Fonte executável:

- `mass-notes-next/docs/M0_9_AUDITORIA_OPERACIONAL.md`.

Relatório humano:

- `mass-notes-next/docs/audits/M0_9_AUDITORIA_GERAL.md`.

Relatório estruturado:

- `mass-notes-next/docs/audits/M0_9_AUDITORIA_GERAL.json`.

## Áreas obrigatórias

- editor e preservação;
- biblioteca;
- engines;
- UIX;
- acessibilidade;
- responsividade;
- importação e exportação;
- privacidade;
- desempenho;
- release;
- paridade com produto antigo.

## Severidade

- P0: perda/corrupção, exposição autoral, inutilização ou sobrescrita silenciosa;
- P1: fluxo principal quebrado, engine enganosa ou acessibilidade bloqueadora;
- P2: defeito relevante, inconsistência importante ou lacuna de paridade;
- P3: acabamento e melhoria não bloqueadora.

## Primeira tranche aprovada

Cabeça funcional: `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`.

Matriz:

- 116 cenários por navegador;
- 232 execuções;
- Chromium e Firefox.

Jornadas:

- escrita, metadados, autosave e recarga;
- cinco superfícies de engines em sequência sem mutação;
- sentinela autoral ausente de URL/corpo de requisição;
- filtros sem mutar revisão ou descartar página ativa;
- drawer integrado em 320 e 390 px;
- 100 páginas e documento acima de 100 mil caracteres.

Evidências:

- Mass Notes `30463426867`: verde, 232/232, publicação, cache e smoke público;
- Argila `30463426847`: verde;
- coerência `30463426811`: verde.

## Achados provisórios

P0: nenhum.

P1: nenhum.

P2:

- aplicação nova sem PWA/offline próprio;
- Prova de Autoria ausente;
- paridade de exportação incompleta.

P3:

- preferências da biblioteca não persistem.

## Veredito provisório

- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`.

Nota provisória: 85/100.

## Limite do veredito

A primeira tranche não encerra o milestone. Ainda são obrigatórios:

- conflito transversal real;
- portabilidade combinada;
- acessibilidade ampliada e tecnologias assistivas/dispositivos reais;
- auditoria heurística manual;
- rede completa;
- sessão prolongada e medição de latência/memória;
- corpus ampliado por engine;
- decisões explícitas para P2;
- CI na cabeça documental final sem commit posterior.

## Critério final

O M0.9 só encerra sem P0 aberto, com todo P1 decidido, matriz integral verde, preview pública válida, documentação sincronizada e PR ainda em rascunho.
