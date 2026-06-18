# Auditoria Visual e Navegacional - 2026-06-18

**URL base:** https://escrevaral.com  |  **Semaforo:** VERMELHO  |  **P0:** 6 **P1:** 20 **P2:** 78

Execucao: 2026-06-18T13:53:19
Viewports: mobile 390x844, tablet 768x1024, desktop 1366x900
Screenshots: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18` (41 arquivos)

## Prompt remodelado

> Audite o Escrevaral como uma pessoa escritora usando o produto pela primeira vez e depois como usuaria recorrente. Percorra producao em mobile, tablet e desktop; navegue por todos os modulos do app e por todas as URLs do sitemap. Registre qualquer quebra visual, overflow, texto cortado, botao sem resposta, destino escondido, erro de console/rede, rotulo confuso, alvos pequenos, fluxo sem volta ou diferenca grave entre viewports. Separe P0/P1/P2, cite evidencia e screenshot, e nao chame de falha aquilo que for apenas preferencia estetica sem impacto de uso.

## Cobertura

- App principal: tentativa de navegar por `editor`, `biblioteca`, `autoria`, `arquivo`, `academia`, `cronograma` em cada viewport.
- Sitemap: todas as URLs listadas em `sitemap.xml` foram abertas em mobile, tablet e desktop.
- Paginas satelite: controles de navegação, abas e indices visiveis foram acionados quando presentes.

## P0

- **[Visual] overflow horizontal no documento**
  - Evidencia: mobile vereda-titulo-do-livro.html: 435 > 390
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-vereda-titulo-do-livro.html.png`

- **[Visual] overflow horizontal no documento**
  - Evidencia: mobile vereda-primeiras-linhas.html: 480 > 390
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-vereda-primeiras-linhas.html.png`

- **[Visual] overflow horizontal no documento**
  - Evidencia: mobile vereda-biblioteca-escrita.html: 394 > 390
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-vereda-biblioteca-escrita.html.png`

- **[Visual] overflow horizontal no documento**
  - Evidencia: mobile /vereda-biblioteca-escrita.html-Livros: 394 > 390

- **[Visual] overflow horizontal no documento**
  - Evidencia: mobile /vereda-biblioteca-escrita.html-Crit-rios: 395 > 390

- **[Visual] overflow horizontal no documento**
  - Evidencia: mobile /vereda-biblioteca-escrita.html-Sobre: 392 > 390

## P1

- **[Navegacao] Destinos do app sem controle visivel/clicavel neste viewport**
  - Evidencia: mobile: ['cronograma']

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: mobile app-academia: label.academy-tool-tab `language Vocabulário` 271..410
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-academia.png`

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: mobile vereda-biblioteca-escrita.html: div.topbar-tabs `Livros Critérios Sobre` 206..394; button.tab-btn `Sobre` 339..394
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-vereda-biblioteca-escrita.html.png`

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: mobile /vereda-biblioteca-escrita.html-Livros: div.topbar-tabs `Livros Critérios Sobre` 206..394; button.tab-btn `Sobre` 339..394

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: mobile /vereda-biblioteca-escrita.html-Crit-rios: div.topbar-tabs `Livros Critérios Sobre` 206..395; button.tab-btn `Sobre` 339..395

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: desktop app-inicio: div.fmt-group.fmt-group-editorial `Texto corrido Página de envio Leitura confortável Word / ABNT Livro A5 article M` 717..1476; button.fmt-btn.fmt-btn-labeled `Baixar para Word` 1364..1415
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-inicio.png`

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: desktop app-editor: div.fmt-group.fmt-group-editorial `Texto corrido Página de envio Leitura confortável Word / ABNT Livro A5 article M` 784..1542
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-editor.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-inicio: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-inicio.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-editor: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-editor.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-biblioteca: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-biblioteca.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-autoria: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-autoria.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-arquivo: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-arquivo.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-academia: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-academia.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-inicio: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-inicio.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-editor: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-editor.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-biblioteca: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-biblioteca.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-autoria: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-autoria.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-arquivo: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-arquivo.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-academia: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-academia.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-cronograma: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-cronograma.png`

