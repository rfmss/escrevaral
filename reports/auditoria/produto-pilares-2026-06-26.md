# Auditoria Produto/Pilares — 2026-06-26

**Escopo:** entrada, navegacao pelos pilares, inflacao de paginas, pontos provaveis de saida.  
**Base local:** `http://127.0.0.1:8801` com workspace atual.  
**Metodo:** leitura de personas, leitura de HTML/CSS/JS, auditores Playwright, screenshots do onboarding bento e relatorios automaticos recentes.

## Resumo executivo

O rumo do bento de entrada esta certo: ele comunica pilares de produto em vez de slogans genericos. Mas o estado local atual tem uma falha objetiva: o card principal mostra `Mesa de escrita` e `Continuar` ao mesmo tempo. Para Lucas, isso vira dupla decisao no primeiro toque; para Fernanda, parece texto demais; para Beatriz, quebra a confianca inicial.

O segundo problema maior e organizacional: o Atelie concentra ferramentas, guias, biblioteca, treino, leitura editorial, direitos, publicacao e anatomia do livro no mesmo fluxo vertical. A tela funciona tecnicamente, mas vira varias paginas escondidas em uma. Quem chega sem mapa mental pode sair mesmo sem encontrar bug.

## Evidencias geradas

- `reports/auditoria/screenshots/onboarding-bento-2026-06-26/mobile-320.png`
- `reports/auditoria/screenshots/onboarding-bento-2026-06-26/mobile-390.png`
- `reports/auditoria/screenshots/onboarding-bento-2026-06-26/desktop.png`
- `reports/auditoria/navegacao-visual-2026-06-26.md`
- `reports/auditoria/overflow-mobile-2026-06-26.md`
- `reports/auditoria/privacidade-rede-2026-06-26.md`
- `reports/auditoria/publicacao-offline-2026-06-26.md`

## Achados prioritarios

### P1 — Bento mostra dois estados do card principal

Evidencia: screenshots do onboarding mostram `Mesa de escrita` e `Continuar` visiveis juntos no mesmo card.

Provavel causa: `.ob-pillar-body { display: flex; }` sobrescreve o atributo `hidden`. O JS alterna `hidden`, mas o CSS volta a exibir o bloco.

Impacto por persona:
- Lucas ve quatro acoes aparentes no primeiro contato e pode sair.
- Fernanda perde a leitura rapida da tela.
- Beatriz percebe o produto como menos polido logo na entrada.

Correcao minima proposta:

```css
.ob-pillar-body[hidden] {
  display: none;
}
```

Depois disso, revalidar 320/390/desktop e foco inicial.

### P1 — Atelie esta inflado e com muitos modelos mentais na mesma pagina

Evidencia de estrutura: `index.html` concentra no mesmo `data-view-panel="academia"`:
- banner do Atelie;
- ferramentas: Espelho, RimaLab, Vocabulário, Leituras, Treino;
- Guias de escrita;
- Leitura editorial;
- Direitos do Autor;
- Trilha de publicacao;
- iframe de Anatomia do Livro.

Impacto por persona:
- Fernanda quer ENEM rapido; pode passar por ferramentas que nao entende antes de achar o guia.
- Beatriz explora, mas encontra muitas camadas sem uma narrativa de prioridade.
- Claudio procura estrutura profissional; o Atelie mistura estudo, ferramenta e publicacao, dificultando encontrar o que e fluxo de trabalho.

Proposta:
- Transformar Atelie em hub de 3 entradas persistentes: `Revisar`, `Guias`, `Publicar`.
- Cada entrada abre uma superficie propria ou subestado claro, em vez de uma pagina longa.
- Manter `Guias` como rota forte para Fernanda e Ana.

### P1 — O pilar "Mesa no celular" aparece como argumento, mas a capacidade continua escondida

Evidencia: onboarding novo cita `Mesa no celular`, mas o fluxo real ainda vive no toast `Levar a mesa`, no modal `Trazer do celular` e em um anchor visualmente separado.

Impacto:
- O card promete ida e volta, mas a pessoa nao encontra esse pilar de novo quando precisa.
- Na primeira auditoria manual, celular ja apareceu como P1 de descoberta.

