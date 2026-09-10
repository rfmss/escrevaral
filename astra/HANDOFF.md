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

454 verificações passaram após papel, foco e impressão, incluindo ES5, preservação, offsets, equivalência portátil e execução sem rede/APIs modernas. Testes de lógica e medição em V8/Linux; navegador real e iPad físico desta versão permanecem pendentes. HTML portátil: 464.384 bytes. A visita ao link não instala suporte offline: guardar o arquivo não elimina possíveis restrições do visualizador do aparelho.

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
