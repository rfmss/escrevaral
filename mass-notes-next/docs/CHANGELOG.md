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

- integrada Revisão por adaptador;
- integrado Espelho de Voz com confiança, métricas e exercícios;
- integrados Termos que pedem contexto com linguagem não acusatória;
- integrado RimaLab com contratos distintos para prosa e verso;
- engines e bases originais permaneceram intactas;
- nenhuma análise recebeu aplicação automática.

## 2026-07-28

### Contrato de posições e revisão inline

- criado contrato UTF-16 sobre o Node ProseMirror real;
- auditados corpora brasileiros, Unicode, listas, títulos, `hardBreak` e blocos vazios;
- adicionadas decorations somente para ranges verificáveis da Revisão;
- criada navegação cartão → trecho e ocultação reversível;
- leituras antigas passam a desaparecer após edição ou troca de documento.

### Estabilização visual e Blueprint Tokon

- introduzidos tokens semânticos e contraste explícito;
- estabilizados toolbar, drawers, título móvel e modo noite;
- adotado o blueprint como ambiente e o manuscrito como objeto principal;
- preservados layout, Tiptap, engines e persistência.

### Anatomia do Livro

- preservado o original completo em `anatomia-original.html`;
- criado runtime leve e fiel gerado durante a CI;
- integrada abertura e retorno sem desmontar o editor;
- removido workflow obsoleto que escrevia diretamente na preview;
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
- incluído o rascunho ativo mesmo antes do próximo autosave;
- implementada validação integral de schema, versão, documentos, conteúdo Tiptap e IDs;
- arquivos inválidos passam a ser rejeitados antes de qualquer escrita;
- adicionada restauração transacional sempre como novas cópias;
- novos UUIDs impedem colisão e substituição de documentos existentes;
- biblioteca passa a refletir restaurações pelo BroadcastChannel existente;
- adicionados testes de envelope, estrutura, rejeição atômica, versão futura, IDs duplicados e mobile;
- primeira execução teve uma falha temporal antiga do Gate 7 no Firefox, com os testes novos verdes;
- repetição integral e cabeça documental final concluíram com 172/172 execuções aprovadas;
- build, Chromium, Firefox, publicação, cache e verificação pública ficaram verdes no workflow `30417867701`.

## 2026-07-29

### Gate 10 — Palavras/Léxico

- integrada `lexical-engine.js` sem alterar sua fonte;
- incorporadas localmente `lexical-data.json` e `norma-data.json` pelo adaptador tipado;
- criado `src/editor/lexicalSelectionBridge.ts` para manter o último recorte selecionado mesmo antes da abertura do painel;
- criado `src/components/LexicalPanel.tsx` com busca digitada e consumo da seleção Tiptap;
- adicionada a sétima aba do rail, `Palavras`;
- exibidos definição, classe, confiança, função, campo, ocorrências e leituras alternativas disponíveis;
- consultas permanecem locais e somente de leitura;
- removida qualquer oferta de substituição automática no corte novo;
- ocorrências passam a ser contadas com normalização de acentos;
- palavra registrada sem ocorrência pode preservar definição, mas perde classe contextual não comprovada;
- fallback morfológico sem registro e sem ocorrência passa a ser tratado como ausência segura;
- criada folha isolada `src/styles/lexical-panel.css`;
- adicionados cinco cenários por navegador para busca, seleção durável, não mutação, termo desconhecido e mobile;
- restaurada a suíte robusta do RimaLab após uma simplificação acidental durante a estabilização;
- documentWidth e rail permanecem sem overflow; diferenças subpixel de até 1 px são aceitas somente na caixa transformada;
- matriz elevada para 91 cenários por navegador, 182 execuções;
- workflow `30420965045` aprovou build, Chromium, Firefox, publicação, renovação de cache e verificação pública.

## Próximo lote proposto

- Gate 11: organização da biblioteca sobre estado, favorito, tags, busca e datas já existentes;
- nenhuma exclusão em massa neste corte;
- nenhuma hierarquia persistente sem contrato de migração;
- nenhuma aplicação automática de sugestões;
- nenhuma promoção para `main`.
