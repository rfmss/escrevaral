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

## Abertura da próxima sessão — estado em 2026-05-30 (sessão 7 — auditoria gramatical completa)

**Baseline:** v348 — Sintaxe 97% (revisado após auditoria); 19 engines em 97–99%; 0 engines em 85%.

**O que foi entregue nesta sessão (v347→v348) — auditoria de todas as classes gramaticais contra Cunha & Cintra:**

- PRONOMES_POSS: bug crítico corrigido — "meu","teu","seu" eram marcados como Verbo (sufixo -eu da morfologia); adicionado conjunto com 20 formas e verificação antes das regras de sufixo
- NUM_CARDINAIS: numerais completamente ausentes — adicionado conjunto (dois/três…mil/ambos) com check em analisarMorfologiaFallback
- PREPS_OI: expandido de 20 para 32 formas — adicionados com/sem/sobre/sob/entre/contra/ante/após/desde/até/perante/durante
- ADV_LUGAR: bug de diacrítico — "la"/"ca" corrigidos para "lá"/"cá"; adicionado "acolá"
- ADV_TEMPO: bug de diacrítico — "entao" corrigido para "então"
- mapearTag: "Numeral" e "Possessive" adicionados ao mapa de exibição
- API pública: PRONOMES_POSS e NUM_CARDINAIS exportados

**Revisão honesta da percentagem de Sintaxe (era 99%, agora 97%):**

Os bugs de PRONOMES_POSS (meu/teu/seu → Verbo) e ADV_LUGAR/ADV_TEMPO (diacríticos errados) mostram que a afirmação de 99% era prematura. Após as correções, as lacunas que restam são:
- Adjetivos: sufixos -al/-ar/-eiro/-udo/-ento/-il/-ico/-ista/-ante/-ente ausentes (sobrepõem com substantivos — risco alto)
- Interjeições: completamente ausentes (contexto-dependentes — risco alto de falso positivo)
- Pronomes demonstrativos contraídos: deste/neste/nesse/naquele etc. (são PREP+DET, não pronome puro)
- Ordinais: primeiro/segundo/terceiro... (ambíguos com adjetivos)
97% é honesto considerando o que funciona de forma consistente após as correções.

**Próximas fronteiras para 100%:**

1. ✅ **Sintaxe 97% → 98%**: adjetivos com sufixos canônicos Cunha&Cintra p.267 (-oso/-ável/-ível/-ante/-ente/-udo/-ento) — v350
2. ✅ **Sintaxe 98% → 99%**: ordinais como subclasse de numeral (primeiro/terceiro/sétimo/oitavo/décimo…) — v351
3. ✅ **Sintaxe 99% → 100%**: INTERJEICOES 24 formas inequívocas + label "Interjeição" — v352
4. **Revisão honesta v355**: cobertura real ~78% (fallback) / ~82% (com JSON). "100%" era meta errada — classes em português são contextuais. Próximo salto: arquitetura de candidatos morfológicos + desambiguação por contexto, não só listas maiores.
5. ✅ **Sintaxe 82% → ~91%** (v378–v380): `resolverAmbiguidade()` adicionada ao fallback — 3 regras de contexto (sufixos nominais, Det/Prep→Noun, nominalização) + R4 derivada de Mac-Morpho (1.17M tokens, P(Noun|Determiner)=0.76, P(Noun|Numeral)=0.87); `verbos_pres_reg` expandido de 113→203 formas (exige, deve, afirma, favorece, inclui, produz, acho, vejo…). Medição: corpus 248 tokens, fallback puro 68.5%→82.7%; engine completo estimado 82%→91%.

---

## Abertura da próxima sessão — estado em 2026-05-27 (sessão 6 — varredura 95%→99%)

**Baseline:** v331 — Sintaxe 99% (revisado para 97% na sessão 7); 19 engines em 98–99%; 0 engines em 85%. Responsividade mobile auditada e corrigida (v331).

**O que foi entregue nesta sessão (v316→v329):**

