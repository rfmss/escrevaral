# Jornada linguística do Escrevaral

Página permanente: https://escrevaral.com/jornada/

Atualizado em 29/09/2026. Base do produto auditada: `b72c00dc89180eb6d2cb4ac1d02d1e9c1caec5f8`.

**Propósito:** Escrever com liberdade. Examinar com clareza. Preservar cada palavra.

**Estado:** Produto v6-32 preservado; A01 ampliada publicada. A2 implementou e testou a ponte experimental entre store de pacotes e consulta lexical paginada: tickets fixados, UTF-8 estrito, fila limitada e cancelamento com conclusão física. 15 casos novos aprovados; integração instalador/store/ponte/lookup com reabertura lógica em IndexedDB simulado. Publicação deste incremento aguardando confirmação. A02 continua parcial: envelope plano, catálogo/interface e reabertura física offline pendentes. A03 não implementada.

Fonte desta página e do mapa: `docs/jornada/estado.json`. Gerar com `python3 ferramentas/gerar-jornada.py`. Não editar as cópias geradas.

## Compromisso de produto

O autor escreve; liga Escrevaral; escolhe uma única lente; recebe trechos exatos e explicados na mesma área. Nenhuma análise altera, corrige, completa ou substitui o manuscrito. O exemplo público é manual e não certifica um detector geral de subordinadas.

## Fila atual

- A02: decidir formato/versionamento para endereçamento limitado dos descritores; comparar catálogo paginado e registros separados, preservando integridade, retomada e versão anterior. Consultar bloco sem carregar lista integral; não aumentar metadataChars para esconder retenção.
- Depois: ampliar piloto e integrar catálogo, seleção/instalação explícita, falhas recuperáveis e reabertura física offline com alternativa para APIs ausentes. Ponte textual já verificada como experimento, sem consumidor no aplicativo; nenhuma fonte externa aprovada para importação.
- Avaliar Portparser em ambiente local isolado: primeiro fixar dependências, licenças e corpus reservado; depois medir inferência, alinhamento e custo antes de propor integração.
- Decompor gradualmente o controlador legado por fluxo, preservando armazenamento e experiência de escrita.
- Ampliar P06 a partir da base lexical separada: estudar contrastes entre que-sujeito, que-objeto, sujeito posposto e integrante; definir sinais de decisão e abstenção antes de implementar.
- Continuar P03–P05 por unidades delimitadas: revisar outros usos dos verbos, registrar candidatos de regência e ampliar dados somente com fonte, contexto e limites. O inventário atual não é dicionário geral.
- Publicar incrementos autorizados com verificações essenciais e pendências explícitas; revisar simplicidade/acessibilidade no código e ajustar o visual pelo retorno do autor, conforme decisão de 27/09/2026.
- Preparar avaliação reservada com critérios definidos antes da execução; não tratar casos usados no desenvolvimento como prova de generalização nem depender de outro modelo para continuar.

## Etapas

### P00 — Preservar a base

Estado: **Publicado com limites**. Depende de: base existente.

Lentes atuais, posições, autoria e triagem limitada.

- Registrar a versão publicada e suas evidências.
- Conservar o editor, os cadernos, a exportação e o acesso manual.

**Condição de conclusão:** 29 casos de lentes, 16 de triagem e registros de navegador disponíveis; Aparelhos e teste visual não são requisitos de entrega, conforme decisão atual. Reorganização v6-25 implementada: separação de fontes e cofre, 290 casos equivalentes no transporte, cache por geração/hashes e CI na main. Snapshot Portparser ainda sem inferência.

Evidências: `ptbr/README.md`, `ptbr/auditoria/verificacao.md`, `docs/ARQUITETURA.md`, `docs/CONECTORES.md`, `docs/jornada/ENTREGA-V6-25.md`.

### P01 — Receber e estudar os livros

Estado: **Em estudo inicial**. Depende de: P00.

Construir uma biblioteca de referências verificáveis.

- Catalogar obra, edição, autor, variedade linguística e estrutura.
- Conferir OCR, páginas impressas e páginas do arquivo.
- Ler por capítulos e registrar conceitos, exemplos, exceções e divergências.
- Cunha e Cintra é o guia principal. Demais obras são apoios por demanda; leitura integral ainda não concluída.

**Condição de conclusão:** Cada unidade estudada tem referência localizável, síntese própria e questões abertas. Receber um PDF não conta como leitura concluída.

Evidências: `docs/jornada/fontes.json`, `docs/jornada/LEITURA-INICIAL.md`, `docs/jornada/COMO-ESTUDAR.md`, `ptbr/CONTEXTO-1.md`, `docs/jornada/BASE-26SET.md`, `docs/jornada/ESTUDO-SINTAXE-1.md`, `docs/jornada/ESTUDO-LOCUCOES-1.md`, `docs/jornada/ESTUDO-RELATIVAS-1.md`.

