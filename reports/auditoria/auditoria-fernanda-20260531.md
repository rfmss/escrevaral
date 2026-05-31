# Auditoria — Fernanda
**Sessão:** v361 · 2026-05-31  
**Dispositivo:** Android 390×730px · Chrome · touch  
**Persona:** Estudante do 3º ano do Ensino Médio, 17 anos, vai fazer o ENEM em novembro

---

## Resumo executivo

Fernanda encontrou o Escrevaral sem dificuldade e chegou até os guias de ENEM em menos de três toques. O fluxo de descoberta funciona: ENEM está visível na tela de boas-vindas, a categoria Vestibular está na grade sem precisar de scroll, a lista de guias é rica e bem nomeada.

O guia foi carregado corretamente após a escolha do template — `data-reference-title` mostra "Redação ENEM completa" e o painel tem as 5 Competências (confirmado por diagnóstico). O problema principal é de **visibilidade**: o guia abre fechado por padrão, e a Fernanda precisa descobrir e tocar "Mostrar guia" para ver a orientação que ela foi buscar.

Achado relevante: o editor do template ENEM abre em modo paginado (folha de resposta) sem nenhuma instrução de como começar. Fernanda chegaria na folha numerada sem saber onde tocar para digitar.

---

## Achados

### F1 — Média — Guia abre fechado após escolher template — usuário precisa descobrir "Mostrar guia"

**O que aconteceu:** Fernanda escolheu "Redação ENEM completa". O editor abriu com o template correto e o guia corretamente carregado (título "Redação ENEM completa", 5 Competências — confirmado por diagnóstico). Porém o guia está **fechado por padrão** — a Fernanda vê só a folha paginada com "Mostrar guia" na barra.

**Impacto:** A Fernanda escolheu o template *por causa* do guia — a promessa do produto é "o guia certo para o ofício". A folha paginada do ENEM vazia sem orientação visível deixa uma vestibulando de 17 anos desorientada. Ela talvez nem perceba que o botão "Mostrar guia" dá acesso às Competências.

**Causa:** Comportamento intencional — `state.template.open = false` após criação. O comentário no código diz "escritor abre quando quiser". Para escritores experientes, isso faz sentido. Para vestibulandos de primeira vez, é uma barreira.

**Recomendação (PO decide):** Para templates com `oficio === "estudo-vestibular"`, abrir o guia automaticamente na primeira vez (estado `open: true`). Ou adicionar um hint contextual: "Toque em 'Mostrar guia' para ver as 5 Competências do ENEM."

---

### F2 — Alta — Folha paginada do ENEM sem instrução de início

**O que aconteceu:** O template "Redação ENEM completa" abre em modo paginado com a simulação da folha de resposta (NOME DO PARTICIPANTE, Nº DE INSCRIÇÃO, linhas numeradas). O visual é fiel e valioso — mas não há nenhuma instrução de como começar a escrever. Não há placeholder, não há hint, não há marcação de onde clicar.

**Impacto:** Para um vestibulando de 17 anos usando o app pela primeira vez, a folha paginada é totalmente nova. Ela esperava um campo de texto simples. O modo paginado é a experiência certa — mas precisa de uma âncora mínima de orientação.

**Recomendação:** Adicionar um placeholder na primeira linha editável da folha paginada: "Toque aqui para começar a introdução." Se F1 for implementado (guia aberto automaticamente), o guia já orienta o que escrever em cada parte.

---

### F3 — Média — Banner "Nova versão pronta" aparece no primeiro uso

**O que aconteceu:** Assim que o editor abriu (primeiro texto, primeira sessão), o banner "Nova versão pronta. Recarregar agora" apareceu no topo da tela. Fernanda ainda não havia escrito uma palavra.

**Impacto:** Interrompe o momentum de entrada. Para um usuário novo, "Nova versão" não tem sentido — ela acabou de abrir o app pela primeira vez. O banner ocupa espaço valioso e gera fricção antes mesmo de começar.

**Recomendação:** Manter o comportamento de M1 (já implementado em v358: banner some ao primeiro keystroke) e adicionar um delay mínimo de aparecimento — não mostrar imediatamente ao abrir o editor na primeira sessão.

---

### F4 — Média — Academia não tem referência contextual ao ENEM

**O que aconteceu:** Fernanda navegou até a Academia esperando encontrar os critérios de avaliação do ENEM. A Academia mostra: "Espelho de Voz", "RimaLab", "Vocabulário" — ferramentas para escritores literários. Nenhuma aba ou seção com ENEM, Competências, repertório ou dissertação.

**O que Fernanda não sabe:** A análise das 5 Competências do ENEM **fica no painel de guia** (precisão/pistas), não na Academia. Ela precisaria ter aberto o guia no editor para ver esse recurso.

**Impacto:** Para um vestibulando, a Academia parece irrelevante. "Espelho de Voz" e "RimaLab" não têm ressonância com quem quer saber se a redação tem argumentação suficiente para a Competência III.

**Recomendação (PO):** Quando o manuscrito ativo tem `oficio === "estudo-vestibular"`, mostrar na Academia uma entrada contextual: "Ver análise das 5 Competências" que leva ao guia com a precisão aberta. Ou criar uma seção ENEM na Academia com acesso direto ao painel de precisão do guia.

