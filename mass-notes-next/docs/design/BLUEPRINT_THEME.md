# Tema Blueprint Tokon

Atualizado em: 2026-08-01
Estado: aprovado para continuidade experimental

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

## Aplicação estabilizada

- canvas: prancha azul, pontos, moldura e diagonais;
- biblioteca e rail: papel técnico com retícula sutil;
- registro: ficha técnica de quatro células;
- página: papel quente opaco, pontos, pauta tileada de 48 px e margem técnica;
- toolbar: moldura e divisores, sem voltar a ser uma coleção de caixas;
- painéis linguísticos: cartões de relatório, sem aparência clínica;
- modo noite: prancha azul profunda e papel técnico escuro, com os mesmos papéis semânticos.

## Verniz Escrevaral — índigo, sépia e matéria impressa

A camada adicionada em 2026-08-01 preserva a arquitetura Blueprint e troca somente o acabamento perceptivo:

- canvas ciano é reinterpretado visualmente como índigo mineral `#1a2f5b`;
- sépia `#3b2b1e` entra em marcas, ornamentos e pequenos acentos editoriais;
- creme `#e7d1ad` substitui o branco óptico nas linhas sobre fundos escuros;
- painéis recebem fibra fina, nuvens tonais discretas e tinta aparentemente absorvida;
- o papel autoral continua em `#f3eee4`, opaco e prioritário para leitura;
- o modo noite mantém o papel técnico aprovado em `#202628` e aplica o verniz ao ambiente ao redor;
- ruído pontilhado é reduzido e o grão contínuo assume a materialidade principal.

O verniz não transforma o editor em cartaz. Ele usa o cartaz de identidade como fonte de cor e matéria, mantendo o produto, a densidade e a hierarquia atuais.

## Arquitetura da skin

```text
src/styles/theme-blueprint.tokens.css
src/styles/theme-blueprint.css
src/styles/theme-blueprint-composition.css
src/styles/theme-escrevaral-verniz.css
```

- `tokens`: paleta da referência Blueprint e mapeamento semântico estável;
- `skin`: aplicação visual Blueprint ao produto existente;
- `composition`: garante que o papel permaneça quente e opaco, sem lavagem cromática do canvas;
- `verniz`: última camada, somente cores, textura e acabamento índigo/sépia.

Os arquivos são carregados por último na ordem acima. Remover somente o import de `theme-escrevaral-verniz.css` reverte o novo acabamento sem tocar a skin Blueprint. Remover os quatro imports reverte toda a skin.

## Restrições comprovadas

A camada não altera:

- DOM ou arquitetura da informação;
- grid, posições, larguras ou breakpoints;
- padding funcional do papel;
- nomes acessíveis;
- Tiptap, schema, histórico, seleção ou atalhos;
- engines, adaptadores, bases ou dados;
- persistência, conflito entre abas ou migração;
- conteúdo do manuscrito.

## Incidente de composição

O primeiro papel usou `repeating-linear-gradient` para a pauta. Embora o `background-color` calculado estivesse correto, a composição lavava grandes áreas com ciano e aproximava o manuscrito do canvas.

A correção substituiu a pauta por uma imagem linear de 48 px repetida apenas no eixo vertical. O pixel central passou de aproximadamente `(197, 218, 219)` para `(242, 237, 227)`, praticamente idêntico ao papel sólido `(243, 238, 228)`.

A regressão permanente exige:

- papel claro em `rgb(243, 238, 228)`;
- papel noturno em `rgb(32, 38, 40)`;
- pauta com `background-size: 100% 48px`;
- repetição `repeat-y`;
- ausência de `repeating-linear-gradient` dentro da folha.

O verniz acrescenta duas camadas radiais de fibra e variação tonal, mas preserva integralmente esse contrato.

## Evidência

Baseline Blueprint:

- workflow funcional: `30333192558`;
- Chromium: 50/50;
- Firefox: 50/50;
- total: 100/100;
- preview publicada após gate verde;
- capturas revisadas em papel, noite e mobile;
- `main`, aplicação pública e service worker intactos.

Verniz Escrevaral:

- contrato visual protegido em `tests/gate6-75-blueprint.spec.ts`;
- tokens Blueprint originais permanecem estáveis para compatibilidade;
- tokens `--esv-*`, fibra dos painéis, textura do papel e geometria existente são testados;
- publicação continua condicionada à matriz integral, cache e smoke verdes.
