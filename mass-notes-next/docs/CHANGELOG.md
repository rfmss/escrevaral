# Changelog técnico — Mass Notes Next

As entradas registram mudanças de arquitetura, produto e qualidade. Logs detalhados permanecem em `docs/logs/`.

## 2026-07-27

### Fundação e confiabilidade

- adotados React, TypeScript, Vite e Tiptap/ProseMirror;
- criado armazenamento IndexedDB com revisão condicional;
- implementados autosave, recuperação emergencial e preservação de conflitos entre abas;
- isolado histórico por documento;
- cobertos Chromium e Firefox, paste externo, listas, seleção e drawers acessíveis;
- criada preview estática publicada somente após gate verde.

### Engines locais

- integradas Revisão, Espelho de Voz, Contexto e RimaLab por adaptadores;
- engines e bases originais permaneceram intactas;
- nenhuma análise recebeu aplicação automática.

## 2026-07-28

### Posições, revisão inline e visual

- criado contrato UTF-16 sobre o Node ProseMirror real;
- auditados corpora brasileiros, Unicode, listas, títulos, `hardBreak` e blocos vazios;
- adicionadas decorations somente para ranges verificáveis da Revisão;
- criada navegação cartão → trecho e ocultação reversível;
- estabilizados contraste, toolbar, drawers, título móvel e modo noite;
- adotado o Blueprint Tokon sem alterar editor, engines ou persistência.

### Anatomia do Livro

- preservado o original completo em `anatomia-original.html`;
- criado runtime leve e fiel gerado durante a CI;
- integrada abertura e retorno sem desmontar o editor;
- publicação passou a verificar assets e endereço público.

### Gate 9A — exportação estrutural

- criada camada pura `src/export/documentExport.ts`;
- adicionados TXT, Markdown e HTML derivados do JSON Tiptap;
- preservados títulos, ênfases, links, citações e listas conforme cada formato;
- HTML passou a escapar conteúdo e restringir protocolos;
- exportar foi comprovado como operação sem efeito sobre documento ou persistência;
- matriz elevada para 80 cenários por navegador, 160 execuções.

### Gate 9B — cópia nativa

- criado `src/backup/nativeBackup.ts`;
- definido envelope `escrevaral.mass-notes-next.backup`, versão `1`;
- adicionada cópia completa da biblioteca em `*.esc.json`;
- implementada validação integral antes de qualquer escrita;
- restauração cria UUIDs novos e nunca substitui documentos existentes;
- biblioteca reflete restaurações pelo BroadcastChannel existente;
- matriz final 172/172;
- build, navegadores, publicação, cache e verificação pública verdes.

## 2026-07-29

### Gate 10 — Palavras/Léxico

- integrada `lexical-engine.js` sem alterar sua fonte;
- incorporadas localmente `lexical-data.json` e `norma-data.json`;
- criado `src/editor/lexicalSelectionBridge.ts` para seleção durável;
- criado `src/components/LexicalPanel.tsx` com busca digitada e seleção Tiptap;
- adicionada a sétima aba do rail, `Palavras`;
- definição registrada separada de classe contextual não comprovada;
- fallback sem registro e sem ocorrência gera ausência segura;
- restaurada a suíte robusta do RimaLab;
- matriz elevada para 91 cenários por navegador, 182 execuções;
- workflow `30422368445` aprovou build, navegadores, publicação, cache e preview.

### Gate 10.5 — fronteiras de distribuição

- auditor global passou a considerar somente JS/CSS da aplicação pública raiz;
- `mass-notes-next/` reconhecido como aplicação Vite com build e preview próprios;
- mudanças isoladas não avançam artificialmente `ASSET_VERSION` ou `CACHE_NAME`;
- PRs mistos continuam auditando qualquer asset público real;
- adicionada regressão Python da fronteira;
- coerência, Argila e Mass Notes verdes sem versão pública falsa.

### Gate 11 — organização da biblioteca

- criada camada pura `src/library/libraryQuery.ts`;
- busca em título, texto, tags e estado com normalização de caixa e acentos;
- filtros combináveis por estado, favorito e tag;
- ordenações por alteração, criação e título;
- desempates estáveis;
- rótulo canônico determinístico para tags equivalentes;
- cartões com favorito, estado, tempo relativo e tags;
- contagens e estado vazio explicativo;
- página ativa permanece aberta fora do recorte;
- filtros não escrevem no IndexedDB nem interrompem rascunho/autosave;
- matriz elevada para 98 cenários por navegador, 196 execuções;
- Mass Notes `30449369857`, Argila `30449371552` e coerência `30449371768` verdes.

### Gate 12 — metadados editoriais

