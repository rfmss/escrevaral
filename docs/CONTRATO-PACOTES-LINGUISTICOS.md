# Pacotes linguísticos e preparação incremental — proposta v0

Decisão recebida de Rafael por intermédio da frente ASTRA 2 em 27/09/2026. Base conferida: main `019e9105b2730476644bfb9c6644f9be2738ea11`, produto v6-28. **Direção registrada; contratos abaixo são proposta para a prova isolada, não API publicada.** O cofre continua síncrono; a primeira preparação limitada do painel foi integrada na v6.57, conforme seção vigente abaixo.

## Proteções distantes sob comando — 08/10/2026, v6.61

[A03-fronteiras](jornada/ENTREGA-V6-61.md) amplia o pedido de contexto além de8.000 unidades: prova de proteção por fatias de até2.000, um estado transitório e cancelamento a cada passo, somente após comando. O padrão é compartilhado com protectedText. Linhas anteriores maiores que a fatia sem LF e fronteiras somente CR continuam com abstenção explícita. Preparação700ms/2000/400/24 e limite200mil do exame preservados; não cria cache do livro. A03 geral permanece parcial.

## Exame contextual da reserva — 08/10/2026, v6.60

[Contrato e evidências A03-contexto](jornada/ENTREGA-V6-60.md): comando por ocorrência, linha inteira dentro da mesma janela, proteção herdada conferida sob pedido até8.000 unidades do original, abstenção explícita além do orçamento. O prefixo só verifica proteção; a lente examina a linha escolhida e recebe offsets originais pelo adaptador. Preparação mantém700ms/2000/400/24, com registro+revisão no cache. Nenhum exame ao abrir/filtrar; A03 geral continua parcial.

## Filtro da reserva — 07/10/2026, v6.59

A lista solicitada de palavras reconhecidas oferece um seletor rotulado **Filtrar por classe possível no léxico**. Opção inicial Todas as ocorrências; demais opções são somente classes presentes na reserva, com contagem de ocorrências por classe. Repetidas em posições distintas contam separadamente. Uma ocorrência ambígua participa de mais de uma classe e preserva todas as alternativas no cartão; as contagens não são uma partição nem contagem do livro.

Filtrar só altera visibilidade dos até24 cartões existentes. Não consulta léxico, não roda lente, não cria nova reserva, não persiste filtro e não agenda timers. Contagens e opções são construídas uma vez ao abrir a lista; selecionar Todos restaura a mesma ordem e os mesmos nós. Seletor com label, teclado nativo e anúncio do número visível no status. Uma nova reserva começa mostrando todas as ocorrências. Identidade, cancelamento e seleção literal permanecem vigentes.

A03 continua parcial: filtro lexical entregue; contexto sintático geral e pertinência automática da folha não estão implementados. Próximo: especificar a ligação entre uma ocorrência reservada e um exame contextual explícito do seu trecho, com offsets originais e fronteiras seguras, sem examinar silenciosamente outra região da folha.

## Reserva lexical junto ao cursor — 07/10/2026, v6.58

A janela começa até 1.000 unidades UTF-16 antes do cursor e recebe até 2.001 unidades (incluindo a fronteira direita). Não procura o início de parágrafos por varredura do livro. Um indicador de continuação à esquerda permite descartar palavras cortadas; também são descartados tokens cortados à direita e formas acima de64 unidades. O original nunca é normalizado; a chave de consulta usa a canonicalização existente, preservando offsets de emoji e acentos decompostos.

No máximo200 tokens para sinais e200 para consulta lexical por pausa: o orçamento total de400 visitas não aumenta. Fora do início da folha, a triagem de frases não roda, porque pode faltar contexto de citações/código. Só se consultam formas no léxico; palavras dentro de citações podem aparecer como possibilidades lexicais, nunca como classificação contextual. Sintaxe/relativas continuam não verificadas. O restante da folha não é varrido em fila.

A consulta lexical começa até256 unidades antes do cursor dentro da janela, descarta a primeira palavra se cortada e visita até200 tokens. Retém as24 ocorrências mais próximas do cursor entre as visitadas e apresenta-as na ordem do original; isso evita gastar a reserva só com o começo da janela. Reserva máxima de24 ocorrências, cada trecho com até64 unidades, posições distintas e classes possíveis deduplicadas das leituras da fonte (até32 leituras por consulta, teto já existente). Não retém todas as flexões nem sentidos, não elimina homógrafos e não deduplica ocorrências repetidas. Um recorte substitui o anterior; mesmo texto em outra posição/folha tem identidade diferente. Edição/IME/fechamento invalidam a reserva. Sem persistência ou novos pacotes.

Em Entender uma frase, **Ver palavras reconhecidas** abre a reserva somente a pedido. Cada ocorrência oferece Ver no texto e Consultar palavra. Antes da ação: reserva ainda ativa, mesma folha e trecho literal nas posições originais. Fontes e detalhes ficam na consulta lexical existente. Nenhuma lente completa é chamada ao preparar/abrir a reserva. O trabalho é limitado, mas não foi medida RAM total de um aparelho antigo.

A03 continua parcial: esta é reserva lexical local, não inventário gramatical do livro. Próximo: filtro por classes possíveis dentro da reserva, com todos os termos não verificados acessíveis e sem transformar ausência de cobertura em ausência linguística. Contexto sintático de regiões arbitrárias exige contrato próprio antes de novos sinais automáticos.

## Primeira preparação limitada — 07/10/2026, v6.57

