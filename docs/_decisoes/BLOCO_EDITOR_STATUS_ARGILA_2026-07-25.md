# Bloco C1 — situação do editor Argila

## Problema confirmado

A barra inferior atual mistura tarefas de naturezas diferentes: contagem, salvamento, página, meta, temporizador, visitas, redes sociais, contato, Mesa no celular e copyright.

No celular, a mesma barra ocupa a base da janela enquanto o dock também é fixo. A tentativa anterior de comprimir tudo em 34 px foi rejeitada por cortes, sobreposição e perda de acesso em 320, 390 e 430 px.

## Decisão de produto

A faixa de situação existe para responder imediatamente a duas perguntas:

1. quanto foi escrito;
2. o texto está salvo?

Meta e temporizador pertencem a uma sessão de escrita e ficam atrás de um único acesso secundário chamado **Sessão**.

Visitas, redes sociais, contato e copyright não pertencem à faixa móvel de escrita. No desktop, permanecem como grupo institucional silencioso até a etapa de reorganização da Oficina/Sobre.

## Composição

### Imediato

- contagem de palavras;
- estado de salvamento;
- página atual quando o modo página estiver ativo.

### Secundário

- meta de palavras;
- progresso da meta;
- temporizador.

### Fora da faixa móvel

- visitas;
- redes sociais;
- e-mail;
- copyright;
- atalho técnico da Mesa.

## Comportamento móvel

- faixa integrada visualmente ao dock, posicionada imediatamente acima dele;
- apenas na área de escrita;
- sem texto essencial truncado;
- contagem compacta mostra palavras, mantendo os detalhes completos no rótulo acessível;
- `Sessão` abre um painel temporário acima da faixa;
- conteúdo do editor reserva espaço para faixa e dock;
- nenhuma segunda faixa aparece nas demais áreas.

## Comportamento desktop e tablet

- contagem, salvamento e página ficam agrupados à esquerda;
- `Sessão` é um controle secundário;
- informações institucionais ficam à direita e visualmente rebaixadas;
- painel de sessão abre para cima, sem mudar a altura do editor.

## Escopo protegido

- nenhuma engine;
- nenhum manuscrito ou formato `.esc`;
- nenhuma chave de armazenamento;
- nenhuma lógica de meta ou temporizador;
- nenhuma rota;
- nenhum comportamento de página/livro.

## Critério de saída

- 320, 390 e 430 px sem sobreposição, corte ou rolagem horizontal;
- alturas de 520, 640 e 844 px testadas para representar teclado e telas compactas;
- palavras e salvamento sempre perceptíveis no editor;
- meta e temporizador acessíveis por teclado e toque;
- painel fecha por `Escape` e ao sair do editor;
- desktop preserva página atual e informações institucionais;
- foco, console, engines, integridade, Mesa, Palavras e offline permanecem verdes.
