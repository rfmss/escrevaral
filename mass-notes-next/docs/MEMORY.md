# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-29

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker público: intactos;
- Gates 1 a 13 e Gate 10.5: concluídos;
- M0.9: encerrado como auditoria técnica e decisória;
- milestone atual: **M1.0 — Engines superiores ao Escrevaral legado**;
- navegadores obrigatórios: Chromium e Firefox;
- matriz atual: **144 cenários por navegador, 288 execuções**;
- cabeça funcional E1 estabilizada: `8579aa9b92589c57bd02df0f7eead5eebf99f1e8`;
- Mass Notes `30501052382`, Argila `30501052355` e coerência `30501052360`: verdes;
- corpus contextual: baseline 8/14 → primeira tranche 14/14 → v1.1 integrado 16/16;
- controles diretos do resolvedor: 4 por navegador;
- P0/P1 conhecidos nas engines: 0/0;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- Gate 14: suspenso.

## Fontes de retomada

1. `M1_0_ENGINES_SUPERIORES.md` — memória operacional do programa atual;
2. `logs/2026-07-29-m1-e1-controles-negativos.md` — estabilização contextual mais recente;
3. `logs/2026-07-29-m1-e0-e1-lexico-contextual.md` — baseline e primeiro ganho;
4. `logs/2026-07-29-m0-9-encerramento-m1-abertura.md` — transição de governança;
5. `PLAN.md` — sequência autorizada;
6. `CHANGELOG.md` — histórico técnico;
7. `M0_9_AUDITORIA_OPERACIONAL.md` e `M0_9_ERRATA_MATRIZ.md` — histórico da auditoria;
8. contratos globais em `../../docs/product/`.

## Decisões permanentes de fundação

1. Tiptap/ProseMirror é o motor de edição; JSON Tiptap é a fonte estrutural.
2. IndexedDB é a fonte principal; localStorage guarda preferências e recuperação emergencial.
3. Nenhuma aba sobrescreve outra silenciosamente.
4. Documento, metadados e favorito compartilham revisão, autosave e conflito.
5. Engines entram por adaptadores tipados e funcionam localmente.
6. Nenhuma engine aplica texto ou alternativa automaticamente.
7. Offsets linguísticos usam UTF-16 sobre o Node ProseMirror real.
8. Decorations não pertencem ao JSON autoral.
9. Exportadores, backups, importadores, consultas e engines vivem em camadas próprias.
10. Cópia nativa e `.esc` legado são formatos distintos e nunca compartilham parser.
11. Importação valida o lote inteiro antes de qualquer escrita.
12. Restauração e importação criam UUIDs novos e nunca substituem documentos atuais.
13. `legacySourceId` é trilha de origem, não chave de merge.
14. Filtros da biblioteca são projeções puras.
15. Exportação usa o estado React/Tiptap atual, não uma releitura atrasada do IndexedDB.
16. Recuperação emergencial retoma o mesmo ID, avança revisão, não duplica página e limpa o envelope.
17. A preview é produto de build; nunca recebe edição direta.
18. Documentação, testes e evidência integram a definição de pronto.
19. SHA documental exato é registrado no PR depois da CI, evitando commit autorreferente.
20. PR permanece em rascunho e `main` intacta até autorização explícita.

## Decisões permanentes de qualidade

21. Chromium e Firefox são obrigatórios.
22. Falha temporal de teste não vira defeito de produto sem diagnóstico.
23. Estado final `Salvo` é obrigatório; estados intermediários podem convergir rápido demais para serem observados.
24. Conflito é avaliado pela preservação das versões, não pela seleção ativa compartilhada após recarga.
25. Snapshot semântico ProseMirror é a referência de não mutação; `innerText` pode variar visualmente entre navegadores.
26. Métricas de runner detectam regressão; não são SLA ou benchmark universal.
27. Viewport equivalente não pode ser apresentado como zoom real ou validação física.
28. Leitor de tela, tecnologia assistiva e dispositivo só recebem status aprovado quando executados de verdade.
29. Toda origem externa deve ser inventariada e restrita; allowlist não elimina o achado.
30. Nenhuma frase autoral pode aparecer em URL ou corpo de requisição.

## Decisões permanentes das engines

31. O legado é baseline e fonte de capacidade, não autoridade infalível.
32. “100%” sem corpus, bordas, métricas e comparação reproduzível não comprova maturidade.
33. Superioridade não significa mais alertas; significa melhor acerto, explicação e segurança.
34. Diacríticos participam da decisão gramatical; normalização serve à busca, não à classificação final.
35. Contexto suficiente pode gerar leitura `provável`; não deve virar certeza falsa.
36. Ausência de evidência deve produzir `ambíguo` ou `indeterminado`, não fallback convincente.
37. Toda regra linguística nova exige caso reproduzível antes da implementação.
38. Toda regra contextual recebe controles negativos contra generalização excessiva.
39. Bancas e corpora externos são instrumentos de comparação, não dependências pesadas do runtime.
40. A pessoa que escreve mantém a decisão final; alternativas são leitura, nunca comando.
41. Quantidade lexical é inventariada separadamente de qualidade lexical.
42. Definições, sinônimos e polissemia precisam de auditoria de duplicatas, autorreferências, ciclos e utilidade.
43. A avaliação humana deve medir correção, especificidade, clareza, utilidade, respeito autoral e adequação brasileira.
44. A candidata superior exige média humana mínima 4,0 e nenhuma engine abaixo de 3,5.
45. Regras contextuais vivem em módulo puro sempre que possível; adaptadores de carga não devem concentrar heurística linguística.
46. Padrões locais visualmente iguais devem observar contexto à direita antes de classificar verbo como adjetivo.

