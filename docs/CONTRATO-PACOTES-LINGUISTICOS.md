# Pacotes linguísticos e preparação incremental — proposta v0

Decisão recebida de Rafael por intermédio da frente ASTRA 2 em 27/09/2026. Base conferida: main `019e9105b2730476644bfb9c6644f9be2738ea11`, produto v6-28. **Direção registrada; contratos abaixo são proposta para a prova isolada, não API publicada.** A implementação atual permanece síncrona e sem preparação automática.

## Direção e escopo

O acervo local pode aproximar-se de 1 GB se houver capacidade disponível. Isso é uma possibilidade de armazenamento, não meta de download, reserva garantida ou autorização para incorporar qualquer recurso. O aplicativo deve consultar pequenos recortes, com memória, inicialização e processamento limitados separadamente do tamanho instalado. Não incorporar o acervo inteiro ao bundle, ao HTML portátil ou a um JSON descomprimido em memória.

Preparação leve nas pausas passa a ser permitida como direção de produto. Ela atualiza sinais e dados reutilizáveis de regiões alteradas e do contexto necessário. Não executa todas as lentes nem atualiza silenciosamente diagnósticos completos. Suspender ao digitar, durante IME, com a página oculta e quando o controle de análise estiver desligado. Uma análise completa continua dependendo de escolha explícita. Manuscrito intocável.

A fronteira de invalidação pode exceder o trecho editado: token, oração, parágrafo ou contexto declarado pelo motor. Quando não houver delimitação segura ou orçamento, invalidar mais amplamente e manter “não verificado”; não varrer repetidamente o documento para simular incrementalidade.

Sem prazo de calendário. Entregas delimitadas e evidência orientam a sequência. KitKat/iPad 2012 seguem referências de economia tecnológica; não são aparelhos a homologar.

## Divisão de arquivos e integração

| Responsável | Área | Regra |
| --- | --- | --- |
| ASTRA 1 | `src/app/`, `src/storage/`, `src/ui/`, `src/editor/`, `src/index.template.html`, `ptbr/painel.js`, `ptbr/leitura-visual.*` | Produto, C04, persistência/instalação, offline, preparação, interface e integração. C04 ainda não iniciou na base desta decisão. |
| ASTRA 1 | `build/`, `scripts/build.cjs`, `package*.json`, `.github/`, `docs/PLANO-MESTRE.md`, `docs/jornada/estado.json`, `docs/jornada/plano-voo.json` | Único integrador na main; gera distribuições. ASTRA 2 não altera estes arquivos no primeiro lote. |
| ASTRA 2 | `docs/recursos/` (nova), `packages/experiments/lexical-index/` (nova) | Comparação, procedência/licenças, conversores e prova lexical isolada, incluindo testes e fixtures próprios. Não entra em `build/modules.json`. |
| Compartilhado, integração por ASTRA 1 | Este documento, `docs/CONECTORES.md`, `packages/cofre/README.md`, `src/editor/contrato-analise.js` | Propor mudanças em notas da prova; combinar versão antes de alterar o contrato de produção. |
| ASTRA 2 em entregas futuras combinadas | Motores puros de `packages/cofre/src/`, `ptbr/` e dados `resources/pt-BR/` | Não editar estes caminhos existentes em paralelo sem delimitar previamente os arquivos. |

Não editar saídas `index.html`, `escrevaral.html`, `service-worker.js`, `assets/` ou `jornada/index.html` diretamente. A main pertence à integração de produto. ASTRA 2 entrega patch/commit de referência ou arquivos delimitados, acompanhados da base exata; não publica na main. Essa regra não exige criar uma branch por rotina.

## Onde conectar

Hoje `EscrCofre.create()` e `vault.analyze(lensId, text)` são síncronos. `E.analysisContract.request/current/analyze`, em `src/editor/contrato-analise.js`, vinculam análise à folha, registro, revisão e texto exato, e convertem posições do recorte para o original. `current` compara também o rascunho: a revisão persistida sozinha não distingue todas as teclas ainda não salvas.

