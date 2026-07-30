# Changelog técnico — Mass Notes Next

As entradas registram mudanças de arquitetura, produto e qualidade. Logs detalhados permanecem em `docs/logs/`.

## 2026-07-27

### Fundação e confiabilidade

- adotados React, TypeScript, Vite e Tiptap/ProseMirror;
- criado armazenamento IndexedDB com revisão condicional;
- implementados autosave, recuperação emergencial, histórico por documento e conflitos entre abas;
- cobertos Chromium e Firefox, paste externo, listas, seleção e drawers acessíveis;
- criada preview estática publicada somente após gate verde.

### Engines locais iniciais

- integradas Revisão, Espelho de Voz, Contexto e RimaLab por adaptadores tipados;
- engines e bases originais permaneceram intactas;
- nenhuma análise recebeu aplicação automática.

## 2026-07-28

### Posições, revisão inline e visual

- criado contrato UTF-16 sobre o Node ProseMirror real;
- auditados corpora brasileiros, Unicode, listas, títulos, `hardBreak` e blocos vazios;
- adicionadas decorations somente para ranges verificáveis;
- criada navegação cartão → trecho e ocultação reversível;
- estabilizados contraste, toolbar, drawers, título móvel e modo noite;
- adotado o Blueprint Tokon sem alterar editor, engines ou persistência.

### Anatomia do Livro

- preservado o original completo em `anatomia-original.html`;
- criado runtime leve e fiel durante a CI;
- integrada abertura e retorno sem desmontar o editor;
- publicação passou a verificar HTML, imagens e endereço público.

### Gate 9A — exportação estrutural

- criada camada pura `src/export/documentExport.ts`;
- adicionados TXT, Markdown e HTML derivados do JSON Tiptap;
- preservados títulos, ênfases, links, citações e listas conforme cada formato;
- HTML escapa conteúdo e restringe protocolos;
- exportação comprovada sem efeito sobre documento ou persistência;
- matriz 160/160.

### Gate 9B — cópia nativa

- criado `src/backup/nativeBackup.ts`;
- definido envelope `escrevaral.mass-notes-next.backup`, versão `1`;
- adicionada cópia completa da biblioteca em `*.esc.json`;
- restauração valida tudo, cria UUIDs novos e nunca substitui documentos;
- biblioteca reflete restaurações pelo BroadcastChannel;
- matriz 172/172, publicação e smoke verdes.

## 2026-07-29

### Gate 10 — Palavras/Léxico

- integrada `lexical-engine.js` sem alterar sua fonte;
- incorporadas localmente `lexical-data.json` e `norma-data.json`;
- criado `lexicalSelectionBridge` para seleção durável;
- criada a sétima aba `Palavras` com busca digitada e seleção Tiptap;
- definição registrada foi separada de classe contextual não comprovada;
- fallback sem registro e sem ocorrência passou a gerar ausência segura;
- matriz 182/182.

### Gate 10.5 — fronteiras de distribuição

- auditor global passou a considerar somente JS/CSS da aplicação pública raiz;
- `mass-notes-next/` reconhecido como aplicação Vite com build e preview próprios;
- mudanças isoladas deixaram de avançar versões públicas artificialmente;
- PRs mistos continuam auditando assets públicos reais.

### Gate 11 — organização da biblioteca

- criada camada pura `src/library/libraryQuery.ts`;
- busca em título, texto, tags e estado com normalização de caixa e acentos;
- filtros combináveis por estado, favorito e tag;
- ordenações por alteração, criação e título com desempates estáveis;
- tags equivalentes recebem rótulo canônico determinístico;
- página ativa permanece aberta fora do recorte;
- filtros não escrevem no IndexedDB nem interrompem autosave;
- matriz 196/196.

### Gate 12 — metadados editoriais

- criado `DocumentMetadataEditor` na aba Pulso;
- favorito e tags entram no mesmo documento e revisão;
- tags são deduplicadas, limitadas e removíveis;
- `DraftMutationKind` distingue manuscrito e metadados;
- mudanças editoriais preservam editor, seleção e leituras válidas;
- conflito permanece explícito, sem merge silencioso;
- matriz 210/210.

### Gate 13 — importação auditável do `.esc` legado

- inventariado o formato real em `vrda-engine.js`, `backup-engine.js` e `archive-engine.js`;
- criado `src/import/legacyEscImport.ts`;
- aceitos `format: esc|vrda`, `schemaVersion: 1`, checksum FNV-1a e `payload.manuscripts`;
- seleção cria prévia em memória; cancelamento não grava;
- lote inválido é rejeitado integralmente;
- texto legado é convertido para JSON Tiptap;
- importação usa transação única, UUIDs novos, `revision: 0`, sufixo `— importado` e `legacySourceId`;
- sem substituição, importação parcial, merge ou deduplicação silenciosa;
- matriz 222/222.

### M0.9 — auditoria integrada

#### Governança

- criada `M0_9_AUDITORIA_OPERACIONAL.md` como memória executável viva;
- criados relatório humano, JSON estruturado, logs e contrato global;
- beta, lançamento público e substituição passaram a receber vereditos separados;
- Gate 14 e novas features foram suspensos durante a auditoria.

#### Tranche 1

- criada `tests/m0-9-integrated.spec.ts`;
- aprovadas escrita/metadados/recarga, cinco engines em sequência, filtros sem mutação, mobile 320/390 e escala de 100 páginas com documento acima de 100 mil caracteres;
- sentinela autoral ausente de URL e corpo de requisição;
- matriz 232/232.

#### Tranche 2

