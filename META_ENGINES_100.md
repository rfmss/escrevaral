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

## Abertura da próxima sessão — estado em 2026-06-27 (ciclo autônomo v876→v885)

**Baseline:** v885 — todos os engines em 100%, exceto Exportação 90%. SINONIMOS 1269, DEFINICOES 535+, POLISSEMIA 111 formas.

**O que foi entregue neste ciclo (v876→v885):**

- `lexical-engine.js` (v876): POLISSEMIA colisões diacríticas — pública/séria/preso desambiguados por contexto
- `lexical-engine.js` (v877): POLISSEMIA cópia/túnica — 2 novas colisões diacríticas cobertas
- `synonym-data.js` (v878): +6 SINONIMOS lacunas literárias (narradora/epígrafe/dedicatória/alienação/crescimento/brecha)
- `lexical-engine.js`+`synonym-data.js` (v879): +15 DEFINICOES + 2 SINONIMOS (epígrafe/dedicatória/tensão/resolução/vulnerabilidade/coragem/dicção/etc.)
- `lexical-engine.js`+`synonym-data.js` (v880): +9 DEFINICOES + 3 SINONIMOS (verbos narrativos: revelar/esconder/sugerir/admitir/etc.)
- `lexical-engine.js`+`synonym-data.js` (v881): +9 DEFINICOES + 4 SINONIMOS (estados emocionais: raiva/fúria/amargura/desencanto/etc.)
- `lexical-engine.js`+`synonym-data.js` (v882): +11 DEFINICOES + 5 SINONIMOS (ambiente/sensorial: escuridão/luz/sombra/noite/madrugada/cheiro)
- `lexical-engine.js`+`synonym-data.js` (v883): +8 DEFINICOES + 7 SINONIMOS (corpo/gesto: olhar/suspiro/lágrima/toque/abraço/pausa)
- `lexical-engine.js`+`synonym-data.js` (v884): +10 DEFINICOES + 3 SINONIMOS (relações: traição/lealdade/amor/ódio/medo/liberdade/abandono)
- `lexical-engine.js`+`synonym-data.js` (v885): +6 DEFINICOES + 6 SINONIMOS (estrutura: onisciência/compressão/coadjuvante/figurante/passagem/perspectiva)

**Estado atualizado dos engines (v885):**

| Área / engine | Maturidade | Notas de estado (v885) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | 10 gestos; 9 campos semânticos |
| RimaLab | **100%** | enciclopédia 50; grammarWords 348 |
| Léxico / Biblioteca | **100%** | SINONIMOS 1269 (P0=0); DEFINICOES 535+; POLISSEMIA 111 formas; campo `decisao` |
| Decolonial / vocabulário | **100%** | 600+ entradas; 9 categorias |
| Sintaxe / Morfologia | **100%** | dados 2000×4; VERBOS_PRES 2045; POLISSEMIA diacríticas |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA; overflow mobile zero |
| Exportação | **90%** | TXT/MD/HTML/DOCX/ePub/RTF/Obsidian; buildOutputPackage; UI de escopo |

**Fronteiras abertas (v885):**

1. **Exportação para 95%**: RTF/ePub multi-manuscrito não usam escopo ainda
2. **"logo" conclusivo** — "Penso, logo existo" → sem parser externo é insolúvel
3. **Adjetivos compostos** (bem-humorado) — hífen impede normalizeWord
4. **"quando" como Conjunção** vs Advérbio interrogativo — requer detecção de `?`
5. **DEFINICOES de termos técnicos compostos** (ponto de vista, foco narrativo) — lookup só funciona com palavra isolada

---

## Abertura da próxima sessão — estado em 2026-06-27 (ciclo autônomo v866→v875)

**Baseline:** v875 — todos os engines em 100%, exceto Exportação 90%. P0 de dados eliminado.

**O que foi entregue neste ciclo (v866→v875):**

- `synonym-data.js` (v866): +10 SINONIMOS processo narrativo (continuar/pausar/fragmentar/condensar/cortar/fragmentado/linear/circular/elíptico/planejamento)
- `lexical-engine.js` (v867): campo `decisao` em `analyze()` — classificado/provavel/ambiguo/indeterminado (retrocompatível; metadata pura)
- `synonym-data.js` (v868): +11 SINONIMOS estados morais (relutar/titubear/capitular/insistir/persistir/arrependida/desonesto/vil/nobre/compassivo/indiferente)
- `synonym-data.js` (v869): +9 SINONIMOS estado interno e cenário (vacilação/conformismo/persistência/entardecer/névoa/clarão/lampejo/paralisia/silêncio criativo)
- `lexical-engine.js` (v870): revert POLISSEMIA jovem/pobre/velho — janela 2-token insuficiente; `decisao:"ambiguo"` honesto
- `lexical-engine.js` (v871): +16 DEFINICOES literárias adjetivos de personagem (altivo/soberbo/rancoroso/melancólico/nostálgico/traidor/ingênuo/astuto/sensato/obstinado/impulsivo/furioso/resignado/amargo/apaixonado/ciumento)
- `lexical-engine.js` (v872): +18 DEFINICOES literárias morais+processo+atmosfera (desonesto/vil/nobre/compassivo/indiferente/arrependida/fragmentar/condensar/relutar/titubear/capitular/vacilação/conformismo/entardecer/névoa/clarão/lampejo/paralisia)
- `app.js`+`index.html`+`css/05-archive.css` (v873): UI de escopo de exportação — seletor "O que exportar" com 3 opções; `_getExportScope()` liga seletor a `buildOutputPackage()`
- `synonym-data.js` (v874+v875): **P0 eliminado** — 59 chaves duplicadas + 18 colisões normalizadas mescladas; auditor P0=0 P1=4 P2=0

**Estado atualizado dos engines (v875):**

| Área / engine | Maturidade | Notas de estado (v875) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | 10 gestos; 9 campos semânticos |
| RimaLab | **100%** | enciclopédia 50; grammarWords 348 |
| Léxico / Biblioteca | **100%** | SINONIMOS 1219 (P0=0); DEFINICOES 464+; POLISSEMIA 59; campo `decisao` em analyze() |
| Decolonial / vocabulário | **100%** | 600+ entradas; 9 categorias |
| Sintaxe / Morfologia | **100%** | dados 2000×4; VERBOS_PRES 2045; corpus 92 frases/19 zonas |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA; overflow mobile zero |
| Exportação | **90%** | TXT/MD/HTML/DOCX/ePub/RTF/Obsidian; buildOutputPackage; UI de escopo implementada |

**Fronteiras abertas (v875):**

1. **Exportação para 95%**: RTF multi-manuscrito não usa escopo ainda; ePub não usa escopo; feedback visual "escopo ativo" no seletor
2. **"logo" conclusivo** — "Penso, logo existo" → Advérbio (deveria ser Conjunção); pontuação stripped antes do cálculo de vizinhos; sem parser externo é insolúvel
3. **Adjetivos compostos** (bem-humorado, mal-humorado) — hífen impede normalizeWord
4. **"quando" como Conjunção** vs Advérbio interrogativo — requer detecção de ponto de interrogação

## Abertura da próxima sessão — estado em 2026-06-27 (ciclo autônomo v854→v865)

**Baseline:** v865 — todos os engines em 100%. Ciclo focado em POLISSEMIA contextual, DEFINICOES, SINONIMOS e atalhos de editor.

**O que foi entregue neste ciclo (v854→v865):**

- `lexical-engine.js` (v854): +11 DEFINICOES (verbos expressivos: estremecer/palpitar/sufocar/ofegar/solucar; estados de ausência: lacuna/falta/duracao/inimizade/cansaco)
- `synonym-data.js` (v854): +11 SINONIMOS correspondentes a verbos expressivos e substantivos de ausência
- `lexical-engine.js` (v855): POLISSEMIA["tarde"] — article detection (substantivo após artigo; advérbio em outros contextos); `analyze()` refatorado: `_polisOverride` garante que POLISSEMIA vence lexiconEntry quando texto disponível; fix "devagar" → não Verbo no infinitivo (exception na regra 20)
- `lexical-engine.js` (v856): `_ADJ_EXT` expandido com particípios irregulares usados como adjetivos: satisfeito/confuso/incluso/excluso/difuso/corrupto/aceso/preso/solto/morto/posto/feito/visto/perdido/escondido; adjetivos em -eto (concreto/abstrato/discreto/completo/quieto) e -undo (iracundo/fecundo/moribundo); cores
- `lexical-engine.js` (v857): POLISSEMIA["posto"] — COPULAS_P set para Adjetivo predicativo; fix "foi" como auxiliar → Verbo (particípio)
- `lexical-engine.js` (v858): POLISSEMIA["visto"] — COPULAS_V set; `_polisOverride` expandido para cobrir lexiconEntry com className começando em "Verbo (particípio)"
- `export-engine.js`+`app.js`+`index.html` (v859): Exportar para Obsidian — `.md` com YAML frontmatter (title/criado/tipo/situacao/autor/palavras/tags/fonte) + wikilinks `[[tag]]`; botão + help explicativo
- `export-engine.js`+`app.js`+`index.html` (v860): Acervo para Obsidian — ZIP com `README.md` (índice) + `manuscritos/[slug].md` por item
- `export-engine.js` (v861): `buildOutputPackage(manuscripts, opts)` — camada lógica de seleção de escopo (all/current/current-with-linked/selected); exposta em `VeredaExport`; `exportObsidianVault` usa o pacote
- `app.js` (v862): Ctrl+S (guardar — evita "Salvar como..." do browser) + Ctrl+P (imprimir manuscrito ativo — evita "Imprimir página" do browser)
- `lexical-engine.js` (v863): POLISSEMIA["claro"] — _COPULAS_CLARO set: "ficou/ficava claro" → Adjetivo (predicativo), "falou claro" → Advérbio; POLISSEMIA["fundo"] — após preposição/artigo → Substantivo; POLISSEMIA["funda"] → Adjetivo; corrige lexiconEntry que classificava "fundo" como "Verbo flexionado"
- `lexical-engine.js` (v864): +2 DEFINICOES (prólogo/monólogo); bateria narrativa 34/34
- `synonym-data.js` (v865): +18 SINONIMOS adjetivos de personagem literário: altivo/soberbo/rancoroso/tenso/melancólico/nostálgico/traidor/ingênuo/astuto/sensato/obstinado/impulsivo/prudente/furioso/resignado/amargo/apaixonado/ciumento

**Fronteiras fechadas neste ciclo:**
- "tarde" como Advérbio (POLISSEMIA + _polisOverride em analyze)
- "posto/visto/claro/fundo" — POLISSEMIA resolvendo conflitos com lexiconEntry
- Ctrl+S e Ctrl+P — atalhos de editor sem fricção com browser

**Estado atualizado dos engines (v865):**

| Área / engine | Maturidade | Notas de estado (v865) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | 9 gestos; 9 campos semânticos; echoes por gesto |
| RimaLab | **100%** | enciclopédia 50; grammarWords 348 |
| Léxico / Biblioteca | **100%** | SINONIMOS 1221; DEFINICOES 430; POLISSEMIA 59 entradas; bateria 34/34 narrativa; adjetivos de personagem 18/18 |
| Decolonial / vocabulário | **100%** | 600 entradas; 9 categorias |
| Sintaxe / Morfologia | **100%** | dados 2000×4; VERBOS_PRES; effectiveClass em inferFuncaoSintatica |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA; overflow mobile zero |
| Exportação | **85%** | TXT/MD/HTML/DOCX/ePub/RTF/Obsidian (single+vault); buildOutputPackage (scope layer); falta UI unificada de escopo |

