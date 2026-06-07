# DESCARTAVEL - Auditoria Short Path / User Flow

Data: 2026-06-07  
Status: temporario  
Pode deletar depois de: 2026-06-14  
Destino: passar para Claude como briefing de melhoria de fluxo e navegacao.

> Este arquivo foi criado para orientar uma rodada de reorganizacao de user flow. Ele nao e documentacao permanente do produto.

## Persona criada

**Helena Shortpath**  
Especialista em UX, arquitetura da informacao e auditoria de caminhos curtos. Ela nao julga se a interface esta bonita; julga se a pessoa chega ao lugar certo com pouco atrito, se os nomes batem entre si, se as telas estao acumulando funcoes demais e se os destinos formam um mapa mental simples.

### Mandato

"Entre no Escrevaral como uma usuaria que quer escrever, organizar, melhorar, provar autoria e aprender o oficio. Encontre os caminhos que pedem voltas demais, os lugares onde muitos nos foram empilhados numa pagina so e as palavras que fazem a pessoa reaprender o mapa a cada tela. Depois proponha uma navegacao mais fluida, logica e distribuida."

### Metodo usado

- Site publicado: `https://escrevaral.com/`
- Capturas visuais com Chromium headless:
  - desktop `1366x900`
  - mobile `390x844`
- Leitura do DOM publicado e do codigo local.
- Medicao simples de densidade: numero de controles visiveis por modulo.

Capturas temporarias geradas em `/tmp` durante a auditoria:

- `/tmp/escrevaral-desktop.png`
- `/tmp/escrevaral-mobile.png`
- `/tmp/escrevaral-cdp-desktop-editor.png`
- `/tmp/escrevaral-cdp-desktop-new-note.png`
- `/tmp/escrevaral-cdp-mobile-real-editor.png`
- `/tmp/escrevaral-cdp-mobile-new-note.png`
- `/tmp/escrevaral-cdp-mobile-academia.png`

## Resumo executivo

O Escrevaral tem uma base forte: o primeiro caminho para escrever e curto, a linguagem e consistente com o projeto e o editor em si respira bem. O problema principal nao e estetico; e de **arquitetura acumulada**.

Hoje o produto tenta ser, ao mesmo tempo, editor, acervo, dicionario, prova de autoria, academia de escrita, biblioteca, direito autoral, trilha de publicacao, cronograma e backup. Essas funcoes sao boas, mas algumas estao competindo pelo mesmo nivel de navegacao.

A recomendacao da Helena Shortpath e transformar a navegacao em uma hierarquia mais clara:

1. **Tarefas primarias:** Escrever, Acervo, Revisar, Autoria.
2. **Apoios contextuais:** Guia, Dicionario/Biblioteca, Backup, Plano.
3. **Conteudo de aprendizagem:** Biblioteca da Escrita, Leituras editoriais, Direitos, Publicacao.

O objetivo nao e remover recursos. E tirar recursos do mesmo andar quando eles pertencem a andares diferentes.

## Evidencias objetivas

### Navegacao principal

Desktop em `index.html:143` a `index.html:149`:

- Manuscrito
- Biblioteca
- Prova de autoria
- Arquivo
- Academia
- Cronograma

Mobile em `index.html:1700` a `index.html:1725`:

- Escrever
- Acervo
- Academia
- Autoria
- Biblioteca
- Plano apenas no rail/tablet

Problema: desktop e mobile usam nomes diferentes para os mesmos destinos. `Manuscrito` vira `Escrever`; `Arquivo` vira `Acervo`; `Prova de autoria` vira `Autoria`; `Cronograma` vira `Plano`. Isso cria custo cognitivo desnecessario.

Recomendacao: padronizar nomes por verbo ou substantivo curto:

- Escrever
- Acervo
- Revisar ou Academia
- Autoria
- Biblioteca

`Plano/Cronograma` deve virar area secundaria, nao competir com os cinco destinos principais.

