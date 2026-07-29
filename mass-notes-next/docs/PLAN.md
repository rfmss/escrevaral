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
18. Gate 13 — importação auditável do `.esc` legado.

## Gate 13 — evidência fechada

- cabeça funcional `323e8a1e131a3692932e960e9285570df49a1460`;
- Mass Notes `30457008816`: 222/222, publicação, cache e smoke público;
- Argila `30457009394` e coerência `30457008762`: verdes;
- log: `docs/logs/2026-07-29-gate-13-importacao-esc-legado.md`;
- contrato global: `../docs/product/MASS_NOTES_TIPTAP_GATE_13.md`.

Contrato:

- envelope `format: esc|vrda`, `schemaVersion: 1`, checksum FNV-1a e `payload.manuscripts`;
- prévia em memória, sem escrita;
- cancelamento sem efeito;
- validação integral antes da transação;
- UUIDs novos, sufixo `— importado`, `revision: 0` e `legacySourceId` preservado;
- sem substituição, merge, importação parcial ou deduplicação silenciosa.

## Milestone atual — M0.9: Candidata Integrada do Escrevaral

O produto é auditado como oficina integrada antes de qualquer novo gate.

Fontes:

- `docs/M0_9_AUDITORIA_OPERACIONAL.md`;
- `docs/audits/M0_9_AUDITORIA_GERAL.md`;
- `docs/audits/M0_9_AUDITORIA_GERAL.json`;
- `../docs/product/MASS_NOTES_TIPTAP_M0_9.md`.

## Tranches automatizadas — concluídas

Suíte transversal:

- `tests/m0-9-integrated.spec.ts`;
- oito cenários por navegador;
- matriz total: **119 cenários por navegador, 238 execuções**.

Jornadas aprovadas:

1. escrita → metadados → autosave → recarga;
2. Revisão → Voz → Contexto → RimaLab → Palavras sem mutação;
3. busca/filtros sem alterar revisão nem descartar página ativa;
4. drawer em 320 e 390 px;
5. 100 páginas e documento acima de 100 mil caracteres;
6. conflito misto real preservando documento remoto e cópia local;
7. exportação do rascunho atual antes da persistência convergir;
8. cópia nativa → restauração → `.esc` cancelar → `.esc` confirmar na mesma sessão.

Privacidade:

- frase sentinela autoral ausente de URL e corpo de requisição durante as engines.

Evidência funcional da tranche 2:

- cabeça `2a4333337a04b73a6c034b8fd35bc582994a114b`;
- Mass Notes `30467582850`: 238/238, publicação, cache e smoke público;
- Argila `30467583011`: verde;
- coerência `30467584508`: verde.

Veredito provisório:

- nota geral: 87/100;
- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- P0/P1: 0/0;
- P2: PWA/offline próprio ausente, Prova de Autoria ausente e exportação sem paridade avançada;
- P3: preferências da biblioteca não persistem e documento ativo é compartilhado entre abas.

## Próxima tranche — auditoria não funcional e decisão

Prioridades:

1. auditoria heurística manual de UIX em 320, 390, 768, 1024, 1280 e 1440 px;
2. zoom 200%, movimento reduzido, leitores de tela e dispositivos reais;
3. observação integral de rede em todas as jornadas;
4. recuperação emergencial integrada;
5. sessão prolongada, latência e memória;
6. corpus ampliado e consolidado por engine;
7. decisões explícitas para cada P2;
8. veredito final;
9. CI na cabeça documental final e registro exato no PR sem commit posterior.

## Gate 14 — suspenso

Gate 14 continua proposto, mas não pode começar antes do veredito final M0.9.

Escopo futuro preservado:

- persistir somente busca, estado, favorito, tag e ordenação como preferências;
- validar valores lidos;
- oferecer restauração da visão padrão;
- não persistir rascunho, seleção, documento ativo ou resultados de engines;
- não escrever no IndexedDB nem incrementar revisão.
