# CLARO — verniz Escrevaral índigo/sépia sobre o Blueprint

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — permanece aberto e em rascunho  
Baseline observada: `f80c669e5eb3858f1d1f48dc084fac3c2792d450`

## C — cenário observado

A fundação Tiptap já possuía uma skin Blueprint estável, com prancha ciano, papel quente, retícula técnica e geometria aprovada. O novo estudo de identidade do Escrevaral definiu um acabamento mais próprio: índigo mineral, sépia, creme impresso, fibra fina e tinta absorvida.

A solicitação não era redesenhar o produto. Era aproximar a interface da identidade encontrada com o menor impacto possível.

## L — limite e impacto

Risco principal: transformar uma mudança de verniz em reformulação estrutural e reabrir contratos já estabilizados.

Fronteiras protegidas:

- nenhum componente React alterado;
- nenhum DOM, grid, tamanho, breakpoint ou padding funcional alterado;
- nenhum código de Tiptap, engine, persistência, exportação ou seleção alterado;
- papel autoral claro preservado em `rgb(243, 238, 228)`;
- papel autoral noturno preservado em `rgb(32, 38, 40)`;
- pauta continua tileada em 48 px sem `repeating-linear-gradient` dentro da folha;
- tokens Blueprint originais continuam disponíveis para compatibilidade;
- `main`, aplicação pública, Gate 14 e service worker público permanecem intocados.

## A — arquitetura escolhida

Foi criada uma quarta camada visual, carregada por último:

```text
src/styles/theme-escrevaral-verniz.css
```

Ela introduz tokens próprios `--esv-*` e sobrescreve somente:

- fundos e filetes do ambiente;
- cor de acentos editoriais;
- textura de painéis e papel;
- intensidade de grão e halftone;
- acabamento do modo noite;
- sombras e tinta aparente.

O Blueprint continua responsável pela composição. O verniz atua como película reversível.

Arquivos tocados:

- `src/styles/theme-escrevaral-verniz.css`;
- `src/main.tsx`, somente para o import final;
- `tests/gate6-75-blueprint.spec.ts`;
- `docs/design/BLUEPRINT_THEME.md`;
- este breadcrumb.

## R — resultado reproduzível

Critérios adicionados à banca visual existente:

- tokens `--esv-indigo`, `--esv-sepia` e `--esv-cream` presentes;
- painéis com múltiplas camadas radiais de textura;
- papel com pelo menos duas camadas radiais, sem pauta baseada em `repeating-linear-gradient`;
- geometria desktop anterior preservada;
- controles continuam alcançáveis;
- breakpoints de 1440 a 320 px continuam dentro do viewport;
- contraste mínimo anterior continua obrigatório;
- Chromium e Firefox continuam mandatórios no workflow integral.

Reversão: remover o import de `theme-escrevaral-verniz.css` em `src/main.tsx`. Nenhuma migração ou compensação adicional é necessária.

## O — o que permanece aberto

- revisão humana das capturas em desktop, mobile e modo noite após a primeira matriz verde;
- ajuste fino de intensidade do grão somente se a captura real mostrar perda de legibilidade;
- eventual atualização da cor da barra do navegador pode ser avaliada separadamente, pois exigiria tocar a lógica de `theme-color` e não é necessária para provar o verniz;
- nenhuma promoção de preview deve ocorrer antes de build, Chromium, Firefox, cache e smoke verdes.

Status no momento do registro: **implementado; aguardando matriz integral e revisão das capturas**.
