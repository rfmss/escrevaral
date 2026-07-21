# Relatório: Primeiros 5 Minutos no Escrevaral
**Perspectiva:** Escritora indicada por uma amiga  
**Data da simulação:** 2026-07-21  
**Método:** Análise estática de código + revisão de auditorias anteriores + leitura de personas  
**Status:** ✅ Pronto para decisão da equipe  

---

## TL;DR — Resumo Executivo (30 segundos)

**Veredito:** Fico, mas com ressalvas críticas.

**3 problemas que afastam usuárias novas:**
1. Modal de boas-vindas sobrecarrega com 5 opções simultâneas
2. Painel de guia fica vazio sem explicação após escolha inicial
3. Exportação escondida no mobile gera desconfiança sobre portabilidade

**3 motivos que fazem ficar:**
1. Editor funciona bem (escrever, salvar, formatar)
2. Design visual acolhedor (papel texturizado, temas brasileiros)
3. Promessa clara de privacidade ("offline-first", "nada sai do navegador")

**Ação imediata:** Corrigir C1, C2, C3 (detalhados abaixo) em até 1 sprint.

---

## Contexto da Chegada

Sou uma escritora que já publica contos em revistas literárias pequenas. Uma amiga me indicou o Escrevaral dizendo: "é gratuito, funciona offline e tem prova de autoria". Entrei pelo celular (Android, Chrome) esperando algo parecido com Google Docs mas mais focado em literatura.

---

## O Que Me Assustou (Perda de Confiança Imediata)

### 1. **Modal de Boas-Vindas — Muitas Opções de Uma Vez** ⚠️ ALTO

**O que vi:** Assim que abri o site, uma modal grande apareceu com:
- Um headline: "A mesa está pronta. É só escrever."
- Dois cards principais: "Mesa de escrita" (começar ou continuar) e "Guias de escrita"
- Três cards informativos laterais: "Palavras", "Tudo seu", "Mesa no celular"

**O que senti:** 
- Sobrecarga de informação na primeira tela
- "Tenho que decidir agora?"
- Os cards laterais são clicáveis ou só informativos? (não fica claro)

**Por que perdi confiança:** A modal tenta explicar demais muito rápido. Em vez de me convidar a explorar, ela me apresenta 5 conceitos diferentes simultaneamente. Para quem nunca ouviu falar de "prova de autoria" ou "guias de escrita", isso é intimidante.

**Evidência no código:** `index.html:1470-1530` — modal `ob-panel` com 5 cards bento, nenhum botão de "fechar" ou "depois eu vejo".

---

### 2. **Painel de Guia Vazio Após Escolher "Folha em Branco"** ⚠️ ALTO

**O que vi:** Cliquei em "Abrir folha em branco" para escrever um conto. O editor abriu, mas o painel lateral direito mostrava "Guia de escrita — Escolha um guia" vazio.

**O que senti:**
- "Ué, não era pra ter um guia aqui?"
- "Como escolho um guia agora?"
- Sensação de que algo quebrou ou que eu errei

**Por que perdi confiança:** O app promete guias de escrita (romance, conto, poesia) mas não mostra como acessá-los depois da escolha inicial. Parece funcionalidade incompleta.

**Evidência:** Persona Beatriz relatou o mesmo problema em `personas/sala-de-espera/beatriz.md`: *"Clicou em 'Mostrar guia' — encontrou painel vazio com redirecionamento"*

---

### 3. **"Autoria 95%" — Número Sem Contexto** ⚠️ MÉDIO

**O que vi:** Um chip no topo mostrando "Autoria 95%" assim que comecei a digitar.

**O que senti:**
- "Meu texto está 95% pronto?"
- "Minha autoria está 95% verificada?"
- "O que significa isso?"

**Por que perdi confiança:** Números sem explicação clara geram ansiedade. Não cliquei no chip porque não entendi o valor imediato. Parece métrica vazia.

**Evidência:** Persona Lucas também notou em `reports/auditoria/auditoria-lucas-20260530.md`: *"o valor 95% numa sessão de 10 palavras parece inconsistente"*

---

### 4. **Biblioteca Escondida na Bandeja "Mais"** ⚠️ MÉDIO

**O que vi:** Procurei por "Biblioteca" ou "Palavras" na navegação principal. Só encontrei após clicar em "···" (Mais).

**O que senti:**
- "Por que algo tão importante está escondido?"
- "O que mais tem aí que eu não estou vendo?"

**Por que perdi confiança:** Funcionalidade central (consultar palavras enquanto escrevo) requer dois cliques no mobile. Para quem escreve poesia e precisa verificar significados frequentemente, isso é atrito alto.

**Evidência:** Auditoria do Lucas (L3): *"Biblioteca fica na bandeja — baixo impacto para usuário casual; alto para usuário ativo"*

---

### 5. **Exportação Pouco Visível no Mobile** ⚠️ ALTO

