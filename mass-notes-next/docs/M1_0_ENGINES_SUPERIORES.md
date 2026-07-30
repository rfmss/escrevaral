# M1.0 — Engines superiores ao Escrevaral legado

Atualizado em: 2026-07-29

## Missão

Igualar as capacidades linguísticas úteis do Escrevaral legado e superá-las em contexto, explicabilidade, segurança autoral, experiência integrada e evidência auditável.

Este programa não aceita como prova frases como “100% concluído” sem corpus, métrica, bordas, falhas registradas e comparação reproduzível.

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto e em rascunho;
- `main` e aplicação pública: intactos;
- M0.9: encerrado como auditoria, sem autorizar lançamento ou substituição;
- M1.0: **em execução**;
- matriz funcional: **144 cenários por navegador, 288 execuções**;
- E1 contextual: corpus integrado v1.1 em 16/16 casos únicos e quatro controles diretos por navegador;
- E2 quantitativo: baseline reproduzível criada e integrada à CI;
- cobertura medida: 1.343 sinônimos, 936 definições, 175 regras de polissemia, 606 entradas contextuais e 2.045 formas regulares brutas;
- achados de integridade E2: uma família P0 e duas famílias P1; eles não reclassificam os vereditos funcionais do M0.9;
- RimaLab, Contexto e Palavras/Léxico leem o snapshot vivo do Tiptap no instante da ação;
- cabeça funcional do snapshot vivo: `3c9c6d74e7638392a5bacfe4a2e82565e8af2583`, com Mass Notes `30505264198` em 288/288;
- engines expostas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- famílias legadas carregadas localmente por adaptadores tipados;
- lacunas principais restantes: consolidação das bases, superfície sintático-morfológica autônoma e prova qualitativa das cinco engines.

## Adversário mensurável

A baseline v916 do legado declarava:

- Análise geral: `CLIQUES_PT` 1000 e `PLEONASMOS` 500;
- Espelho de Voz: 10 gestos e 9 campos semânticos;
- RimaLab: enciclopédia 50 e `grammarWords` 348;
- Léxico: aproximadamente 1350 entradas de sinônimos, 1020+ definições e 110+ casos de polissemia;
- Contexto/Decolonial: 600+ entradas em 9 categorias;
- Sintaxe/Morfologia: bancada 17/17, golden 91/0 e 2045 formas verbais regulares no presente.

Esses números são baseline histórica, não prova suficiente de qualidade. O inventário E2 mostrou que declarações brutas e cobertura efetiva não são equivalentes.

## Definição de superioridade

Uma engine só supera o legado quando cumpre simultaneamente:

1. **Preservação:** nunca altera manuscrito, metadados ou revisão sem ação autoral explícita.
2. **Privacidade:** não transmite texto autoral e não depende de serviço linguístico remoto.
3. **Acerto contextual:** resolve pares mínimos e ambiguidades melhor que uma busca isolada por palavra.
4. **Indeterminação honesta:** prefere `ambíguo` ou `indeterminado` a uma classificação falsa.
5. **Explicação útil:** mostra classe, função, evidência contextual e limites em português brasileiro claro.
6. **Cobertura verificável:** dados têm contagem, origem, auditoria de duplicatas e testes de regressão.
7. **Utilidade editorial:** uma leitura humana considera a saída específica, compreensível e acionável sem ser prescritiva.
8. **Integração:** as engines convivem na mesma página, invalidam resultados corretamente e não se corrompem.
9. **Desempenho:** permanecem utilizáveis em corpus longo e máquina comum, sem transformar CI em promessa universal.
10. **Autonomia:** nenhuma alternativa é aplicada automaticamente; a decisão final pertence a quem escreve.

## Métricas de saída

### Automáticas

- 100% dos casos críticos preservam o snapshot semântico;
- 0 transmissão autoral;
- 0 botão ou fluxo de substituição automática;
- corpus morfossintático versionado com casos positivos, negativos, ambíguos, diacríticos, locuções e regionalismos;
- toda regressão informa caso, entrada, esperado, observado e fonte;
- cobertura lexical igual ou superior à baseline útil antiga, sem autorreferências ou duplicatas silenciosas;
- resultado `indeterminado` estruturado para fallback sem evidência suficiente.

