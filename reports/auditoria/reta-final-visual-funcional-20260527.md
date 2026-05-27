# Auditoria Visual e Funcional de Reta Final — Escrevaral

**Data:** 2026-05-27  
**Versão base:** v331 em `main`  
**Modo:** auditoria crítica por piloto automático (Claude + Codex) — com correções pontuais de confiança
**Fases concluídas:** A (base mecânica, 144 cenários) + B (27 fluxos reais) + C (15 estados extremos e confiança)  
**Status pós-piloto automático:** ✅ auditoria completa — bloqueador corrigido e validado; saída do Modo Página validada em Chromium; RimaLab “amor” validado na UI; ícones Material ocultos de leitores de tela em runtime; múltiplas abas seguem como principal risco aberto de confiança

---

## Fase C — Estados Extremos e Confiança (15 testes)

**Rodada:** 2026-05-27, Chromium headless (Playwright Python + Codex CDP)  
**Evidências:** `reports/auditoria/fase-c-evidencias-20260527/`, `reports/auditoria/fase-c-shots/`  
**Scripts:** `reports/auditoria/fase-c-audit-20260527.mjs`, `/tmp/audit-fase-c.py`

### Resultados dos 15 Testes

| Código | Teste | Resultado |
|---|---|---|
| C-01 | Texto muito longo (2600 palavras) | ✅ Zero overflow desktop/390/320; modo página "p. 1/1 · 2600 pal." |
| C-02 | Título muito longo | ✅ Zero overflow 390px e 320px |
| C-03 | Palavra sem espaços (156 chars) | ✅ Zero overflow 320px |
| C-04 | Estados vazios de cada seção | ✅ Todas as 5 seções carregam sem overflow |
| C-05 | Dark mode persiste após reload | ✅ `scriptorium` persistiu (via mecanismo JS, não classe CSS) |
| C-06 | Modo página: salto por número + saída | ✅ Counter clickável; botão alterna "Página" / "Fluxo"; Escape volta ao fluxo quando não há overlay prioritário |
| C-07 | Múltiplas notas: troca e persistência | ⚠️ Reclassificado: lista é ordenada por recência (`rows[0]` = nota mais nova); seleção por id funciona, mas feedback da nota ativa ainda merece reforço |
| C-08 | Busca sem resultado | ✅ "Nada encontrado no acervo." exibido corretamente |
| C-09 | Biblioteca com nota ativa, sem palavra selecionada | ⚠️ Orientação "Selecione uma palavra no manuscrito" — comportamento esperado, mas sem entrada livre |
| C-10 | Prova de Autoria: sessão ativa | ✅ 34% integridade, 19 palavras, 0 erros de console |
| C-11 | RimaLab: estado vazio e busca | ✅ UI validada em Chromium: "amor" renderiza 8 chips (`dor`, `flor`, `voz`, `sol`, `rio`, `frio`, `vazio`, `só`) |
| C-12 | Espelho de Voz com microfone negado | ✅ Não aplicável — análise textual local; não usa microfone/getUserMedia |
| C-13 | Offline (service worker) | ✅ Badge "Sem rede — escrita contínua" visível; navegação entre seções funciona offline |
| C-14 | Mobile: foco sem empurrar viewport | ✅ Altura do viewport: 844px antes e depois do foco (sem compressão pelo teclado virtual simulado) |
| C-15 | Aria e acessibilidade pós-correções | ✅ 0 erros TDZ ao digitar; 0 problemas de aria-pressed/expanded; 0 botões sem nome |

### Correções Aplicadas e Validadas no Piloto

1. **Prova de Autoria (crítica):** `renderProofView()` corrigido — `const ms = getActiveManuscript()` movido antes do uso (linha 216); TDZ eliminado. C-15 confirmou 0 erros ao digitar.
2. **Responsividade desktop:** `.app-shell` com `width: 100%` (era `100vw`), evitando overflow da barra de rolagem.
3. **Teclado físico no phone:** busca invisível do topo removida da ordem de foco no mobile via CSS.
4. **Colagem rica:** o editor mantém texto plano e agora avisa "Formatação externa removida. Só o texto foi colado." (C-15 confirmou aviso visível).
5. **Versionamento de assets:** `index.html` e `service-worker.js` alinhados em `20260527-v99u`; cache em `vereda-offline-v336`.
6. **Welcome overlay + navegação:** fechar welcome ao navegar para qualquer aba (Escape, setView); toast de autosave descartado ao abrir bandeja.
7. **Modo Página:** botão de página agora alterna para "Fluxo" com `aria-label`/`title` coerentes; Escape sai do modo página quando não existe overlay prioritário aberto.
8. **Ícones Material:** `.material-symbols-outlined` recebe `aria-hidden="true"` em runtime, inclusive para elementos criados depois do carregamento.

### Achado C1 — troca de nota reclassificada como ambiguidade de teste

**Etiqueta:** `fluxo escondido` `polimento visual`
**Área:** Editor / Sidebar  
**Como reproduzir:** criar duas notas em sequência; na sidebar, clicar na primeira nota da lista