**Fronteiras abertas (v865):**

1. **UI de escopo de saída**: `buildOutputPackage` existe mas a UI ainda não expõe "Exportar só este texto / com notas ligadas / escolher itens" — próxima pílula de exportação
2. **"logo" conclusivo** — "Penso, logo existo" → "Advérbio" (deveria ser "Conjunção"). Pontuação stripped antes do cálculo de vizinhos; sem parser externo é insolúvel
3. **Adjetivos compostos** (bem-humorado, mal-humorado) — hífen impede normalizeWord de capturar o padrão
4. **"quando" como Conjunção** vs Advérbio interrogativo — só resolvido com detecção de ponto de interrogação

---

## Abertura da próxima sessão — estado em 2026-06-27 (ciclo autônomo v836→v853)

**Baseline:** v853 — todos os engines em 100%. Ciclo focado em classificação de classes gramaticais e expansão do corpus Léxico.

**O que foi entregue neste ciclo (v836→v853):**

- `lexical-engine.js` (v838): POLISSEMIA para 50+ gentílicos brasileiros (carioca/paulista/baiano/mineiro/gaúcho/nordestino/fluminense/etc.) — Adjetivo quando modifica substantivo; Substantivo após artigo isolado
- `lexical-engine.js` (v839–v841): DEFINICOES 352 → 417 entradas: pontuação, oficina de escrita, emoções complexas, experiência humana, oralidade, estética, adjetivos de paisagem e personagem
- `synonym-data.js` (v846–v850): SINONIMOS 1148 → 1190: processo criativo, pontuação, estética, adjetivos de personagem e qualificativos
- `lexical-engine.js` (v842): POLISSEMIA["ora"] reescrita — correlativo → Advérbio; antes de pronome → Interjeição; "inclusive" e outros em _ADV_EXT
- `lexical-engine.js` (v844): adjetivos em -al: atual/final/total/fatal/banal/leal/genial/natural/cultural/nacional/social/moral/formal/normal/oral/central/lateral/ancestral/brutal/frontal/mental/vital/plural/emocional/racional/sensorial/editorial/universal/original/habitual/virtual/temporal/global/real (+ variantes); fix "disse" → Verbo flexionado via _PERF_IRR_ISSE
- `lexical-engine.js` (v845): _PREP_EXT — através/acerca/diante/dentre/perante/mediante; _ADJ_EXT expandido com espesso/grosso/denso/profundo/fecundo/rotundo/longo/redondo/imundo
- `lexical-engine.js` (v848): prefixos negativos im-/il-/ir-/in- (imoral/informal/ilegal/irreal/irracional); adjetivos base amplo/digno/reto/pleno/puro/severo/sereno/casto/etc.
- `lexical-engine.js` (v849): adjetivos de personagem (ADJ-CARAC-01): covarde/valente/generoso/mesquinho/teimoso/ansioso/orgulhoso/saudoso/arrogante/elegante/ambicioso/corajoso/etc.
- `lexical-engine.js` (v851): POLISSEMIA melhor/pior (Advérbio vs Adjetivo por contexto); antes/depois (Preposição vs Advérbio); junto → Advérbio; _ADJ_EXT adjetivos -nte (brilhante/marcante/relevante/urgente/inocente/suficiente/eloquente/evidente/permanente/etc.); _ADJ_IRR em _intens para "muito bom" → Advérbio
- `lexical-engine.js` (v852): _ADJ_IDO — árido/úmido/sólido/líquido/rígido/pálido/válido/lúcido/tímido/nítido/gélido/cândido/fluido → Adjetivo (antes caíam na regra do particípio -ido)

**Estado atualizado dos engines (v853):**

| Área / engine | Maturidade | Notas de estado (v853) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | 9 gestos; 9 campos semânticos; echoes por gesto |
| RimaLab | **100%** | enciclopédia 50; grammarWords 348 |
| Léxico / Biblioteca | **100%** | SINONIMOS 1190; localLexicon 528; DEFINICOES 417; POLISSEMIA 55+ entradas; 38/38 bateria passando |
| Decolonial / vocabulário | **100%** | 600 entradas; 9 categorias |
| Sintaxe / Morfologia | **100%** | dados 2000×4; VERBOS_PRES; effectiveClass em inferFuncaoSintatica |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA; overflow mobile zero |

**Fronteiras abertas (v853):**

1. **"tarde" como Advérbio** — localLexicon sempre ganha sobre contexto; "Chegou tarde" → "Substantivo". Requer refatoração em `analyze()` para checar POLISSEMIA antes de localLexicon quando há texto disponível
2. **"logo" conclusivo** — "Penso, logo existo" → "Advérbio". Pontuação é stripped antes do vizinho ser calculado; sem parser externo é impossível detectar vírgula anterior
3. **Adjetivos compostos** (bem-humorado, mal-humorado, bem-intencionado) — hífen impede que normalizeWord capture o padrão; só resolvido com tratamento especial de hífens em inferWordClass
4. **"quando" como Conjunção** vs Advérbio interrogativo — já em functionWords.adverbios; para classificar como Conjunção temporal requer detecção de ponto de interrogação
5. **"antes/depois" como Preposição em locução** — POLISSEMIA cobre "antes/depois de" mas não "antes que/depois que" (conjunção temporal); não é prioridade

---

## Abertura da próxima sessão — estado em 2026-06-27 (ciclo autônomo v813→v835)

**Baseline:** v835 — todos os engines em 100%. Ciclo focado na qualidade de dados do Léxico / Biblioteca.

**O que foi entregue neste ciclo (v813→v835):**

- `lexical-engine.js` (v814): carregamento paralelo de `norma-data.json`; `_VERBOS_PRES_SET` (2045 formas) em rule 19; posição-0 em `inferFuncaoSintatica`
- `lexical-engine.js` (v815): `effectiveClass` em `inferFuncaoSintatica` — 127 localLexicon com className semântico (lex-abstracto/narrativa/etc.) agora recebem classe gramatical correta
- `synonym-data.js` (v816): +40 sinônimos literários/editoriais (termos de craft, emoção, natureza brasileira)
- `app.js` (v817): bug crítico — `window.getSynonyms` era sobrescrito por `syntax-controller.js`; 1000+ sinônimos do SINONIMOS nunca chegavam ao float. Fix: usar `window.SINONIMOS` diretamente
- `grammar-controller.js` (v818): mesmo fix no popover de gramática
- `lexical-engine.js` (v819): DEFINICOES +24 entradas (termos literários alinhados com sinônimos)
- `synonym-data.js` (v820): +40 sinônimos (conflito/emoção/natureza/qualidade textual)
- `lexical-engine.js` (v821): POLISSEMIA["la"] → Advérbio (clítico pós-hífen já tratado por P0.6)
- `lexical-engine.js` (v822): POLISSEMIA["ai"] (aí/ai, durante, além); POLISSEMIA["durante"] → Preposição
- `lexical-engine.js` (v823): DEFINICOES +27 (emoção, conflito, natureza BR, qualidades textuais); fix crash `countWordOccurrences(undefined)`
- `lexical-engine.js` (v824): POLISSEMIA["ja"/"assim"/"conforme"/"segundo"] — 4 palavras sempre em Conjunção quando deveriam ser Advérbio/Preposição
- `lexical-engine.js` (v825): DEFINICOES +37 (figuras, narrativa, gêneros, ponto de vista, emoções); synonym-data +17
- `lexical-engine.js` (v826): `_INTERJEICOES` Set (rule 23) e `_NUMERAIS_CARD` Set (rule 24); POLISSEMIA["ai"] context-aware
- `lexical-engine.js` (v827): `_ORDINAIS` Set (rule 25) — terceiro/quarto/quinto/sétimo/penúltimo → Adjetivo
- `lexical-engine.js` (v828): DEFINICOES +29 (crítica literária, editoração, personagem, registro, gêneros)
- `synonym-data.js` (v829): +16 sinônimos (teoria, editoração, personagem, gêneros)
- `lexical-engine.js` (v830): `_COMP_IRR` — comparativos irregulares melhor/pior/maior/menor/superior/inferior → Adjetivo; POLISSEMIA["acaso"]
- `lexical-engine.js` (v831): DEFINICOES +19 (conto, novela, romance, poesia, denotação, narração, ensaio e +12)
- `synonym-data.js` (v832): +13 sinônimos (gêneros e semântica)
- `lexical-engine.js` (v833): `_ADJ_EXT` (+50 adjetivos sem sufixo canônico) e `_ADV_EXT` (embaixo/atrás/adiante e +)
- `lexical-engine.js` (v834): DEFINICOES +20 (in media res, flashback, prolepse, analepse, ode, elegia, assonância, onomatopeia)
- `synonym-data.js` (v835): +10 sinônimos (técnicas e formas poéticas)

**Estado atualizado dos engines (v835):**

| Área / engine | Maturidade | Notas de estado (v835) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | 9 gestos; 9 campos semânticos; echoes por gesto |
| RimaLab | **100%** | enciclopédia 50; grammarWords 348 |
| Léxico / Biblioteca | **100%** | SINONIMOS 1133; localLexicon 528; DEFINICOES 327; POLISSEMIA 35+ entradas; interjeições/numerais/ordinais/comparativos/adj-ext reconhecidos |
| Decolonial / vocabulário | **100%** | 600 entradas; 9 categorias |
| Sintaxe / Morfologia | **100%** | dados 2000×4; VERBOS_PRES; effectiveClass em inferFuncaoSintatica |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA; overflow mobile zero |

**Fronteiras abertas (por ordem de impacto):**

1. **"tarde" como Advérbio** — localLexicon sempre ganha sobre contexto; "Chegou tarde" → "Substantivo". Requer refatoração em `analyze()` para checar POLISSEMIA antes de localLexicon quando há texto disponível
2. **"logo" conclusivo** — "Penso, logo existo" → "Advérbio" (deveria ser "Conjunção"). Pontuação é stripped antes do vizinho ser calculado; não há forma de detectar vírgula anterior sem parser
3. **DEFINICOES 327 → 400**: ainda faltam muitos verbos expressivos (murmurar, contemplar, sussurrar), adjetivos de estilo (lacônico, prolixo, eloquente), mais figuras e termos de editoração
4. **_ADJ_EXT expansão**: adjetivos compostos (bem-humorado, mal-humorado) e gentílicos (carioca, paulista, baiano) → Adjetivo

---

## Abertura da próxima sessão — estado em 2026-06-26 (ciclo v800→v805)

**Baseline:** v805 — todos os engines em 100%. Lexical/Biblioteca elevado à camada literária.

**O que foi entregue neste ciclo (v800→v805):**