### P02 — Criar o corpus de avaliação

Estado: **Corpus de desenvolvimento e avaliação externa com divergências; nova avaliação reservada pendente**. Depende de: P01.

Separar exemplos de aprendizado de exemplos de avaliação.

- Anotar positivos, negativos, ambiguidades e casos fora da cobertura.
- Revisar discordâncias e guardar textos de avaliação que não orientem as regras.
- Usar exemplos próprios ou autorizados; jamais colher silenciosamente manuscritos reais.

**Condição de conclusão:** Corpus versionado com limites exatos dos trechos, classificação esperada ou abstenção e revisão linguística registrada.

Evidências: `docs/jornada/corpus-inicial.json`, `docs/jornada/regra-modelo.json`, `ptbr/corpus/contexto-1.json`, `ptbr/corpus/sintaxe-1.json`, `docs/jornada/regras-sintaxe-1.json`, `ptbr/corpus/locucoes-1.json`, `docs/jornada/regras-locucoes-1.json`, `ptbr/corpus/relativas-1.json`, `docs/jornada/regras-relativas-1.json`, `ptbr/auditoria/DEVOLUCAO-GEMINI-1.md`, `ptbr/auditoria/devolucao-gemini-reproducao-v6-22.json`.

### P03 — Consolidar o dicionário PTBR

Estado: **Inventário sintático separado; dicionário geral parcial**. Depende de: P01, P02.

Dar às palavras inventário, flexões e possibilidades coerentes.

- Aproveitar seletivamente os dados já auditados.
- Revisar sinônimos por sentido e registro; revisar flexões e homógrafos.
- Carregar dados maiores sob demanda, com índices e sem polyfills globais.

**Condição de conclusão:** Dados têm origem rastreável, integridade, casos de cobertura e custo medido. Dicionário não é anunciado como analisador contextual.

Evidências: `ptbr/auditoria/pacote.json`, `ptbr/auditoria/DEVOLUCAO-GEMINI-1.md`, `ptbr/lexico-sintatico.js`, `ptbr/REGENCIA-1.md`.

### P04 — Reconhecer classes no contexto

Estado: **Incremento contextual publicado; avaliação reservada pendente**. Depende de: P02, P03.

Ir das classes possíveis à leitura sustentada pela frase.

- Cobrir as dez classes e suas locuções.
- Distinguir flexão, classe e função sintática.
- Começar por a, o, que, se, como, canto e palavras com múltiplas leituras.

**Condição de conclusão:** Conjunto reservado de avaliação separa acertos, falsos alarmes, perdas e abstenções por classe. Casos ambíguos preservam alternativas.

Evidências: `ptbr/morfologia-contextual.js`, `tests/ptbr-contexto.cjs`, `ptbr/CONTEXTO-1.md`.

### P05 — Construir as relações da oração

Estado: **Relações e locuções publicadas; padrões de regência separados no incremento v6-24**. Depende de: P04.

Reconhecer núcleos, dependências e fronteiras.

- Segmentar períodos e orações com posições no original.
- Tratar locuções verbais, elipse, sujeito não expresso, coordenação e encaixamento.
- Separar hipóteses de análise das relações confirmadas.

**Condição de conclusão:** Testes verificam constituintes, vínculos, sujeito e limites; locução verbal não vira várias orações por contagem mecânica.

Evidências: `docs/jornada/ESTUDO-SINTAXE-1.md`, `docs/jornada/regras-sintaxe-1.json`, `ptbr/relacoes-sintaticas.js`, `tests/ptbr-sintaxe.cjs`, `ptbr/SINTAXE-1.md`, `docs/jornada/ESTUDO-LOCUCOES-1.md`, `docs/jornada/regras-locucoes-1.json`, `ptbr/grupos-verbais.js`, `ptbr/LOCUCOES-1.md`, `tests/ptbr-locucoes.cjs`, `ptbr/lexico-sintatico.js`, `ptbr/REGENCIA-1.md`.

### P06 — Entregar orações subordinadas

Estado: **Primeiro recorte de relativas publicado; alcance geral pendente**. Depende de: P05.

Permitir escolher a lente e ler os trechos na própria aba.

- Cobrir substantivas, adjetivas, adverbiais e formas reduzidas.
- Mostrar relação com a oração ou termo de referência.
- Representar orações encaixadas e casos de classificação controversa.

**Condição de conclusão:** Detecção geral aprovada em exemplos inéditos. O parágrafo da demonstração integra o corpus, mas acertá-lo sozinho não aprova a lente.

