# Candidata a lançamento — estabilidade Argila

Base: `main` em `a4080bcacfef567cf9a88bb8ceffb7ac013c3ec4`.

## Objetivo

Encerrar a estabilização sem abrir uma nova rodada de redesign. Esta etapa não adiciona funcionalidades e não altera engines, manuscritos, formatos ou persistência salvo quando uma falha reproduzida exigir correção.

## Guardas obrigatórias

- integridade de manuscritos e recuperação;
- regressão das engines;
- console e overflow;
- teclado, foco e diálogos;
- entrada, retorno e primeira escrita;
- Palavras;
- situação do editor;
- navegação Oficina;
- Mesa no celular;
- publicação e continuidade offline;
- privacidade de rede com texto-canário;
- rotas e pilares do produto;
- coerência de versões e pacote do service worker.

## Critério de saída

A candidata só entra na `main` com:

1. nenhuma falha P0;
2. nenhuma falha P1 reproduzida;
3. todos os workflows funcionais verdes;
4. relatório consolidado preservado como artefato;
5. PRs antigos incompatíveis encerrados;
6. limitações P2 documentadas, sem promessa técnica falsa.
