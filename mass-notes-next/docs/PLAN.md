# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-29

## Norte do produto

Construir uma oficina de escrita para português brasileiro sobre infraestrutura consolidada de edição, preservando engines locais, identidade editorial e controle integral dos dados por quem escreve.

## Fundação atual

- React + TypeScript + Vite;
- Tiptap / ProseMirror com JSON estrutural;
- IndexedDB por `idb`;
- autosave, recuperação emergencial e conflito entre abas;
- engines legadas por adaptadores tipados;
- contrato de posições UTF-16 auditado;
- decorations somente de leitura da Revisão;
- consulta Palavras/Léxico somente de leitura;
- exportação TXT, Markdown e HTML;
- cópia nativa versionada e restauração não destrutiva;
- Anatomia do Livro integrada por runtime gerado na CI;
- skin Blueprint Tokon isolada e reversível;
- preview isolada em `preview-mass-notes-tiptap`;
- auditor global restrito aos assets da aplicação pública raiz;
- PR rascunho `#155`.

## Gates concluídos

1. **Gate 1 — Fundação:** documento estruturado, histórico isolado, IndexedDB e Revisão.
2. **Gate 2 — Confiabilidade:** Chromium/Firefox, paste, recuperação, conflitos e drawers.
3. **Gate 3 — Espelho de Voz:** engine original por adaptador, hipóteses e descarte de leitura obsoleta.
4. **Gate 4 — Contexto:** base decolonial local, linguagem não acusatória e nenhuma aplicação automática.
5. **Gate 5 — RimaLab:** contratos distintos para prosa/verso e serialização sonora estrutural.
6. **Gate 6 — Posições:** mapeamento entre texto UTF-16 e posições ProseMirror.
7. **Gate 6.5 — Estabilização visual:** contraste, responsividade, drawers e toolbar.
8. **Gate 6.75 — Blueprint Tokon:** skin técnica sem alteração da fundação.
9. **Gate 6.9 — Auditoria editorial:** corpora brasileiros, Unicode e documento extenso.
10. **Gate 7 — Revisão inline:** marks verificáveis, navegação e ocultação reversível.
11. **Gate 8 — Anatomia do Livro:** runtime fiel gerado em CI e transição preservando o editor.
12. **Gate 9A — Exportação estrutural:** TXT, Markdown e HTML derivados do JSON Tiptap.
13. **Gate 9B — Cópia nativa:** envelope versionado, validação integral e restauração como novas cópias.
14. **Gate 10 — Palavras/Léxico:** engine e bases locais por adaptador, seleção durável e consulta sem mutação.
15. **Gate 10.5 — Fronteiras de distribuição:** auditor público separado do build Vite isolado, com regressão automatizada.

## Evidência atual

- cabeça funcional do Gate 10.5: `572af55fc19b59e2c9c9330ce35ccf95be622074`;
- coerência de versões: workflow `30430515120`, verde;
- candidata Argila: workflow `30430515008`, verde;
- Mass Notes: workflow `30430515420`, verde;
- 91 cenários por navegador e 182 execuções aprovadas;
- build, Chromium, Firefox, publicação, renovação de cache e verificação pública verdes;
- aplicação pública, `main` e service worker intactos;
- nenhuma versão global ou tag foi criada artificialmente.

Documentação detalhada dos gates atuais:

- `docs/logs/2026-07-29-gate-10-palavras-lexico.md`;
- `docs/logs/2026-07-29-gate-10-5-fronteiras-distribuicao.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_10.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_10_5.md`.

## Gate 10.5 — contrato fechado

- `index.html`, `service-worker.js` e assets públicos continuam sujeitos a uma versão global única;
- qualquer JS/CSS público alterado sem nova versão continua bloqueando a CI;
- `mass-notes-next/` é uma aplicação Vite independente, com bundle hashado e preview próprios;
- mudanças exclusivas desse subprojeto não avançam `ASSET_VERSION` nem `CACHE_NAME` da aplicação pública;
- PRs mistos filtram somente os assets isolados e continuam auditando mudanças públicas reais;
- o workflow possui regressões Python para assets públicos, preview isolada, relatórios e fontes não distribuídas.

## Próximo lote aprovado — Gate 11: organização da biblioteca

O ciclo essencial já fecha escrita, análise linguística, consulta lexical, exportação e preservação. O próximo ganho deve melhorar a recuperação dos próprios textos sem alterar o contrato estrutural do editor.

Escopo proposto:

1. transformar estado, favorito, tags e data de alteração em filtros claros e combináveis;
2. oferecer ordenação previsível por atualização, título e criação;
3. preservar busca textual, documento ativo e rascunhos durante mudanças de filtro;
4. tornar estados vazios e contagens compreensíveis em desktop e mobile;
5. manter operações unitárias e reversíveis, sem exclusão em massa neste corte;
6. não criar hierarquia ou pasta persistente sem contrato de migração explícito;
7. validar biblioteca extensa, títulos repetidos, Unicode, teclado e drawers nos dois navegadores;
8. atualizar memória, contrato de produto e evidência pública antes de encerrar.

Fora do Gate 11:

- exclusão em massa;
- sincronização em nuvem;
- colaboração;
- pastas aninhadas sem migração;
- aplicação automática de sugestões;
- reescrita generativa;
- promoção para `main`.

Antes do código do Gate 11, devem ser inventariadas as capacidades já existentes de estado, tags, favorito e busca para evitar duplicação de conceito.

## Fora dos próximos gates

- correção em massa;
- tooltips dentro do editor;
- áudio ou leitura em voz alta;
- paginação física;
- service worker/offline em nova sessão;
- Tauri/SQLite;
- promoção para `main`.
