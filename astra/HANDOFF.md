# Continuação do Escrevaral

Estado consolidado em 10/09/2026. Primeiro leia [PROJECT.md](../PROJECT.md), [AGENTS.md](../AGENTS.md), [CONSTITUICAO.md](CONSTITUICAO.md) e [FILOSOFIA-DE-TRABALHO.md](FILOSOFIA-DE-TRABALHO.md). A Constituição foi preservada literalmente.

## Onde retomar

Repositório `rfmss/escrevaral`; alterações somente em `astra/escrevaral-master`. Entrada ativa `astra/escrevaral.html` ou `astra/index.html`. Não reiniciar pela aplicação legada da raiz. Outras branches foram consultadas com autorização, exclusivamente para aprender com as engines; não foram alteradas.

Última entrega de engines: `d0d5b16cafa41be42435689ef53f599fbf072e41`. A atualização documental posterior acrescenta o contrato de colaboração. Conferir o HEAD antes de trabalhar; não usar um SHA histórico como ordem de reset.

Revisão online: https://escrevaral-review.rafamass975189.chatgpt.site. Treze lentes publicadas com sucesso. Rodada seguinte: papel, foco completo e impressão A4; cursores adiados.

## Entregue

- Editor e acervo locais; título acima da hora fixa de criação, segundos e folhas vazias persistentes.
- Navegação mês → dia → notas, busca global por título/texto e marcador exclusivo da nota aberta.
- Superfície gesso/grafite em claro/escuro, fonte de escrita local, painéis contidos, foco opcional por parágrafo e rolagem de máquina de escrever.
- Treze lentes sob pedido; critérios de amostra e alcance em [MATURACAO.md](MATURACAO.md). Nada analisa durante a digitação ou reescreve o manuscrito.
- 884 formas verbais exatas; 65 lemas para infinitivo contextual; 1.447 expressões; 18 observações decoloniais. Crase e concordância são recortes delimitados; ritmo e repetição são observações.
- Orquestrador independente de regras linguísticas e DOM. Conhecimento, máquina, superfície e oficina permanecem separados.
- Memória operacional, filosofia e instruções de agentes registram a atuação de Rafa e do parceiro técnico, com base nos dois anexos de 10/09.

## Evidências e limites

465 verificações passaram após papel, foco e impressão, incluindo ES5, preservação, offsets, equivalência portátil e execução sem rede/APIs modernas. Testes de lógica e medição em V8/Linux; navegador real e iPad físico desta versão permanecem pendentes. HTML portátil: ver medida atual em PROJECT.md. A visita ao link não instala suporte offline: guardar o arquivo não elimina possíveis restrições do visualizador do aparelho.

Inventário das 68 branches, 17 conjuntos linguísticos, sondas e medições ficam em `oficina/`, fora do runtime. Os catálogos do ZIP recebido têm hashes em `oficina/proveniencia-cofre.json`. Não tratar comentários de maturidade do legado como prova de acerto.

## Como continuar

Priorizar o escopo pedido por Rafa. Para ampliar uma engine, usar os critérios e a bancada da maturação. Para UI, comparar custo real e percepção, investigar simulações baratas e preservar os dados. Resolver escolhas rotineiras autonomamente; discutir trade-offs de produto quando necessários.

Gates de runtime: `node astra/testes/run.js` e `node astra/oficina/empacotar.js --check`; regeneração opcional de manutenção: `node astra/oficina/empacotar.js`. Em alterações só de documentação, conferir links e coerência, sem repetir a bateria do produto.

Pendências reais: aparelho físico, revisão bibliográfica/linguística independente, cobertura sintática mais ampla, clíticos e Prova de autoria. Não prometer conclusão dessas frentes sem implementação e evidência.

## Papel, foco e impressão — rodada de 10/09/2026

Implementado na superfície, sem mudar engines ou armazenamento:
- Foco da barra recolhe a interface; destaque de parágrafo foi para Ajustes. Escape ou botão discreto de saída restauram a mesa, sem reconstruir o textarea. Foco não termina por inatividade.
- Linha ativa a 42% da altura útil; espaços superior/inferior assimétricos permitem levar primeira e última linha ao alvo. Seleção, composição e rolagem manual mantêm as proteções anteriores.
- Ajustes → Imprimir esta folha: cópia textual do título/manuscrito atual, inclusive sem salvar. `beforeprint` e `matchMedia('print').addListener` preparam também a impressão pelo navegador; botão prepara antes de `window.print`. `afterprint` libera a cópia. Sem duplicar manuscrito a cada tecla.
- CSS de impressão: A4, margens de 25 mm, Times New Roman 12 pt/1,5; título 16 pt; papel branco, texto preto, quebras preservadas. Cabeçalhos, rodapés e tamanho físico podem depender das opções do navegador/impressora. Paginação multipágina ainda não conferida em navegador real.
- Referências `escrevaral-eink/styles.css` e `indexref.html`: filetes, papel e tinta; sem transplantar fontes de rede, largura mínima de 1120 px, filtros de ruído, JS moderno ou foco com temporizador. Textura monocromática determinística de 32×32 px, PNG de 527 bytes embutido; sem animação, bibliotecas ou nova fonte. Marca original preservada.
- Marcador de nota: borda esquerda reta, sem bloco preenchido, claro/escuro; hover não imita seleção.

