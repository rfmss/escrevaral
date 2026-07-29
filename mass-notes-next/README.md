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
- Gates 1 a 13 e Gate 10.5 de higiene: aprovados funcionalmente;
- matriz anterior ao milestone: 111 cenários por navegador, 222 execuções;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- Gate 14 está suspenso até o veredito integrado.

## Retomar o projeto

Leia nesta ordem:

1. `docs/M0_9_AUDITORIA_OPERACIONAL.md`;
2. `docs/PLAN.md`;
3. `docs/MEMORY.md`;
4. `docs/CHANGELOG.md`;
5. log mais recente em `docs/logs/`;
6. documentação global em `../docs/product/`.

A memória M0.9 é viva: decisões, achados, severidades, notas e evidências devem ser atualizados nela no momento em que mudarem.

Não comece um novo gate antes do veredito da auditoria geral. Um lote não está concluído sem documentação, testes e evidências na cabeça final.

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

## Camadas visuais específicas

```text
src/styles/library-organization.css
src/styles/document-metadata.css
src/styles/legacy-import.css
```

## Limites atuais

Ainda não estão aprovados reimportação seletiva, deduplicação automática entre importações, importação parcial, pastas persistentes, operações em massa, sincronização em nuvem, colaboração, DOCX, RTF, ePub, Obsidian ZIP, service worker da aplicação nova, Tauri, SQLite, paginação física, aplicação automática de sugestões ou promoção para `main`.
