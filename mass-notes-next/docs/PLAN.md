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
- estado, favorito e tags editáveis pelo mesmo contrato versionado do documento;
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
17. **Gate 12 — Metadados editoriais:** edição unitária de estado, favorito e tags no mesmo autosave, revisão e conflito do documento.

## Evidência atual

- cabeça funcional do Gate 12: `70226195cd742b714ad53bb2a9c4cd815210d821`;
- Mass Notes: workflow `30452750643`, verde;
- candidata Argila: workflow `30452747030`, verde;
- coerência de versões: workflow `30452747019`, verde;
- 105 cenários por navegador e 210 execuções aprovadas;
- build, Chromium, Firefox, publicação, renovação de cache e verificação pública verdes;
- aplicação pública, `main` e service worker intactos;
- nenhuma migração de schema ou repositório paralelo foi criada.

Documentação detalhada:

- `docs/logs/2026-07-29-gate-12-metadados-editoriais.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_12.md`.

## Gate 12 — contrato fechado

- `status`, `favorite` e `tags` continuam no mesmo `EscrevaralDocument`;
- qualquer mudança nesses campos incrementa a mesma `revision` usada pelo manuscrito;
- autosave, recuperação emergencial, IndexedDB e conflito entre abas são compartilhados;
- não existe merge campo a campo ou sobrescrita silenciosa;
- `DraftMutationKind` distingue `manuscript` de `metadata` sem criar uma segunda persistência;
- título, conteúdo Tiptap e texto derivado são mutações de manuscrito;
- estado, favorito e tags são mutações editoriais;
- mutações editoriais preservam editor montado, seleção, mapa de posições e leituras linguísticas válidas;
- mutações de manuscrito continuam invalidando leituras e decorations obsoletas;
- atualizações remotas limpas de metadados são absorvidas sem desmontar o Tiptap;
- conflito com rascunho local exige escolha explícita entre carregar a outra aba ou guardar a versão local como cópia;
- favorito é alternado unitariamente;
- tags são aplicadas atomicamente, deduplicadas por caixa e acentos, limitadas a 8 itens de 32 caracteres e removíveis uma a uma;
- alterações aparecem imediatamente nos cartões, filtros e cópia nativa;
- desktop e drawer móvel permanecem acessíveis e sem overflow.

## Próximo lote proposto — Gate 13: importação auditável do `.esc` legado

O produto novo já escreve, analisa, organiza, exporta, protege cópias nativas e mantém metadados. O próximo risco de produto é a continuidade de quem possui documentos no formato legado: esses dados não devem exigir migração manual nem ser confundidos com o envelope nativo novo.

Escopo proposto:

1. identificar e validar explicitamente o schema do `.esc` legado antes de qualquer escrita;
2. apresentar uma pré-visualização com quantidade, títulos, avisos e campos recuperáveis;
3. converter conteúdo legado para JSON Tiptap por adaptador isolado;
4. preservar texto, título, estado, favorito, tags e origem quando disponíveis;
5. usar `legacySourceId` para rastreabilidade sem reutilizar identidade de origem;
6. importar sempre como novas cópias, sem substituir documentos existentes;
7. rejeitar o lote integralmente quando o arquivo ou conversão for estruturalmente inválido;
8. cobrir Unicode, documentos vazios, IDs repetidos, versões desconhecidas, biblioteca extensa e mobile;
9. manter todo processamento local e sem upload externo.

Fora do Gate 13:

- sincronização em nuvem;
- colaboração;
- merge automático com documentos existentes;
- importação em massa de DOCX, RTF ou ePub;
- pastas ou hierarquia persistente;
- taxonomia automática;
- promoção para `main`.

O Gate 13 permanece proposto e não começa antes da revisão do formato legado real e de um contrato de conversão documentado.

## Fora dos próximos gates

- correção em massa;
- tooltips dentro do editor;
- áudio ou leitura em voz alta;
- paginação física;
- service worker/offline em nova sessão;
- Tauri/SQLite;
- promoção para `main`.