Testes acrescentados cobrem entrada/saída do foco, seleção e deslocamento ao mudar altura, impressão de 2.000 linhas sem salvar, HTML literal, estado claro/escuro/foco e eventos de impressão antigos. Bateria ES5/portátil aprovada. Nada disso equivale a renderização ou iPad físico. O pedido explícito adiou os cursores; não implementá-los sem retomada desse escopo.

### Correção de acentos no destaque de parágrafo

A composição (`~` antes de `a`, por exemplo) apagava ambas as máscaras e devolvia contraste a todos os parágrafos. Agora a superfície conserva a geometria anterior durante a composição, inclusive quando o navegador fornece uma seleção provisória diferente. A rolagem desloca as mesmas máscaras sem medir texto provisório. No fim da composição, o destaque é recalculado e a máquina de escrever retoma. Os eventos duplicados de composição foram consolidados. Sem nova API ou temporizador recorrente.

Regressão reproduzida antes da correção e aprovada depois: til, circunflexo e agudo, claro/escuro, foco completo ligado/desligado, seleção transitória, rolagem e desativação do destaque. 454 verificações aprovadas; teclado real de navegador/iPad ainda sem reprodução instrumental.

## Máquina antiga — capa opcional

Ativar em Ajustes → Máquina antiga. Preserva o mesmo textarea, o tema escolhido e o destaque de parágrafo; recolhe a interface. Escape/botão de saída restauram o estado de foco anterior. Sem persistir o modo automaticamente. Som continua opcional e sintetizado localmente pelo mecanismo já existente.

Composição visual baseada no blueprint de Rafa: carro e papel acima, rolo e fita preta/vermelha ao centro, dois carretéis e cesto de 28 hastes com tipos invertidos abaixo. Desenho geométrico estilizado solicitado em CSS; nenhuma imagem da máquina ou áudio externo. O mecanismo encolhe para um rolo em altura útil inferior a 480 px. Camada decorativa sem eventos de ponteiro e escondida de leitores de tela; impressão já a exclui.

O alvo vertical do modo passa a 88% da janela menor de papel (próximo ao mecanismo); a mesa comum conserva 42%. A haste usa dois estados com um timeout de 90 ms, sem loop; carro desloca no máximo 18 px para manter a folha acessível. Inserção de nova linha retorna o carro e simula avanço de 3 px por 120 ms. São movimentos perceptivos, não uma simulação física. CSS respeita preferência de movimento reduzido onde disponível. Sem WebGL, áudio de rede, captura global para inserir letras ou reinício de animação por leitura forçada de layout.

Eventos reais de edição conduzem o efeito; composição provisória não move o carro, colagem permanece integral, modificadores não geram texto. Escape durante composição cancela o gesto no navegador sem sair do modo. Saída/blur/ocultação cancelam movimentos pendentes. Estado da impressão e a correção anterior de acentos foram preservados.

458 verificações aprovadas: modos, tema, preservação, acentos, impressão, timers limitados, retorno no Enter, colagem e seleção. Portátil 479.641 bytes, aumento de 15.257 bytes sobre a versão de correção de acentos. Sintaxe ES5 e equivalência modular/portátil aprovadas. Aparência, percepção do movimento, CPU/RAM no aparelho e iPad físico ainda sem validação; testes de DOM simulado não medem renderização.

## Refinamento aprovado: rubber stamp e folha ampla

Substitui a apresentação anterior de meia tela: a folha ocupa aproximadamente 85% em desktop; base de 108 px (78 px em telas estreitas, 48 px com teclado/altura baixa). Carimbo transparente indexado de 1400×160 px e 12.938 bytes em `superficie/marca/maquina-carimbo.png`, pré-calculado a partir da geometria da máquina; textura de tinta já gravada. CSS inclui os mesmos bytes para funcionar em ambas as entradas sem requisição adicional. Dois elementos substituem dezenas de peças DOM. Fonte e manuscrito continuam legíveis, sem aplicar desgaste aos caracteres.