### Humanas

Cada saída será avaliada de 1 a 5 em:

- correção percebida;
- especificidade;
- clareza;
- utilidade para revisão;
- respeito à voz autoral;
- adequação ao português brasileiro.

Meta de candidata superior:

- média global mínima 4,0;
- nenhuma engine abaixo de 3,5;
- nenhum falso conselho grave aceito como comportamento normal;
- divergências registradas por gênero textual, registro e região.

## Fases

### E0 — Baseline e corpus

Estado: **concluída**.

Entregues:

- corpus v1 de 14 casos morfossintáticos;
- testes em Chromium e Firefox;
- comparação com a bancada legada;
- inventário de falhas reais antes de alterar regras.

Baseline medida:

- 8/14 casos únicos aprovados;
- 6/14 casos únicos incorretos;
- 264/276 execuções passaram antes da correção;
- falhas idênticas em Chromium e Firefox.

### E1 — Léxico e Sintaxe contextual

Estado: **primeira tranche e estabilização inicial concluídas; fase continua aberta**.

Entregue:

- locuções `por enquanto` e `enquanto isso`;
- decisão sensível a diacrítico para `publica/pública`;
- particípio após auxiliar de voz passiva;
- forma verbal após pronome sujeito em itens ambíguos registrados;
- adjetivo pós-nominal com evidência determinante + nome;
- resolvedor puro em `src/engines/contextualLexicalResolver.ts`;
- controles negativos para locução, diacrítico, particípio, substantivação e sujeito nominal;
- objeto explícito à direita impedindo falso adjetivo em `larga/estreita`;
- notas que explicam a evidência usada.

Resultado:

- baseline crítica: 14/14 casos únicos aprovados;
- corpus integrado v1.1: 16/16 casos únicos aprovados;
- quatro controles diretos por navegador;
- 288/288 execuções aprovadas na cabeça E1 estabilizada;
- nenhuma regressão nos 14 casos anteriores;
- nenhuma alteração em `lexical-engine.js` ou nos dados legados;
- nenhuma mutação do manuscrito ou substituição automática.

Pendente em E1:

- ampliar negativos junto com novas formas verbais e particípios ambíguos;
- criar experiência sintático-morfológica integrada;
- testar regionalismos, oralidade e ordem marcada.

### E2 — Profundidade lexical auditável

Estado: **baseline quantitativa concluída; integridade e qualidade em execução**.

Infraestrutura entregue:

- `scripts/audit-lexical-inventory.mjs`;
- `scripts/audit-definition-duplicates.mjs`;
- `npm run audit:lexicon`;
- etapa obrigatória na workflow Mass Notes;
- relatórios JSON e Markdown preservados no artefato;
- snapshots versionados em `docs/audits/M1_E2_LEXICAL_INVENTORY.*`.

Cobertura efetiva:

- 1.343 entradas de sinônimos e 7.766 alternativas brutas;
- 936 definições efetivas derivadas de 1.011 declarações;
- 175 regras de polissemia e 55 cartões explícitos de alternativas;
- 606 entradas de Contexto em nove categorias;
- 527 entradas completas no léxico editorial local;
- 95 locuções brutas, 94 únicas após normalização;
- 2.045 formas regulares brutas no presente, 2.028 normalizadas;
- RimaLab com 50 itens de enciclopédia e 407 `grammarWords`.

Achados mecânicos:

- **P0:** 69 grupos de definições repetidas, 75 declarações sobrescritas; 68 grupos têm textos conflitantes e apenas `quica` é idêntico;
- **P1:** oito autorreferências de sinônimos após normalização;
- **P1:** quatro aliases numéricos expostos como verbetes (`ode2`, `contemplar2`, `denso2`, `silencio2`);
- **P2:** `leitor_modelo` vazio;
- **P2:** quatro textos de definição compartilhados por chaves diferentes;
- **P2:** 124 regras de polissemia sem cartão explícito de alternativas.

Decisão E2:

- não ampliar vocabulário antes de estabilizar integridade;
- não remover conflitos automaticamente;
- tratar a última declaração como comportamento atual, não necessariamente como melhor redação;
- consolidar em lotes pequenos com teste por verbete;
- separar alias ortográfico de sinônimo editorial;
- manter contagem separada de qualidade.