- criado `DocumentMetadataEditor` na aba Pulso;
- favorito explícito e tags como conjunto atômico;
- tags deduplicadas, limitadas e removíveis;
- estado, favorito e tags usam a mesma revisão, autosave, recuperação, IndexedDB e conflito;
- `DraftMutationKind` distingue efeitos de manuscrito e metadados;
- mudanças editoriais preservam editor, seleção e leituras válidas;
- BroadcastChannel anuncia tipo de mutação;
- atualização remota limpa de metadados não reinicia Tiptap;
- conflito continua explícito, sem merge silencioso;
- matriz elevada para 105 cenários por navegador, 210 execuções;
- Mass Notes `30452750643`, Argila `30452747030` e coerência `30452747019` verdes.

### Gate 13 — importação auditável do `.esc` legado

- inventariado formato real em `vrda-engine.js`, `backup-engine.js` e `archive-engine.js`;
- criado `src/import/legacyEscImport.ts` para parsing, validação, checksum, conversão e prévia;
- aceitos envelopes `format: esc|vrda`, `schemaVersion: 1`, checksum FNV-1a e `payload.manuscripts` não vazio;
- seleção cria plano em memória, sem escrita;
- prévia com quantidade, formato e documentos;
- cancelamento sem efeito;
- IDs ausentes/duplicados, versão futura, checksum/payload inválidos e limite excedido rejeitam o lote;
- texto legado convertido para JSON Tiptap;
- estado, tags, favorito e datas mapeados conservadoramente;
- transação única com UUIDs novos, `revision: 0`, `— importado` e `legacySourceId`;
- sem substituição, importação parcial, merge ou deduplicação silenciosa;
- matriz elevada para 111 cenários por navegador, 222 execuções;
- Mass Notes `30457008816`, Argila `30457009394` e coerência `30457008762` verdes.

### M0.9 — Candidata Integrada do Escrevaral

#### Memória e governança

- criada `docs/M0_9_AUDITORIA_OPERACIONAL.md` como memória executável viva;
- criados relatório humano, JSON estruturado, logs e contrato global;
- registradas fases de jornada, engines, portabilidade, UIX, acessibilidade, privacidade, desempenho e release;
- criado placar, registro de decisões, achados, evidências e paridade;
- beta, lançamento público e substituição recebem vereditos separados;
- Gate 14 suspenso;
- nenhuma feature nova antes do diagnóstico integrado.

#### Tranche 1

- criada `tests/m0-9-integrated.spec.ts` com cinco jornadas por navegador;
- aprovadas escrita/metadados/recarga, cinco engines em sequência, filtros sem mutação, mobile 320/390 e escala de 100 páginas com documento acima de 100 mil caracteres;
- sentinela autoral ausente de URL e corpo de requisição;
- helpers temporais de autosave estabilizados sem alterar o produto;
- matriz 116 cenários por navegador, 232 execuções;
- Mass Notes `30463426867`, Argila `30463426847` e coerência `30463426811` verdes.

#### Tranche 2

- suíte ampliada para oito jornadas por navegador;
- conflito misto real entre manuscrito e metadados preserva documento remoto e cópia local favorita;
- exportação Markdown usa título e texto atuais mesmo antes do autosave convergir;
- cópia nativa, restauração e `.esc` legado coexistem na mesma sessão;
- cancelamento legado permanece sem escrita;
- página ativa permanece aberta durante restauração/importação;
- preferência ativa compartilhada entre abas registrada como P3, sem perda de dados;
- removido salvamento preliminar redundante de fixture de exportação;
- cenário de falha simulada do RimaLab passou a estabilizar a fonte antes da leitura;
- produto não foi alterado por estabilizações de teste;
- matriz elevada para 119 cenários por navegador, 238 execuções;
- cabeça funcional `2a4333337a04b73a6c034b8fd35bc582994a114b`;
- Mass Notes `30467582850`: 238/238, publicação, cache e smoke público;
- Argila `30467583011` e coerência `30467584508`: verdes;
- nenhum P0 ou P1 aberto;
- P2: PWA/offline próprio, Prova de Autoria e paridade avançada de exportação;
- P3: preferências da biblioteca e documento ativo compartilhado entre abas;
- nota provisória geral elevada para 87/100;
- beta fechada `SHIP COM CONDIÇÕES`; lançamento público e substituição integral `NO-SHIP`, todos provisórios.

## Próximo trabalho autorizado

- auditoria heurística manual nas seis larguras;
- zoom, movimento reduzido, tecnologias assistivas e dispositivos reais;
- observação integral de rede;
- recuperação emergencial integrada;
- sessão prolongada e medição de latência/memória;
- corpus ampliado por engine;
- decisões explícitas para P2;
- veredito final com evidência na cabeça exata;
- manter PR em rascunho e `main` intacta.
