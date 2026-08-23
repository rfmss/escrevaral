# E2-V — baseline separada do infinitivo pessoal

Data: 2026-07-31  
Status inicial: **em investigação**  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155`  
Cabeça de partida: `2832f6c8c6d87ab89b442e2215a5eea887fcff42`

## C — Cenário observado

A infraestrutura E2-V já contém corpus de desenvolvimento, avaliação adversarial separada, configuração Playwright própria e registro de proveniência. Os três workflows da cabeça de partida estão verdes, mas o comando de avaliação adversarial não era executado por workflow próprio.

O conjunto separado possuía doze casos de homógrafos, defectivos, particípios duplos, construções limítrofes, irregulares de alto risco e diacríticos. Não havia casos separados de infinitivo pessoal, embora esse fenômeno já aparecesse no corpus de desenvolvimento.

## L — Limite e impacto

Sem avaliação independente do infinitivo pessoal:

- não existe baseline de falsos positivos e falsos negativos;
- não é possível medir a fronteira com infinitivo impessoal;
- não é possível medir a coincidência formal com futuro do subjuntivo;
- a regra não pode sair de `pending`;
- um workflow verde da regressão não pode ser apresentado como aprovação linguística da banca.

A nota Eva permanece em `6,595`.

## A — Arquitetura escolhida

Este lote não altera a engine.

Ele deve:

1. fortalecer o contrato de proveniência com escopo e licença ou condição de uso;
2. manter a avaliação fora do gate de regressão;
3. transformar cada caso adversarial em teste independente por navegador;
4. acrescentar positivos, negativos e casos limítrofes de infinitivo pessoal;
5. gerar métricas por navegador e fenômeno;
6. executar uma workflow própria, sem publicar preview;
7. preservar o resultado vermelho inicial como baseline legítima.

## R — Resultado reproduzível esperado

A workflow **Banca E2-V adversarial** deve produzir, em Chromium e Firefox:

- relatório JSON bruto do Playwright;
- relatório HTML;
- resumo JSON;
- resumo Markdown;
- contagem de aprovações e falhas;
- VP, VN, FP e FN para contratos que declaram `targetExpected`;
- precisão, revocação e acurácia contratual;
- lista dos erros observados.

A workflow deve terminar vermelha quando a banca falhar e verde apenas quando todos os contratos passarem. Esse estado não altera a publicação da preview da matriz principal.

## O — O que permanece aberto

Mesmo com a baseline:

- fontes bibliográficas continuam ausentes;
- tradição normativa e uso brasileiro ainda precisam de documentação verificável;
- licença ou condição de uso concreta ainda precisa ser preenchida;
- métricas contratuais não substituem inspeção linguística;
- a menor correção da engine só será escolhida depois do primeiro relatório;
- banca humana independente permanece pendente;
- nenhuma nota sobe automaticamente.

## Critérios de aceite deste lote

- nenhum arquivo da engine alterado;
- corpus de avaliação continua separado do corpus de desenvolvimento;
- ao menos um contrato positivo e um negativo de infinitivo pessoal;
- Chromium e Firefox obrigatórios;
- relatório preservado mesmo quando a execução falhar;
- `main`, aplicação pública, service worker e Gate 14 intactos.
