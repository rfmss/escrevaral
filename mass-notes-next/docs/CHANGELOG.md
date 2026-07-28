# Changelog técnico — Mass Notes Next

As entradas registram mudanças de arquitetura, produto e qualidade. Commits mecânicos podem ser omitidos.

## 2026-07-27

### Fundação Tiptap

- criada branch experimental a partir da `main`;
- adotados React, TypeScript, Vite e Tiptap/ProseMirror;
- transplantado look and feel editorial do Mass Notes;
- criado armazenamento IndexedDB com revisão condicional;
- implementada preservação de conflitos entre abas;
- integrada engine real de Revisão por adaptador;
- isolado histórico do editor por documento.

### Gate 2

- adicionados Chromium e Firefox;
- cobertos paste representativo de Word/Google Docs, listas e seleção;
- validada recuperação antes do autosave;
- validado fluxo completo de conflito;
- corrigido stacking do overlay móvel;
- implementados foco inicial, contenção, Escape e retorno do foco;
- criada preview estática publicada somente após gate verde.

### Limpeza visual

- removidos fita preta, adesivo vermelho e CTA flutuante sobre o papel;
- ações movidas para o rail contextual;
- adicionada regressão contra o retorno desses ornamentos.

### Resiliência documental

- criada memória operacional dentro de `mass-notes-next/docs/`;
- instituídos plano vivo, memória consolidada, changelog e logs por lote;
- documentação passou a integrar formalmente a definição de pronto.

### Gate 3 — Espelho de Voz

- criada integração de `voice-engine.js` por importação raw e adaptador TypeScript;
- engine original e bases linguísticas permaneceram intactas;
- adicionada aba `Voz` ao rail;
- apresentados confiança, gesto, descrição, métricas, forças, pontos cegos, exercícios, ecos e público provável;
- reforçada a linguagem de hipótese heurística para corpus curto;
- resultados passam a ser descartados após mudança do documento ou do conteúdo;
- corrigida invalidação indevida causada apenas pelo autosave da mesma versão textual;
- falha controlada da engine permanece isolada do editor;
- adicionados testes de vazio, baixa confiança, corpus médio, obsolescência e exceção;
- matriz aprovada em Chromium e Firefox, com 30 execuções;
- preview atualizada após gate verde.

### Gate 4 — Termos que pedem contexto

- integrados `decolonial-engine.js` e `decolonial-data.json` por adaptador, sem modificar os originais;
- criada aba `Contexto` e painel editorial separado do Tiptap;
- apresentados termo, categoria, ocorrências, motivo, contexto e alternativas possíveis;
- adotada linguagem não acusatória, sem palavras proibidas ou correção automática;
- nenhuma alternativa possui botão de aplicação;
- resultados são descartados após mudança do documento ou do conteúdo;
- carregamento da base foi serializado para impedir concorrência entre chamadas de `ensureLoaded()`;
- a ponte temporária de `fetch` é restaurada em `finally`;
- falha controlada da engine permanece isolada do editor;
- cinco abas foram organizadas em duas linhas no rail;
- nomes de termos passaram a ocupar linha própria, com regressão contra corte ou quebra artificial;
- adicionados testes de vazio, ausência de termos, múltiplas ocorrências, integridade do manuscrito, obsolescência, exceção e mobile;
- matriz aprovada em Chromium e Firefox, com 42 execuções;
- preview atualizada somente após gate funcional e visual verdes.

### Gate 5 — RimaLab

