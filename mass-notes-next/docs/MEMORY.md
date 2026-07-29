# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-29

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto, mesclável e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: intactos;
- Gates 1 a 13 e Gate 10.5: verdes;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- duas tranches automatizadas concluídas;
- navegadores obrigatórios: Chromium e Firefox;
- matriz: 119 cenários por navegador, 238 execuções;
- cabeça funcional da tranche 2: `2a4333337a04b73a6c034b8fd35bc582994a114b`;
- workflows verdes: Mass Notes `30467582850`, Argila `30467583011`, coerência `30467584508`;
- nota provisória: 87/100;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público: `NO-SHIP` provisório;
- substituição integral: `NO-SHIP` provisório;
- P0/P1 abertos: 0/0;
- Gate 14 suspenso até o veredito final.

## Fontes de retomada

1. `M0_9_AUDITORIA_OPERACIONAL.md` — memória executável viva;
2. `audits/M0_9_AUDITORIA_GERAL.md` — relatório humano;
3. `audits/M0_9_AUDITORIA_GERAL.json` — estado estruturado;
4. `logs/2026-07-29-m0-9-auditoria-integrada-tranche-2.md` — lote mais recente;
5. `../../docs/product/MASS_NOTES_TIPTAP_M0_9.md` — contrato global.

## Decisões permanentes

1. Tiptap/ProseMirror é o motor de edição e JSON Tiptap é a fonte estrutural.
2. IndexedDB é a fonte principal; localStorage guarda preferências e recuperação emergencial.
3. Nenhuma aba sobrescreve outra silenciosamente.
4. Engines entram por adaptadores tipados, funcionam localmente e não aplicam texto.
5. Offsets linguísticos usam UTF-16 sobre o Node ProseMirror real.
6. Decorations ficam fora do JSON autoral e só são invalidadas quando o manuscrito muda.
7. Exportadores, backups, importadores e consultas vivem em camadas próprias.
8. Cópia nativa e `.esc` legado são formatos diferentes e nunca compartilham parser.
9. Documentação, testes e evidências integram a definição de pronto.
10. A preview é produto de build e nunca recebe edição direta.
11. Filtros da biblioteca são projeções puras.
12. Estado, favorito e tags pertencem à mesma revisão e persistência do manuscrito.
13. Mudanças editoriais preservam leituras textuais válidas.
14. Operações em massa, hierarquia e sincronização exigem gates próprios.
15. Importação valida tudo antes de qualquer escrita.
16. Lote legado inválido é rejeitado integralmente.
17. Selecionar arquivo legado não autoriza gravação.
18. Importação legada nunca reutiliza IDs atuais nem substitui documentos.
19. `legacySourceId` é trilha de origem, não chave de merge.
20. Reimportação não recebe deduplicação silenciosa.
21. M0.9 precede Gate 14 e qualquer nova feature.
22. A auditoria é memória viva no repositório.
23. Auditar precede corrigir.
24. Correção durante M0.9 só remove P0 ou bloqueio de medição e exige matriz completa.
25. Beta, lançamento público e substituição recebem vereditos separados.
26. PR permanece em rascunho e `main` intacta.
27. Notas e vereditos permanecem provisórios até as fases manuais.
28. Falha temporal de teste não vira defeito sem reprodução funcional.
29. Estados intermediários rápidos do autosave podem não ser observáveis; `Salvo` final continua obrigatório.
30. Exportação usa o estado atual React/Tiptap, não uma releitura do IndexedDB.
31. Conflito é aprovado pela preservação das versões, não pela seleção ativa após recarga.
32. Documento ativo é uma preferência compartilhada entre abas na origem atual.
33. Cenários de falha simulada devem estabilizar entradas alheias ao contrato testado.
34. SHA documental exato é registrado no PR depois da CI para evitar commit autorreferente.

## Cobertura transversal aprovada

### Escrita e retomada

- criação de página;
- título e texto;
- estado, favorito e tags;
- autosave e salvamento explícito;
- recarga e retomada;
- organização sem alterar revisão ou descartar rascunho.

### Engines em sequência

- Revisão;
- Espelho de Voz;
- Termos que pedem contexto;
- RimaLab;
- Palavras/Léxico.

Resultado:

- texto, `plainText` e `revision` preservados;
- nenhuma aplicação automática;
- frase sentinela ausente de URL e corpo de requisição.

### Conflito misto

- mutação de manuscrito em uma aba;
- mutação editorial em outra;
- conflito explícito;
- versão local guardada como cópia;
- documento remoto e cópia favorita preservados no IndexedDB;
- nenhuma sobrescrita silenciosa.