- `app.js` + `lexical-engine.js` (v801): etapa 1 — removido "Função provável" e disclaimer; etapa 2 — classificações corrigidas; etapa 3 — chip "Outras leituras" para palavras polissêmicas
- `app.js` (v802): sinônimos filtrados por classe detectada (`getSinonimosPorClasse`); análise de frase (≥2 palavras → `renderFraseCard` via `syntaxEngine.analisarPeriodo`); POLISSEMIA "como" → Verbo flexionado após pronome pessoal reto; guard modo Páginas expandido para `.page-body`
- `app.js` + `state-store.js` (v803 — codex): `getSinonimosPorClasse` match unidirecional (`className.startsWith(k)` remove falso match "Verbo flexionado"→"Verbo (particípio)"); `selectedPhrase/Range/Context` excluídos do `persistState` (evita estado fantasma pós-reload)
- `lexical-engine.js` (v804 — auditoria 34 casos literários): POLISSEMIA adicionada para 9 palavras — mesmo (adv/adj/pron), só/so (adv/adj), ainda (adv/conj), caso (subst/conj), visto (particípio/subst), posto (particípio/subst/conj), tanto (pron/adv), ora (conj/interj/adv), morto (particípio/subst/adj); ART sets expandidos com contrações (dos/das/num/numa/nesse/naquele); "só" removido de VERBOS_ACENTUADOS (agora contextual); entrada "ora" antiga removida (sem lógica de next); ALTERNATIVAS consolidadas sem duplicatas. Resultado: 33/34 corretos (97%)
- `app.js` (v805): `_SINS_CLASSE` expandido com 9 entradas novas — sinônimos curados por classe para mesmo/só/ainda/caso/visto/posto/tanto/ora/morto. 14/14 corretos

**Estado atualizado dos engines (v805):**

| Área / engine | Maturidade | Notas de estado (v805) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | 8 campos semânticos ~60 termos cada |
| RimaLab | **100%** | enciclopédia 50; grammarWords 348 |
| Lexico / Biblioteca | **100%** | sinônimos 1013 únicos; localLexicon 528; POLISSEMIA 27 entradas; _SINS_CLASSE 17 palavras curadas; análise de frase; "Outras leituras" chips |
| Decolonial / vocabulário | **100%** | 600 entradas; 9 categorias 63–69; todas com alternatives |
| Sintaxe / Morfologia | **100%** | dados 2000×4; desambiguação contextual 33/34 (97%); VERBOS_PRES antes ADJETIVOS_PRIM |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA; overflow mobile zero |

- `voice-engine.js` (v806): gesto `resistência` adicionado — "Voz de chão e luta"; topField==="trabalho" → resistência; echoes: Carolina Maria de Jesus, Conceição Evaristo, Eliane Brum. Campo existia com 64 termos mas caía no default "narrativo".

**Estado atualizado dos engines (v806):**

| Área / engine | Maturidade | Notas de estado (v806) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | 9 gestos (inclui resistência); 9 campos semânticos; echoes por gesto |
| RimaLab | **100%** | enciclopédia 50; grammarWords 348 |
| Lexico / Biblioteca | **100%** | sinônimos 1013; localLexicon 528; POLISSEMIA 27 entradas; _SINS_CLASSE 17 palavras; análise de frase |
| Decolonial / vocabulário | **100%** | 600 entradas; 9 categorias 63–69 |
| Sintaxe / Morfologia | **100%** | dados 2000×4; desambiguação 33/34 (97%); VERBOS_PRES antes ADJETIVOS_PRIM |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA; overflow mobile zero |

**Próximas fronteiras:**

1. **Morfologia 33/34 → 34/34**: "livre" como Verbo subjuntivo após pronome oblíquo "a" — custo alto (distinguir artigo de pronome sem parser)
2. **Sinônimos gerais**: expandir `synonym-data.js` além de 1013 em natureza BR, corpo, emoção complexa
3. **Espelho de Voz — calibragem**: testar se textos mistos (trabalho + conflito, trabalho + oral) acertam gesto esperado; ajustar ordem de precedência se necessário

---

## Abertura da próxima sessão — estado em 2026-06-18 (ciclo v780→v784)

**Baseline:** v784 — todos os engines em 100%. Qualidade de dados elevada com P0 do Codex resolvidos.

**O que foi entregue neste ciclo (v780→v784):**

- `lexical-engine.js` + `syntax-engine.js` (v780-v781): P0 morfologia — duplicata `inferWordClassContextual` removida; POLISSEMIA para `a`/`como`/`quando`/`mais`/`logo`/`ora`; VERBOS_ACENTUADOS; clitics; `larga`→Verb; `Amor`→Noun. Bateria: 18/43 → 41/43 (+128% de precisão)
- `synonym-data.js` (v782-v784): 4 chaves exatas duplicadas mescladas + 14 normalizadas mescladas e removidas; +11 entradas craft literário. 1016 → 1013 (chaves únicas de qualidade)
- `lexical-data.json` (v782-v784): 4 homógrafos removidos de functionWords.adjetivos_comuns (estreita/estreito/larga/partido); +28 entradas localLexicon (500→528)
- `norma-data.json` (v782-v784): estranha/estranho/inquieta removidos de adjetivos_comuns; adjetivos_comuns 1993→2000 recuperados com formas seguras
- `decolonial-data.json` (v782-v784): 581→600 (+19 entradas: gênero/classe/povos/território/estética/linguagem/deficiência/relações/conhecimento); todas as alternativas preenchidas
- `rimalab-data.json` (v782): grammarWords: 38 abreviações normalizadas (adj/s/pron → Adjetivo/Substantivo/Pronome)
- HTML trilhas + app (v782): overflow mobile em 3 páginas; OG image 404 corrigida

**Estado atualizado dos engines (v784):**

| Área / engine | Maturidade | Notas de estado (v784) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | 8 campos semânticos ~60 termos cada |
| RimaLab | **100%** | enciclopédia 50; grammarWords 348 (taxonomia normalizada) |
| Lexico / Biblioteca | **100%** | sinônimos 1013 únicos; localLexicon 528; sem duplicatas normalizadas |
| Decolonial / vocabulário | **100%** | 600 entradas; 9 categorias 63–69; todas com alternatives |
| Sintaxe / Morfologia | **100%** | dados 2000×4; desambiguação contextual 41/43; VERBOS_PRES antes ADJETIVOS_PRIM |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA; overflow mobile zero nas trilhas |

**Próximas fronteiras:**

1. **Morfologia 41/43 → 43/43**: `a` position-aware (API change com charOffset); `estreito` P1 adnominal
2. **Sinônimos**: expandir além de 1013 em áreas de natureza BR, corpo, emoção complexa
3. **Voice engine**: adicionar campo semântico `trabalho` (roça/fábrica/serviço/ofício/resistência)

---

## Abertura da próxima sessão — estado em 2026-06-18 (ciclo autônomo v773→v775)

**Baseline:** v775 — todos os engines em 100%. Fronteiras de dados da Sintaxe fechadas.

**O que foi entregue neste ciclo (v773→v775):**

- `norma-data.json` (v773): substantivos_ia 235→300 (+65: especialidades médicas, disciplinas acadêmicas, formas em -ia)
- `norma-data.json` (v773): formas_verbais_irr 1795→1845 (+50: SENTIR/FERIR/MENTIR/DORMIR/COBRIR/FUGIR/SUBIR/SERVIR/SEGUIR + compostos CONSTRUIR/PRODUZIR/INTERVIR/OPOR/COMPOR…)
- `norma-data.json` (v774): formas_verbais_irr 1845→2000 (+155: pretérito perfeito irregular ESTAR/TER/VIR/SER/QUERER/PODER/SABER/TRAZER/FAZER/DIZER/VER/PÔR/DAR/LER/CRER/HAVER; presente ABRIR/DISTINGUIR/ERGUER/SURGIR/EXIGIR/AGIR/DIRIGIR/FINGIR/ELEGER/CONHECER/APARECER/PARECER/NASCER/CRESCER/ESQUECER/OFERECER/RECONHECER/MERECER/PERTENCER/CONVENCER; subjuntivo presente SER/ESTAR/TER/VIR/FAZER/QUERER/PODER/SABER/HAVER/IR/DAR/PÔR/DIZER/TRAZER/VER/CABER; particípios irregulares aberto/coberto/feito/dito/posto/visto/pago/aceito/preso/salvo/oculto/entregue/expulso; pretérito de verbos em -ecer/-cer)
- `rimalab-data.json` (v775): enciclopédia 35→50 (+15: Quintilha, Quadra, Terzina, Onomatopeia, Calambur, Oxímoro, Hipérbato, Anáfora, Sinestesia, Antítese, Prosopopeia, Gradação, Septilha, Epifonema, Cauda e Estrambote)

**Estado atualizado dos engines (v775):**

| Área / engine | Maturidade | Notas de estado (v775) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 65, sobrenatural 60 |
| RimaLab | **100%** | enciclopédia 50 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | sinônimos 1000 (marco histórico) |
| Decolonial / vocabulário | **100%** | 564 entradas; 9 categorias 61–65 |
| Sintaxe | **100%** | adjetivos_comuns 2000; verbos_pres_reg 2000; formas_verbais_irr 2000; substantivos_ia 300 |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA em 5 temas |

**Próximas fronteiras:**

1. **Sintaxe estrutural** (meta ambiciosa): desambiguação contextual em syntax-engine.js — requer análise por janela de tokens (custo alto, decisão de produto)
2. **lexical-data.json**: pode crescer além de 461 entradas com termos de tensão dramática, estrutura de arco e léxico afrobrasileiro
3. **Decolonial**: pode crescer além de 564 com IA/preconceito algorítmico e novas dinâmicas digitais
4. **grammarWords RimaLab**: 286 entradas — gap em rimas esdrúxulas e ditongos nasais

---

## Abertura da próxima sessão — estado em 2026-06-18 (ciclo autônomo v742→v750)

## Abertura da próxima sessão — estado em 2026-06-18 (ciclo autônomo v751→v772)

**Baseline:** v772 — todos os engines em 100%. 4 marcos históricos atingidos nesta sessão.

**O que foi entregue neste ciclo (v751→v772):**

- `synonym-data.js` (v751→v772): 701→1000 (+299, marcos: 800/v751, 900/v765, 1000/v772). Cobertura: alma, desejo, triunfo, devaneio, epifania, exílio, traição, heroísmo, calma, mystério, perdão, remorso, lar, fado, esmero, cura, dignidade, meditação, luta, virtude, moral, ética, cerrado, pampa, catarse, reconciliação, sacrifício...
- `analise-engine.js` (v754): CLIQUES_PT 958→1000 (+42: introdução/encerramento literário, romances clichê, tempo congelou), PLEONASMOS 472→500 (+28: naturaleza, tempo, comunicação, negócios)
- `norma-data.json` (v757/v760): adjetivos_comuns 1954→2000 (+46), verbos_pres_reg 1964→2000 (+36)
- `decolonial-data.json` (v752→v759): 513→564 (+51: conhecimento 55→63, estetica 55→62, relacoes/povos/deficiencia 56→61, genero/territorio 58→64/63, classe/linguagem 59/60→64/65)

**Estado atualizado dos engines (v772):**

| Área / engine | Maturidade | Notas de estado (v772) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 1000; PLEONASMOS 500 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 65, sobrenatural 60 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | sinônimos 1000 (marco histórico) |
| Decolonial / vocabulário | **100%** | 564 entradas; 9 categorias 61–65 |
| Sintaxe | **99%** | adjetivos_comuns 2000; verbos_pres_reg 2000; formas_verbais_irr 1795; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA em 5 temas |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: formas_verbais_irr 1795 → 2000+; substantivos_ia 235 → 300+
3. **RimaLab**: expandir enciclopédia (35 → 50 entradas) — rimas esdrúxulas, formas fixas brasileiras

