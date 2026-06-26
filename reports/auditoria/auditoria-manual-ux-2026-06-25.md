# Auditoria Manual UX/Produto — 2026-06-25

**URL auditada:** https://escrevaral.com  
**Escopo:** primeira visita, escrita inicial, guia, menu/navegacao, celular, persistencia, acessibilidade basica.  
**Metodos:** navegacao real com Chromium/Playwright, screenshots desktop/mobile, leitura do HTML/JS em producao via `curl`, leitura do codigo local e agentes auxiliares UX/tecnico/codigo.  
**Resumo:** tecnicamente o site esta vivo e limpo, mas ha friccao de descoberta e continuidade mental no primeiro uso. O ponto mais caro e o fluxo de celular: existe, mas nao aparece no momento em que a pessoa mais precisa dele.

## Evidencias

- `reports/auditoria/screenshots/manual-ux-2026-06-25/desktop-01-first-visit.png`
- `reports/auditoria/screenshots/manual-ux-2026-06-25/desktop-02-after-choose-guide.png`
- `reports/auditoria/screenshots/manual-ux-2026-06-25/desktop-surgical-02-blank.png`
- `reports/auditoria/screenshots/manual-ux-2026-06-25/desktop-surgical-03-written.png`
- `reports/auditoria/screenshots/manual-ux-2026-06-25/mobile-01-first-visit.png`
- `reports/auditoria/screenshots/manual-ux-2026-06-25/mobile-02-after-choose-guide.png`
- `reports/auditoria/screenshots/manual-ux-2026-06-25/mobile-03-after-blank.png`

## Achados Priorizados

### P1 — Primeira visita nao oferece "Trazer do celular"

Na primeira visita, o modal oferece `Comecar a escrever` e `Escolher um guia`, com `Continuar de onde parei` apenas se houver trabalho salvo. Nao ha opcao visivel para trazer uma mesa/texto do celular.

Evidencia de codigo:
- `index.html:1447` a `index.html:1451`: CTAs do onboarding.
- `index.html:1544`: botao `Trazer do celular`, mas inicialmente com `display: none`.
- `app.js:2739` a `app.js:2742`: se a chave `vrda-levar-mesa-seen` nao existe, o toast so aparece depois de 3 minutos.

Impacto: quem chegou ao desktop com texto no celular tem que escolher um caminho que nao representa sua intencao. O recurso existe, mas fica escondido ate tarde demais.

Recomendacao: adicionar um terceiro CTA no onboarding: `Trazer do celular`. Em vez de competir visualmente, pode ser secundario abaixo de `Comecar a escrever` e `Escolher um guia`. Tambem incluir o mesmo comando em `Mais` no mobile e na zona de seguranca do `Acervo`.

### P1 — "Levar a mesa" e "Trazer do celular" estao conceitualmente separados

O toast fala `Sua mesa inteira pode ir pro celular` e o link diz `Levar a mesa`. O modal receptor chama `Trazer do celular`. Sao dois sentidos do mesmo recurso, mas aparecem em lugares e momentos diferentes.

Evidencia de codigo:
- `index.html:1676` a `index.html:1691`: toast `Levar a mesa`.
- `index.html:1957` a `index.html:1988`: modal `Trazer do celular`.
- `app.js:2880` a `app.js:2927`: abertura do scanner e tratamento de camera.

Impacto: a pessoa nao forma um modelo claro de "minha mesa pode ir e voltar entre dispositivos". Parece uma dica temporaria, nao uma capacidade central.

Recomendacao: nomear o grupo como `Mesa no celular` ou `Celular` e expor duas acoes persistentes: `Levar para o celular` e `Trazer do celular`. Esse grupo deveria morar no onboarding, em `Mais` e em `Acervo > Copias`.

### P1 — Onboarding deixa foco e interface de fundo competirem

Visualmente, o modal de primeira visita e bonito e direto, mas a interface inteira aparece por tras. No mobile, o dock inferior fica visivel atras/abaixo do modal. O agente tecnico tambem encontrou foco escapando do dialogo via Tab.

Evidencia:
- Screenshot `mobile-01-first-visit.png`: dock visivel enquanto o onboarding esta ativo.
- Relato tecnico: overlay/painel usa dialog, mas o foco pode sair para statusbar/dock/controles atras do overlay.
- `index.html:1493` a `index.html:1495`: create note overlay tem dialog; onboarding deveria seguir o mesmo rigor modal.

Impacto: em primeira visita, a pessoa recebe uma decisao, mas enxerga varias ferramentas atras dela. Para teclado/leitor de tela, o risco e maior: foco fora do contexto ativo.

Recomendacao: prender foco no onboarding, aplicar `aria-modal="true"` no dialogo correto, tornar o restante inert enquanto aberto e esconder/rebaixar dock/statusbar durante o modal.

