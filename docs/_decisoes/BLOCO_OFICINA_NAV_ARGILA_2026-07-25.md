# Bloco E1 — hierarquia desktop da Oficina

## Problema confirmado

A topbar apresenta seis módulos no mesmo nível: Escrever, Palavras, Autoria, Acervo, Ateliê e Plano.

Essa igualdade visual faz ferramentas de apoio competirem com as duas tarefas fundamentais do produto:

1. escrever;
2. reencontrar um texto.

A profundidade do Escrevaral passa a parecer acúmulo de funcionalidades, apesar de cada área ter valor real.

## Decisão de produto

A navegação desktop terá três destinos principais:

- **Escrever** — criar e editar;
- **Acervo** — localizar, organizar, proteger e exportar;
- **Oficina** — trabalhar o texto e o processo.

Dentro de **Oficina** permanecem:

- **Visão geral** — o Ateliê atual, com caminhos de revisão, guias e publicação;
- **Palavras** — léxico e contexto do manuscrito;
- **Autoria** — prova do processo humano;
- **Plano** — metas, calendário e rotina.

## Princípios

- nenhuma view ou rota é removida;
- os mesmos botões `data-view-target` continuam acionando o aplicativo;
- Oficina recebe estado ativo quando qualquer módulo agrupado está aberto;
- o menu fecha após a escolha, por `Escape` e por clique externo;
- cada item explica a tarefa, não a tecnologia;
- a organização usa espaço, tipografia e uma única superfície discreta;
- mobile e tablet preservam dock/rail neste bloco.

## Escopo protegido

- nenhuma engine;
- nenhum manuscrito, estado ou formato;
- nenhum controlador de view existente;
- nenhum rótulo do dock móvel;
- nenhuma remoção de acesso direto contextual dentro do editor ou Acervo.

## Critério de saída

- a partir de 820 px, somente Escrever, Acervo e Oficina aparecem no primeiro nível;
- Palavras, Autoria, Ateliê e Plano continuam alcançáveis por teclado e mouse;
- o módulo ativo é perceptível no item e no agrupador Oficina;
- menu inteiramente dentro da janela em 820, 1024 e 1440 px;
- em 390 e 768 px, dock e rail permanecem iguais;
- foco, contraste, Escape, console, overflow, offline e integridade permanecem aprovados.