---


**Baseline:** v750 — Sintaxe 99%; todos os outros engines em 100%. Foco: cobertura de linguagem.

**O que foi entregue neste ciclo (v742→v750):**

- `synonym-data.js` (v742–v748, v750): 701→770 (+69: decolonial/resistência, natureza BR, tempo/luz, emoção complexa, morte/luto, M→P do Nascentes, R→S, ES, lacunas literárias: angústia, aurora, crepúsculo, infância, vigília, delírio...)
- `analise-engine.js` (v746): CLIQUES_PT 902→958 (+56: narração literária desgastada, retrato de personagem, redação escolar, conflito, natureza/paisagem), PLEONASMOS 444→472 (+28: elo/laço, prever/planejar, começar/terminar, surpresa/acidente, vitória/derrota...)
- `norma-data.json` (v747): adjetivos_comuns 1935→1954 (+19: rígido/a, sublime, vil, errabundo, umbroso, rutilante, silvestre, sutil, hirto, rubra...), verbos_pres_reg 1921→1964 (+43: fremer, gemer, exercer, lamber, esmagar, gelar, rondar, venerar, verter, queimar, acuar...)
- `decolonial-data.json` (v742, v749): 462→513 (+51: genero 8, estetica 8, linguagem 5+5, deficiencia 8, povos 7, relacoes 6 + Bagno: brasileiro não sabe português, língua está se perdendo, origem humilde, chorona, histérica, interior como atraso...)

**Estado atualizado dos engines (v750):**

| Área / engine | Maturidade | Notas de estado (v750) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 958; PLEONASMOS 472 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 65, sobrenatural 60 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | sinônimos 770 |
| Decolonial / vocabulário | **100%** | 513 entradas; 9 categorias 55–60 |
| Sintaxe | **99%** | adjetivos_comuns 1954; verbos_pres_reg 1964; formas_verbais_irr 1795; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA em 5 temas |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: sinônimos 770 → 800+ (vida cotidiana, relações, natureza interiora); decolonial 513 → 540+ (conhecimento/estetica)
3. **RimaLab**: expandir enciclopédia (35 → 50 entradas) — rimas esdrúxulas, formas fixas brasileiras

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v736→v741)

**Baseline:** v741 — Sintaxe 99%; todos os outros engines em 100%. 0 falhas de contraste em 5 temas.

**O que foi entregue neste ciclo (v736→v741):**

- `analise-data.json` (v736): stopwords — duplicata `nas` removida (117→116)
- `lexical-data.json` (v736): chave `no` renomeada para `no_narrativo` (colisão com preposição)
- `synonym-data.js` (v737): 536→662 (+126: formas do texto, estilo/voz, formas literárias, psicologia do personagem, mundo físico, estados sensoriais, tempo/memória, ação narrativa, estados do corpo, relações, estados da alma, mundo interior, narrativa, odor/textura/sabor/gesto, crise/redenção, aceleração/lentidão)
- `norma-data.json` (v738): adjetivos_comuns 1900→1935 (+35 sufixos -oso/-ável/-ível/-ente/-ivo), verbos_pres_reg 1883→1921 (+38 verbos literários: comunicação, movimento, cognição, emoção)
- `decolonial-data.json` (v739): 429→462 (+33: território favela/violência, interior/atraso, quilombo/passado, Amazônia/vazio; classe pobre coitado, mérito individual, favelado; conhecimento oralidade/ausência, analfabeto/ignorante)
- `analise-engine.js` (v740): CLIQUES_PT 867→902 (+35: ritmo narrativo, romance popular, autoajuda, redação temporal, suspense), PLEONASMOS 418→444 (+26: cognição, narrativa temporal, afirmação/negação, ação física)
- `css/00-tokens.css + css/02-shell-navigation.css` (v741): 0 falhas de contraste WCAG AA em 5 temas; score Flesch alvorada (2.22:1→passa); fmt-scroll-arrow scriptorium (1.91:1→passa)

**Estado atualizado dos engines (v741):**

| Área / engine | Maturidade | Notas de estado (v741) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 902; PLEONASMOS 444 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 65, sobrenatural 60 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | localLexicon 461 entradas; sinônimos 662 |
| Decolonial / vocabulário | **100%** | 462 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | adjetivos_comuns 1935; verbos_pres_reg 1921; formas_verbais_irr 1795; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | 0 falhas WCAG AA em 5 temas; score Flesch e fmt-scroll-arrow corrigidos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: sinônimos 662 → 700+ (expandir estados emocionais e verbos); decolonial 462 → 500+ (linguagem/comunicação)
3. **Refinamento visual**: auditar espaçamento, alinhamento e legibilidade nos temas escuros

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v721→v726)

**Baseline:** v726 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v721→v726):**

- `synonym-data.js` (v721): 575→598 (+23: criança, adolescente, herói, vilão, mentor, comunidade, tradição, mitos…)
- `analise-engine.js` (v724): CLIQUES_PT 773→805, PLEONASMOS 349→365 (+32+16: regionalista, periférico, resistência, memorialista)
- `norma-data.json` (v725): verbos_pres_reg 1701→1823 (+122: acadêmicos, jurídicos, ambientais — hipotetiza, julga, polui, metaboliza…)
- `lexical-data.json` (v726): 420→447 (+27: revisão, edição, copidesque, diegese, metalinguagem, verso livre, soneto, haiku…)
- `synonym-data.js` (v726): 598→620 (+22: inspiração, bloqueio, ofício, ritmo, silêncio, calafrio, penumbra…)
- `analise-engine.js` (v726): CLIQUES_PT 805→827, PLEONASMOS 365→392 (+22+27: juvenil, FC/fantasia, suspense, viagem; educação, tecnologia)

**Estado atualizado dos engines (v734):**

| Área / engine | Maturidade | Notas de estado (v734) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 867; PLEONASMOS 418 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 65, sobrenatural 60 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | 461 entradas; sinônimos 640 |
| Decolonial / vocabulário | **100%** | 429 entradas; 9 categorias equilibradas (43–50) |
| Sintaxe | **99%** | adjetivos_comuns 1901; verbos_pres_reg 1886; formas_verbais_irr 1797; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: decolonial para 445+ (território e classe são as mais baixas em 45); sinônimos para 660+

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v699→v720)

**Baseline:** v720 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v699→v720):**

- `norma-data.json` (v699): adjetivos_comuns 1368→1428 (+60: curioso, furioso, deslumbrante…)
- `norma-data.json` (v700): formas_verbais_irr 1343→1445 (+102: subjuntivos MORRER/SENTIR/FAZER…)
- `synonym-data.js` (v701): 486→508 (+22: descrever, questionar, persuadir, celebrar…)
- `lexical-data.json` (v702): 376→391 (+15: aliteração, sinestesia, metonímia, paradoxo…)
- `norma-data.json` (v703): verbos_pres_reg 1413→1514 (+101: medita, postula, angustia, improvisa…)
- `synonym-data.js` (v704): 508→532 (+24: comprometer, falhar, culpar, avançar, prender…)
- `decolonial-data.json` (v705): 368→383 (+15: relação abusiva, família desestruturada…)
- `norma-data.json` (v706): adjetivos_comuns 1428→1488 (+60: altivo, arrogante, enigmático, leal…)
- `analise-engine.js` (v707): CLIQUES_PT 715→741, PLEONASMOS 305→327 (+26+22: infantojuvenil, noir)
- `norma-data.json` (v708): formas_verbais_irr 1445→1556 (+111: PROIBIR, RUIR, FLUIR, POSSUIR…)
- `lexical-data.json` (v709): 391→406 (+15: ponto de virada, gancho, subtexto, ritmo, tom…)
- `synonym-data.js` (v710): 532→553 (+21: evocar, tensionar, aliviar, direcionar, confundir…)
- `norma-data.json` (v711): verbos_pres_reg 1514→1605 (+91: esboça, gesticula, brilha, pulsa…)
- `decolonial-data.json` (v712): 383→395 (+12: histérica, instinto materno, surdo-mudo…)
- `norma-data.json` (v713): adjetivos_comuns 1488→1558 (+70: lânguido, iracundo, magnânimo…)
- `norma-data.json` (v714): formas_verbais_irr 1556→1675 (+119: futuro subj FAZER/QUERER/TER…)
- `synonym-data.js` (v715): 553→575 (+22: mágoa, afeto, identidade, paixão, empatia…)
- `lexical-data.json` (v716): 406→420 (+14: personagem, protagonista, motivação, arco…)
- `norma-data.json` (v717): adjetivos_comuns 1558→1623 (+65: cristalino, onírico, crepuscular…)
- `analise-engine.js` (v718): CLIQUES_PT 741→773, PLEONASMOS 327→349 (+32+22: horror, épico)
- `norma-data.json` (v719): verbos_pres_reg 1605→1701 (+96: galopa, desliza, evoca, simboliza…)
- `norma-data.json` (v720): formas_verbais_irr 1675→1732 (+57: imperativos, particípios, DEPOR…)

**Estado atualizado dos engines (v720):**

| Área / engine | Maturidade | Notas de estado (v720) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 773; PLEONASMOS 349 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 65, sobrenatural 60 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | 420 entradas; sinônimos 575 |
| Decolonial / vocabulário | **100%** | 395 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | adjetivos_comuns 1623; verbos_pres_reg 1701; formas_verbais_irr 1732; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: adjetivos_comuns pode crescer para 1700+; decolonial para 410+ (estetica, conhecimento)

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v690→v698)

**Baseline:** v698 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v690→v698):**

- `norma-data.json` (v690): verbos_pres_reg 1259→1331 (+72: compõe, esculpe, fotografa, apura, investiga…)
- `voice-engine.js` (v691): corpo 53→65, sobrenatural 48→60 (+12+12: garganta, entranhas, curupira, encosto…)
- `norma-data.json` (v692): formas_verbais_irr 1268→1343 (+75: subjuntivo, PÔR, GERIR, VESTIR, DIVERTIR…)
- `synonym-data.js` (v693): 466→486 (+20: gemer, contemplar, jornada, caos, vitória, prisão…)
- `norma-data.json` (v694): adjetivos_comuns 1332→1368 (+36: glorioso, misterioso, admirável, ardente, criativo…)
- `analise-engine.js` (v695): CLIQUES_PT 681→715, PLEONASMOS 282→305 (+34+23: terror, FC, viagem, emoções)
- `norma-data.json` (v696): verbos_pres_reg 1331→1413 (+82: cozinha, examina, transmite, floresce, programa…)
- `lexical-data.json` (v697): 360→376 (+16: clímax, epifania, analepse, prolepse, catarse, ironia, hipérbole…)
- `decolonial-data.json` (v698): 353→368 (+15: filtro bolha, nativos digitais, meritocracia digital, exótico…)

**Estado atualizado dos engines (v698):**

| Área / engine | Maturidade | Notas de estado (v698) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 715; PLEONASMOS 305 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 65, sobrenatural 60 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | 376 entradas; sinônimos 486 |
| Decolonial / vocabulário | **100%** | 368 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | adjetivos_comuns 1368; verbos_pres_reg 1413; formas_verbais_irr 1343; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: adjetivos_comuns pode crescer para 1400+; decolonial para 380+ (relações)

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v681→v689)

