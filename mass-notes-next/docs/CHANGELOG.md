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
- restauração passa a criar UUIDs novos e nunca substituir documentos existentes;
- biblioteca reflete restaurações pelo BroadcastChannel existente;
- matriz final do lote ficou 172/172;
- build, navegadores, publicação, cache e verificação pública ficaram verdes.

## 2026-07-29

### Gate 10 — Palavras/Léxico

- integrada `lexical-engine.js` sem alterar sua fonte;
- incorporadas localmente `lexical-data.json` e `norma-data.json`;
- criado `src/editor/lexicalSelectionBridge.ts` para seleção durável;
- criado `src/components/LexicalPanel.tsx` com busca digitada e seleção Tiptap;
- adicionada a sétima aba do rail, `Palavras`;
- definição registrada passou a ser separada de classe contextual não comprovada;
- fallback sem registro e sem ocorrência passou a gerar ausência segura;
- criada folha isolada `src/styles/lexical-panel.css`;
- restaurada a suíte robusta do RimaLab;
- matriz elevada para 91 cenários por navegador, 182 execuções;
- workflow final `30422368445` aprovou build, navegadores, publicação, cache e preview.

### Gate 10.5 — fronteiras de distribuição

- o auditor global passou a considerar somente JS/CSS da aplicação pública raiz;
- `mass-notes-next/` foi reconhecido como aplicação Vite com build e preview próprios;
- mudanças isoladas não avançam artificialmente `ASSET_VERSION` ou `CACHE_NAME`;
- PRs mistos continuam auditando qualquer asset público real;
- adicionada regressão Python da fronteira;
- coerência, Argila e Mass Notes ficaram verdes sem criar versão pública falsa.

### Gate 11 — organização da biblioteca

- criada camada pura `src/library/libraryQuery.ts`;
- busca passou a combinar título, texto, tags e estado com normalização de caixa e acentos;
- adicionados filtros combináveis por estado, favorito e tag;
- adicionadas ordenações por alteração recente, criação recente e título A–Z;
- definidos desempates estáveis para datas, títulos repetidos e identidade;
- variantes equivalentes de tag passaram a receber rótulo canônico determinístico;
- cartões exibem favorito, estado, tempo relativo e até duas tags;
- adicionadas contagens de páginas visíveis e total;
- criado estado vazio explicativo com limpeza imediata dos filtros;
- página ativa permanece aberta e recebe aviso quando fica fora do recorte;
- filtros não escrevem no IndexedDB, não incrementam revisão e não interrompem rascunho ou autosave;
- criada folha `src/styles/library-organization.css`;
- adicionados sete cenários por navegador para combinações, ordenação, tags, estado vazio, rascunho, biblioteca extensa e mobile;
- nomes acessíveis ambíguos foram substituídos por contratos precisos;
- o ícone favorito foi separado do texto exato do título para preservar compatibilidade;
- canonicalização de tags deixou de depender da ordem de atualização;
- matriz elevada para 98 cenários por navegador, 196 execuções;
- workflow `30449369857` aprovou build, Chromium, Firefox, publicação, cache e verificação pública;
- candidata Argila `30449371552` e coerência `30449371768` também ficaram verdes.

### Gate 12 — metadados editoriais

- criado `src/components/DocumentMetadataEditor.tsx` na aba Pulso;
- criado `src/styles/document-metadata.css` com controles responsivos e chips removíveis;
- favorito passou a ser alternado explicitamente na página ativa;
- tags passaram a ser editadas como conjunto atômico separado por vírgulas;
- tags são deduplicadas por caixa e acentos, limitadas a 8 itens de 32 caracteres e removíveis uma a uma;
- estado, favorito e tags passaram a usar a mesma `revision`, o mesmo autosave, recuperação, IndexedDB e conflito do manuscrito;
- introduzido `DraftMutationKind` para distinguir efeitos de `manuscript` e `metadata` sem criar uma segunda persistência;
- título, JSON Tiptap e texto derivado continuam invalidando leituras linguísticas quando mudam;
- estado, favorito e tags preservam editor montado, seleção, posição e decorations ainda válidas;
- BroadcastChannel passou a anunciar o tipo da mutação junto de identidade e revisão;
- mensagens antigas sem tipo usam comparação defensiva do manuscrito;
- atualização remota limpa de metadados não reinicia o Tiptap;
- conflito com rascunho local continua exigindo escolha explícita e nunca faz merge silencioso;
- a mensagem de conflito passou a abranger escrita e organização editorial;
- adicionados sete cenários por navegador para favorito, tags, limites, não invalidação, atualização remota, conflito e mobile;
- a primeira execução revelou somente contratos de teste: wording antigo, suposição indevida sobre localStorage e seletor ambíguo de “Pronto”;
- fixtures passaram a descobrir a página ativa pelo estado real e seletores foram delimitados ao painel Pulso;
- matriz elevada para 105 cenários por navegador, 210 execuções;
- workflow `30452750643` aprovou build, Chromium, Firefox, publicação, cache e verificação pública;
- candidata Argila `30452747030` e coerência `30452747019` também ficaram verdes.

