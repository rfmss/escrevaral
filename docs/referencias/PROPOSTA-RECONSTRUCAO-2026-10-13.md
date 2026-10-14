> REFERÊNCIA HISTÓRICA — direção substituída em 14/10/2026. Continuar a main e o plano vigente. Consultar [adendo de evolução](../ADENDO-EVOLUCAO-2026-10-14.md). Texto original preservado abaixo; suas instruções de recomeço e marcos não estão ativos.

# Escrevaral — reconstrução do zero

**Documento de fundação e execução · 13 de outubro de 2026 · versão 1.0**

Autor do produto: Rafa Mass. Direção: construir uma aplicação nova, preservando a identidade e incorporando seletivamente o patrimônio técnico do Escrevaral existente.

## 1. A decisão

O novo Escrevaral nasce em uma base limpa. Não será o controlador antigo repartido em arquivos, nem uma nova camada visual sobre o mesmo aplicativo. A implementação anterior será uma fonte consultável de motores, contratos, dados, comportamentos, design e casos de regressão. Nenhum desses elementos entra automaticamente na nova aplicação.

Recomeçar a aplicação não significa recomeçar a pesquisa linguística. A parte mais valiosa do investimento deve atravessar a reconstrução: regras delimitadas, corpus, rastreabilidade, endereçamento exato do texto, decisões de experiência e conhecimento sobre falhas. O reaproveitamento será acompanhado de origem, motivo e prova de adequação.

Este documento especifica o projeto novo. Não declara que ele já existe, não muda o domínio e não autoriza substituir a produção por uma versão incompleta. Nesta entrega, o código e a publicação permanecem intactos. A implementação começa pelo marco R00, quando a construção for iniciada; a retomada antiga por A03 deixa de ser a fila principal dessa nova frente.

**Objetivo verificável:** entregar uma oficina brasileira de escrita, local e utilizável offline, cuja escrita continue funcionando quando uma análise, um efeito visual, um pacote opcional ou a preparação de cache falhar.

## 2. De onde partimos, sem maquiar a situação

A referência inspecionada é `rfmss/escrevaral`, versão `6.63.0`, commit `53c4afe5090f3bcdc3a5fac9bd920c4783a2acae`. Os links deste documento ficam presos a esse commit. Mudanças posteriores não alteram silenciosamente a referência.

O projeto já possui fontes separadas, cofre linguístico independente, montagem determinística, testes, dados com origem e distinção entre site e HTML portátil. O problema não é a existência de um HTML portátil grande: ele é um artefato gerado. O problema é a concentração de responsabilidades na aplicação, a dependência de um namespace compartilhado e a cascata visual herdada.

Medições da árvore examinada: `index.html`, 62.759 bytes; portátil `escrevaral.html`, 1.439.167 bytes; `src/editor/controlador.js`, 125.954 bytes e 1.569 linhas; bundle do aplicativo, 319.534 bytes; cofre, 695.111 bytes; estilos, 361.944 bytes. `assets/` contém 39 gerações, com 49.082.728 bytes em 117 arquivos. São tamanhos de arquivos, sem compressão HTTP; não são medições de RAM nem do total baixado por uma visita. Parte do CSS contém a fonte incorporada, portanto seu tamanho não representa apenas regras visuais.

A conferência `node scripts/build.cjs --check` passou para os sete arquivos verificados pela montagem. Isso comprova consistência entre as fontes e essas saídas; não certifica experiência, segurança de todo armazenamento ou acurácia linguística. Não foi executada uma nova bateria ampla para produzir este documento.

O estado antigo registra 12 de 25 marcos concluídos, com escopos diferentes. Isso não será convertido em “48% do novo site”. A reconstrução terá seu próprio escopo e suas próprias evidências.

## 3. O produto que precisa sobreviver à reconstrução

### 3.1 Identidade e percurso

Escrevaral é uma oficina literária brasileira. O Gabinete acolhe; as Gavetas organizam; os Cadernos contêm projetos; a Mesa é o único editor. Manuscrito, Quadro e Varal são apresentações dos mesmos conteúdos, e não cópias independentes do texto. Pesquisa, Planejamento e Revisão têm função explícita dentro do caderno.

O escritor deve reconhecer em qual gaveta e caderno está, encontrar o caminho de volta e continuar de onde parou. A navegação conserva o vocabulário aprovado: **Início** para a entrada e **Menu** para o lançador; **Seus textos** para o acervo. A barra de navegação permanece acessível. Criar caderno por duplo clique pode existir como atalho, mas também precisa de comando visível, teclado e toque.

O ambiente usa e-ink, gesso, áreas de respiro, contraste legível, tipografia com caráter e objetos de papel discretos. Caderno aberto deve ser reconhecido visualmente. Notas rápidas e post-its têm aparência de papel, estado persistido e exclusão recuperável. Nada disso justifica efeitos contínuos ou complexidade no editor.

### 3.2 Autonomia do manuscrito

O texto pertence ao autor. Motores não corrigem, substituem, completam, normalizam ou reescrevem o manuscrito. Não recebem DOM, função de salvar nem referência mutável ao documento. Localizar uma ocorrência pode mudar a seleção; nunca o conteúdo.

Uma única análise explícita fica ativa. Abrir o painel não executa todas as lentes. A preparação leve nas pausas apenas levanta indícios e candidatos dentro de um orçamento. A interface conserva “Todas as análises” e distingue ausência de indício, falta de cobertura e trecho não verificado.