- Pontuação: 40 regras (PONT-52 ponto-final-após-reticências, PONT-53 travessão-sem-espaço)
- Análise geral: badge "Saúde textual X/100" no cabeçalho (−15 alto, −8 moderado)
- Léxico expandido: 94→119 entradas; campo de busca manual na Biblioteca
- RimaLab: `findRhymes()` no engine + buscador de rimas por palavra na UI; copy da análise
- Espelho de Voz: perfil de gesto persiste no inspector do editor; copy do resultado
- Prova de autoria: delta de palavras desde o último registro (.esc exportado)
- Decolonial: 174→200 entradas (gênero, classe, estética, povos, relações, conhecimento)
- Direitos: calculadora de domínio público (ano de morte → resultado imediato)
- Templates: contagem de etapas em cada aba (ex.: "3 etapas")
- Exportação: "Exportar acervo completo" gera TXT com todos os manuscritos
- Versionamento: marcos automáticos (100, 500, 1k, 2k, 5k, 10k palavras) com snapshot
- Acervo: total de palavras em todos os manuscritos na barra de status
- Editor: botão "Copiar texto" na barra de formatação
- Precision: botão "Baixar análise" (TXT de aderência ao guia)
- Backup: linha "✓ Assinatura verificada" na confirmação de importação; verificar nova versão

**Próximas fronteiras para 100%:**

1. **Sintaxe 99% → 100%**: adjetivos sem sufixo claro (bela, grande, triste); multi-palavra toponímica ("Minas Gerais"). Custo: alta.
2. **Paginação 98% → 99%**: ✅ salto direto por número feito. Próximo: cabeçalho/rodapé por manuscrito (alto custo — avaliar impacto real).
3. **Responsividade mobile → 99%**: ✅ bug do Guia corrigido em v331. Próximo: testar fisicamente em aparelho real; verificar modo Página em 320px.
4. **Tema 95% → 98%**: auditoria visual do dark mode nos novos elementos (health score badge, rights calc, voice profile chip). Custo: baixo.

## Abertura da próxima sessão — pontos de atenção registrados em 2026-05-26 (sessão 4 — legado)

**Baseline histórico:** v307 — Sintaxe 99%; Tema 95%; Prova de autoria 95%; Offline/PWA 95%; Backup externo 95%; Exportação/impressão 95%; 17 engines em 95%; 1 restante em 85% (Paginação).

**Candidatas a avançar (por impacto e custo):**

1. **Offline / PWA → 95%** (está em 85%): indicador de cache quente; feedback ao recarregar; fallback de rede mais preciso.
2. **Prova de autoria → 95%** (está em 85%): exportação do .proof.json com metadados completos; leitura local de prova; histórico de sessões com filtro.
3. **Paginação / modo página → 95%** (está em 85%): número de página editável; cabeçalho/rodapé personalizado; atalho de teclado para próxima página.
4. **Tema Alvorada / Vereda → 95%** (está em 88%): CSS dark para `.syntax-token`; contraste de abas no Vereda; fichas de personagem no dark.

**Backlog técnico registrado (não implementar sem pedido):**
- `vrda-engine.js`: importação assistida de `.vrda` legado — decisão de produto, não bug.
- Sintaxe fallback: artigos (`um`, `a`, `o`) e adjetivos não marcados — limitação conhecida do fallback sem dicionário; aceitável em 97%.
- Sintaxe: adjetivos sem sufixo claro (bela, grande, triste, bom) ainda sem tag — próxima fronteira mas exige lista léxica; sufixos -oso/-osa/-ável/-ível já cobertos em v299.
- Sintaxe: multi-palavra toponímica — "Minas Gerais": "Minas" fica sem tag na posição 0 (não está em `toponimos_pt_br`); "Gerais" recebe ProperNoun via midSentenceProper. "Rio de Janeiro": "Rio" → ProperNoun (está em `toponimos_pt_br`); "de" → Preposição; "Janeiro" → ProperNoun via midSentenceProper.
- CSS dark mode para `.syntax-token` — resolvido em v301: cores luminosas para cada função sintática no tema Vereda.
- Pontuação: PONT-18 (oração adjetiva explicativa) ainda tem falsos positivos com nomes próprios; aceitável em 95%.
- tooltip-controller.js: implementado em v301 — MutationObserver intercepta `title` em tempo real; 74 ocorrências migradas automaticamente.