### Densidade por modulo

Leitura automatizada dos controles visiveis:

| Modulo | Controles visiveis | Diagnostico |
|---|---:|---|
| Editor | 22 | Aceitavel no desktop; no mobile fica apertado e com icones pouco explicitos |
| Biblioteca | 1 | Leve demais para ocupar um destino principal se for apenas dicionario contextual |
| Autoria | 10 | Bom peso, funcao clara |
| Arquivo/Acervo | 18 | Mistura organizar, exportar, backup e apagar tudo |
| Academia | 44 | Pagina mais empilhada do produto |
| Cronograma | 65 | Funcionalidade de baixa frequencia com densidade alta |

Achado central: **Academia e Cronograma estao pesados demais para serem paginas simples de primeiro nivel.**

## Achados principais

### A1 - Academia virou um no de muitos nos

Trecho principal: `index.html:803` a `index.html:1180`.

A Academia contem:

- Espelho de Voz
- RimaLab
- Vocabulário Decolonizador
- Biblioteca da Escrita em iframe
- Guia de Oficios Literarios
- Leitura editorial
- Direitos do Autor
- Trilha de publicacao
- Anatomia do livro em iframe

Visualmente, no mobile, a Academia abre direto em "Espelho de Voz". A pessoa que entrou procurando guia, biblioteca, direitos ou publicacao precisa rolar e inferir. O primeiro frame diz "ferramenta de analise", mas a pagina inteira diz "central de conhecimento, revisao e publicacao".

Recomendacao de arquitetura:

- Renomear a intencao da tela para **Revisar** se ela for principalmente ferramentas.
- Ou dividir a Academia em tres blocos/abas de primeiro nivel interno:
  - **Revisar texto:** Espelho de Voz, RimaLab, Vocabulário.
  - **Aprender o oficio:** Guias, Biblioteca da Escrita, Leituras editoriais.
  - **Publicar e proteger:** Direitos, Trilha de publicacao, Anatomia do livro.

Recomendacao minima para Claude:

- Manter a tela Academia, mas transformar as secoes abaixo de ferramentas em blocos colapsados ou cards de entrada.
- No mobile, mostrar primeiro 3 cards de escolha: `Revisar`, `Guias`, `Publicar`.
- So abrir a ferramenta detalhada depois da escolha.

### A2 - Biblioteca ocupa um lugar nobre, mas seu escopo esta ambíguo

Trecho da tela Biblioteca: `index.html:359` em diante.  
Trecho da Biblioteca dentro da Academia: `index.html:996` a `index.html:1004`.

Hoje "Biblioteca" pode significar duas coisas:

- uma tela leve para palavra selecionada, sinonimos e uso;
- uma biblioteca da escrita dentro da Academia via iframe.

Isso enfraquece o mapa mental. Se a pessoa toca em Biblioteca no dock, ela espera acervo de conhecimento. Se a tela pede "selecione uma palavra no manuscrito", ela caiu num dicionario contextual.

Recomendacao:

- Renomear a tela atual para **Dicionario** ou **Palavras** se ela continuar contextual.
- Ou transformar Biblioteca em hub real:
  - Palavra selecionada
  - Biblioteca da Escrita
  - Leituras editoriais

Para uma primeira rodada, eu faria a opcao conservadora: manter a logica atual, mas trocar o label principal para `Palavras`/`Dicionario` e mover "Biblioteca da Escrita" para uma entrada visivel chamada Biblioteca dentro de Academia/Aprender.

### A3 - O caminho de criar novo texto no mobile da uma volta pelo Acervo

Trechos:

- Botao "Nova nota" no Acervo: `index.html:552` a `index.html:566`
- Sidebar com `Nova nota` existe no desktop, mas some no phone por CSS: `css/10-mobile-nav.css:22` a `css/10-mobile-nav.css:25`
- Dock mobile: `index.html:1700` a `index.html:1725`

