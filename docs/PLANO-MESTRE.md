# Escrevaral — plano mestre e guia de retomada

**Comece por aqui se for ajudar, revisar ou continuar o projeto, com ou sem acesso às conversas anteriores.**

Este documento explica o destino, as decisões, o que já existe, o que falta e como verificar o avanço real no GitHub. É um guia de execução; uma intenção escrita não comprova implementação.

**Repositório:** https://github.com/rfmss/escrevaral · **Branch de trabalho:** `main` · **Produto:** https://escrevaral.com · **Mapa público:** https://escrevaral.com/jornada/

**Retrato conferido em 27/09/2026, horário de Brasília:** main `cb9c6ec1cfb5e8dffecda1c45a59b676ac9291fa`; produto v6-25 em `db3fde26d0662568ac198f878d3cc861babfc8f0`. Esses SHAs são referências da conferência, não a promessa de que a main continuará neles. Consulte o GitHub antes de agir.

## 1. O que estamos construindo

Um ambiente de escrita em português brasileiro em que o autor conserva controle sobre cada palavra e pode examinar seu texto por lentes linguísticas. Cada leitura apresenta trecho literal, explicação, fonte, alternativas e limites. O objetivo abrange palavras, orações, texto e recursos expressivos, com aprofundamento acessível e sem atribuir nota de valor literário.

O editor, cadernos, exportação, autoria e armazenamento local já existem. O trabalho atual amplia os motores linguísticos e organiza sua sustentação técnica. Não reconstruir o editor inteiro a cada incremento.

O cofre linguístico deve poder ser transportado para outro projeto sem carregar interface ou dados pessoais. Reaproveitar recursos existentes quando sua origem brasileira, licença, custo e qualidade forem compatíveis. Não presumir que existe um motor pronto para todo fenômeno do plano.

## 2. Como descobrir o estado verdadeiro

| Pergunta | Fonte a consultar |
| --- | --- |
| Quais decisões devo respeitar? | Instruções atuais de Rafael e [AGENTS.md](../AGENTS.md) |
| Qual é o plano e a sequência? | Este guia e [Jornada](JORNADA-LINGUISTICA.md) |
| Qual é o estado declarado mais recente? | [estado.json](jornada/estado.json): `current`, `next`, etapas e evidências |
| O que foi implementado de fato? | Código na main atual, [manifesto de módulos](../build/modules.json) e diff dos commits |
| O que foi testado e com qual alcance? | Testes/corpus e relatório da entrega correspondente; sucesso de CI não certifica toda a língua |
| O que foi publicado? | SHA remoto + execução do GitHub Pages para esse SHA; conferir separadamente CI e deploy |
| O que o autor realmente vê? | Inspeção do produto no navegador, quando disponível; deploy não substitui essa inspeção |
| Como retomar uma entrega anterior? | [Modelo de passagem](jornada/PASSAGEM-DE-TRABALHO.md) e [entrega v6-25](jornada/ENTREGA-V6-25.md) |

Conversa, ZIP, screenshot e relatório antigo ajudam a reconstruir decisões, mas não substituem a main atual. A página Jornada é gerada de `estado.json`; não é uma segunda fonte independente.

### Roteiro de conferência do GitHub

Num checkout existente, execute leituras e fetch antes de editar:

```sh
git status --short
git branch --show-current
git fetch origin main
git rev-parse HEAD
git rev-parse origin/main
git log -8 --oneline origin/main
git diff --stat HEAD..origin/main
git show origin/main:docs/jornada/estado.json
```