Evidências: `docs/jornada/CONTRATO-ANALISE.md`, `docs/jornada/ESTUDO-RELATIVAS-1.md`, `docs/jornada/regras-relativas-1.json`, `ptbr/relativas.js`, `ptbr/RELATIVAS-1.md`, `tests/ptbr-relativas.cjs`.

### P07 — Conferir convenções de escrita

Estado: **Parcial**. Depende de: P04, P05.

Explicar ocorrências de ortografia e gramática dentro de critérios explícitos.

- Ampliar ortografia, acentuação, hífen e uso de maiúsculas.
- Ampliar concordância, regência, crase, pronomes e pontuação.
- Distinguir variedade, registro, opção estilística e infração de regra aplicável.

**Condição de conclusão:** Toda observação diz o critério, o contexto necessário e as exceções. Nenhuma correção automática ou selo de texto perfeito.

### P08 — Ler o texto e seus efeitos

Estado: **Parcial**. Depende de: P05, P06.

Observar relações além de uma palavra isolada.

- Coesão, referência, conectores, progressão temática e ambiguidades.
- Repetição, expressões, figuras, ritmo, rima e métrica com escopo próprio.
- Adaptar explicações a gêneros e finalidades sem pontuar valor literário.

**Condição de conclusão:** Efeitos de sentido são leituras possíveis. Métricas só aparecem com algoritmo explicado e validação; intenção do autor não é inventada.

### P09 — Construir a cortina Escrevaral

Estado: **Leitura anotada publicada; apresentação final em evolução pelo retorno do autor**. Depende de: P00.

Uma entrada simples para estudar o próprio texto.

- Escrevaral desligado: área recolhida e nenhum exame ativo.
- Ligado: mostra opções sem executar análises. Uma única lente por vez, escolhida explicitamente pelo escritor.
- Trocar de lente cancela a anterior; não existe varredura geral, fila automática de lentes ou reanálise ao digitar.

**Condição de conclusão:** Uma lente por escolha e cancelamento verificados por simulação; apresentação final e acessibilidade evoluem pelo código e pelo retorno do autor. Teste visual/aparelhos dispensado.

Evidências: `docs/jornada/CONTRATO-ANALISE.md`, `ptbr/CONTEXTO-1.md`, `ptbr/leitura-visual.js`, `ptbr/leitura-visual.css`, `ptbr/LEITURA-VISUAL.md`, `ptbr/SINTAXE-1.md`, `tests/ptbr-sintaxe.cjs`, `ptbr/LOCUCOES-1.md`, `tests/ptbr-locucoes.cjs`, `ptbr/auditoria/GEMINI-SET26.md`, `ptbr/RELATIVAS-1.md`, `tests/ptbr-relativas.cjs`.

### P10 — Integrar e comprovar cada módulo

Estado: **Verificações essenciais; revisão do código e avaliação linguística**. Depende de: P02, P09.

Transformar conhecimento em comportamento confiável no produto.

- Integrar primeiro um lote restrito de P04 e depois de P06, sem esperar todo o mapa.
- Verificar lógica de cancelamento, IME, versões, armazenamento e montagem offline/portátil; revisar APIs e custo sem exigir teste visual ou em aparelhos.
- Medir qualidade e custo por lente; conservar regressões e preparar reversão.

**Condição de conclusão:** Zero mutação do manuscrito e zero erro conhecido de posição no corpus de liberação. Limiares linguísticos e orçamento de desempenho definidos antes da avaliação reservada.

Evidências: `tests/ptbr-contexto.cjs`, `tests/ptbr-browser.cjs`, `ptbr/CONTEXTO-1.md`, `tests/ptbr-visual.cjs`, `ptbr/LEITURA-VISUAL.md`, `ptbr/SINTAXE-1.md`, `tests/ptbr-sintaxe.cjs`, `ptbr/LOCUCOES-1.md`, `tests/ptbr-locucoes.cjs`, `ptbr/auditoria/GEMINI-SET26.md`, `ptbr/RELATIVAS-1.md`, `tests/ptbr-relativas.cjs`, `ptbr/auditoria/DEVOLUCAO-GEMINI-1.md`, `ptbr/auditoria/custo-relativas-1.json`.

### P11 — Pilotar, publicar e manter

Estado: **Contínuo**. Depende de: P10.

Entregar versões úteis e manter a confiança ao longo do tempo.

- Observar usuários com diferentes experiências, gêneros e recursos de acesso.
- Publicar lotes aprovados na main conforme autorização vigente.
- Registrar SHA, evidências, limitações, decisão de publicação e retorno de uso.

**Condição de conclusão:** Cada versão declarada concluída cobre o escopo prometido, tem evidências e limitações acessíveis. Incidentes geram regressões; a manutenção continua.

Evidências: `docs/jornada/PASSAGEM-DE-TRABALHO.md`.

## Cobertura de estudo

### Escrita e sons