No desktop, criar uma nota esta sempre perto pela sidebar ou pelo Acervo. No phone, a sidebar some. Depois que a usuaria ja passou do onboarding, o caminho natural para criar outro texto e:

`Escrever -> Acervo -> Nova nota`

Isso e curto em numero de taps, mas conceitualmente torto: criar texto novo pertence ao contexto de escrever, nao ao contexto de arquivo.

Recomendacao:

- Adicionar um `+`/`Novo` visivel no topo do editor mobile.
- Alternativa: transformar toque longo ou segundo estado de `Escrever` em `Novo texto`, mas isso e menos descobrivel.
- Melhor: topbar mobile com marca + compartilhar/tela cheia ja existe; inserir `add` quando em `data-view="editor"`.

### A4 - Acervo mistura organizacao com sobrevivencia do produto

Trecho: `index.html:552` a `index.html:795`.

Acervo comeca bem: lista, busca, filtros, "Nova nota". Depois acumula detalhes, exportacao, backup, copia automatica, importacao, verificar versao, instalar aplicativo e apagar tudo.

Isso faz sentido tecnicamente, mas nao como primeiro frame mental. A pergunta da pessoa no Acervo e "onde estao meus textos?". A pergunta "como nao perder tudo?" e importante, mas pertence a uma camada de seguranca.

Recomendacao:

- Primeiro nivel do Acervo:
  - Nova nota
  - Buscar
  - Filtros
  - Lista
  - Abrir no editor
- Segundo nivel:
  - Cópias e importacao
  - Exportar acervo
  - Apagar tudo

O bloco "Cópias de seguranca" pode continuar presente, mas fechado por padrao e com uma CTA unica: `Guardar copia`.

### A5 - Cronograma/Plano esta denso demais para destino primario

Trecho: `index.html:1183` a `index.html:1207`.

A leitura automatizada encontrou 65 controles no Cronograma. Ele tem meses, atalhos, timeline, tarefas, notas e dias clicaveis. E uma ferramenta util, mas de frequencia menor que escrever, organizar, revisar e provar autoria.

Recomendacao:

- Manter `Plano` como destino secundario.
- Desktop: retirar `Cronograma` da barra principal ou agrupar em `Acervo`/`Projeto`.
- Mobile: manter fora do dock principal.
- Ao abrir Plano, evitar mostrar muitos dias-acoes de uma vez no estado vazio. Comecar com:
  - `Planejar sessao`
  - `Ver calendario`
  - `Metas da semana`

### A6 - Onboarding e bonito, mas a promessa muda de palavra

Trecho: `index.html:1291` a `index.html:1356`.

O onboarding oferece:

- Comecar a escrever
- Escolher um modelo

Mas o resto do produto fala muito em `guia`, `oficio`, `template`, `nota`, `manuscrito`, `acervo`.

Recomendacao:

- Escolher uma palavra principal para entrada guiada. Minha sugestao: **guia**.
- Trocar `Escolher um modelo` por `Escolher um guia`.
- No modal de criacao, trocar eyebrow `Nova nota` por algo contextual:
  - se veio de escrever: `Novo texto`
  - se veio de guia: `Escolher guia`
  - se veio do Acervo: `Nova nota`

### A7 - Editor esta bom, mas a toolbar mobile ainda tem ruído

Trecho: `index.html:236` a `index.html:352`.

No desktop, o editor respira bem. No mobile, a toolbar ocupa muito do topo da folha e mistura:

- mostrar guia
- ler
- excluir
- negrito/italico
- bloco
- alinhamento
- mais opcoes
- copiar/exportar escondidos

Recomendacao:

- Para mobile, reduzir a toolbar inicial para:
  - Guia
  - Ler
  - Formato
  - Mais
- Deixar bold/italic/alinhamento aparecerem sob `Formato`, porque a maioria das escritoras escreve texto corrido antes de formatar.
- Manter exportar/copiar em `Mais` ou em Acervo, mas com caminho claro.

