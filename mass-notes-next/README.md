# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade visual e as engines do Escrevaral/Mass Notes, substituindo o editor artesanal por Tiptap/ProseMirror.

## Estado

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` (rascunho);
- preview: `https://raw.githack.com/rfmss/escrevaral/preview-mass-notes-tiptap/index.html`;
- aplicação pública, `main` e service worker: não alterados;
- engines integradas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- exportação: TXT, Markdown e HTML;
- cópia nativa: envelope versionado e restauração como novas cópias;
- biblioteca: busca, filtros combináveis, ordenação, favorito e tags editáveis;
- importação legada: `.esc`/`vrda` v1 com checksum, prévia e confirmação explícita;
- Gates 1 a 13 e Gate 10.5: aprovados;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- duas tranches automatizadas: **119 cenários por navegador, 238 execuções verdes**;
- nota provisória: **87/100**;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público e substituição integral: `NO-SHIP` provisório;
- P0/P1 abertos: 0/0;
- Gate 14 suspenso até o veredito final.

## Retomar o projeto

Leia nesta ordem:

1. `docs/M0_9_AUDITORIA_OPERACIONAL.md`;
2. `docs/audits/M0_9_AUDITORIA_GERAL.md`;
3. `docs/audits/M0_9_AUDITORIA_GERAL.json`;
4. `docs/PLAN.md`;
5. `docs/MEMORY.md`;
6. `docs/CHANGELOG.md`;
7. log mais recente em `docs/logs/`;
8. documentação global em `../docs/product/`.

A memória M0.9 é viva. Decisões, achados, severidades, notas e evidências devem ser atualizados quando mudarem.

Não comece novo gate antes do veredito final. Um lote não termina sem documentação, testes e evidência na cabeça exata.

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
├── engines/      # adaptadores das engines locais
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
- `.esc` legado exige formato, versão, checksum, IDs e conteúdo válidos antes de qualquer escrita;
- selecionar arquivo cria somente prévia em memória;
- confirmar importa todo o lote em transação única, com UUIDs novos e `legacySourceId` auditável;
- nenhum documento existente é substituído;
- exportação usa o estado atual React/Tiptap, inclusive antes do autosave convergir;
- conflito misto preserva as duas versões;
- durante M0.9, auditar precede corrigir e feature nova fica suspensa;
- preview só é publicada após build, Chromium, Firefox, cache e smoke público verdes.

## Cobertura transversal aprovada

Em Chromium e Firefox:

- escrita, metadados, autosave e recarga;
- cinco superfícies linguísticas na mesma sessão sem mutação;
- sentinela autoral ausente de URL e corpo de requisição;
- filtros sem alterar revisão ou descartar página ativa;
- drawer em 320 e 390 px;
- 100 páginas e documento acima de 100 mil caracteres;
- conflito misto entre abas com ambas as versões preservadas;
- exportação do rascunho ainda alterado;
- cópia nativa, restauração e `.esc` legado na mesma sessão.

Evidência funcional da tranche 2:

- cabeça `2a4333337a04b73a6c034b8fd35bc582994a114b`;
- Mass Notes `30467582850`;
- Argila `30467583011`;
- coerência `30467584508`.

O milestone continua aberto para UIX manual, acessibilidade real, rede integral, desempenho medido, corpus ampliado e decisões sobre P2.

## Limites atuais

Ainda não estão aprovados reimportação seletiva, deduplicação automática, importação parcial, pastas, operações em massa, sincronização, colaboração, DOCX, RTF, ePub, Obsidian ZIP, PWA própria, Prova de Autoria na nova fundação, Tauri, SQLite, paginação física, aplicação automática de sugestões ou promoção para `main`.