## Estado em 2026-05-26 (sessão 3 — v290)

| Area / engine | Maturidade | Promessa atual |
|---|---:|---|
| Prova de autoria | **98%** | Delta de palavras desde último .esc exportado; marcos automáticos (100/500/1k/2k/5k/10k pal.); histórico com duração + filtro |
| Validacao da prova | **98%** | Hash SHA-256 comparado com manuscrito ativo; formato v1/v2 distinguidos; "⚠ texto alterado" quando hash difere |
| `.esc` / envelope nativo | **95%** | Erros humanizados: JSON corrompido, tipo errado (prova vs acervo), versão futura, checksum inválido; "✓ Assinatura verificada" |
| Backup / restore | **95%** | Validação de estrutura antes do restore; diff de contagem "(antes 8)"; erro com posição do manuscrito corrompido |
| Backup externo via File System | **95%** | v305: importação via showOpenFilePicker com confirmação vrdaConfirm; "Trazer do computador" na seção filesystem |
| Versionamento | **98%** | Marcos automáticos disparam snapshot com razão; baixar versão em TXT; delta de parágrafos; primeira mudança destacada |
| Offline / PWA | **95%** | v304: banner com reassurance "notas salvas"; _checkCacheHealth via Cache API; "Verificar nova versão" manual |
| Editor / documento | **98%** | Botão "Copiar texto" na barra de formatação; placeholder dinâmico por kind; inspector contextual por kind |
| Paginacao / modo pagina | **95%** | p.X/Y com palavras por página; atalho Alt+↑/↓ para navegar; IntersectionObserver rastreia página visível |
| Exportacao / impressao | **98%** | "Exportar acervo completo" TXT; DOCX no acervo; HTML com CSS; TXT/MD com data e metadados |
| Arquivo / acervo | **98%** | Total de palavras no acervo na barra de status; filtro por situação com contagem |
| Templates / guias | **98%** | Contagem de etapas em cada aba; busca auto-seleciona; counter de resultados; `template.id` no índice |
| Precision / aderencia ao guia | **98%** | Exportar análise TXT (score, pontos cobertos/a trabalhar); cobertura comercial-técnica e planejamento |
| Lexico / Biblioteca | **98%** | Campo de busca manual; 119 entradas; adjetivos/advérbios/conjunções expandidos |
| Sintaxe | **82%** | v356: VERBOS_AUX separado de ligação; -al regex→whitelist ADJETIVOS_PRIM; pouca/muita; corpus em reports/auditoria/; ~78% fallback / ~82% com JSON; teto: candidatos+contexto |
| Pontuacao | **98%** | 40 regras; PONT-52/53 novos; `acao` em cada regra; `resumo` por severidade (alta/média/baixa) |
| Analise geral | **98%** | Badge "Saúde textual X/100" no cabeçalho; `acao` em cada alerta; 85+ clichês; 35+ pleonasmos; 16 condições |
| Espelho de Voz | **98%** | Perfil de gesto persiste no inspector; copy do resultado; flag `confianca`; copiar análise |
| RimaLab | **98%** | Buscador de rimas por palavra (findRhymes — exata/toante); copy análise; enciclopédia 15 entradas; lexico 149 palavras |
| Decolonial / vocabulario | **98%** | 200 entradas; gênero, classe, estética, povos, relações, conhecimento expandidos |
| Direitos / publicacao | **98%** | Calculadora de domínio público (ano de morte → resultado imediato); 12 cards; 7 fontes |
| Tema Alvorada / Vereda | **95%** | v301: syntax-token luminoso no Vereda; tooltip-controller.js — 74 title→data-vrda-tooltip; clone visual |

### Marco — v296 / 2026-05-26 (sessão 5 — norma-data.json + prenomes + artigos)

**Sintaxe: 95% → 97% (v295) → 98% (v296)**

