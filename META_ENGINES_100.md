# Meta Vereda 100% — Engines e Verificacao

Este arquivo deve ser lido no inicio de toda sessao de desenvolvimento do Vereda.

Objetivo: manter no radar a meta de levar cada engine a 100% de maturidade, por etapas, sem trocar clareza de produto por excesso tecnico.

Frase-guia:

> Tudo existe desde o começo; cada coisa no seu lugar, nada invade antes da hora.

## Pilar transversal: portugues brasileiro integral

Toda interface visivel do Vereda deve estar em portugues brasileiro. Nenhum motor chega a 100% se depender de estrangeirismo para se explicar.

Regra de produto:

- Falar primeiro com escritor, depois com tecnico.
- Usar beneficio humano na tela principal.
- Guardar mecanismo tecnico para detalhes, ajuda, exportacao tecnica ou documentacao.
- Trocar estrangeirismos visiveis por palavras brasileiras: copia de seguranca, salvamento automatico, sem internet, guia da forma, olhar do texto, situacao, janela, dica, baixar, trazer arquivo, assinatura do texto.

Evidencia de maturidade:

- Uma escritora entende a promessa sem saber ingles tecnico.
- A tela nao usa backup, autosave, offline, toggle, blueprint, template, inspector, precision, status, modal, tooltip, upload, download, hash, cache ou browser como copy visivel.
- O tom continua claro, adulto e simpatico; nao vira explicacao infantil.

## Pilar transversal: escrita movel com teclado fisico

O Escrevaral precisa funcionar como oficina portatil. Tablet ou celular com teclado fisico conectado e um cenario natural de escrita longa.

Regra de produto:

- Navegar ou abrir manuscritos em dispositivo touch nao deve forcar teclado virtual quando a pessoa pode querer apenas ler.
- Quando houver sinal progressivo de teclado fisico, o editor pode receber foco automaticamente como no desktop.
- A experiencia deve ser silenciosa: sem painel novo, sem configuracao obrigatoria, sem promessa de deteccao perfeita.
- Focos exigidos por comandos de edicao, substituicao ou formatacao podem permanecer.

Evidencia de maturidade:

- Celular/tablet sem teclado fisico: abrir manuscrito pelo acervo nao levanta teclado virtual de modo agressivo.
- Tablet/celular com teclado fisico: depois do primeiro sinal de tecla fisica, a escrita segue fluida, sem passos extras.
- Desktop continua com foco rapido no editor.

## Protocolo de abertura

Ao abrir o projeto, antes de propor alteracoes:

1. Ler este arquivo junto com `CLAUDE.md`.
2. Identificar se a tarefa atual toca protecao, preservacao, edicao, revisao, verificacao ou oficio.
3. Declarar qual engine sera beneficiada.
4. Propor o menor passo que aumenta maturidade sem inflar a interface.
5. Se a tarefa nao mover nenhuma engine em direcao a 100%, dizer isso explicitamente.

Pergunta padrao da sessao:

> Qual engine vamos aproximar de 100% hoje, e por qual evidencia?

## Regua de maturidade

- 0%: ideia solta, sem implementacao.
- 25%: prototipo funcional, sem integracao confiavel.
- 50%: funciona em fluxo feliz, mas quebra em bordas comuns.
- 70%: usavel em produto, com promessa limitada e linguagem cuidadosa.
- 85%: confiavel para uso recorrente, com estados vazios, erro, importacao/exportacao e QA responsivo.
- 95%: robusto, testado em cenarios reais, com copy clara e falhas previsiveis.
- 100%: pode ser prometido publicamente sem ressalva escondida.

100% nao significa complexidade maxima. Significa: promessa certa, comportamento consistente, UX limpa, dados preservados e limites honestos.

## Abertura da próxima sessão — pontos de atenção registrados em 2026-05-25

**Baseline:** `bb1c789` — paginação 85%, concordância de import, modo páginas mobile corrigido.

**Candidatas a avançar (por impacto e custo):**

1. **Offline / PWA → 85%** (está em 82%): revisar mensagens de erro do SW em cenários de rede intermitente; testar banner de atualização em Playwright após novo deploy.
2. **RimaLab → 85%** (está em 82%): identificar os gaps que impedem o salto — provavelmente estados vazios, erro de entrada ou esquemas ainda sem cobertura.
3. **Qualquer engine em 85% → 95%**: escolher uma e levar a confiável-para-produto — candidatas: Versionamento, Exportação/impressão, Arquivo/acervo.

**Backlog técnico registrado (não implementar sem pedido):**
- `vrda-engine.js`: importação assistida de `.vrda` legado — decisão de produto, não bug.
- `pagination-engine.js`: contador de palavras por página no modo páginas — aparece na tabela como promessa, não verificado via Playwright ainda.