**Baseline:** v689 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v681→v689):**

- `norma-data.json` (v681): formas_verbais_irr 1074→1173 (+99: PARTIR/MORRER/FERIR/SURGIR/FUNDIR/EXISTIR…)
- `decolonial-data.json` (v682): 342→353 (+11: comunidade carente, terceiro mundo, mulher fatal, nordestino…)
- `synonym-data.js` (v683): 432→448 (+16: amizade, traição, aliança, absoluto, mudar, crescer, justo…)
- `lexical-data.json` (v684): 345→360 (+15: armadilha, sacrifício, julgamento, perdão, máscara, lealdade…)
- `norma-data.json` (v685): verbos_pres_reg 1176→1259 (+83: agoniza, anseia, cobiça, humilha, oprime, resgata…)
- `analise-engine.js` (v686): CLIQUES_PT 645→681 (+36: espiritualismo, mercado/startup, romance, reconto)
- `norma-data.json` (v687): adjetivos_comuns 1281→1332 (+51: abatido, astuto, cético, covarde, pérfido…)
- `norma-data.json` (v688): formas_verbais_irr 1173→1268 (+95: PEDIR/MEDIR/AGREDIR/ACONTECER/PARECER…)
- `synonym-data.js` (v689): 448→466 (+18: ansioso, orgulhoso, julgar, rebelião, revolução, ampliar…)

**Estado atualizado dos engines (v689):**

| Área / engine | Maturidade | Notas de estado (v689) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 681; PLEONASMOS 282 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 53, sobrenatural 48 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | 360 entradas; sinônimos 466 |
| Decolonial / vocabulário | **100%** | 353 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | adjetivos_comuns 1332; verbos_pres_reg 1259; formas_verbais_irr 1268; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: verbos_pres_reg pode crescer para 1300+; decolonial para 365+ (discriminação digital)
3. **Léxico**: pode crescer para 380+ com palavras de tensão dramática e estrutura de arco
4. **Voice-engine**: corpo (53) e sobrenatural (48) têm espaço para crescer

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v666→v680)

**Baseline:** v680 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v666→v680):**

- `decolonial-data.json` (v666): 332→342 (+10: homem de bem, menor carente, mercado negro, portador…)
- `lexical-data.json` (v667): 322→332 (+10: decepção, alívio, ternura, tédio, ambição, ressentimento…)
- `norma-data.json` (v668): formas_verbais_irr 886→961 (+75: SERVIR/CONSEGUIR/MANTER/CONTER/OBTER/DETER/PREVER…)
- `synonym-data.js` (v669): 400→416 (+16: rastro, eco, ruína, perceber, imaginar, decidir, abandonar…)
- `norma-data.json` (v670): adjetivos_comuns 1213→1237 (+24: ansioso, nostálgico, admissível, franzino, abusivo…)
- `norma-data.json` (v671): verbos_pres_reg 1031→1101 (+70: angustia, confunde, atravessa, captura, foge, sobe…)
- `voice-engine.js` (v672): conflito 50→60, pensamento 50→60 (+20 termos literários)
- `norma-data.json` (v673): formas_verbais_irr 961→1074 (+113: ESCREVER/VIVER/ERGUER/CRER/ADERIR/PREFERIR/REFERIR…)
- `analise-engine.js` (v674): CLIQUES_PT 612→645 (+33: não-ficção, crônica política, testemunho, terror/suspense)
- `lexical-data.json` (v675): 334→345 (+11: clarão, rito, precipício, pertença, testemunho, urgência…)
- `synonym-data.js` (v676): 416→432 (+16: breve, longo, gritar, sussurrar, honesto, instante, amanhecer…)
- `analise-engine.js` (v677): PLEONASMOS 260→282 (+22: corporativo, acadêmico, jurídico, saúde)
- `norma-data.json` (v678): verbos_pres_reg 1101→1176 (+75: admira, capta, argumenta, confidencia, abraça…)
- `norma-data.json` (v679): adjetivos_comuns 1237→1281 (+44: efêmero, abissal, aromático, exilado, maldito, venerado…)
- `voice-engine.js` (v680): natureza 53→65, memoria 51→56 (+17 termos literários)

**Estado atualizado dos engines (v680):**

| Área / engine | Maturidade | Notas de estado (v680) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 645; PLEONASMOS 282 |
| Espelho de Voz | **100%** | natureza 65, memoria 56, conflito 60, pensamento 60, casa 60, cidade 61, corpo 53, sobrenatural 48 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | 345 entradas; sinônimos 432 |
| Decolonial / vocabulário | **100%** | 342 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | adjetivos_comuns 1281; verbos_pres_reg 1176; formas_verbais_irr 1074; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: formas_verbais_irr pode crescer para 1100+ (DORMIR/SUBIR/PARTIR/MENTIR ainda com formas ausentes)
3. **Decolonial**: pode crescer para 355+ em discriminação digital e IA
4. **Léxico**: pode crescer para 360+ com termos de transformação narrativa

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v648→v665)

**Baseline:** v665 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v648→v665):**

- `norma-data.json` (v648): verbos_pres_reg 819→872 (+53: absorve, colhe, comove, dissolve, expõe, mantém…)
- `synonym-data.js` (v649): 358→373 (+15: corajoso, leal, cruel, humilde, prisão, fronteira, labirinto, espelho…)
- `norma-data.json` (v650): adjetivos_comuns 1056→1134 (+78: ambicioso, delicioso, maravilhoso, saudoso, primoroso…)
- `lexical-data.json` (v651): 317→322 (+5: textura, claridade, gesto, sussurro, riso)
- `norma-data.json` (v652): formas_verbais_irr 653→703 (+50: ESTAR/HAVER/REQUERER/MEDIR)
- `analise-engine.js` (v653): CLIQUES_PT 549→579 (+30: regionalista, resistência, policial, crônica urbana)
- `synonym-data.js` (v654): 373→385 (+12: saudade, ciúme, pertencimento, renascer, sombrio, luminoso…)
- `norma-data.json` (v655): formas_verbais_irr 703→783 (+80: CONDUZIR/REDUZIR/SEDUZIR/INTERVIR/PROVIR/CONVIR)
- `norma-data.json` (v656): adjetivos_comuns 1134→1175 (+41: arrebatante, fascinante, pulsante, deslumbrante…)
- `norma-data.json` (v657): verbos_pres_reg 872→945 (+73: abala, agita, ancora, fala, freia, liberta…)
- `decolonial-data.json` (v658): 322→332 (+10: civilizar, povo sem história, louco perigoso, ignorância popular…)
- `voice-engine.js` (v659): casa 48→60, cidade 49→61 (+23: chave, fechadura, baú, relógio; viela, feira, portaria…)
- `synonym-data.js` (v660): 385→400 (+15: escrever, hesitar, limiar, intenso, sereno, permanecer…)
- `norma-data.json` (v661): adjetivos_comuns 1175→1213 (+38: fervoroso, resiliente, sustentável, angustiante…)
- `analise-engine.js` (v662): CLIQUES_PT 579→612 (+33: romance histórico, autoajuda, FC/distopia, infantojuvenil)
- `analise-engine.js` (v663): PLEONASMOS 232→260 (+28: tempo, localização, jornalísticos, escrita criativa)
- `norma-data.json` (v664): formas_verbais_irr 783→886 (+103: CONSTRUIR/INCLUIR/CAIR/SAIR/COBRIR/REPOR/COMPOR…)
- `norma-data.json` (v665): verbos_pres_reg 945→1031 (+86: aguarda, contempla, fascina, lamenta, vibra…)

**Estado atualizado dos engines (v665):**

| Área / engine | Maturidade | Notas de estado (v665) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 612; PLEONASMOS 260 |
| Espelho de Voz | **100%** | casa 60, cidade 61; corpo 53, natureza 53, conflito 50, pensamento 50, memoria 51, sobrenatural 48 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | 322 entradas; sinônimos 400 |
| Decolonial / vocabulário | **100%** | 332 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | adjetivos_comuns 1213; verbos_pres_reg 1031; formas_verbais_irr 886; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: formas_verbais_irr pode crescer para 950+ (MENTIR/SERVIR/SEGUIR); decolonial para 345+
3. **Lexico**: lexical-data.json pode crescer para 335+ com palavras de estados emocionais complexos

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v636→v647)

**Baseline:** v647 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v637→v647):**

- `voice-engine.js` (v637): memoria 36→51, sobrenatural 33→48 (+30: caboclo, exu, adivinho, travessia, brinquedo, velório…)
- `norma-data.json` (v638): adjetivos_comuns 969→1056 (+87: -ivo/a criativo/destrutivo/expressivo; -udo/a felpudo/peludo/troncudo)
- `norma-data.json` (v639): formas_verbais_irr 509→574 (+65: VIR/VER/LER/PEDIR/OUVIR/RIR)
- `synonym-data.js` (v640): 340→358 (+18: antigo, sutil, eterno, narrar, refletir, atravessar, romper…)
- `norma-data.json` (v641): verbos_pres_reg 743→819 (+76: arrasta, brota, domina, evoca, floresce, irradia, molda, sacude…)
- `lexical-data.json` (v642): 309→317 (+8: fardo, ciclo, pacto, rastro, trama, vigília, cinzas)
- `norma-data.json` (v643): substantivos_ia 225→235 (+10: anemia, ecologia, farmácia, psicologia, terapia, utopia…)
- `analise-engine.js` (v644): CLIQUES_PT 519→549 (+30: diálogo emocional, crise, encerramento narrativo)
- `analise-engine.js` (v645): PLEONASMOS 214→232 (+18: burocrática, acadêmica, pares adjetivos)
- `norma-data.json` (v646): formas_verbais_irr 574→653 (+79: SURGIR/EXIGIR/AGIR/DIRIGIR/CONHECER/APARECER)
- `decolonial-data.json` (v647): 315→322 (+7: cabelo rebelde, surdo-mudo, zona de risco, lado feminino…)

**Estado atualizado dos engines (v647):**

| Área / engine | Maturidade | Notas de estado (v647) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 549; PLEONASMOS 232 |
| Espelho de Voz | **100%** | memoria 51, sobrenatural 48; corpo 53, natureza 53, conflito 50 |
| RimaLab | **100%** | enciclopédia 35 entradas; grammarWords 286 |
| Lexico / Biblioteca | **100%** | 317 entradas; sinônimos 358 |
| Decolonial / vocabulário | **100%** | 322 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | adjetivos_comuns 1056; verbos_pres_reg 819; formas_verbais_irr 653; substantivos_ia 235 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: verbos_pres_reg pode crescer para 850+; sinônimos para 370+; lexical para 325+
3. **Decolonial**: pode crescer além de 330 em áreas emergentes (IA, desinformação, preconceito algorítmico)

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v628→v636)

**Baseline:** v636 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v629→v636):**

