# Orações adjetivas contextuais — PONT-18/PONT-19

**Data:** 2026-07-14  
**Objetivo:** substituir palpites por regex nas orações adjetivas explicativas/restritivas por uma leitura contextual local, explicável e conservadora.

## Problema

Em português brasileiro, a mesma sequência pode mudar de sentido apenas pela pontuação:

- `Os estudantes que chegaram cedo entraram.` seleciona parte dos estudantes.
- `Os estudantes, que chegaram cedo, entraram.` apresenta a chegada como informação sobre o conjunto já identificado.

Sem conhecer a intenção da escritora, nenhuma ferramenta pode transformar todos esses casos em erro objetivo. O comportamento anterior tentava inferir a intenção por sinais frágeis:

- `todos os ... que` era tratado como necessariamente explicativo, embora possa selecionar um subconjunto;
- `um/uma ..., que` era tratado como necessariamente restritivo, embora o indefinido possa introduzir um referente específico e receber explicação.

Essas duas heurísticas ameaçavam a confiança da escritora porque produziam certeza onde o texto não oferecia certeza.

## Solução

Foi criado `relative-clause-engine.js`, carregado antes de `punctuation-engine.js` e incluído no cache offline. O motor separa três resultados:

1. `explicativa` com confiança alta — referente único conhecido ou propriedade geral estável;
2. `restritiva` com confiança alta — delimitador textual explícito (`apenas`, `somente`, `só`, `exclusivamente`);
3. `ambigua` com confiança baixa — qualquer caso em que a escolha dependa da intenção autoral.

A política central é **abster-se por padrão**. `PONT-18/PONT-19` só geram alerta quando:

- a classificação tem confiança alta; e
- a pontuação escrita contradiz a leitura sustentada pela evidência textual.

Casos ambíguos permanecem disponíveis em `contextualReadings`, com explicação das duas leituras, mas não viram alerta categórico.

## Contrato de explicabilidade

Cada leitura contextual devolve:

- `type`: `explicativa`, `restritiva` ou `ambigua`;
- `confidence`: `alta` ou `baixa`;
- `score`: grau numérico de sustentação;
- `evidence`: evidência usada na decisão;
- `guidance`: efeito de usar ou retirar as vírgulas;
- `antecedent`, `predicate`, `fragment`, `pos` e `hasComma`.

Alertas confirmados propagam `contextual`, `confidence`, `score`, `interpretation` e `evidence` ao motor de análise. A interface informa a evidência e preserva explicitamente a decisão autoral quando a leitura pretendida for outra.

## Segurança linguística

O classificador também evita confundir oração adjetiva com:

- conjunção integrante depois de verbos dicendi/cognitivos (`A escritora disse que...`);
- construção pronominal `o que`;
- nomes homônimos sem referente único demonstrável;
- quantificadores universais que ainda podem delimitar subconjuntos.

A microbase de referentes e propriedades gerais é pequena e deliberadamente auditável. Conhecimento ausente resulta em abstenção, não em invenção. O motor é determinístico, local, rápido, privado e funciona offline.

## Verificação

- Teste focal `scripts/bench-gramatica/testar-oracoes-adjetivas.js`: **22 verificações contextuais OK**.
- Auto-consistência focal: exemplos corretos de `PONT-18/PONT-19` não disparam; contraexemplos com evidência explícita disparam.
- Bateria oficial de frases críticas: **1915/1915 OK**, 0 divergências.
- Auditoria de publicação/offline: **P0=0, P1=0**; P2=7 preexistentes e não relacionados.
- Integridade do diff: `git diff --check` sem erros.

## Limites honestos e evolução

Esta entrega resolve a fragilidade de `PONT-18/PONT-19`; não alega compreensão semântica humana universal. Ironia, pressupostos narrativos, conhecimento de mundo aberto e referentes construídos ao longo de capítulos podem continuar ambíguos.

Próximas ampliações seguras devem seguir o mesmo contrato:

1. adicionar pares mínimos reais ao teste antes de cada nova heurística;
2. ampliar a microbase somente com relações estáveis e fonte verificável;
3. usar contexto discursivo entre frases para resolver referentes já apresentados;
4. medir precisão e taxa de abstenção, nunca apenas quantidade de alertas;
5. manter a escritora no controle quando duas leituras forem gramaticalmente possíveis.