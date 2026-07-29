# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade visual e as engines do Escrevaral/Mass Notes, substituindo o editor artesanal por Tiptap/ProseMirror.

## Estado

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` (rascunho);
- preview: `https://raw.githack.com/rfmss/escrevaral/preview-mass-notes-tiptap/index.html`;
- aplicação pública, `main` e service worker: não alterados;
- engines integradas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- exportação estrutural: TXT, Markdown e HTML;
- cópia nativa: envelope versionado e restauração como novas cópias;
- biblioteca: busca, filtros combináveis, ordenação, favorito e tags editáveis;
- importação legada: `.esc`/`vrda` v1 com checksum, prévia e gravação somente após confirmação;
- Gates 1 a 13 e Gate 10.5 de higiene: aprovados;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- primeira tranche M0.9: 116 cenários por navegador, 232 execuções verdes;
- nota provisória: 85/100;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público e substituição integral: `NO-SHIP` provisório;
- Gate 14 está suspenso até o veredito final.

## Retomar o projeto

Leia nesta ordem:

1. `docs/M0_9_AUDITORIA_OPERACIONAL.md`;
2. `docs/audits/M0_9_AUDITORIA_GERAL.md`;
3. `docs/PLAN.md`;
4. `docs/MEMORY.md`;
5. `docs/CHANGELOG.md`;
6. log mais recente em `docs/logs/`;
7. documentação global em `../docs/product/`.

A memória M0.9 é viva: decisões, achados, severidades, notas e evidências devem ser atualizados nela no momento em que mudarem.

Não comece um novo gate antes do veredito final da auditoria geral. Um lote não está concluído sem documentação, testes e evidências na cabeça final.

## Executar e validar

```bash
npm ci
npm run dev
npm run build
npx playwright install chromium firefox
npm run test:e2e
```

A fronteira pública também é validada por:

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
├── engines/      # adaptadores das engines locais
├── export/       # formatos derivados
├── import/       # adaptadores e planos auditáveis de importação
├── library/      # consulta pura da biblioteca
├── pages/        # superfícies especiais
├── storage/      # IndexedDB, revisão, conflitos e transações
├── styles/       # camadas visuais
└── transitions/  # transições entre superfícies
```

Regras de formato, conversão, filtro ou engine não entram diretamente em `App.tsx` ou `RightRail.tsx`.

## Princípios ativos

- JSON Tiptap é a fonte estrutural; HTML, Markdown e texto são derivados;
- IndexedDB é a fonte principal dos documentos;
- nenhuma aba sobrescreve outra silenciosamente;
- estado, favorito e tags usam a mesma revisão e persistência do documento;
- mudanças somente editoriais preservam leituras textuais válidas;
- filtros da biblioteca são projeções puras e não gravam;
- restauração nativa e importação legada são conceitos distintos;
- o `.esc` legado aceito possui `format: esc|vrda`, `schemaVersion: 1`, checksum FNV-1a e `payload.manuscripts`;
- selecionar um `.esc` apenas gera um plano de prévia em memória;
- formato, versão, checksum, lote, identificadores e conteúdos são validados antes de qualquer escrita;
- cancelar a prévia não altera a biblioteca;
- confirmar importa todo o lote em uma única transação, com UUIDs novos e sufixo `— importado`;
- `legacySourceId` preserva somente a origem auditável; não é a identidade atual do documento;
- nenhum documento existente é substituído e não há merge campo a campo;
- lotes inválidos são rejeitados integralmente;
- durante o M0.9, auditar precede corrigir e feature nova fica suspensa;
- preview só é publicada depois de build, Chromium, Firefox, cache e smoke público verdes;
- a aplicação pública raiz permanece fora desta branch.

## Primeira tranche M0.9

Aprovado em Chromium e Firefox:

- escrita, metadados, autosave e recarga;
- Revisão, Voz, Contexto, RimaLab e Palavras na mesma sessão sem mutação do manuscrito;
- sentinela autoral ausente de URL e corpo de requisição;
- filtros sem alterar revisão ou descartar a página ativa;
- drawer em 320 e 390 px;
- biblioteca com 100 páginas e documento acima de 100 mil caracteres.

Evidência funcional:

- cabeça `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`;
- Mass Notes `30463426867`;
- Argila `30463426847`;
- coerência `30463426811`.

O milestone continua aberto.

## Camadas visuais específicas

```text
src/styles/library-organization.css
src/styles/document-metadata.css
src/styles/legacy-import.css
```

## Limites atuais

Ainda não estão aprovados reimportação seletiva, deduplicação automática entre importações, importação parcial, pastas persistentes, operações em massa, sincronização em nuvem, colaboração, DOCX, RTF, ePub, Obsidian ZIP, service worker da aplicação nova, Prova de Autoria na nova fundação, Tauri, SQLite, paginação física, aplicação automática de sugestões ou promoção para `main`.
