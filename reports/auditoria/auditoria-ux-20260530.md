# Relatório de Auditoria UX — Contratado Externo
**Sessão:** v358 · **Data:** 2026-05-30  
**Auditor:** Consultor UX externo (contratado pelo PO)  
**Método:** Playwright headless · Desktop 1280×800 + Mobile 390×844  
**Estado testado:** zero (sem manuscrito) + com manuscrito ativo  

---

## Resumo executivo

O produto tem base sólida: fluxo de entrada claro, linguagem coerente, estado vazio com instrução, salvamento com confirmação silenciosa. Os fixes da Beatriz estão visíveis e funcionando.

Os problemas restantes não são de arquitetura — são de revelação progressiva e feedback de estado. A maior falha sistêmica é a **toolbar editorial sem rótulos**: concentra funções importantes em símbolos que uma nova usuária não decodifica sem hover. No mobile esse problema fica crítico porque hover não existe.

---

## Achados por severidade

### ALTA

---

**A1 · Toolbar segunda linha: ícones sem nenhum rótulo visível**  
Heurística Nielsen #6 — Reconhecimento em vez de recordação

A segunda linha da barra de formatação exibe: `···` | Rascunho | Página | ícone-gramática | ícone-copiar | ícone-copiar | ícone-baixar | ícone-imprimir.

Cinco dos oito elementos são ícones puros. O botão `···` expande o grupo sem indicar o que está escondido. O ícone de gramática (`format_color_text`) não é intuitivo para coloração por classe gramatical — parece formatação de cor de texto comum.

No desktop há tooltip no hover. No mobile não há tooltip, não há rótulo, não há affordance visível.

**Impacto:** usuária nova ignora funções de exportação e análise gramatical porque não as encontra. Funções únicas do produto ficam invisíveis.  
**Proposta mínima:** rótulo de texto nos botões não-óbvios do grupo editorial quando o grupo estiver expandido. No mobile: tornar o grupo editorial visível com mini-legenda permanente.

---

**A2 · Tooltip disparando sem interação no mobile**  
Heurística Nielsen #1 — Visibilidade do estado do sistema

Na sessão mobile (390×844), o tooltip "Baixar para Word / LibreOffice" apareceu no botão de download sem nenhum toque ou foco registrado pelo script. O evento que disparou o tooltip foi provavelmente um `focusin` automático do navegador na carga da página — ou um evento residual de pointer.

Se isso ocorre em dispositivos reais, a usuária vê um balão flutuante inesperado ao abrir o editor, sem ter tocado em nada.

**Impacto:** desorientação, quebra de confiança no primeiro acesso.  
**Proposta mínima:** garantir que tooltip só exibe em resposta a interação explícita (touch ou foco por teclado). Adicionar `tabIndex="-1"` em botões puramente decorativos que não devem receber foco por tabulação automática.

---

### MÉDIA

---

**M1 · Banner de atualização permanece aberto e comprime espaço de escrita**  
Heurística Nielsen #3 — Controle e liberdade do usuário

O banner "Nova versão pronta — Suas notas estão salvas, pode recarregar sem perder nada" ocupa a faixa superior toda a sessão. No desktop isso só empurra o conteúdo 48px. No mobile, somado à toolbar em duas linhas, a área de escrita fica com menos de 400px de altura útil antes mesmo de qualquer texto.

O banner tem botão X para fechar. O problema é que ele requer uma ação extra antes de escrever — em contrapé com a proposta de "sua mesa, sem fricção".

**Impacto:** primeiro contato do editor — usuária precisa fechar algo antes de escrever.  
**Proposta mínima:** no mobile, colapsar o banner automaticamente após 4 segundos. Ou mostrar como toast no rodapé em vez de faixa no topo.

---

**M2 · Chip "38%" na nav sem contexto para nova usuária**  
Heurística Nielsen #2 — Correspondência entre sistema e mundo real

O indicador de autoria aparece como `● 38%` na barra de navegação após a primeira digitação. Uma nova usuária não sabe o que essa porcentagem mede. Não há legenda visível, tooltip só aparece no hover, e no mobile o chip some atrás do espaço comprimido.

**Impacto:** a função de Prova de autoria — diferencial único do produto — não se revela por conta própria.  
**Proposta mínima:** ao aparecer pela primeira vez (sessão nova), exibir por 3 segundos a legenda expandida "Sinais de autoria · 38%" antes de colapsar para o chip. OU fazer o chip ter um rótulo mínimo visível sempre: "Autoria 38%".