#### Snapshot vivo das engines

Durante a validação E2, três execuções terminaram 287/288 em casos antigos diferentes. O artefato do terceiro caso mostrou o editor com quatro versos e o RimaLab respondendo “página vazia”.

Diagnóstico:

- o Tiptap já possuía o conteúdo atual;
- o painel podia receber uma projeção React um ciclo atrás no instante do clique;
- aumentar timeout não resolveria essa fronteira de estado.

Correção:

- criado `src/editor/editorSnapshotBridge.ts`;
- `MassNotesEditor` publica JSON, texto e assinatura estrutural em `onCreate` e `onUpdate`;
- RimaLab, Contexto e Palavras/Léxico consultam o snapshot vivo ao iniciar a análise;
- respostas são descartadas se a assinatura mudar durante a execução;
- resultados são invalidados por edição real do editor, não pela chegada tardia de props.

Evidência:

- cabeça `3c9c6d74e7638392a5bacfe4a2e82565e8af2583`;
- Mass Notes `30505264198`: auditor E2, build, 288/288, publicação, cache e smoke verdes;
- Argila `30505264208` e coerência `30505264199`: verdes;
- artefato `mass-notes-tiptap-30505264198`;
- digest `sha256:cd0627c79d7e2337d7077241246dcdf52a531de954bbcceebc5d00fae071523f`.

### E3 — Qualidade das cinco engines

Estado: **planejada**.

Objetivo:

- corpora separados de prosa, poesia, diálogo, ensaio, oralidade e regionalismos;
- falsos positivos e negativos documentados;
- comparação lado a lado com legado;
- rubrica humana versionada.

### E4 — Veredito de substituição

Responder separadamente:

1. o novo produto iguala o legado em cobertura útil?
2. supera o legado em contexto e segurança?
3. existe alguma promessa antiga que deve ser aposentada em vez de copiada?
4. pode substituir integralmente o Escrevaral antigo?

## Evidência

Logs:

- `docs/logs/2026-07-29-m1-e0-e1-lexico-contextual.md`;
- `docs/logs/2026-07-29-m1-e1-controles-negativos.md`;
- `docs/logs/2026-07-29-m1-e2-inventario-lexical.md`;
- `docs/logs/2026-07-29-m1-e2-snapshot-vivo-engines.md`.

Auditorias:

- `docs/audits/M1_E2_LEXICAL_INVENTORY.json`;
- `docs/audits/M1_E2_LEXICAL_INVENTORY.md`.

Cabeças de medição E2:

- inventário inicial: `a326a8026109bee417880c1486dff686267c0766`;
- classificação das colisões: `d55940cf9a2b1d0a789ba3dabc919eb664816885`;
- estabilização do snapshot vivo: `3c9c6d74e7638392a5bacfe4a2e82565e8af2583`.

## Regras de execução

- não aumentar contagem de alertas como objetivo;
- não copiar dependência pesada para o runtime;
- usar corpora e ferramentas externas como banca, não como muleta;
- nunca alterar regra sem caso de regressão reproduzível;
- toda correção deve registrar ganho e possível custo;
- engines iniciadas pela interface analisam o snapshot vivo do Tiptap;
- uma resposta perde validade se a assinatura da entrada mudar;
- não contar declarações sobrescritas como cobertura efetiva;
- não consolidar definições conflitantes sem comparar as redações;
- manter PR em rascunho e `main` intacta;
- CI completa após código e novamente após documentação final;
- evidência exata no corpo do PR, sem commit autorreferente.

## Próxima ação

1. validar a cabeça documental exata em 288/288;
2. registrar SHA, workflows e artefato no PR;
3. consolidar primeiro `quica`, a única duplicata idêntica, com teste de não regressão;
4. priorizar os 68 conflitos por famílias editoriais e revisar pequenos lotes;
5. corrigir autorreferências separando aliases de sinônimos;
6. decidir o destino das quatro chaves técnicas;
7. preencher ou retirar `leitor_modelo` da cobertura;
8. não iniciar expansão lexical nem Gate 14 antes dessa integridade mínima.
