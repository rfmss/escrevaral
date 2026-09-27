# Relativas — primeiro recorte local

26/09/2026 · P06/P09/P10 · Não publicado.

## Resultado

Nova lente manual **Orações relativas · recorte inicial**. Na construção “A menina que está cantando trabalha.”, seleciona “que está cantando”, explica a retomada de “menina” e a função de sujeito de que. A explicação identifica também o verbo da principal. “Ver no texto” seleciona a ocorrência sem modificar o manuscrito.

Estudo e fontes: `docs/jornada/ESTUDO-RELATIVAS-1.md`. Regra: `docs/jornada/regras-relativas-1.json`. Motor: `ptbr/relativas.js`. Corpus: `ptbr/corpus/relativas-1.json`.

## Cobertura e limites

Artigo + substantivo registrado como sujeito da principal; relativa sem vírgulas, com que-sujeito, predicado intransitivo ou de ligação reconhecido; principal inteira reconhecida; uma única fronteira possível. Locuções do recorte anterior participam sem virar várias orações por contagem de verbos. Uma ocorrência entregue não representa uma árvore sintática completa do período.

Até 8.000 unidades UTF-16, 1.600 tokens, 24 tokens/1.000 caracteres por segmento e 100 achados. Proteção de citações/código/URLs e rejeição de segmentos cortados. Silêncio não indica erro. Não há reconhecimento geral de subordinadas, relativas de objeto, explicativas, encaixamento ou antecedentes afastados.

## Alterações e compatibilidade

- Módulo independente de relativas, usando os critérios existentes da sintaxe simples para conferir predicações em cópias internas; nenhum texto reconstruído aparece como trecho original.
- Registro da lente e botão no painel atual; reaproveitamento da leitura anotada e das explicações. Uma lente por escolha; digitar não executa o motor.
- Entrada lexical literal chegaram, conservando perfeito e mais-que-perfeito; não se ampliou um paradigma inteiro por inferência de terminação.
- HTMLs idênticos, assets/cache `v6-23`, conhecimento `local-20260926-relativas-1`. Sem dependência nova, mudança do armazenamento ou do formato dos manuscritos.
- QA de navegador preparado para a nova lente; CI inclui sua regressão.

## Evidência

`node tests/ptbr-relativas.cjs`: 84 casos (30 positivos, 54 abstenções), além de seleção/NFD/emoji, ocorrências repetidas, proteção e cortes. A anotação inicial foi preservada; três lacunas por chegaram e um defeito de posição em seleção foram corrigidos.

`tests/ptbr-visual.cjs`: painel real com DOM simulado; uma única lente, explicação, seleção literal e texto intacto. Não certifica geometria CSS, teclado físico, aparelhos ou navegador.

Regressões pertinentes: 63 casos de contexto, 78 de sintaxe, 65 de locuções; análise estática de 46 scripts ES5 e sincronização offline. Logs resumidos correspondem às execuções locais; navegador permanece bloqueado pelo ambiente conhecido, sem nova tentativa idêntica.

`ptbr/ferramentas/medir-relativas.cjs` e `ptbr/auditoria/custo-relativas-1.json`: 3 aquecimentos e 30 amostras por combinação, padrões positivos/adversariais em entradas de 8 mil, 200 mil e 800 mil unidades UTF-16. p95 observado entre 8,7 e 15,7 ms no Node deste ambiente. Mede o motor direto, não latência de interface ou dispositivo; entradas acima de 200 mil foram ensaiadas diretamente, pois o cofre limita o pedido a 200 mil. O recorte de trabalho continua limitado.

## Estados e continuidade

Estudado, formalizado, implementado, testado em desenvolvimento e integrado localmente. Revisão pelo implementador, sem avaliador independente. Navegador e publicação pendentes. Não modificar o kit Gemini v6-22 já enviado: ele é a referência daquela rodada. Resultados futuros serão confrontados com o manifesto correspondente.

Próxima ação técnica: executar o QA preparado em ambiente de navegador funcional. Próxima unidade linguística: que-objeto, regência e sujeito posposto, com exemplos contrastantes e condições de abstenção antes da ampliação.

Reversão deste incremento: retirar o registro/módulo da lente, seu botão e a entrada lexical acrescentada; reverter a versão dos assets de modo coordenado e regenerar os HTMLs. Preservar morfologia contextual, sintaxe e locuções anteriores. Não restaurar um backup integral antigo do editor.
