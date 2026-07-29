# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade visual e as engines do Escrevaral/Mass Notes, substituindo apenas o editor artesanal por Tiptap/ProseMirror.

## Estado

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` (rascunho);
- preview: `https://raw.githack.com/rfmss/escrevaral/preview-mass-notes-tiptap/index.html`;
- aplicação pública, `main` e service worker: não alterados;
- engines integradas: Revisão, Espelho de Voz, Termos que pedem contexto, RimaLab e Palavras/Léxico;
- exportação estrutural: TXT, Markdown e HTML derivados do JSON Tiptap;
- cópia nativa: envelope versionado e restauração sempre como novas cópias;
- biblioteca organizada por busca, estado, favorito, tag e três ordenações;
- estado, favorito e tags da página ativa são editáveis pelo mesmo contrato de versão do manuscrito;
- mudanças somente editoriais preservam seleção, editor e leituras linguísticas válidas;
- fronteira de distribuição: a preview Vite possui pipeline próprio e não força versão global da aplicação pública;
- dependências: travadas por overrides, `package-lock.json` e `npm ci`;
- Gates 1 a 12 e Gate 10.5 de higiene: aprovados;
- matriz atual: 105 cenários por navegador, 210 execuções;
- próximo passo proposto: Gate 13, importação auditável do `.esc` legado sem sobrescrever documentos.

## Retomar o projeto

Leia nesta ordem:

1. `docs/PLAN.md` — fase atual e próximo passo proposto;
2. `docs/MEMORY.md` — decisões, contratos e limitações ativas;
3. `docs/CHANGELOG.md` — mudanças relevantes;
4. log mais recente em `docs/logs/`;
5. `docs/audits/GATE_6_9_POSITION_AUDIT.json` — evidência consolidada dos offsets;
6. `docs/design/BLUEPRINT_THEME.md` — contrato da skin atual;
7. documentação global em `../docs/_decisoes/` e `../docs/product/`.

Não comece um novo lote antes de revisar o plano e a memória. Um lote não está concluído sem atualizar documentação, testes e evidências.

## Executar

```bash
npm ci
npm run dev
```

Não use `npm install` como caminho normal: o lockfile é parte do contrato de reprodutibilidade.

## Validar

```bash
npm run build
npx playwright install chromium firefox
npm run test:e2e
```

A coerência de versões da aplicação pública é validada separadamente por:

```bash
python3 scripts/test-auditor-asset-version.py
python3 scripts/auditor-asset-version.py
```

## Organização da fonte

```text
src/
├── backup/       # envelope nativo, versão, validação e download
├── components/   # apresentação e interação React, inclusive metadados unitários
├── domain/       # contratos do documento
├── editor/       # Tiptap, ProseMirror, posições, seleção e decorations
├── engines/      # adaptadores tipados para engines legadas
├── export/       # serialização e entrega de formatos editoriais
├── library/      # consulta pura, filtros, tags e ordenação da biblioteca
├── pages/        # páginas especiais integradas
├── storage/      # IndexedDB, revisão condicional, conflitos e restauração
├── styles/       # camadas visuais por responsabilidade
└── transitions/  # transições explícitas entre superfícies
```

Serialização, download, consulta da biblioteca, seleção lexical e interface permanecem separados. Regras de formato, filtro ou engine não devem ser implementadas diretamente em `App.tsx` ou `RightRail.tsx`. O `App` apenas coordena a versão única do documento e distingue mutações de manuscrito de mutações editoriais.

## Princípios ativos

- Tiptap/ProseMirror cuida de documento, cursor, seleção e histórico;
- JSON Tiptap é a fonte estrutural; HTML, Markdown e texto são derivados;
- IndexedDB é a fonte principal dos documentos;
- engines entram somente por adaptadores tipados e não conhecem React, Tiptap ou DOM;
- análises são locais, heurísticas e nunca aplicam texto automaticamente;
- offsets linguísticos usam UTF-16 e nascem do Node ProseMirror real;
- decorations ficam fora do JSON autoral e são invalidadas somente quando o manuscrito muda;
- estado, favorito e tags integram a mesma `revision`, o mesmo autosave e o mesmo conflito do documento;
- não existe repositório paralelo, gravação direta de metadados ou merge silencioso entre abas;
- mutação de manuscrito inclui título, JSON Tiptap e texto derivado;
- mutação editorial inclui estado, favorito e tags;
- mutações editoriais não desmontam o editor nem apagam seleção ou leitura linguística ainda válida;
- favorito é alternado por comando explícito e unitário;
- tags são aplicadas atomicamente, deduplicadas por caixa e acentos, limitadas a 8 itens de 32 caracteres e removíveis uma a uma;
- exportar não altera JSON, título, histórico, seleção, revisão ou persistência;
- restauração rejeita envelopes inválidos antes de escrever e nunca reutiliza IDs;
- conflitos entre abas nunca sobrescrevem silenciosamente e podem preservar a versão local como cópia;
- a consulta da biblioteca vive em `src/library/libraryQuery.ts` e permanece pura;
- busca ignora caixa e acentos, sem modificar títulos, textos ou tags armazenados;
- filtros de busca, estado, favorito e tag são combináveis;
- ordenação por alteração, criação e título possui desempates previsíveis;
- filtros não trocam a página ativa, não descartam rascunho e não gravam no IndexedDB;
- design usa tokens semânticos e mantém o manuscrito como objeto principal;
- em até 1040 px os rails funcionam como drawers acessíveis;
- preview só é atualizada depois de gate verde e verificação pública;
- a entrada pública não é substituída por esta branch;
- o auditor global considera apenas JS/CSS distribuídos pela aplicação pública raiz;
- `mass-notes-next/` usa build Vite, hashes e preview próprios;
- PRs mistos continuam exigindo nova versão quando qualquer asset público real muda.

## Camadas visuais atuais

```text
src/styles/design-stabilization.css
src/styles/design-stabilization-mobile.css
src/styles/theme-blueprint.tokens.css
src/styles/theme-blueprint.css
src/styles/theme-blueprint-composition.css
src/styles/review-decorations.css
src/styles/export-panel.css
src/styles/lexical-panel.css
src/styles/library-organization.css
src/styles/document-metadata.css
src/styles/anatomy-host.css
src/styles/page-press-transition.css
```

Skins não contêm lógica de produto. Decorations linguísticas, leituras lexicais e recortes da biblioteca são projeções e não integram o JSON autoral.

## Limites atuais

Ainda não estão aprovados edição de metadados em massa, exclusão em massa, filtros salvos entre sessões, pastas ou coleções persistentes, taxonomia automática, sincronização em nuvem, colaboração, importador do `.esc` legado, DOCX, RTF, ePub, exportação múltipla, Obsidian ZIP, catálogo próprio de sinônimos, análise sintática de frases em Palavras, service worker/offline em nova sessão, Tauri, SQLite, paginação física, leitores de tela reais, teclado virtual real, tooltips inline, decorations de Voz/Contexto/RimaLab/Palavras, aplicação automática, substituição, correção em massa, merge campo a campo entre abas ou promoção para `main`.