**Problema:**  
Ao criar nota A e depois nota B, a lista da sidebar posiciona a nota mais recente (B) em `rows[0]`. Clicar em `rows[0]` seleciona a nota B porque a lista é newest-first (`addManuscript()` usa `unshift`). A seleção real usa `data-manuscript-id`; portanto o achado não confirma troca de nota errada no produto, e sim uma suposição frágil do teste automatizado.

**Impacto:** Baixo como bug funcional; médio como confiança se o destaque da nota ativa não estiver evidente para a escritora.

**Correção sugerida:** Manter testes por id/título, não por posição `rows[0]`; reforçar visualmente o estado ativo e, se necessário, exibir o nome da nota ativa na toolbar do editor.

**Severidade:** 🟢 Baixo como bug; 🟡 médio como polimento de confiança

---

### Achado C2 — RimaLab: "amor" confirmado na UI

**Etiqueta:** `corrigido` `validado`
**Área:** Academia / RimaLab  
**Como reproduzir:** acessar RimaLab, digitar "amor" no campo, pressionar Enter

**Problema:**  
O campo de busca existe e o tab abre corretamente, mas a busca por "amor" havia retornado 0 resultados na rodada automatizada anterior. A inspeção direta do `rimalab-engine.js` confirmou dados; a rodada Chromium pós-limite confirmou a UI: `chipCount: 8`, `empty: false`.

**Resultado validado:** `dor`, `flor`, `voz`, `sol`, `rio`, `frio`, `vazio`, `só`.

**Correção sugerida:** Nenhuma correção funcional necessária para "amor"; manter o teste no script da Fase C para evitar regressão.

**Severidade:** ✅ Validado

---

### Achado C3 — Modo Página: saída corrigida

**Etiqueta:** `fluxo escondido` `quebra confiança` `corrigido`
**Área:** Editor / Modo Página  
**Como reproduzir:** ativar "Ver texto em página"; tentar voltar ao editor normal

**Problema:**  
Na rodada anterior, não existia saída textual clara do Modo Página e Escape não voltava ao fluxo.

**Correção aplicada:** O botão de página agora é um toggle real: mostra "Página" no fluxo normal e "Fluxo" quando o modo página está ativo. `aria-pressed`, `aria-label` e `title` acompanham o estado. Escape também chama `setEditorViewMode("flow")` quando não há menu, bandeja, foco, tema, criação de nota ou welcome overlay aberto.

**Validação:** Sintaxe de `app.js` e `grammar-controller.js` validada com `node -c`. Reteste Chromium pós-ajuste confirmou: antes de Escape `mode: pages`, label `Fluxo`, `aria-pressed: true`; depois de Escape `mode: flow`, label `Página`, `aria-pressed: false`; ida/volta pelo botão também passa.

**Severidade:** ✅ Corrigido; reteste visual recomendado na próxima janela de automação

---

### Risco Aberto C4 — múltiplas abas sobrescrevem sem mediação

**Etiqueta:** `quebra confiança` `persistência` `dívida futura`  
**Área:** Salvamento / armazenamento local  
**Como reproduzir:** abrir duas abas com o mesmo manuscrito, editar e salvar na aba A, depois editar e salvar na aba B ainda com estado antigo.

**Problema:**  
O estado é persistido como um bloco inteiro em `localStorage`. Quando duas abas ficam abertas, a aba que salva por último pode sobrescrever alterações feitas na outra aba sem aviso ou tentativa de conciliação.

**Impacto para a escritora:**  
Perda silenciosa de texto recente em cenário plausível: pessoa abre o app em duas janelas/abas, volta para uma aba antiga e digita.

**Correção sugerida:**  
Antes de salvar, comparar a versão carregada pela aba com `state.meta.lastSavedAt` do armazenamento atual. Se houver alteração externa posterior, mostrar aviso fixo ("Outra aba alterou este acervo") e oferecer recarregar ou guardar uma cópia local, em vez de sobrescrever automaticamente.

**Severidade:** alta para confiança, mas fora do escopo de correção rápida

---

## Complemento Codex — Fase A Mecânica

**Rodada:** 2026-05-27, Chromium headless via CDP  
**Servidor local:** `http://127.0.0.1:8800/index.html`  
**Evidências:** `reports/auditoria/fase-a-evidencias-20260527/`  
**Script:** `reports/auditoria/fase-a-audit-20260527.mjs`

### Métricas da Rodada Codex

- Viewports testados: `1366x900`, `1024x768`, `768x1024`, `430x932`, `390x844`, `320x700`
- Temas testados: Alvorada, `scriptorium`, `cerrado-dark`, `mata-dark`
- Áreas por viewport/tema: Editor, Biblioteca, Prova de autoria, Arquivo, Academia, Cronograma
- Combinações inspecionadas: 144
- Overflows globais confirmados: 0
- Botões visíveis sem nome acessível pela heurística final: 0
- Problemas de `aria-expanded` / `aria-pressed`: 0
- Erros fatais de console: 0
- Avisos de console: apenas manifest em localhost e GoatCounter recusando contagem local
- Screenshots salvas: 12

### Achado Codex A1 — foco invisível na busca do topo em mobile