Classe possível, classe sustentada no contexto e função sintática são informações diferentes. A experiência explica a diferença sem exigir que o escritor conheça a arquitetura. Nenhuma estatística inventa intenção, tensão, qualidade literária ou prova de autoria humana.

### 3.3 Inventário de continuidade

O inventário inclui escrita, autosalvamento, títulos, busca, navegação temporal, gavetas, cadernos, capítulos, notas, lixeira, recuperação, exportação por caderno e total, importação, preferências e retorno à posição de leitura. Inclui também fichas de personagens/lugares/cenas, quadro, varal, manuscrito reunido, pesquisa, planejamento, timeline, modo foco, linha central, impressão, temas, Pomodoro, calculadora, calendário, análises e consulta lexical.

Esse inventário reúne decisões do projeto; **não afirma que todos os itens estejam completos na v6.63**. No R00, cada item receberá o estado observado no código: existente, parcial, apenas especificado ou ausente. O estado novo será separado. Assim uma ideia antiga não vira, por engano, uma funcionalidade supostamente pronta; uma função existente também não desaparece por esquecimento.

O chaveiro/bloqueio visual, a máquina de escrever e outros elementos de identidade permanecem no catálogo. Bloqueio visual não será anunciado como criptografia ou proteção contra acesso aos arquivos. Políticas especiais de colagem e clipboard devem ser inventariadas antes de qualquer alteração; não serão ampliadas ou removidas silenciosamente.

## 4. Arquitetura escolhida

### 4.1 Uma aplicação estática, modular e pequena

HTML semântico, CSS simples e JavaScript ES5 no caminho básico. Sem framework de interface, DOM virtual, container de injeção de dependências, barramento global de eventos ou gerenciador genérico de estado. Node serve para desenvolvimento e montagem; não é dependência do escritor.

O `index.html` é a entrada declarativa: estrutura essencial, referências locais e ponto de montagem. Um `bootstrap.js` pequeno conecta as capacidades. Ele não sabe salvar cadernos, classificar palavras, desenhar fichas nem calcular o Pomodoro. Se tiver regras dessas áreas, a arquitetura foi violada.

“Index orquestrador de srcs” significa que cada capacidade tem fonte e responsabilidade reconhecíveis. Não obriga o navegador a baixar dezenas de scripts: a montagem pode reunir módulos em poucos recursos. Os fontes continuam legíveis; os bundles são saídas descartáveis. Não há edição manual de arquivo gerado.

### 4.2 Organização prevista

`src/shell/` contém a estrutura HTML, a navegação geral e a inicialização. `src/editor/` contém a sessão de escrita, seleção, IME e apresentação do campo. `src/acervo/` contém os casos de uso de gavetas, cadernos e documentos. `src/analise/` contém pedidos, revisão, preparação, cancelamento e transformação de resultados para a interface. `src/estudio/` contém fichas e visões do projeto. `src/utilitarios/` contém os aplicativos pequenos e isolados.

`src/storage/` implementa a persistência e suas transações. `src/transferencia/` implementa importação, exportação e conversão do formato antigo. `src/ui/` contém apenas componentes visuais realmente compartilhados: diálogo, menu, aviso e controles. `src/platform/` concentra detecção de capacidades e acesso às APIs do navegador. `src/styles/` guarda tokens, fundamentos e estilos por componente.

`packages/cofre/` guarda os motores aprovados e suas APIs. `resources/pt-BR/` guarda dados com origem e licença. `tests/` guarda contratos, regressões e casos de falha. `scripts/` monta, verifica e serve. `docs/` guarda decisões e estado. `dist/` recebe apenas as distribuições geradas, fora da árvore versionada de fontes.

Não criar todos esses diretórios vazios por antecipação. Cada um nasce com uma capacidade concreta. Não criar pastas como `utils`, `helpers`, `services` ou `manager` como destino automático de código sem dono. Uma função compartilhada deve ter nome e responsabilidade específicos.

### 4.3 Dependências e autoridade

A interface chama casos de uso. Casos de uso recebem portas estreitas de editor, armazenamento ou motor. Adaptadores implementam essas portas. O cofre não conhece a aplicação. Armazenamento não conhece seletores CSS. Componentes visuais não gravam documentos. Um utilitário não acessa diretamente o estado do editor.

Cada módulo é uma fábrica com dependências explícitas e métodos públicos limitados. A montagem resolve identificadores de módulo em um invólucro privado; não exige módulos ES nativos no navegador. Um manifesto declara dependências e pontos de entrada. A montagem recusa ciclos, dependências ausentes e acessos entre áreas proibidos. Análise estática usa AST e convenções estreitas, sem fingir que uma busca textual prova isolamento completo.

Só a composição conhece todas as implementações. É proibido recriar `window.Escr` como depósito de funções e estado na aplicação nova. O namespace legado, se necessário ao cofre reaproveitado, fica encapsulado dentro do adaptador do cofre e não vaza para os componentes.

Não haverá um `controlador-geral.js` com outro nome. Organização por arquivo não basta: uma função deve poder ser exercitada com dependências pequenas, sem inicializar todo o aplicativo.

## 5. Contratos que impedem a volta da bagunça

### 5.1 Documento e sessão