Fonemas e grafemas; dígrafos; encontros vocálicos e consonantais; sílaba e tonicidade; ortografia; acentuação; hífen; maiúsculas; abreviações; convenções gráficas.

### Palavras e formação

Morfemas; radical e afixos; derivação e composição; famílias; flexão nominal; flexão verbal; homógrafos; locuções; neologismos; limites do léxico.

### Dez classes

Substantivo; artigo; adjetivo; numeral; pronome; verbo; advérbio; preposição; conjunção; interjeição. Registrar outras taxonomias das obras sem misturá-las silenciosamente.

### Sistema verbal

Pessoa, número, tempo, modo e aspecto; vozes; formas nominais; auxiliares e locuções; verbos impessoais; valores contextuais e correlação temporal.

### Oração e período

Frase, oração e período; constituintes e núcleos; sujeito e predicado; objetos e complementos; adjuntos; aposto e vocativo; predicativos; elipse; ordem; coordenação.

### Subordinação substantiva

Subjetiva; objetiva direta; objetiva indireta; completiva nominal; predicativa; apositiva. Vínculos e critérios dependem da abordagem explicitada.

### Subordinação adjetiva

Restritiva e explicativa; pronomes relativos; antecedente; relativas sem antecedente expresso; encaixamento; efeito da pontuação.

### Subordinação adverbial

Causal; comparativa; concessiva; condicional; conformativa; consecutiva; final; proporcional; temporal. Conectivo isolado não determina a classificação.

### Formas reduzidas

Infinitivo, gerúndio e particípio; sujeito e controle; relações sem conectivo; ambiguidades de vínculo; distinção de locuções verbais e usos adjetivais.

### Relações normativas

Concordância nominal e verbal; regência nominal e verbal; crase; colocação pronominal; pontuação; paralelismo; adequação de registro.

### Sentido e texto

Polissemia; sinonímia por sentido; antonímia; ambiguidade; pressupostos e inferências; referência; coesão; coerência; progressão; discurso direto, indireto e indireto livre.

### Estilo, gêneros e variação

Figuras; imagens; repetição; ritmo; rima e métrica; gêneros escolares, profissionais e literários; oralidade; variedades brasileiras e lusófonas; registro e intenção declarada pelo autor.

## Experiência e continuidade

- [Como estudar](jornada/COMO-ESTUDAR.md)
- [Contrato de análise](jornada/CONTRATO-ANALISE.md)
- [Passagem de trabalho](jornada/PASSAGEM-DE-TRABALHO.md)
- [Modelo de regra](jornada/regra-modelo.json)
- [Instruções para futuras IAs](../AGENTS.md)

## Primeiro conjunto de livros

Guia principal: Cunha e Cintra (B09). Dezessete obras catalogadas; leitura parcial, nenhuma leitura integral declarada. Consulte [inventário](jornada/fontes.json), [leitura inicial](jornada/LEITURA-INICIAL.md) e [corpus proposto](jornada/corpus-inicial.json).

## Exemplo de referência

No silêncio dourado do entardecer, as folhas dançavam suavemente ao ritmo do vento, como se sussurrassem segredos antigos ao horizonte. Cada raio de sol que escapava entre os galhos parecia pintar no céu uma promessa de esperança, enquanto os passos tranquilos ecoavam pela trilha esquecida, onde o tempo parecia hesitar, convidando a alma a mergulhar na calmaria infinita daquele instante.

Os recortes e suas posições estão em `jornada/estado.json`. São leituras manuais para especificar a experiência; os limites, alternativas e relações são parte da demonstração. Não é uma análise exaustiva.

## Referências de apoio ao exemplo

- [Carla Marques — «Como se fosse» e «como fosse» (Ciberdúvidas, 2021)](https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/como-se-fosse-e-como-fosse/36489)
- [Carla Marques — Oração comparativo-condicional (Ciberdúvidas, 2024)](https://ciberduvidas-ql.iscte-iul.pt/consultorio/perguntas/oracao-compartiva-condicional-como-se-o-conhecessemos/38351)
- [Filipe Carvalho — Ambiguidade sintática e gerúndio (Ciberdúvidas, 2016)](https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/ambiguidade-sintatica-a-mae-pegou-o-bebe-chorando/33958)

As referências apoiam conceitos gerais; a aplicação ao parágrafo é uma leitura proposta, ainda sem revisão linguística independente.

## Encerramento e manutenção

Uma entrega termina quando cumpre seu escopo, tem evidências e limitações registradas e sua publicação é verificada. A primeira jornada termina com os módulos prometidos aprovados, uma interface acessível e custo compatível com os limites definidos para a referência tecnológica, sem exigência de homologação de aparelhos. Manutenção, novos casos e novas obras seguem em versões posteriores.
