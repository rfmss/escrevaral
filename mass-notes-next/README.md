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
- matriz atual: **138 cenários por navegador, 276 execuções**;
- engines expostas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- primeira superioridade contextual: corpus morfossintático v1 passou de 8/14 para 14/14 casos únicos;
- P0/P1 conhecidos nas engines: 0/0;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público e substituição integral: `NO-SHIP`;
- Gate 14 permanece suspenso.

## Retomar o projeto

Leia nesta ordem:

1. `docs/M1_0_ENGINES_SUPERIORES.md` — missão, critérios, fases, baseline e próximo trabalho;
2. `docs/logs/2026-07-29-m1-e0-e1-lexico-contextual.md` — primeira comparação e ganho comprovado;
3. `docs/logs/2026-07-29-m0-9-encerramento-m1-abertura.md` — fronteira entre auditoria e evolução;
4. `docs/PLAN.md` — sequência aprovada;
5. `docs/MEMORY.md` — decisões permanentes;
6. `docs/CHANGELOG.md` — mudanças relevantes;
7. `docs/M0_9_ERRATA_MATRIZ.md` e demais artefatos M0.9 — histórico da auditoria;
8. contratos globais em `../docs/product/`.

Não declare superioridade global por contagem ou por um corpus pequeno. Cada avanço exige baseline, caso reproduzível, correção mínima, matriz integral, documentação e evidência na cabeça exata.

## Executar e validar

```bash
npm ci
npm run dev
npm run build
npx playwright install chromium firefox
npm run test:e2e
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
- métricas de CI detectam regressão e não constituem SLA;
- automação de zoom equivalente não substitui zoom real, leitor de tela ou dispositivo físico;
- a Anatomia ainda carrega `page-flip@2.0.7` do `unpkg`, bloqueando promessa offline integral;
- preview só é publicada após build, Chromium, Firefox, cache e smoke público verdes.

## Primeira evidência M1.0

Corpus v1:

- `enquanto`, `por enquanto` e `enquanto isso`;
- `publica/pública`;
- `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

Baseline anterior à correção:

- 8/14 casos únicos aprovados;
- 6 lacunas contextuais repetidas em Chromium e Firefox;
- 264/276 execuções aprovadas.

Após a camada contextual tipada:

- 14/14 casos únicos aprovados;
- **276/276 execuções**;
- cabeça funcional `d44791ff1a317610c9dd152360cfbb9b168c503a`;
- Mass Notes `30493491424`: build, navegadores, publicação, cache e smoke público verdes;
- Argila `30493491638` e coerência `30493491411`: verdes;
- artefato `mass-notes-tiptap-30493491424`.

A superioridade comprovada é específica a essas seis fronteiras corrigidas. Ainda não constitui prova de superioridade global nem autorização para substituir o legado.

## Próximo trabalho lógico

1. adicionar controles negativos para impedir generalização excessiva das novas regras;
2. medir as contagens reais de definições, sinônimos, polissemia, contexto e formas verbais;
3. auditar duplicatas, autorreferências, ciclos e verbetes sem definição útil;
4. selecionar a primeira expansão lexical brasileira com fonte e corpus;
5. desenhar uma experiência sintático-morfológica integrada;
6. ampliar corpora humanos de prosa, poesia, diálogo, ensaio, oralidade e regionalismos.

## Limites atuais

Ainda não estão aprovados reimportação seletiva, deduplicação automática, importação parcial, pastas, operações em massa, sincronização, colaboração, DOCX, RTF, ePub, Obsidian ZIP, PWA própria, Prova de Autoria na nova fundação, autonomia offline da Anatomia, zoom real de 200%, leitores de tela/dispositivos físicos, Tauri, SQLite, paginação física, aplicação automática de sugestões ou promoção para `main`.
