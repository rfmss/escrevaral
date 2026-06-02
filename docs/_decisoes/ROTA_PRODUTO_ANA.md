# Rota de Produto — Para a Ana

**Data:** 2026-06-02  
**Versão base:** v393  
**Decisão:** Todo o produto, toda a documentação e toda a comunicação falam com ela.

---

## Quem é ela

Ana. 27 anos. Analista de marketing em São Paulo. Escritora aos fins de semana.

Ela não se apresenta como "escritora" em contextos sociais. Mas é a primeira coisa que faz quando tem tempo livre. Tem um arquivo chamado `livro_v3_FINAL_esse.docx` numa pasta do Google Drive. Já tentou o Scrivener — R$280 em dólar, em inglês, não pagou.

Ela escreve romance contemporâneo ou fantasia urbana. Tem 2 manuscritos em andamento. Nunca terminou nenhum.

Ela não precisa ser convencida de que precisa escrever. Ela já escreve. Ela precisa ser convencida de que merece uma ferramenta que leve a escrita dela a sério.

**O Escrevaral é exatamente esse produto.**

---

## O que ela precisa ouvir (e o que não pode ouvir)

| Fala com ela | Não fala com ela |
|---|---|
| "Sua folha. Seu ritmo." | "Motor de análise morfológica" |
| "Escreva sem se sentir amadora." | "Prova de autoria criptográfica" |
| "Seu romance tem estrutura. Vamos juntos." | "Inferência de função sintática" |
| "Termine de escrever na sexta. Publique no sábado." | "Backend offline-first com service worker" |
| "Fichas de personagem a um toque do cursor." | "Corpus linguístico de 1,17M tokens" |
| "Tudo fica aqui. Seus manuscritos são seus." | "OpenTimestamps e recibo .ots" |

**Regra de ouro:** se ela precisar saber o que é para entender o que faz, a copy está errada.

---

## O que o produto já entrega para ela (v393)

Ela não precisa saber o nome dos sistemas. Ela precisa sentir o efeito.

- **O espaço:** Editor em folha, tipografia Noto Serif, tema Alvorada — parece mesa de escritora, não documento de trabalho.
- **A organização:** Acervo com status (Em escrita, Revisão, Pausado, Concluído), notas vinculadas, progresso manual.
- **A privacidade:** Tudo fica no navegador dela. Sem servidor. Sem IA lendo o manuscrito.
- **O acesso:** Gratuito. Em português. Funciona no notebook básico e no celular.
- **A proteção:** Cópia de segurança local com um clique.
- **A voz:** Espelho de Voz lê o gesto narrativo dela — sem jargão técnico visível.
- **A análise:** Pistas do texto mostram padrões sem dar notas.

---

## O que falta (em ordem de menor para maior esforço)

### Fase 1 — Copy e presença (sem código novo)

**O que:** Adaptar toda a linguagem visível do produto para falar com ela.

Isso inclui:
- Guias de escrita (templates) específicos para os gêneros dela: **romance contemporâneo, romantasy, fantasia urbana, new adult, suspense**
- Copy da Academia: hoje fala mais com o escritor literário do que com ela
- Welcome overlay: o texto de boas-vindas precisa reconhecê-la
- Estados vazios: "Comece aqui. A primeira frase abre o caminho." já é bom — manter e expandir
- Microcopy nas ferramentas: "Espelho de Voz" funciona, "Prova de autoria" pode ser mais emocional

**Por que agora:** é o ponto de entrada dela no produto. Se ela abre a Academia e não se vê, ela fecha.

---

### Fase 2 — ePub e KDP-ready

**O que:** Exportar para `.epub` com templates limpos e prontos para upload na Amazon KDP.

Isso transforma o verbo dela de **"escrevo aqui"** para **"publico daqui"**.

Templates de diagramação por gênero:
- Romance: letra capitular, separador de cena (✦), espaçamento generoso
- Fantasia: mapa de capítulos como índice clicável, epígrafes
- Suspense: capítulos curtos, cortes limpos

O ePub é puro JavaScript. Não depende de servidor. É uma extensão natural do sistema de exportação que já existe.

**Gatilho de venda:** "Termine de escrever na sexta. Publique no sábado."

---

### Fase 3 — Bíblia do Projeto

**O que:** Fichas de personagem, regras de universo, linha do tempo — integrados ao editor.

Ela escreve séries e universos (especialmente em Fantasia e Romantasy). Hoje usa Pinterest para estética, Notion para personagens e Google Docs para o texto. Três abas abertas ao mesmo tempo.

A bíblia vive como tipo especial de nota vinculada: não texto livre, mas campos estruturados — nome, aparência, motivação, arco, relações. Abre no painel lateral enquanto ela escreve.

**Gatilho de venda:** "Pare de procurar em qual documento está a cor dos olhos do protagonista."

Arquitetura compatível com o stack atual. Salva em localStorage como os manuscritos.

---

### Fase 4 — Leitura Beta

**O que:** Compartilhamento seguro com leitores beta — reações por parágrafo, formulário por capítulo, sem risco ao manuscrito original.

Este é o único passo que requer backend. Usa a infraestrutura já existente (n8n + Neon + HF Space) como base.

Requer decisão de produto sobre privacidade: o manuscrito sai do localStorage dela e passa por um servidor (mesmo que temporariamente). A comunicação precisa ser cuidadosa — ela é sensível a isso.

---

## Ajuste de rota na documentação

Todo documento interno que for lido por alguém que vai trabalhar no produto deve começar com: **"Quem é a Ana e o que ela precisa sentir."**

Os documentos técnicos (META_ENGINES_100.md, CLAUDE.md) mantêm o foco técnico. Mas o framing da decisão de produto muda:

> Antes: "Qual engine vamos aproximar de 100% hoje?"  
> Agora: "O que a Ana vai sentir quando usar isso?"

As duas perguntas coexistem. A segunda é o filtro final.

---

## O que não muda

- **Português brasileiro integral** — reforçado pela persona. Ela não quer interface em inglês.
- **Offline-first e privacidade** — reforçado pela persona. O mercado de romance e fantasia está cheio de debate sobre IA e propriedade intelectual. Ela não quer seus manuscritos em servidores de IA.
- **Gratuito como ponto de entrada** — ela precisa confiar antes de pagar.
- **Sem jargão técnico na interface** — agora com nome e rosto: ela é a Ana.

---

## Próximo passo imediato

Guias de escrita para romance e fantasia. São o primeiro lugar que ela toca no produto.
