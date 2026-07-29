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

- cabeça funcional: `323e8a1e131a3692932e960e9285570df49a1460`;
- Mass Notes `30457008816`: 222/222, publicação, cache e smoke público verdes;
- Argila `30457009394`: verde;
- coerência `30457008762`: verde;
- log: `docs/logs/2026-07-29-gate-13-importacao-esc-legado.md`;
- contrato global: `../docs/product/MASS_NOTES_TIPTAP_GATE_13.md`.

Contrato:

- envelope `format: esc|vrda`, `schemaVersion: 1`, checksum FNV-1a e `payload.manuscripts`;
- seleção cria prévia em memória, sem escrita;
- cancelar não altera biblioteca;
- lote inteiro é validado antes da transação;
- confirmação cria UUIDs novos, sufixo `— importado`, `revision: 0` e preserva `legacySourceId`;
- nenhum documento existente é substituído;
- não há merge, importação parcial ou deduplicação silenciosa.

## Milestone atual — M0.9: Candidata Integrada do Escrevaral

O produto será auditado como oficina integrada antes de qualquer novo gate.

Fontes:

- memória viva: `docs/M0_9_AUDITORIA_OPERACIONAL.md`;
- relatório: `docs/audits/M0_9_AUDITORIA_GERAL.md`;
- estado estruturado: `docs/audits/M0_9_AUDITORIA_GERAL.json`;
- contrato global: `../docs/product/MASS_NOTES_TIPTAP_M0_9.md`.

## Primeira tranche M0.9 — concluída

Suíte criada:

- `tests/m0-9-integrated.spec.ts`;
- cinco cenários por navegador;
- matriz total: 116 cenários por navegador, 232 execuções.

Jornadas aprovadas:

1. escrita → metadados → autosave → recarga;
2. Revisão → Voz → Contexto → RimaLab → Palavras sem mutação;
3. busca/filtros sem alterar revisão nem descartar página ativa;
4. drawer integrado em 320 e 390 px;
5. 100 páginas e documento acima de 100 mil caracteres.

Privacidade:

- frase sentinela autoral não apareceu em URL ou corpo de requisição durante as engines.

Incidente:

- primeira execução: 231/232;
- todos os 10 casos novos passaram;
- única falha em helper antigo do RimaLab, pois o autosave já estava em `Salvo`;
- produto não alterado;
- helper estabilizado sem remover convergência obrigatória para `Salvo`.

Evidência verde:

- cabeça `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`;
- Mass Notes `30463426867`: 232/232, publicação, cache e smoke público;
- Argila `30463426847`: verde;
- coerência `30463426811`: verde.

Veredito provisório:

- nota geral: 85/100;
- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- P0: 0;
- P1: 0;
- P2: PWA/offline próprio ausente, Prova de Autoria ausente e exportação sem paridade integral.

## Segunda tranche M0.9 — próxima ação

Prioridades:

1. conflito real entre duas páginas envolvendo manuscrito e metadados;
2. exportação antes da persistência;
3. cópia nativa/restauração e importação legada na mesma sessão;
4. acessibilidade ampliada, zoom, movimento reduzido e tecnologias assistivas/dispositivos reais;
5. observação integral de rede;
6. sessão prolongada, latência e memória;
7. corpus ampliado por engine;
8. decisões explícitas para cada P2;
9. veredito final e cabeça exata sem commit posterior.

## Gate 14 — suspenso

Gate 14 continua proposto, mas não pode começar antes do veredito final M0.9.

Escopo futuro preservado:

- persistir somente busca, estado, favorito, tag e ordenação como preferências;
- validar valores lidos;
- oferecer restauração da visão padrão;
- não persistir rascunho, seleção, documento ativo ou resultados de engines;
- não escrever no IndexedDB nem incrementar revisão.
