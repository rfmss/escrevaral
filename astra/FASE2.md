# Maturação do núcleo local — 9 de setembro de 2026

O handshake foi retomado no repositório `rfmss/escrevaral`, somente na branch `astra/escrevaral-master`. A ordem recente de transplante orientou vocabulário decolonial, expressões, poesia e empacotamento; em seguida entrou uma primeira base de morfologia e oração simples. A Fase 2 permanece parcial: esta entrega amplia um núcleo verificável, sem declarar cobertura completa da gramática ou maturidade de 100%.

## O que funciona

| Lente | Recorte ativo | Limite principal |
| --- | --- | --- |
| Ortografia | 6 grafias registradas | Não é corretor lexical abrangente |
| Acentuação | 6 candidatos registrados | Não desambigua pares pelo contexto |
| Pontuação | Vírgulas e pontos e vírgulas repetidos | Não faz análise sintática da pontuação |
| Classes de palavras | Dez classes representadas; 884 formas verbais exatas de 39 lemas | Expõe leituras do léxico; desconhecidos sem classe, homografias sem escolha automática |
| Orações simples | Sujeito, predicado, objeto direto, objeto indireto em `dar ... a ...`, predicativo adjetival e adjunto adverbial final | Sujeito expresso, um verbo, vocabulário e construções restritos; não resolve ordem livre, elipse, passiva, coordenação ou subordinação |
| Vocabulário decolonial | 18 expressões, distribuídas por 9 categorias | Perguntas contextuais; 588 entradas aguardam revisão individual |
| Expressões e ênfases | 1.447 locuções distintas de dois catálogos recebidos | Correspondência literal não mede frequência, originalidade ou necessidade de corte |
| Rimas | Candidatas por terminação gráfica desde a vogal tônica estimada | Confiança baixa; sem equivalência fonética, distinção completa de timbres ou sotaques |
| Métrica de versos | Divisão silábica e intervalo estimado entre leituras com/sem fusões de fronteira | Confiança baixa; não esgota hiatos, diérese, sinérese, variação regional ou execução oral |

Nada é analisado enquanto se digita. Cada lente retorna Findings com trecho UTF-16, evidência, interpretação, ambiguidade, limite e fonte. Nenhuma aplica substituição. As funções sintáticas são hipóteses informativas, nunca acusações de erro. Léxico, paradigmas e regras ficam em `conhecimento/`; máquinas puras em `maquina/`; a ponte continua sem decisões linguísticas.

## Proveniência e escolhas

O material utilizado foi o snapshot `02-nosso-experimento-pr155`, commit declarado `a029cc4fea0dd7dd4524f553031667f7ff9a0c06`, do ZIP fornecido pelo usuário. Nenhuma outra branch foi lida para transplantar código. SHA-256 do ZIP: `03c78ce4dc2a4740aec68aa81d59a8903408c9c7c64a1c7a6d2358fea15d0594`.

A conferência encontrou 227 arquivos compatíveis com o manifesto; apenas a referência do manifesto a si mesmo diverge. Isso está registrado como divergência, sem inferir adulteração. A contagem efetiva difere do relatório recebido: 606 entradas decoloniais, 1.000 entradas em `CLIQUES_PT`, 527 linhas de pleonasmos, 50 verbetes na enciclopédia de poesia e 407 entradas em `grammarWords`. Quantidade recebida não implica quantidade ativa.

`oficina/importar-cofre.js` verifica hashes e extrai literais via AST; não executa as engines antigas. O catálogo decolonial completo, seus estados de revisão e os hashes ficam em `oficina/proveniencia-cofre.json`, fora do runtime. Explicações etimológicas e sugestões de substituição não foram transplantadas. Em particular, as narrativas de origem de “criado-mudo” e “feito nas coxas” não foram adotadas sem comprovação individual. Fala marcada, citação, código, negação e certos contextos de discussão/autodesignação recebem silêncio conservador; a heurística não reconhece todo discurso relatado.

Das 1.527 linhas de expressões recebidas, 24 ficam adiadas por formato e 56 são duplicações; restam 1.447 locuções únicas. O índice de palavras é construído na oficina. A busca percorre tokens e até 16 passos por posição: O(n × L), L limitado, sem promessa de O(1) para um manuscrito inteiro. O catálogo é uma origem de observações, não autoridade normativa.

