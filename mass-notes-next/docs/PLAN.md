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
- `docs/M0_9_ERRATA_MATRIZ.md`;
- `docs/audits/M0_9_AUDITORIA_GERAL.md`;
- `docs/audits/M0_9_AUDITORIA_GERAL.json`;
- `docs/logs/2026-07-29-m0-9-auditoria-nao-funcional-tranche-3.md`;
- `docs/logs/2026-07-29-m0-9-decisoes-p2.md`;
- `../docs/product/MASS_NOTES_TIPTAP_M0_9.md`.

## Tranches automatizadas — concluídas

Suítes:

- `tests/m0-9-integrated.spec.ts`;
- `tests/m0-9-nonfunctional.spec.ts`;
- matriz consolidada atual: **124 cenários por navegador, 248 execuções**.

A cabeça funcional inicial da tranche 3 executou 126/252. Depois, duas fixtures antigas foram consolidadas sem remover a cobertura semântica da tranche; `docs/M0_9_ERRATA_MATRIZ.md` é a referência autoritativa para essa mudança.

Jornadas integradas aprovadas:

1. escrita → metadados → autosave → recarga;
2. Revisão → Voz → Contexto → RimaLab → Palavras sem mutação;
3. busca/filtros sem alterar revisão nem descartar página ativa;
4. drawer em 320 e 390 px;
5. 100 páginas e documento acima de 100 mil caracteres;
6. conflito misto real preservando documento remoto e cópia local;
7. exportação do rascunho atual antes da persistência convergir;
8. cópia nativa → restauração → `.esc` cancelar → `.esc` confirmar na mesma sessão.

Jornadas não funcionais aprovadas:

1. geometria, drawers, rails e screenshots em 320, 390, 768, 1024, 1280 e 1440 px;
2. layout CSS equivalente a janela 1280×900 em zoom de 200%;
3. movimento reduzido reconhecido e transição editorial em até 300 ms;
4. observação integral de rede sem texto autoral transmitido;
5. recuperação emergencial do mesmo documento, sem duplicação e com limpeza do envelope;
6. doze ciclos de edição e salvamento, com DOM, heap e p95 observados;
7. corpus separado para cada engine sem alterar o snapshot semântico.

Privacidade e rede:

- frase sentinela autoral ausente de URL e corpo de toda requisição observada;
- dependência externa conhecida: `https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js`;
- a requisição não contém texto autoral;
- o achado virou `M09-F006` P2 e bloqueia promessa offline integral.

Desempenho observado na CI:

- Chromium: p95 192 ms, DOM 179→179, heap 16.100.000→16.100.000 bytes na evidência funcional;
- Firefox: p95 90 ms, DOM 179→179, heap indisponível na evidência funcional;
- interpretação obrigatória: detector de regressão, não SLA ou benchmark universal.

Evidência funcional da tranche 3:

- cabeça `305d0727ddfaee11f3e7680d0f9168023e9a4284`;
- Mass Notes `30478738806`: 252/252, publicação, cache e smoke público;
- Argila `30478738678`: verde;
- coerência `30478738607`: verde;
- artefato `mass-notes-tiptap-30478738806`.

Evidência consolidada posterior:

- cabeça `4939b3429f166664e377ed2251f28f87345308af`;
- Mass Notes `30482560502`: 248/248, publicação, cache e smoke público;
- Argila `30482553803`: verde;
- coerência `30482553920`: verde.

## Decisões dos P2 — concluídas

Fonte: `docs/logs/2026-07-29-m0-9-decisoes-p2.md`.

### M09-F001 — PWA/offline próprio ausente

- aceito somente para beta fechada explicitamente online;
- bloqueia lançamento público;
- exige gate de release próprio depois do M0.9.

### M09-F006 — dependência externa da Anatomia

- aceito somente para beta online, com aviso de dependência de conexão;
- `page-flip@2.0.7` deverá ser vendorizado, empacotado localmente ou removido antes de promessa offline ou lançamento público;
- integra o futuro gate de release/autonomia.

### M09-F002 — Prova de Autoria ausente

- não bloqueia beta fechada da oficina de escrita;
- não pode ser apresentada como paridade entregue;
- bloqueia substituição integral até restauração da capacidade ou aposentadoria formal da promessa.

### M09-F003 — paridade de exportação incompleta

- TXT, Markdown e HTML permanecem o contrato atual;
- não bloqueia beta fechada;
- DOCX é o primeiro candidato a gate posterior, condicionado à evidência de uso;
- RTF, ePub e Obsidian ZIP serão priorizados por demanda;
- substituição integral permanece bloqueada para fluxos dependentes.

## Vereditos após decisões

- nota geral: 88/100;
- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- P0/P1: 0/0;
- os quatro P2 possuem decisão explícita, mas seus bloqueios permanecem ativos onde indicado.

Condições mínimas da beta fechada:

1. beta pequena e acompanhada;
2. uso online, sem promessa de instalação/offline;
3. aviso de dependência de conexão para a Anatomia;
4. exportação limitada a TXT, Markdown e HTML;
5. Prova de Autoria indisponível;
6. canal direto para incidentes de dados, acessibilidade e engines;
7. validação humana mínima antes de convidar participantes externos.

## Próxima tranche — validação humana mínima e encerramento

Prioridades:

1. revisão humana das screenshots nas seis larguras;
2. zoom real de 200% no navegador;
3. teclado completo e leitor de tela quando disponível;
4. pelo menos um dispositivo físico móvel e um desktop;
5. uso prolongado em máquina real;
6. registrar resultados, inclusive limitações não executáveis;
7. emitir veredito final do M0.9;
8. validar a cabeça documental final;
9. atualizar somente o corpo do PR, sem commit posterior.

O que a automação não autoriza afirmar:

- que o zoom real do navegador foi testado;
- que leitores de tela foram aprovados;
- que dispositivos físicos foram auditados;
- que as métricas da CI valem para todo hardware;
- que a Anatomia funciona offline.

## Sequência recomendada depois do M0.9

1. decidir autorização operacional da beta fechada;
2. gate de release/autonomia: service worker próprio e `page-flip` local;
3. gate de portabilidade começando por DOCX, se confirmado por uso;
4. gate ou aposentadoria formal da Prova de Autoria;
5. reavaliar lançamento público e substituição integral;
6. somente depois retomar Gate 14 ou repriorizá-lo conforme evidência da beta.

## Gate 14 — suspenso

Gate 14 continua proposto, mas não pode começar antes do veredito final M0.9.

Escopo futuro preservado:

- persistir somente busca, estado, favorito, tag e ordenação como preferências;
- validar valores lidos;
- oferecer restauração da visão padrão;
- não persistir rascunho, seleção, documento ativo ou resultados de engines;
- não escrever no IndexedDB nem incrementar revisão.