## P2

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-inicio: `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-inicio.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-editor: `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-editor.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-biblioteca: `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-biblioteca.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-autoria: `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-autoria.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-arquivo: `Fixar nota` 12x12; `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-arquivo.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-academia: `arrow_back Continuar com o texto atual` 197x18; `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-academia.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-inicio: `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14; `Definir meta de palavras` 21x15
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-inicio.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-editor: `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14; `Definir meta de palavras` 21x15
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-editor.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-biblioteca: `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14; `Definir meta de palavras` 21x15
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-biblioteca.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-autoria: `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14; `Definir meta de palavras` 21x15
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-autoria.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-arquivo: `Fixar nota` 12x12; `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-arquivo.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-academia: `arrow_back Continuar com o texto atual` 197x18; `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-academia.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-cronograma: `Jul` 28x32; `add Tarefa` 72x26; `add Nota` 64x26; `add Tarefa` 72x26; `add Nota` 64x26; `+ planejar` 75x26
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-cronograma.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet anatomia-do-livro.html: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-anatomia-do-livro.html.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Capa: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Lombada: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Contracapa: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Orelha-frente: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Orelha-verso: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Sobrecapa: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Cinta: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Falsa-folha-de-rosto: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Folha-de-rosto: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Cr-ditos-ficha: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Dedicat-ria: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Ep-grafe: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Sum-rio: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Pref-cio: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Pr-logo: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Partes-e-cap-tulos: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Ep-logo: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet /anatomia-do-livro.html-Posf-cio: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 167x25; `Lombada` 167x25; `Contracapa` 167x25; `Orelha (frente)` 167x25

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop app-inicio: `Novo texto` 22x22; `Recolher fichas` 220x23; `Nova ficha: Personagem` 99x20; `Nova ficha: Mundo` 71x20; `Nova ficha: Lugar` 63x20; `Nova ficha: Cronologia` 92x20
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-inicio.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop app-editor: `Novo texto` 22x22; `Recolher fichas` 220x23; `Nova ficha: Personagem` 99x20; `Nova ficha: Mundo` 71x20; `Nova ficha: Lugar` 63x20; `Nova ficha: Cronologia` 92x20
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-editor.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop app-biblioteca: `Novo texto` 22x22; `Recolher fichas` 220x23; `Nova ficha: Personagem` 99x20; `Nova ficha: Mundo` 71x20; `Nova ficha: Lugar` 63x20; `Nova ficha: Cronologia` 92x20
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-biblioteca.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop app-autoria: `Novo texto` 22x22; `Recolher fichas` 220x23; `Nova ficha: Personagem` 99x20; `Nova ficha: Mundo` 71x20; `Nova ficha: Lugar` 63x20; `Nova ficha: Cronologia` 92x20
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-autoria.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop app-arquivo: `Novo texto` 22x22; `Recolher fichas` 220x23; `Nova ficha: Personagem` 99x20; `Nova ficha: Mundo` 71x20; `Nova ficha: Lugar` 63x20; `Nova ficha: Cronologia` 92x20
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-arquivo.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop app-academia: `Novo texto` 22x22; `Recolher fichas` 220x23; `Nova ficha: Personagem` 99x20; `Nova ficha: Mundo` 71x20; `Nova ficha: Lugar` 63x20; `Nova ficha: Cronologia` 92x20
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-academia.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop app-cronograma: `Novo texto` 22x22; `Recolher fichas` 220x23; `Nova ficha: Personagem` 99x20; `Nova ficha: Mundo` 71x20; `Nova ficha: Lugar` 63x20; `Nova ficha: Cronologia` 92x20
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-cronograma.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop anatomia-do-livro.html: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-anatomia-do-livro.html.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Capa: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Lombada: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Contracapa: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Orelha-frente: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Orelha-verso: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Sobrecapa: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Cinta: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Falsa-folha-de-rosto: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Folha-de-rosto: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Cr-ditos-ficha: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Dedicat-ria: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Ep-grafe: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Sum-rio: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Pref-cio: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Pr-logo: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Partes-e-cap-tulos: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Ep-logo: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: desktop /anatomia-do-livro.html-Posf-cio: `/ ESCREVARAL` 107x23; `← voltar ao editor` 97x16; `Capa` 177x26; `Lombada` 177x26; `Contracapa` 177x26; `Orelha (frente)` 177x26

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-inicio: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-inicio.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-editor: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-editor.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-biblioteca: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-biblioteca.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-autoria: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-autoria.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-arquivo: div `` 390x844; aside.archive-detail-panel `touch_app Selecione uma nota para ver e editar os detalhes Auditoria visual manu` 320x981
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-arquivo.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-academia: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/mobile-app-academia.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-inicio: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-inicio.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-editor: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-editor.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-biblioteca: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-biblioteca.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-autoria: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-autoria.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-arquivo: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-arquivo.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-academia: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-academia.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-cronograma: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/tablet-app-cronograma.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: desktop app-inicio: div `` 1366x900
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-inicio.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: desktop app-editor: div `` 1366x900
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-editor.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: desktop app-biblioteca: div `` 1366x900
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-biblioteca.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: desktop app-autoria: div `` 1366x900
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-autoria.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: desktop app-arquivo: div `` 1366x900
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-arquivo.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: desktop app-academia: div `` 1366x900
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-academia.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: desktop app-cronograma: div `` 1366x900
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-18/desktop-app-cronograma.png`

## Interacoes em paginas satelite

| URL | Viewport | Controles visiveis | Controles testados |
|---|---:|---:|---:|
| https://escrevaral.com/vereda-titulo-do-livro.html | mobile | 0 | 0 |
| https://escrevaral.com/vereda-primeiras-linhas.html | mobile | 0 | 0 |
| https://escrevaral.com/vereda-revisao-manuscrito.html | mobile | 0 | 0 |
| https://escrevaral.com/vereda-bloqueio-criativo.html | mobile | 0 | 0 |
| https://escrevaral.com/vereda-biblioteca-escrita.html | mobile | 3 | 3 |
| https://escrevaral.com/anatomia-do-livro.html | mobile | 0 | 0 |
| https://escrevaral.com/privacidade.html | mobile | 0 | 0 |
| https://escrevaral.com/vereda-titulo-do-livro.html | tablet | 0 | 0 |
| https://escrevaral.com/vereda-primeiras-linhas.html | tablet | 0 | 0 |
| https://escrevaral.com/vereda-revisao-manuscrito.html | tablet | 0 | 0 |
| https://escrevaral.com/vereda-bloqueio-criativo.html | tablet | 0 | 0 |
| https://escrevaral.com/vereda-biblioteca-escrita.html | tablet | 3 | 3 |
| https://escrevaral.com/anatomia-do-livro.html | tablet | 23 | 18 |
| https://escrevaral.com/privacidade.html | tablet | 0 | 0 |
| https://escrevaral.com/vereda-titulo-do-livro.html | desktop | 0 | 0 |
| https://escrevaral.com/vereda-primeiras-linhas.html | desktop | 0 | 0 |
| https://escrevaral.com/vereda-revisao-manuscrito.html | desktop | 0 | 0 |
| https://escrevaral.com/vereda-bloqueio-criativo.html | desktop | 0 | 0 |
| https://escrevaral.com/vereda-biblioteca-escrita.html | desktop | 3 | 3 |
| https://escrevaral.com/anatomia-do-livro.html | desktop | 19 | 18 |
| https://escrevaral.com/privacidade.html | desktop | 0 | 0 |

## Comando

```bash
python3 scripts/auditor-navegacao-visual.py
```