Verifique os workflows na [página Actions](https://github.com/rfmss/escrevaral/actions), pelo SHA exato. Compare a base do último relatório com a HEAD, leia os diffs relevantes e registre o que mudou. Não use `pull`, `reset`, `clean`, force push ou descarte de arquivos como procedimento automático de retomada. Preserve alterações locais e trabalho concorrente; atualize a base sem sobrescrevê-los.

Sem shell, consulte main, commits, arquivos e Actions pelo GitHub/API. Sem acesso ao repositório, declare que o estado remoto não foi conferido e trabalhe apenas no escopo verificável. Não invente uma confirmação.

## 3. Decisões de produto já tomadas

- **Manuscrito imutável pelas análises.** Nenhuma lente ou botão de resultado pode corrigir, substituir, completar ou apagar texto. Localizar e copiar não são editar.
- **Uma lente por escolha explícita.** Abrir o painel só oferece opções. Trocar de lente cancela a anterior. Não executar varredura geral, fila automática nem reanálise enquanto o autor digita.
- **Resultados ligados à origem.** Conferir folha, revisão e recorte. Edição, troca de folha e composição IME invalidam resultados antigos. Duas folhas com texto igual continuam sendo documentos distintos.
- **Explicar limites.** Ausência de apontamentos não aprova o texto. Ambiguidade preserva alternativas; abster-se é uma saída legítima. Não deduzir intenção, erro ou valor literário a partir de um sinal isolado.
- **Português brasileiro como alvo.** Registrar evidência da variedade dos dados/modelo; uma biblioteca multilíngue não se torna exclusivamente brasileira pelo nome do conector. Sinônimos exigem sentido e registro; UD não equivale automaticamente à análise escolar tradicional.
- **Local por padrão.** Não enviar manuscritos, livros ou dados de escrita a serviços externos silenciosamente. Hospedar um serviço ou ativar modelo remoto exige decisão específica de produto.
- **Arquitetura modular.** A index contém estrutura e referências. O HTML único é distribuição portátil gerada. Não voltar a desenvolver dentro dele.
- **Preservar experiência e dados.** Não mudar recepção, cadernos, navegação, chaves de armazenamento ou exportação por conveniência de uma tarefa linguística.
- **Execução autônoma no escopo aprovado.** Rafael autorizou implementar e publicar incrementos na main, com verificações essenciais. Não solicitar a mesma autorização de novo. Não interpretar essa autorização como permissão para novas dependências de serviço ou mudanças materiais de produto.
- **Auditoria ampla em frente própria.** Navegadores, aparelhos, acessibilidade e offline real continuam pendentes. A decisão do autor permite publicar incrementos com essas lacunas registradas; não permite dizer que foram auditados.
- **Continuidade independente de outros modelos.** Avaliações antigas do Gemini são histórico; a fila atual não depende de delegação ou de uma nova devolução dele.

O comportamento detalhado está no [contrato de análise](jornada/CONTRATO-ANALISE.md). A versão publicada usa o painel Examinar; a apresentação final do controle/cortina Escrevaral ainda está pendente.

## 4. Quanto já avançamos

Na base conferida, há **16 lentes com escopos delimitados**. Isso não significa 16 motores gerais nem 16 áreas concluídas. Nenhum dos seis blocos linguísticos P03–P08 foi declarado integralmente concluído.

| Grupo | IDs disponíveis | Alcance atual resumido |
| --- | --- | --- |
| Convenções | `ortografia`, `acentuacao`, `pontuacao`, `crase`, `concordancia` | Listas locais, sequências mecânicas e construções gramaticais específicas; não é revisão geral |
| Morfossintaxe | `morfologia`, `sintaxe`, `relativas` | Leituras contextuais restritas, orações reconhecidas pelo léxico local e primeiro recorte de que-sujeito |
| Expressões e escolhas | `decolonial`, `expressoes`, `adverbios` | Catálogos explícitos e reflexão contextual; presença não implica intenção, clichê ou excesso |
| Texto e poesia | `repeticao`, `ritmo`, `rima`, `metrica`, `dialogo` | Contagens/padrões locais, terminações gráficas, escansão aproximada e linhas de diálogo por travessão |

A v6-25 entregou fontes separadas, build reproduzível, cofre transportável, manual de conectores e CI na main. O controlador legado do editor continua grande e a cascata CSS mantém a ordem histórica.

**Evidência conhecida:** 17 scripts de verificação essenciais; 290 casos equivalentes entre a ordem anterior dos módulos e o cofre isolado; CI e deploy da v6-25 concluídos. Os 290 casos são evidência de preservação na reorganização, não medição de cobertura do português ou avaliação reservada do modelo.

**Portparser:** snapshot seletivo atribuído e fixado por commit; adaptador local CoNLL-U testado com anotação manual. Pesos, léxicos e runtime de inferência não instalados. Não executado nem integrado como motor do produto. [Estado e critérios completos](../packages/connectors/portparser/README.md).

### Como medir progresso sem fabricar porcentagens

A lista fechada de capacidades da primeira versão linguística ainda não foi definida. Portanto, não existe percentual global verificável. Etapas têm tamanhos diferentes; contar arquivos, testes, livros, botões ou etapas iniciadas não resolve isso.

Antes de apresentar um percentual, registrar capacidades com ID, escopo, exclusões, dependências e critérios de aceite. Fixar o denominador da versão e explicitar alterações posteriores. A métrica simples poderá ser `capacidades aceitas / capacidades previstas na versão × 100`, sem apresentá-la como porcentagem da língua ou do esforço. Se houver pesos, defini-los antes da medição.

Registrar cada capacidade em estados separados: **estudada → especificada → implementada → testada no desenvolvimento → avaliada em corpus reservado → integrada → publicada**. Não promover todos os estados porque um teste passou. Qualidade linguística, cobertura, desempenho e publicação são medidas distintas.

## 5. Plano completo por etapas

As dependências e estados abaixo reproduzem o retrato de `estado.json` na data desta edição. Para uma retomada futura, leia a versão atual desse arquivo e as evidências vinculadas a cada etapa.

| ID | Entrega e trabalho necessário | Dependências | Estado na base conferida |
| --- | --- | --- | --- |
| P00 — Preservar a base | Lentes atuais, posições, autoria e triagem limitada. Registrar a versão publicada e suas evidências. Conservar o editor, os cadernos, a exportação e o acesso manual. | Base | Publicado com limites |
| P01 — Receber e estudar os livros | Construir uma biblioteca de referências verificáveis. Catalogar obra, edição, autor, variedade linguística e estrutura. Conferir OCR, páginas impressas e páginas do arquivo. Ler por capítulos e registrar conceitos, exemplos, exceções e divergências. Cunha e Cintra é o guia principal. Demais obras são apoios por demanda; leitura integral ainda não concluída. | P00 | Em estudo inicial |
| P02 — Criar o corpus de avaliação | Separar exemplos de aprendizado de exemplos de avaliação. Anotar positivos, negativos, ambiguidades e casos fora da cobertura. Revisar discordâncias e guardar textos de avaliação que não orientem as regras. Usar exemplos próprios ou autorizados; jamais colher silenciosamente manuscritos reais. | P01 | Corpus de desenvolvimento e avaliação externa com divergências; nova avaliação reservada pendente |
| P03 — Consolidar o dicionário PTBR | Dar às palavras inventário, flexões e possibilidades coerentes. Aproveitar seletivamente os dados já auditados. Revisar sinônimos por sentido e registro; revisar flexões e homógrafos. Carregar dados maiores sob demanda, com índices e sem polyfills globais. | P01, P02 | Inventário sintático separado; dicionário geral parcial |
| P04 — Reconhecer classes no contexto | Ir das classes possíveis à leitura sustentada pela frase. Cobrir as dez classes e suas locuções. Distinguir flexão, classe e função sintática. Começar por a, o, que, se, como, canto e palavras com múltiplas leituras. | P02, P03 | Incremento contextual publicado; avaliação reservada pendente |
| P05 — Construir as relações da oração | Reconhecer núcleos, dependências e fronteiras. Segmentar períodos e orações com posições no original. Tratar locuções verbais, elipse, sujeito não expresso, coordenação e encaixamento. Separar hipóteses de análise das relações confirmadas. | P04 | Relações e locuções publicadas; padrões de regência separados no incremento v6-24 |
| P06 — Entregar orações subordinadas | Permitir escolher a lente e ler os trechos na própria aba. Cobrir substantivas, adjetivas, adverbiais e formas reduzidas. Mostrar relação com a oração ou termo de referência. Representar orações encaixadas e casos de classificação controversa. | P05 | Primeiro recorte de relativas publicado; alcance geral pendente |
| P07 — Conferir convenções de escrita | Explicar ocorrências de ortografia e gramática dentro de critérios explícitos. Ampliar ortografia, acentuação, hífen e uso de maiúsculas. Ampliar concordância, regência, crase, pronomes e pontuação. Distinguir variedade, registro, opção estilística e infração de regra aplicável. | P04, P05 | Parcial |
| P08 — Ler o texto e seus efeitos | Observar relações além de uma palavra isolada. Coesão, referência, conectores, progressão temática e ambiguidades. Repetição, expressões, figuras, ritmo, rima e métrica com escopo próprio. Adaptar explicações a gêneros e finalidades sem pontuar valor literário. | P05, P06 | Parcial |
| P09 — Construir a cortina Escrevaral | Uma entrada simples para estudar o próprio texto. Escrevaral desligado: área recolhida e nenhum exame ativo. Ligado: mostra opções sem executar análises. Uma única lente por vez, escolhida explicitamente pelo escritor. Trocar de lente cancela a anterior; não existe varredura geral, fila automática de lentes ou reanálise ao digitar. | P00 | Leitura anotada publicada; QA visual e apresentação final pendentes |
| P10 — Integrar e comprovar cada módulo | Transformar conhecimento em comportamento confiável no produto. Integrar primeiro um lote restrito de P04 e depois de P06, sem esperar todo o mapa. Testar cancelamento, IME, versões do texto, memória, offline e portátil. Medir qualidade e custo por lente; conservar regressões e preparar reversão. | P02, P09 | Verificações essenciais aprovadas; auditoria ampla posterior autorizada |
| P11 — Pilotar, publicar e manter | Entregar versões úteis e manter a confiança ao longo do tempo. Observar usuários com diferentes experiências, gêneros e recursos de acesso. Publicar lotes aprovados na main conforme autorização vigente. Registrar SHA, evidências, limitações, decisão de publicação e retorno de uso. | P10 | Contínuo |

P00 e P09 dão sustentação ao produto; P01–P02 alimentam evidências; P03–P08 constroem capacidade linguística; P10 comprova cada incremento; P11 publica e acompanha. Não é necessário terminar toda a gramática para integrar um recorte útil.

## 6. Abrangência linguística prevista

O mapa inclui as áreas abaixo. Elas descrevem o destino; não são alegações de cobertura atual. Morfossintaxe cruza morfologia e sintaxe e não deve ser contada duas vezes no progresso. Fonética acústica exigiria entrada de áudio e uma definição própria; não está entregue pelo editor textual. Pragmática, coerência e discurso permanecem objetivos amplos sem motor geral validado.

| Área | Escopo planejado |
| --- | --- |
| Escrita e sons | Fonemas e grafemas; dígrafos; encontros vocálicos e consonantais; sílaba e tonicidade; ortografia; acentuação; hífen; maiúsculas; abreviações; convenções gráficas. |
| Palavras e formação | Morfemas; radical e afixos; derivação e composição; famílias; flexão nominal; flexão verbal; homógrafos; locuções; neologismos; limites do léxico. |
| Dez classes | Substantivo; artigo; adjetivo; numeral; pronome; verbo; advérbio; preposição; conjunção; interjeição. Registrar outras taxonomias das obras sem misturá-las silenciosamente. |
| Sistema verbal | Pessoa, número, tempo, modo e aspecto; vozes; formas nominais; auxiliares e locuções; verbos impessoais; valores contextuais e correlação temporal. |
| Oração e período | Frase, oração e período; constituintes e núcleos; sujeito e predicado; objetos e complementos; adjuntos; aposto e vocativo; predicativos; elipse; ordem; coordenação. |
| Subordinação substantiva | Subjetiva; objetiva direta; objetiva indireta; completiva nominal; predicativa; apositiva. Vínculos e critérios dependem da abordagem explicitada. |
| Subordinação adjetiva | Restritiva e explicativa; pronomes relativos; antecedente; relativas sem antecedente expresso; encaixamento; efeito da pontuação. |
| Subordinação adverbial | Causal; comparativa; concessiva; condicional; conformativa; consecutiva; final; proporcional; temporal. Conectivo isolado não determina a classificação. |
| Formas reduzidas | Infinitivo, gerúndio e particípio; sujeito e controle; relações sem conectivo; ambiguidades de vínculo; distinção de locuções verbais e usos adjetivais. |
| Relações normativas | Concordância nominal e verbal; regência nominal e verbal; crase; colocação pronominal; pontuação; paralelismo; adequação de registro. |
| Sentido e texto | Polissemia; sinonímia por sentido; antonímia; ambiguidade; pressupostos e inferências; referência; coesão; coerência; progressão; discurso direto, indireto e indireto livre. |
| Estilo, gêneros e variação | Figuras; imagens; repetição; ritmo; rima e métrica; gêneros escolares, profissionais e literários; oralidade; variedades brasileiras e lusófonas; registro e intenção declarada pelo autor. |

## 7. Sequência de execução na retomada

**Primeiro conferir se a main já avançou além deste retrato.** Se avançou, atualizar a fila a partir dos commits e evidências, sem repetir trabalho pronto.

| Ordem | Próxima entrega delimitada | Como saber que terminou |
| --- | --- | --- |
| 1 | Preparar avaliação local do Portparser: inventário completo de runtime, tokenização, pesos, dados, versões e licenças; definir corpus reservado e orçamento de execução antes de medir | Manifesto reproduzível e protocolo escritos; dependências obtidas/ausentes explicitadas; nenhum envio de manuscrito |
| 2 | Executar inferência isolada quando o ambiente estiver disponível; medir tokenização, morfologia, dependências, posições UTF-16, contrações, abstenções, memória e latência | Relatório com comandos, versões, amostra, resultados reais, falhas e conclusão de viabilidade; não substituir por métricas anunciadas pelo upstream |
| 3 | Decidir como aproveitar o motor e os dados, mantendo o cofre transportável | Integração proposta a partir da evidência; serviço remoto ou alteração material do produto depende de decisão específica; nenhuma ativação automática |
| 4 | Ampliar o recorte P06: contrastar que-sujeito, que-objeto, sujeito posposto e integrante; sustentar regras e abstenções com P03–P05 | Estudo e casos contrastantes antes do código; depois implementação delimitada, regressões, integração e publicação com alcance declarado |
| 5 | Continuar os demais recortes de P03–P08 conforme dependências, sem abandonar o plano amplo | Uma capacidade de cada vez com fonte, contrato, cobertura e evidência, incluindo negativos/ambíguos |

Se pesos, licença ou ambiente impedirem a inferência, registrar o bloqueio concreto e avançar uma tarefa independente de P03–P06. Não ficar repetindo downloads/testes bloqueados nem declarar o motor avaliado.

A definição do catálogo fechado da primeira versão deve acompanhar o planejamento dos próximos recortes para permitir acompanhar progresso. Não existe aprovação para fingir que essa definição já aconteceu.

**Frente técnica de manutenção:** decompor o controlador por fluxo, preservar a compatibilidade e melhorar limites de módulos conforme o uso justificar. A extração inicial está entregue; não reiniciá-la. **Frente de auditoria posterior:** navegador, teclado/foco, zoom/contraste, IME, cancelamento, aparelhos modestos, PWA/offline/portátil e avaliação linguística reservada. Manter essa fila visível sem transformar sua pendência num pedido repetido de autorização para publicar incrementos já aprovados.

## 8. Onde alterar e como verificar

| Responsabilidade | Arquivos de entrada |
| --- | --- |
| Marcações e inicialização | `src/index.template.html`, `src/app/` |
| Integração, revisão e seleção | `src/editor/contrato-analise.js`, `src/editor/controlador.js` |
| Interface e dados do autor | `src/ui/`, `src/storage/` |
| Cofre puro e API | `packages/cofre/`, [manual do cofre](../packages/cofre/README.md) |
| Dados e módulos PT-BR existentes | `resources/pt-BR/local/`, `ptbr/` |
| Conectores e avaliação externa | `packages/connectors/`, [manual dos conectores](CONECTORES.md) |
| Ordem, versão e montagem | `build/modules.json`, `build/release.json`, `scripts/build.cjs` |
| Corpus e evidências | `ptbr/corpus/`, `tests/`, `docs/jornada/`, relatórios por incremento |
| Fluxo completo da arquitetura | [ARQUITETURA.md](ARQUITETURA.md) |

O cofre puro não conhece DOM, localStorage ou cadernos. Sua API é síncrona; cancelamento de trabalho pesado requer projeto de Worker/processo e conferência de respostas antigas no consumidor. Não prometer esse mecanismo como já integrado.

Não editar manualmente `index.html`, `escrevaral.html`, `service-worker.js` ou `assets/`. `npm run build` gera site modular, HTML portátil e pacote independente das mesmas fontes. A publicação atual usa a raiz da main; os arquivos gerados ficam versionados por essa razão.

```sh
npm ci --ignore-scripts
npm run build:check
# Após alterar fontes:
npm run build
# Executar verificações relacionadas ao risco; suíte essencial disponível:
npm test
# Para desenvolver localmente, após a montagem:
npm start
```

A auditoria em navegador tem comando/workflow próprios no [README](../README.md). Uma falha de instalação do navegador não é falha linguística, nem conta como teste visual executado. Alteração exclusivamente documental exige conferir conteúdo, referências e arquivos gerados pertinentes; não exige reexecutar toda a auditoria.

## 9. Como usar livros e recursos externos

Cunha e Cintra é a referência principal acordada; Bechara e demais obras apoiam unidades delimitadas. O mapa menciona 17 livros recebidos; receber/catalogar não significa ler integralmente. Os oito primeiros têm rastreabilidade inicial em [fontes.json](jornada/fontes.json). Consulte o [procedimento de estudo](jornada/COMO-ESTUDAR.md), a unidade estudada e suas páginas reais.

Não depender de anexos desta conversa para retomar: o conhecimento operacional deve estar nas sínteses próprias, regras, corpus, código e evidências versionadas. Se uma obra necessária não estiver acessível, registrar isso; não inventar citação ou leitura. Não publicar os PDFs recebidos por conveniência.

Para motores prontos, conferir origem dos dados/modelo brasileiro, commit, licença de código/pesos/dados separadamente, tamanho e custo. Guardar atribuições e hashes. Um snapshot não é instalação; instalação não é inferência; inferência não é validação; validação técnica não é integração de produto. Não atribuir ao português regras derivadas de ensaios sobre o inglês sem exame do contexto.

## 10. O que atualizar ao terminar uma contribuição

1. Identificar etapa e capacidade alteradas, base remota, arquivos e efeitos reais no produto.
2. Registrar fontes consultadas, verificações executadas, resultados e limites no formato de [passagem de trabalho](jornada/PASSAGEM-DE-TRABALHO.md).
3. Atualizar `estado.json` se o estado ou fila mudou, incluindo `current`, `next`, evidências e campos de decisão que ficaram obsoletos. Manter separado o que está implementado, testado e publicado.
4. Rodar `python3 ferramentas/gerar-jornada.py` para regenerar Jornada Markdown e página; não editar essas cópias à mão. Atualizar este guia se mudarem decisões, escopo, marcos ou ordem de retomada.
5. Conferir diff e concorrência na main; publicar dentro da autorização vigente, sem force push ou perda de trabalho alheio.
6. Confirmar SHA remoto, CI e deploy separadamente. Registrar URLs, falhas ou pendências. Nunca marcar publicado apenas porque há um commit local.
7. Deixar uma próxima tarefa concreta com dependência e critério de aceite. O próximo colaborador deve conseguir retomá-la sem pedir a Rafael que reconte a conversa.

### Instrução curta para passar a outra IA

> Leia `AGENTS.md` e `docs/PLANO-MESTRE.md` em `rfmss/escrevaral`. Confira a HEAD atual da main, `docs/jornada/estado.json`, os commits posteriores à base documentada e as execuções de CI/deploy. Diga o que está implementado, o que está validado e o que falta antes de escolher a próxima tarefa. Preserve o manuscrito, uma lente por escolha e as decisões de publicação existentes. Continue pelo código e pelas evidências atuais, sem tratar documentos históricos como estado presente.