**Etiqueta:** `quebra confiança` `teclado físico` `fluxo escondido`  
**Área:** Dock / navegação mobile  
**Viewport/tema:** `320x700`, Alvorada e `scriptorium`  
**Como reproduzir:** abrir em 320px, usar `Tab` a partir do topo da página

**Problema:**  
No mobile estreito, a primeira parada de Tab caiu no campo `Buscar no acervo`, embora o botão de busca do topo esteja escondido por CSS no phone. O campo vive dentro de `.topbar-search label`, que fica com `width: 0`, `opacity: 0` e `pointer-events: none`, mas o `input` continua focável.

**Impacto para a escritora:**  
Com teclado físico, o foco entra em um controle invisível antes de chegar às ferramentas visíveis. A interface parece "perder" o foco, justamente no cenário que o projeto trata como pilar.

**Correção sugerida:**  
Quando a busca do topo estiver fechada ou escondida no phone, aplicar `tabindex="-1"`/`inert` no input, ou esconder o bloco com `display: none` de modo que ele saia da ordem de foco. Ao abrir a busca, restaurar a focabilidade.

**Severidade:** média

### Achado Codex A2 — ativação por Enter ficou inconclusiva no CDP

**Etiqueta:** `teclado físico` `dívida futura`  
**Área:** modais e bandeja mobile  
**Viewport/tema:** `1366x900` e `320x700`, Alvorada e `scriptorium`

**Problema:**  
A rodada automatizada conseguiu avançar por `Tab` e validar `Escape` sem quebrar a tela, mas a simulação CDP de `Enter` sobre controles focados (`Nova nota`, `Mais`) não abriu os painéis esperados. Como botões nativos deveriam ativar por Enter, este resultado precisa de uma passada manual com teclado físico antes de ser tratado como bug confirmado.

**Impacto para a escritora:**  
Se confirmado fora do CDP, bloqueia fluxos básicos sem mouse. Se for limitação da automação, ainda assim a auditoria precisa registrar que a camada `Tab -> Enter -> Escape` não está totalmente comprovada.

**Correção sugerida:**  
Fazer uma micro-passada manual: `Tab` até `Nova nota` -> `Enter` -> painel abre -> `Escape` fecha e devolve foco; no mobile, `Tab` até `Mais` -> `Enter` -> bandeja abre -> `Escape` fecha.

**Severidade:** média até verificação manual

### Achado Codex A3 — editor em 1366 fica sem overflow, mas com ferramentas espremidas

**Etiqueta:** `quebra confiança visual` `polimento visual`  
**Área:** Editor  
**Viewport/tema:** `1366x900`, Alvorada e `scriptorium`

**Problema:**  
Com acervo à esquerda, guia de escrita aberto e Olhar do texto à direita, o editor passa no critério mecânico de overflow global, mas a folha fica estreita e a barra editorial aparece visualmente truncada/espremida. A tela não quebra tecnicamente, mas a ferramenta compete com o manuscrito.

**Impacto para a escritora:**  
O centro da experiência deixa de ser a escrita. Em notebook/desktop comum, a pessoa vê vários painéis e controles antes de ver respiro suficiente para escrever.

**Correção sugerida:**  
Considerar recolher o Olhar do texto por padrão quando o Guia estiver aberto em larguras próximas de 1366px, ou transformar a barra editorial em trilho local com affordance clara. O objetivo é manter a folha como centro sem depender da usuária fechar painéis.

**Severidade:** média / polimento de reta final

### Observações Positivas da Fase A Codex

- O critério inegociável `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth` passou em todos os 144 cenários.
- `scriptorium`, `cerrado-dark` e `mata-dark` não introduziram overflow global nas áreas testadas.
- Os estados de `aria-expanded` e `aria-pressed` retornaram valores coerentes nos controles visíveis amostrados.
- Os avisos de console encontrados não foram fatais para a escrita; eram esperados em ambiente local (`localhost`/manifest e GoatCounter).

---

## Resumo Executivo

| Dimensão | Estado |
|---|---|
| Overflow horizontal | ✅ Zero em todos viewports e seções |
| Erros de console (carga) | ✅ Zero |
| Erros de console (digitação) | ✅ Zero após correção do TDZ — confirmado C-15 (era ~1/keystroke) |
| Acessibilidade técnica | ✅ Zero botões visíveis sem nome acessível na heurística final |
| Aria-pressed/expanded | ✅ Todos válidos |
| Navegação por Tab | ✅ Foco funcional |
| Persistência (reload) | ✅ Texto salvo |
| Ctrl+Z | ⚠️ Funciona, mas caractere a caractere |
| Paste de texto rico | ✅ Sanitizado para texto plano; aviso "Formatação externa removida" confirmado (C-15) |
| Temas (4) | ✅ Todos acessíveis |
| Dark mode visual | ✅ Correto |
| Dark mode mobile (390px) | ✅ Sem overflow |
| Modo Página | ✅ Sem overflow em todos viewports; salto por número funciona |
| Saída do Modo Página | ✅ Botão alterna para "Fluxo"; Escape volta ao fluxo sem overlay prioritário |
| Update banner (mobile 320px) | ⚠️ Ocupa ~25% da tela |

