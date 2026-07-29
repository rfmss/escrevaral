# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-28

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
- exportação TXT, Markdown e HTML;
- cópia nativa versionada e restauração não destrutiva;
- Anatomia do Livro integrada por runtime gerado na CI;
- skin Blueprint Tokon isolada e reversível;
- preview isolada em `preview-mass-notes-tiptap`;
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

## Evidência atual

- workflow funcional final: `30417867701`;
- 86 cenários por navegador;
- 172 execuções aprovadas;
- build, Chromium, Firefox, publicação, renovação de cache e verificação pública verdes;
- `main`, aplicação pública e service worker intactos.

Documentação detalhada do gate atual:

- `docs/logs/2026-07-28-gate-9b-copia-nativa.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_9B.md`.

## Próximo lote proposto — Gate 10: Palavras / Léxico

O ciclo essencial já fecha escrita, leitura linguística, organização básica, exportação e preservação. O próximo diferencial de produto deve ser a consulta lexical local do Escrevaral anterior.

Escopo proposto:

1. inventariar a engine lexical e suas bases sem modificá-las;
2. criar adaptador TypeScript defensivo em `src/engines/`;
3. definir contrato explícito para seleção atual e consulta digitada;
4. oferecer definição, classe gramatical, polissemia, locuções e sinônimos disponíveis;
5. manter toda consulta local;
6. não alterar nem substituir automaticamente o manuscrito;
7. invalidar resultados quando documento ou seleção mudarem;
8. validar vazio, palavra desconhecida, acentos, flexões, seleção de frase e mobile;
9. preservar o contrato de posições e não depender da forma acidental do DOM.

Fora do Gate 10:

- aplicação automática de sinônimos;
- reescrita generativa;
- consulta em serviços externos;
- análise de precisão por gênero;
- DOCX, RTF, ePub ou Obsidian ZIP;
- importação do `.esc` legado;
- promoção para `main`.

O Gate 10 não começa automaticamente. Antes do código, a engine/base lexical e o contrato de seleção devem ser lidos e registrados no menor patch possível.

## Fora dos próximos gates

- correção em massa;
- tooltips dentro do editor;
- áudio ou leitura em voz alta;
- paginação física;
- service worker/offline em nova sessão;
- Tauri/SQLite;
- promoção para `main`.
