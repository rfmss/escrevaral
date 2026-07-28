# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade visual e as engines do Escrevaral/Mass Notes, substituindo apenas o editor artesanal por Tiptap/ProseMirror.

## Estado

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` (rascunho);
- preview: `https://raw.githack.com/rfmss/escrevaral/preview-mass-notes-tiptap/index.html`;
- aplicação pública, `main` e service worker: não alterados;
- engines integradas: Revisão, Espelho de Voz, Termos que pedem contexto e RimaLab;
- contrato de posições: aprovado e auditado com textos brasileiros reais;
- primeira decoration: aprovada somente para ranges verificáveis de pontuação da Revisão;
- navegação cartão → trecho e ocultação reversível: aprovadas;
- estabilização visual: aprovada sem redesign;
- tema Blueprint Tokon: aprovado sem alterar layout;
- dependências: travadas por overrides, `package-lock.json` e `npm ci`;
- Gates 1 a 7: aprovados em Chromium e Firefox;
- matriz atual: 67 cenários por navegador, 134 execuções;
- próximo passo: avaliação manual do Gate 7, sem iniciar novo gate automaticamente.

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

## Princípios ativos

- Tiptap/ProseMirror cuida de documento, cursor, seleção e histórico;
- IndexedDB é a fonte principal dos documentos;
- engines entram somente por adaptadores tipados;
- nenhuma engine conhece React, Tiptap ou DOM;
- análises são locais e resultados heurísticos são apresentados como hipóteses;
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
- a entrada pública não é substituída por esta branch.

## Camadas visuais atuais

```text
src/styles/design-stabilization.css
src/styles/design-stabilization-mobile.css
src/styles/theme-blueprint.tokens.css
src/styles/theme-blueprint.css
src/styles/theme-blueprint-composition.css
src/styles/review-decorations.css
```

As skins não contêm lógica de produto. A decoration linguística é projeção efêmera e não integra o JSON do documento.

## Limites atuais

Ainda não estão aprovados service worker/offline em nova sessão, Tauri, SQLite, DOCX, paginação física, leitores de tela reais, teclado virtual real, tooltips inline, decorations de Voz/Contexto/RimaLab, aplicação automática, substituição, correção em massa ou promoção para `main`.