Documento persistido tem identidade, caderno, tipo, título, texto, revisão e datas. Datas estimadas continuam marcadas. Capítulo, nota e ficha não são distinguidos pelo conteúdo do título. IDs não dependem de posição em lista. Relações entre objetos usam IDs estáveis.

A sessão do editor mantém rascunho, revisão transitória, composição IME, seleção e estado de salvamento. Não guarda caches de análise. A revisão do texto muda quando o conteúdo muda; alterar tema não invalida um resultado linguístico. Trocar de documento ou iniciar composição invalida pedidos em curso.

Resultados e estado visual nunca são inseridos no texto. Desfazer/refazer é preservado pelo campo de edição, sem substituir o valor inteiro a cada atualização de interface. Um `textarea` é a escolha inicial para texto simples e seleção previsível. Uma eventual necessidade de texto rico exige outra decisão; não será embutida no projeto por conveniência visual.

### 5.2 Pedido e resultado de análise

Um pedido contém `requestId`, `documentId`, revisão transitória, lente, escopo, versão do motor/dados e, quando houver, alvo explícito. O alvo usa intervalo UTF-16 com início inclusivo e fim exclusivo. A cópia do texto examinada e o deslocamento de um recorte acompanham o trabalho.

O resultado só entra na tela se identidade, revisão e pedido ainda coincidirem. Antes de selecionar, conferir novamente `snapshot.slice(start, end) === snippet` e a correspondência com o documento atual. Não buscar a primeira palavra igual para recuperar um endereço perdido. Normalização auxiliar exige mapa para o original.

Resultado vazio não significa texto correto. Estados distintos: concluído, parcial, ambíguo, fora da cobertura, contexto insuficiente, cancelado e falha. Cobertura e motivo ficam acessíveis. Evidências e fontes acompanham a leitura. Não inventar porcentagens de confiança a partir de rótulos qualitativos.

### 5.3 Trabalho cancelável

Edição, troca de documento, IME, desligamento, ocultação e cancelamento invalidam tarefas pertinentes. Cada passo verifica seu token antes de trabalhar e antes de publicar. Um único agendador coordena trabalho linguístico; não inicia novas lentes em fila.

O cofre atual é síncrono. Cancelar uma interface não interrompe uma chamada síncrona já executando. No caminho básico, o recorte e o custo precisam ser limitados antes da chamada. Worker pode ser um adaptador opcional, usando o mesmo motor e contrato; sua ausência não impede escrever nem acessar análises pequenas. Não vender `setTimeout` como solução para uma função monolítica bloqueante.

## 6. O que aproveitar da fonte antiga

“Maduro” aqui significa maduro para um escopo identificado. A disponibilidade de 16 lentes e um conjunto de testes não prova cobertura geral do português brasileiro. A aceitação técnica do transplante e a avaliação linguística são registros separados.

### 6.1 Cofre e motores

O candidato principal é o cofre público de `packages/cofre/README.md`: `create`, `analyze` e registro de lentes, com versões, limites, offsets e evidências. O ponto inicial mais seguro é transportar o cofre inteiro e encapsulado, com a versão fixada, antes de tentar reduzir suas dependências. Essa cópia é um componente delimitado; não traz a aplicação antiga. Só depois separar por família se medição de carga justificar.

`createRuntime()` é ponte interna sem estabilidade garantida. Consulta lexical/flexões e preparação que dependam dela precisam de um adaptador estreito e versionado, com teste de contrato. O aplicativo novo não ganha permissão para acessar todo o runtime porque um recurso ainda não tem API pública.

`ptbr/morfologia-contextual.js`, `grupos-verbais.js`, `lexico-sintatico.js`, `relacoes-sintaticas.js`, `relativas.js`, `expressoes.js` e `repeticao.js` são fontes de capacidades já existentes. A lista de dependências efetivas vem de `build/modules.json`; não copiar um arquivo isolado ignorando os inventários e registros de que depende.

A morfologia possui recortes contextuais e locuções; sintaxe e relativas permanecem delimitadas. Rima e métrica têm aproximações e limites próprios. Convenções, expressões culturais e estilo não podem transformar ocorrência lexical em sentença sobre intenção ou qualidade.

### 6.2 Dados e evidência linguística

Reaproveitar os recortes OWN-PT, PortiLexicon e inventários locais junto com origem, versão, licença e atribuição. Não copiar só o `.js` de dados. O estado antigo descreve 179 lemas OWN-PT e, no recorte PortiLexicon registrado, 3.220 formas e 5.683 leituras; são recortes, não um dicionário completo.

Manter corpus de desenvolvimento, casos de regressão, negativos, ambiguidades e critérios de abstenção. Não renomear corpus já usado para ajustar regras como “avaliação inédita”. Q02, a avaliação reservada, permanece pendente até ser realmente executada. O novo projeto não herda um selo de qualidade inexistente.

Preservar o Manual de Linguística Computacional como referência conceitual: endereço, léxico, tradução de etiquetas, contexto, grupos e funções. Cunha e Cintra continua referência principal acordada; demais obras entram por unidade estudada. Catálogo de livros não conta como leitura integral. Não republicar livros recebidos junto do código.

Portparser fica fora do produto inicial. O snapshot e o adaptador existentes não significam inferência instalada ou validada. Modelos, grandes pacotes, sincronização remota e novas dependências só entram mediante capacidade demonstrada, licença e custo explícitos.

### 6.3 Contratos e casos de regressão