## Estado em 2026-05-25

| Area / engine | Maturidade | Promessa atual |
|---|---:|---|
| Prova de autoria | 85% | Protecao local + carimbo de anterioridade via OpenTimestamps |
| Validacao da prova | 85% | Historico de sessoes vísivel; formato v1/v2 distinguidos; duracao de sessao |
| `.esc` / envelope nativo | 85% | Erros humanizados: JSON corrompido, tipo errado (prova vs acervo), versao futura, checksum invalido |
| Backup / restore | 85% | Feedback de importacao com contagem; exportacao com tamanho em KB |
| Backup externo via File System | 85% | Erros humanizados; estado sem suporte; arquivo escrevaral-acervo; ciclo exportar/importar validado |
| Versionamento | 85% | Previa de texto nas versoes; contador X/20 versoes guardadas |
| Offline / PWA | 82% | Banner de atualizacao com botao; mensagens de erro claras |
| Editor / documento | 85% | Densidade lexical no inspector; contagem de caracteres; estado vazio diferenciado |
| Paginacao / modo pagina | 85% | Print preset-aware (A5 imprime A5); contador de palavras por pagina; mobile sem overflow |
| Exportacao / impressao | 85% | Saida limpa: TXT, MD, HTML, DOCX; estado vazio com erro claro |
| Arquivo / acervo | 85% | Organizacao de manuscritos e notas; copia solicitada em .esc |
| Templates / guias | 85% | Loading state; fallback activeTemplate; createBlankManuscript(); selectCraft robusta |
| Precision / aderencia ao guia | 85% | +terror-horror, memoir, jornalismo, romance; status labels mais honestos |
| Lexico / Biblioteca | 85% | Analise local com recuperacao de erro e estado vazio definido |
| Sintaxe | 85% | Fallback morfologico; todos os estados de erro explicitos no painel |
| Pontuacao | 85% | 36 regras; PONT-49 mas adversativo; PONT-47 refinada |
| Analise geral | 85% | 16 condicoes de alerta; pronome-ambiguo, tempo-verbal, abertura-fraca; 21 criterios |
| Espelho de Voz | 85% | Campo sobrenatural; fieldLabels/emotionLabels legiveis; audiencia com labels |
| RimaLab | 82% | nameScheme() reconhece 20 esquemas; quarteto alternado, oitava rima, decima espinela |
| Decolonial / vocabulario | 85% | 144 entradas; alternativas clicáveis; observer agrupado por categoria |
| Direitos / publicacao | 85% | Cards recolhíveis; limpar busca; mapeamento biografi/tradução; link Prova de autoria |
| Tema Alvorada / Vereda | 88% | Alternancia persistente; contraste auditado; mobile sem overflow nas rotas principais |

### Marco — v275 / 2026-05-25

**Paginacao / modo pagina: 82% → 85%**

- `css/08-responsive.css`: `@media (max-width: 820px)` — `.manuscript-page { width: 100%; height: auto }`, `.page-body { height: auto; overflow: visible }`, `.paged-editor { overflow-x: hidden }`. Remove overflow horizontal em phones (210mm = 793px > 390px viewport)
- `backup-controller.js`: concordancia verbal no feedback de import — `(msCount + noteCount) === 1` → "trazido" (singular); plural "trazidos" mantido
- Verificado Playwright: mobile 390px largura_pg=343px sem overflow; desktop 1280px largura_pg=794px sem regressão

### Marco — v274 / 2026-05-25

**.esc / envelope nativo: 82% → 85%**

- `parseEnvelope()`: `JSON.parse` em try/catch → "Arquivo .esc ilegível ou corrompido." (antes: SyntaxError crua do browser)
- `validateEnvelope()`: detecta `vereda.proof.*` e `escrevaral.autoria.*` antes do check de formato → "Este arquivo é uma cópia de autoria, não um acervo. Abra a aba Prova de autoria para verificá-lo."
- Ciclo feliz, checksum adulterado, versão futura e extensão errada: sem regressão
- Backlog registrado: importação assistida de `.vrda` legado (decisão de produto, não bug)

### Marco — v266 / 2026-05-25

**Direitos / publicação: 78% → 85%**

- Cards recolhíveis via `<details><summary>`: card relevante abre por padrão, demais colapsados
- Limpar busca: botão X aparece ao digitar; some após limpar; `[hidden]` respeitado com CSS explícito
- Mapeamento de kind ampliado: `tradução/roteiro` → contrato; `autobiografia/biografia/memória` → registro
- Link direto "Abrir Prova de autoria" no card "Quero provar autoria" (`data-action="go-autoria"`)
- `go-autoria` registrado em app.js → `setView("autoria", { updateRoute: true })`
- QA: 9 cards, 9 details, 1 open, clear toggle, kind mapping, cross-link → #autoria, mobile sem overflow, console limpo