A preferência ativa compartilhada pode fazer outra aba abrir a cópia após recarga. Isso é P3 de previsibilidade, não perda de dados.

### Exportação imediata

- versão anterior persistida;
- título e texto atuais ainda em `Alterado|Salvando`;
- Markdown contém o estado atual;
- autosave converge depois para `Salvo`.

### Portabilidade combinada

Na mesma sessão:

- criar cópia nativa;
- restaurar como novas cópias;
- manter página ativa;
- pré-visualizar `.esc`;
- cancelar sem escrita;
- confirmar importação;
- preservar `legacySourceId`;
- não substituir documentos existentes.

### Mobile e escala

- drawer e sete abas em 320/390 px;
- Escape e retorno de foco;
- ausência de overflow bloqueador;
- 100 documentos;
- documento acima de 100 mil caracteres;
- busca funcional e editor editável.

## Evidência funcional

### Tranche 1

- cabeça `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`;
- 232/232;
- Mass Notes `30463426867`, Argila `30463426847`, coerência `30463426811`.

### Tranche 2

- cabeça `2a4333337a04b73a6c034b8fd35bc582994a114b`;
- 238/238;
- Mass Notes `30467582850`, Argila `30467583011`, coerência `30467584508`;
- publicação, cache e smoke público verdes.

## Incidentes de estabilização

Nenhum exigiu alteração funcional no produto.

- helpers de autosave passaram a aceitar estado já convergido para `Salvo`;
- salvamento preliminar redundante da exportação foi removido;
- conflito passou a ser testado pela preservação dos registros, não por seleção independente por aba;
- falha simulada do RimaLab estabiliza a fonte antes da primeira leitura.

## Achados provisórios

### P0

Nenhum.

### P1

Nenhum.

### P2

- `M09-F001`: nova aplicação sem PWA/offline próprio; bloqueia lançamento público.
- `M09-F002`: Prova de Autoria ausente; bloqueia substituição integral sem decisão explícita.
- `M09-F003`: faltam DOCX, RTF, ePub e Obsidian ZIP; não bloqueia beta, mas bloqueia paridade integral.

### P3

- `M09-F004`: busca, filtros e ordenação não persistem entre sessões.
- `M09-F005`: documento ativo é preferência compartilhada entre abas.

## Placar provisório

- editor e preservação: 94;
- biblioteca: 90;
- engines: 86;
- UIX: 82;
- acessibilidade: 80;
- responsividade: 89;
- importação e exportação: 88;
- privacidade: 92;
- desempenho: 84;
- release: 72;
- geral: 87.

## Contrato do documento

Cada documento mantém:

- UUID atual;
- título;
- JSON Tiptap;
- texto derivado;
- estado, tags e favorito;
- datas e revisão;
- `legacySourceId` opcional.

## Contrato do `.esc` legado

- `format: esc|vrda`;
- `schemaVersion: 1`;
- checksum FNV-1a sobre `stableSort(payload)`;
- `payload.manuscripts` não vazio;
- limite de 2.000 itens;
- prévia em memória;
- transação única;
- UUIDs novos, `— importado`, `revision: 0` e origem preservada;
- sem importação parcial, substituição, merge, escolha automática, deduplicação silenciosa ou upload.

## Limitações conhecidas

Ainda não estão aprovados:

- persistência de filtros;
- seleção ativa independente por aba;
- reimportação seletiva ou comparação de versões;
- deduplicação por `legacySourceId`;
- importação parcial;
- operações em massa;
- pastas/coleções;
- DOCX, RTF, ePub e Obsidian ZIP;
- Prova de Autoria;
- criptografia de backup;
- sincronização e colaboração;
- PWA própria;
- Tauri, SQLite e paginação física;
- aplicação automática de sugestões;
- promoção para `main`.

## Próxima ação obrigatória

1. UIX heurística nas seis larguras;
2. zoom 200%, movimento reduzido e tecnologias assistivas/dispositivos reais;
3. observação integral de rede;
4. recuperação emergencial integrada;
5. sessão prolongada, latência e memória;
6. corpus ampliado por engine;
7. decisões explícitas para P2;
8. veredito final;
9. CI na cabeça documental final e registro exato no PR.

## Como retomar

1. conferir branch, PR e workflows;
2. ler `M0_9_AUDITORIA_OPERACIONAL.md`;
3. revisar achados e próxima fase;
4. consultar relatório humano e JSON;
5. não editar a branch de preview;
6. não adicionar feature durante o diagnóstico;
7. iniciar Gate 14 somente após veredito final explícito.