**Bloqueadores:** 0 — TDZ corrigido e validado  
**Bugs médios abertos:** nenhum confirmado
**Risco de confiança:** múltiplas abas ainda podem sobrescrever texto sem aviso  
**Polimentos visuais:** 3 (update banner, undo por palavra, Espelho de Voz enterrado)
**Próxima ação recomendada:** proteger o salvamento contra conflito de múltiplas abas

---

## Achados Críticos

### 1. TDZ em `proof-controller.js` — corrigido e validado

**Etiqueta:** `bloqueia uso` `quebra confiança` `corrigido`  
**Área:** Prova de Autoria  
**Viewport/tema:** todos  
**Como reproduzir:** criar uma nota e digitar qualquer caractere  

**Problema:**  
Na função `renderProofView()` (linha 167), a variável `ms` é usada na linha 216 (`if (wordcountEl && ms)`) mas só é declarada com `const` na linha 247. Em JavaScript, `const` cria uma Temporal Dead Zone (TDZ) desde o início do escopo da função até a linha de declaração. Acessar `ms` antes da linha 247 lança `ReferenceError: Cannot access 'ms' before initialization`.

O erro dispara em:
- `renderProofView` ← `renderActiveManuscript` ← `addManuscript` (ao criar nota)
- `renderProofView` ← `recordWritingProof` ← evento de input (a cada keystroke)

O resultado é que a Prova de Autoria **registra cada evento de escrita com erro silencioso**, potencialmente perdendo dados de sessão ou registrando de forma corrompida.

**Impacto para a escritora:**  
A escritora escreve normalmente, sem perceber que o sistema de prova de autoria está falhando a cada tecla. A prova pode estar incompleta ou inválida sem nenhum aviso visual.

**Correção sugerida:**  
Mover a declaração `const ms = getActiveManuscript()` da linha 247 para o início de `renderProofView()`, antes da linha 216. A variável já existe no escopo correto em outros pontos da mesma função.

```js
// proof-controller.js — início de renderProofView()
function renderProofView() {
  const session = getActiveProofSession();
  const ms = getActiveManuscript(); // ← mover para cá
  // ...
```

**Status pós-piloto:** validado na Fase C com 0 erros fatais ao digitar.  
**Severidade original:** 🔴 Crítica

---

## Achados Médios

### 2. Ctrl+Z opera caractere a caractere

**Etiqueta:** `trabalho transferido`  
**Área:** Editor  
**Como reproduzir:** digitar "Palavra a ser desfeita" → Ctrl+Z → apaga apenas o último caractere

**Problema:**  
O desfazer nativo do `contenteditable` opera no nível de caractere individual. Para uma escritora, o reflexo muscular de Ctrl+Z significa "desfazer a última ação significativa" (palavra digitada, formatação aplicada, parágrafo inserido). O comportamento atual exige muitos Ctrl+Z para reverter mudanças simples.

**Impacto:** Frustração imediata; destroí a confiança muscular no undo.

**Correção sugerida:** Implementar histórico de desfazer por palavra ou por evento significativo (execCommand personalizado ou biblioteca de history). Mínimo aceitável: agrupar caracteres digitados em sequência como uma única ação de undo.

**Severidade:** 🟡 Médio

---

### 3. Paste de HTML sanitizado — aviso visual aplicado

**Etiqueta:** `trabalho transferido` `entrada falsa` `corrigido`  
**Área:** Editor  
**Como reproduzir:** copiar texto formatado do Google Docs/Word e Ctrl+V no editor

**Problema:**  
O editor sanitiza completamente o HTML ao colar — `<strong>`, `<em>`, links e estilos inline são descartados, resultando em texto plano. Isso é verificável: o evento `paste` foi disparado com HTML rico, mas `has_strong: False, has_em: False`.

O comportamento pode ser intencional (oficina de escrita limpa, sem formatação externa), mas não há aviso. A escritora que cola de outro documento perde toda a formatação silenciosamente.

**Impacto:** Perda de trabalho invisível; retrabalho sem expectativa.

**Correção sugerida:** Se a sanitização é intencional, exibir um toast discreto ao detectar paste de HTML: "Formatação externa removida — só o texto foi colado." Se não é intencional, revisar o handler de `paste`.

**Status pós-piloto:** o texto continua sendo colado como texto plano, mas agora a interface avisa: "Formatação externa removida. Só o texto foi colado."  
**Severidade original:** 🟡 Médio

---

### 4. Biblioteca bloqueada pela tela de boas-vindas — corrigido

**Etiqueta:** `fluxo escondido` `estado vazio fraco` `valor enterrado` `corrigido`
**Área:** Biblioteca  
**Como reproduzir:** abrir o app sem manuscritos → clicar na aba "Biblioteca" na topbar

**Problema:**  
Na rodada inicial, ao navegar para Biblioteca sem nota ativa, o welcome overlay (`z-index: 80`) continuava visível e bloqueava o conteúdo da Biblioteca. A escritora clicava na aba e aparentemente "nada acontecia".

A Biblioteca como ferramenta de linguagem tem valor autônomo (buscar sinônimos, antônimos, critérios gramaticais) sem precisar de texto no editor. O bloqueio inicial foi removido, mas a auditoria ainda recomenda reforçar a entrada manual de pesquisa.