Alvo vertical de escrita voltou a 42% inclusive neste modo. A medição já existente devolve também a posição horizontal; depois da rolagem, a haste recebe o ponto visível da escrita e percorre a distância até a base. Nenhuma segunda medição do texto para o efeito. Golpe CSS de 90 ms (aproximação, contato, recolhimento), prefixo WebKit e movimento reduzido quando disponível. Sem animação contínua. Carro limitado a 6 px. Fallback geométrico central nos ambientes sem medição; não simula uma letra nem altera o textarea.

459 verificações aprovadas, incluindo encontro da haste com coordenadas visíveis, cancelamento fora da folha e preservação dos testes anteriores. Portátil 558.151 bytes. O arquivo do carimbo foi inspecionado; aparência final em navegador e percepção do golpe no iPad permanecem pendentes. As proporções e medidas desta seção substituem as da capa anterior.

## Tipografia editorial — 11/09/2026

Estudo `stitch_harmonious_typography_refactor.zip` aprovado: Noto Serif Regular na interface, títulos e notas; Courier Prime Regular original no manuscrito e horários. Removida a deformação anterior de altura/largura. Sombras de tinta reduzidas nos dois temas e na máquina. Conservados tamanhos confortáveis, contraste de metadados, área útil e marcador reto. Sem incorporar margens excessivas, dependências de rede ou famílias auxiliares do estudo.

Dois WOFF locais embutidos: Courier Prime original (34.964 bytes) e Noto Serif estática 400/100, subconjunto latino com diacríticos combinantes e pontuação (42.860 bytes). Licenças OFL e hashes de origem/resultado no CSS. Sem fonte variável no runtime; Georgia/Courier como alternativas locais. Glifos PT-BR conferidos. Impressão mantém Times New Roman. A medição da linha usa a tipografia computada do próprio editor. 459 verificações funcionais aprovadas; percepção visual e aparelhos antigos ainda dependem de validação real.

## SCRVRL OS — primeira rodada funcional, 11/09/2026

Aprovado por Rafa após comparação dos protótipos `escrevaral_os_desktop.zip` e `escrevaral_os_v2.zip`. Os dois DOCX de arquitetura recebidos têm texto idêntico. A deliberação vigente aproveita a organização de computador pessoal do primeiro e a monocromia do segundo; os protótipos não substituem persistência ou engines.

- Entrada pelo Gabinete, sem criar uma folha vazia na visita: seus escritos, projetos por nome, continuar escrevendo, busca global em títulos/corpos e oficina com ações reais. Lista limitada a 40 resultados por vez, com expansão explícita. Projetos/folhas usam botões reais, sem depender de arrastar ou duplo clique.
- Projeto novo abre uma folha vinculada. Em Ajustes, a folha pode receber outro nome de projeto ou voltar a avulsa. `project` é campo opcional de até 120 caracteres na própria folha; nomes iguais agrupam as folhas. Sem banco paralelo de associação ou regravação do acervo legado. Nomes diferenciam maiúsculas; projetos existem enquanto há folhas vinculadas. Exportação JSON/importação aditiva preservam o campo.
- Gabinete → Mesa mantém o textarea e as engines. Retorno guarda antes de sair; falha deixa a escrita visível. Na mesma sessão, retomar conserva seleção/rolagem. Nova abertura do aplicativo mostra o Gabinete e retoma o manuscrito conhecido; não promete seleção persistente entre reinicializações. Escape fecha painel, depois foco, depois volta ao Gabinete; composição de acentos tem precedência. Ctrl/⌘+K busca.
- Paleta sage `#CCD5C7`, tinta `#1E2320`, textos secundários `#4A544C`; sombra de painel reduzida. Esta aprovação substitui a alteração cinza mineral que ficou pausada. Tela de impressão continua branca. Claro/escuro, máscara de parágrafo e foco preservados.
- Arial para comandos/metadados, Noto Serif para títulos/escrita; Courier Prime original como alternativa em Ajustes → Letra do manuscrito. Preferência local. Phosphor Light oficial, SVG inline estático, seis desenhos de oficina/projeto; MIT no HTML portátil e em `superficie/marca/PHOSPHOR-LICENSE.txt`. Sem biblioteca, fonte de ícones, CDN, polling ou animação nova.
- CSS separado `superficie/gabinete.css`, regras apenas de tela. Em telas estreitas, projetos e oficina continuam acessíveis na mesma área de rolagem; na mesa, a navegação por datas existente permanece disponível. Sem implementar janelas arrastáveis ou falsas aplicações.
- Máquina antiga adiada a pedido de Rafa: código preservado, acionador recolhido. Não foram incorporados flash obrigatório, atraso artificial, metas, diagnóstico contínuo, bloqueio de colagem, selo de autoria, métricas demonstrativas nem formato .scrvrl sem contrato. Acervo JSON e texto continuam exportáveis.

