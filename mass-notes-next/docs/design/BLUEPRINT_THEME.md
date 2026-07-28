# Tema Blueprint Tokon

Atualizado em: 2026-07-28

## Objetivo

Fundir a linguagem visual do protótipo Blueprint Tokon com o Mass Notes Next sem alterar layout, comportamento, Tiptap, engines, persistência, breakpoints ou contratos acessíveis.

> O blueprint é o ambiente; o manuscrito é o objeto principal.

## Gramática extraída

- tinta `#161817`;
- papel `#f3eee4`;
- papel secundário `#e9e1d4`;
- ciano `#86c7df`;
- ciano forte `#36a7d2`;
- ciano pálido `#d8f0f8`;
- laranja `#ff5a19`;
- vermelho `#e31b36`;
- retícula pontilhada;
- diagonais de construção;
- filetes técnicos;
- sombra gráfica deslocada;
- microtexto monoespaçado em caixa alta;
- papel sobre prancha azul.

## Aplicação

- canvas: prancha azul, pontos e diagonais;
- biblioteca e rail: papel técnico;
- registro: ficha técnica;
- página: papel quente, pauta e margem;
- toolbar: moldura e divisores, sem voltar a ser uma coleção de caixas;
- painéis linguísticos: cartões de relatório, sem aparência clínica.

## Restrições

A camada não pode alterar DOM, grid, posições, larguras, breakpoints, padding funcional, nomes acessíveis, editor, engines, dados, histórico, seleção, atalhos ou conteúdo.

## Arquivos

```text
src/styles/theme-blueprint.tokens.css
src/styles/theme-blueprint.css
```

Os dois arquivos serão carregados por último e poderão ser removidos para reverter somente a skin.