---

### F5 — Média — "Nova nota" como título do fluxo de início

**O que aconteceu:** Ao clicar "Escolher um guia", o modal abre com o título **"Nova nota"**. Fernanda quer escrever uma redação — "nota" é um termo do vocabulário do produto que ela não compartilha.

**Impacto:** Fricção semântica leve mas real na primeira impressão. "Nova nota" ativa o frame mental de "anotação rápida", não de "redação de vestibular".

**Recomendação:** Manter "Nova nota" como identificador interno, mas considerar "Começar" como título exibido (já aparece como breadcrumb "Começar" acima do título). Ou adaptar o h2 contextualmente: se a entrada foi via "Escolher um guia", mostrar "Escolher guia" como título do modal.

---

### F6 — Baixa — "Prova de autoria" não conecta ao contexto vestibular

**O que aconteceu:** Fernanda navegou até a aba Autoria. Viu "Sinais da sua escrita — Aguardando sua escrita". A tela ficou com o estado vazio porque ela não havia escrito pelo teclado (o texto do template não registra toques).

**Impacto:** A Fernanda não entende por que precisaria de uma "prova de autoria" para treinar para o ENEM. O recurso é poderoso mas seu valor não é evidente para esse perfil. A tela vazia reforça a sensação de "ainda não aconteceu nada".

**Recomendação:** Não é prioridade para vestibulando. O copy atual ("Sinais da sua escrita", "Aguardando sua escrita") já é gentil. Nenhuma ação imediata necessária para Fernanda.

---

### F7 — Baixa — Lista de guias ENEM sem indicação de "por onde começar"

**O que aconteceu:** A lista mostra 7 guias: Redação ENEM completa, Projeto de texto, Introdução ENEM, Desenvolvimento ENEM, Proposta de intervenção, Repertório sociocultural, Coesão e conectivos. Todos têm o mesmo peso visual.

**Impacto:** Um vestibulando sem experiência pode escolher "Introdução ENEM" e perder a visão do conjunto. "Redação ENEM completa" é o ponto de entrada ideal para primeira vez, mas não está sinalizado como tal.

**Recomendação (PO):** Adicionar marcação visual ou ordem por relevância para primeiro uso: "Redação ENEM completa" em destaque como ponto de entrada recomendado. Os guias de partes específicas (Introdução, Desenvolvimento) ficam como aprofundamento.

---

## O que funcionou bem

| Aspecto | Detalhe |
|---|---|
| ENEM visível na boas-vindas | "Conto, roteiro, soneto, crônica, ENEM" aparece na descrição do botão "Escolher um guia" — Fernanda encontra em 1 toque |
| Categoria Vestibular acessível | Grade "Nova nota" tem Vestibular com "ENEM, Fuvest, dissertação" visível sem scroll em 390px |
| Lista de guias rica | 7 guias específicos para redação dissertativa-argumentativa — cobertura completa |
| Folha paginada ENEM | Visual fiel à folha de resposta real — Fernanda reconhece o contexto imediatamente |
| Copy da Autoria | "Sinais da sua escrita", "Aguardando sua escrita" — acessível, sem jargão |
| "← Continuar com o texto atual" na Academia | Link de retorno visível e bem posicionado na Bancada |
| Dock mobile | Navegação por Escrever / Acervo / Academia / Autoria / Mais funciona em 390px sem atrito |

---

## Impacto nas decisões em aberto

**L4 — Chip "Autoria NN%" confunde ou orienta?**  
Fernanda não chegou a escrever texto pelo teclado (paged-editor não recebeu input na simulação), então o chip não foi ativado. Decisão continua aberta.

**L3 — Biblioteca na bandeja ou no dock?**  
Fernanda não navegou até a Biblioteca — o fluxo natural dela foi boas-vindas → guia → editor → Academia → Autoria. A Biblioteca é invisível para esse perfil no fluxo principal. Dado relevante para L3.

---

## Próxima sessão

Testar fluxo completo com digitação real na folha paginada do ENEM — incluindo Critérios ENEM, contador de linhas e exportação da redação finalizada.

---

## Screenshots de referência

| Arquivo | Cena |
|---|---|
| `fn_01_welcome.png` | Modal "Sua mesa" — ENEM visível em destaque |
| `fn_02_nova_nota.png` | Grade Nova nota — Vestibular posicionado visualmente |
| `fn_03_guias_enem.png` | Lista de 7 guias ENEM com "Nota livre em vestibular" |
| `fn_04_editor_guia_aberto.png` | Editor ENEM + banner "Nova versão pronta" |
| `fn_05_editor_guia_fechado.png` | Folha paginada ENEM sem instrução de início |
| `fn_06_editor_escrevendo.png` | Painel de guia mostrando "Escolha um guia" vazio (F1) |
| `fn_07_guia_bottom_sheet.png` | Bottom sheet guia — estado vazio persistente (F1 confirmado) |
| `fn_08_academia.png` | Academia abre em Espelho de Voz, não em Critérios (F4) |
| `fn_09_criterios.png` | Academia — aba Critérios não acessível no primeiro toque |
| `fn_10_autoria.png` | Prova de autoria — estado vazio "Aguardando sua escrita" |
