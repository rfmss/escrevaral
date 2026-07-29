# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-29

## Norte do produto

Construir uma oficina de escrita para português brasileiro sobre infraestrutura consolidada de edição, preservando engines locais, identidade editorial e controle integral dos dados por quem escreve.

## Fundação atual

- React + TypeScript + Vite;
- Tiptap/ProseMirror com JSON estrutural;
- IndexedDB por `idb`;
- autosave, recuperação emergencial e conflito entre abas;
- engines legadas por adaptadores tipados;
- contrato de posições UTF-16 auditado;
- Revisão inline e Palavras/Léxico somente de leitura;
- exportação TXT, Markdown e HTML;
- cópia nativa versionada e restauração não destrutiva;
- Anatomia do Livro por runtime gerado na CI;
- skin Blueprint Tokon isolada e reversível;
- biblioteca consultável por camada pura;
- preview isolada em `preview-mass-notes-tiptap`;
- auditor global restrito aos assets da aplicação pública raiz;
- PR rascunho `#155`.

## Gates concluídos

1. **Gate 1 — Fundação:** documento estruturado, histórico isolado, IndexedDB e Revisão.
2. **Gate 2 — Confiabilidade:** Chromium/Firefox, paste, recuperação, conflitos e drawers.
3. **Gate 3 — Espelho de Voz:** engine por adaptador e descarte de leitura obsoleta.
4. **Gate 4 — Contexto:** base local, linguagem não acusatória e nenhuma aplicação automática.
5. **Gate 5 — RimaLab:** contratos distintos para prosa e verso.
6. **Gate 6 — Posições:** mapeamento UTF-16 entre texto e ProseMirror.
7. **Gate 6.5 — Estabilização visual:** contraste, responsividade, drawers e toolbar.
8. **Gate 6.75 — Blueprint Tokon:** skin técnica sem alteração da fundação.
9. **Gate 6.9 — Auditoria editorial:** corpora brasileiros, Unicode e documento extenso.
10. **Gate 7 — Revisão inline:** marks verificáveis, navegação e ocultação reversível.
11. **Gate 8 — Anatomia do Livro:** runtime fiel e transição preservando o editor.
12. **Gate 9A — Exportação estrutural:** TXT, Markdown e HTML derivados do JSON Tiptap.
13. **Gate 9B — Cópia nativa:** envelope versionado e restauração como novas cópias.
14. **Gate 10 — Palavras/Léxico:** seleção durável e consulta local sem mutação.
15. **Gate 10.5 — Fronteiras de distribuição:** auditor público separado do build Vite isolado.
16. **Gate 11 — Organização da biblioteca:** filtros combináveis, ordenação estável, estados vazios e preservação da página ativa.

## Evidência atual

- cabeça funcional do Gate 11: `1e4ca1784b145b510ba6d3749025230d22f7d632`;
- Mass Notes: workflow `30449369857`, verde;
- candidata Argila: workflow `30449371552`, verde;
- coerência de versões: workflow `30449371768`, verde;
- 98 cenários por navegador e 196 execuções aprovadas;
- build, Chromium, Firefox, publicação, renovação de cache e verificação pública verdes;
- aplicação pública, `main` e service worker intactos;
- nenhuma migração de schema ou gravação foi introduzida pelo Gate 11.

Documentação detalhada:

- `docs/logs/2026-07-29-gate-11-organizacao-biblioteca.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_11.md`.

## Gate 11 — contrato fechado

- `src/library/libraryQuery.ts` concentra normalização, filtros, tags e ordenação;
- busca combina título, texto, tags e estado, ignorando caixa e acentos;
- estado, favorito, tag e busca são filtros combináveis;
- ordenação oferece alteração recente, criação recente e título A–Z;
- desempates usam datas, título e identidade de forma previsível;
- variantes equivalentes de tag recebem representante canônico determinístico;
- contagem mostra páginas visíveis e total da biblioteca;
- estado vazio explica o recorte e oferece limpeza imediata;
- a página ativa permanece aberta quando fica fora do filtro;
- rascunho, seleção e autosave não são interrompidos;
- filtros não escrevem no IndexedDB e não alteram revisão;
- biblioteca extensa, Unicode, títulos repetidos e drawer móvel foram validados nos dois navegadores.

## Próximo lote proposto — Gate 12: metadados editoriais

O Gate 11 torna `favorite` e `tags` visíveis e úteis quando já existem em documentos restaurados ou migrados. O próximo ganho lógico é permitir que a pessoa mantenha esses campos no produto novo sem criar um caminho paralelo ou inseguro de persistência.

Escopo proposto:

1. alternar favorito da página ativa por comando explícito;
2. editar tags da página ativa com normalização, limites e remoção clara;
3. usar o mesmo contrato de revisão condicional do documento;
4. preservar conteúdo, histórico Tiptap, seleção e leituras linguísticas quando só metadados mudarem;
5. tratar conflito entre abas sem sobrescrever silenciosamente;
6. refletir alterações imediatamente nos filtros e na cópia nativa;
7. validar teclado, mobile, Unicode, tags duplicadas e falhas de gravação;
8. manter operações unitárias e reversíveis.

Fora do Gate 12:

- edição em massa;
- exclusão em massa;
- pastas ou hierarquia persistente;
- sincronização em nuvem;
- colaboração;
- taxonomia automática;
- aplicação automática de sugestões;
- promoção para `main`.

O Gate 12 não começa automaticamente. Antes do código, deve ser definido se uma alteração exclusivamente de metadados incrementa a mesma `revision` do documento e como o conflito será apresentado sem descartar conteúdo.

## Fora dos próximos gates

- correção em massa;
- tooltips dentro do editor;
- áudio ou leitura em voz alta;
- paginação física;
- service worker/offline em nova sessão;
- Tauri/SQLite;
- promoção para `main`.