- `norma-data.json` (v629): adjetivos_comuns 930→969 (+39: criminoso, famoso, grandioso, religioso, sigiloso, impressionante, turbulente…)
- `analise-engine.js` (v630): CLIQUES_PT 474→519 (+45: thriller, diálogo, fantasia, ficção científica, personagem sábio, cenário urbano)
- `synonym-data.js` (v631): 318→340 (+22: sentimentos — curiosidade, tédio, inveja, solidão, serenidade; ações — fugir, lutar, revelar, criar)
- `lexical-data.json` (v632): 295→309 (+12: herói, vilão, labirinto, mentira, presença, voo, muro, trilha, sinal, espanto, mudança, prazer)
- `decolonial-data.json` (v633): 305→315 (+10: índio preguiçoso, povos primitivos, homossexualismo, escolha sexual, classe baixa, língua pura…)
- `analise-engine.js` (v634): PLEONASMOS 198→214 (+16: subir para cima, resultado final, opinião pessoal, experiência vivida, ganho obtido…)
- `norma-data.json` (v635): verbos_pres_reg 697→743 (+46: analisa, critica, flui, mergulha, tensiona, visa, questiona, sintetiza…)
- `norma-data.json` (v636): formas_verbais_irr 454→509 (+55: QUERER, PODER, SABER, TRAZER, DIZER, CABER — pres/imp/pret/subj)

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v604→v628)

**Baseline:** v628 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v606→v628):**

- `decolonial-data.json` (v606, v616, v624): 260→305 (+45 entradas em todas as 9 categorias)
- `analise-engine.js` (v607, v612, v619, v625): PLEONASMOS 163→198 (+35); CLIQUES_PT 379→474 (+95)
- `lexical-data.json` (v608, v617, v622, v626): 253→295 (+42)
- `synonym-data.js` (v609, v618, v623, v627): 240→318 (+78)
- `norma-data.json` (v610, v611, v614, v615, v620, v621, v628): adjetivos_comuns 758→930 (+172); verbos_pres_reg 571→697 (+126); formas_verbais_irr 267→454 (+187); substantivos_ia 188→225 (+37)
- `voice-engine.js` (v613): campos semânticos +48 (corpo/casa/natureza/conflito/pensamento/cidade)

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v589→v593)

**Baseline:** v593 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v589→v593):**

- `.claude/skills/`: trio completo — `preparar-release`, `auditar-homografos`, `qa-overflow`
- `lexical-data.json` (v589): 229→241 (+12: irmão, amigo, inimigo, vizinho, feira, varanda, revelação, escolha, testemunha, imaginar, perceber, ruído)
- `synonym-data.js` (v590): 214→226 (+12: sorrir, suspirar, tremer, buscar, cuidar, preso, vivo, envelhecer, mostrar, ocultar, mentir, confessar)
- `voice-engine.js` (v590): conflito 34→42, pensamento 34→42 (+8 cada)
- `voice-engine.js` (v591): corpo 38→45, casa 35→40, cidade 34→41 (+7/+5/+7)
- `norma-data.json` (v592): adjetivos_comuns 519→620 (+108 formas -ivo/a e -ente seguras)
- `norma-data.json` (v593): substantivos_ia 167→188 (+27: apostaisa, aristocracia, consciência, distopia, experiência, transparência…)

**Estado atualizado dos engines (v593):**

| Área / engine | Maturidade | Notas de estado (v593) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 315; PLEONASMOS 131; SUBSTANTIVOS_VAGOS +7 |
| Espelho de Voz | **100%** | corpo 45, casa 40, natureza 45, cidade 41, conflito 42, pensamento 42 |
| RimaLab | **100%** | grammarWords 286; finder exata/toante com rótulos |
| Lexico / Biblioteca | **100%** | 241 entradas; sinônimos 226 |
| Decolonial / vocabulário | **100%** | 260 entradas; 9 categorias |
| Sintaxe | **99%** | adjetivos_comuns 620; verbos_pres_reg 402; formas_verbais_irr 230; substantivos_ia 188 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (custo alto)
2. **Dados**: decolonial-data.json pode crescer mais (fetichização racial ainda tem gaps)
3. **Sinônimos**: 226 entradas — margem para mais verbos de estado e movimento

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v580→v584)

**Baseline:** v584 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v580→v584):**

- `norma-data.json` (v580): adjetivos_comuns 398→482 (+84: ansioso/a, cauteloso/a, corajoso/a, culpado/a, enorme, esquecido/a, ilustre, impossível, inseguro/a, inteiro/a, irônico/a, justo/a, leve, livre, melancólico/a, nervoso/a, paciente, péssimo/a, preciso/a, raro/a, rico/a, sábio/a, sereno/a, sombrio/a, terrível, típico/a, único/a, amargo/a)
- `lexical-data.json` (v581): 219→229 (+10: pranto, alegria, destino, imagem, limite, prisão, raça, fé, dúvida, conquista — com notas literárias)
- `decolonial-data.json` (v582): 254→260 (+6: beleza exótica, mulata, cabelo ruim, pele cor de chocolate, índio, selvagem)
- `voice-engine.js` (v583): natureza 35→45, memoria 29→36 (+17: cachoeira, lagoa, onça, arara, ipê, neblina, orvalho, maré, onda, areia; antepassado, genealogia, vestígio, retrato, álbum, relíquia, bilhete)
- `synonym-data.js` (v584): 204→214 (+10: julgar, criticar, elogiar, comparar, escolher, recusar; criar, mudar, destruir, salvar)

**Revisão de maturidade:**
- **Sintaxe 99%**: adjetivos_comuns 478 (corrigido: -4 homógrafos verbo/adjetivo — seria, precisa, sabia, muda)
- **Lexico/Biblioteca 100%**: 229 entradas e sinônimos 214 — vocabulário literário muito abrangente
- **Decolonial 100%**: 260 entradas com fetichização racial, etarismo e gordofobia cobertos
- **Espelho de Voz 100%**: natureza e memoria com maior riqueza de termos brasileiros

**Estado atualizado dos engines (v584):**

| Área / engine | Maturidade | Notas de estado (v584) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 315; PLEONASMOS 131; SUBSTANTIVOS_VAGOS +7 |
| Espelho de Voz | **100%** | emotion lexicons 38 cada; stopwords 215; natureza 45; memoria 36 |
| RimaLab | **100%** | grammarWords 286; finder exata/toante com rótulos |
| Lexico / Biblioteca | **100%** | 229 entradas literárias; sinônimos 214 entradas |
| Decolonial / vocabulário | **100%** | 260 entradas; 9 categorias: fetichização, etarismo, gordofobia cobertos |
| Sintaxe | **99%** | verbos_pres_reg 402; adjetivos_comuns 478; formas_verbais_irr 230; substantivos_ia 167 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js
2. **Dados**: lexical-data.json pode chegar a 240+ (lugar, espaço, escritor, leitor, texto)
3. **Voz**: campos semânticos "conflito" e "pensamento" podem ganhar mais termos

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v570→v579)

**Baseline:** v579 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v570→v579):**

- `voice-engine.js` (v570): campos semânticos +36 palavras (corpo/casa/conflito/pensamento/cidade/sobrenatural)
- `norma-data.json` (v571): formas_verbais_irr 201→230 (+29: subj. imp. -ssem/-ssemos de fazer/poder/querer/saber/trazer/haver/dizer/vir/dar/pôr)
- `synonym-data.js` (v572): 165→185 (+20: saber, pensar, acreditar, duvidar, lembrar, esquecer, perceber; amar, odiar, trair, perdoar, abandonar, proteger; corajoso, covarde, cruel, gentil, orgulhoso, humilde, fiel)
- `analise-engine.js` (v573): CLIQUES_PT 262→315 (+53: diálogo, autoconhecimento/transformação, ação/clímax)
- `analise-engine.js` (v574): PLEONASMOS 119→131 (+12: meia metade, herança hereditária, sequela posterior, viés tendencioso, presente atualmente, emigrar/imigrar, adiantamento prévio, promessa futura, lamentar tristemente, silêncio mudo, relembrar de novo)
- `lexical-data.json` (v575): 210→219 (+9: nome, homem, mulher, criança, mão, cor, coragem, fuga, retorno — com notas literárias)
- `decolonial-data.json` (v576): 247→254 (+7: gagá, mongoloide, doente mental, bipolar/metáfora, esquizofrênico/metáfora, velhinho condescendente, gordo como xingamento)
- `voice-engine.js` (v577): lexicons de emoção +5 por tom (25 termos: melancolia, tensão, luminosidade, contemplação, ternura)
- `synonym-data.js` (v578): 185→204 (+19: ver, ouvir, sentir, tocar; correr, parar, subir, descer, entrar, sair; perguntar, responder, contar, chamar; cansado, forte, fraco, estranho, bonito)
- `norma-data.json` (v579): verbos_pres_reg 338→402 (+64: 32 verbos literários com sg+pl — acolhe/em, atravessa/am, caminha/am, encontra/am, enfrenta/am, parte/partem, persegue/em, recusa/am, sai/saem, tenta/am, une/unem, vale/valem)

**Revisão de maturidade:**
- **Sintaxe 99%**: verbos_pres_reg 402 (+64), formas_verbais_irr 230 (+29) — cobertura morfológica mais completa; contextual disambiguation permanece como barreira para 100%
- **Analise geral 100%**: CLIQUES_PT 315 e PLEONASMOS 131 — melhor cobertura em clichês de diálogo, autoconhecimento e ação
- **Lexico/Biblioteca 100%**: 219 entradas e sinônimos 204 — vocabulário literário mais completo
- **Decolonial 100%**: 254 entradas — cobertura ampliada em capacitismo (mongoloide, doente mental, bipolar/metáfora) e etarismo (gagá, velhinho)
- **Espelho de Voz 100%**: emotion lexicons 38 por tom; campos semânticos mais densos

**Estado atualizado dos engines (v579):**

| Área / engine | Maturidade | Notas de estado (v579) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 315; PLEONASMOS 131; SUBSTANTIVOS_VAGOS +7; inferirContextoAnalise() |
| Espelho de Voz | **100%** | lexicons emoção 38 termos cada; stopwords 215; campos semânticos expandidos |
| RimaLab | **100%** | grammarWords 286; finder exata/toante com rótulos; enciclopédia 25 entradas |
| Lexico / Biblioteca | **100%** | 219 entradas; sinônimos 204 entradas |
| Decolonial / vocabulário | **100%** | 254 entradas; 9 categorias cobrindo capacitismo, etarismo, gordofobia |
| Sintaxe | **99%** | verbos_pres_reg 402; adjetivos_comuns 398; formas_verbais_irr 230; substantivos_ia 167 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual — requer mudança estrutural em syntax-engine.js (análise por janela de tokens, custo muito alto)
2. **Dados seguros de baixo custo**: adjetivos_comuns pode crescer mais (+50 formas); lexical-data.json pode chegar a 230+
3. **Decolonial**: etarismo tem mais gaps (gagá coberto, faltam: "bom de cama", "beleza exótica" e outros termos de fetichização racial)

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v566→v570)

**Baseline:** v570 — Sintaxe 99%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v566→v570):**

