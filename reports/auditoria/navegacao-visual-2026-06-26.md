# Auditoria Visual e Navegacional - 2026-06-26

**URL base:** http://127.0.0.1:8801  |  **Semaforo:** VERMELHO  |  **P0:** 2 **P1:** 18 **P2:** 30

Execucao: 2026-06-26T12:09:49  
Viewports: mobile 390x844, tablet 768x1024, desktop 1366x900  
Screenshots: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26` (25 arquivos)

## Prompt remodelado

> Audite o Escrevaral como uma pessoa escritora usando o produto pela primeira vez e depois como usuaria recorrente. Percorra producao em mobile, tablet e desktop; navegue por todos os modulos do app e por todas as URLs do sitemap. Registre qualquer quebra visual, overflow, texto cortado, botao sem resposta, destino escondido, erro de console/rede, rotulo confuso, alvos pequenos, fluxo sem volta ou diferenca grave entre viewports. Separe P0/P1/P2, cite evidencia e screenshot, e nao chame de falha aquilo que for apenas preferencia estetica sem impacto de uso.

## Cobertura

- App principal: tentativa de navegar por `editor`, `biblioteca`, `autoria`, `arquivo`, `academia`, `cronograma` em cada viewport.
- Sitemap: todas as URLs listadas em `sitemap.xml` foram abertas em mobile, tablet e desktop.
- Paginas satelite: controles de navegação, abas e indices visiveis foram acionados quando presentes.

## P0

- **[Console] console.error durante navegacao**
  - Evidencia: Failed to load resource: the server responded with a status of 503 (Offline)

- **[Console] excecao JS nao tratada**
  - Evidencia: Falha geral no viewport desktop: Page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:8801/
Call log:
  - navigating to "http://127.0.0.1:8801/", waiting until "domcontentloaded"


## P1

- **[Navegacao] Destinos do app sem controle visivel/clicavel neste viewport**
  - Evidencia: mobile: ['autoria', 'arquivo', 'academia']

- **[Rede] erro de rede/HTTP durante navegacao**
  - Evidencia: http-503 http://127.0.0.1:8801/criterios-data.js

- **[Rede] erro de rede/HTTP durante navegacao**
  - Evidencia: requestfailed http://127.0.0.1:8801/criterios-data.js

- **[Rede] erro de rede/HTTP durante navegacao**
  - Evidencia: requestfailed http://127.0.0.1:8801/

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: mobile vereda-biblioteca-escrita.html: button.tab-btn `Sobre` 350..406
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-vereda-biblioteca-escrita.html.png`

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: mobile /vereda-biblioteca-escrita.html-Livros: button.tab-btn `Sobre` 350..406

- **[Visual] elementos visiveis escapam lateralmente**
  - Evidencia: mobile /vereda-biblioteca-escrita.html-Crit-rios: button.tab-btn `Sobre` 350..406

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-inicio: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-inicio.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-editor: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-editor.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-biblioteca: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-biblioteca.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: mobile app-cronograma: span `17 palavras · 1 parágrafos · 100 car.`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-cronograma.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-inicio: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-inicio.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-editor: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-editor.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-biblioteca: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-biblioteca.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-autoria: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-autoria.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-arquivo: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-arquivo.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-academia: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-academia.png`

- **[Visual] texto possivelmente cortado por container**
  - Evidencia: tablet app-cronograma: span `17 palavras · 1 parágrafos · 100 car.`; span.statusbar-copyright `© 2026 Escrevaral`
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-cronograma.png`

