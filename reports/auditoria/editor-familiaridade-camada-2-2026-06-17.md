# Auditoria aplicada — familiaridade de editor, camada 2

Data: 2026-06-17
Responsável: Codex

## Pergunta

Onde o editor ainda parece "nosso demais" antes de parecer "familiar o bastante"?

## Resposta curta

Principalmente em três frentes:

1. linguagem poética ou interna demais no estado vazio do editor livre;
2. nomes curtos ou ambíguos para controles que deveriam soar óbvios;
3. uso precoce de "manuscrito" em momentos em que a pessoa ainda só quer abrir e editar um texto.

## Melhorias aplicadas

### 1. Entrada mais direta no texto em branco

- placeholder padrão do editor livre:
  - antes: `Comece aqui. A primeira frase abre o caminho.`
  - agora: `Digite ou cole seu texto aqui.`
- card `Folha em branco`:
  - antes: foco em tom de oficina;
  - agora: explica que o fluxo serve para escrever ou colar um rascunho.

Intenção: no modo livre, a primeira mensagem precisa parecer editor antes de parecer ateliê.

### 2. Controles com nomes mais familiares

- botão da lateral do guia nasce como `Mostrar guia`, não apenas `Guia`;
- `Mesa` virou `Fundo`, com tooltip `Mudar fundo do editor`;
- `Página` virou `Modo página`;
- presets de página ficaram mais autoexplicativos:
  - `Texto corrido`
  - `Página de envio`
  - `Leitura confortável`
  - `Word / ABNT`

Intenção: reduzir a necessidade de interpretar vocabulário do produto.

### 3. Troca seletiva de "manuscrito" por "texto"

Mudamos apenas onde a ação é básica e imediata:

- `Novo texto`
- `Apagar este texto`
- `Título do texto`
- `Texto sem título`
- `Nenhum texto aberto`
- `Texto vazio`
- `Texto aberto`

Mantivemos `manuscrito` em contextos editoriais mais amplos, onde o termo ainda faz sentido.

## Autocrítica

Este pacote melhora a porta de entrada, mas não resolve tudo.

### O que ainda permanece "nosso demais"

1. O painel de guia ainda compete visualmente com a escrita em certas situações, especialmente no mobile.
2. O modo página continua poderoso, mas ainda apresenta muitos controles juntos para quem só quer escrever. No mobile, ele pode não aparecer no primeiro enquadramento da toolbar.
3. O produto ainda alterna entre linguagem de editor de texto e linguagem de oficina literária sem uma régua única por superfície.

### O que eu deliberadamente não fiz agora

1. Não transformei o guia em drawer mobile nesta rodada.
2. Não reestruturei a toolbar de página inteira.
3. Não removi o vocabulário editorial do produto; só reduzi sua entrada prematura.

## Critério para a próxima rodada

O editor deve passar neste teste:

- a pessoa abre;
- entende onde digitar;
- entende como abrir o guia;
- reconhece como copiar, baixar e mudar para página;
- não precisa aprender a linguagem interna do Escrevaral antes da primeira linha.