### Marco — v264 / 2026-05-25

**Backup externo via File System: 75% → 85%**

- `humanizeBackupError()` diferencia confirmacao de arquivo, arquivo ausente e falha generica sem expor jargao tecnico
- Estado "Arquivo de copia precisa de confirmacao" substitui permissao expirada; inline status sincronizado com painel
- Nomes de copia migrados para `escrevaral-acervo-{data}.esc`; descricao do seletor: "Copia do Escrevaral"
- Estado sem File System API validado: copia automatica indisponivel e botao desabilitado
- QA: envelope `.esc` valido, ciclo exportar → importar restaura manuscritos, console Chromium sem erro fatal

### Marco — v261 / 2026-05-25

**Sessao autonoma 3 — 9 engines avancados**

- Validacao da prova: 82% → 85% | historico de sessoes, toggle-proof-sessions, CSS proof-sessions-history
- Editor/documento: 82% → 85% | densidade lexical vísivel, contagem de caracteres, estado vazio diferenciado
- RimaLab: 78% → 82% | nameScheme() com 20 esquemas canonicos, reindexacao automatica
- Decolonial: 78% → 85% | busca por relevancia, observer agrupado por categoria, alternativas clicáveis, 144 entradas
- Versionamento: 80% → 85% | previa de 90 chars por versao, contador X/20
- Backup/restore: 80% → 85% | importacao com palavras, exportacao com KB, concordancia feminina
- Offline/PWA: 78% → 82% | banner de atualizacao com botao, mensagens corrigidas
- .esc/envelope: 78% → 82% | summarizeEnvelope(), createEnvelope com meta opcional
- Direitos/publicacao: 72% → 78% | card relevante ao topo, contador de busca, empty state

### Marco — v252 / 2026-05-25

**Sessao autonoma 2 — 8 engines avancados**

- Analise geral: 80% → 85% | +3 alertas (pronome-ambiguo, tempo-verbal, abertura-fraca), Flesch 5 faixas, 21 criterios
- Validacao da prova: 78% → 82% | duracao de sessao, formato v1/v2, atributos HTML faltando adicionados
- Editor: 77% → 82% | Flesch 5 faixas, WPM horas, lexicalDensity
- Paginacao: 77% → 82% | print A5 via data-print-preset, contador palavras/pagina no rodape
- Templates: 77% → 85% | loading state, fallback activeTemplate, createBlankManuscript()
- RimaLab: 73% → 78% | nome do verso, esquema toante/exato, elision legivel
- Decolonial: 72% → 78% | auto-load, observer com loading/erro, busca contextual

### Marco — v244 / 2026-05-24

**Vereda dark — contraste completo e anti-flash**

- Bootstrap no `<head>` aplica `data-theme="scriptorium"` antes do CSS carregar — elimina flash branco ao recarregar em Vereda
- `css/00-tokens.css`: overrides de contraste para abas, navegacao lateral, botoes do editor sobre pergaminho, Prova de autoria (sem vidro escuro), Cronograma (sem opacidade baixa), toast de desfazer
- `css/08-responsive.css`: `.voice-mirror` colapsa para 1 coluna no mobile sem overflow horizontal
- Auditoria headless (Codex): 12 combinacoes rota × viewport — `themeFailures 0`, `viewFailures 0`, `overflowFailures 0`, `lowContrastSamples 0`
- Relatorio: `reports/auditoria/vereda-dark-audit-20260524.md`

### Marco — v243 / 2026-05-24

**Reset limpo — sem marca legada na interface**

- "Zerar o Vereda" → "Zerar o Escrevaral" no modal de reset
- "Exportar backup" → "Exportar copia de seguranca" (regra portugues-primeiro)
- Remove "Ficcao-relampago" hardcoded do HTML inicial do painel de guia
- Fallback do titulo do guia: string vazia → "Escolha um guia"; estado vazio explicito no corpo
- Placeholder "abre uma vereda" → "abre o caminho" — Vereda agora e so nome do tema escuro

### Marco — v241 / 2026-05-24

**Primeira integracao estavel do tema escuro**