- integrados `rimalab-engine.js` e `rimalab-data.json` por adaptador, sem modificar os originais;
- criada união discriminada TypeScript para leituras de prosa e verso;
- adicionada aba `RimaLab` e oficina sonora separada do Tiptap;
- prosa passou a apresentar ecos internos sem falsa escansão;
- verso passou a apresentar resumo, metro dominante, variação métrica, esquema, estrofes, escansão e pares de rima percebidos;
- preservada a nota da engine sobre sinalefa, dicção regional e intenção musical;
- ausência de rima recebe mensagem neutra e verso livre não é tratado como defeito;
- criado serializador sonoro a partir do JSON Tiptap;
- blocos vazios preservam fronteiras entre estrofes;
- carregamento da base usa promessa compartilhada e ponte temporária de `fetch` restaurada em `finally`;
- resultados são descartados após mudança do documento ou do conteúdo, não por autosave;
- falha controlada do RimaLab permanece isolada do editor e das engines anteriores;
- seis abas foram organizadas em grade 3 × 2;
- restaurado o contrato acessível dos nomes das abas após uma capitalização indevida;
- corpora de ausência de padrão foram substituídos por exemplos foneticamente controlados;
- rima toante real entre “céu” e “luz” foi preservada como comportamento da engine, não removida para satisfazer o teste;
- adicionados testes de vazio, prosa com e sem ecos, poema rimado, estrofes, verso livre, integridade, obsolescência, exceção e mobile;
- preview atualizada somente após gate verde.

## 2026-07-28

### Gate 6 — contrato de posições

- criado `textPositionContract.ts` sobre o Node ProseMirror real;
- declarado contrato de offsets em unidades UTF-16;
- criada assinatura estrutural determinística a partir do JSON Tiptap;
- separadas identidade do documento e identidade do conteúdo;
- modelados blocos, segmentos textuais, `hardBreak`, átomos e separadores virtuais;
- implementadas conversões de pontos e ranges entre texto derivado e posições ProseMirror;
- adicionada afinidade anterior ou posterior para offsets em separadores;
- ranges exclusivamente virtuais passam a colapsar em fronteira segura;
- blocos vazios e parágrafo final do Tiptap são preservados;
- API somente-leitura é publicada na instância atual do editor para QA e futura integração;
- consultas foram comprovadas puras, sem alterar HTML, seleção, histórico ou manuscrito;
- nenhuma decoration ou marcação visual foi criada;
- cobertos documento vazio, acentos, emoji, `hardBreak`, títulos, listas, blocos vazios, assinatura, troca de documento, clamp e seleção;
- corrigida serialização estrita de valores não representáveis por JSON;
- removido uso incompatível do callback `onDestroy` do Tiptap 3;
- `build.log` passou a integrar o artefato do workflow;
- ativado `pipefail` para impedir que `tee` masque falha de compilação;
- corrigido auditor que tentava apagar parágrafo vazio final válido;
- auditada a contagem real da suíte: 40 cenários por navegador, 80 execuções;
- build, Chromium, Firefox, gates anteriores e preview aprovados no workflow `30323402744`.

### Gate 6.5 — estabilização visual e de experiência

- criada camada visual reversível em `design-stabilization.css` e `design-stabilization-mobile.css`;
- introduzidos tokens semânticos para superfícies, texto, controle, borda, ativo, desabilitado, foco, seleção, ação e futura análise;
- corrigido contraste explícito de papel e noite em biblioteca, tabs, toolbar, ações, atalhos e conteúdo;
- toolbar passou a quebrar linha no desktop, sem rolagem horizontal silenciosa;
- grupos da toolbar receberam nomes e ajuda nativa para abreviações;
- estados ativo, inativo e desabilitado passaram a usar papéis visuais distintos;
- rails foram estreitados com proteção geométrica da marca;
- biblioteca e ferramentas passaram a operar como drawers a partir de 1040 px;
- acionadores móveis permanecem montados para retorno de foco, mas ficam abaixo do drawer aberto;
- título móvel ganhou padding e escala com folga para métricas de Chromium e Firefox;
- reduzidas opacidades de grain, halftone e blueprint;
- reduzida densidade de bordas, caixas e linhas sem remover a estética editorial;
- transições cromáticas dos controles foram removidas para impedir contraste insuficiente durante a troca de tema;
- adicionados testes de contraste, toolbar, 1024 px, breakpoints, marca e estados de controle;
- matriz elevada para 45 cenários por navegador, 90 execuções;
- build, Chromium, Firefox, gates anteriores e preview aprovados no workflow `30327303435`;
- artefato final sem falhas ou flakiness.

### Gate 6.75 — fusão visual Blueprint Tokon

