# Continuação do Escrevaral

Estado consolidado em 10/09/2026. Primeiro leia [PROJECT.md](../PROJECT.md), [AGENTS.md](../AGENTS.md), [CONSTITUICAO.md](CONSTITUICAO.md) e [FILOSOFIA-DE-TRABALHO.md](FILOSOFIA-DE-TRABALHO.md). A Constituição foi preservada literalmente.

## Onde retomar

Repositório `rfmss/escrevaral`; alterações somente em `astra/escrevaral-master`. Entrada ativa `astra/escrevaral.html` ou `astra/index.html`. Não reiniciar pela aplicação legada da raiz. Outras branches foram consultadas com autorização, exclusivamente para aprender com as engines; não foram alteradas.

Última entrega de engines: `d0d5b16cafa41be42435689ef53f599fbf072e41`. A atualização documental posterior acrescenta o contrato de colaboração. Conferir o HEAD antes de trabalhar; não usar um SHA histórico como ordem de reset.

Revisão online: https://escrevaral-review.rafamass975189.chatgpt.site. Treze lentes publicadas com sucesso. Documentação de filosofia não exige republicar o runtime.

## Entregue

- Editor e acervo locais; título acima da hora fixa de criação, segundos e folhas vazias persistentes.
- Navegação mês → dia → notas, busca global por título/texto e marcador exclusivo da nota aberta.
- Superfície gesso/grafite em claro/escuro, fonte de escrita local, painéis contidos, foco opcional por parágrafo e rolagem de máquina de escrever.
- Treze lentes sob pedido; critérios de amostra e alcance em [MATURACAO.md](MATURACAO.md). Nada analisa durante a digitação ou reescreve o manuscrito.
- 884 formas verbais exatas; 65 lemas para infinitivo contextual; 1.447 expressões; 18 observações decoloniais. Crase e concordância são recortes delimitados; ritmo e repetição são observações.
- Orquestrador independente de regras linguísticas e DOM. Conhecimento, máquina, superfície e oficina permanecem separados.
- Memória operacional, filosofia e instruções de agentes registram a atuação de Rafa e do parceiro técnico, com base nos dois anexos de 10/09.

## Evidências e limites

450 verificações passaram na entrega de engines, incluindo ES5, preservação, offsets, equivalência portátil e execução sem rede/APIs modernas. Testes de lógica e medição em V8/Linux; navegador real e iPad físico desta versão permanecem pendentes. HTML portátil: 456.821 bytes. A visita ao link não instala suporte offline: guardar o arquivo não elimina possíveis restrições do visualizador do aparelho.

Inventário das 68 branches, 17 conjuntos linguísticos, sondas e medições ficam em `oficina/`, fora do runtime. Os catálogos do ZIP recebido têm hashes em `oficina/proveniencia-cofre.json`. Não tratar comentários de maturidade do legado como prova de acerto.

## Como continuar

Priorizar o escopo pedido por Rafa. Para ampliar uma engine, usar os critérios e a bancada da maturação. Para UI, comparar custo real e percepção, investigar simulações baratas e preservar os dados. Resolver escolhas rotineiras autonomamente; discutir trade-offs de produto quando necessários.

Gates de runtime: `node astra/testes/run.js` e `node astra/oficina/empacotar.js --check`; regeneração opcional de manutenção: `node astra/oficina/empacotar.js`. Em alterações só de documentação, conferir links e coerência, sem repetir a bateria do produto.

Pendências reais: aparelho físico, revisão bibliográfica/linguística independente, cobertura sintática mais ampla, clíticos e Prova de autoria. Não prometer conclusão dessas frentes sem implementação e evidência.
