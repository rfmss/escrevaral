# Plano vivo — Mass Notes Next

Atualizado em: 2026-07-29

## Norte do produto

Construir uma oficina de escrita para português brasileiro sobre infraestrutura consolidada, preservando engines locais, identidade editorial e controle integral dos dados.

## Fundação atual

- React, TypeScript, Vite e Tiptap/ProseMirror;
- JSON estrutural, IndexedDB, autosave, recuperação e conflitos;
- engines locais por adaptadores tipados;
- Revisão inline e Palavras/Léxico somente de leitura;
- exportação TXT, Markdown e HTML;
- cópia nativa versionada;
- biblioteca consultável e metadados editoriais editáveis;
- importador auditável do `.esc` legado;
- preview isolada e PR rascunho `#155`.

## Gates concluídos

1. Fundação.
2. Confiabilidade.
3. Espelho de Voz.
4. Contexto.
5. RimaLab.
6. Posições UTF-16.
7. Gate 6.5 — estabilização visual.
8. Gate 6.75 — Blueprint Tokon.
9. Gate 6.9 — auditoria editorial.
10. Revisão inline.
11. Anatomia do Livro.
12. Gate 9A — exportação estrutural.
13. Gate 9B — cópia nativa.
14. Palavras/Léxico.
15. Gate 10.5 — fronteiras de distribuição.
16. Organização da biblioteca.
17. Metadados editoriais.
18. **Gate 13 — importação auditável do `.esc` legado:** prévia, validação integral, conversão e novas cópias rastreáveis.

## Evidência atual

- cabeça funcional do Gate 13: `323e8a1e131a3692932e960e9285570df49a1460`;
- Mass Notes: workflow `30457008816`, verde;
- candidata Argila: workflow `30457009394`, verde;
- coerência de versões: workflow `30457008762`, verde;
- 111 cenários por navegador e 222 execuções aprovadas;
- build, Chromium, Firefox, publicação, cache e smoke público verdes;
- aplicação pública, `main` e service worker intactos.

Documentação detalhada:

- `docs/logs/2026-07-29-gate-13-importacao-esc-legado.md`;
- `../docs/product/MASS_NOTES_TIPTAP_GATE_13.md`.

## Gate 13 — contrato fechado

- formato aceito: envelope JSON `format: esc|vrda`, `schemaVersion: 1`, checksum FNV-1a e `payload.manuscripts`;
- `src/import/legacyEscImport.ts` concentra parsing, validação, checksum, conversão e plano de prévia;
- selecionar arquivo não grava; a prévia existe somente em memória;
- cancelar não altera a biblioteca;
- versão, checksum, payload, limite, identificadores e conteúdos são validados antes da transação;
- IDs ausentes ou duplicados invalidam todo o lote;
- texto legado é convertido com `plainTextToContent`;
- estado, tags, favorito e datas são mapeados de forma conservadora;
- confirmação importa o lote inteiro em uma transação IndexedDB;
- cada documento recebe UUID novo, sufixo `— importado`, `revision: 0` e `legacySourceId` preservado;
- nenhum documento existente é substituído;
- não há merge automático, deduplicação silenciosa ou importação parcial;
- processamento permanece local;
- desktop e drawer móvel foram validados em Chromium e Firefox.

## Próximo lote proposto — Gate 14: preferências da biblioteca

Objetivo: retomar busca, filtros e ordenação de forma previsível entre sessões sem transformar preferências de interface em estado autoral.

Escopo proposto:

1. persistir somente `search`, `status`, `favoritesOnly`, `tag` e `sort` em armazenamento de preferências;
2. validar e normalizar valores lidos antes de aplicá-los;
3. oferecer “Restaurar visão padrão”;
4. nunca persistir rascunho, seleção, documento ativo ou resultados de engines nesse contrato;
5. não escrever no IndexedDB nem incrementar `revision`;
6. manter filtros incompatíveis com dados removidos em fallback seguro;
7. cobrir nova sessão, armazenamento corrompido, mobile e leitores de teclado.

Fora do Gate 14:

- pastas, coleções ou hierarquia;
- operações em massa;
- sincronização em nuvem;
- colaboração;
- taxonomia automática;
- promoção para `main`.

O Gate 14 permanece proposto e não foi iniciado.
