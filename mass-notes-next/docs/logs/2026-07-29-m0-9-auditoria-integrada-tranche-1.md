# M0.9 — auditoria integrada, tranche 1

Data: 2026-07-29

## Objetivo

Interromper a evolução por gates isolados e começar a medir o Mass Notes Next como uma oficina integrada.

## Memória operacional

Criado `docs/M0_9_AUDITORIA_OPERACIONAL.md` como fonte executável e viva para:

- fases;
- matriz;
- decisões;
- achados;
- severidades;
- placar;
- evidências;
- paridade;
- critérios de encerramento.

README, índice, PLAN e MEMORY passaram a exigir sua leitura antes de nova feature. O Gate 14 foi suspenso.

## Fechamento do Gate 13

Antes da matriz geral foram criados:

- `docs/logs/2026-07-29-gate-13-importacao-esc-legado.md`;
- `docs/product/MASS_NOTES_TIPTAP_GATE_13.md`;
- entrada completa no changelog.

O Gate 13 deixou de depender da conversa para seu contrato e evidência.

## Suíte transversal

Criado `tests/m0-9-integrated.spec.ts` com cinco cenários por navegador.

### Jornada 1 — escrita e retomada

- nova página;
- título e texto;
- estado Pronto;
- favorito;
- três tags;
- autosave;
- recarga;
- retomada de conteúdo e metadados.

### Jornada 2 — engines em sequência

- Revisão;
- Espelho de Voz;
- Contexto;
- RimaLab;
- Palavras/Léxico.

Contratos observados:

- texto idêntico antes e depois;
- revisão idêntica;
- nenhuma aplicação automática;
- frase sentinela ausente de URL e corpo de requisição.

### Jornada 3 — organização

- busca sem resultado;
- filtro de estado;
- página ativa fora do recorte;
- editor continua aberto;
- revisão do documento não muda;
- limpeza restaura o cartão ativo.

### Jornada 4 — mobile integrado

Larguras 320 e 390 px:

- drawer abre;
- sete abas navegáveis;
- ausência de overflow horizontal bloqueador;
- Escape fecha;
- foco retorna ao acionador.

### Jornada 5 — escala funcional

- 100 documentos;
- documento ativo acima de 100 mil caracteres;
- editor editável;
- 100 cartões renderizados;
- busca funcional;
- página ativa preservada fora do recorte.

## Primeira execução

Cabeça: `f3ab89db816557984ed19bc8ab17d2d96137d946`.

Resultado:

- 231/232;
- os 10 casos M0.9 passaram;
- única falha em teste antigo do RimaLab no Firefox.

Causa:

- o helper esperava observar `Alterado|Salvando` após paste;
- o autosave foi rápido e já havia chegado a `Salvo`;
- não houve falha de persistência ou engine.

Classificação:

- instabilidade temporal de teste;
- não é achado de produto;
- nenhum P0/P1.

Ajuste:

- helper aceita `Alterado|Salvando|Salvo` como estado observável antes de `Ctrl+S`;
- `Salvo` continua obrigatório como convergência final;
- produto não foi alterado.

## Repetição verde

Cabeça: `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`.

- Mass Notes `30463426867`: 232/232, publicação, cache e smoke público verdes;
- Argila `30463426847`: verde;
- coerência `30463426811`: verde;
- artefato: `mass-notes-tiptap-30463426867`.

## Achados iniciais

P0: nenhum.

P1: nenhum.

P2:

- M09-F001 — ausência de service worker/PWA próprio na aplicação nova;
- M09-F002 — Prova de Autoria ausente;
- M09-F003 — paridade de exportação incompleta.

P3:

- M09-F004 — preferências da biblioteca não persistem entre sessões.

## Veredito provisório

- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`.

Nota provisória geral: 85/100.

O milestone permanece aberto. A segunda tranche deve cobrir conflito real, portabilidade transversal, acessibilidade ampliada, corpus por engine e decisões explícitas para os P2.