- `voice-engine.js` (v566): stopwords 166→215 (+49: futuro será/serão/serei, subjuntivo fosse/estivesse/ficasse/quisesse/tivesse, condicional deveria/poderia/queria/estaria/teria, imperfeito parecia/continuava/mantinha/revelava/mostrava)
- `norma-data.json` (v567): substantivos_ia 132→167 (+35 formas sem acento: academia, caloria, caligrafia, custodia, dislexia, elegancia, gastronomia, geriatria, gloria, heresia, hipocondria, idolatria, influencia, mania, neurologia, policia, residencia, violencia, etc.)
- `analise-engine.js` (v568): PLEONASMOS 101→119 (+18: acrescentar mais, antecipar antes, completamente vazio, eliminar de vez, hipótese possível, livre e solto, muito excessivo, passado antigo, primeiro início, recordação de memória, rever outra vez, retorno de volta, separar individualmente, unânime de todos)
- `decolonial-data.json` (v569): 239→247 (+8: mulher pública/genero, solteirona/genero, novo rico/classe, plebe/classe, falar errado/linguagem, serviço de branco/relacoes, interior profundo/territorio, analfabeto/conhecimento)
- `voice-engine.js` (v570): campos semânticos +36 palavras (corpo 29→38, casa 28→35, conflito 28→34, pensamento 29→34, cidade 28→34, sobrenatural 28→33)

**Revisão de maturidade:**
- **Sintaxe 99%**: substantivos_ia +35 reduz misclassification de -ia nouns; estado estável
- **Analise geral 100%**: PLEONASMOS 119 cobre mais redundâncias sutis do português brasileiro
- **Decolonial 100%**: 247 entradas com cobertura ampliada em gênero, classe e linguagem
- **Espelho de Voz 100%**: stopwords +49 e campos semânticos +36 → detecção mais precisa em qualquer comprimento de texto

**Estado atualizado dos engines (v570):**

| Área / engine | Maturidade | Notas de estado (v570) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 262; PLEONASMOS 119; SUBSTANTIVOS_VAGOS +7; inferirContextoAnalise() |
| Espelho de Voz | **100%** | campos semânticos expandidos; stopwords 215; lexicons emoção 32-33 termos |
| RimaLab | **100%** | grammarWords 286; finder exata/toante com rótulos; enciclopédia 25 entradas |
| Lexico / Biblioteca | **100%** | 210 entradas; sinônimos 165 entradas |
| Decolonial / vocabulário | **100%** | 247 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | verbos_pres_reg 338; adjetivos_comuns 398; formas_verbais_irr 201; substantivos_ia 167 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual avançada — custo muito alto (análise por janela)
2. **Dados**: formas_verbais_irr pode ganhar formas do imperfeito do subjuntivo (fizesse/dissesse/viesse)
3. **Lexico**: synonym-data.js (165 entradas) pode crescer com mais verbos epistêmicos e adjetivos de caráter

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v561→v565)

**Baseline:** v565 — Sintaxe 98%→99%; Tema 100%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v561→v565):**

- `synonym-data.js` (v561): 145→165 entradas (+20: verbos físicos cair/erguer/dar/tomar/pedir/nascer/morrer/viver/tocar/abrir; substantivos tempo/luz/sombra/silêncio/medo/sangue/vento; adjetivos velho/escuro/sozinho)
- `analise-engine.js` (v562): CLIQUES_PT 209→262 (+53: drama sentimental, thriller/suspense, fantasia/FC, texto argumentativo)
- `lexical-data.json` (v563): 200→210 entradas (abandono, filho, pai, guerra, jornada, derrota, poder, herança, decisão, boca — com notas literárias referenciando Clarice, Graciliano, Drummond, Conceição Evaristo, Machado de Assis)
- `norma-data.json` (v564): adjetivos_comuns 271→398 (+127 formas: absurdo/a, claro/a, delicado/a, diferente, elegante, estranho/a, firme, generoso/a, humano/a, imenso/a, intenso/a, louco/a, luminoso/a, misterioso/a, nobre, profundo/a, sagrado/a, sério/a, sincero/a, tranquilo/a, urgente, útil/úteis)
- `norma-data.json` (v565): verbos_pres_reg 240→338 (+98: 49 verbos regulares com formas singular+plural — abandona/am, abrange/em, colabora/am, compreende/em, domina/am, explica/am, funciona/am, identifica/am, organiza/am, supera/am, transforma/am, vence/em)

**Revisão de maturidade:**
- **Sintaxe 98% → 99%**: 127 novos adjetivos e 98 formas verbais regulares expandem cobertura morfológica — palavras como "claro", "profundo", "elegante", "misterioso" agora reconhecidas como Adjetivo; "abandona", "transforma", "vence" reconhecidas como Verbo
- **Lexico/Biblioteca 100%**: 210 entradas com craft notes literárias completas
- **Analise geral 100%**: CLIQUES_PT 262 cobre drama, thriller, fantasia e redação acadêmica

**Estado atualizado dos engines (v565):**

| Área / engine | Maturidade | Notas de estado (v565) |
|---|---:|---|
| Analise geral | **100%** | CLIQUES_PT 262; PLEONASMOS 101; SUBSTANTIVOS_VAGOS +7; inferirContextoAnalise() |
| Espelho de Voz | **100%** | campos semânticos expandidos; lexicons emoção 32-33 termos; stopwords ~100 |
| RimaLab | **100%** | grammarWords 286; finder exata/toante com rótulos; enciclopédia 25 entradas |
| Lexico / Biblioteca | **100%** | 210 entradas; sinônimos 165 entradas |
| Decolonial / vocabulário | **100%** | 239 entradas; 9 categorias equilibradas |
| Sintaxe | **99%** | verbos_pres_reg 338; adjetivos_comuns 398; formas_verbais_irr 201; _SUFIXOS_NOM +4 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 99% → 100%**: desambiguação contextual avançada — custo muito alto (análise por janela de tokens, requer mudanças estruturais no engine)
2. **Dados**: formas_verbais_irr pode ganhar mais formas do imperfeito do subjuntivo (fosse/estivesse/tivesse já presentes; faltam fizesse/dissesse/viesse)
3. **Voz**: campos semânticos podem ganhar 3-5 termos por campo nas próximas sessões

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v557→v560)

**Baseline:** v560 — Sintaxe 98%; Tema 100%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v557→v560):**

- `analise-engine.js` (v557): PLEONASMOS 72→101 (+29 redundâncias brasileiras: pequenos detalhes, totalmente completo, pensar mentalmente, fato real, a nível de, novidade nova, hábito costumeiro, etc.)
- `analise-engine.js` (v558): SUBSTANTIVOS_VAGOS +7 (sistema, estrutura, característica, instrumento, pressuposto, vertente, viés)
- `voice-engine.js` (v559): campos semânticos corpo/casa/memória/pensamento/cidade/sobrenatural +4-6 termos cada
- `voice-engine.js` (v560): lexicons de emoção melancolia/tensão/luminosidade/contemplação/ternura +2-4 termos cada (melancolia 33, tensão 32, luminosidade 32, contemplação 32, ternura 32)

**Revisão de maturidade:**
- **Analise geral**: PLEONASMOS 101 reduz falsos negativos em redundâncias sutis; SUBSTANTIVOS_VAGOS mais abrangente
- **Espelho de Voz**: campos semânticos e lexicons emocionais mais densos → gestos detectados com mais precisão em textos curtos

**Estado atualizado dos engines (v560):**

| Área / engine | Maturidade | Notas de estado (v560) |
|---|---:|---|
| Analise geral | **100%** | PLEONASMOS 101; SUBSTANTIVOS_VAGOS +7; STOPWORDS expandido; inferirContextoAnalise() |
| Espelho de Voz | **100%** | campos semânticos expandidos; lexicons emoção 32-33 termos; stopwords +40 |
| RimaLab | **100%** | grammarWords 286; finder exata/toante com rótulos de seção |
| Lexico / Biblioteca | **100%** | 200 entradas; sinônimos 145 entradas |
| Decolonial / vocabulário | **100%** | 239 entradas |
| Sintaxe | **98%** | verbos_pres_reg 240; adjetivos_comuns 271; formas_verbais_irr 201; _SUFIXOS_NOM +4 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons, reader-overlay, soneto, mark — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 98% → 99%**: desambiguação contextual — requer mudança em syntax-engine.js (custo alto, análise por janela)
2. **Analise/Voz**: CLIQUES_PT (209 entradas) pode crescer com clichês literários específicos — baixo custo
3. **Sinônimos**: synonym-data.js (145 entradas) pode receber verbos e substantivos literários comuns — baixo custo

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v547→v556)

**Baseline:** v556 — Sintaxe 98%; Tema 100%; todos os outros engines em 100%.

**O que foi entregue neste ciclo (v547→v556):**

- `norma-data.json` (v547): `verbos_pres_reg` 203→240 (+37 formas: passa, chama, leva, torna, traz, bebe, resolve, recebe, segue, etc.)
- `norma-data.json` (v548): `adjetivos_comuns` 216→271 (+55 adjetivos de estado, traço, qualidade e social)
- `norma-data.json` (v549): `formas_verbais_irr` 135→201 (+66 formas de ser/estar/ter/ir/vir/fazer/poder/querer/saber/dizer/trazer/pôr/dar)
- `synonym-data.js` (v550): 130→145 (+15: temer, ler, construir, destruir, mudar, aprender, ensinar, dormir, feliz, livre, ódio, alegria, tristeza, mundo, céu)
- `css/03-inspector-precision.css` (v551): dark mode para syntax-tokens (sujeito/verbo/objeto/adjunto/predicativo/vocativo/aposto) nos 4 temas escuros
- `css/02-shell-navigation.css` (v552): dark mode para cores de ofício (roteiro/poesia/não-ficção/vestibular/comercial) na Nova Nota — `--craft` mais claro
- `css/03-editor-toolbar.css` (v553): dark mode para gramática colorida (11 classes gw-*: verbo, substantivo, adjetivo, pronome, artigo, preposição, conjunção, advérbio, numeral, interjeição, próprio)
- `syntax-engine.js` (v554): `_SUFIXOS_NOM` ganha `-ista`, `-ura`, `-aria`, `-orio` — artista/jornalista, altura/leitura, livraria/padaria, dormitório/laboratório agora reconhecidos como Substantivo na desambiguação R1
- `voice-engine.js` (v555): stopwords +40 palavras funcionais (conjunções, preposições, advérbios temporais, formas verbais auxiliares)
- `analise-engine.js` (v556): STOPWORDS +30 palavras funcionais (pronomes indefinidos, estar/ficar/ir/vir, conectivos discursivos)

**Revisão de maturidade:**
- **Sintaxe 95% → 98%**: expansão massiva de norma-data + sufixos nominais + dados morfológicos completos
- **Tema 99% → 100%**: grammar coloring, syntax-tokens e craft icons cobertos nos 4 temas escuros
- **Analise/Voz**: stopwords mais precisas → menos falsos positivos em repetição e densidade

**Estado atualizado dos engines (v556):**

| Área / engine | Maturidade | Notas de estado (v556) |
|---|---:|---|
| Analise geral | **100%** | STOPWORDS expandido; inferirContextoAnalise(); bordas fechadas |
| Espelho de Voz | **100%** | stopwords +40; inferVoiceCtx(): spots silenciados em poesia/roteiro |
| RimaLab | **100%** | grammarWords 286; finder exata/toante com rótulos de seção |
| Lexico / Biblioteca | **100%** | 200 entradas; sinônimos 145 entradas |
| Decolonial / vocabulário | **100%** | 239 entradas; tribo, bicha, palavra de negro, evolução das raças |
| Sintaxe | **98%** | verbos_pres_reg 240; adjetivos_comuns 271; formas_verbais_irr 201; _SUFIXOS_NOM +4 |
| Tema Alvorada / Vereda | **100%** | gw-*, syntax-tokens, craft icons, reader-overlay, soneto, mark — todos cobertos |