Proposta:
- No onboarding, manter o card informativo sem CTA.
- Dentro do app, criar um destino persistente `Mesa no celular` em `Mais` e em `Acervo > Copias`.
- Unificar copy: `Mesa no celular`, com acoes `Levar para o celular` e `Trazer do celular`.

### P1 — Navegacao mobile ainda compete com o proprio onboarding

Evidencia: screenshot mobile do bento mostra dock inferior visivel atras/abaixo do modal. O relatorio visual tambem aponta destinos mobile nao detectados/clicaveis em algumas passagens.

Impacto:
- Para primeira visita, o dock cria a sensacao de que ha mais decisoes abertas do que deveria.
- Para teclado/leitor de tela, aumenta o risco de foco fora do dialogo.

Proposta:
- Enquanto `terms-overlay` estiver aberto, rebaixar dock/statusbar visualmente e prender foco no dialogo.
- Auditar `inert`/ordem de foco no overlay.

### P2 — Layout mobile sem overflow global, mas com texto e alvos comprimidos

Evidencia:
- `overflow-mobile-2026-06-26`: sem violacao em quase todos os cenarios; erro isolado em 320 na tela inicial.
- `navegacao-visual-2026-06-26`: status de palavras cortado, alvos pequenos em statusbar, dock, cronograma e paginas satelite.

Impacto:
- Nao parece quebrar a pagina inteira, mas cria atrito repetido.
- Lucas nao usa hover/tooltips e depende de alvos claros.

Proposta:
- Reduzir informacao persistente no statusbar mobile.
- Agrupar metas/temporizador em um unico controle tocavel.
- Aumentar alvos de fechar/toast/social para pelo menos 32px.

### P2 — Paginas editoriais satelite ainda escapam em tabs

Evidencia: `vereda-biblioteca-escrita.html` mostra a aba `Sobre` escapando lateralmente em mobile.

Impacto:
- A pessoa entra por conteudo editorial e encontra uma quebra visual antes de chegar ao app.

Proposta:
- Tabs horizontais com scroll contido e padding final.
- Ou converter as tabs para select/segmented control responsivo em 390px.

### P2 — Offline e privacidade seguem bons, mas ha divida de headers/cache

Evidencia:
- Publicacao/offline: P0=0, P1=0, P2=5.
- Privacidade/rede: canario nao vazou; CSP ausente segue P1.

Proposta:
- Decidir se paginas editoriais entram no cache inicial.
- Adicionar CSP/headers via Cloudflare se nao quebrar GitHub Pages.
- Manter Google Fonts como risco aceito ou migrar fontes criticas para local.

## Fila recomendada

1. Corrigir `hidden` do bento e revalidar screenshots 320/390/desktop.
2. Esconder/rebaixar dock durante onboarding e validar foco modal.
3. Criar `Mesa no celular` persistente em `Mais` e `Acervo`.
4. Redesenhar Atelie como hub de 3 entradas: `Revisar`, `Guias`, `Publicar`.
5. Enxugar statusbar/mobile e corrigir alvos pequenos recorrentes.
6. Corrigir tabs de `vereda-biblioteca-escrita.html` em mobile.
7. Planejar headers de seguranca e cache offline das paginas editoriais.

## Regra nova para auditoria continua

Quando uma persona sair, registrar:

- **Quem saiu:** Lucas, Fernanda, Beatriz, Claudio, Arnaldo ou Auditor UX.
- **Onde saiu:** tela, card, modulo, trecho ou acao.
- **Por que saiu:** excesso de decisao, termo opaco, promessa sem caminho, quebra visual, falta de confianca ou erro tecnico.
- **Menor proposta:** uma mudanca pequena antes de propor redesign amplo.

Aplicacao imediata:
- Lucas sai no bento duplicado.
- Fernanda sai se `Guias/ENEM` ficar soterrado no Atelie.
- Beatriz sai quando a interface parece painel de demonstracao, nao mesa preparada.
- Claudio sai se estrutura profissional continuar espalhada entre Acervo, Plano e Publicacao sem mapa.
