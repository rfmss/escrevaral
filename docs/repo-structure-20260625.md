# Estrutura do repositório — 2026-06-25

Snapshot gerado após v797 / pegar-v4. Arquivos de relatório, livros e snapshots omitidos por volume.

## Raiz

| Arquivo | Papel |
|---|---|
| `index.html` | Entrada única do app — importa todos os CSS e JS |
| `app.js` | Orquestrador principal — eventos, ações, renderização |
| `state-store.js` | Estado global + persistência em localStorage |
| `styles.css` | Ponto de entrada CSS — `@import css/*.css` |
| `service-worker.js` | Cache offline do app principal (vereda-offline-vN) |
| `manifest.webmanifest` | PWA do app principal |
| `sitemap.xml` | SEO |
| `robots.txt` | Crawlers |
| `CNAME` | GitHub Pages → escrevaral.com |
| `privacidade.html` | Página de privacidade |
| `anatomia-do-livro.html` | Visualizador interativo standalone (Academia) |

## CSS (`css/`)

| Arquivo | Conteúdo |
|---|---|
| `00-tokens.css` | Variáveis de design (cores, espaçamento, tipografia) |
| `01-base.css` | Reset e elementos base |
| `02-shell-navigation.css` | Shell, navegação, abas |
| `03-editor-layout.css` | Layout do editor (split, paper, stage) |
| `03-editor-modes.css` | Estilos dos modos de editor |
| `03-editor-toolbar.css` | Toolbar do editor |
| `03-guide-reference.css` | Guia de escrita e referência |
| `03-inspector-precision.css` | Olhar do texto / precisão |
| `03-writing-area.css` | Área de escrita |
| `04-analysis-academy.css` | Painel de análise e Academia |
| `04-cronograma.css` | Cronograma / planner |
| `05-archive.css` | Acervo |
| `06-academy-tools.css` | Ferramentas da Academia |
| `07-enem.css` | Modo ENEM |
| `08-responsive.css` | Responsividade (mobile, tablet, TV) |
| `09-print.css` | Impressão |
| `10-mobile-nav.css` | Navegação mobile |
| `11-badges.css` | Badges e conquistas |
| `12-training-modes.css` | Modos de treino (Bancada) |

## Engines de linguagem (carregam antes de app.js)

```
syntax-engine.js → punctuation-engine.js → analise-engine.js
lexical-engine.js · rimalab-engine.js · voice-engine.js
decolonial-engine.js · precision-engine.js · proof-engine.js
```

## Controllers

| Arquivo | Responsabilidade |
|---|---|
| `academia-controller.js` | Academia (Ateliê) |
| `archive-controller.js` | Acervo — CRUD de manuscritos |
| `backup-controller.js` | Cópia de segurança (.esc), import/export |
| `editor-controller.js` | Editor principal |
| `editor-modes.js` | Modos especializados de escrita |
| `grammar-controller.js` | Painel de gramática |
| `pomodoro-controller.js` | Temporizador |
| `cronograma-controller.js` | Planner / cronograma |
| `proof-controller.js` | Prova de autoria |
| `reader-controller.js` | Modo leitura |
| `syntax-controller.js` | Painel de sintaxe |
| `tooltip-controller.js` | Sistema de dicas (clone próprio, sem title nativo) |
| `training-controller.js` | Modos de treino (Bancada) |

## Engines de suporte

| Arquivo | Papel |
|---|---|
| `backup-engine.js` | Lógica de criação e leitura de .esc |
| `vrda-engine.js` | Envelope/checksum do formato .esc (FNV1a) |
| `archive-engine.js` | Normalização de manuscritos |
| `document-engine.js` | Estrutura de documento |
| `export-engine.js` | Exportação (DOCX, TXT, etc.) |
| `version-engine.js` | Histórico de versões |
| `filesystem-backup-engine.js` | Cópia automática via File System Access API |
| `pagination-engine.js` | Modo página |
| `print-engine.js` | Impressão |
| `rights-engine.js` | Direitos autorais / prova |
| `typewriter-engine.js` | Som de máquina de escrever |
| `badges-engine.js` | Sistema de conquistas |
| `combo-detector.js` | Detecção de combos de escrita |
| `ui-dialog.js` | Diálogos e modais |

## Modos especiais

| Arquivo | Modo |
|---|---|
| `deriva-mode.js` | Modo Deriva (escrita livre) |
| `perseguicao-mode.js` | Modo Perseguição |

## Dados JSON

