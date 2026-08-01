# M1 E2 — deduplicação segura de `quica`

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado de entrada: **teste de regressão vermelho contra duplicata idêntica conhecida**

> **Eva Chara, entre em banca.**

## C — Cenário observado

O bloco `DEFINICOES` de `lexical-engine.js` contém duas declarações consecutivas e textualmente idênticas para a chave `quica`:

```js
"quica": "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual.",
"quica": "Advérbio de dúvida equivalente a 'talvez'. Literário e formal; mais raro que 'talvez' no português brasileiro atual.",
```

A semântica de objeto JavaScript mantém apenas a última ocorrência. Portanto, a primeira declaração não acrescenta cobertura nem informação editorial.

Baseline reproduzível:

- 1.011 declarações brutas;
- 936 chaves efetivas;
- 69 grupos de chaves repetidas;
- 75 declarações sobrescritas;
- 1 grupo idêntico: `quica`;
- 68 grupos conflitantes.

O teste de produto `tests/m1-e2-quica-regression.spec.ts` preserva a definição efetiva e a não mutação do manuscrito. O teste de fonte `tests/m1-e2-quica-source.spec.ts` exige uma única declaração literal no arquivo auditado.

## L — Limite e impacto

Este lote não revisa conflitos editoriais.

Não alterar:

- a redação de `quica`;
- qualquer outra definição;
- sinônimos, aliases ou regras de polissemia;
- componentes, interface, seleção ou persistência;
- comportamento da engine além da remoção da declaração morta;
- `main`, aplicação pública ou service worker público.

A auditoria e o adaptador Mass Notes consomem a fonte única `lexical-engine.js`. Não existe uma segunda cópia versionada dessa engine dentro de `mass-notes-next`.

## A — Ação mínima

1. remover uma única ocorrência idêntica de `quica` em `lexical-engine.js`;
2. preservar byte a byte a redação retida;
3. regenerar a auditoria lexical;
4. atualizar os snapshots documentais;
5. executar os testes específicos, auditoria, build e matriz integral;
6. registrar os novos números sem reclassificar os 68 conflitos.

Resultado esperado:

- 1.010 declarações brutas;
- 936 chaves efetivas;
- 68 grupos repetidos;
- 74 declarações sobrescritas;
- 0 grupos idênticos;
- 68 grupos conflitantes.

## R — Resultado exigido

O lote só fecha se:

- `quica` existir exatamente uma vez na fonte;
- a definição efetiva permanecer idêntica;
- `npm run audit:lexicon` ficar verde;
- os testes de fonte e produto ficarem verdes;
- build e matriz integral permanecerem verdes;
- nenhuma preview vermelha for publicada.

## O — O que permanece aberto

- 68 conflitos editoriais de definições;
- oito autorreferências de sinônimos;
- quatro aliases técnicos;
- `leitor_modelo` vazio;
- cartões de polissemia ausentes;
- expansão lexical bloqueada.

## Parecer Eva — entrada

- dimensão: Léxico e polissemia, nota 6,5;
- ganho permitido: integridade mecânica e auditabilidade;
- ganho não permitido: elevar a nota por remover uma duplicata idêntica;
- falsos positivos/negativos linguísticos: não se aplicam, pois o runtime efetivo não muda;
- decisão: `PROSSEGUIR COM CONDIÇÕES`;
- condição principal: não tocar nos 68 conflitos neste lote.