Reaproveitar as ideias e verificações de `src/editor/contrato-analise.js`, especialmente rebasing, identidade, revisão e prova de proteções. A varredura de fronteiras pode virar módulo puro se a extração conservar os casos conhecidos. Não copiar a integração inteira com o painel.

Transportar os casos A03: ocorrência distante, repetição de palavras, Unicode decomposto, contexto protegido, linhas anteriores longas, marcadores entre blocos, cancelamento e alvo além dos primeiros 100 resultados. Manter os limites declarados: a linha alvo ainda precisa caber na reserva atual e fronteiras somente CR não estão cobertas pela prova distante registrada. A reconstrução não pode esconder esses limites com uma interface mais bonita.

### 6.4 Design

Preservar proporções, contraste, cores, fonte, iconografia, hierarquia e comportamento aprovado. Os estilos e o template antigos são amostras a medir e traduzir, não folhas a anexar integralmente. A fonte Courier Prime e os ícones só atravessam acompanhados de sua licença.

Criar uma página interna de referência visual com Gabinete, caderno fechado/aberto, Mesa, menu, diálogo, painel de análise, nota, lixeira e estados de falha. Ela registra o design a manter e permite verificar diferenças intencionais. Não importa CSS antigo como atalho.

### 6.5 O que não atravessa

Não copiar `src/editor/controlador.js`, o painel inteiro, `base.css`, a sequência de remendos da cascata, o HTML portátil como fonte, bundles históricos ou registradores que inicializem tudo por efeito colateral. Não importar ferramentas experimentais, telas abandonadas ou bibliotecas porque estão no repositório.

Testes que dependam de globais antigos ou procurem trechos de código precisam ser adaptados ao comportamento público. Um teste antigo não ganha autoridade para obrigar a arquitetura nova a imitar a estrutura antiga.

Cada transplante terá ficha em `docs/reuso/`: origem e SHA; capacidade; dependências; licença; limites; testes relevantes; alteração aplicada; destino; decisão de aceitação. A importação de código e a mudança de regra linguística não devem ocorrer no mesmo lote.

## 7. Design responsivo com custo controlado

O sistema visual terá uma única fonte de tokens para cores, espaçamento, tipografia, bordas, camadas e dimensões. A montagem gera valores CSS literais para o caminho básico; variáveis CSS podem ser melhoria opcional, não pré-requisito. Cada componente possui seus seletores e estados. Não haverá um `final-fixes.css` permanente para sobrescrever todas as áreas.

Layout básico com blocos, dimensões relativas, `max-width`, media queries e alternativas simples. Grid, `gap`, filtros, máscara avançada, observadores e APIs recentes não sustentam fluxos essenciais. ES5 é requisito de sintaxe; disponibilidade de APIs é verificada separadamente. Referência de engenharia: iPad de 2012/iOS 9.3.5 e Android KitKat, sem declarar certificação nesses aparelhos.

Objetos físicos serão ilusões baratas: borda e pseudo-elemento para papel, recortes estáticos para relógio, sprite ou poucas posições para carimbo. Sem WebGL, física contínua, blur de tela inteira ou loops de animação ociosos. Movimento reduzido é respeitado quando detectável; a própria aplicação também oferece redução de efeitos.

Desktop usa painel lateral; celular pode usar painel inferior ou tela de análise. O editor tem um único eixo de rolagem. Um painel com conteúdo longo pode rolar independentemente quando ativo, sem criar barras aninhadas dentro da escrita. O Quadro cabe na área disponível; se os cartões não couberem legivelmente, oferece paginação ou visão alternativa, em vez de reduzir tudo até ficar ilegível.

Widgets têm tamanho relativo à tarefa e à tela. Calculadora não ocupa um desktop inteiro. Barra e breadcrumb não deformam com nomes longos. Teclado, toque, foco visível, Escape e restauração de foco fazem parte do componente, não de correções posteriores. Aparência própria nunca elimina indicação de foco ou semântica de botão.

## 8. Persistência e migração: o acervo não paga pelo recomeço

### 8.1 Separar texto, análises e instalação

Dados do autor, preferências, resultados descartáveis e arquivos do aplicativo são categorias diferentes. Limpar cache ou atualizar a aplicação não apaga manuscritos. Resultados de análise podem ser reconstruídos; o texto não.

A porta de armazenamento terá operações assíncronas com callbacks ES5 e erros explícitos. Proposta inicial: IndexedDB como adaptador principal, ativado somente após uma prova real de abrir, escrever, ler e excluir um registro de teste. Suporte nominal à API não basta. LocalStorage será adaptador limitado para acervos pequenos onde a prova falhar; não será anunciado como equivalente transacional.

No fallback, gravar somente o documento alterado, manter journal e cópias de recuperação e restringir edição concorrente a uma sessão. Eventos entre abas ajudam a detectar conflito, mas não constituem bloqueio atômico; o protocolo precisa preservar cópias conflitantes em vez de sobrescrevê-las. Se não houver persistência utilizável, mostrar modo temporário e exportação, nunca “salvo”. A prova de persistência do R02 pode revisar a escolha do adaptador mediante decisão registrada antes da integração.

Não serializar a biblioteca inteira a cada tecla. Não esperar o fechamento da aba para salvar. Enquanto há escrita pendente, a mensagem distingue rascunho de gravação confirmada. Erro de quota, acesso negado ou falha de transação mantém o rascunho e oferece recuperação/exportação.

