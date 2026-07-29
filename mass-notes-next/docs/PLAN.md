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

## Evidência atual

- workflow final: `30422368445`;
- cabeça validada: `31f6fbe92b3a6742affe26ad797046d9b2ae0e3a`;
- 91 cenários por navegador;
- 182 execuções aprovadas;
- build, Chromium, Firefox, publicação, renovação de cache e verificação pública verdes;
- `main`, aplicação pública e service worker intactos.

Documentação detalhada do gate atual:

- `docs/logs/2026-07-29-gate-10-palavras-lexico.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_10.md`.

## Gate 10 — contrato fechado

- `lexical-engine.js`, `lexical-data.json` e `norma-data.json` permanecem fontes intactas;
- `src/engines/lexicalAdapter.ts` isola carregamento, normalização e defesa contra falsos verbetes;
- `src/editor/lexicalSelectionBridge.ts` mantém o último recorte selecionado com `documentId`, `from`, `to` e texto;
- a seleção pode anteceder a abertura do painel sem ser perdida;
- busca digitada e seleção usam o mesmo caminho de leitura;
- palavra registrada sem ocorrência pode mostrar definição, mas não recebe classe contextual inventada;
- fallback morfológico sem ocorrência e sem registro local é tratado como ausência segura;
- nenhum botão aplica, substitui ou reescreve conteúdo;
- nenhum manuscrito é enviado para serviço externo.

## Próximo lote proposto — Gate 11: organização da biblioteca

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

O Gate 11 não começa automaticamente. Antes do código, devem ser inventariadas as capacidades já existentes de estado, tags, favorito e busca para evitar duplicação de conceito.

## Fora dos próximos gates

- correção em massa;
- tooltips dentro do editor;
- áudio ou leitura em voz alta;
- paginação física;
- service worker/offline em nova sessão;
- Tauri/SQLite;
- promoção para `main`.