Não transformar `vault.analyze` em Promise nem fazer I/O dentro do cofre. Criar uma fronteira separada de recursos: o hospedeiro lê blocos; o núcleo lexical interpreta bytes/dados e responde. Após carregamento, um adaptador poderá fornecer dados às lentes. A prova deve funcionar com um leitor falso ou de arquivos locais, sem DOM, armazenamento de navegador ou rede no motor puro.

Proposta de assinaturas para a prova, em estilo ES5/callback:

- `readBlock(packageId, packageVersion, blockId, done)` retorna um handle com `cancel()`; callback `done(error, payload)` entrega no máximo uma resposta aceita. O hospedeiro cuida de acesso e integridade. Fixtures devem exercitar resposta atrasada mesmo após cancelamento.
- `lookup(request, done)` retorna um handle com `cancel()` e consulta somente blocos necessários através do leitor injetado. Não recebe o editor nem métodos de gravação.
- `dispose()` libera cache e invalida pedidos pendentes. Evicção também ocorre durante uso, dentro do limite configurado.

Essas assinaturas não exigem Promise, Worker, `fetch`, `requestIdleCallback` ou `AbortController` no consumidor antigo. Ferramentas de conversão/build podem usar ambiente moderno. Cancelamento cooperativo interrompe entre unidades; não promete interromper `JSON.parse` ou descompressão síncrona já iniciada. Por isso o tamanho de cada unidade é parte do contrato.

## Identidade da consulta e resposta

Pedido leva `schemaVersion`, `requestId`, `documentId`, `recordId`, revisão persistida, geração do rascunho (`textGeneration`), `scope {start,end}`, `contextScope`, `engineId`, `engineVersion` e versões dos pacotes. A prova pode receber o pequeno snapshot necessário, acompanhado de `baseOffset`; nenhuma leitura do manuscrito global pelo motor.

Resposta ecoa a identidade, explicita cobertura e retorna candidatos, ambiguidades e proveniência. Offsets finais são UTF-16 do original; `start` inclusivo e `end` exclusivo. O consumidor confere `original.slice(start,end) === snippet`, geração, folha, pedido ativo e versões antes de exibir/reusar. Não basta encontrar o mesmo texto em outra posição ou folha. Normalização para busca exige mapeamento explícito; preservar contrações e Unicode decomposto.

Separar estados de consulta lexical (`encontrado`, `ausente-no-pacote`, `indisponivel`, `cancelado`, `falha`) de sinais de pertinência (`encontrado`, `nao-encontrado-no-recorte`, `nao-verificado`). Ausência lexical não é erro ortográfico nem ausência de construção sintática. Falha, falta de pacote e orçamento esgotado não viram resultado negativo.

Cache inclui pacote/versão, motor/versão, chave normalizada e, quando contextual, identidade do contexto. Não guardar todos os snapshots. Limites de entradas, bytes e pedidos concorrentes são explícitos. O hospedeiro descarta respostas antigas mesmo se a leitura física não puder ser cancelada.

## Manifesto e limites a medir

Manifesto versionado declara: identificador/versão, variedade e cobertura; fontes/commits; licenças de código, dados e modelos separadamente; atribuições; versão do conversor; normalização/tokenização; formato/codificação; índice; lista de blocos; comprimentos e hashes SHA-256; dependências necessárias.

O índice também deve ter tamanho contabilizado e limite de carregamento; se crescer, hierarquizar ou particionar. Prefixos são uma alternativa. Chaves muito frequentes e entradas grandes não podem produzir blocos ilimitados.

Antes da integração, fixar e medir `maxBlockEncodedBytes`, `maxBlockDecodedBytes`, `maxResidentBytes`, limite de entradas, concorrência, tempo por fatia e contexto máximo. Não usar a pausa de digitação como suposta garantia de disponibilidade de CPU. Não fixamos números sem a primeira prova. Hash confere integridade; autenticidade/procedência depende de fonte confiável e não decorre só do hash.

## Instalação, atualização e offline — responsabilidade ASTRA 1