## M0.9 encerrado

O M0.9 produziu:

- jornadas integradas de escrita, metadados, conflito, exportação e portabilidade;
- cinco superfícies linguísticas em sequência sem mutação;
- escala de 100 páginas e documento acima de 100 mil caracteres;
- seis larguras, zoom CSS equivalente e movimento reduzido;
- auditoria de rede, recuperação emergencial e sessão prolongada;
- matriz consolidada 124 por navegador, 248 execuções;
- decisões explícitas para quatro P2.

Vereditos herdados:

- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`.

P2 herdados:

- PWA/offline próprio ausente;
- Prova de Autoria ausente;
- DOCX, RTF, ePub e Obsidian ZIP ausentes;
- Anatomia dependente de `page-flip@2.0.7` no `unpkg`.

As validações de zoom real, leitor de tela, tecnologias assistivas, dispositivos físicos e uso prolongado continuam como dívida de release.

## Baseline histórica das engines legadas

A documentação v916 informa:

- Análise: `CLIQUES_PT` 1000 e `PLEONASMOS` 500;
- Espelho de Voz: 10 gestos e 9 campos semânticos;
- RimaLab: enciclopédia 50 e `grammarWords` 348;
- Léxico: aproximadamente 1.350 sinônimos, 1.020+ definições e 110+ polissemias;
- Contexto: 600+ entradas em 9 categorias;
- Sintaxe/Morfologia: bancada 17/17, golden 91/0 e 2.045 formas verbais regulares no presente.

Esses números são alvo de inventário e comparação; não equivalem a prova de qualidade.

## M1.0 — E0 baseline

Corpus v1:

- `enquanto`, `por enquanto`, `enquanto isso`;
- `publica/pública`;
- `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

Resultado anterior à correção:

- 8/14 casos únicos corretos;
- 6/14 incorretos em ambos os navegadores;
- 264/276 execuções aprovadas.

Lacunas confirmadas:

- `por enquanto` e `enquanto isso` classificados como substantivo;
- `publica` classificado como adjetivo;
- `foi preso` classificado apenas como adjetivo;
- `estrada larga` classificada como forma verbal;
- `eu canto` classificado como substantivo.

## M1.0 — E1 contextual e estabilização

A camada contextual nova preserva `lexical-engine.js` e as bases legadas. A heurística foi isolada em `src/engines/contextualLexicalResolver.ts`; `lexicalAdapter.ts` permanece responsável pela carga local, adaptação e composição da leitura.

Entregue na primeira tranche:

- reconhecimento das duas locuções temporais;
- decisão sensível a diacrítico para `publica/pública`;
- particípio provável após auxiliar passivo;
- verbo provável após pronome sujeito em formas ambíguas registradas;
- adjetivo pós-nominal com evidência determinante + nome;
- notas em português claro explicando a evidência;
- nenhuma substituição automática.

Estabilização inicial:

- locuções exigem ocorrência exata no contexto;
- `pública`, `ficou preso` e `os presos` são controles que não recebem override indevido;
- `A menina larga a mochila` e `O corredor estreita os olhos` preservam leitura verbal;
- objeto explícito à direita é avaliado antes da hipótese adjetiva;
- quatro testes diretos exercitam o resolvedor puro;
- dois casos integrados comprovam Tiptap, persistência e não mutação.

Resultado:

- 16/16 casos integrados corretos;
- quatro controles diretos por navegador;
- 288/288 execuções;
- nenhuma regressão nos 14 casos anteriores;
- publicação, cache e smoke públicos verdes;
- Argila e coerência verdes;
- artefato `mass-notes-tiptap-30501052382`.

A superioridade comprovada continua específica às fronteiras cobertas. Não prova superioridade global nem substituição integral.

## Cobertura funcional preservada

Continua aprovada:

- criação, edição rica, metadados, autosave, recarga e recuperação;
- revisão inline com posições UTF-16 reais;
- Voz, Contexto, RimaLab e Palavras;
- biblioteca, filtros e escala;
- conflito explícito entre abas;
- exportação do rascunho atual;
- cópia nativa e importação `.esc` auditável;
- ausência de transmissão autoral;
- não mutação do snapshot semântico pelas engines;
- responsividade automatizada entre 320 e 1440 px.

## Limitações conhecidas

Ainda não estão aprovados:

- persistência de filtros;
- seleção ativa independente por aba;
- reimportação seletiva, comparação ou deduplicação por origem;
- importação parcial;
- operações em massa e pastas;
- DOCX, RTF, ePub e Obsidian ZIP;
- Prova de Autoria;
- criptografia de backup;
- sincronização e colaboração;
- PWA própria e autonomia offline da Anatomia;
- zoom real de 200%, leitores de tela e dispositivos físicos;
- Tauri, SQLite e paginação física;
- aplicação automática de sugestões;
- promoção para `main`.

## Próxima ação obrigatória

1. validar a cabeça documental exata dos controles negativos;
2. registrar essa cabeça e workflows no PR;
3. inventariar contagens lexicais reais;
4. auditar duplicatas, autorreferências, ciclos e lacunas de definição;
5. escolher uma expansão lexical brasileira pequena, fundamentada e testada;
6. desenhar a bancada sintático-morfológica integrada;
7. manter Gate 14 suspenso.

## Como retomar

1. conferir branch, PR e workflows;
2. ler `M1_0_ENGINES_SUPERIORES.md`;
3. ler `logs/2026-07-29-m1-e1-controles-negativos.md`;
4. identificar caso, engine e evidência da próxima tranche;
5. não editar a branch de preview;
6. não afirmar superioridade global antes de E2–E4;
7. não promover para `main`.