Os paradigmas verbais vêm de tabelas literais: 15 lemas irregulares, 22 regulares restritos ao presente e pretérito perfeito, e os complementos locais `ler` e `sair`. `publicar` recebe o ajuste gráfico em `publiquei`. Homografias como `fui` e `cantamos` preservam múltiplas leituras. Não se inventam lemas pela terminação. O léxico nominal é artesanal e pequeno. As 884 formas não foram todas revisadas individualmente por especialista; os testes amostrais não substituem essa revisão.

O resolvedor sintático herdado, suas escolhas por sufixo, escores, dependências modernas e importações específicas de bundler não foram incorporados. O novo analisador exige que a oração inteira caiba no recorte antes de emitir funções. Não descarta palavras desconhecidas para analisar artificialmente o restante.

A poesia foi reimplementada em ES5. Mantém acentos e separa `rr`, `ss` e `sc`; trata algumas leituras ambíguas com um pequeno léxico explícito. A [Base XX do Acordo Ortográfico](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/decreto/d6583.htm) orienta a divisão gráfica; isso não transforma contagem ortográfica em escansão definitiva. A composição manual de alguns diacríticos serve à leitura interna e mantém os offsets e o manuscrito original.

O arquivo recebido declara referências a Bechara e Cunha & Cintra, mas edições, páginas e correspondência de cada regra continuam sem conferência bibliográfica individual. Nenhuma nova regra é apresentada como calibrada integralmente nessas obras. A obra de Nascentes ainda precisa ser identificada; nenhuma atribuição foi inventada. [VOLP/ABL](https://www.academia.org.br/nossa-lingua/busca-no-vocabulario) continua referência de consulta, sem cópia da base no produto.

## Evidências de execução

`node astra/testes/run.js`: 343 verificações, zero falhas, em Node v24.19.0. Incluem 168 casos do corpus original, 47 casos de transplante, testes de divisão/tônica/métrica/rima e 52 verificações gramaticais. Há cobertura das dez classes, homografias, desconhecidos, seis construções sintáticas positivas, 17 abstenções, offsets, limites e determinismo. A ponte simulada exercita as seis novas lentes, preservação da folha e invalidação ao editar. A sintaxe ES5 de todos os arquivos de execução e a equivalência entre edição modular e portátil são conferidas.

Os fragmentos de Machado, Clarice e Rosa continuam curtos e creditados no corpus. O campo `literaryCases: 9` da saída conta apenas os nove casos originais; as novas lentes também os exercitam em testes agrupados. Não há estimativa representativa de falso positivo na literatura brasileira.

`oficina/medicao-cofre.json` registra cinco execuções por lente em V8/Linux, com rede bloqueada e sem Set, Map, Promise, normalize, includes, at ou assign. O maior máximo observado foi 15,773 ms; inicialização do núcleo, 13,007 ms. As amostras têm até 200 mil unidades UTF-16, e algumas análises param no teto de 100 achados. Esses números não medem digitação, renderização, memória, WebKit ou iPad e não permitem extrapolar a análise completa de qualquer manuscrito.

A edição portátil tem 339.350 bytes e inclui scripts, dados e estilos. Não exige instalação, servidor, build ou rede durante o uso onde HTML local é executável. Abrir uma URL não instala suporte offline; é preciso guardar `escrevaral.html`. Abertura real, importação/exportação e preservação prolongada em iOS 9.3.5 continuam pendentes. Não houve implantação no endereço público citado pelo handshake.

## Continuação prioritária

1. Validar o arquivo portátil e a preservação do acervo no aparelho alvo; medir latência e memória reais.
2. Revisar individualmente paradigmas e léxico com fontes identificadas, ampliar corpus autorizado e medir omissões/falsos positivos por regra.
3. Completar a Fase 2A: classes em contexto, funções e complementos mais amplos, coordenação/subordinação, sempre com abstenção explícita.
4. Fase 2B: hífen, concordância, regência e crase. Fase 2C: observações adicionais de voz/estilística. Revisar os 588 termos pendentes e escansão/variação oral antes de ampliar promessa de cobertura.
5. Projetar autoria e empacotamento instalável separadamente. Salvamento local não é Prova de autoria.
