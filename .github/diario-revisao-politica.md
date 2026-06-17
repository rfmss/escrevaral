# Política de revisão — Diário do Escrevaral

Esta política existe para que Claude, Codex e revisão humana trabalhem em continuidade sem depender de nova explicação oral a cada rodada.

## Objetivo

Transformar o histórico de versões do Escrevaral em registros públicos legíveis para quem escreve, sem inventar fatos, sem exagerar impacto e sem deixar a linguagem técnica dominar o texto.

## Regra-mãe

O diário não é lugar de marketing inflado nem de changelog cru.

Ele deve ser:

- fiel ao que aconteceu;
- humano para quem lê;
- curto o bastante para manter ritmo;
- honesto quando a mudança é pequena;
- silencioso sobre o que não pode afirmar.

## Papéis

### 1. Agente diarista

Responsável por:

- ler os commits e sinais de versão;
- montar o primeiro rascunho;
- traduzir o técnico em efeito percebido;
- manter o formato do post.

Não pode:

- inventar benefício;
- presumir intenção;
- prometer impacto não demonstrado;
- fingir entender commit vago.

### 2. Agente revisor factual

Responsável por:

- checar se cada afirmação tem lastro literal nos commits;
- cortar inferência indevida;
- rebaixar tom quando houver exagero;
- marcar ambiguidade como ambiguidade.

Pergunta central:

`Se eu apagar os commits de origem, ainda consigo defender esta frase?`

Se a resposta for não, a frase sai ou enfraquece.

### 3. Agente revisor de tom

Responsável por:

- manter a voz do Escrevaral;
- remover jargão técnico excessivo;
- impedir linguagem publicitária;
- preservar legibilidade para escritoras e escritores.

Pergunta central:

`Quem escreve no Escrevaral entenderia isso sem precisar gostar de software?`

### 4. Revisão humana

Obrigatória quando houver:

- mudança sensível de posicionamento;
- menção pública a IA, autoria, direitos ou segurança;
- texto que soe mais promocional que documental;
- dúvida factual não resolvida pelos commits.

## Níveis de publicação

### Nível 0 — mecânico

Fonte:

- commits;
- versão;
- data.

Saída:

- segura;
- sem invenção;
- pouco elegante, mas publicável.

Uso:

- modo zero-custo;
- ausência de token de IA;
- contingência.

### Nível 1 — assistido por IA

Fonte:

- mesmo material do nível 0;
- prompt editorial;
- validação posterior.

Saída:

- mais fluida;
- ainda ancorada em fatos.

Uso:

- quando houver cota gratuita ou token disponível;
- nunca sem regra de revisão factual.

## Checklist de liberação

Antes de publicar, confirmar:

1. o título descreve algo real;
2. o resumo não promete além do commit;
3. o corpo traduz sem mentir;
4. não há jargão desnecessário;
5. o texto não parece anúncio;
6. a frase final importa para quem escreve;
7. se houver dúvida factual, o post fica mecânico ou vira rascunho.

## Modo recomendado

Para operação contínua de baixo custo:

- geração automática diária;
- publicação automática apenas para rascunhos mecânicos ou revisados;
- idealmente abrir artifact ou PR quando a fonte estiver fraca;
- revisão humana para posts mais interpretativos.

## Frase de proteção

Quando o material estiver magro, preferir uma verdade menor a uma narrativa melhor.