Pacotes grandes são opcionais e separados do núcleo portátil. Instalação precisa verificar espaço disponível quando possível, tratar quota/falha mesmo após estimativa, manter versão anterior utilizável e ativar a nova somente após completar/validar dependências. Instalação parcial não aparece como instalada. Recuperação distingue blocos ausentes de conteúdo inválido. Nunca retirar manuscritos para liberar espaço de pacotes.

C03 cobriu o núcleo atual: reabrir a mesa portátil e recuperar acervo; **não implementou instalação persistente de pacotes grandes**. O novo marco A02 deverá demonstrar reabertura e consulta dos pacotes instalados sem rede, com caminho declarado para ambientes sem service worker ou armazenamento suficiente. Não presumir leitura de pasta local por XHR nem prometer 1 GB em todo navegador. Persistência e alternativa devem ser decididas antes da integração, sem exigir APIs novas para escrever.

## Primeira entrega ASTRA 2 — A01

1. Comparação de PortiLexicon-UD, portTokenizer, LanguageTool, CoGrOO e Porttinari: versão/commit, procedência, evidência PT-BR, licença de cada componente, dependências, tamanho, custo e cobertura. Distinguir medido, publicado pela fonte e estimado. Candidatos, não incorporações aprovadas; recursos de dados/tokenização não equivalem a analisador sintático.
2. Prova pequena de consulta lexical particionada, com fixture redistribuível e manifesto reproduzível. Sem dependência adicionada ao editor, sem acervo inteiro no bundle e sem baixar 1 GB como pré-requisito da prova.
3. Relatório: quantidade/bytes dos blocos lidos, tamanho do índice, cache frio/quente, pico de memória com método identificado, custo de conversão e consulta; separar leitura, decodificação e busca. Não usar consumo de um processo Node como promessa para navegador antigo.
4. Casos: palavra desconhecida, homógrafos/ambiguidade, flexões, contrações, Unicode decomposto, emoji, ocorrências repetidas, fronteira de bloco, corrupção, pacote ausente, cancelamento e resposta de revisão antiga. Decisões de sintaxe continuam fora de uma simples busca lexical.
5. Handoff: base SHA, arquivos alterados, comandos reproduzíveis, licenças, resultados, limites e mudanças sugeridas nesta proposta. ASTRA 1 revisa e integra.

## Sequência

ASTRA 1 continua C04. ASTRA 2 pode avançar A01 isoladamente em paralelo. A02 (pacotes persistentes/offline) depende de A01 e C04; A03 (preparação nas pausas e destaque de lentes) depende de contratos estabilizados em A01/A02. “Todas as análises” permanece acessível; triagem não elimina opções com base em indícios incompletos. O controle final U01 deve refletir essa direção sem executar exames completos automaticamente.

## Aceite da primeira prova — 28/09/2026

A sequência acima registra a decisão original. C04 foi concluída; A1 revisou a primeira prova A01 da A2, SHA `1ae834fbd675e1bed27acd42ac930082791ce7a2`, no PR #188. Aceite, reprodução e limites em [Revisão A1](recursos/REVISAO-A1-A01-2026-09-28.md); publicação em [Entrega A01](jornada/ENTREGA-A01-REVISAO.md). Não há importação do experimento no runtime de produção.

Para a ponte seguinte, ficam aceitas as distinções de orçamento de payload versus RAM total, completude versus êxito técnico, versão/geração fixadas e conclusão física obrigatória mesmo após cancelamento. A consulta pode cancelar silenciosamente sua entrega de resultado; o callback do leitor precisa concluir para liberar a vaga, e o instalador continua reportando cancelamento. A fronteira do produto captura exceções síncronas sem convertê-las em ausência lexical.

`maxSliceMs` é observação, não preempção de parse. O índice integral limitado serviu à primeira prova; a paginação e a raiz pequena serão a próxima entrega da A2 para A02. A1 fará decodificação UTF-8 estrita e limitada, ligação de tickets e identidade real do rascunho. Bytes de índices também são blocos sujeitos aos limites de A02. Não embutir índice grande nos metadados de instalação. Nenhuma dessas decisões ativa preparação incremental ou aprova redistribuição de corpus externo.