### 8.2 Formato de intercâmbio

O formato novo será JSON documentado e versionado, com inventário de entidades e relações. A extensão `.scrvrl` não determina o formato interno. O exportador recebe o rascunho atual, inclusive quando a última gravação falhou, e explica o escopo: caderno, gaveta ou acervo.

O importador valida tamanho, versão, tipos, IDs e vínculos antes de gravar. Resolve colisões com mapeamento explícito e preserva ligações entre documentos, fichas, quadro e histórico. Conteúdo de arquivo é dado: não vira HTML executável. Campos não suportados são preservados em cópia de origem ou denunciados no relatório; não são descartados silenciosamente.

### 8.3 Migração da aplicação antiga

O leitor de legado reconhecerá o formato observado `escrevaral-cadernos`, versões 1 e 2, além dos demais exportadores que o inventário R00 confirmar. A v2 admite escopos `all`, `notebook` e `original`. Os nomes internos antigos não obrigam a repetir o modelo novo.

As chaves antigas incluem `escrevaral.astra.v1.doc.`, `escrevaral.astra.notebooks.v1`, `escrevaral.astra.originais.v1` e o journal de transação. O projeto novo usa namespace próprio e não limpa essas chaves. Descobrir e interpretar o legado é responsabilidade do conversor, não do editor.

Percurso: exportar a origem; validar; converter para uma área nova; conferir quantidade de entidades, texto exato e relações; apresentar relatório; só então abrir a cópia convertida. A versão antiga permanece intacta. Dados corrompidos são reportados e preservados para recuperação. Migração repetida não deve duplicar acervo silenciosamente: usar registro de origem e identidade da importação.

Um preview em outro domínio não acessa o localStorage de `escrevaral.com`; nesse caso a ponte é exportação/importação. Publicar em um subcaminho do mesmo domínio, por sua vez, não isola localStorage. Preferir origem de preview separada, com importação explícita, e escopo próprio de service worker.

Reverter a aplicação não converte automaticamente dados novos para o formato antigo. Antes da troca de produção, validar exportação legível e definir se existe conversão reversa. O rollback nunca pode prometer algo que o esquema dos dados não permite.

## 9. Desempenho e compatibilidade como parte do contrato

O editor inicia sem instanciar o cofre. No site, o cofre pode ser carregado por script local quando o painel for solicitado, com estado de carregamento e recuperação de erro. No portátil, pode estar incorporado, mas sua construção e a leitura dos dados devem ser adiadas. Recursos prometidos offline precisam estar efetivamente disponíveis antes de anunciar “pronto para uso offline”.

A referência atual de preparação é pausa de 700 ms, janela de 2.000 unidades UTF-16, até 400 visitas e 24 ocorrências. O teto geral do cofre é 200.000 unidades, e a morfologia tem recorte próprio de 8.000 unidades/1.600 tokens e saída de até 100 achados. Esses números são limites do legado a preservar no primeiro transplante, não metas suficientes de desempenho do novo produto.

Orçamento inicial proposto: núcleo de escrita e navegação até 150 KiB de JavaScript sem compressão; CSS sem fontes até 80 KiB; nenhuma chamada de análise por tecla; nenhum trabalho periódico com a página oculta; nenhuma lista ilimitada de resultados ou documentos montados no DOM. Esses tetos são metas novas, ainda não medidas. Exceção precisa indicar causa e efeito, antes de ampliar o orçamento.

Para trabalho cooperativo, começar com meta de até 8 ms por fatia no ambiente de medição, além de teto de operações, e registrar p50/p95 e pior caso. Não prometer esse tempo em hardware antigo a partir de simulação. Medir separadamente abertura fria, primeira escrita, primeira análise, análise seguinte, cópias de texto e memória retida. Memória do aplicativo e tamanho instalado são medidas diferentes.

Benchmarks usam entradas próprias: texto curto, texto de 50 mil unidades, limite de 200 mil, linha única longa, muitos delimitadores, Unicode combinado e acervo numeroso. Falta de API de medição de heap é registrada; não inventar RAM a partir do tamanho do arquivo.

Pacotes grandes ficam fora da primeira entrega. Se forem necessários depois, terão índice, leitura por bloco, cache limitado e instalação recuperável. Não carregar todo o acervo linguístico para explicar uma palavra.

## 10. Montagem, publicação e reversão

Uma montagem gera site, portátil e cofre a partir das mesmas fontes. O portátil não tem uma segunda implementação. O manifest de release registra versão, hashes e tamanhos. A saída deve ser reproduzível e não contém dependências de desenvolvimento.

O código novo vive em um repositório limpo de trabalho, separado da árvore de produção. O nome remoto pode ser `escrevaral-next`; não precisa ser criado para aprovar este documento. O repositório antigo fica como referência fixada e produção durante a construção. Isso substitui a estratégia anterior de continuar entregando funcionalidades no controlador da main antiga.

O destino preferencial de publicação usa artefato de CI, sem commitar bundles sucessivos na árvore de fontes. O plano de hospedagem deve conservar recursos exigidos por abas antigas e pelo rollback. Retenção mínima proposta: release ativa e duas anteriores, por ao menos 30 dias; esse piso não garante suporte infinito a abas abertas. A mudança de geração informa atualização e preserva o rascunho antes de recarregar.