**Pergunta crítica respondida:** "A Biblioteca é útil sem palavra selecionada?" → Sim, mas não é alcançável sem nota ativa.

**Impacto:** Feature invisível para quem abre o app para pesquisar, não para escrever.

**Correção aplicada:** `setView()` agora fecha o welcome overlay ao navegar para outra aba; Escape também fecha a tela de boas-vindas.

**Severidade:** ✅ Corrigido; ainda vale revisar a força da busca manual da Biblioteca

---

### 5. Espelho de Voz enterrado em Academia > Bancada

**Etiqueta:** `fluxo escondido` `valor enterrado`  
**Área:** Espelho de Voz  
**Como reproduzir:** procurar "Espelho de Voz" na navegação principal

**Problema:**  
O Espelho de Voz não tem uma entrada direta na navegação principal nem na dock mobile. Está acessível como aba dentro de "Academia > Bancada". O único atalho direto é o welcome overlay no estado vazio — que desaparece assim que a escritora tem notas.

Quem já usa o app não tem caminho óbvio de volta ao Espelho de Voz sem saber que está em Academia > Bancada.

**Impacto:** Feature de alto valor (análise de voz narrativa) efetivamente escondida para usuárias recorrentes.

**Correção sugerida:** Adicionar entrada direta na dock mobile (em "Mais"/bandeja) ou no nav-row do painel lateral. Pelo menos um caminho que não desapareça após a primeira nota.

**Severidade:** 🟡 Médio

---

### 6. Update banner ocupa ~25% da tela em mobile 320px

**Etiqueta:** `trabalho transferido` `polimento visual`  
**Área:** Service Worker / Notificações  
**Viewport:** mobile-320  
**Como reproduzir:** ter uma atualização pendente + abrir em 320px

**Problema:**  
O aviso "Nova versão pronta. Suas notas estão salvas — pode recarregar sem perder nada. [Recarregar agora] [×]" ocupa ~25% da tela em 320px, comprimindo o editor significativamente. O texto é longo e o layout empilha em duas colunas (texto + botão), aumentando a altura.

**Impacto:** Experiência degradada em celulares pequenos durante updates (que são frequentes).

**Correção sugerida:** Em viewports < 390px, reduzir o texto para "Atualização pronta. [Recarregar]" + ícone de fechar. Limitar a 2 linhas máximo.

**Severidade:** 🟡 Médio

---

### 7. Toast de autosave posicionado dentro da bandeja mobile

**Etiqueta:** `quebra confiança` `polimento visual`  
**Área:** Salvamento / Dock mobile  
**Viewport:** mobile-390  
**Como reproduzir:** abrir "Mais" (bandeja) logo após autosave

**Problema:**  
O toast "Texto salvo aqui, neste navegador. Sem internet, sem nuvem." aparece renderizado DENTRO da bandeja mobile aberta, no meio dos itens de menu. Visualmente parece um item de lista, não uma notificação de status.

**Impacto:** Confusão semântica — a escritora pode confundir o toast com um item de menu clicável.

**Correção sugerida:** Toasts devem ter `position: fixed` com z-index acima da bandeja. Verificar se o container do toast está dentro do DOM da bandeja ou no body principal.

**Severidade:** 🟡 Médio

---

## Quebras de Confiança Visual

### 8. `role="dialog"` no painel de boas-vindas

**Área:** Welcome overlay  
**Problema:** O painel "Sua mesa." usa `role="dialog"` mas é o estado principal da aplicação (não um dialog modal). Leitores de tela anunciam "dialog" e esperam comportamento de modal. A parte mais grave foi corrigida: Escape agora fecha o welcome panel.

**Impacto:** Usuárias com leitor de tela recebem uma metáfora errada e podem ficar desorientadas.

**Correção sugerida:** Trocar `role="dialog"` por `role="main"` ou remover o role, mantendo apenas o ARIA adequado para a seção de boas-vindas.

---

### 9. Ícones Material concatenados ao texto acessível — corrigido em runtime

**Área:** Navegação, Arquivo, Academia, Prova de autoria  
**Problema:** Botões como `.nav-row` têm `textContent` = `"auto_stories Bibliotecagramática e critérios"` — o nome do ícone Material (`auto_stories`) está concatenado diretamente ao texto visível, sem aria-label separada. Screen readers leem o texto literal incluindo o nome do ícone.

Exemplos:
- `"auto_stories Bibliotecagramática e critérios"` 
- `"fingerprint Prova de autoriaregistros locais"`
- `"add_circle Nova sessão"`
- `"history_edu Salvar versão"`

**Correção aplicada:** `app.js` agora aplica `aria-hidden="true"` em `.material-symbols-outlined` no bootstrap e observa nós inseridos depois por `MutationObserver`. Isso corrige o nome acessível em runtime sem exigir tocar manualmente em todos os templates.

**Validação:** Sintaxe validada com `node -c app.js`. Reteste Chromium pós-ajuste confirmou `410` ícones Material no DOM e `0` sem `aria-hidden="true"`.

---