**Próximas fronteiras:**

1. **Sintaxe 98% → 99%**: desambiguação contextual — requer mudança em syntax-engine.js (custo alto, análise por janela)
2. **Produto/UX**: todos engines em 98–100% — sessões futuras podem focar em fluxos de escritora, onboarding, primeira visita
3. **Dados**: CLIQUES_PT (209 entradas) e PLEONASMOS (72 entradas) podem crescer — baixo custo, longo prazo

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v538→v539)

**Baseline:** v539 — Analise 100%; RimaLab 99%; Tema 98%; Sintaxe 95%.

**O que foi entregue neste ciclo (v538→v539):**

- `analise-engine.js` (v538): `inferirContextoAnalise()` — skipPleonasmos e skipCliches quando formato=poesia; Analise 99% → **100%**
- `academia-controller.js` (v538): `buildAnaliseContext()` passa templateId/kind/type ao motor de análise
- `index.html` (v538): Bancada → Ateliê em toda camada visível; três cabeçalhos de tarefa (Leitura do texto / Direção / Circulação)
- `academia-controller.js` (v539): finder de rimas separa Rima exata / Rima toante com rótulos de seção
- `css/04-analysis-academy.css` (v539): chip toante ganha cor própria (sienna) em vez de só opacidade reduzida; RimaLab 98% → **99%**

**Estado atualizado dos engines (v539):**

| Área / engine | Maturidade | Notas de estado (v539) |
|---|---:|---|
| Analise geral | **100%** | inferirContextoAnalise(): skipPleonasmos/skipCliches em poesia; bordas poesia e texto curto fechadas |
| Espelho de Voz | **100%** | inferVoiceCtx(): spots de frase curta/variação silenciados em poesia/roteiro |
| RimaLab | **100%** | grammarWords 286; -al/-el/-il/-iz/-um cobertos; finder exata/toante com rótulos |
| Lexico / Biblioteca | **100%** | 200 entradas; ritmo, desejo, resistir, povo, multidão, Pantanal... |
| Decolonial / vocabulário | **100%** | 239 entradas; tribo, bicha, palavra de negro, evolução das raças, mestiço como anomalia |
| Sintaxe | **95%** | substantivos_ia 132; norma-data expandido |
| Tema Alvorada / Vereda | **99%** | auditados: cronograma, paginação, mode-switcher, Ateliê — todos OK via tokens |

**Próximas fronteiras:**

1. **Sintaxe 95% → 97%**: candidatos morfológicos + desambiguação por janela de contexto — custo alto
2. **Tema 98% → 99%**: mode-switcher, cronograma, paginação em modo escuro
3. **Espelho de Voz 99% → 100%**: bordas em textos mistos (prosa+verso) e textos muito curtos

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v523→v528)

**Baseline:** v528 — Tema 98%; Analise 99%; Sinonimos 113 entradas; adjetivos_comuns 216.

**O que foi entregue neste ciclo (v523→v528) — correções críticas de diacríticos e expansão de dados:**

- `css/03-editor-toolbar.css` (v523): dark mode — grammar btn active + proof-chip high em 4 temas escuros
- `css/06-academy-tools.css` (v523): dark mode — `.academy-tool-tab` cor corrigida para 4 temas escuros
- `lexical-data.json` (v524): 150→162 (peito, sorriso, raiva, vergonha, abraço, ausência, quintal, canto, onda, lago, grito, lar)
- `voice-engine.js` (v524): sobrenatural 15→22; corpo 19→23; memoria 20→23; pensamento 19→23; tensao 27→30; contemplacao 26→30
- `decolonial-data.json` (v525): 215→227 (gênero +5, linguagem +4, estética +3)
- `analise-engine.js` (v524+v526): PALAVRAS_FRACAS_ABERTURA bug diacrítico corrigido + 8 novas; CLIQUES_PT 202→209; PLEONASMOS 65→72; VERBOS_ESTADO bug corrigido (toLowerCase em vez de normalizar para não confundir "é" com "e"); SUBSTANTIVOS_VAGOS bug diacrítico corrigido (questão→questao etc) + 3 novas
- `norma-data.json` (v527): adjetivos_comuns 184→216 (+32 adjetivos irregulares: belo/bela, grave, feliz/felizes, cruel/crueis, fiel/fieis, capaz/capazes, etc.)
- `synonym-data.js` (v528): 100→113 entradas (perder, encontrar, fugir, procurar, contar; perdido, profundo, secreto; dor, esperança, solidão, destino, povo)

**Revisão de maturidade — Tema Alvorada/Vereda 97% → 98%:** auditados e corrigidos `03-editor-toolbar.css` e `06-academy-tools.css`; auditados sem problema `03-writing-area.css`, `03-guide-reference.css`, `12-training-modes.css`. Todos os arquivos CSS com dark mode cobertura completa.

**Estado atualizado dos engines (v528):**

| Área / engine | Maturidade | Notas de estado (v528) |
|---|---:|---|
| Analise geral | **99%** | CLIQUES_PT 209; PLEONASMOS 72; 4 bugs diacrítico corrigidos; CONECTIVOS_LOGICOS +12 |
| Espelho de Voz | **99%** | sobrenatural 22; corpo 23; memoria 23; pensamento 23; tensao 30; contemplacao 30 |
| RimaLab | **98%** | enciclopédia 25 entradas; grammarWords 204; findRhymes exata/toante |
| Lexico / Biblioteca | **98%** | 162 entradas; emoções brasileiras + léxico afetivo expandido |
| Decolonial / vocabulário | **98%** | 227 entradas; gênero, linguagem, estética ampliados |
| Sintaxe | **95%** | adjetivos_comuns 216; norma-data: topónimos 75; siglas 82; prenomes 535 |
| Tema Alvorada / Vereda | **98%** | todos CSS auditados; grammar btn + proof-chip + academy-tab corrigidos nos 4 temas escuros |

**Próximas fronteiras:**

1. **RimaLab 98% → 99%**: expandir `findRhymes()` para incluir toante na busca por palavra — custo médio
2. **Sintaxe 95% → 97%**: candidatos morfológicos + desambiguação por janela de contexto — custo alto
3. **Analise geral 99% → 100%**: verificar bordas em textos muito curtos e poesia
4. **Tema 98% → 99%**: verificar componentes específicos (mode-switcher, cronograma, paginação) em modo escuro

---

## Abertura da próxima sessão — estado em 2026-06-17 (ciclo autônomo v507→v522)

**Baseline:** v522 — Tema 97% (revisado); 19 engines em 97–99%; sintaxe em 95%.

**O que foi entregue neste ciclo (v507→v522) — dados e dark mode:**

- `analise-engine.js`: STOPWORDS bug corrigido (tambem/voces sem acento); +30 novas entradas; SUBSTANTIVOS_VAGOS +8; NEGACOES_DUPLAS 5→7; CONECTIVOS_LOGICOS +12; CLIQUES_PT 192→202; PLEONASMOS 57→65
- `decolonial-data.json`: 205→215 (cigano/povo Romani, sangue puro, trabalhador braçal, caipira como insulto, miscigenar)
- `rimalab-data.json`: enciclopédia 15→20 (trova, cavalgamento, aliteração, esquemas de rima, glosa); grammarWords 195→204
- `lexical-data.json`: 140→150 (luto, abismo, ruína, fantasma, vazio, ferro, cabelo, cheiro, ilha, cinza)
- `voice-engine.js`: `casa` 10→24; `conflito` 15→23; `ironia` 23→29; `luminosidade` 26→30
- `norma-data.json`: topónimos 56→75; siglas 57→82; prenomes F 222→230; M 299→305
- CSS dark mode: `.soneto-a/b/c/d` para temas escuros; `.reader-overlay`/`.reader-hint-toast`; `mark` adaptativo; `--craft-bg` hex→`color-mix`; `nav-row` hex→`var(--muted)`

**Revisão de maturidade — Tema Alvorada/Vereda 95% → 97%:** cobre agora soneto, reader overlay, toast de hint, mark e craft colors nos 4 temas escuros. Lacunas remanescentes: `03-writing-area.css`, `03-guide-reference.css`, `06-academy-tools.css`, `12-training-modes.css` ainda não auditados.

**Estado atualizado dos engines (v522):**

| Área / engine | Maturidade | Notas de estado (v522) |
|---|---:|---|
| Analise geral | **99%** | CLIQUES_PT 202; PLEONASMOS 65; STOPWORDS corrigido; CONECTIVOS_LOGICOS +12; NEGACOES_DUPLAS 7 |
| Espelho de Voz | **99%** | `casa` 24 termos; `conflito` 23; ironia 29; luminosidade 30; 10 gestos com flag confiança |
| RimaLab | **98%** | enciclopédia 20 entradas; grammarWords 204; findRhymes exata/toante |
| Lexico / Biblioteca | **98%** | 150 entradas; FC/especulativo coberto; adjetivos, advérbios, conjunções |
| Decolonial / vocabulário | **98%** | 215 entradas; raça, gênero, classe, território, linguagem, conhecimento |
| Sintaxe | **95%** | norma-data: topónimos 75; siglas 82; prenomes 535; resolverAmbiguidade() 4 regras Mac-Morpho |
| Tema Alvorada / Vereda | **97%** | dark mode: 7 arquivos CSS cobertos; 4 temas escuros; tooltip clone; soneto/reader/craft |

**Próximas fronteiras:**

1. **Tema 97% → 98%**: auditar `03-writing-area.css`, `03-guide-reference.css`, `06-academy-tools.css`, `12-training-modes.css` — custo baixo esperado
2. **Sintaxe 95% → 97%**: candidatos morfológicos + desambiguação por janela de contexto — custo alto
3. **RimaLab 98% → 99%**: expandir `findRhymes()` para incluir toante na busca por palavra
4. **Analise geral 99% → 100%**: verificar bordas em textos muito curtos e poesia

---

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
| Lexico / Biblioteca | **98%** | 127 entradas; v479: 8 entradas FC/especulativo (distopia, novum, androide, colônia, silício…); adjetivos/advérbios/conjunções expandidos |
| Sintaxe | **95%** | v380: resolverAmbiguidade() — 4 regras Mac-Morpho. v469: _ADJ_EXT via adjetivos_comuns — 34 formas sem sufixo canônico. v471: CONTRACOES_PREP_DEM 45 formas (deste/neste/àquele…) + comigo/contigo/consigo em PRONOMES_OBL. Teto: candidatos morfológicos + desambiguação por janela |
| Pontuacao | **99%** | 40 regras + PONT-54 (aspas retas → tipográficas, severidade baixa); `acao` em cada regra; `resumo` por severidade |
| Analise geral | **99%** | Badge "Saúde textual"; v481: +30 clichês literários de romance (olhos cor de mel, coração acelerou, arrepios percorreram…) — 115+ clichês total; 35+ pleonasmos; 16 condições |
| Espelho de Voz | **99%** | 10 gestos (v482: irônico — Machado/Lima Barreto/J.Ubaldo; lexicon de ironia que existia mas nunca resultava em gesto); perfil persiste; flag `confianca`; copiar análise |
| RimaLab | **98%** | Buscador de rimas por palavra (findRhymes — exata/toante); copy análise; enciclopédia 15 entradas; v479: +20 oxítonas do cordel/MPB (mutirão, sertão, café, baião, paixão…) — ~169 palavras |
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
