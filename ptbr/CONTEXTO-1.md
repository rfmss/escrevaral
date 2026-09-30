# Classes em contexto — incremento 1

26/09/2026 · P01/P02/P04/P09/P10 · Base conferida: `1d649c2ca3f47db7570bdf1b3c20f6e075705535`, `main`.

## O que mudou

`morfologia-contextual.js` acrescenta análise por ocorrência à lente existente. O inventário anterior é consultado sem mutação e recebe um suplemento explícito pequeno. Classes possíveis, leitura contextual e desconhecimento são estados separados. A terminação de uma palavra não basta para classificá-la.

| Regra | Construção | Resultado / limite |
|---|---|---|
| PTBR-CTX-001 | Pronome sujeito + forma finita compatível, com `não` e clítico opcionais | Leitura verbal moderada; não certifica concordância nem analisa toda a oração |
| PTBR-CTX-002 | Artigo definido + nome registrado | Artigo e substantivo; um nome homógrafo de verbo exige forma finita à direita. Não atribui função de sujeito |
| PTBR-CTX-003 | `o/a/os/as` entre pronome sujeito (com `não` opcional) e forma finita compatível | Leitura pronominal moderada |
| PTBR-CTX-004 | Nenhuma das regras decide | Possibilidades lexicais, ambiguidade ou desconhecimento explícitos |
| PTBR-CTX-005 | Preposição + infinitivo conhecido, com sujeito opcional | Preserva a regra anterior e sua referência histórica, sem atribuir nova validação bibliográfica |

Exemplos próprios: `Eu canto. O canto terminou.`, `Ela cobra o pagamento. A cobra atravessou o caminho.`, `Vi a menina. Eu a vi.`. Um mesmo vocábulo mantém candidatos lexicais mesmo quando uma regra favorece uma leitura.

Pontuação, quebra de linha, citação, código ou endereço entre apoios impedem a ligação contextual. Cada resultado e cada apoio possuem posições UTF-16 verificadas no original. Não há acesso a DOM, rede, armazenamento de manuscritos ou alteração de protótipos no motor.

## Fontes realmente consultadas

Cunha e Cintra, Nova gramática do português contemporâneo, 7ª edição, 2ª impressão, Lexikon, 2017. Guia principal escolhido pelo autor.

| Página impressa | Página PDF | Uso na entrega |
|---|---|---|
| 91–92 | 124–125 | Inventário de classes e flexão; contexto de leitura |
| 138 | 171 | Diagrama de sintagmas e núcleos; não reduzir estrutura à proximidade |
| 191 | 224 | Substantivo e papel nominal |
| 219 | 252 | Artigos e relação com substantivos |
| 289 | 322 | Pronomes e funções nominais |
| 314 | 347 | Formas átonas `o/a/os/as` |
| 393–395 | 426–428 | Verbo, pessoa, número e flexões |

Leitura parcial. As regras são operacionalizações conservadoras deste incremento, não algoritmos copiados da gramática. Paradigmas herdados e a antiga regra de infinitivo ainda não têm conferência bibliográfica individual completa. O suplemento de formas é uma seleção editorial local, sem pretensão de ampliar o dicionário integralmente.

## Custo e recorte

A cópia de trabalho é cortada antes da proteção/tokenização: até 8.000 unidades UTF-16 e 1.600 tokens. Um token incompleto na borda é descartado. Até 100 apontamentos são apresentados. São dois limites distintos: `coverageInfo.scope.partial` informa recorte textual; `limited` informa corte na lista de resultados. O restante não é declarado analisado. Uma seleção feita no fluxo individual permite continuar de outro ponto.

O trabalho é limitado, mas síncrono dentro desse recorte. Cancelamento impede tarefas ainda na fila e resultados obsoletos; não interrompe uma função JavaScript já em execução. Um worker ou processamento cooperativo continua sendo uma opção a avaliar se os testes reais mostrarem necessidade.