## Novo mapa proposto

### Navegacao principal

1. **Escrever**  
   Editor, guia aberto/fechado, leitura, foco, criar novo texto.

2. **Acervo**  
   Textos, notas, organizacao, busca, filtros.

3. **Revisar**  
   Espelho de Voz, RimaLab, Vocabulário, analises do texto atual.

4. **Autoria**  
   Prova de autoria, sessoes, exportar pacote, verificar arquivo.

5. **Biblioteca**  
   Guias, leituras editoriais, Biblioteca da Escrita, dicionario/palavras.

### Secundarios

- **Plano**: cronograma, metas, sessoes.
- **Guardar**: backup, importacao, exportacao geral.
- **Publicar**: direitos, trilha de publicacao, anatomia do livro.

Se a equipe quiser manter apenas cinco itens no dock, minha sugestao e:

- Escrever
- Acervo
- Revisar
- Autoria
- Biblioteca

E colocar `Plano`, `Guardar`, `Tema`, `Impressao` na bandeja.

## Short paths recomendados

| Tarefa | Caminho ideal |
|---|---|
| Escrever do zero | Escrever -> campo de texto |
| Criar novo texto no mobile | Escrever -> `+` |
| Escolher guia | Biblioteca -> Guias -> escolher -> Escrever |
| Revisar texto atual | Escrever -> Revisar este texto |
| Guardar copia | Acervo -> Guardar copia |
| Provar autoria | Autoria -> Guardar copia da autoria |
| Planejar sessao | Plano -> Planejar sessao |
| Aprender sobre publicacao | Biblioteca/Publicar -> Direitos ou Trilha |

## Prompt pronto para Claude

Use este briefing para implementar uma rodada conservadora de melhoria de user flow no Escrevaral.

Objetivo: reduzir voltas, diminuir paginas empilhadas e padronizar o mapa mental de navegacao, sem redesign visual grande.

Contexto:

- App principal em `index.html`.
- Navegacao desktop em `index.html:143-149`.
- Dock mobile em `index.html:1700-1725`.
- CSS mobile em `css/10-mobile-nav.css`.
- Editor em `index.html:213-355`.
- Acervo em `index.html:552-795`.
- Academia em `index.html:803-1180`.
- Cronograma em `index.html:1183-1207`.
- Onboarding em `index.html:1291-1356`.

Prioridades de implementacao:

1. Padronizar labels entre desktop e mobile: usar os mesmos nomes para os mesmos destinos.
2. Adicionar acao `Novo texto`/`+` acessivel no editor mobile, sem obrigar a pessoa a ir ao Acervo.
3. Reduzir a densidade inicial da Academia: mostrar escolhas de alto nivel antes de despejar todas as ferramentas e conteudos.
4. Resolver a ambiguidade de Biblioteca: ou ela vira hub real de conhecimento, ou o destino contextual passa a se chamar Dicionario/Palavras.
5. Simplificar o primeiro nivel do Acervo: organizacao primeiro; backup/exportacao/apagar tudo em camada secundaria.
6. Tratar Cronograma/Plano como secundario, nao como par de Escrever/Acervo/Revisar.
7. Trocar `Escolher um modelo` por `Escolher um guia` no onboarding, para alinhar com a linguagem do produto.

Restrições:

- Nao remover funcionalidades.
- Nao mudar o sistema visual inteiro.
- Preferir reorganizacao, labels, collapses e CTAs contextuais.
- Preservar o comportamento offline-first.
- Testar desktop `1366x900` e mobile `390x844`.

Resultado esperado:

- Uma usuaria entende em 5 segundos onde escrever, onde achar textos, onde revisar, onde provar autoria e onde aprender.
- A Academia deixa de parecer uma pagina infinita de coisas boas empilhadas.
- Criar novo texto no mobile passa a ser um caminho de 1 toque a partir do editor.
- Os nomes dos destinos deixam de mudar entre desktop e mobile.

