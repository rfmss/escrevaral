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
- matriz funcional: **144 cenários por navegador, 288 execuções**;
- E1: corpus contextual 8/14 → 14/14 → v1.1 integrado 16/16;
- controles diretos do resolvedor: quatro por navegador;
- E2: baseline lexical quantitativa concluída e integrada à CI;
- cobertura efetiva: 1.343 sinônimos, 936 definições, 175 polissemias, 606 entradas contextuais e 2.045 formas regulares brutas;
- achados E2: uma família P0 de integridade e duas famílias P1; não alteram os vereditos funcionais herdados;
- RimaLab, Contexto e Palavras/Léxico analisam o snapshot vivo do Tiptap no instante da ação;
- cabeça funcional do snapshot vivo: `3c9c6d74e7638392a5bacfe4a2e82565e8af2583`, Mass Notes `30505264198` em 288/288;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- Gate 14: suspenso.

## Fontes de retomada

1. `M1_0_ENGINES_SUPERIORES.md` — memória operacional do programa;
2. `logs/2026-07-29-m1-e2-snapshot-vivo-engines.md` — fronteira entre Tiptap e engines;
3. `logs/2026-07-29-m1-e2-inventario-lexical.md` — medição e decisões E2;
4. `docs/audits/M1_E2_LEXICAL_INVENTORY.md` — inventário humano;
5. `docs/audits/M1_E2_LEXICAL_INVENTORY.json` — snapshot estruturado;
6. `logs/2026-07-29-m1-e1-controles-negativos.md` — estabilização contextual;
7. `logs/2026-07-29-m1-e0-e1-lexico-contextual.md` — baseline e primeiro ganho;
8. `PLAN.md` — sequência autorizada;
9. `CHANGELOG.md` — histórico técnico;
10. contratos globais em `../../docs/product/`.

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
15. Exportação usa o estado React/Tiptap atual, não releitura atrasada do IndexedDB.
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
25. Snapshot semântico ProseMirror é a referência de não mutação; `innerText` pode variar entre navegadores.
26. Métricas de runner detectam regressão; não são SLA universal.
27. Viewport equivalente não pode ser apresentado como zoom real ou validação física.
28. Leitor de tela, tecnologia assistiva e dispositivo só recebem status aprovado quando executados de verdade.
29. Toda origem externa deve ser inventariada e restrita; allowlist não elimina o achado.
30. Nenhuma frase autoral pode aparecer em URL ou corpo de requisição.
31. Uma prova de persistência pode ganhar janela maior quando mantém a leitura direta do banco e a mesma condição de sucesso.
32. Timeout ampliado não substitui investigação quando a falha migra entre superfícies.

## Decisões permanentes das engines

33. O legado é baseline e fonte de capacidade, não autoridade infalível.
34. “100%” sem corpus, bordas, métricas e comparação reproduzível não comprova maturidade.
35. Superioridade não significa mais alertas; significa melhor acerto, explicação e segurança.
36. Diacríticos participam da decisão gramatical; normalização serve à busca, não à classificação final.
37. Contexto suficiente pode gerar leitura `provável`; não deve virar certeza falsa.
38. Ausência de evidência deve produzir `ambíguo` ou `indeterminado`, não fallback convincente.
39. Toda regra linguística nova exige caso reproduzível antes da implementação.
40. Toda regra contextual recebe controles negativos contra generalização excessiva.
41. Bancas e corpora externos são instrumentos de comparação, não dependências pesadas do runtime.
42. A pessoa que escreve mantém a decisão final; alternativas são leitura, nunca comando.
43. Quantidade lexical é inventariada separadamente de qualidade lexical.
44. Definições, sinônimos e polissemia precisam de auditoria de duplicatas, autorreferências, ciclos e utilidade.
45. A avaliação humana mede correção, especificidade, clareza, utilidade, respeito autoral e adequação brasileira.
46. A candidata superior exige média humana mínima 4,0 e nenhuma engine abaixo de 3,5.
47. Regras contextuais vivem em módulo puro sempre que possível; adaptadores de carga não concentram heurística.
48. Padrões locais visualmente iguais observam contexto à direita antes de classificar verbo como adjetivo.
49. Declarações sobrescritas não contam como cobertura efetiva.
50. Chave repetida com redações diferentes é conflito editorial, não duplicata descartável automaticamente.
51. A última declaração descreve o comportamento atual, não necessariamente a melhor definição.
52. Alias ortográfico e sinônimo editorial são relações distintas.
53. Expansão lexical fica bloqueada enquanto a integridade mínima das bases não estiver estabilizada.
54. Engine acionada pela interface analisa o snapshot vivo do Tiptap, não apenas a projeção React ou o estado persistido.
55. Toda análise assíncrona captura uma assinatura estrutural e perde validade se o texto mudar.
56. Publicação tardia de props não deve invalidar uma análise feita sobre a mesma assinatura.

## M0.9 encerrado

O M0.9 produziu jornadas integradas, escala, auditoria de rede, recuperação, matriz consolidada 248/248 e decisões explícitas de release.

Vereditos herdados:

- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`.

P2 herdados:

- PWA/offline próprio ausente;
- Prova de Autoria ausente;
- DOCX, RTF, ePub e Obsidian ZIP ausentes;
- Anatomia dependente de `page-flip@2.0.7` no `unpkg`;
- validações físicas de acessibilidade e uso prolongado pendentes.

## Baseline histórica das engines legadas

A documentação v916 informa:

- Análise: `CLIQUES_PT` 1000 e `PLEONASMOS` 500;
- Espelho de Voz: 10 gestos e 9 campos semânticos;
- RimaLab: enciclopédia 50 e `grammarWords` 348;
- Léxico: aproximadamente 1.350 sinônimos, 1.020+ definições e 110+ polissemias;
- Contexto: 600+ entradas em 9 categorias;
- Sintaxe/Morfologia: bancada 17/17, golden 91/0 e 2.045 formas regulares no presente.

Esses números são alvo de inventário e comparação; não equivalem a prova de qualidade.

## M1.0 — E0 e E1

E0 mediu 8/14 casos corretos e seis lacunas repetidas em ambos os navegadores.

E1 entregou:

- locuções temporais;
- decisão sensível a diacrítico;
- particípio provável após auxiliar passivo;
- verbo provável após pronome sujeito;
- adjetivo pós-nominal com evidência;
- resolvedor contextual puro;
- controles negativos de locução, diacrítico, particípio, substantivação e sujeito nominal;
- objeto explícito à direita impedindo falso adjetivo.

Resultado funcional estabilizado:

- corpus integrado v1.1: 16/16;
- quatro controles diretos por navegador;
- matriz: 288/288;
- nenhuma regressão nos 14 casos anteriores;
- nenhuma mutação ou substituição automática.

A superioridade comprovada continua específica às fronteiras cobertas.

## M1.0 — E2 inventário lexical

Infraestrutura:

- `scripts/audit-lexical-inventory.mjs`;
- `scripts/audit-definition-duplicates.mjs`;
- `npm run audit:lexicon` na CI;
- relatórios completos preservados em artefato;
- snapshots versionados em `docs/audits/M1_E2_LEXICAL_INVENTORY.*`.

Cobertura efetiva:

- 1.343 entradas de sinônimos;
- 7.766 alternativas brutas e 7.763 pares normalizados;
- 936 definições efetivas a partir de 1.011 declarações;
- 175 regras de polissemia e 55 cartões de alternativas;
- 606 entradas contextuais em nove categorias;
- 527 entradas completas no léxico local;
- 95 locuções brutas, 94 normalizadas;
- 2.045 formas regulares brutas, 2.028 normalizadas;
- RimaLab com enciclopédia 50 e `grammarWords` 407.

Integridade:

- P0: 69 grupos de definições repetidas, 75 declarações sobrescritas, 68 conflitos e uma duplicata idêntica (`quica`);
- P1: oito autorreferências de sinônimos após normalização;
- P1: aliases técnicos `ode2`, `contemplar2`, `denso2`, `silencio2` expostos;
- P2: `leitor_modelo` vazio;
- P2: quatro textos duplicados entre chaves;
- P2: 124 regras de polissemia sem cartão explícito.

Decisão:

- não ampliar vocabulário;
- não remover conflitos em massa;
- consolidar pequenos lotes com teste por verbete;
- separar aliases de busca e sinônimos;
- impedir novas duplicatas pela CI.

## M1.0 — snapshot vivo das engines

Três execuções E2 sucessivas terminaram 287/288 em superfícies antigas diferentes. O caso decisivo mostrou quatro versos no ProseMirror e o RimaLab respondendo “página vazia”.

Correção:

- criado `src/editor/editorSnapshotBridge.ts`;
- o editor publica sincronamente JSON, texto e assinatura estrutural;
- RimaLab, Contexto e Palavras/Léxico consultam o snapshot no instante da ação;
- respostas são descartadas se uma edição real alterar a assinatura durante a análise;
- a Revisão continua usando o contrato estrutural vivo que já possuía.

Evidência:

- cabeça `3c9c6d74e7638392a5bacfe4a2e82565e8af2583`;
- Mass Notes `30505264198`: auditor E2, build, 288/288, publicação, cache e smoke;
- Argila `30505264208` e coerência `30505264199`: verdes;
- artefato `mass-notes-tiptap-30505264198`;
- digest `sha256:cd0627c79d7e2337d7077241246dcdf52a531de954bbcceebc5d00fae071523f`.

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

1. validar a cabeça documental em 288/288;
2. registrar SHA, workflows e artefato no PR;
3. consolidar `quica`, a única duplicata idêntica, com teste;
4. priorizar os 68 conflitos por famílias editoriais;
5. corrigir autorreferências preservando aliases úteis;
6. decidir o destino das quatro chaves técnicas;
7. manter expansão lexical e Gate 14 bloqueados.

## Como retomar

1. conferir branch, PR e workflows;
2. ler `M1_0_ENGINES_SUPERIORES.md`;
3. ler `logs/2026-07-29-m1-e2-snapshot-vivo-engines.md`;
4. ler `logs/2026-07-29-m1-e2-inventario-lexical.md`;
5. regenerar a auditoria com `npm run audit:lexicon` quando dados mudarem;
6. não editar a branch de preview;
7. não afirmar superioridade global antes de E2–E4;
8. não promover para `main`.