Não usar ativação forçada de service worker para misturar HTML antigo com JavaScript novo. Instalar geração completa, verificar recursos e só trocar em condição segura. Uma instalação parcial conserva a geração funcional. Releases expiradas exigem caminho de recuperação, sem apagar acervo nem atualizar no meio da composição IME.

Preview, CI aprovado, deploy concluído e domínio de produção são estados separados. Push não significa publicado. A troca de `escrevaral.com` será a etapa R08, depois da matriz de continuidade e da prova de migração, nunca o primeiro ato do recomeço.

## 11. Plano de execução com fim definido

### R00 — Inventariar e fixar a fonte

Criar a base limpa e registrar o SHA antigo. Produzir `docs/CONTINUIDADE.json` com cada capacidade, estado antigo, destino, prioridade, fonte e critério de aceite. Registrar screenshots de referência apenas como material interno de implementação, quando disponíveis; referências históricas não acessadas ficam identificadas. Classificar toda função visível da aplicação antiga. Nenhum desaparecimento fica implícito.

Aceite: um novo colaborador sabe o que será reconstruído, o que será transplantado e o que permanece fora da primeira versão. Registrar a coleção de motores candidatos sem alterar suas regras. Não interromper para escolher framework: a decisão já está neste documento.

### R01 — Construir a fundação e a linguagem visual

Entregar entrada HTML, composição, resolução simples de módulos, tokens e componentes básicos, com a primeira Mesa navegável. Adicionar as verificações de arquitetura desde o primeiro módulo. Sem dados reais e sem cofre como dependência de inicialização.

Aceite: a Mesa abre com JavaScript ES5, navegação por teclado/toque e layout estreito; o bootstrap apenas compõe; simular falha de uma capacidade opcional não derruba a escrita. A página visual demonstra os estados essenciais.

### R02 — Tornar a escrita confiável

Entregar documento, sessão, seleção, composição IME, salvamento, recuperação e exportação de rascunho. Exercitar o adaptador principal e o fallback de armazenamento. Essa fatia precisa ser útil antes de acrescentar aparência de sistema operacional.

Aceite: escrever, recarregar e recuperar; simular quota e gravação interrompida; conservar rascunho; preservar versões conflitantes; não anunciar gravação inexistente. Contrato e limites de concorrência documentados.

### R03 — Reconstruir o Gabinete e o acervo

Entregar gavetas, cadernos, capítulos/notas, breadcrumb, busca, navegação temporal, lixeira, restauração e posição de retomada. Adicionar migração de cópias do legado e exportações por escopo. Sem clonar o controlador antigo.

Aceite: importar uma coleção de teste com relações e colisões; conferir texto exato; abrir, editar, excluir e restaurar sem perder o vínculo. O importador não escreve no namespace antigo.

### R04 — Integrar o patrimônio linguístico

Transportar o cofre encapsulado, dados e licenças. Ligar uma lente por comando, consulta lexical e navegação de ocorrências. Portar as regressões A03 antes de oferecer reserva e exame contextual. Preservar todas as lentes aceitas no inventário, indicando os limites de cada uma.

Aceite: equivalência de comportamento no corpus de transporte; resultado antigo não reaparece após edição; texto permanece intacto; palavra repetida é selecionada no endereço correto; limitações conhecidas continuam visíveis. Acurácia inédita não é alegada.

### R05 — Reconstruir o painel e a preparação

Entregar entrada Escrevaral/Examinar orientada por tarefas, preparação limitada, reserva lexical, filtro de classes, contexto e filtro de pertinência. O filtro de pertinência era pendência da v6.63; não deve ser anunciado como simples reaproveitamento pronto.

Aceite: desligado não prepara; abrir não examina tudo; editar/IME/ocultar cancela; sem sinal e não verificado têm mensagens diferentes; “Todas as análises” permanece acessível; orçamento e descarte são verificáveis.

### R06 — Reconstituir o Estúdio e os utilitários

Conectar Manuscrito, Quadro, Varal/timeline, fichas, pesquisa e planejamento ao mesmo acervo, conforme a matriz R00. Recuperar modo foco, linha central, impressão, notas rápidas, temas, Pomodoro, calculadora e calendário. Elementos só planejados no legado ficam marcados como novas implementações.

Aceite: mudar uma cena na Mesa atualiza suas outras visões sem criar cópia divergente; cada ferramenta pode falhar ou ficar fechada sem ocupar trabalho contínuo do editor. Nenhuma capacidade do escopo desaparece sem decisão registrada do autor.

### R07 — Fechar a versão candidata

Gerar site e portátil; validar atualização offline, exportação/importação e orçamento. Fazer a avaliação ampla técnica concentrada aqui, conforme a preferência de trabalho do autor. O retorno visual do autor orienta ajustes; possuir aparelho antigo físico não vira pré-requisito artificial. Registrar o que não foi comprovado.

Aceite: todos os itens do escopo inicial estão aceitos ou retirados expressamente do escopo, sem botões de fachada. Nenhum risco conhecido de perda silenciosa de texto, seleção incorreta ou migração destrutiva pode ser tratado como detalhe cosmético. Avaliação linguística reservada tem relatório próprio; sua ausência limita alegações e capacidades que dependam dela.

### R08 — Substituir a produção com possibilidade de recuperação

Disponibilizar a versão candidata para teste, confirmar migração e conservar a versão anterior. Preparar instrução curta de backup, mudança e retorno. Publicar o domínio somente com destino e critérios concretos; verificar SHA, CI e deploy separadamente.