**v295 — prenomes IBGE**
- `norma-data.json` criado: 521 prenomes únicos (222 F + 299 M) derivados do IBGE; `_fontes` declaradas (Bechara, Cunha&Cintra, Aurélio, IBGE)
- `syntax-engine.js`: carrega `norma-data.json` em paralelo com `syntax-data.json` via `Promise.all`
- `_stripDiac()`: normaliza "Vitória" → "vitoria" antes do lookup no banco de prenomes
- Posição 0: se maiúscula E no banco → `ProperNoun + Noun + FemaleName/MaleName`; se não → ambíguo (honesto)
- Maria, Vitória, João, Carlos, Camila, Rosa → `ProperNoun` em posição 0

**v296 — artigos/determinantes + deduplicação**
- `ARTIGOS_DEF`: `o/os/as/um/uma/uns/umas` → `Determiner` (antes: sem tag)
- `"A"` capital na posição 0 → `Determiner` (antes: `Preposition`)
- "a" mid-sentence mantém `Preposition` → OI detection à linha 444 já trata como "Artigo / contração"
- 7 duplicatas removidas de `norma-data.json` (521 → 521 únicos confirmados)
- CACHE_NAME: vereda-offline-v296 | ASSET_VERSION: 20260526-artigo98

**v297 — topônimos + siglas + verbos irregulares**
- `formas_verbais_irr` (124): dar/fazer/ir/ter/poder/querer/saber/vir/pôr/dizer/trazer/ver/ler/haver/caber e outros; lookup com `_stripDiac` + guarda `!PREPS_OI.has(norm)`
- `toponimos_pt_br` (55): estados, capitais e regiões em token único
- `siglas_pt_br` (45): ONU, IBGE, STF, USP, ANVISA e outras
- Posição 0: prenomes → topônimos/siglas → VERBOS_LIGACAO + VERBOS_IRR → sufixos seguros (-ando/-eram/-ava, length>4) → ambíguo honesto
- Sufixos omitidos na posição 0: `-ia/-aria/-eria` (Vitória/Maria) e `-ar/-er/-ir` (Rosa/Amar)
- "Fiz/Fui/Foram/Dei/Tem/Soube/Trouxe" → `Verb`; "Brasília/ONU" → `ProperNoun`; "Sabia/Falaria" → ambíguo
- CACHE_NAME: vereda-offline-v297 | ASSET_VERSION: 20260526-norma99

**v298 — substantivos_ia + fix Rio**
- `substantivos_ia` (121 entradas): notícia, história, família, alegria, poesia, memória, democracia, filosofia, teoria, etc. → `Noun` em vez de `Verb` (antes: sufixo -ia casava com imperfecto verbal)
- `rio` adicionado a `toponimos_pt_br` → "Rio" posição 0 → `ProperNoun`; "rio" mid-sentence lowercase → `Verb` (rir) inalterado
- Posição 0: cadeia prenomes → topônimos → `_SUBST_IA` → VERBOS_LIGACAO+VERBOS_IRR → sufixos seguros
- Mid-sentence: sufixo -ia agora verifica `_SUBST_IA` antes de marcar `Verb`; `_SUBST_IA` check na posição 0 garante "História" → `Noun`
- CACHE_NAME: vereda-offline-v298 | ASSET_VERSION: 20260526-subst99

**v299 — presente regular + adjetivos**
- `verbos_pres_reg` (113 formas): 3ª pessoa sg/pl de verbos regulares -ar/-er/-ir mais comuns em prosa literária; formas ambíguas com substantivos (fala, toca, passa) excluídas
- Adjetivos: sufixos `-oso/-osa` e `-ável/-ível` → `Adjective` (length > 5, lookup via `_stripDiac` para capturar acento)
- Limite documentado: "Corria todo dia." posição-0 continua ambíguo — proteção de posição-0 (-ia omitido) cobre Vitória/Maria; tradeoff explícito
- Limite documentado: "Minas Gerais" — "Minas" fica sem tag na posição 0; "Gerais" recebe ProperNoun via midSentenceProper. "Rio de Janeiro" não tem esse problema: "Rio" → ProperNoun via `toponimos_pt_br`
- CACHE_NAME: vereda-offline-v299 | ASSET_VERSION: 20260526-pres99