---

**M3 · Cronograma: "+ planejar" muito sutil como ponto de entrada**  
Heurística Nielsen #7 — Flexibilidade e eficiência de uso

No Cronograma, a tela principal mostra os dias com sessões registradas e, nos dias sem registro, apenas "+ planejar" em texto pequeno e apagado. Para uma nova usuária, a função de planejamento — criar metas, marcar sessões futuras — não é discernível como ação.

**Impacto:** Cronograma aparece como registro passivo, não como ferramenta ativa de planejamento.  
**Proposta mínima:** quando não há nenhuma entrada planejada, mostrar um estado vazio com instrução visível: "Nenhuma sessão planejada para este mês — clique em um dia para adicionar."

---

**M4 · Dock de navegação mobile não visível no viewport 390×844**  
Heurística Nielsen #1 — Visibilidade do estado do sistema

Em testes headless 390×844, a barra de navegação inferior (dock com ícones) não foi capturada nos screenshots do editor. Não foi possível confirmar se é artifact de Playwright ou bug de rendering em viewport real.

**Risco:** se o dock some em dispositivos reais quando a barra de endereço do browser empurra a viewport, a usuária fica sem navegação no mobile.  
**Proposta mínima:** validar em dispositivo real (iOS Safari e Android Chrome) com barra de endereço visível. Garantir que o dock usa `env(safe-area-inset-bottom)` e não apenas `bottom: 0`.

---

### BAIXA

---

**B1 · "Nota vinculada" no painel de manuscritos — sem contexto**  
Heurística Nielsen #2 — Correspondência entre sistema e mundo real

No painel esquerdo, abaixo de cada manuscrito há "+ Nota vinculada". Para uma usuária nova, essa opção aparece sem explicar o que uma nota vinculada é, como difere de um manuscrito comum, ou qual uso editorial ela serve.

**Impacto:** baixo — usuária simplesmente ignora. Risco de criar estrutura confusa sem entender.  
**Proposta mínima:** tooltip descritivo ou pequeno texto sublinhado ao lado: "+ Nota vinculada — anotação, pesquisa ou referência associada a este texto."

---

**B2 · Guia (painel de referência) — botão "Mostrar guia" não abriu no teste**  
Status: a confirmar

O clique em `[data-action="toggle-template-panel"]` não produziu o painel lateral de guia no teste automatizado. Não foi possível auditar o estado pós-fix da Beatriz nesta sessão. Pode ser sequência de cliques conflitando com painel esquerdo.

**Proposta:** re-testar manualmente. Não classifiquei como bug confirmado.

---

## O que está funcionando bem

| Item | Avaliação |
|---|---|
| Welcome modal | Hierarquia perfeita. Primary/secondary claros. Ferramentas como atalhos, não como destaque. |
| Empty state do editor | "Comece aqui. A primeira frase abre o caminho." — eficaz, sem pressão. |
| Toast de salvamento | Aparece e some. Não interrompe. |
| Biblioteca empty state | Instrução visível, sem demo word. (fix v358) |
| Prova de autoria — contexto | Frase de onboarding resolve a desorientação da Beatriz. (fix v358) |
| Espelho de Voz — hierarquia | "Usar o texto em edição" acima da textarea — fluxo natural. (fix v358) |
| Arquivo | Filtros, busca e "Continue de onde parou" são autoexplicativos. |
| Cronograma visual | Trilha de meses e linha do tempo — elegante e legível. |
| Linguagem da interface | Zero anglicismo desnecessário. Consistente em todas as telas auditadas. |

---

## Tabela de prioridade

| Código | Achado | Severidade | Esforço estimado |
|---|---|---|---|
| A1 | Toolbar editorial sem rótulo | Alta | Médio |
| A2 | Tooltip sem interação (mobile) | Alta | Pequeno |
| M1 | Banner de atualização comprime escrita mobile | Média | Pequeno |
| M2 | Chip de autoria sem contexto na primeira aparição | Média | Médio |
| M3 | "+ planejar" no cronograma muito sutil | Média | Pequeno |
| M4 | Dock mobile — validar em dispositivo real | Média | Verificação |
| B1 | "Nota vinculada" sem contexto | Baixa | Mínimo |
| B2 | Guia panel — re-testar abertura | — | Verificação |

---

*Relatório entregue ao PO em 2026-05-30. Próxima sessão recomendada: Lucas (mobile como único dispositivo) após resolução de A1 e A2.*