Aceite: `escrevaral.com` entrega a versão nova; o acervo importado confere; atualização e abertura offline correspondem à mesma geração; a versão anterior e o procedimento de recuperação estão disponíveis. Reversão de código e tratamento de dados têm instruções distintas.

As entregas podem ser subdivididas sem criar novos marcos indefinidamente. Cada subdivisão precisa terminar em comportamento utilizável. O plano não promete prazo fictício nem porcentagem de domínio da língua.

## 12. Critérios de encerramento da reconstrução

A versão inicial nova inclui escrita confiável, organização e recuperação do acervo, exportação/importação compatível, migração não destrutiva, design aprovado reconstruído, ferramentas existentes aceitas na matriz e lentes reaproveitadas com escopo verdadeiro. Inclui site e portátil derivados da mesma base, execução básica conservadora e documentação suficiente para outra pessoa continuar.

Ampliação geral da gramática, modelos pesados, inferência de intenção, nuvem, colaboração em tempo real e certificação em todos os aparelhos ficam fora da reconstrução. Não bloquear o término do site por uma promessa de compreender toda a língua. Também não usar essa exclusão para retirar capacidades que o site atual já oferece e foram incluídas na matriz.

Teste mínimo acompanha o risco de cada lote: integridade dos módulos e montagem em toda alteração estrutural; texto, persistência ou migração quando essas áreas mudam; offsets e cancelamento quando análises mudam. A bateria ampla fica em R07. Não parar a cada entrega para repetir uma auditoria completa; não adiar a descoberta de perda de texto até R07.

Cada entrega registra o que mudou, como foi verificado, custo medido ou ainda desconhecido, limites e próximo passo. Sem revisão de outro agente como dependência: a coordenação é solo, salvo instrução posterior do autor.

## 13. Como impedir uma sexta reconstrução

No novo repositório, `AGENTS.md` será curto e conterá as regras operacionais deste documento. `docs/ARQUITETURA.md` explica fronteiras; `docs/CONTRATOS.md` explica APIs; `docs/CONTINUIDADE.json` é a fonte do escopo; `docs/ESTADO.md` guarda a próxima ação. Decisões que mudam esses contratos recebem registro breve em `docs/decisoes/`. Não manter cinco planos concorrentes com estados divergentes.

A revisão automática deve recusar dependência circular, acesso a armazenamento fora do adaptador, DOM nos motores, globals da aplicação, edição de gerados e JavaScript incompatível com o caminho básico. Limites de bytes e dependências têm relatório. Falha de arquitetura não vira aviso eternamente ignorado.

Arquivos acima de 400 linhas ou módulos com mais de cinco dependências diretas disparam revisão de responsabilidade, não divisão mecânica nem proibição cega. Inventários e dados gerados são tratados à parte. Não reduzir contagem de linhas minificando o fonte. O critério principal é coesão e autoridade limitada.

Toda funcionalidade nova responde, antes de entrar: quem é dono do estado; quais dados recebe; que efeito pode produzir; como falha; quanto trabalho faz; como pode ser removida. Se a resposta for “precisa acessar tudo”, o desenho deve mudar.

Uma exceção tem motivo, escopo, verificação e condição de remoção. “Depois organizamos” não é uma decisão. A composição não recebe atalhos por urgência; ajustes de tela não abrem acesso direto ao banco; uma nova regra linguística não exige editar menu, storage e bootstrap simultaneamente.

## 14. Fontes fixadas para a reconstrução

Os caminhos abaixo pertencem ao commit inspecionado. A documentação pode ter trechos históricos; o código e a entrega específica prevalecem para afirmar comportamento atual. O histórico da conversa orienta preferências, mas não comprova implementação. Esta edição foi fundamentada em código, manifestos e documentação; não foi realizada uma nova inspeção visual do site nem reabertos todos os anexos históricos. O R00 deve identificar os que forem necessários para fixar o desenho visual.

