<!-- Transcrição do anexo de retomada fornecido por Rafa em 08/10/2026. SHA-256 do anexo: aacbaf146ad45906f18fa4938310a912d679587f7b2901bdeed0303c3565295e. Relato histórico da conversa anterior; sondas do protótipo não foram repetidas neste lote. -->

# Revisão das contribuições do Claude para o Escrevaral

8 de outubro de 2026 · análise dos anexos, execução do protótipo e conferência seletiva da main v6.59.0.

## Decisão técnica

Aproveitar o desenho de avaliação independente, a representação de componentes gramaticais e a ideia de uma guarda de APIs no desenvolvimento. Integrar esses contratos à arquitetura existente. O protótipo não está pronto para substituir ou integrar o motor: sondas locais reproduziram problemas de endereçamento, contrações e geração do gabarito.

A prioridade de produto permanece A03/U01: partir de uma ocorrência reservada, examinar seu contexto por comando, explicar e selecionar o original. Avaliação ampla fica em Q02; compatibilidade estática, em Q01. As sugestões não justificam reiniciar o plano nem suspender toda entrega até terminar um novo laboratório.

## Material efetivamente conferido

Foi lido integralmente o texto do relatório DOCX anexado. Foram inspecionados o README externo e os arquivos de código, configuração, dados e testes do ZIP interno. O ZIP contém o protótipo e seu gerador TSV; não contém o documento separado do esquema de anotação mencionado no relatório, nem corpus DEV/TESTE anotado. Portanto, não foi possível validar as instruções completas desse esquema nem resultados de qualidade linguística.

Na main foram consultados `AGENTS.md`, `package.json`, `docs/PLANO-MESTRE.md`, `docs/FILOSOFIA-E-COMPATIBILIDADE.md`, `scripts/build.cjs`, `ptbr/morfologia-contextual.js` e `resources/pt-BR/portilexicon/ORIGEM.json`. Essa conferência é seletiva, não auditoria integral do produto. A tentativa de leitura de `ptbr/leitura.js` retornou 404; nenhuma conclusão depende desse caminho.

O manifesto de origem atual registra **3.220 formas e 5.683 leituras**, recorte 12. Isso esclarece a dúvida do relatório sobre as 3.009 formas: o AGENTS registra esse número em uma entrega histórica. O motor contextual consultado já distingue artigo de determinante e conserva a categoria `determinante (UD)` em recortes: não é correto tratar toda a camada como inexistente. Falta consolidar a política de apresentação entre as superfícies.

## O que aproveitar e com qual condição

| Contribuição | Aplicação ao Escrevaral | Condição de aceite |
| --- | --- | --- |
| Token gráfico com componentes | Estender o contrato existente de ocorrências; componentes ligados ao token original. | Contração é hipótese até haver evidência; seleção continua no intervalo original. |
| DEV e TESTE separados por origem | Acrescentar avaliação reservada ao Q02, preservando os controles dirigidos existentes. | Anotação revisada sem copiar decisões do motor; textos e partições versionados. |
| Métricas de erro confiante e abstenção | Mostrar erros afirmados como resolvidos e motivos de abstenção. | Denominadores explícitos; ambiguidade legítima não conta como erro automático. |
| Guarda de APIs no build | Completar a verificação de sintaxe com verificação de usos incompatíveis. | Autotestes positivos e negativos; distinguir métodos de campos; manter guardas existentes. |
| Política central de classes | Uma mesma tradução para consulta, reserva, contexto e explicação. | Preservar rótulo da fonte, traços, lema e alternativas; não importar o mapa simplificado sem revisão. |
| CSS conservador | Revisar seletores do percurso afetado quando houver correção concreta. | Sem substituição global de `gap`, sem duplicar espaçamento em navegadores novos e sem reabrir toda a interface. |

## Problemas reproduzidos no protótipo

### 1. Normalização desloca o endereço no manuscrito

Em `core/04-motor.js`, `analisar()` normaliza o texto antes de calcular posições. A sonda com `Cafe\u0301 no quintal.` usa um acento combinante no original. Com NFC disponível, o resultado devolve `no` em `abs=5`; no manuscrito original ele começa em 6. Usar o intervalo retornado sobre o original seleciona ` n`.

Não houve alteração da variável original do chamador; a falha é a correspondência das anotações. Sem `String.prototype.normalize`, a mesma entrada vira tokens separados `Cafe` e acento, sendo o acento rotulado como pontuação. O comportamento varia conforme a API disponível.

**Aproveitamento seguro:** calcular offsets no original; normalizar apenas chaves de consulta, com tratamento dos sinais combinantes. Quando houver transformação estrutural, exigir mapa explícito. Testar NFC/NFD, CRLF, emoji e seleção após edição. Esses testes devem ser acrescentados ao contrato do Escrevaral, sem afirmar que o produto atual apresenta o mesmo defeito.

### 2. Contrações são decididas cedo demais

`O pelo caiu.` produz `pelo` como `classificado`, fonte `contracao`, componentes `por + o`. A tabela é aplicada antes das decisões lexicais/contextuais. O gerador de anotação repete a mesma decomposição, gravando duas linhas para esse substantivo.

