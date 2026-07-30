# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-29

## Norte do produto

Construir uma oficina de escrita para português brasileiro sobre infraestrutura consolidada, preservando identidade editorial, processamento local, controle integral dos dados e decisão autoral.

O objetivo atual não é apenas portar o Escrevaral antigo: é demonstrar, por corpus e comparação reproduzível, que as engines novas preservam o útil e superam o legado em contexto, explicabilidade e segurança.

## Fundação atual

- React, TypeScript, Vite e Tiptap/ProseMirror;
- JSON estrutural, IndexedDB, autosave, recuperação e conflitos;
- engines locais por adaptadores tipados;
- snapshot vivo do Tiptap para análises acionadas pela interface;
- Revisão inline e Palavras/Léxico somente de leitura;
- exportação TXT, Markdown e HTML;
- cópia nativa versionada;
- biblioteca consultável e metadados editoriais editáveis;
- importador auditável do `.esc` legado;
- preview isolada e PR rascunho `#155`.

## Gates e auditoria concluídos

- Gates 1 a 13;
- Gate 10.5 — fronteiras de distribuição;
- M0.9 — auditoria integrada, não funcional e decisões de P2.

O M0.9 encerrou como auditoria técnica. Ele não autorizou lançamento público, promoção para `main` ou substituição integral.

Resultado consolidado herdado:

- 124 cenários por navegador, 248 execuções;
- Chromium e Firefox obrigatórios;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- Gate 14 suspenso.

Fontes históricas:

- `M0_9_AUDITORIA_OPERACIONAL.md`;
- `M0_9_ERRATA_MATRIZ.md`;
- `logs/2026-07-29-m0-9-decisoes-p2.md`;
- `logs/2026-07-29-m0-9-encerramento-m1-abertura.md`;
- `../../docs/product/MASS_NOTES_TIPTAP_M0_9.md`.

## Milestone atual — M1.0: Engines superiores ao Escrevaral legado

Fonte operacional:

- `M1_0_ENGINES_SUPERIORES.md`.

Contrato global:

- `../../docs/product/MASS_NOTES_ENGINES_SUPERIORES.md`.

### Definição de vitória

Superioridade exige simultaneamente:

1. preservação de manuscrito, metadados e revisão;
2. processamento local e nenhuma transmissão autoral;
3. melhor acerto contextual que uma consulta isolada por palavra;
4. ambiguidade e indeterminação honestas;
5. explicação útil em português brasileiro;
6. cobertura inventariada e auditável;
7. utilidade editorial humana;
8. convivência segura entre engines;
9. desempenho aceitável sem transformar CI em SLA;
10. nenhuma substituição automática.

### Baseline histórica do legado

A documentação v916 informa aproximadamente:

- Análise: `CLIQUES_PT` 1000 e `PLEONASMOS` 500;
- Voz: 10 gestos e 9 campos semânticos;
- RimaLab: enciclopédia 50 e `grammarWords` 348;
- Léxico: 1.350 sinônimos, 1.020+ definições e 110+ casos de polissemia;
- Contexto: 600+ entradas em 9 categorias;
- Sintaxe/Morfologia: 17/17, golden 91/0 e 2.045 formas verbais regulares no presente.

Esses valores são baseline de inventário, não prova automática de qualidade.

## E0 — baseline e corpus

Estado: **concluída**.

Corpus v1 com 14 casos únicos:

- `enquanto`, `por enquanto`, `enquanto isso`;
- `publica/pública`;
- `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

Resultado antes da correção:

- 8/14 casos únicos aprovados;
- seis lacunas repetidas em Chromium e Firefox;
- 264/276 execuções aprovadas.

## E1 — Léxico e Sintaxe contextual

Estado: **primeira tranche e estabilização inicial concluídas; fase aberta**.

Entregue:

- locuções `por enquanto` e `enquanto isso`;
- decisão sensível a diacrítico para `publica/pública`;
- particípio provável após auxiliar de voz passiva;
- leitura verbal provável após pronome sujeito;
- leitura adjetival pós-nominal com evidência nominal;
- resolvedor contextual puro em `src/engines/contextualLexicalResolver.ts`;
- controles negativos de locução, diacrítico, particípio, substantivação e sujeito nominal;
- objeto explícito à direita impedindo falso adjetivo em `larga/estreita`;
- notas explicando a evidência contextual;
- camada tipada no produto novo, sem alterar motor ou dados legados.

Resultado:

- baseline crítica preservada em 14/14 casos únicos;
- corpus integrado v1.1 em **16/16 casos únicos**;
- quatro controles diretos por navegador;
- matriz funcional em **144 cenários por navegador, 288 execuções**;
- nenhuma regressão nos 14 casos anteriores.

Logs:

- `logs/2026-07-29-m1-e0-e1-lexico-contextual.md`;
- `logs/2026-07-29-m1-e1-controles-negativos.md`.

Próximos passos de E1:

1. ampliar formas verbais, particípios e ordem marcada com positivos e negativos;
2. testar oralidade e regionalismos sem impor norma indevida;
3. desenhar uma experiência sintático-morfológica integrada e discreta;
4. não ampliar regex ou dicionário para esconder ambiguidade.

## E2 — profundidade lexical auditável

Estado: **baseline quantitativa concluída; integridade em execução**.

Infraestrutura:

- `scripts/audit-lexical-inventory.mjs` mede as estruturas efetivas;
- `scripts/audit-definition-duplicates.mjs` preserva linha, redação descartada e redação retida;
- `npm run audit:lexicon` é obrigatório na CI;
- relatórios completos entram no artefato;
- baseline resumida e decisões estão em `docs/audits/M1_E2_LEXICAL_INVENTORY.*`;
- log operacional: `logs/2026-07-29-m1-e2-inventario-lexical.md`.

Cobertura medida:

- sinônimos: 1.343 entradas, 7.766 alternativas brutas;
- definições: 936 efetivas, derivadas de 1.011 declarações;
- polissemia: 175 regras, 55 cartões explícitos de alternativas;
- Contexto: 606 entradas em nove categorias;
- léxico editorial local: 527 entradas completas;
- locuções: 95 brutas, 94 normalizadas;
- formas regulares no presente: 2.045 brutas, 2.028 normalizadas;
- RimaLab: enciclopédia 50 e `grammarWords` 407.

Achados prioritários:

1. **P0:** 69 grupos de chaves de definição repetidas, 75 declarações sobrescritas e 68 conflitos de redação;
2. **P1:** oito autorreferências de sinônimos após normalização;
3. **P1:** quatro aliases numéricos expostos como verbetes;
4. **P2:** `leitor_modelo` vazio;
5. **P2:** quatro textos de definição repetidos entre chaves;
6. **P2:** 124 regras de polissemia sem cartão explícito de alternativas.

### Estabilização do snapshot vivo

Durante a validação E2, o Firefox revelou que uma ferramenta podia analisar uma projeção React anterior ao conteúdo já presente no Tiptap. O caso observável foi o RimaLab responder “página vazia” diante de quatro versos visíveis e salvos.

Entregue:

- `src/editor/editorSnapshotBridge.ts`;
- publicação síncrona de JSON, texto e assinatura em `MassNotesEditor`;
- RimaLab, Contexto e Palavras/Léxico leem o snapshot vivo no clique;
- resultado assíncrono é descartado se a assinatura mudar;
- invalidade é acionada por edição real, não por renderização tardia.

Evidência funcional:

- cabeça `3c9c6d74e7638392a5bacfe4a2e82565e8af2583`;
- Mass Notes `30505264198`: auditor E2, build, 288/288, publicação, cache e smoke;
- Argila `30505264208` e coerência `30505264199`: verdes;
- artefato `mass-notes-tiptap-30505264198`.

Log:

- `logs/2026-07-29-m1-e2-snapshot-vivo-engines.md`.

Ordem E2 aprovada:

1. validar a cabeça documental exata;
2. registrar SHA, workflows e artefato no PR;
3. remover apenas `quica`, a duplicata comprovadamente idêntica, com teste;
4. agrupar os 68 conflitos por domínio editorial;
5. consolidar lotes pequenos comparando e, quando necessário, combinando redações;
6. corrigir autorreferências separando alias de busca e sinônimo real;
7. decidir o destino dos aliases `ode2`, `contemplar2`, `denso2`, `silencio2`;
8. preencher ou retirar `leitor_modelo` da cobertura;
9. impedir novas duplicatas por CI;
10. só então escolher expansão lexical brasileira fundamentada;
11. repetir auditoria e matriz integral após cada lote.

Critério: superar qualidade antes de aumentar volume. Nenhuma lista cresce sem revisão e regressão.

## E3 — qualidade das cinco engines

Estado: **planejada**.

- corpora de prosa, poesia, diálogo, ensaio, oralidade e regionalismos;
- falsos positivos e negativos por engine;
- comparação lado a lado com legado;
- avaliação humana de 1 a 5 em correção, especificidade, clareza, utilidade, respeito autoral e adequação brasileira;
- média mínima 4,0 e nenhuma engine abaixo de 3,5 para candidata superior.

## E4 — veredito de substituição

Estado: **bloqueado até E1–E3**.

Responder:

1. o produto novo iguala a cobertura útil do legado?
2. supera o legado em contexto e segurança?
3. quais promessas antigas devem ser aposentadas em vez de copiadas?
4. pode substituir integralmente o Escrevaral antigo?

## Dívidas de release fora do M1.0 linguístico

Continuam ativas:

- PWA/offline próprio;
- `page-flip` local;
- Prova de Autoria ou aposentadoria formal;
- DOCX e demais formatos conforme uso;
- zoom real, leitor de tela, tecnologias assistivas e dispositivos físicos;
- uso prolongado em hardware real.

M1.0 não apaga nem reclassifica essas dívidas.

## Governança

- PR permanece em rascunho;
- `main` e aplicação pública permanecem intactos;
- preview nunca recebe edição direta;
- cada correção linguística exige baseline e caso reproduzível;
- toda regra nova recebe casos positivos e negativos;
- engines acionadas pela interface usam o snapshot vivo do Tiptap;
- motores e bases legadas permanecem baseline enquanto a camada nova demonstra ganhos;
- CI completa após código e novamente após documentação final;
- SHA exato e workflows são registrados no PR sem commit autorreferente.

## Próxima ação autorizada

1. validar esta cabeça documental em 288/288;
2. registrar SHA, workflows e artefato no PR;
3. iniciar o lote seguro `quica` com teste de não regressão;
4. preparar a primeira bancada de conflitos editoriais;
5. não ampliar vocabulário e não iniciar Gate 14.