- Tema escuro: **Vereda** (identificador tecnico legado: `scriptorium`)
- Tema claro: **Alvorada** (padrao, sem `data-theme`)
- Lua na topbar alterna Alvorada ↔ Vereda; labels corretos; estado persiste
- `[data-theme="scriptorium"]` em `css/00-tokens.css`: tokens completos (ambiente escuro, folha em pergaminho #d4c5a9)
- Overrides especificos: `.certificate-paper`, `.editor-paper`, `.writing-area`, `.fmt-btn`, `.fmt-select`
- Auditoria Codex: 24 combinacoes (6 areas × 2 temas × 2 viewports) — sem erro fatal, sem overflow mobile
- Bug `themeMenu?.classList` corrigido (crash no Escape quando menu removido)
- `scriptorium` permanece como contrato tecnico entre `app.js`, `css/00-tokens.css` e `editor-controller.js` — renomeacao para `vereda` adiada para migracao propria e auditavel

### Evidencias — rodada 2026-05-24

**Tema Alvorada / Vereda: 80% → 88%**
- `index.html`: bootstrap no `<head>` aplica `data-theme="scriptorium"` antes dos CSS quando `vereda:dark-mode` esta ligado; reduz flash/race do tema claro em reload
- `css/00-tokens.css`: overrides de contraste para abas, navegacao lateral, controles do editor, Prova de autoria, Cronograma e toast de desfazer
- `css/08-responsive.css`: `voice-mirror` da Academia colapsa em uma coluna no mobile; copy, workbench, textarea, titulo e acoes limitados para nao vazar
- `ASSET_VERSION`: `20260524-darkaudit`; service worker: `vereda-offline-v244`
- Auditoria Codex/Chromium: 12 combinacoes (6 rotas × 2 viewports) com `themeFailures=0`, `viewFailures=0`, `overflowFailures=0`, `lowContrastSamples=0`, `clickFailures=0`
- Relatorio completo: `reports/auditoria/vereda-dark-audit-20260524.md`
- `scriptorium` continua como identificador tecnico legado; migracao para `vereda` permanece adiada para sessao propria junto com `editor-controller.js`

**Prova de autoria: 80% → 85%**
- `createAuthorshipPackage()` adicionado ao proof-engine: gera pacote `escrevaral.autoria.v1` com manuscrito, sessao, resumo e claim de autoria (dominio + produto)
- `stampWithOpenTimestamps()` adicionado ao proof-controller: envia hash SHA-256 do pacote ao calendario `a.pool.opentimestamps.org`, baixa `.pacote.esc` + recibo `.ots`
- Botao "Carimbar na blockchain" no painel de autoria: desabilitado sem texto/eventos, status em tempo real, persiste data do ultimo carimbo em `state.proofStamps`
- Acao `stamp-blockchain` registrada no app.js
- Arquivos de prova custodiados no Sync.com sob escrevaral@proton.me

### Evidencias — rodada 2026-05-23

**Prova de autoria: 76% → 80%**
- `recordStructuralEvent()` implementado e exportado no VeredaProof: registra paste, undo, redo, cut com keyType `structural:tipo` e wordDelta
- Eventos estruturais via teclado (Ctrl+V/Z/Y/X) e via clipboard API agora gravados sem erro silencioso
- Fluxo de gravacao organica + estrutural funciona sem lacuna

**Validacao da prova: 58% → 68%**
- Verificacao de `manuscript.id`: prova de outro manuscrito gera aviso explicito "Esta copia pertence a outro manuscrito"
- Resultado da validacao persiste em `state.proofValidations` (keyed por manuscriptId) e e restaurado ao reabrir o painel
- Timestamp da ultima verificacao exibido no painel ("Verificado em DD/MM HH:MM")
- Estado vazio do painel de validacao oculta o resultado quando nao ha verificacao anterior

**Rodada 2 — 2026-05-23 (v213-v214)**

**Validacao da prova: 68% → 72%**
- `proofValidations[id]` limpo em `hideDeleteUndo()` apos janela de undo expirar
- `state.versions[id]` e `state.proofs[id]` tambem limpos ao apagar manuscrito definitivamente
- Aviso "Texto editado apos verificacao (N → M palavras)" ao reabrir painel
- wordCount salvo junto com a validacao para comparacao sync

**`.vrda` / envelope: 72% → 76%**
- Mensagem de erro diferenciada: "versao futura" vs "formato antigo"
- `proofValidations` incluido no payload do backup (createBackup + restoreBackup)
- `importBackup` propaga `proofValidations` ao restaurar estado

**Backup / restore: 78% → 80%**
- Backup agora preserva historico de validacoes de autoria junto com proofs e versions

**Rodada 3 — 2026-05-23 (v215)**

**Versionamento: 67% → 74%**
- `restoreVersion()` agora salva snapshot "Antes da restauracao" antes de sobrescrever — zero perda de trabalho nao versionado
- Aviso no painel quando limite de 12 versoes e atingido: usuario sabe que versoes antigas serao descartadas

**Rodada 4 — 2026-05-23 (v216-v218)**

**Extensao .esc (substituiu .vrda):**
- Todos os arquivos de backup e prova agora usam .esc
- .vrda aceito na importacao para retrocompatibilidade (FORMAT_LEGACY)
- Mensagens de erro atualizadas

**Editor / documento: 74% → 77%**
- Metrica de tempo de leitura substituiu calculo sem sentido (wordCount/3)
- Agora exibe "Xs de leitura estimada" ou "N min de leitura estimada" (200 pal/min)

**Paginacao / modo pagina: 62% → 66%**
- IntersectionObserver rastreia pagina visivel por scroll, nao apenas por foco
- Indicador "p. X / Y" atualiza em tempo real ao rolar entre paginas

**Precision / aderencia ao guia: 63% → 70%**
- analyzeGeneric expandido: 6 verificacoes reais (abertura, ritmo, adverbios, paragrafacao, forma)
- Sem template ativo: analise generica ativada em vez de checks vazios
- Qualquer manuscrito com 50+ palavras recebe pistas concretas

**Rodada 5 — 2026-05-23 (v219-v220)**

**Analise geral: 72% → 76%**
- POV: falso positivo corrigido — alerta so dispara quando AMBAS as perspectivas (1a e 3a pessoa) superam 15% do total de frases (era 10% de mistura)
- Gatilho minimo: textos com menos de 30 palavras retornam null (sem alertas sem sentido)

**Sintaxe: 70% → 74%**
- Todos os data files (syntax, lexical, rimalab, decolonial, templates) passaram a buscar sem ?v= hardcoded
- SW pre-cacha as URLs sem versao → offline funciona desde a primeira carga sem rede

**Rodada 6 — 2026-05-23 (v221)**

**Espelho de Voz: 68% → 73%**
- `getEchoes()` substituido: autores brasileiros nomeados por gesto (Clarice, Guimaraes Rosa, Dalton Trevisan, Graciliano Ramos, Machado de Assis, Conceicao Evaristo, etc.)
- `description` sem jargao tecnico: "gesto X" substituido por titulo da voz + campo + temperatura
- `scoreLexicons()` reescrito com densidade por 100 palavras (antes: contagem bruta * 14 — inflaval em textos curtos)

**Pontuacao: 73% → 77%**
- `analyzeDeep()`: lookbehind `/(?<=[.!?])\s+/` substituido por `/[.!?]+\s+/` — compativel com Safari/WebKit
- `analyze()`: guard de minimo 10 palavras adicionado — sem falsos positivos em fragmentos

**Lexico / Biblioteca: 78% → 82%**
- `ensureLoaded()` com try/catch: `_loadError` previne retentativas infinitas e falha silenciosa
- `analyze()`: retorna `null` quando nenhuma palavra e passada (era `"terra"` silencioso)
- Dois call sites no `grammar-controller.js` protegidos com `if (!analysis) return`
- `hasLoadError()` exportado para que controladores possam exibir estado degradado

**Rodada 7 — 2026-05-23 (v222)**

**Templates / guias: 70% → 73%**
- `ensureLoaded()` com try/catch: `_loadError` previne falha silenciosa no carregamento de templates-data.json
- `hasLoadError()` exportado

**Decolonial / vocabulario: 60% → 63%**
- `ensureLoaded()` com try/catch e `_loadError`
- `categories` e `entries` agora tem fallback `|| {}` e `|| []` explicitamente no parse

**Direitos / publicacao: 57% → 62%**
- `getRelevantCard(kind)` adicionado ao engine: mapeia kind do manuscrito ao card mais relevante
- `renderRightsLab()` destaca o card relevante com `rights-card--relevant` quando ha manuscrito ativo
- CSS: `.rights-card--relevant` sobe o card, borda primaria e tag "para seu manuscrito"

**RimaLab: 55% → 60%**
- Fetch fire-and-forget substituido por `ensureLoaded()` padrao com `_loadError`
- `renderRimaLab()` no controller virou `async` e chama `await VeredaRimaLab.ensureLoaded()` antes de analisar
- `isLoaded()` e `hasLoadError()` exportados — controllers podem verificar estado antes de renderizar

**Rodada 8 — 2026-05-23 (v223)**

**Versionamento: 74% → 80%**
- `MAX_VERSIONS_PER_MANUSCRIPT`: 12 → 20
- `summarizeDiff(textBefore, textAfter)` adicionado ao engine: retorna `{ wordsBefore, wordsAfter, wordsDelta, charDelta, firstChange }`
- `renderVersionList()` exibe delta de palavras entre versoes adjacentes (+N pal / -N pal)
- Aviso "limite de 20 versoes" atualizado

**Precision / aderencia ao guia: 70% → 76%**
- `analyzeRoteiro()`: 6 checks (cenas marcadas, acoes visiveis, dialogo, frases curtas, blocos, volume)
- `analyzePoesia()`: 6 checks (imagens concretas, encavalgamento, variacao de verso, estrofes, tensao/pergunta, compressao)
- `analyzeRomance()`: 6 checks (tamanho de capitulo, personagem ativo, ancoras sensoriais, ritmo, dialogo, arco de cena)
- Roteamento: `template.oficio === "roteiro"`, `"poesia"`, `template.id === "romance-comercial"/"romance-literario"`

**Rodada 9 — 2026-05-23 (v224)**

**Backup externo via File System: 64% → 70%**
- `clearHandle()` adicionado ao engine: deleta o handle do IndexedDB permanentemente
- `forgetFilesystemBackup()` no controller: para timer + limpa handle + desativa botoes
- Botao "Esquecer arquivo" adicionado ao HTML — habilitado apenas quando ha handle ativo
- Acao `"forget-filesystem-backup"` registrada no app.js

**Paginacao / modo pagina: 66% → 72%**
- Print CSS adicionado para presets `submission` (double-space, Times, indent ABNT) e `reading` (Georgia, 11pt)
- Todos os 5 presets agora tem regras de impressao especificas em 09-print.css

**Rodada 10 — 2026-05-23 (v225)**

**Exportacao / impressao: 80% → 85%**
- `createHtmlExport(manuscript)` adicionado: gera HTML valido com Georgia serif, paragrafos indentados, meta de tipo/situacao
- `exportManuscript()` guarda estado vazio: erro claro se manuscrito nulo ou texto em branco (antes: exportava arquivo vazio silenciosamente)
- Botao HTML adicionado ao painel de arquivo — quatro formatos disponiveis: TXT, MD, HTML, DOCX

**Arquivo / acervo: 82% → 85%**
- Modal de reinicializacao total: texto "`.vrda`" corrigido para "`.esc`" — consistencia com a extensao vigente
- Escritor ve a extensao correta no passo de cautela mais critico do acervo

**Rodada 11 — 2026-05-23 (v226)**

**RimaLab: 60% → 68%**
- `analyzeStanza()` + campo `stanzas[]` no `analyze()`: esquema de rima por estrofe quando texto tem blocos separados por linha em branco
- Fix `syllabify allowDit`: ditongo crescente liberado quando palavra tem acento gráfico em outra sílaba (glória→gló-ria, série→sé-rie, vitória→vi-tó-ria); acento na vogal atual mantém hiato (ría→rí-a)
- Controller: esquema per-estrofe exibido ("Est. 1: ABBA · Est. 2: CDC"); verso numerado nas rimas (v.1 × v.4)
- Label "pobre" corrigido — era exibido como "toante" por engano; tooltips reescritos com definicoes corretas

**Rodada 12 — 2026-05-23 (v227)**

**Decolonial / vocabulario: 63% → 67%**
- Guard null em `manuscript?.text?.trim()` no observador: sem crash se manuscrito vazio ou ausente
- Estado de erro exibido quando `_loadError` é true (era estado vazio silencioso)

**Direitos / publicacao: 62% → 67%**
- `getRelevantCard()`: fallback "escrevendo" para qualquer manuscrito sem kind especifico; mapeamento expandido (poesia, IA)
- Card relevante exibe kind do manuscrito na tag (não mais texto generico "para seu manuscrito")
- Data de verificacao das fontes exibida em `rightsSources`

**Rodada 13 — 2026-05-23 (v228)**

**Validacao da prova: 72% → 78%**
- UI adicionada ao painel de autoria: input file + area de resultado (antes a feature existia no codigo mas nao tinha elementos HTML)
- `showProofValidation()` redesenhada: icone de status (verified/warning) + veredito em destaque + lista por tipo (✓/⚠/—)
- wordCount compara registro vs. manuscrito atual: "+N palavras" ou "-N palavras" desde o registro
- `data-proof-validation` e `data-proof-validate-input` agora existem no DOM

**Templates / guias: 73% → 77%**
- `renderTemplateStudio()`: guard `hasLoadError()` previne loop infinito quando templates-data.json falha (era: chamada recursiva infinita)
- `createManuscriptFromTemplate()`: apos `ready()`, verifica `hasLoadError()` e cria rascunho livre ao inves de travar

**Rodada 14 — 2026-05-23 (v229)**

**Espelho de Voz: 73% → 77%**
- `inferGesture`: reordenacao de prioridades — barroco → ensaistico → seco → imagetico → oral → contemplativo → introspectivo → narrativo
- "seco": removida restricao `repetitions.length < 6` (Trevisan e Freire usam anafora como recurso); threshold ajustado para `avgSentence < 12`
- "imagetico": detecta campos `cidade` e `conflito` alem de corpo/casa (Fonseca, Caio F. Abreu, Marcelino Freire)
- "oral": threshold principal elevado para `>= 4` marcas de dialogo; fallback `>= 2` mantido
- `semanticFields.conflito`: violencia, crime, faca, golpe adicionados
- `semanticFields.cidade`: favela, morro, periferia, beco, esquina adicionados

**Rodada 15 — 2026-05-23 (v230)**

**Sintaxe: 74% → 80%**
- Bug critico: `_isReady()` exigia `_ptc && _data`, mas ptCompromise nunca e carregado → painel nunca renderizava
- Fix: `_isReady()` agora checa apenas `_data !== null`; ptCompromise e opcional
- `analisarMorfologiaFallback()` adicionado: tokenizador regex que detecta conjuncoes (via identificarConjuncao), preposicoes (PREPS_OI), verbos (terminacoes morfologicas), gerundios e adverbios em -mente
- `init()` com `_loadError` flag: idempotente em falha, sem retentativa infinita
- `_hasLoadError()` exportado; syntax-controller usa ele para evitar loop de init

**Rodada 16 — 2026-05-23 (v231)**

**Precision / aderencia ao guia: 76% → 82%**
- `analyzeFiccaoCientifica()`: 6 checks — novum presente (tecnologia/nave/mutacao), personagem em relacao ao mundo, conflito com sistema, tamanho de cena, abertura, ritmo
- `analyzeFanfaziaBrasileira()`: 6 checks — territorio reconhecivel (cerrado/sertao/quilombo), magia/encantaria, ancoras sensoriais, tensao, voz e dialogo
- `analyzePolicialNoir()`: 6 checks — crime/investigacao presente, atmosfera noir, dialogo cortante, ritmo de suspeita, frases de corte, ponto de observacao
- Roteamento em `analyze()`: ficcao-cientifica, fantasia-brasileira, policial-noir

**Pendente para chegar a 85%:**
- Prova de autoria: testar fluxo completo em celular

**Rodada 21 — 2026-05-23 (v236)**

**Espelho de Voz: 77% → 82%**
- `analysis.audience` era computado mas nunca renderizado; painel "Público provável" adicionado ao Voice Mirror com `core`, `secondary` e `risk`
- CSS `.voice-audience` com borda primary, background suave e h4 eyebrow
- Emoções expandidas: melancolia (+5 termos), tensão (+5), luminosidade (+5), ironia (+3), contemplação (+5)
- Novo campo `ternura` (amor, carinho, afeto, cuidado, abraço, suave, doce, mãe, filho, criança)

**Rodada 20 — 2026-05-23 (v235)**

**Pontuacao: 77% → 82%**
- PONT-46 adicionada: vírgula proibida entre verbos cognitivos/perceptivos (achar, pensar, saber, sentir, ver, ouvir, notar, perceber, imaginar, acreditar, esperar, temer, lembrar) e subordinada com "que"
- `renderVoiceMirror()` é agora async: chama `VeredaPunctuation.analyzeDeep(text)` quando syntaxEngine está pronto — adiciona concordância verbal e apostos ao resultado de pontuação
- `analyzeDeep()` usava syntax-engine mas nunca era chamado na UI; agora wired ao Espelho de Voz

**Rodada 19 — 2026-05-23 (v234)**

**Analise geral: 76% → 80%**
- `interpretarResultado()`: alerta "flesch-denso" adicionado para textos com FleschBR < 30 e > 100 palavras (leitura muito exigente — avalie publico-alvo)
- `createVoiceMirrorMarkup()`: quando criterios existe mas alertas.length === 0, exibe bloco "nenhum alerta" com texto honesto ("nao substitui revisao humana")
- `.voice-criterios--ok`: borda e fundo em sage para distinção visual do estado "sem alertas"

**Rodada 18 — 2026-05-23 (v233)**

**Backup externo: 70% → 75%**
- `initializeFilesystemBackup()`: checa permissao antes de iniciar o timer — se "prompt", exibe "Permissao expirada — clique em Salvar para reativar" sem iniciar loop de erro
- `saveFilesystemBackup()`: apos save manual bem-sucedido, retoma o timer se estava parado (permissao re-concedida via gesto do usuario)

**Paginacao / modo pagina: 72% → 77%**
- Modo Pagina persiste em reload: `setEditorViewMode()` salva `vrda-editor-view` no localStorage; `_bootstrap()` restaura na inicializacao
- `renderInspector()`: contagem de palavras usa `manuscript.text` como fonte primaria em vez de `writingArea.innerText` — correto em modo Pagina (writingArea fica oculto)
- Paragrafo count tambem usa `text` como fonte primaria

**Rodada 17 — 2026-05-23 (v232)**

**RimaLab: 68% → 73%**
- `soundsMatchToante()`: nova funcao detecta rima toante (assonancia) — apenas vogais coincidem (ex: "pedra" / "cena")
- `analyzeRhyme()` retorna classification "toante" quando sons nao coincidem mas vogais sim; `rhymes: true` para incluir no esquema
- `computeRhymeScheme()` usa soundsMatchToante como fallback no mapa de letras: toante recebe a mesma letra de rimas iguais
- RHYME_TITLES atualizado com descricao de "toante"; badge `.is-toante` adicionado ao CSS

**Decolonial / vocabulario: 67% → 72%**
- `renderDecolonialTool()`: exibe "Carregando vocabulario..." enquanto `ensureLoaded()` esta em progresso (era silencioso)
- `renderDecolonialObserver()` chamado automaticamente ao entrar na aba Academia: observador reflete manuscrito ativo sem precisar toggle

**Direitos / publicacao: 67% → 72%**
- `renderRightsLab()` chamado automaticamente ao entrar na aba Academia: card relevante reflete o manuscrito ativo atual

## Prioridades por camada

### 1. Protecao

Engines: `proof-engine.js`, `proof-controller.js`, `vrda-engine.js`

Meta de curto prazo:

- Prova de autoria desde o primeiro caractere.
- Validacao mais clara: arquivo confere, texto mudou, arquivo desconhecido.
- Copy emocional: proteger processo humano, sem prometer valor juridico automatico.

Evidencia de avancar:

- Um escritor entende o valor sem saber o que e hash.
- O arquivo exportado pode ser reimportado e comparado com o manuscrito ativo.
- Estados "sem texto", "texto alterado" e "arquivo invalido" sao claros.

### 2. Preservacao

Engines: `backup-engine.js`, `filesystem-backup-engine.js`, `version-engine.js`, `state-store.js`

Meta de curto prazo:

- Estado vazio real quando nao ha notas.
- Backup que nunca ressuscita exemplos.
- Historico de versoes compreensivel como seguranca de escrita, nao painel tecnico.

Evidencia de avancar:

- Apagar a ultima nota deixa o estojo limpo.
- Importar/exportar acervo preserva manuscritos, provas, versoes e metadados.
- Falhas de arquivo sao recuperaveis e explicadas.

### 3. Escrita

Engines: `document-engine.js`, `pagination-engine.js`, `editor-controller.js`, `editor-modes.js`

Meta de curto prazo:

- Primeiros 60 segundos focados em escrever.
- Modo pagina como visualizacao, nao outro produto.
- Foco e Ler com diferencas nitidas de intencao.

Evidencia de avancar:

- Manuscrito vazio nao mostra ferramentas antes da primeira frase.
- Fluxo e Pagina mantem as mesmas features, sem herdar estilos indevidos.
- Impressao sai como documento tecnico, sem firula visual do site.

### 4. Revisao local

Engines: `analise-engine.js`, `syntax-engine.js`, `punctuation-engine.js`, `lexical-engine.js`, `precision-engine.js`

Meta de curto prazo:

- Revisao aparece como consequencia do texto.
- Heuristicas se apresentam como pistas, nao sentencas.
- Inspector e classes ficam discretos ate haver material suficiente.

Evidencia de avancar:

- Nao ha zeros ou paineis vazios na primeira abertura.
- Falsos positivos sao tratados com linguagem de possibilidade.
- Cada alerta oferece acao util, nao apenas diagnostico.

### 5. Oficio profundo

Engines: `voice-engine.js`, `rimalab-engine.js`, `decolonial-engine.js`, `rights-engine.js`, `template-engine.js`

Meta de curto prazo:

- Academia aparece por sinal real do texto, nao por contagem arbitraria.
- Guias ficam no painel, nunca invadem o editor.
- RimaLab tratado como beta ate a precisao poetica subir.

Evidencia de avancar:

- O escritor descobre ferramentas porque o proprio texto pede.
- Templates orientam sem preencher a folha por ele.
- Direitos e publicacao orientam cautela sem parecer consultoria juridica.

## Regras para subir porcentagem

Uma engine so sobe de maturidade quando houver pelo menos uma evidencia concreta:

- fluxo testado em desktop, celular ou TV portrait;
- estado vazio definido;
- erro recuperavel;
- exportacao/importacao validada;
- copy alinhada ao limite real da promessa;
- comportamento documentado em auditoria;
- teste manual ou automatizado registrado.

Nao subir porcentagem por:

- aumentar numero de componentes;
- adicionar texto explicativo demais;
- esconder problema de UX atras de termo tecnico;
- criar ferramenta antes de ela ter momento de uso.

## Proxima pergunta de produto

Se a sessao estiver sem foco, escolher uma:

1. Qual engine esta prometendo mais do que entrega?
2. Qual engine entrega valor mas aparece cedo demais?
3. Qual engine ja funciona, mas ainda nao sabe se explicar?
4. Qual engine precisa de evidencia real em celular/TV portrait?
5. Qual engine deve ficar mais silenciosa para o escritor escrever?