**Aproveitamento seguro:** manter token gráfico, candidatos simples e candidatos de decomposição. Em `O pelo caiu.`, preservar a leitura nominal; em `Passou pelo portão.`, considerar `por + o`. Componentes não ganham offsets fictícios. Clíticos e mesóclise precisam de recorte próprio; o protótipo mantém `viu-o` inteiro, mas não implementa seus componentes.

### 3. O gabarito pode herdar erros do motor

O gerador usa o mesmo tokenizador e pré-preenche contrações, `PNT`, `conv=0`, `denot=0` e `fora_norma=nao`. Isso não equivale a um gabarito neutro. Na sonda `😀 ©`, o motor devolve `SIM`, enquanto o gerador preenche `PNT` para ambos. Um avaliador pode medir divergência produzida pelo próprio gerador, não erro linguístico do motor.

**Aproveitamento seguro:** o gerador sugere segmentação editável; rótulos linguísticos começam sem anotação. Preservar texto e endereços, revisar fronteiras independentemente, manter correções de tokenização e separar “não anotado” de “não ocorre”. Compartilhar formato é útil; usar o resultado do tokenizador como verdade incontestável esconderia seus erros.

### 4. Ambiguidade ainda exibe uma classe escolhida

Em `Eu a vi.`, `a` recebe `estado=ambiguo`, mas `classe=ART`, por frequência ilustrativa. O estado é honesto; o campo de classe e a tabela podem fazer o escritor ler artigo como conclusão. Frequência acima do limiar 0,9 também pode gerar `classificado`, embora os dados sejam declaradamente inventados.

**Aproveitamento seguro:** decisão contextual fica vazia quando não houver resolução; hipóteses permanecem em candidatos. Se houver ranking experimental, apresentá-lo em campo separado, sem promover frequência a certeza. No produto, um candidato único de um acervo limitado é evidência lexical, não garantia de cobertura de todas as leituras.

### 5. O formato simplifica informações que já temos

O léxico declara uma entrada por classe e guarda classe, frequência, lema e subclasse, sem a estrutura de flexões usada pelo Escrevaral. A amostra registra `foi` apenas com lema `ser`. Não serve como substituto de um inventário que precisa conservar leituras distintas de mesma classe, como lemas diferentes.

O mapeamento transforma qualquer `DET` sem `PronType=Art` em pronome de uso adjetivo, inclusive quando o traço está ausente. Esse padrão é excessivo para nossa política. `X` também precisa de descrição própria: na UD não é sinônimo geral de estrangeirismo. Conservar categorias da fonte quando não houver tradução justificada.

### 6. Há um custo evitável na análise completa

`analisar()` tokeniza o parágrafo e percorre todos os seus tokens novamente para cada sentença. A seleção dos tokens custa proporcionalmente a sentenças × tokens por parágrafo. Não foi medido impacto em dispositivo; o padrão está no código. Para nosso fluxo, aproveitar a janela limitada e percursos sequenciais, sem transplantar a reanálise integral do protótipo.

## Respostas às perguntas do relatório

**Contrato de contrações.** Acrescentar campos opcionais e versionados ao contrato, mantendo `start/end` UTF-16 e a revisão. Cada componente referencia o token pai e sua ordem. A hipótese de decomposição compete com leituras simples; o contexto decide apenas dentro do recorte implementado. Consumidores antigos podem ignorar os novos campos.

**Conjunto congelado.** Usar o espaço de corpus já existente, com subdiretórios identificados de desenvolvimento e teste e manifesto de origem, licença, gênero, revisão e hash. A sugestão de 2.500 palavras DEV e 5.000 TESTE é um piloto possível, não tamanho mínimo universal nem garantia de cobertura. Separar por texto de origem e evitar trechos sobrepostos; explicitar autores e gêneros. Anotar antes de consultar a saída do motor, revisar discordâncias e versionar o protocolo. Uma avaliação exposta pode continuar como regressão, mas não deve continuar sendo chamada de teste independente se seus erros orientaram ajustes.

**Guarda de APIs.** Verificar chamadas e referências relevantes na árvore sintática, considerando o receptor e o contexto, em vez de proibir qualquer propriedade de mesmo nome. `evento.repeat` e `registro.at` precisam passar; chamadas como `texto.repeat(2)` e `lista.at(0)` precisam ser sinalizadas quando sem alternativa compatível. Testar também `Promise`, `Object.assign`, acesso por colchetes e usos protegidos por detecção de recurso. A solução não deve prometer análise completa de tipos ou aliases. O projeto já depende de Acorn; avaliar sua reutilização antes de acrescentar ESLint e plugins. O alvo da guarda precisa incluir os caminhos essenciais publicados, não apenas o núcleo. Não foi executado o lint do protótipo nesta revisão, pois suas dependências não estão instaladas.