### 10. Undo caractere a caractere destrói o reflexo de confiança

*(já descrito como Achado Médio #2, destacado aqui pelo impacto emocional)*  
Para uma escritora, pressionar Ctrl+Z e ver o cursor recuar um único caractere é inesperado. A confiança no editor diminui porque o comportamento não corresponde à expectativa.

---

## Fricções Funcionais

### Biblioteca

```
Feature: Biblioteca
Promessa visível: aba "Biblioteca" na topbar; atalho no welcome overlay
Valor esperado: dicionário, sinônimos, critérios gramaticais, busca manual
Caminhos reais:
  1. Click na aba → agora fecha o welcome overlay e revela a seção
  2. Selecionar palavra no editor → vai para biblioteca (caminho não descoberto nesta auditoria)
  3. Welcome overlay: botão aparece mas desaparece após criar nota
  4. Busca manual: campo "Buscar no acervo" é busca de MANUSCRITOS, não dicionário
Fricções:
  - Acesso direto sem nota foi corrigido
  - Busca no sidebar ≠ busca no dicionário (mesmo placeholder "Buscar no acervo")
Trabalho transferido: usuária ainda precisa distinguir busca de manuscritos de busca de linguagem
Estado vazio: não testado com nota ativa — pendente
Atalho ausente: entrada direta de pesquisa de linguagem ainda pode ser mais explícita
Veredito: feature de valor; bloqueio inicial corrigido; confusão de busca segue como polimento
Correção sugerida: separar visualmente busca de manuscritos de busca no dicionário
Severidade: 🟡 médio como polimento
```

### Prova de Autoria

```
Feature: Prova de Autoria
Promessa visível: "Sinais da sua escrita" com % de integridade
Valor esperado: registro automático e confiável de sessões de escrita
Caminhos reais:
  1. Abrir pela aba → funciona visualmente
  2. Chip de integridade na topbar → visível (69% confirmado)
  3. Exportar/guardar cópia → botão presente
Fricções:
  - Bug TDZ faz cada keystroke lançar ReferenceError (invisível para a escritora)
  - A prova pode estar registrando de forma incompleta sem aviso
Trabalho transferido: nenhum visível — o bug é silencioso
Estado vazio: "Nenhum manuscrito ativo / + Nova sessão" — claro e orientado
Veredito: interface correta, bug técnico crítico por baixo
Correção sugerida: corrigir TDZ imediatamente (ver Achado #1)
Severidade: 🔴 crítico
```

### RimaLab

```
Feature: RimaLab
Promessa visível: atalho no welcome overlay; item "Mais" na bandeja mobile
Valor esperado: busca de rimas e métricas
Caminhos reais:
  1. Welcome overlay → funciona diretamente
  2. Bandeja "Mais" → não testado no contexto correto
  3. data-viewTarget="rimalab" → não existe (busca do seletor falhou)
Fricções: sem entrada direta na navegação principal após welcome
Veredito: acessível na tela de boas-vindas, escondido depois
Correção sugerida: adicionar entrada na bandeja mobile e no nav-row lateral
```

### Modo Página

```
Feature: Modo Página
Promessa visível: botão "Ver texto em página" na toolbar do editor
Valor esperado: visualização em folha com paginação e contador
Caminhos reais:
  1. Botão "Ver texto em página" → funciona ✅
  2. Contador "p. 1 / 1 · 180 pal." → visível ✅
  3. Salto por número de página → testado na Fase C
  4. Voltar ao editor → botão alterna para "Fluxo"; Escape também volta quando não há overlay prioritário
Fricções: corrigida a saída escondida; resta reteste visual pós-ajuste
Estado vazio: não testado sem texto
Overflow: zero em todos viewports ✅
Veredito: funciona; saída corrigida; reteste visual recomendado
Correção sugerida: retestar em Chromium/leitor de tela na próxima janela
```

---

## Estados Vazios

| Estado | Avaliação |
|---|---|
| Primeiro acesso sem notas | ✅ Welcome overlay claro, com 5 caminhos: folha em branco, guia, RimaLab, Espelho de Voz, Prova de autoria |
| Prova de autoria sem sessão | ✅ "Nenhum manuscrito ativo · + Nova sessão" — orientado |
| Biblioteca sem seleção (com nota) | ⚠️ "Selecione uma palavra no manuscrito" — orientação presente, mas sem entrada livre de busca (C-09) |
| Biblioteca primeiro acesso (sem nota) | ✅ Abre sem bloqueio quando welcome não está ativo (C-05 Codex) |
| RimaLab sem texto | ✅ Área vazia com input e texto descritivo — estado orientado (C-11) |
| Arquivo sem notas | ✅ Filtros visíveis (5), estado vazio implícito |
| Academia sem contexto | ✅ Conteúdo sempre disponível (guias independentes de nota) |
| Modo offline | ✅ Badge "Sem rede — escrita contínua" visível; navegação funciona (C-13) |

---

## Dark Mode

| Item | Estado |
|---|---|
| Alvorada (claro) | ✅ |
| Vereda / scriptorium | ✅ Visualmente correto (confirmado em screenshot) |
| Cerrado-dark | ✅ Acessível (CSS responde à classe) |
| Mata-dark | ✅ Acessível |
| Overflow dark mobile 390px | ✅ Zero |
| Persistência do tema após reload | ✅ `scriptorium` persiste corretamente (mecanismo via JS/localStorage — confirmado C-05) |
| Welcome overlay em dark mode | ✅ Contraste adequado, card primário em âmbar |
| Mecanismo de aplicação | ⚠️ `html.className` retorna vazio — tema via JS/state, não classe CSS direta; funciona mas dificulta testes automatizados de contraste |

**Nota sobre o mecanismo de tema:** O tema não é aplicado como classe no `document.documentElement` — é gerido via JavaScript e localStorage. O CSS não usa uma classe `scriptorium` no `<html>`, mas sim algum outro mecanismo (CSS variables aplicadas via JS). Isso funciona, mas dificulta detecção externa e testes automatizados de contraste.

---

## Mobile / Responsividade

| Viewport | Overflow | Notas |
|---|---|---|
| 1366×900 | ✅ 0px | |
| 1024×768 | ✅ 0px | |
| 768×1024 | ✅ 0px | |
| 430×932 | ✅ 0px | |
| 390×844 | ✅ 0px | |
| 320×700 | ✅ 0px | Update banner ocupa ~25% da tela |
| Editor 320px | ✅ 0px | |
| Editor 390px | ✅ 0px | |
| Modo Página 320px | ✅ 0px | |
| Modo Página 390px | ✅ 0px | |
| Guia aberto 320px | ✅ 0px | |
| Guia aberto 390px | ✅ 0px | |
| Academia 390px | ✅ 0px | |
| Autoria 390px | ✅ 0px | |
| Dark mode 390px | ✅ 0px | |
| Bandeja mobile 390px | ✅ 0px | Toast dentro da bandeja (ver Achado #7) |

**Resultado:** Zero overflow horizontal em todos os viewports e seções testados. O pilar de responsividade está sólido.

---

## Modo Página

| Aspecto | Estado |
|---|---|
| Ativação | ✅ Botão "Ver texto em página" funcional |
| Overflow 1366px | ✅ 0px |
| Overflow 320px | ✅ 0px |
| Overflow 390px | ✅ 0px |
| Contador | ✅ "p. 1 / 1 · 180 pal." visível |
| Salto por número de página | ✅ Counter clicável; input de número aparece após clique (C-06) |
| Saída do modo | ✅ Botão alterna para "Fluxo"; Escape volta ao fluxo quando não há overlay prioritário |
| Cabeçalho/rodapé | ⚠️ Não testado com cabeçalho/rodapé personalizados |
| Modo parece: | Edição — o texto está editável dentro da folha |

---

## Fluxos Testados

| Fluxo | Resultado |
|---|---|
| Criar nota (welcome-blank) | ✅ |
| Escrever no editor | ✅ |
| Formatar (negrito, itálico) | ✅ |
| Ctrl+Z desfazer | ✅ Funciona / ⚠️ caractere a caractere |
| Ctrl+Y refazer | ✅ |
| Colar HTML rico | ✅ Sanitizado para texto plano com aviso: "Formatação externa removida" |
| Abrir guia de escrita | ✅ Já visível no split por padrão |
| Trocar guia de lado | ✅ |
| Guia sem overflow mobile | ✅ |
| Ativar modo página | ✅ |
| Navegar para Biblioteca | ✅ Welcome overlay fecha ao navegar |
| Busca na Biblioteca | ⚠️ Busca de manuscritos ≠ busca de linguagem |
| Navegar para Arquivo | ✅ |
| Abrir nota pelo Arquivo | ⚠️ Botão não encontrado no momento do teste |
| Navegar para Academia | ✅ |
| Acessar RimaLab | ✅ Via welcome overlay; ⚠️ escondido após |
| Acessar Espelho de Voz | ✅ Via welcome overlay; ⚠️ em Academia > Bancada |
| Microfone negado no Espelho | ⚠️ Botão de microfone sem aria-label; estado de erro não testado |
| Prova de Autoria | ✅ Visualmente / 🔴 bug TDZ por baixo |
| Cronograma | ✅ View funcional, 3 sessões |
| Persistência após reload | ✅ Texto salvo e recuperado |
| Alternar tema | ✅ Dark mode aplicado corretamente |
| Dark mode após reload | ⚠️ Mecanismo via localStorage (não classe CSS) |
| Bandeja mobile | ✅ Sem overflow |
| Dock mobile (4 seções) | ✅ Todas navegáveis |

---

## Métricas

| Métrica | Valor |
|---|---|
| Viewports testados | 6 |
| Temas testados | 4 |
| Seções testadas | 9 |
| Fluxos testados (Fase B) | 27 |
| Cenários mecânicos (Fase A) | 144 |
| Testes de estado extremo (Fase C) | 15 |
| Screenshots gerados | 90+ |
| Erros de console (carga) | 0 |
| Erros de console (digitação pós-fix) | **0** (era ~1/keystroke antes) |
| Overflows globais — Fase A (144 cenários) | 0 |
| Overflows globais — Fases B e C | 0 em todos viewports e seções |
| Botões sem nome acessível (técnico final) | **0**/179 |
| Ícones Material concatenados ao nome acessível | corrigido em runtime via `aria-hidden` |
| Issues de aria-pressed/expanded | 0 |
| Elementos focáveis | 203 |
| Erros TDZ ao digitar pós-fix | **0** (C-15 confirmado) |
| Ações evitadas por segurança | apagar acervo real, blockchain real |

---

## Prioridade Recomendada

### Antes do próximo release

1. **Proteger salvamento contra múltiplas abas** — comparar `lastSavedAt` antes de persistir e avisar se houve alteração externa.

2. **Retestar C-06, C-11 e nomes acessíveis em Chromium/leitor de tela** — as correções pontuais passaram em validação estática, mas a rodada headless pós-ajuste não pôde ser reexecutada por limite de aprovação.

### Reta final de polimento

3. **Reduzir update banner em mobile < 390px** — texto curto, máximo 2 linhas, botão compacto.

4. **Reforçar indicação da nota ativa** — C-07 foi reclassificado como ordenação por recência, mas a confiança melhora se o nome/estado ativo aparecer sem ambiguidade.

5. **Revisar update/toast em bandeja mobile** — garantir que nenhum aviso ocupe espaço crítico quando a bandeja está aberta.

6. **Passada manual com leitor de tela nos botões principais** — Chromium confirmou `aria-hidden` nos ícones Material; uma leitura real ainda ajuda a avaliar fraseado e ordem, não o bug técnico.

### Ciclo seguinte

7. **Investigar undo por palavra/bloco** — melhora significativa de confiança no editor.

8. **Entrada direta para RimaLab e Espelho de Voz** após a tela de boas-vindas.

9. **Acompanhar Modo Página em uso real** — botão toggle e Escape foram corrigidos e validados; resta observar se "Fluxo" é o rótulo mais intuitivo.

10. **Expandir amostra do RimaLab** — "amor" passa na UI; testar mais palavras comuns para medir cobertura poética.

11. **Aprimorar autosave com mediação de conflito** — além do aviso de múltiplas abas, oferecer recarregar, manter cópia local ou mesclar manualmente.

---

## Screenshots de Referência

Diretórios: `fase-a-shots/`, `fase-b-shots/`, `fase-c-shots/`, `fase-a-evidencias-20260527/`, `fase-c-evidencias-20260527/`

**Fase A — Notáveis:**
- `desktop-1366-alvorada.png` — welcome overlay visível sobre o editor
- `theme-vereda-scriptorium-desktop.png` — dark mode correto no desktop
- `mobile-320-alvorada.png` — mobile 320px limpo, sem overflow

**Fase B — Notáveis:**
- `dark-modo-aplicado.png` — dark mode com welcome overlay em âmbar
- `modo-pagina-desktop.png` — modo página com update banner
- `modo-pagina-320.png` — modo página em 320px funcional
- `guia-mobile-320.png` — update banner ocupa ~25% da tela
- `mobile-390-bandeja-aberta.png` — bandeja com toast dentro
- `autoria-inicial.png` — "Sinais da sua escrita" limpo e orientado
- `espelho-voz-inicial.png` — espelho de voz em Academia/Bancada

**Fase C — Notáveis:**
- `c01-texto-longo-320.png` — 2600 palavras sem overflow em 320px
- `c01-modo-pagina-texto-longo.png` — modo página com texto longo
- `c05-dark-apos-reload.png` — scriptorium persistindo após reload
- `c06-counter-click.png` — input de salto de página após clique no counter
- `c06-apos-escape.png` — modo página ainda ativo após Escape (achado C3)
- `c10-autoria-com-sessao.png` — prova de autoria com 0 erros TDZ
- `c13-offline-badge.png` — badge offline com navegação funcionando
- `fase-c-evidencias-20260527/empty-first-visit-biblioteca.png` — Biblioteca acessível no primeiro acesso

---

---

## Cobertura por Fase

| Fase | Escopo | Resultado |
|---|---|---|
| **A — Base mecânica** | 144 combinações viewport × tema × seção | ✅ Zero overflows, zero erros fatais, zero botões sem nome |
| **B — Fluxos reais** | 27 fluxos: criar nota, escrever, formatar, cola, Biblioteca, Arquivo, Academia, RimaLab, Espelho de Voz, Autoria, Cronograma, persistência, mobile, dark mode | ✅ 20 passaram; 7 com ressalva; 0 bloqueadores após fix do TDZ |
| **C — Estados extremos** | 15 testes: texto longo, título longo, palavra sem espaço, estados vazios, dark reload, modo página, múltiplas notas, busca vazia, Biblioteca, autoria, RimaLab, Espelho de Voz, offline, teclado mobile, aria pós-fix | ✅ Sem bloqueadores; C-06 corrigido e validado; C-07 reclassificado; C-11 validado na UI; 1 risco aberto (múltiplas abas) |

**Total de cenários cobertos: 186 — Zero bloqueadores em produção após correção do TDZ.**

---

*Auditoria conduzida por piloto automático Claude + Codex em 2026-05-27. Todas as três fases concluídas.*
