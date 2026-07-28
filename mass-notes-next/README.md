# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade visual e as engines do Escrevaral/Mass Notes, substituindo apenas o editor artesanal por Tiptap/ProseMirror.

## Estado

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` (rascunho);
- preview: `https://raw.githack.com/rfmss/escrevaral/preview-mass-notes-tiptap/index.html`;
- aplicação pública, `main` e service worker: não alterados;
- engines integradas: Revisão, Espelho de Voz, Termos que pedem contexto e RimaLab;
- contrato de posições: aprovado sem decorations;
- Gates 1 a 6: aprovados em Chromium e Firefox;
- matriz atual: 40 cenários por navegador, 80 execuções;
- próximo passo: avaliação manual dos offsets antes de qualquer marcação inline.

## Retomar o projeto

Leia nesta ordem:

1. `docs/PLAN.md` — fase atual e próximo passo autorizado;
2. `docs/MEMORY.md` — decisões, contratos e limitações ativas;
3. `docs/CHANGELOG.md` — mudanças relevantes;
4. log mais recente em `docs/logs/`;
5. documentação global em `../docs/_decisoes/` e `../docs/product/`.

Não comece um novo lote antes de revisar o plano e a memória. Um lote não está concluído sem atualizar documentação, testes e evidências.

## Executar

```bash
npm install
npm run dev
```

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
- consultas de posições não alteram o editor;
- nenhuma engine altera o manuscrito neste estágio;
- conflito entre abas nunca sobrescreve silenciosamente;
- preview só é atualizada depois de gate verde;
- a entrada pública não é substituída por esta branch.

## Limites atuais

Ainda não estão aprovados service worker/offline em nova sessão, Tauri, SQLite, DOCX, paginação física, leitores de tela reais, teclado virtual real, decorations inline, navegação issue–trecho, aplicação automática de alternativas ou promoção para `main`.