465 verificações funcionais aprovadas. Novas regressões: entrada sem registro fantasma; retorno/seleção; troca de textos entre projetos; busca global; cópia/restauração de projeto; falha de armazenamento; ações de oficina sem análise automática; Escape/composição; fontes e nomes literais. Portátil e ES5 conferidos. Navegador visual, paginação de impressão e aparelhos físicos continuam sem validação; a primeira revisão visual cabe ao autor no link.

## Correção de direção: ambiente do anexo 1, acabamento do anexo 2

Pedido explícito seguinte de Rafa: área de trabalho de computador, com ícones soltos, menus, janelas e barra de tarefas, usando o tratamento sage/editorial-industrial do segundo screenshot. Substitui a escolha anterior de Gabinete como painel fixo. A janela inicial agora contém os projetos e as folhas reais; a oficina fica no desktop. Arquivo abre a janela; Escrita abre a mesa; Exibir reposiciona a janela; Início e a tarefa restauram-na. Minimizar mantém a tarefa; fechar a retira até reabrir. Ações auxiliares usam os painéis existentes como janelas centradas no desktop; na mesa continuam laterais.

Janela de escritos: arrasto por mouse/toque apenas em telas largas, limitado à área útil e sem loop de animação; medidas lidas ao iniciar o gesto, posições limitadas atualizadas por eventos. Ampliar/restaurar por botão. Redimensionamento reposiciona para evitar perda da janela; telas estreitas usam janela ajustada à área útil e dispensam arrasto. Busca reabre a janela minimizada/fechada. Nenhuma reconstrução de texto na troca de vista.

Acabamento: Phosphor monocromático preservado, filetes sólidos/pontilhados e enquadramento sem sombra dura ou grade xadrez. Oswald 600 reaproveitada do legado, convertida na oficina em WOFF estático latino de 23.056 bytes; licença OFL/origem/hash no CSS. Oswald nos títulos/réguas, Arial nos comandos e Noto Serif no manuscrito; Courier Prime continua alternativa. Sem dependência adicional de execução. Sem inserir contadores, gramatura ou funções fictícias das referências.

467 verificações passaram, incluindo minimizar/fechar/restaurar sem perder texto, busca que restaura a janela, arrasto limitado, botões sem arrasto involuntário e toque em tela estreita. Sintaxe ES5 e edição portátil conferidas. Portátil 638.258 bytes. Nenhuma validação visual de navegador ou física do iPad; a inspeção funcional não atesta aparência final.


## Fundação do Estúdio e orientação — 12/09/2026

Entrega seguinte ao desktop editorial: Início permanente, aplicativos no menu, caminho clicável, lembretes textuais no desktop, estado de sessão, lixeira/restauração/exclusão confirmada e cópia interna por seleção. Novas lentes `adverbios` e `dialogo`; quinze no total. Contrato de análise vincula resultado a documento, registro, revisão e recorte UTF-16.

481 verificações passaram; portátil 670.087 bytes. Verificação lógica, ES5 e equivalência portátil; não houve teste visual de navegador nem físico no iPad. Documento canônico desta etapa: [ESTUDIO.md](ESTUDIO.md), com o mapa aprovado, contratos e pendências. Os pedidos estão aprovados; continuar a migração de projetos com IDs e conectar Varal → Mesa → Revisão, sem apresentar a fundação como Estúdio completo. Os anexos de React e e-ink continuam referências, não o runtime.


## Mesa do anexo conectada — 12/09/2026

Pedido de Rafa: fechar Início ao clicar fora e fazer da referência e-ink a Mesa real. Novo `superficie/mesa-editorial.css`, o mesmo editor e armazenamento; cabeçalho editorial com título/data, folhas à esquerda (projeto/data, busca global), instrumentos/contagens à direita. Controles reais: fonte local, tamanho de leitura persistente, parágrafo, foco, exportação, impressão, lixeira e vínculo de projeto. Elementos fictícios/formatação rica do protótipo omitidos. Sem timer de foco automático de seis segundos, fonte remota, contenteditable ou troca de arquitetura. Contagem literal em máquina pura; atualiza após guardar ou ação explícita, sem classificar qualidade nem iniciar análise linguística.

Menu Início fecha por clique, toque e foco externos; clique nos seus descendentes e no acionador não é fechamento externo. 486 verificações funcionais, ES5 e equivalência portátil; renderização de navegador e iPad físico continuam pendentes. Continuidade do Estúdio em ESTUDIO.md permanece válida.
