# CLARO — verniz Escrevaral no Mass Notes

Data: 2026-08-01  
Estado: em validação  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho

## C — cenário observado

A fundação Blueprint está funcional e conserva o manuscrito como objeto central, mas a aplicação parcial do verniz ainda deixava biblioteca e ferramentas em papel claro e não materializava o selo oficial `SCR / VRL` ao lado da palavra-marca.

As referências aprovadas reforçam uma composição de três matérias: laterais em índigo mineral, centro em papel quente e acentos editoriais sépia. O selo deve atuar como assinatura discreta, sem substituir `ESCREVARAL` nem transformar a interface em cartaz.

Baseline preservada:

- cabeça anterior: `0870e7de4d17d6117b5cc156d99186a171ea58ef`;
- build concluído;
- contrato visual Blueprint aprovado nos dois navegadores;
- matriz anterior: 349/350, com uma falha isolada no Firefox durante preenchimento de um teste de densidade, sem relação causal com a skin;
- preview não publicada porque a matriz não ficou integralmente verde.

## L — limite e impacto

A intervenção é exclusivamente visual. Permanecem protegidos:

- DOM, arquitetura da informação e grid de três colunas;
- larguras, posições, breakpoints e proprietários de rolagem;
- Tiptap, toolbar, seleção, histórico e paginação;
- persistência, conflito entre abas e exportações;
- engines, corpus, regras e dados linguísticos;
- nomes acessíveis, atalhos e comportamento móvel;
- `main`, aplicação pública, service worker e Gate 14.

Não há alteração de componentes React. O selo usa pseudo-elementos decorativos sem semântica adicional, enquanto a palavra-marca continua sendo o texto real e legível.

## A — arquitetura e ação escolhida

A mudança permanece na camada final e reversível:

```text
src/styles/theme-blueprint.tokens.css
src/styles/theme-blueprint.css
src/styles/theme-blueprint-composition.css
src/styles/theme-escrevaral-verniz.css
```

A menor ação coerente foi:

1. remapear compatibilidades cromáticas finais de ciano para índigo, sépia e óxido;
2. aplicar índigo mineral com fibra discreta à biblioteca e ao rail;
3. preservar registro, toolbar e manuscrito em papel quente;
4. criar uma única aplicação do selo `SCR / VRL` por CSS, ao lado de `ESCREVARAL`;
5. manter a pauta de 48 px, o papel opaco e a ausência de `repeating-linear-gradient` dentro da folha;
6. acrescentar teste específico de selo, contraste, materialidade e ausência de overflow.

## R — resultado reproduzível esperado

Critérios para considerar a tranche corrigida:

- selo quadrado com `SCR` e `VRL` visível no canto superior esquerdo;
- palavra-marca `ESCREVARAL` visível ao lado do selo;
- laterais em `#14233a`, selo em `#1a2f5b` e papel em `#f3eee4`;
- contraste mínimo de 4,5:1 nos controles testados das laterais;
- nenhuma alteração nas medidas protegidas do desktop;
- ausência de overflow horizontal entre 320 e 1440 px;
- papel claro e noturno preservando a pauta `100% 48px` com `repeat-y`;
- build verde e matriz integral em Chromium e Firefox;
- revisão das capturas desktop, mobile e modo noite;
- publicação apenas depois de toda a cadeia verde.

## O — o que permanece aberto

- concluir a matriz integral da nova cabeça;
- revisar as três capturas em escala real;
- confirmar cache e smoke público antes de publicar qualquer preview;
- manter o PR em rascunho e não executar Gate 14.

## Reversão

Remover somente o import de `theme-escrevaral-verniz.css` em `src/main.tsx` restaura a skin Blueprint anterior. Nenhuma outra camada precisa ser revertida.
