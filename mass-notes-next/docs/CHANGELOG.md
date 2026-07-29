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

## Próximo lote proposto

- Gate 13: importação auditável do `.esc` legado;
- validar e pré-visualizar o arquivo antes de qualquer escrita;
- converter por adaptador isolado e importar somente como novas cópias;
- preservar `legacySourceId` para rastreabilidade sem reutilizar IDs;
- nenhuma sincronização, colaboração, hierarquia persistente ou promoção para `main`.
