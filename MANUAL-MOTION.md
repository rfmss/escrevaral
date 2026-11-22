# Manual de Motion e Quietude das Áreas Nobres · Escrevaral

Este manual registra a disciplina de movimento, repouso visual e hierarquia de botões do Escrevaral — parceiro do [MANUAL-TIPOGRAFIA.md](MANUAL-TIPOGRAFIA.md).

---

## 1. Regra Geral das Áreas Nobres (Quietude em Repouso)

Enquanto o escritor cria, a **folha de texto** é a protagonista absoluta.

- **Sem blocos escuros competindo em repouso:** botões laterais, ações de criação (`+ Novo projeto`) e estados ativos das barras (`Parágrafo`, ferramentas) devem permanecer calmos e integrados ao papel digital **E-Ink Sálvia (`#c4cfc2`)**, sem manchas pretas ou marrons chapadas puxando o olhar para fora do manuscrito.
- **Evidência sob demanda (*hover in* / *hover off*):** o destaque rico — como a atmosfera **Real Gabinete** no portal *Academia e Literatura* ou o preenchimento carvão-botânico de `+ Novo projeto` — desperta quando o ponteiro passa por cima (*hover in* ou foco via teclado) e recolhe suavemente ao sair (*hover off*).

---

## 2. O Truque das 3 Etapas (Início → Passagem → Chegada)

Toda micro-animação do Escrevaral é **curta (`160–280 ms`)**, **econômica** (CSS puro em `transform`, `opacity` e `clip-path`, zero loops contínuos) e desenhada em **três quadros legíveis**, como uma boa animação clássica:

1. **Etapa 1 — Início (`0%`, repouso):** o elemento repousa integrado ao papel; a camada de destaque e o pulso guia estão recolhidos na borda de entrada.
2. **Etapa 2 — Posição intermediária (`~45–55%`, passagem):** um gesto curto cruza o elemento (ex.: o filete dourado de *toque de mágica* atravessando *Academia e Literatura* enquanto o pergaminho/mogno se desenrola, ou o leve avanço de `+2 px` nos ícones de navegação).
3. **Etapa 3 — Chegada (`100%`, estado ativo):** o elemento assenta com contraste firme e legível; ao sair com o mouse (*hover off*), devolve o movimento na direção inversa com suavidade (`200–220 ms`).

---

## 3. Coerência de Contornos nas Colunas

- **Controles internos com margem (`+ Nova nota`, busca + filtros):** compartilham o mesmo alinhamento lateral (`12 px`), o mesmo raio discreto (`3 px`) e a mesma borda calma; o `<input>` interno da busca nunca flutua com caixa própria dentro da barra.
- **Linhas de lista coladas à coluna (`.esc-item-card`):** quando uma coluna é reta, os itens da lista ocupam de ponta a ponta com **cantos retos (`0 px`)** e filete esquerdo de seleção — sem cartões arredondados "colando" estranhamente em paredes retas.

---

## 4. Acessibilidade e Custo

- Toda animação e transição respeita `@media (prefers-reduced-motion: reduce)`, desativando deslocamentos e varreduras instantaneamente quando o sistema pede movimento reduzido.
- Nunca usar animações em loop infinito na mesa de escrita (economia de bateria, RAM e atenção).