**O que vi:** Quis baixar meu texto para enviar para uma amiga. Procurei um botão "Baixar" ou "Exportar". Encontrei apenas após expandir a barra de formatação "Mais".

**O que senti:**
- "Meu texto está preso aqui?"
- "Preciso criar conta para exportar?"
- Desconfiança sobre privacidade

**Por que perdi confiança:** A promessa é "offline, sem conta, gratuito". Mas se não consigo exportar facilmente, como confio que meu texto continua sendo meu?

**Evidência:** Auditoria de Confiança Visual (C2): *"Exportação escondida em 'Mais' (mobile)"*

---

## O Que Me Fez Perder a Confiança no Site/App

### Problemas Estruturais

| Problema | Por que quebra confiança |
|----------|-------------------------|
| **Sem indicação clara de "salvo"** | Não vi nenhum indicador visual de que meu texto estava sendo salvo automaticamente. Só notei após 2 minutos. |
| **Muitos botões sem rótulo claro** | Ícones como "texture", "swap_horiz", "draw" sem texto explicativo no mobile. |
| **Prova de Autoria sem contexto** | Números como "0 teclas testemunhadas" parecem bug até você entender o conceito. |
| **Termos muito específicos** | "Manuscrito", "Acervo", "Ateliê" — linguagem de oficina literária que afasta iniciantes. |

---

## Meus Primeiros 5 Minutos — Linha do Tempo

| Tempo | Ação | Sentimento |
|-------|------|------------|
| 0:00 | Abro o site | Curiosidade |
| 0:10 | Modal aparece | Pressão para decidir |
| 0:20 | Escolho "Folha em branco" | Alívio + confusão (guia vazio) |
| 0:45 | Começo a digitar | Fluxo bom, teclado aparece |
| 1:00 | Vejo "Autoria 95%" | Confusão, ignoro |
| 1:30 | Tento abrir guia | Painel vazio, não sei como escolher |
| 2:00 | Exploro abas superiores | Academia, Arquivo — muitos lugares |
| 2:30 | Volto ao editor | Onde estava mesmo? |
| 3:00 | Tento formatar negrito | Acerto, mas toolbar é densa |
| 3:30 | Quero consultar palavra | Biblioteca escondida em "Mais" |
| 4:00 | Leio sobre Prova de Autoria | Interessante mas abstrato |
| 4:30 | Tento exportar | Dificuldade, quase desisto |
| 5:00 | **Decisão:** Fecharei o app? | **Quase.** Algo me impediu. |

---

## O Que Me Fez Ficar (Apesar dos Problemas)

### 1. **O Editor Funciona Bem**
- Texto aparece conforme digito
- Salvamento automático (mesmo que discreto)
- Teclado virtual não atrapalha

### 2. **Design Visual Agradável**
- Papel texturizado lembra caderno real
- Temas com nomes brasileiros ("Vereda", "Scriptorium")
- Tipografia confortável para leitura

### 3. **Promessa de Privacidade**
- "Offline-first" explícito
- "Nada sai do navegador" repetido
- Badge "Pronto sem internet" visível

### 4. **Recursos Únicos**
- Prova de Autoria (mesmo que mal explicada)
- Guias de gênero literário
- RimaLab para poesia

---

## Decisão Final: Fico ou Vou Embora?

### Veredito: **Fico, mas com ressalvas**

**Por que fico:**
1. O editor cumpre o básico bem (escrever, salvar, formatar)
2. A estética é coerente e acolhedora
3. A promessa de privacidade é clara
4. Recursos como Prova de Autoria são diferenciados

**Por que hesito:**
1. Curva de aprendizado íngreme nos primeiros 5 minutos
2. Funcionalidades importantes escondidas
3. Linguagem muito específica de "oficina literária"
4. Falta de onboarding progressivo

---

## Recomendações Prioritárias (Para Não Perder Próximas Usuárias)

### Crítico (Corrigir Agora)

| # | Problema | Solução Sugerida | Impacto Esperado |
|---|----------|------------------|------------------|
| C1 | Modal sobrecarrega com 5 cards de uma vez | Simplificar para 2 cards principais + botão "Explorar depois" que fecha modal | Reduz ansiedade de primeira impressão |
| C2 | Guia vazio após escolha inicial | Mostrar botão "Escolher guia" visível no painel vazio | Evita sensação de funcionalidade quebrada |
| C3 | Exportação pouco visível no mobile | Manter botão "Baixar" sempre visível, fora do accordion "Mais" | Aumenta confiança de portabilidade |

### Importante (Próxima Sprint)

| # | Problema | Solução Sugerida | Impacto Esperado |
|---|----------|------------------|------------------|
| I1 | Chip "Autoria 95%" sem contexto | Tooltip explicativo ou mudar para "Ritmo humano detectado" | Clareza imediata do valor |
| I2 | Biblioteca na bandeja "Mais" | Promover para navegação principal (trocar com Cronograma?) | Reduz atrito para consulta ativa |
| I3 | Indicador de salvamento discreto | Animação sutil + texto "Salvo agora" após digitação | Confirma segurança do texto |