- adicionados conflito misto preservando documento remoto e cópia local;
- exportação passou a provar uso do rascunho atual antes do autosave;
- cópia nativa, restauração e `.esc` legado foram combinados na mesma sessão;
- preferência ativa compartilhada entre abas foi registrada como P3, sem perda de dados;
- matriz 238/238.

#### Tranche 3

- criada `tests/m0-9-nonfunctional.spec.ts`;
- auditadas seis larguras entre 320 e 1440 px;
- layout CSS equivalente a zoom de 200% permaneceu utilizável;
- `prefers-reduced-motion` foi reconhecido nos dois navegadores;
- rede integral não transmitiu texto autoral;
- descoberta dependência `page-flip@2.0.7` do `unpkg`, registrada como P2;
- recuperação emergencial preservou ID, avançou revisão e limpou envelope;
- doze ciclos não produziram erro ou crescimento de DOM;
- corpus separado das cinco engines preservou snapshot semântico;
- cabeça funcional inicial 252/252.

#### Errata e consolidação

- duas fixtures antigas foram consolidadas após a cabeça funcional da tranche 3;
- matriz consolidada passou a 124 cenários por navegador, 248 execuções;
- `M0_9_ERRATA_MATRIZ.md` tornou-se referência autoritativa;
- cabeça `9eaa437e94a72d6095772090fb9b28a0e1066404` passou 248/248 após repetição na mesma cabeça.

#### Decisões e encerramento

- PWA/offline próprio: aceito apenas para beta online; bloqueia lançamento público;
- `page-flip` externo: aceito apenas para beta online; deve ser local antes de lançamento/offline;
- Prova de Autoria: não bloqueia beta, mas bloqueia substituição integral;
- exportação avançada: não bloqueia beta; DOCX é o primeiro candidato posterior por evidência de uso;
- M0.9 encerrou como auditoria técnica e decisória;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público e substituição integral: `NO-SHIP`;
- PR permaneceu em rascunho e `main` intacta.

### M1.0 — Engines superiores ao Escrevaral legado

#### Programa e contrato

- criado `docs/M1_0_ENGINES_SUPERIORES.md`;
- criado contrato global `docs/product/MASS_NOTES_ENGINES_SUPERIORES.md`;
- superioridade passou a exigir preservação, privacidade, acerto contextual, indeterminação honesta, explicação, cobertura auditável e utilidade humana;
- volume de regras ou declaração de “100%” deixou de ser aceito como prova isolada;
- motores e bases legadas permanecem baseline preservada.

#### E0 — corpus e baseline

- criado corpus com 14 casos únicos e teste independente por ambiguidade e navegador;
- baseline aprovou 8/14 casos únicos;
- seis lacunas apareceram nos dois navegadores;
- baseline terminou com 264/276 execuções aprovadas e publicação bloqueada.

#### E1 — primeira camada contextual

- `lexicalAdapter.ts` recebeu camada contextual tipada sem alterar dados legados;
- adicionadas locuções, decisão sensível a diacrítico, particípio, pronome sujeito e adjetivo pós-nominal;
- corpus passou de 8/14 para 14/14 casos únicos;
- matriz passou para 276/276;
- superioridade comprovada apenas nas seis fronteiras corrigidas.

#### E1 — controles negativos e isolamento do resolvedor

- criado `src/engines/contextualLexicalResolver.ts` como módulo puro;
- locuções só recebem override quando a expressão exata está presente;
- controles preservam `pública`, `ficou preso` e `os presos`;
- sujeito nominal seguido de objeto explícito passou a favorecer verbo antes do adjetivo pós-nominal;
- adicionados `A menina larga a mochila` e `O corredor estreita os olhos`;
- criado `tests/m1-contextual-resolver.spec.ts`;
- corpus integrado passou para 16/16 casos únicos;
- matriz passou para 288/288;
- nenhuma regressão nos 14 casos anteriores.

#### E2 — inventário lexical reproduzível

- criado `scripts/audit-lexical-inventory.mjs` para executar e contar as estruturas efetivas;
- criado `scripts/audit-definition-duplicates.mjs` para preservar linha, redação descartada e redação retida;
- `npm run audit:lexicon` passou a integrar a CI Mass Notes;
- relatórios JSON e Markdown passaram a compor o artefato;
- snapshots foram versionados em `docs/audits/M1_E2_LEXICAL_INVENTORY.*`;
- medidos 1.343 sinônimos, 936 definições, 175 polissemias, 606 entradas contextuais e 2.045 formas regulares brutas;
- identificados 69 grupos de definição repetidos, 75 declarações sobrescritas e 68 conflitos de redação;
- apenas `quica` é duplicata idêntica;
- encontradas oito autorreferências de sinônimos e quatro aliases numéricos expostos;
- `leitor_modelo` foi identificado como definição vazia;
- 124 regras de polissemia não possuem cartão explícito de alternativas;
- expansão lexical foi bloqueada até estabilização mínima da integridade.

#### Estabilização da prova de exportação

- duas execuções E2 passaram auditoria e build, mas terminaram 287/288 por timeout do mesmo helper do Gate 9 no Firefox;
- a falha migrou de HTML para TXT, confirmando instabilidade temporal e não regressão de produto;
- a prova continua lendo o IndexedDB e exigindo a mesma frase;
- somente a janela de convergência foi ampliada de 8 para 20 segundos, com intervalos explícitos.

## Próximo trabalho autorizado

- validar a cabeça documental e a estabilização em 288/288;
- consolidar `quica` com teste de não regressão;
- revisar os 68 conflitos em lotes editoriais pequenos;
- corrigir autorreferências separando aliases de sinônimos;
- decidir o destino das quatro chaves técnicas;
- não ampliar vocabulário, não iniciar Gate 14 e manter `main` intacta.