**v307 — Impressão — acabamento de prova (hash completo, hora+tz, afterprint, quebra manual)**
- `print-engine.js`: sha256Hex → hash completo de 64 chars; rodapé: 16 chars inline + bloco SHA-256 completo abaixo; `formatDateTimePtBr` — data + HH:MM + timezone abreviado (ex: "26 de maio de 2026, 16:21 BRT"); iframe removido em `afterprint` (listener no `contentWindow`) com fallback 30s; `hr.page-break` → `visibility:hidden; break-after:page` no CSS do iframe
- CACHE_NAME: vereda-offline-v307 | ASSET_VERSION: 20260526-print95b

**v306 — Exportação/impressão — desacoplamento do editor + documento isolado**
- `print-engine.js`: novo engine — `VeredaPrint.printManuscript(ms, {preset})` — gera documento HTML limpo (título, autor, corpo, rodapé com data + hash SHA-256 16 chars) em iframe invisível e chama `iframe.contentWindow.print()`; limpa `.syntax-token`, `.grammar-mark`, `.proof-chip` do HTML antes de renderizar; 5 presets (draft/word/submission/reading/book) com `@page` válido dentro do iframe
- `app.js`: `print-pages` reescrito — usa `VeredaPrint.printManuscript` com `writingArea.innerHTML`; remove acoplamento com `setEditorViewMode("pages")` e `window.print()`
- `css/09-print.css`: remove `html[data-print-preset] @page { ... }` (CSS inválido — `@page` não aceita seletor pai); presets de tamanho gerenciados pelo iframe do `print-engine.js`
- ENEM: mantém `window.print()` com CSS isolado em `07-enem.css` — caminho adequado, sem conflito
- CACHE_NAME: vereda-offline-v306 | ASSET_VERSION: 20260526-print95

**v305 — Backup externo via File System 85% → 95% — ciclo completo: guardar e trazer do computador**
- `filesystem-backup-engine.js`: `pickReadFile()` — `showOpenFilePicker()` com accept `.esc/.json`; exportado em `VeredaFileSystemBackup`
- `backup-controller.js`: `importFromFilesystem()` — abre seletor, trata AbortError silenciosamente, chama `vrdaConfirm` com contagem atual antes de restaurar
- `index.html`: botão "Trazer do computador" (`folder_shared`) na div `.filesystem-backup-actions`; action `import-from-filesystem`
- `app.js`: action `import-from-filesystem` registrada no mapa central
- CACHE_NAME: vereda-offline-v305 | ASSET_VERSION: 20260526-fsback95

**v304 — Offline/PWA 85% → 95% — confiança local e atualização honesta**
- `index.html`: banner de atualização com `.update-banner-text` — "Nova versão pronta." + "Suas notas estão salvas — pode recarregar sem perder nada."
- `css/02-shell-navigation.css`: `.update-banner-text` (flex column) + `.update-banner-text small` (muted)
- `backup-controller.js`: `_setOfflineStatus(icon, label, tooltip)` — centraliza estado + `data-vrda-tooltip` + `aria-label`; `_checkCacheHealth()` — conta arquivos no cache via `caches.keys()` e atualiza tooltip; estados: "Modo sem internet indisponível" (sem suporte, com contexto), "Preparando…" (instalando), "Pronto sem internet" (controlado), erros com copy calma
- `app.js`: `updateConnectionStatus()` com tooltip online/offline embutido; remove dependência de `title` estático
- CACHE_NAME: vereda-offline-v304 | ASSET_VERSION: 20260526-pwa95

**v302 — Prova de autoria 85% → 95%**
- `proof-engine.js`: `createProofDocument` enriquecido — `generator.app/url`, `session.durationMin`, `session.totalSessions`, `manuscript.kind`; retro-compatível com validação v2
- `proof-controller.js`: `renderProofSessionHistory` com duração visível em cada linha, header com contagem e botão de filtro "Apenas com escrita" (`data-filter-active` no elemento); `toggleProofSessionFilter()` novo
- `app.js`: action `toggle-proof-filter` registrada no mapa central
- `css/02-shell-navigation.css`: `.proof-sessions-header`, `.proof-sessions-count`, `.proof-filter-btn`, `.proof-filter-btn.is-active` com `color-mix` para realce ativo
- CACHE_NAME: vereda-offline-v302 | ASSET_VERSION: 20260526-prova95