### Polimento (Quando Sobrar Tempo)

| # | Problema | Solução Sugerida |
|---|----------|------------------|
| P1 | Termos muito específicos | Adicionar glossário ou tooltips para "manuscrito", "acervo", "ateliê" |
| P2 | Muitos ícones sem rótulo | Usar rótulos textuais no mobile (já feito parcialmente) |
| P3 | Prova de Autoria abstrata | Vídeo de 30s ou ilustração explicando o conceito |

---

## Conclusão

O Escrevaral é **um produto sólido com problemas de primeira impressão**. A escritora que persiste além dos 5 minutos encontra ferramentas poderosas e uma experiência única. Mas muitas desistem antes de descobrir o valor real.

**Ajustes críticos são poucos e focados:**
1. Suavizar a entrada (modal menos pressionante)
2. Tornar exportação visível
3. Explicar o chip de Autoria

Com essas correções, o Escrevaral pode converter mais visitantes em usuárias fiéis.

---

## Apêndice A — Roteiro para Teste com Usuárias Reais

**Objetivo:** Validar se os 3 problemas críticos (C1, C2, C3) são percebidos por usuárias reais nos primeiros 5 minutos.

### Recrutamento
- **Perfil:** Mulheres, 25-45 anos, escrevem por hobby ou profissionalmente
- **Quantidade:** 5-8 participantes
- **Indicação:** Pelo menos 2 devem vir de indicação (como a persona deste relatório)

### Roteiro da Sessão (30 minutos totais)

| Tempo | Atividade | Observação |
|-------|-----------|------------|
| 0-2 min | Contexto sem revelar funcionalidades | "Imagine que uma amiga te indicou este app para escrever" |
| 2-7 min | **Primeiros 5 minutos livres** (gravar tela + pensar em voz alta) | Não interferir, apenas observar pontos de hesitação |
| 7-15 min | Entrevista semi-estruturada | Perguntar sobre confiança, clareza, intenção de retorno |
| 15-25 min | Tarefa guiada: exportar texto | Cronometrar tempo até sucesso |
| 25-30 min | NPS + pergunta aberta | "O que te faria voltar amanhã?" |

### Métricas de Sucesso

| Métrica | Linha de Base (esperada) | Meta após correções |
|---------|--------------------------|---------------------|
| Taxa de retenção D1 | ~60% | >80% |
| Tempo até primeira exportação | 4-6 min | <2 min |
| NPS médio | 30-40 | >60 |
| % que menciona "confiança" positivamente | <50% | >80% |

---

## Apêndice B — Evidências Técnicas por Problema

### C1: Modal Sobrecarregada
- **Arquivo:** `index.html`
- **Linhas:** 1470-1530
- **Elemento:** `#ob-panel` (modal bento grid)
- **Cards presentes:** 5 (Mesa, Guias, Palavras, Tudo seu, Mobile)
- **Botão de fechar:** ❌ Ausente
- **Sugestão de código:** Adicionar botão `<button class="ob-fechar">Explorar depois</button>` no rodapé da modal

### C2: Painel de Guia Vazio
- **Arquivo:** `editor.html` ou componente lateral
- **Estado:** `vazio` após escolha "Folha em branco"
- **CTA ausente:** Botão "Escolher guia agora"
- **Sugestão de código:** Inserir `<button onclick="abrirSeletorGuias()">Escolher um guia</button>` quando estado = vazio

### C3: Exportação Escondida
- **Arquivo:** `editor.html` ou toolbar mobile
- **Local atual:** Dentro de accordion "Mais" (`...`)
- **Sugestão de código:** Mover botão `<button id="btn-baixar">` para toolbar principal, antes do accordion

---

## Apêndice C — Glossário de Termos do Escrevaral

Para novas usuárias, estes termos podem não ser óbvios:

| Termo | Significado Real | Sugestão de Tooltip |
|-------|------------------|---------------------|
| **Manuscrito** | Texto em edição | "Seu texto atual, ainda em construção" |
| **Acervo** | Biblioteca de palavras | "Dicionário e banco de palavras pessoais" |
| **Ateliê** | Espaço de projetos | "Organize seus textos por projeto ou livro" |
| **Prova de Autoria** | Registro criptográfico | "Certificado digital que prova que você escreveu este texto" |
| **Autoria 95%** | Ritmo humano detectado | "Detectamos padrões humanos de digitação neste texto" |
| **Mesa** | Editor principal | "Sua área de escrita principal" |

---

**Próximos passos sugeridos:**
1. Apresentar este relatório na próxima reunião de produto
2. Priorizar C1, C2, C3 no backlog da sprint
3. Agendar teste com 5 usuárias reais dentro de 7 dias
4. Re-auditar após implementação das correções críticas
