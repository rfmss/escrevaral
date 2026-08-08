# Mass Notes Tiptap — Gate 6.75: Blueprint Tokon

## Situação

**Aprovado para continuidade experimental em 2026-07-28.**

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` (rascunho);
- workflow funcional: `30333192558`;
- matriz: 50 cenários em Chromium e 50 em Firefox;
- total: 100 execuções;
- preview: `preview-mass-notes-tiptap`;
- `main`, aplicação pública e service worker: intactos.

Esta aprovação não autoriza merge, lançamento, decorations, marcações inline ou alteração automática do manuscrito.

## Objetivo

Fundir a linguagem visual do protótipo Blueprint Tokon com o Mass Notes Next sem alterar layout, arquitetura da informação, comportamento, Tiptap, engines, persistência, breakpoints ou contratos acessíveis.

A regra consolidada é:

> O blueprint é o ambiente; o manuscrito é o objeto principal.

## Paleta adotada

- tinta: `#161817`;
- papel: `#f3eee4`;
- papel secundário: `#e9e1d4`;
- ciano: `#86c7df`;
- ciano forte: `#36a7d2`;
- ciano pálido: `#d8f0f8`;
- laranja: `#ff5a19`;
- vermelho: `#e31b36`.

## Arquitetura

A skin é isolada em três camadas:

```text
mass-notes-next/src/styles/theme-blueprint.tokens.css
mass-notes-next/src/styles/theme-blueprint.css
mass-notes-next/src/styles/theme-blueprint-composition.css
```

- tokens: vocabulário visual e mapeamento semântico;
- skin: aplicação sobre os componentes existentes;
- composição: proteção do papel contra lavagem cromática.

Nenhuma dessas camadas contém lógica de produto.

## Resultado

### Canvas

- prancha ciano;
- pontos técnicos;
- diagonais de construção;
- moldura interna;
- grid de baixa intensidade.

### Laterais e registro

- papel técnico;
- retícula sutil;
- filetes ciano;
- microtipografia monoespaçada;
- estados ativos preservados.

### Manuscrito

- papel quente opaco;
- pontos discretos;
- margem técnica;
- pauta horizontal;
- sombra gráfica deslocada;
- conteúdo autoral com contraste alto.

### Noite

- canvas azul profundo;
- papel técnico escuro;
- ciano mais luminoso;
- mesmos papéis semânticos de foco, ação e seleção.

## Incidente de estabilização

A primeira pauta usava `repeating-linear-gradient`. Mesmo com `background-color` correto, a composição resultava em grandes áreas azuladas sobre a folha.

Foram comparadas capturas com:

1. composição normal;
2. grain e halftone removidos;
3. blueprint removido;
4. papel sólido.

A causa estava na própria pauta. Ela foi substituída por uma imagem linear de 48 px repetida no eixo vertical. O pixel central passou de aproximadamente `(197, 218, 219)` para `(242, 237, 227)`, praticamente igual ao papel sólido `(243, 238, 228)`.

## Contratos de regressão

Os testes exigem:

- tokens exatos da referência;
- papel claro em `rgb(243, 238, 228)`;
- papel noturno em `rgb(32, 38, 40)`;
- pauta sem `repeating-linear-gradient`;
- tile `100% 48px` com `repeat-y`;
- contraste alto no manuscrito;
- geometria desktop inalterada;
- camadas decorativas sem bloquear controles;
- ausência de overflow em 1440, 1366, 1280, 1024, 820, 430, 390 e 320 px;
- todos os gates anteriores novamente verdes.

## Evidência

- commit funcional limpo: `ebea3db935e5efb7322e0b8db50204db9170d7b7`;
- workflow: `30333192558`;
- Chromium: 50/50;
- Firefox: 50/50;
- total: 100/100;
- preview publicada após gate verde;
- capturas finais em papel, noite e mobile revisadas.

## Próximo passo

Auditoria manual do contrato de posições com textos brasileiros reais e estruturas complexas.

Decorations continuam bloqueadas até essa auditoria e nova autorização explícita.