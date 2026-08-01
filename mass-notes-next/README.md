# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade editorial e as engines locais do Escrevaral/Mass Notes, substituindo o editor artesanal por Tiptap/ProseMirror e evoluindo as leituras linguísticas por evidência reproduzível.

## Estado

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` — aberto e em rascunho;
- preview: `https://raw.githack.com/rfmss/escrevaral/preview-mass-notes-tiptap/index.html`;
- aplicação pública, `main` e service worker público: intactos;
- Gates 1 a 13 e Gate 10.5: concluídos;
- M0.9: encerrado como auditoria técnica, sem autorizar lançamento ou substituição;
- milestone atual: **M1.0 — Engines superiores ao Escrevaral legado**;
- matriz funcional de referência: **176 cenários por navegador, 352 execuções**;
- engines expostas: Revisão, Espelho de Voz, Contexto, RimaLab, Palavras/Léxico e análise morfológica verbal;
- E2-V: 34 casos de desenvolvimento e 24 casos em conjunto adversarial separado;
- infinitivo pessoal: primeira família verbal com proveniência verificada e avaliação separada em **24/24**;
- P0/P1 funcionais conhecidos nas engines: 0/0;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público e substituição integral: `NO-SHIP`;
- Gate 14 permanece suspenso.

## Retomar o projeto

Leia nesta ordem:

1. `docs/logs/2026-08-01-e2v-infinitivo-pessoal-fechamento.md` — fechamento CLARO mais recente e limites;
2. `docs/M1_0_ENGINES_SUPERIORES.md` — missão, critérios, fases e adversário mensurável;
3. `docs/PLAN.md` — sequência aprovada;
4. `docs/personas/EVA_CHARA_SCORECARD.md` — rubrica e prioridades;
5. `docs/linguistics/verb-provenance.json` — estado das famílias verbais e suas evidências;
6. `docs/logs/2026-07-29-m1-e2-inventario-lexical.md` — integridade lexical pendente;
7. `docs/MEMORY.md` e `docs/CHANGELOG.md` — decisões permanentes e mudanças relevantes;
8. contratos globais em `../docs/product/`.

Não declare superioridade global por contagem ou por corpus pequeno. Cada avanço exige baseline, caso reproduzível, correção mínima, matriz integral, documentação e evidência na cabeça exata.

## Executar e validar

```bash
npm ci
npm run audit:lexicon
npm run build
npx playwright install chromium firefox
npm run test:e2e
npm run test:verb:evaluation:target
```

Fronteira pública:

```bash
python3 scripts/test-auditor-asset-version.py
python3 scripts/auditor-asset-version.py
```

## Organização da fonte

```text
src/
├── backup/       # cópia nativa versionada
├── components/   # apresentação e interação React
├── domain/       # contrato do documento
├── editor/       # Tiptap, posições, seleção e decorations
├── engines/      # adaptadores e camadas contextuais locais
├── export/       # formatos derivados
├── import/       # adaptadores e planos auditáveis
├── library/      # consulta pura da biblioteca
├── pages/        # superfícies especiais
├── storage/      # IndexedDB, revisão, conflitos e transações
├── styles/       # camadas visuais
└── transitions/  # transições entre superfícies
```

Regras de formato, conversão, filtro ou engine não entram diretamente em `App.tsx` ou `RightRail.tsx`.

## Princípios ativos

- JSON Tiptap é a fonte estrutural; HTML, Markdown e texto são derivados;
- IndexedDB é a fonte principal;
- nenhuma aba sobrescreve outra silenciosamente;
- metadados usam a mesma revisão e persistência do documento;
- mudanças editoriais preservam leituras textuais válidas;
- filtros da biblioteca são projeções puras;
- restauração nativa e importação legada são formatos distintos;
- `.esc` legado é validado integralmente antes de qualquer escrita;
- nenhum documento existente é substituído por restauração ou importação;
- exportação usa o estado React/Tiptap atual, inclusive antes do autosave convergir;
- conflito misto preserva as duas versões;
- recuperação emergencial retoma o mesmo documento e limpa o envelope após persistir;
- engines não alteram o snapshot semântico do ProseMirror;
- engines funcionam localmente e não aplicam alternativas automaticamente;
- diacríticos participam da decisão gramatical, não apenas da busca;
- contexto pode produzir leitura `provável`; ausência de evidência deve produzir ambiguidade ou indeterminação honesta;
- toda nova regra linguística exige caso positivo e negativo versionado;
- corpus de desenvolvimento e conjunto de avaliação permanecem separados;
- uma família só recebe estado `verified` com fontes, escopo, divergências, licença e avaliação integralmente aprovada;
- métricas de CI detectam regressão e não constituem SLA ou consenso linguístico;
- automação de zoom equivalente não substitui zoom real, leitor de tela ou dispositivo físico;
- a Anatomia ainda carrega `page-flip@2.0.7` do `unpkg`, bloqueando promessa offline integral;
- preview só é publicada após build, Chromium, Firefox, cache e smoke público verdes.

## Evidências M1.0 consolidadas

### Léxico e contexto

O corpus contextual passou de 8/14 para 14/14 casos únicos e depois recebeu controles negativos adicionais. As correções cobrem fronteiras delimitadas como:

- `enquanto`, `por enquanto` e `enquanto isso`;
- `publica/pública` e `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

Esse ganho não constitui superioridade lexical global.

### E2-V — infinitivo pessoal

A cabeça funcional `0e5177d5c801a4a9b8833af35baa059af486f6c4` demonstrou:

- 12 casos separados do fenômeno;
- oito positivos e quatro negativos por navegador;
- distinções contra infinitivo impessoal, uso substantivado e futuro do subjuntivo;
- reconhecimento de sujeito expresso e recuperável, incluindo `É melhor sairmos agora`;
- Chromium `12/12` e Firefox `12/12`;
- precisão, recall e acurácia de 100% dentro do conjunto contratado;
- matriz integral **352/352**;
- nenhuma alteração automática do manuscrito.

Workflow da banca: `30718951198`.  
Workflow integral: `30718951187`.

O estado `verified` vale somente para o escopo declarado em `docs/linguistics/verb-provenance.json`. Não representa uma teoria completa do infinitivo flexionado nem aprovação acadêmica.

## Próximo trabalho lógico

1. concluir a **auditoria formal de paridade** entre Escrevaral legado e Mass Notes;
2. classificar cada capacidade como presente, superior, parcial, ausente, aposentada ou bloqueadora;
3. separar requisitos de beta pública dos requisitos de substituição integral;
4. retomar a integridade lexical em pequenos lotes, sem expansão de volume;
5. fundamentar e avaliar as demais famílias do E2-V;
6. somente depois abrir Sintaxe v1 com corpus separado desde a primeira regra;
7. preparar E3 humana com prosa, poesia, diálogo, ensaio, oralidade e regionalismos.

## Limites atuais

Ainda não estão aprovados reimportação seletiva, deduplicação automática, importação parcial, pastas, operações em massa, sincronização, colaboração, DOCX, RTF, ePub, Obsidian ZIP, PWA própria, Prova de Autoria na nova fundação, autonomia offline da Anatomia, zoom real de 200%, leitores de tela/dispositivos físicos, Tauri, SQLite, paginação física, aplicação automática de sugestões ou promoção para `main`.