### P1 — Mobile: comecar a escrever nao termina com a pessoa pronta para digitar

No mobile, depois de `Comecar a escrever`, o texto em branco aparece, mas o agente UX observou que o foco fica no `body`; o teclado/caret nao abre automaticamente. Desktop se comporta melhor.

Impacto: o CTA promete escrita imediata, mas a pessoa ainda precisa descobrir onde tocar. E uma friccao pequena, mas no primeiro minuto pesa.

Recomendacao: apos `acceptTerms("blank")`, focar a area editavel, posicionar caret no primeiro paragrafo e rolar a area para uma posicao confortavel. Se o browser impedir teclado automatico, destacar a area com uma microinteracao e copy curta.

### P1 — Menu explica destinos, mas nao explica o mapa mental

Os nomes principais sao bons isoladamente: `Escrever`, `Palavras`, `Autoria`, `Acervo`, `Atelie`, `Plano`. Ainda assim, "onde moram pagina/fluxo/guia/nota/copia/celular" exige exploracao.

Evidencia de codigo:
- `index.html:157` a `index.html:162`: tabs desktop.
- `index.html:1854` a `index.html:1879`: dock mobile.
- `index.html:1898` a `index.html:1906`: bandeja mobile contem `Plano`, `Copia de seguranca`, `Impressao`; nao contem celular.

Impacto: a navegacao passa nos testes, mas uma pessoa nova pode nao entender que guias ficam em `Atelie`, textos/notas em `Acervo`, modo pagina dentro de `Escrever`, e copia/celular espalhados.

Recomendacao: adicionar um microestado de orientacao apos a primeira escrita, removivel: `Seu texto fica no Acervo. Guias ficam no Atelie. Copias e celular ficam em Mais.` Alternativamente, incluir uma secao `Mesa` dentro de `Mais`.

### P2 — Informacoes de confianca ficam escondidas no acordeao

O acordeao `Como este editor funciona` contem pontos centrais: texto no navegador, sem servidor/IA, risco de limpar navegador, copia de seguranca. Hoje isso fica atras de uma interacao.

Impacto: o Escrevaral tem uma proposta forte de privacidade/offline, mas a primeira tela nao transforma isso em seguranca operacional.

Recomendacao: deixar uma linha sempre visivel no onboarding: `Salvo neste navegador. Sem nuvem. Exporte ou leve sua mesa para nao perder.` O acordeao fica para detalhes.

### P2 — Alvos pequenos e elementos off-canvas merecem revisao

O agente tecnico encontrou alvos abaixo de 24 px em statusbar/toasts/social links e alguns elementos geometricamente fora da viewport, embora sem overflow horizontal efetivo.

Impacto: acessibilidade motora e foco por teclado podem sofrer, especialmente em mobile.

Recomendacao: revisar touch targets de statusbar/toasts e garantir que paineis off-canvas sejam removidos da ordem de foco quando recolhidos.

### P2 — Persistencia precisa de teste manual direcionado

O agente tecnico confirmou gravacao no `localStorage`, mas observou reabertura visual suspeita apos reload em um perfil temporario. Isso pode ser overlay/selecionador de manuscrito, nao necessariamente perda real.

Recomendacao: criar um teste especifico: primeira visita > criar texto > digitar marcador unico > aguardar `SALVO` > reload > confirmar marcador visivel no editor e no acervo.

## Pontos Positivos

- HTTP 200 em producao, `Last-Modified` recente e relatorios automaticos do dia verdes.
- Sem erros de console/rede capturados pelos agentes nos cenarios principais.
- Sem overflow horizontal efetivo nos relatórios mobile de 320/390/430 px.
- Escrita inicial no desktop funciona e o toast de salvamento comunica bem: texto salvo neste navegador, sem internet, sem nuvem.
- O fluxo de escolher guia e visualmente claro em desktop e mobile.
- A arquitetura de acoes por `data-action` facilita inserir `Trazer do celular` em onboarding/menu sem grande refatoracao.

## Ordem Sugerida

1. Colocar `Trazer do celular` no onboarding.
2. Colocar `Celular` ou `Mesa no celular` como acao persistente em `Mais` e `Acervo`.
3. Tratar foco modal/inert no onboarding.
4. Melhorar foco/caret apos `Comecar a escrever` no mobile.
5. Adicionar microorientacao pos-primeira-escrita sobre `Acervo`, `Atelie`, `Mais`.
6. Criar teste manual/automatizado de persistencia apos reload.

## Observacoes De Execucao

O Chromium/Playwright local travou em algumas capturas longas de screenshot e em comandos headless CLI com erro interno de ambiente (`GCM/zygote`). Isso foi tratado como limitacao da bancada, nao como achado do produto. As capturas salvas e a leitura por `curl` da producao foram suficientes para confirmar os principais pontos.