### Gate 13 — importação auditável do `.esc` legado

- inventariado o formato legado real em `vrda-engine.js`, `backup-engine.js` e `archive-engine.js`;
- criado `src/import/legacyEscImport.ts` para parsing, validação, checksum, conversão e prévia;
- aceitos somente envelopes `format: esc|vrda`, `schemaVersion: 1`, checksum FNV-1a e `payload.manuscripts` não vazio;
- seleção do arquivo passou a criar apenas um plano em memória, sem escrita;
- criada prévia com quantidade, formato, títulos, tipo legado, palavras e estado convertido;
- cancelamento descarta o plano sem alterar a biblioteca;
- IDs ausentes ou duplicados, versões futuras, checksum inválido, payload inválido e lotes acima do limite rejeitam todo o arquivo;
- texto legado é convertido para JSON Tiptap por `plainTextToContent`;
- estado, tags, favorito e datas são mapeados de modo conservador;
- criada `importLegacyDocumentsAsCopies` com uma única transação IndexedDB;
- documentos importados recebem UUID novo, `revision: 0`, sufixo `— importado` e `legacySourceId` preservado;
- nenhum documento existente é substituído;
- não há importação parcial, merge ou deduplicação silenciosa;
- criada folha `src/styles/legacy-import.css`;
- adicionados seis cenários por navegador para prévia, cancelamento, metadados, corrupção, reimportação e mobile;
- primeira matriz ficou 219/222 por duas expectativas antigas do Gate 9B e uma condição temporal isolada do Gate 12 no Firefox;
- todos os cenários novos do Gate 13 passaram na primeira execução;
- expectativa do Gate 9B foi atualizada para as três ações legítimas do painel;
- segunda matriz aprovou 222/222 sem alterar o contrato do importador;
- workflow `30457008816` aprovou build, Chromium, Firefox, publicação, cache e smoke público;
- candidata Argila `30457009394` e coerência `30457008762` ficaram verdes.

### M0.9 — Candidata Integrada do Escrevaral

- criada `docs/M0_9_AUDITORIA_OPERACIONAL.md` como memória executável e viva;
- criados relatório humano, JSON estruturado, log técnico e contrato global do milestone;
- registradas fases de jornada, engines, portabilidade, UIX, acessibilidade, privacidade, desempenho e release;
- criado placar vivo, registro de decisões, achados, evidências e matriz de paridade;
- definido que beta, lançamento público e substituição do produto antigo terão vereditos separados;
- Gate 14 foi suspenso até a conclusão da auditoria;
- nenhuma feature nova será iniciada antes do diagnóstico integrado;
- criada `tests/m0-9-integrated.spec.ts` com cinco jornadas por navegador;
- aprovadas escrita + metadados + recarga, cinco engines em sequência, filtros sem mutação, mobile 320/390 e escala de 100 páginas com documento acima de 100 mil caracteres;
- frase autoral sentinela não apareceu em URL ou corpo de requisição durante a sequência de engines;
- primeira execução ficou 231/232: todos os 10 casos M0.9 passaram e a única falha foi temporal em helper antigo do RimaLab;
- o produto não foi alterado; o helper passou a aceitar autosave já convergido para `Salvo` e manteve `Salvo` como estado final obrigatório;
- segunda execução aprovou 232/232;
- workflow `30463426867` aprovou build, Chromium, Firefox, publicação, cache e smoke público;
- candidata Argila `30463426847` e coerência `30463426811` ficaram verdes;
- nenhum P0 ou P1 foi aberto na primeira tranche;
- P2 provisórios: PWA/offline próprio ausente, Prova de Autoria ausente e paridade de exportação incompleta;
- nota provisória geral: 85/100;
- beta fechada recebeu `SHIP COM CONDIÇÕES` provisório; lançamento público e substituição integral permanecem `NO-SHIP`.

## Próximo trabalho autorizado

- executar segunda tranche M0.9;
- cobrir conflito real entre abas, portabilidade na mesma sessão e exportação antes da persistência;
- ampliar acessibilidade, rede, desempenho e corpus por engine;
- tomar decisões explícitas para P2;
- emitir veredito final com evidência na cabeça exata;
- manter PR em rascunho e `main` intacta.