- extraída e tokenizada a paleta do protótipo Blueprint Tokon;
- adotada a regra “o blueprint é o ambiente; o manuscrito é o objeto principal”;
- criada camada de tokens em `theme-blueprint.tokens.css`;
- aplicada skin visual em `theme-blueprint.css` sem alterar layout ou comportamento;
- criada proteção de composição em `theme-blueprint-composition.css`;
- canvas recebeu ciano, pontos, diagonais e moldura técnica;
- laterais, registro e painéis receberam papel técnico e filetes ciano;
- folha central permaneceu papel quente opaco;
- modo noite recebeu prancha azul profunda e papel técnico escuro;
- pauta inicialmente criada com `repeating-linear-gradient` lavava o papel com ciano;
- diagnóstico por camadas provou que grain, halftone e canvas não eram a causa;
- pauta substituída por tile linear de 48 px com `repeat-y`;
- teste do RimaLab sincronizado com o ciclo de atualização após paste, sem mudar engine ou produto;
- adicionados testes de tokens, contraste, geometria, camadas, pauta e breakpoints;
- matriz elevada para 50 cenários por navegador, 100 execuções;
- build, Chromium, Firefox, gates anteriores e preview aprovados no workflow `30333192558`;
- layout, Tiptap, engines, persistência, `main` e aplicação pública permaneceram intactos.

### Gate 6.9 — auditoria editorial de posições

- criados seis corpora originais em português brasileiro: prosa/dialogue, ensaio, poesia, cordel, canção e Unicode;
- auditados 39 ranges editoriais por navegador, incluindo travessões, aspas curvas, acentos, acento combinante, emoji com ZWJ, bandeira e `hardBreak`;
- cobertos blockquote, lista numerada, lista aninhada, títulos, blocos vazios e fronteiras entre estrofes;
- validado documento extenso com 180 parágrafos, 181 blocos e 23.940 unidades UTF-16;
- comprovadas equivalência textual, posições esperadas, round-trip, monotonicidade e afinidade em Chromium e Firefox;
- consultas intensivas preservaram HTML, seleção, assinatura e manuscrito, sem criar decorations;
- o oráculo DOM passou a ignorar `ProseMirror-trailingBreak` e `ProseMirror-separator`, distinguindo placeholders técnicos de `hardBreak` autoral;
- dependências transitivas Tiptap foram fixadas por `overrides`;
- `package-lock.json` foi versionado e o workflow passou a usar `npm ci`;
- matriz elevada para 59 cenários por navegador, 118 execuções;
- build, instalação reproduzível, Chromium, Firefox, gates anteriores e preview aprovados no workflow `30358030907`.

### Gate 7 — marcações somente de leitura da Revisão

- criada extensão ProseMirror isolada para `DecorationSet` da Revisão;
- somente ranges cuja posição e fragmento correspondem ao snapshot atual recebem marca;
- projections carregam identidade do documento e assinatura estrutural;
- qualquer edição ou troca de documento remove leitura e marcações obsoletas;
- cartões localizados foram separados das observações gerais;
- “Ir ao trecho” seleciona o range exato sem editar o manuscrito;
- Unicode, emoji, `hardBreak`, ocorrências repetidas e ranges sobrepostos foram cobertos;
- o DOM renderizado deixou de ser tratado como contrato de ocorrência quando decorations se sobrepõem;
- marcas podem ser ocultadas e restauradas pelo painel de Revisão sem apagar leitura, cartões ou conteúdo;
- nenhuma sugestão automática ou ação de substituição foi criada;
- cor de análise foi mantida separada da seleção e as marcas não capturam eventos;
- tela branca da preview foi tratada com assets estáveis, fallback, purge e smoke test público;
- falsos negativos de plural, sobreposição e colisão com o nome `document` foram corrigidos sem distorcer o produto;
- suíte de visibilidade ficou isolada em arquivo dedicado, sem cenário duplicado;
- matriz elevada para 67 cenários por navegador, 134 execuções;
- build, Chromium, Firefox, publicação, limpeza de cache e verificação pública aprovados no workflow `30367072054`;
- Gate 7 encerrado para avaliação manual; nenhuma ampliação automática foi autorizada.
