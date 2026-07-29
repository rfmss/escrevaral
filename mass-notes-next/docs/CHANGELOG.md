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

## Próximo lote proposto

- Gate 12: edição segura e unitária de favorito e tags;
- definir revisão e conflito para mudanças exclusivamente de metadados antes do código;
- nenhuma edição ou exclusão em massa;
- nenhuma hierarquia persistente sem migração;
- nenhuma sincronização em nuvem ou colaboração;
- nenhuma promoção para `main`.