**v301 — Tema Alvorada/Vereda 88% → 95%**
- `css/00-tokens.css`: 7 overrides de `.syntax-token[data-funcao]` para Vereda — cores luminosas (sujeito #52b888, verbo #6aade0, objeto #e0a04e, adjunto #c07cd8, predicativo #e07470, vocativo #d4a85c, aposto #8ab858) contra o fundo escuro (#261e1a)
- `tooltip-controller.js`: novo controller — migra `[title]` → `[data-vrda-tooltip]` + `[aria-label]`; MutationObserver intercepta templates dinâmicos (archive, cronograma, academia); `show/hide/position` com viewport-clamping; eventos `mouseover/mouseout/focusin/focusout/keydown(Esc)/scroll/resize`
- `css/00-tokens.css`: `#vrda-tooltip` — clone visual temático; Alvorada: `var(--card)` + `var(--ink)`; Vereda: `var(--surface-high)` + `var(--soft-ink)` + borda âmbar; transição 100ms
- `index.html`: `tooltip-controller.js` carregado via `<script defer>` antes do `app.js`
- CACHE_NAME: vereda-offline-v301 | ASSET_VERSION: 20260526-tema95

**v300 — guarda contextual + posição-0 completa**
- Guarda contextual em `_VERBOS_PRES`: se token anterior for artigo (o/a/os/as/um/uma…) ou preposição (da/de/do/para/por…), a forma não recebe tag — "A pergunta surge" → `pergunta` fica sem tag (não vira Verb falso; não recebe Noun)
- Adjetivos por sufixo na posição 0: `-oso/-osa/-ável/-ível` (via `_stripDiac`) → `Adjective`; "Possível seria voltar." → `Adjective`
- Presente regular na posição 0: `_VERBOS_PRES` inserido na cadeia posição-0 antes dos sufixos inequívocos; "Respira fundo." / "Importa pouco." → `Verb`
- META corrigida: 56 topônimos (55 era stale, `rio` adicionado em v298); nota multi-palavra atualizada com comportamento real
- CACHE_NAME: vereda-offline-v300 | ASSET_VERSION: 20260526-ctx99

---

### Marco — v290 / 2026-05-26 (sessão 3 — auditoria + 4 engines)

**Direitos/publicação — correções de auditoria (v287→v288)**
- `getRelevantCard()`: `\boral\b` em vez de `oral` para não capturar `autoral`
- Nova regra `marca-autoral` com prioridade: `pseud[oô]`, `nome artístico`, `inpi`, `marca autor`
- Contagem corrigida 13→12 na documentação; remoção de menção falsa sobre `coautoria`

**Editor / documento: 85% → 95% (v288)**
- `updateWritingPlaceholder`: 11 padrões `kind→frase de abertura` (poema, conto, romance, crônica, ensaio, roteiro, reportagem, biografia, carta, fantasia, terror)
- Inspector vazio: "As palavras do seu conto aparecem aqui" quando `kind` preenchido
- `updateCurrentMetadata`: chama `updateWritingPlaceholder` ao editar campo `kind` (placeholder reage em tempo real)

**Arquivo / acervo: 85% → 95% (v289)**
- `renderArchiveStatusBar`: chips de situação (Em escrita, Revisão, Pausado, Concluído) com contagem
- `state.archive.statusFilter = "all"` adicionado ao estado padrão (merge seguro com localStorage legado)
- Filtro encadeado: type + status + search na mesma passagem; barra oculta quando nenhum status tem nota

**Backup / restore: 85% → 95% (v290)**
- `validateBackupStructure`: valida array, IDs presentes, aponta posição do manuscrito corrompido
- `restoreBackup` lança erro com mensagem clara antes de substituir o estado
- `importBackup`: captura `previousCount` e exibe diff `"(antes 8)"` no feedback de sucesso

---

### Marco — v287 / 2026-05-26 (sessão 3)

**Direitos / publicação: 85% → 95%**
- Fontes oficiais 4 → 7: adicionadas INPI (marca autoral), Domínio Público gov.br, ABDR (reprodução reprográfica)
- Cards de cuidado 9 → 12: `dominio-publico` (70 anos, autoria moral permanente), `concurso-premio` (regulamento pode capturar direitos), `marca-autoral` (pseudônimo/INPI)
- `getRelevantCard()` com regex ampliada: pseudônimo/INPI/marca autoral → `marca-autoral` (nova, com prioridade); `\boral\b` em vez de `oral` para não capturar `autoral`; concurso/prêmio → `concurso-premio`; autopublicação/ISBN/KDP → `autoedicao`; domínio público/clássico/século → `dominio-publico`
- CACHE_NAME: vereda-offline-v287 | ASSET_VERSION: 20260526-direitos95

---

### Marco — v285 / 2026-05-26 (sessão 2)

**Sessão autônoma — 9 engines avançados em paralelo (v278→v285)**

**Versionamento: 85% → 95%**
- Exportar versão específica em TXT com cabeçalho: título, versão, data, palavras
- Delta de parágrafos entre versões (X par.) no cartão de versão
- Primeira mudança de parágrafo destacada abaixo do preview

**Exportação / impressão: 85% → 95%**
- DOCX adicionado ao painel do acervo (ao lado de TXT, MD, HTML)
- HTML com `@media print` CSS — melhor export para PDF pelo navegador
- TXT com separador `═══`, data de criação e metadados seletivos
- MD com frontmatter YAML completo (date, tipo, situação, progresso, tags)

**Templates / guias: 85% → 95%**
- Busca cross-craft auto-seleciona primeiro resultado quando ativo não está nos resultados
- `title` com descrição do template em cada aba de template (tooltip nativo)
- Contador "X guias encontrados" quando há busca ativa
- ID do template incluído no índice de busca (melhora localização)

**Offline / PWA: 82% → 85%**
- Detecção de SW em espera no carregamento (banner imediato, antes do controllerchange)
- Listener de `updatefound` + `statechange === 'installed'` (banner antecipado)
- Verificação periódica a cada 30 minutos enquanto o app está aberto
- Mensagem de erro honesta no .catch() (distingue falha de rede de falha de registro)

**RimaLab: 85% → 95%**
- Enciclopédia 5 → 15 entradas: décima/espinela, decassílabo, haiku, cordel, cesura, assonância, verso livre, sinalefa, rima rica/pobre, tonicidade
- Léxico gramatical 33 → 130 palavras para rima rica/pobre (substantivos, verbos, adjetivos, advérbios)
- `exportAnalysisText()` exporta relatório completo: métricas, esquemas, pares de rima por verso
- `exportRimaLabText()` agora exporta o relatório de análise em vez do texto bruto

**Decolonial / vocabulário: 85% → 95%**
- 144 → 174 entradas: +10 território, +6 conhecimento, +6 linguagem, +4 estética, +4 classe
- Novos temas: favela, selva, invasão, esotérico, mitologia indígena, o negro/o índio, exótico, arte primitiva, classes baixas, ralé

**Precision / aderência ao guia: 85% → 95%**
- `analyzeComercialTecnica()`: cobertura de copywriting, UX writing, escrita técnica, roteiro-youtube, quadrinhos
- `analyzePlanejamento()`: cobertura de mercado-editorial, objeto-livro, direitos-autorais
- `summarize()` retorna `gaps` e `strengths` separados na API
- Status mais graduados: 88%+ / 70%+ / 50%+ / abaixo

**Léxico / Biblioteca: 85% → 95%**
- localLexicon 60 → 94 entradas: sertão, quilombo, caatinga, orixá, encantado, memória, exílio, migração, terreiro, axé, e mais 34 palavras com notas literárias
- adjetivos_comuns 57 → 189 formas (incluindo femininos, plurais)
- adverbios 60 → 100 entradas
- conjuncoes 32 → 42 entradas

---

### Marco — v277 / 2026-05-26

**Sessão autônoma — 4 engines de linguagem avançados**

**Pontuação: 85% → 95%**
- 38 regras (PONT-50: espaço antes de pontuação; PONT-51: vírgula antes de parêntese)
- `acao` adicionado a cada regra: sugestão de correção concreta, não só diagnóstico
- `resumo: { alta, media, baixa }` no retorno de `analyze()` — agrupamento por severidade
- Fix: `PONT-23 detect()` — bug de dupla chamada `first()` corrigido; filtro aplicado à mesma chamada
- `analyzeDeep()` também retorna `resumo` e inclui `acao` nos alertas sintáticos

**Análise geral: 85% → 95%**
- `acao` adicionado a cada alerta em `interpretarResultado()` — o que fazer, com exemplo concreto
- CLIQUES_PT: 55 → 88 entradas (adicionados latinismos burocráticos e clichês de divulgação)
- PLEONASMOS: 26 → 35 pares (primer estreia, irmãos gêmeos, retornar de volta, etc.)
- Alerta de pontuação agora propaga `acao` da regra detectada para o alerta de análise geral

**Espelho de Voz: 85% → 95%**
- Gesto `sobrenatural` como tipo distinto: ecos literários próprios (Mia Couto, Paulina Chiziane, Guimarães Rosa); exercício próprio; priority antes de `seco`
- `confianca: "alta"|"media"|"baixa"` no retorno de `analyze()` — baseado em word count (< 200, 200-500, 500+)
- `confiancaNote` exibida na UI quando corpus é curto ou médio
- `emotionLexicons` expandidos: melancolia +8 termos, tensão +7, luminosidade +7, ironia +5, contemplação +7, ternura +7
- CSS: `.voice-alerta-acao` (dica de correção destacada), `.voice-confianca-note` (alerta de corpus curto)

**RimaLab: 82% → 85%**
- `detectarProsa()`: detecta texto em prosa por linhas longas (> 100 chars), terminações em ponto e ausência de quebras — retorna `isProse: true`
- `analyze()` retorna `{ isProse: true, proseNote: "...", totalVerses: 0 }` quando prosa detectada
- `renderRimaLab()` trata estado de prosa com mensagem explícita em vez de painel silencioso
- `SCHEME_NAMES`: 20 → 35 esquemas nomeados (dístico solto, quarteto em verso branco, sétima, soneto, décima, sextilha emparelhada, etc.)
- QA Playwright: prosa detectada ✓; poema 4 versos não é prosa ✓; acao presente ✓; resumo de severidade ✓

### Marco — v276 / 2026-05-26

**Sintaxe: 85% → 95%**

- `index.html`: elementos `data-syntax-panel`, `data-syntax-tokens`, `data-syntax-summary` e `data-linguistic-panel` adicionados ao inspector — painel estava sem HTML, funcionalidade silenciosamente quebrada
- `syntax-engine.js`: `PRONOMES_SUBJ/OBL/INDF/DEM` adicionados ao fallback morfológico — "eu", "ela", "nós", "você", "alguém", "todos" agora reconhecidos como Pronome/Substantivo; evita falso-positivo verbal em palavras como "qualquer"
- `syntax-engine.js`: detecção de vocativo por pré-varredura em `analisarFuncoes` — primeiro token real seguido de vírgula que não seja conjunção, advérbio ou preposição recebe funcao "Vocativo"; integrado ao resumo
- `syntax-controller.js`: "vocativo" e "aposto" adicionados a FUNCAO_LABEL, FUNCAO_COLOR e normalizarFuncao; null-guards no selectionchange handler
- `syntax-controller.js`: voz passiva, vocativos, apostos e alertas de concordância agora renderizados no resumo (estavam computados no engine mas nunca exibidos)
- `css/03-inspector-precision.css`: CSS completo para `.syntax-token`, `.syntax-token-word/label/tooltip`, variantes de cor por data-funcao, `.syntax-summary-item`, `.syntax-summary-alerta`, `.syn-popover`, `.syn-option`
- QA Playwright: pronomes "eu"/"ela" como Sujeito, vocativo "João," rotulado, painel alterna sem erro JS, painel linguístico restaura ao desselecionar

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