**Métricas.** Para casos decidíveis: registrar N, decisões D, acertos C, erros E e abstenções A; cobertura = D/N e precisão das decisões = C/D, com “não aplicável” se D=0. Erro confiante é a decisão errada apresentada como resolvida: registrar quantidade e proporção entre resoluções. Para ambiguidades legítimas, medir alternativas preservadas e resolução indevida; para casos claros, medir abstenções evitáveis; para fora de cobertura, medir rótulos indevidamente afirmados. Placar estrito e tolerante precisam de alternativas aceitas fixadas antes da avaliação, sem aceitar qualquer classe presente numa lista arbitrariamente longa.

**CSS.** A observação de `gap` é procedente como risco de compatibilidade: MDN registra suporte no contexto flex a partir do Chrome 84. Não prova defeito em todos os seletores citados, nem constitui uma nova homologação obrigatória. O plano atual já registra o painel C02 com blocos/tabela/margens. Priorizar o percurso que estiver sendo alterado; usar margens simples onde necessário, sem manter simultaneamente dois espaçamentos. Não adicionar uma obrigação global a partir da contagem bruta de ocorrências de CSS.

## Encaixe no plano vigente

| Ordem | Item existente | Entrega proposta |
| --- | --- | --- |
| 1 | Manual e contratos | Corrigir a exigência indevida de aparelhos; explicitar offsets do original, candidatos de componentes e estado de resolução. Manual documental atualizado nesta revisão. |
| 2 | A03/U01, apoiados em M02 | Ocorrência reservada → exame explícito de contexto → explicação e seleção válidas, mantendo 700 ms e os tetos vigentes. |
| 3 | M01/M02 e Q02 | Recorte de contrações com candidatos, casos fixados e partição de avaliação; não converter o protótipo inteiro em produção. |
| 4 | Q01 | Guarda complementar de APIs com autotestes e revisão localizada de CSS. |
| 5 | Q02 | Amostra independente anotada, baseline do motor atual e comparação de alternativas só quando houver evidência para isso. |

Essas ações são recomendações desta revisão. Não foram adicionadas ao repositório nem publicadas; nenhum marco do plano foi marcado como concluído.

## Correção no nosso manual

A v1.0 do manual exigia validação em aparelho real, contrariando a decisão vigente de 27/09 registrada no AGENTS e na filosofia. A v1.1 remove essa exigência tanto do texto quanto do visual: aparelhos antigos orientam a engenharia; não são um bloqueio de publicação. Continua proibido afirmar uma certificação que não foi feita. O adendo também registra os controles derivados desta revisão.

## Verificações e limites

Build local do protótipo: passou. Oito testes de fumaça fornecidos: passaram, executados sem o trecho separado de ESLint. Uma primeira tentativa do adaptador de teste falhou por comparar arrays de contextos VM distintos; a execução no mesmo contexto corrigiu o adaptador, sem alterar os testes fornecidos.

Sondas adicionais: reproduzidos o deslocamento após NFC, a fragmentação do acento sem normalização, a contração indevida de `pelo`, a classe preferida junto de estado ambíguo e a divergência `SIM/PNT` do gerador. A amostra carregada tem 48 formas. Esses achados pertencem ao protótipo e não foram atribuídos ao Escrevaral sem teste correspondente.

Não executados: `npm test` integral, lint/autoteste de APIs, navegador, desempenho, memória ou aparelho antigo. O corpus independente e o documento separado do esquema não vieram nos anexos. Nenhum teste da main foi executado nesta análise; houve leitura seletiva de código e documentos.

## Fontes e rastreabilidade

Anexos fornecidos: relatório DOCX “Relatório de comparação Escrevaral v6.59.0 × protótipo editor-gramatical” e `files(1).zip`, contendo `editor-gramatical.zip` e README. Nenhum dos anexos originais foi modificado.

Repositório consultado em 08/10/2026:

- [AGENTS.md](https://github.com/rfmss/escrevaral/blob/main/AGENTS.md), blob `9f3cb7d905509450e5b6a88d4e7b5cc132b496a0`.
- [Plano Mestre](https://github.com/rfmss/escrevaral/blob/main/docs/PLANO-MESTRE.md), blob `f88a444661b3f623055a2eca3275ac8b60c28f10`.
- [Filosofia e compatibilidade](https://github.com/rfmss/escrevaral/blob/main/docs/FILOSOFIA-E-COMPATIBILIDADE.md), blob `eb0db77db51e2767b441c62e2c324f0009354a04`.
- [Motor contextual](https://github.com/rfmss/escrevaral/blob/main/ptbr/morfologia-contextual.js).
- [Origem do PortiLexicon](https://github.com/rfmss/escrevaral/blob/main/resources/pt-BR/portilexicon/ORIGEM.json), blob `ad49381c378877e4d0674fbb2294ed5e5ddd23d1`.

Referências primárias consultadas: [formato CoNLL-U](https://universaldependencies.org/format.html), [UD DET](https://universaldependencies.org/u/pos/DET.html), [UD X](https://universaldependencies.org/u/pos/X.html) e [MDN Browser Compatibility Data para gap](https://github.com/mdn/browser-compat-data/blob/main/css/properties/gap.json). A distinção entre token gráfico e palavras sintáticas informa a proposta; os nomes dos campos e a sequência de integração são decisões de engenharia propostas nesta revisão.
