# Changelog técnico — Mass Notes Next

As entradas registram mudanças de arquitetura, produto e qualidade. Commits mecânicos podem ser omitidos.

## 2026-07-27

### Fundação Tiptap

- criada branch experimental a partir da `main`;
- adotados React, TypeScript, Vite e Tiptap/ProseMirror;
- transplantado look and feel editorial do Mass Notes;
- criado armazenamento IndexedDB com revisão condicional;
- implementada preservação de conflitos entre abas;
- integrada engine real de Revisão por adaptador;
- isolado histórico do editor por documento.

### Gate 2

- adicionados Chromium e Firefox;
- cobertos paste representativo de Word/Google Docs, listas e seleção;
- validada recuperação antes do autosave;
- validado fluxo completo de conflito;
- corrigido stacking do overlay móvel;
- implementados foco inicial, contenção, Escape e retorno do foco;
- criada preview estática publicada somente após gate verde.

### Limpeza visual

- removidos fita preta, adesivo vermelho e CTA flutuante sobre o papel;
- ações movidas para o rail contextual;
- adicionada regressão contra o retorno desses ornamentos.

### Resiliência documental

- criada memória operacional dentro de `mass-notes-next/docs/`;
- instituídos plano vivo, memória consolidada, changelog e logs por lote;
- documentação passou a integrar formalmente a definição de pronto.

### Em andamento

- Gate 3: integração do Espelho de Voz por adaptador.