No ambiente Node desta execução, sete rodadas por tamanho produziram medianas de 0,95 ms (2 mil caracteres), 2,47 ms (20 mil) e 1,97 ms (200 mil). Os dois últimos processaram o mesmo teto de 8 mil caracteres/1.600 tokens. Isso comprova o recorte no teste, não latência em celular.

## Interação

O painel mantém a entrada visual Examinar. Agora mostra todas as lentes, sem triagem automática; cada clique escolhe somente uma. O botão de reexame repete apenas a lente escolhida. Trocar de lente, cancelar, fechar, editar, iniciar IME ou trocar de folha invalida resultados. O fluxo individual e o painel cancelam um ao outro. A mudança completa da apresentação para o controle Escrevaral liga/desliga permanece uma etapa visual própria.

Resultados mostram o trecho exato em separado. `Ver no texto` apenas seleciona. O painel preserva escolhas salvas. Edição exige nova escolha explícita; nenhuma análise ou triagem é agendada durante ou depois da digitação.

## Evidências e limites desta entrega

- `node tests/ptbr-contexto.cjs`: 63 casos de desenvolvimento/regressão passaram; exemplos ambíguos, desconhecidos, protegidos, NFD, emoji, ocorrências repetidas, recorte e seleção deslocada.
- `node ptbr/teste-painel.js`: simulação passou para uma lente, troca, cancelamento, IME e escolhas.
- `node tests/ptbr-lentes.cjs`: 29 regressões anteriores passaram.
- `node ptbr/teste-triagem.js`: 16 casos anteriores passaram; o módulo continua disponível, mas não roda automaticamente no painel.
- `node tests/controles-static.cjs`: 42 blocos de script aceitos como ES5; HTML portátil e versões de cache sincronizados.
- `node tests/linguistica-linhagem.cjs`: contratos de análise, persistência e linhagem passaram.
- Chromium: tentativa de execução bloqueada pelo ambiente (`socket() failed: Operation not permitted`), antes de abrir o aplicativo.
- WebKit: runtime obtido, mas dependências nativas ausentes. Teste de navegador não executado nesta entrega.
- Offline: motor funciona no teste isolado sem APIs de rede; código permanece embutido no HTML portátil. Reabertura PWA e funcionamento real no navegador não foram revalidados nesta entrega. Pendência anterior em WebKit permanece.

Os 63 casos foram anotados pela IA implementadora. Não são avaliação cega nem revisão linguística independente; passar neles não mede acurácia geral. Ainda falta avaliação reservada, revisão de falsos positivos em textos inéditos e medição em aparelhos físicos.

## Continuidade e publicação

Estudado: seções listadas. Implementado: módulo e alterações do painel. Testado: motor, contrato, simulação e análise estática. Integrado no código: sim. Validado em navegador: pendente. Publicado: não.

O cache foi versionado para `v6-19`; formatos de manuscrito não mudaram. As alterações estão locais, ainda sem commit. Para desfazer este incremento, retirar apenas seu patch de implementação sobre a base registrada, preservando a documentação anterior e os manuscritos. Nunca restaurar uma cópia antiga do HTML sobre mudanças concorrentes.

Próxima ação: executar `tests/ptbr-browser.cjs` em Chromium e WebKit com runtime funcional, verificar a apresentação e o offline; depois avaliar novos casos independentes e preparar a publicação. `QA_BROWSER_EXECUTABLE` permite indicar um navegador de QA já instalado. Não declarar P04, P09 ou P10 integralmente concluídos.

## Evolução v6-35 — 30/09/2026

[Entrega M02-candidatos-1](../docs/jornada/ENTREGA-V6-35.md): o léxico PortiLexicon alimenta esta lente; condições finitas usam traços explícitos, candidatos e origem preservados. A condição nominal exige contexto à direita para homógrafos finitos, não para qualquer segunda classe. CTX-022/047 passam a ambíguos por filhar/casar; expectativas antigas preservadas. Sintaxe/relativas continuam com readings() legado. Sem nova leitura bibliográfica ou alegação de avaliação independente. Testes visuais/aparelhos citados nas seções históricas deixaram de ser gate por decisão posterior do autor.
