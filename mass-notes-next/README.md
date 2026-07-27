# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade visual do Escrevaral/Mass Notes e substitui o editor artesanal por Tiptap/ProseMirror.

## Executar

```bash
npm install
npm run dev
```

## Gates

```bash
npm run build
npx playwright install chromium
npm run test:e2e
```

A aplicação pública da raiz não é alterada. As engines existentes são incorporadas por adaptadores; a primeira integração real é a Revisão.