1. [README.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/README.md) — Entrada do legado, distribuições e comandos.
2. [docs/ARQUITETURA.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/ARQUITETURA.md) — Fronteiras existentes, ponte global e dívidas declaradas.
3. [build/modules.json](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/build/modules.json) — Dependências concretas e composição de cofre/aplicativo/estilos.
4. [build/assets.json](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/build/assets.json) — Tamanhos e hashes da distribuição de referência.
5. [scripts/build.cjs](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/scripts/build.cjs) — Montagem e separação entre fonte, site e portátil.
6. [docs/PLANO-MESTRE.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/PLANO-MESTRE.md) — Mapa anterior de capacidades, estudos e pendências.
7. [docs/jornada/estado.json](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/estado.json) — Estado registrado na v6.63; não confundir texto de critério com conclusão.
8. [docs/MANUAL-LINGUISTICA-COMPUTACIONAL-ESCREVARAL.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/MANUAL-LINGUISTICA-COMPUTACIONAL-ESCREVARAL.md) — Princípios linguísticos, tradução de etiquetas e abstenção.
9. [docs/jornada/CONTRATO-ANALISE.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/CONTRATO-ANALISE.md) — Manuscrito imutável e experiência da cortina.
10. [docs/FILOSOFIA-E-COMPATIBILIDADE.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/FILOSOFIA-E-COMPATIBILIDADE.md) — Referência de aparelhos antigos, custo e limites de comprovação.
11. [packages/cofre/README.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/packages/cofre/README.md) — API pública, API interna, limites e alvo explícito.
12. [packages/cofre/src](https://github.com/rfmss/escrevaral/tree/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/packages/cofre/src) — Motores, registro e contrato de achados.
13. [ptbr/morfologia-contextual.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/ptbr/morfologia-contextual.js) — Leitura contextual delimitada e seleção de alvo.
14. [ptbr/relacoes-sintaticas.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/ptbr/relacoes-sintaticas.js) — Relações sintáticas delimitadas.
15. [ptbr/grupos-verbais.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/ptbr/grupos-verbais.js) — Tratamento existente de grupos verbais.
16. [ptbr/relativas.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/ptbr/relativas.js) — Primeiro recorte de relativas.
17. [ptbr/lexico-sintatico.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/ptbr/lexico-sintatico.js) — Inventário sintático e candidatos.
18. [resources/pt-BR](https://github.com/rfmss/escrevaral/tree/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/resources/pt-BR) — Inventários e recursos linguísticos, incluindo origem/licenças.
19. [ptbr/corpus](https://github.com/rfmss/escrevaral/tree/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/ptbr/corpus) — Casos de desenvolvimento e avaliações registradas.
20. [src/editor/contrato-analise.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/src/editor/contrato-analise.js) — Offsets, identidade e prova de fronteiras.
21. [ptbr/preparacao.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/ptbr/preparacao.js) — Preparação e reserva; candidato à extração, não integração pronta.
22. [ptbr/painel.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/ptbr/painel.js) — Referência de comportamento; não copiar o painel inteiro.
23. [src/storage/documentos.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/src/storage/documentos.js) — Documentos, revisões e comportamento de conflito legado.
24. [src/storage/cadernos.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/src/storage/cadernos.js) — Formatos v1/v2, inventário, remapeamento e journal.
25. [src/storage/linhagem.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/src/storage/linhagem.js) — Registro de linhagem; integridade não equivale a prova de autoria humana.
26. [src/ui/transferencia.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/src/ui/transferencia.js) — Transporte de arquivos no navegador.
27. [src/index.template.html](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/src/index.template.html) — Estrutura visual e inventário de controles a reconhecer.
28. [src/ui/styles](https://github.com/rfmss/escrevaral/tree/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/src/ui/styles) — Referência de aparência; reconstruir regras sem importar a cascata.
29. [src/editor/controlador.js](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/src/editor/controlador.js) — Inventário de comportamentos, explicitamente excluído do transplante.
30. [docs/jornada/ENTREGA-V6-55.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/ENTREGA-V6-55.md) — Consolidação contextual anterior à reorganização do painel.
31. [docs/jornada/ENTREGA-V6-56.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/ENTREGA-V6-56.md) — Organização por tarefas.
32. [docs/jornada/ENTREGA-V6-58.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/ENTREGA-V6-58.md) — Reserva lexical junto ao cursor.
33. [docs/jornada/ENTREGA-V6-59.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/ENTREGA-V6-59.md) — Filtro lexical.
34. [docs/jornada/ENTREGA-V6-60.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/ENTREGA-V6-60.md) — Integração do exame contextual.
35. [docs/jornada/ENTREGA-V6-61.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/ENTREGA-V6-61.md) — Prova distante de proteções.
36. [docs/jornada/ENTREGA-V6-62.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/ENTREGA-V6-62.md) — Linhas anteriores longas.
37. [docs/jornada/ENTREGA-V6-63.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/jornada/ENTREGA-V6-63.md) — Alvo após os primeiros 100 resultados e limites remanescentes.
38. [tests](https://github.com/rfmss/escrevaral/tree/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/tests) — Verificações existentes, a selecionar por contrato.
39. [docs/CONTRATO-PACOTES-LINGUISTICOS.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/docs/CONTRATO-PACOTES-LINGUISTICOS.md) — Pacotes particionados e preparação; distinguir proposta de implementação.
40. [packages/connectors/portparser/README.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/packages/connectors/portparser/README.md) — Experimento isolado e capacidades não instaladas.
41. [THIRD_PARTY.md](https://github.com/rfmss/escrevaral/blob/53c4afe5090f3bcdc3a5fac9bd920c4783a2acae/THIRD_PARTY.md) — Atribuições de terceiros.

## 15. Instrução de partida para o próximo trabalho

> Construa o novo Escrevaral seguindo este documento. Comece pelo R00 e por uma base limpa isolada da produção. Consulte a referência antiga no SHA fixado somente para extrair capacidades justificadas, design e evidências. Não copie o controlador, a cascata CSS nem o aplicativo inteiro. Preserve o manuscrito, o acervo antigo, a identidade visual e os limites honestos das engines. Dê a cada módulo estado próprio e dependências explícitas. Entregue primeiro a Mesa confiável, depois acervo e motores, atualizando a matriz de continuidade. Trabalhe solo, com verificações dirigidas e auditoria ampla no fechamento. Não substitua escrevaral.com antes do marco de transição. Registre decisões nos documentos do novo repositório e deixe sempre uma próxima ação executável.

**Primeira entrega concreta:** inventário de continuidade e esqueleto que abre uma Mesa funcional sem depender de cofre, cache ou utilitários. O passado serve de fonte; a arquitetura nova determina o que pode entrar.
