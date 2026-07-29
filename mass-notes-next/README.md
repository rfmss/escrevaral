# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade visual e as engines do Escrevaral/Mass Notes, substituindo apenas o editor artesanal por Tiptap/ProseMirror.

## Estado

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` (rascunho);
- preview: `https://raw.githack.com/rfmss/escrevaral/preview-mass-notes-tiptap/index.html`;
- aplicação pública, `main` e service worker: não alterados;
- engines integradas: Revisão, Espelho de Voz, Termos que pedem contexto, RimaLab e Palavras/Léxico;
- contrato de posições: aprovado e auditado com textos brasileiros reais;
- primeira decoration: aprovada somente para ranges verificáveis de pontuação da Revisão;
- navegação cartão → trecho e ocultação reversível: aprovadas;
- estabilização visual e tema Blueprint Tokon: aprovados sem alterar a fundação;
- Anatomia do Livro: integrada, publicada e preservada por runtime gerado na CI;
- exportação estrutural: TXT, Markdown e HTML gerados localmente a partir do JSON Tiptap;
- cópia nativa: envelope JSON versionado e restauração sempre como novas cópias;
- Palavras: consulta lexical local por seleção Tiptap ou busca digitada, sem substituir o manuscrito;
- fronteira de distribuição: a preview Vite possui pipeline próprio e não força versão global da aplicação pública;
- dependências: travadas por overrides, `package-lock.json` e `npm ci`;
- Gates 1 a 10 e Gate 10.5 de higiene: aprovados;
- matriz atual: 91 cenários por navegador, 182 execuções;
- próximo passo lógico: Gate 11, organização da biblioteca, sem ampliar a escrita ou aplicar sugestões automaticamente.

## Retomar o projeto

Leia nesta ordem:

1. `docs/PLAN.md` — fase atual e próximo passo autorizado;
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
├── components/   # apresentação e interação React
├── domain/       # contratos do documento
├── editor/       # Tiptap, ProseMirror, posições, seleção e decorations
├── engines/      # adaptadores tipados para engines legadas
├── export/       # serialização e entrega de formatos editoriais
├── pages/        # páginas especiais integradas
├── storage/      # IndexedDB, migração, conflitos e restauração transacional
├── styles/       # camadas visuais por responsabilidade
└── transitions/  # transições explícitas entre superfícies
```

Serialização, download, seleção lexical e interface permanecem separados. Novos formatos, versões de backup ou engines não devem ser implementados diretamente em `App.tsx` ou `RightRail.tsx`.

## Princípios ativos

- Tiptap/ProseMirror cuida de documento, cursor, seleção e histórico;
- JSON Tiptap é a fonte estrutural; HTML, Markdown e texto são derivados;
- IndexedDB é a fonte principal dos documentos;
- engines entram somente por adaptadores tipados;
- nenhuma engine conhece React, Tiptap ou DOM;
- análises são locais e resultados heurísticos são apresentados como hipóteses;
- Palavras usa um snapshot tipado e durável da seleção, identificado pelo documento e por posições ProseMirror;
- busca lexical sem ocorrência no texto não recebe classe contextual inventada;
- um fallback morfológico sem registro local não é apresentado como verbete existente;
- nenhuma consulta lexical altera seleção, JSON, histórico, autosave ou biblioteca;
- termos contextuais não são erros ou proibições e nunca são substituídos automaticamente;
- escansão do RimaLab é aproximação pedagógica, não veredito;
- prosa e verso recebem leituras diferentes;
- ausência de rima não é defeito;
- offsets do contrato usam UTF-16;
- identidade do documento e assinatura estrutural são verificações diferentes;
- blocos vazios e separadores virtuais são preservados;
- placeholders `ProseMirror-trailingBreak` e `ProseMirror-separator` não são texto autoral;
- consultas de posições não alteram o editor;
- apenas ocorrências posicionadas da Revisão podem receber decoration neste estágio;
- qualquer edição ou troca de documento remove marks obsoletas;
- alertas sem posição exata permanecem no painel;
- marcas podem ser ocultadas sem apagar a leitura;
- nenhuma action aplica, corrige ou substitui texto;
- exportar não altera JSON, título, histórico, seleção, revisão ou persistência;
- HTML exportado escapa conteúdo e só preserva links com protocolos permitidos;
- cópias nativas declaram schema e versão antes de qualquer documento;
- arquivos inválidos são rejeitados antes de abrir transação de escrita;
- restauração nunca reutiliza IDs nem substitui documentos existentes;
- conflito entre abas nunca sobrescreve silenciosamente;
- design usa tokens semânticos e não depende de herança acidental de cor;
- seleção e análise possuem cores diferentes;
- modo noite deve permanecer legível durante toda a troca de tema;
- em até 1040 px o manuscrito é prioritário e os rails funcionam como drawers;
- toolbar não depende de rolagem silenciosa no desktop;
- no tema Blueprint, o canvas é a prancha e a folha permanece papel quente;
- pauta do papel usa tile de 48 px, não `repeating-linear-gradient`;
- sombra difusa da folha permanece zerada para não reintroduzir o halo cinza;
- preview só é atualizada depois de gate verde e verificação pública;
- a entrada pública não é substituída por esta branch;
- o auditor global de versões considera apenas JS/CSS distribuídos pela aplicação pública raiz;
- `mass-notes-next/` usa build Vite, hashes e preview próprios e não exige avanço artificial de `ASSET_VERSION`;
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
src/styles/anatomy-host.css
src/styles/page-press-transition.css
```

As skins não contêm lógica de produto. Decorations linguísticas e leituras lexicais são projeções efêmeras e não integram o JSON do documento.

## Limites atuais

Ainda não estão aprovados importador do `.esc` legado, DOCX, RTF, ePub, exportação múltipla, Obsidian ZIP, catálogo próprio de sinônimos no painel novo, análise sintática de frases em Palavras, service worker/offline em nova sessão, Tauri, SQLite, paginação física, leitores de tela reais, teclado virtual real, tooltips inline, decorations de Voz/Contexto/RimaLab/Palavras, aplicação automática, substituição, correção em massa ou promoção para `main`.