| Arquivo | Conteúdo |
|---|---|
| `syntax-data.json` | Dados de sintaxe |
| `lexical-data.json` | Léxico / dicionário interno |
| `rimalab-data.json` | RimaLab (rimas e sonoridade) |
| `analise-data.json` | Análise literária |
| `decolonial-data.json` | Engine decolonial |
| `norma-data.json` | Norma gramatical (adjetivos, verbos, homógrafos) |
| `templates-data.json` | 63 guias de escrita calibrados — não alterar sem pedido |
| `criterios-data.js` | Critérios de análise |
| `synonym-data.js` | Índice de sinônimos (aponta para `synonyms/`) |
| `quotes-data.js` | Citações literárias |

## `synonyms/`

Arquivos JSON por letra (a.json … z.json + acentuadas) + `index.json`. ~1053 entradas calibradas.

## `pegar/` — Mesa Portátil (PWA standalone)

| Arquivo | Papel |
|---|---|
| `index.html` | App completo — 4 telas (aguardando/lendo/feito/enviando) |
| `manifest.json` | PWA "Mesa Portátil", scope `/pegar/` |
| `sw.js` | Service worker próprio (escrevaral-pegar-v4) — só apaga caches `escrevaral-pegar-*` |
| `jsqr.min.js` | Leitor QR (fallback para BarcodeDetector) |
| `lz-string.min.js` | Compressão LZString |
| `qrcode.min.js` | Gerador QR (para modo emissor do celular) |

**Fluxos:**
- Receber do PC: câmera lê QR streaming (BarcodeDetector ou jsQR)
- Enviar para PC: exibe QR stream (qrcode.min.js), webcam do PC lê via modal 📡
- Import .esc: abre arquivo, valida checksum FNV1a, escreve `vereda.manuscripts.v1`
- Export .esc: lê localStorage, monta envelope, baixa arquivo

## Scripts de automação (`scripts/`)

| Script | Função |
|---|---|
| `auditor-console-errors.py` | Detecta erros de console em produção |
| `auditor-dados.py` | Audita dados linguísticos |
| `auditor-overflow-mobile.py` | Mede scrollWidth > clientWidth em 320/390/430px |
| `auditor-privacidade-rede.py` | Verifica chamadas de rede externas |
| `auditor-publicacao.py` | Smoke test de publicação (200/SW/manifest) |
| `auditor-navegacao-visual.py` | Auditoria visual de navegação |
| `auditoria-pilares.py` | Verifica pilares de produto (PT-BR, offline, etc.) |
| `teste-master.py` | Orquestra todos os auditores |
| `smoke-live.py` | Smoke rápido em produção |
| `banca.py` | Banca coordenadora de agentes |
| `comparar-golden.py` / `gerar-golden.py` | Guarda de regressão |
| `agent-sentinel*.py/sh` | Sentinel de agentes autônomos |
| `check-version-bump.sh` | Valida bump de versão antes de commit |

## `docs/`

| Pasta/Arquivo | Conteúdo |
|---|---|
| `_campanhas/MARCA_CANAIS.md` | Marca, canais sociais, voz, proteção legal |
| `_campanhas/CAMPANHA.md` | Posicionamento, taglines, roteiros |
| `_campanhas/BIOS_REDES.md` | Bios para redes sociais |
| `_campanhas/LEVAR-A-MESA.md` | Pilar Mesa Portátil — manifesto, ciclo completo, arquitetura |
| `_decisoes/DOMINIO_DNS_EMAIL.md` | Domínio, Cloudflare, DNS, e-mail |
| `_decisoes/MAPA_ICONES_METAFORAS.md` | Metáforas visuais — referência obrigatória para ícones |
| `_decisoes/AUDITORIA_ROUND1_*.md` | Responsividade, bordas, guia de escrita |
| `_decisoes/ANALITICAS_GOATCOUNTER.md` | GoatCounter — decisão e configuração |
| `_decisoes/AGENCIA_CONTINUIDADE_*.md` | Estado de pílulas e continuidade de agentes |
| `MANUAL_DE_CONTINUIDADE.md` | Manual geral de continuidade do projeto |
| `repo-structure-20260625.md` | Este arquivo |

## `personas/`

README com personas ativas de testadoras (sala-de-espera) e equipe QG.

## Raízes legadas (não alterar)

- `dark-ensaio/` — protótipo de tema escuro, arquivo histórico
- `docs/_legado/` — páginas HTML do Vereda original
- `vereda-*.html` — páginas standalone legadas (não integradas ao app)