## P2

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-inicio: `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-inicio.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-editor: `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-editor.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-biblioteca: `Alterar meta` 71x14; `Definir meta de palavras` 21x15; `Iniciar temporizador` 14x14; `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-biblioteca.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: mobile app-cronograma: `Jan` 27x32; `Fev` 27x32; `Mar` 28x32; `Abr` 26x32; `Mai` 27x32; `Jun` 27x32
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-cronograma.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-inicio: `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14; `Definir meta de palavras` 21x15
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-inicio.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-editor: `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14; `Definir meta de palavras` 21x15
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-editor.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-biblioteca: `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14; `Definir meta de palavras` 21x15
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-biblioteca.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-autoria: `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14; `Definir meta de palavras` 21x15
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-autoria.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-arquivo: `Fixar nota` 12x12; `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-arquivo.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-academia: `arrow_back Continuar com o texto atual` 197x18; `Escrevaral no X` 19x22; `Escrevaral no Bolha.us` 19x22; `Escrevaral no Bluesky` 19x22; `Escrever para oi@escrevaral.com` 19x22; `Alterar meta` 71x14
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-academia.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet app-cronograma: `Jul` 28x32; `add Tarefa` 72x26; `add Nota` 64x26; `add Tarefa` 72x26; `add Nota` 64x26; `+ planejar` 75x26
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-cronograma.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet vereda-titulo-do-livro.html: `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18; `Levar a mesa` 85x19; `Fechar` 16x22; `Fechar` 16x22
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-vereda-titulo-do-livro.html.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet vereda-primeiras-linhas.html: `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18; `Levar a mesa` 85x19; `Fechar` 16x22; `Fechar` 16x22
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-vereda-primeiras-linhas.html.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet vereda-revisao-manuscrito.html: `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18; `Levar a mesa` 85x19; `Fechar` 16x22; `Fechar` 16x22
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-vereda-revisao-manuscrito.html.png`

- **[Usabilidade] muitos alvos clicaveis abaixo de 32px**
  - Evidencia: tablet vereda-bloqueio-criativo.html: `Ateliê` 39x19; `Fechar dica` 16x22; `Desfazer` 57x18; `Levar a mesa` 85x19; `Fechar` 16x22; `Fechar` 16x22
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-vereda-bloqueio-criativo.html.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-inicio: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-inicio.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-editor: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-editor.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-biblioteca: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-biblioteca.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: mobile app-cronograma: div `` 390x844
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/mobile-app-cronograma.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-inicio: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-inicio.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-editor: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-editor.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-biblioteca: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-biblioteca.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-autoria: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-autoria.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-arquivo: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-arquivo.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-academia: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-academia.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet app-cronograma: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-app-cronograma.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet vereda-titulo-do-livro.html: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-vereda-titulo-do-livro.html.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet vereda-primeiras-linhas.html: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-vereda-primeiras-linhas.html.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet vereda-revisao-manuscrito.html: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-vereda-revisao-manuscrito.html.png`

- **[Visual] camada fixa grande cobrindo viewport**
  - Evidencia: tablet vereda-bloqueio-criativo.html: div `` 768x1024
  - Screenshot: `/home/rafamass/escrevaral/reports/auditoria/screenshots/navegacao-visual-2026-06-26/tablet-vereda-bloqueio-criativo.html.png`

## Interacoes em paginas satelite

| URL | Viewport | Controles visiveis | Controles testados |
|---|---:|---:|---:|
| http://127.0.0.1:8801/vereda-titulo-do-livro.html | mobile | 0 | 0 |
| http://127.0.0.1:8801/vereda-primeiras-linhas.html | mobile | 0 | 0 |
| http://127.0.0.1:8801/vereda-revisao-manuscrito.html | mobile | 0 | 0 |
| http://127.0.0.1:8801/vereda-bloqueio-criativo.html | mobile | 0 | 0 |
| http://127.0.0.1:8801/vereda-biblioteca-escrita.html | mobile | 3 | 3 |
| http://127.0.0.1:8801/anatomia-do-livro.html | mobile | 0 | 0 |
| http://127.0.0.1:8801/privacidade.html | mobile | 0 | 0 |
| http://127.0.0.1:8801/vereda-titulo-do-livro.html | tablet | 6 | 0 |
| http://127.0.0.1:8801/vereda-primeiras-linhas.html | tablet | 6 | 0 |
| http://127.0.0.1:8801/vereda-revisao-manuscrito.html | tablet | 6 | 0 |
| http://127.0.0.1:8801/vereda-bloqueio-criativo.html | tablet | 6 | 0 |
| http://127.0.0.1:8801/vereda-biblioteca-escrita.html | tablet | 3 | 3 |
| http://127.0.0.1:8801/anatomia-do-livro.html | tablet | 3 | 3 |
| http://127.0.0.1:8801/privacidade.html | tablet | 3 | 3 |

## Comando

```bash
python3 scripts/auditor-navegacao-visual.py
```