O autor aprovou preservar o novo painel, retomar debounce e priorizar aparelhos antigos. Primeira etapa de A03 usa somente recursos já embutidos; A02 não é pré-requisito para este recorte. Não instala pacotes nem ativa um analisador contextual em segundo plano.

Contrato implementado: 700 ms após a última solicitação; um timer; no máximo 2.001 unidades UTF-16 recebidas pelo preparador (um caractere de fronteira), 2.000 examinadas e 400 tokens visitados. Uma única entrada de cache de recorte; sem snapshots da folha inteira, histórico acumulado ou varredura encadeada. Esses números são tetos de trabalho/payload, não medição da RAM total ou garantia de latência de aparelho antigo. Índice local da triagem é criado sob demanda e reaproveitado; não há download nem dependência nova.

Só prepara com o painel aberto na escolha de tarefas/análises. Edição reinicia a pausa e invalida indícios; IME, página oculta, fechamento, escolha de exame completo ou consulta lexical cancelam a preparação pendente. Retomar visibilidade/composição agenda uma nova pausa se ainda elegível. Troca de folha invalida a identidade. Navegar entre grupos pode reutilizar o mesmo recorte. Nenhum `vault.analyze` é chamado pelo preparador.

Estados: indício encontrado, nenhum indício no recorte, pertinência não verificada. Sintaxe, relativas e vocabulário decolonial não possuem preparação neste lote; `que-contextual` não vira sinal de oração relativa. Morfologia só informa palavra presente no léxico; classe em contexto exige exame explícito. Todas as análises permanecem acessíveis. O trecho além do teto aparece como não verificado, nunca como ausência comprovada.

**Limite deliberado:** observa o prefixo, não regiões arbitrárias editadas. Não é ainda a preparação incremental completa, não reserva ocorrências exatas nem filtra automaticamente as opções. A03 permanece parcial. Próximo lote precisa delimitar contexto de regiões alteradas, proteger citações/fronteiras e guardar offsets por revisão antes de oferecer seleção de ocorrências reservadas. Não ampliar o teto como atalho.

## Direção e escopo

O acervo local pode aproximar-se de 1 GB se houver capacidade disponível. Isso é uma possibilidade de armazenamento, não meta de download, reserva garantida ou autorização para incorporar qualquer recurso. O aplicativo deve consultar pequenos recortes, com memória, inicialização e processamento limitados separadamente do tamanho instalado. Não incorporar o acervo inteiro ao bundle, ao HTML portátil ou a um JSON descomprimido em memória.

Preparação leve nas pausas passa a ser permitida como direção de produto. Ela atualiza sinais e dados reutilizáveis de regiões alteradas e do contexto necessário. Não executa todas as lentes nem atualiza silenciosamente diagnósticos completos. Suspender ao digitar, durante IME, com a página oculta e quando o controle de análise estiver desligado. Uma análise completa continua dependendo de escolha explícita. Manuscrito intocável.

A fronteira de invalidação pode exceder o trecho editado: token, oração, parágrafo ou contexto declarado pelo motor. Quando não houver delimitação segura ou orçamento, invalidar mais amplamente e manter “não verificado”; não varrer repetidamente o documento para simular incrementalidade.

Sem prazo de calendário. Entregas delimitadas e evidência orientam a sequência. KitKat/iPad 2012 seguem referências de economia tecnológica; não são aparelhos a homologar.

## Coordenação atual — 28/09/2026

Rafael transferiu a continuidade e integração à A2 nesta data. A2 pode trabalhar nas áreas antes reservadas a A1 e publicar incrementos na main, preservando o plano e as verificações. Não há dependência de resposta do A1 para continuar. A divisão abaixo permanece como registro histórico, substituída quanto à exclusividade de arquivos/publicação. Consulte [a passagem de retomada](jornada/RETOMADA-A2-2026-09-28.md).

## Divisão original de arquivos e integração (histórico)

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

## Paginação e conversão externa — retomada A2

O lote exato `cb7e349032b9c322bfc09e468ac28fbd3006a723` do PR #188 acrescenta formato lexical v2 com raiz pequena, páginas verificadas e conversão NDJSON por ordenação externa. Incorporação isolada e verificações registradas na passagem; nenhuma nova API foi ativada no aplicativo. O leitor experimental aceita o descritor como quinto argumento, além da assinatura original, para verificar páginas sem catálogo integral.

A ponte A02 deve fixar tickets por versão, preservar os limites antes da decodificação UTF-8, serializar acesso ao store e confirmar conclusão física após cancelar. Seu primeiro ensaio pode usar pacote pequeno dentro dos limites atuais. Antes de ampliar o acervo, resolver o envelope plano de instalação e o acesso a descritores: paginar somente o léxico não limita os metadados do store. Não elevar `metadataChars` para disfarçar esse custo.

## Ponte A02 verificada — 29/09/2026

A ponte experimental de tickets/UTF-8 e fila está implementada e testada conforme a [entrega parcial](jornada/ENTREGA-A02-PONTE-2026-09-29.md). Não exige mudança da API do cofre nem do store; não foi ativada no aplicativo. Próximo limite: endereçamento de metadados sem catálogo integral por consulta. A02 permanece TODO.

## Descritores por chave — 29/09/2026

A [prova do store endereçado](jornada/ENTREGA-A02-METADADOS-2026-09-29.md) implementa envelope experimental v2 sem lista integral, registros por chave, retomada por ordinal e ativação atômica com contadores. Banco separado, sem migração/integração automática. A assinatura v1 permanece intacta. Próxima entrega: produzir catálogo em arquivo e coordenar instalação por unidades; A02 permanece TODO.
