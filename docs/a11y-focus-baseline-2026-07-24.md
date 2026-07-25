# Baseline de foco e navegação por teclado

Data: 24 de julho de 2026
Branch: `refactor/a11y-focus-foundation`
Base: `main`

## Escopo

Esta etapa registra e corrige apenas a fundação visual de foco por teclado. Não altera navegação, textos, persistência, engines, service worker, temas ou arquitetura.

## Constatações confirmadas no código

- O projeto já contém estilos locais com `:focus` e `:focus-visible`.
- `:focus` não é tratado como erro: continua útil para campos e áreas de edição.
- A cobertura não é centralizada; vários controles dependem do estilo padrão do navegador ou de regras locais.
- A área principal de escrita é um elemento `contenteditable="true"`.
- Há controles nativos (`button`, `a`, `input`, `select`, `textarea`, `summary`) e controles com `tabindex` distribuídos pelas superfícies.
- Existem regras `outline: none` em módulos específicos; por isso a fundação usa `:focus-visible` com prioridade suficiente para manter um indicador perceptível, sem remover os estados `:focus` já existentes.

## Decisão

Adicionar tokens semânticos e uma regra explícita para os elementos interativos comuns. A regra:

- aparece apenas quando o navegador considera o foco visível;
- não desloca o layout;
- não altera foco por clique quando `:focus-visible` não se aplica;
- preserva regras locais de cor, fundo e borda;
- não usa seletor universal `*`;
- não remove nenhum `:focus` existente.

## Riscos conhecidos

- Componentes dentro de contêineres com `overflow: hidden` podem cortar o outline; devem ser verificados visualmente antes de qualquer merge.
- A cor do anel herda o acento de cada tema. A validação de contraste nos sete temas ainda exige execução visual.
- Esta etapa não aumenta áreas de toque e não modifica a arquitetura de informação.

## Validação necessária antes de merge

- Tab e Shift+Tab em todas as áreas.
- Enter e Espaço nos controles.
- Editor, navegação, diálogos e bandeja mobile.
- Viewports 360, 390, 768, 1024 e 1440 px.
- Sete temas.
- Scripts existentes de regressão, overflow mobile, console e smoke test.
