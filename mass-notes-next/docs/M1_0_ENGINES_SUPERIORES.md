# M1.0 — Engines superiores ao Escrevaral legado

Atualizado em: 2026-08-01

## Missão

Igualar as capacidades linguísticas úteis do Escrevaral legado e superá-las em contexto, explicabilidade, segurança autoral, experiência integrada e evidência auditável.

Este programa não aceita como prova frases como “100% concluído” sem corpus, métrica, bordas, falhas registradas e comparação reproduzível.

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto e em rascunho;
- `main`, aplicação pública e service worker público: intactos;
- M0.9: encerrado como auditoria, sem autorizar lançamento ou substituição;
- M1.0: **em execução**;
- matriz funcional de referência: **176 cenários por navegador, 352 execuções**;
- engines expostas: Revisão, Espelho de Voz, Contexto, RimaLab, Palavras/Léxico e análise morfológica verbal;
- E1 contextual: primeira tranche estabilizada, com positivos e controles negativos;
- E2 lexical: inventário quantitativo concluído; integridade editorial ainda aberta;
- E2-V: 34 casos de desenvolvimento e 24 casos adversariais separados;
- infinitivo pessoal: primeira família verbal com estado `verified` no escopo declarado;
- RimaLab, Contexto e Palavras/Léxico leem o snapshot vivo do Tiptap no instante da ação;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público e substituição integral: `NO-SHIP`;
- Gate 14 permanece suspenso.

## Adversário mensurável

A baseline v916 do legado declarava:

- Análise geral: `CLIQUES_PT` 1000 e `PLEONASMOS` 500;
- Espelho de Voz: 10 gestos e 9 campos semânticos;
- RimaLab: enciclopédia 50 e `grammarWords` 348;
- Léxico: aproximadamente 1.350 entradas de sinônimos, 1.020+ definições e 110+ casos de polissemia;
- Contexto/Decolonial: 600+ entradas em nove categorias;
- Sintaxe/Morfologia: bancada 17/17, golden 91/0 e 2.045 formas verbais regulares no presente;
- Exportação: TXT, Markdown, HTML, DOCX, ePub, RTF e Obsidian;
- Prova de Autoria e PWA offline como promessas públicas.

Esses números e declarações são baseline histórica, não prova suficiente de qualidade. O inventário E2 mostrou que declarações brutas, comportamento efetivo e qualidade editorial não são equivalentes.

## Definição de superioridade

Uma engine só supera o legado quando cumpre simultaneamente:

1. **Preservação:** nunca altera manuscrito, metadados ou revisão sem ação autoral explícita.
2. **Privacidade:** não transmite texto autoral e não depende de serviço linguístico remoto.
3. **Acerto contextual:** resolve pares mínimos e ambiguidades melhor que busca isolada por palavra.
4. **Indeterminação honesta:** prefere `ambíguo` ou `indeterminado` a uma classificação falsa.
5. **Explicação útil:** mostra classe, função, evidência contextual e limites em português brasileiro claro.
6. **Cobertura verificável:** dados têm contagem, origem, auditoria de duplicatas e testes de regressão.
7. **Utilidade editorial:** a saída é específica, compreensível e acionável sem ser prescritiva.
8. **Integração:** as engines convivem na mesma página, invalidam resultados corretamente e não se corrompem.
9. **Desempenho:** permanecem utilizáveis em corpus longo e máquina comum, sem transformar CI em promessa universal.
10. **Autonomia:** nenhuma alternativa é aplicada automaticamente; a decisão final pertence a quem escreve.

## Métricas de saída

### Automáticas

- 100% dos casos críticos preservam o snapshot semântico;
- zero transmissão autoral;
- zero botão ou fluxo de substituição automática;
- corpus morfossintático versionado com casos positivos, negativos, ambíguos, diacríticos, locuções e regionalismos;
- conjunto de avaliação separado do corpus de desenvolvimento;
- toda regressão informa caso, entrada, esperado, observado e fonte;
- cobertura lexical igual ou superior à baseline útil antiga, sem autorreferências ou duplicatas silenciosas;
- resultado `indeterminado` estruturado quando faltar evidência.

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

- corpus inicial de 14 casos morfossintáticos;
- testes em Chromium e Firefox;
- comparação com a bancada legada;
- inventário de falhas antes de alterar regras.

Baseline medida:

- 8/14 casos únicos aprovados;
- 6/14 incorretos;
- falhas idênticas nos dois navegadores.

### E1 — Léxico e sintaxe contextual

Estado: **primeira tranche estabilizada; fase continua aberta**.

Entregue:

- locuções `por enquanto` e `enquanto isso`;
- decisão sensível a diacrítico para `publica/pública` e `seria/séria`;
- particípio após auxiliar de voz passiva;
- forma verbal após sujeito expresso em itens ambíguos registrados;
- adjetivo pós-nominal com evidência contextual;
- controles negativos de locução, diacrítico, particípio, substantivação e sujeito nominal;
- objeto explícito à direita impedindo falso adjetivo em `larga/estreita`;
- nenhuma mutação do manuscrito.

Pendente:

- ordem marcada, oralidade e regionalismos;
- superfície sintático-morfológica integrada;
- relações oracionais além de contexto local.

### E2 — Profundidade lexical auditável

Estado: **baseline quantitativa concluída; integridade e qualidade em execução**.

Cobertura efetiva medida:

- 1.343 entradas de sinônimos e 7.766 alternativas brutas;
- 936 definições efetivas derivadas de 1.011 declarações;
- 175 regras de polissemia e 55 cartões explícitos de alternativas;
- 606 entradas de Contexto em nove categorias;
- 527 entradas completas no léxico editorial local;
- 95 locuções brutas, 94 únicas após normalização;
- 2.045 formas regulares brutas no presente, 2.028 normalizadas;
- RimaLab com 50 itens de enciclopédia e 407 `grammarWords`.

Achados:

- **P0:** 69 grupos de definições repetidas, 75 declarações sobrescritas e 68 conflitos de redação;
- **P1:** oito autorreferências de sinônimos após normalização;
- **P1:** quatro aliases numéricos expostos como verbetes (`ode2`, `contemplar2`, `denso2`, `silencio2`);
- **P2:** `leitor_modelo` vazio;
- **P2:** quatro textos de definição compartilhados por chaves diferentes;
- **P2:** 124 regras de polissemia sem cartão explícito de alternativas.

Decisão:

- não ampliar vocabulário antes de estabilizar integridade;
- não remover conflitos automaticamente;
- consolidar em lotes pequenos com teste por verbete;
- separar alias ortográfico de sinônimo editorial;
- manter contagem separada de qualidade.

### E2-V — Morfologia verbal adversarial e proveniência

Estado: **Pack v1 funcionalmente estabilizado; primeira família verificada; programa continua aberto**.

Infraestrutura:

- engine verbal própria e tipada;
- paradigmas regulares, irregulares curados, clíticos e construções compostas;
- corpus de desenvolvimento com 34 casos;
- conjunto de avaliação separado com 24 casos em sete fenômenos;
- auditor de separação, polaridade, fontes, licenças e estados de proveniência;
- métricas VP, VN, FP, FN, precisão, recall e acurácia;
- nenhuma substituição automática.

#### Infinitivo pessoal

Estado: **`verified` dentro do escopo declarado**.

Escopo avaliado:

- formas flexionadas e não flexionadas;
- sujeito expresso ou recuperável;
- primeira, segunda e terceira pessoas cobertas pelos contratos;
- fronteira com infinitivo impessoal;
- uso substantivado;
- coincidência formal com futuro do subjuntivo;
- construção avaliativa `É melhor sairmos agora`.

Resultado na cabeça funcional `0e5177d5c801a4a9b8833af35baa059af486f6c4`:

- 12 casos por navegador;
- Chromium `12/12`;
- Firefox `12/12`;
- total `24/24`;
- VP 16, VN 8, FP 0, FN 0;
- precisão 100%;
- recall 100%;
- acurácia 100%;
- workflow `30718951198`;
- artifact ID `8824240160`;
- digest `sha256:06978a08feb9b9226e5034dc2ef105d2560c95629b3cd991db2a93b8d0560bda`.

Matriz integral da mesma cabeça:

- Chromium `176/176`;
- Firefox `176/176`;
- total `352/352`;
- workflow `30718951187`;
- artifact ID `8824558548`;
- digest `sha256:601a53a5dbc522b5cc5b7a2bc355d0240892429f62944ab93ea4d41d8646374e`.

Limite:

`verified` não significa cobertura universal, consenso acadêmico ou representatividade sociolinguística. O estado vale somente para o escopo, fontes e contratos registrados em `docs/linguistics/verb-provenance.json`.

Famílias ainda abertas:

- paradigmas regulares;
- irregulares frequentes;
- colocação de clíticos;
- locuções e compostos;
- homógrafos e diacríticos;
- verbos defectivos;
- particípios duplos.

### E3 — Qualidade das engines

Estado: **planejada**.

- corpora separados de prosa, poesia, diálogo, ensaio, oralidade e regionalismos;
- falsos positivos e negativos por engine;
- comparação lado a lado com legado;
- rubrica humana versionada;
- média mínima 4,0 e nenhuma engine abaixo de 3,5.

### E4 — Veredito de substituição

Estado: **bloqueado até E1–E3 e auditoria de paridade**.

Responder separadamente:

1. o novo produto iguala o legado em cobertura útil?
2. supera o legado em contexto e segurança?
3. quais promessas antigas devem ser aposentadas em vez de copiadas?
4. pode substituir integralmente o Escrevaral antigo?

## Auditoria de paridade — próximo gate operacional

Antes de abrir outra engine, criar uma matriz versionada com cada capacidade do legado classificada como:

- `presente`;
- `superior`;
- `parcial`;
- `ausente`;
- `aposentada`;
- `bloqueadora para beta`;
- `bloqueadora para substituição`.

A auditoria deve cobrir pelo menos:

- Editor, preservação e biblioteca;
- Revisão, Voz, Rimas, Léxico, Contexto e Morfologia;
- Sintaxe oracional;
- Vocabulário Decolonizador;
- modos e guias de ofício;
- Prova de Autoria;
- formatos de exportação;
- PWA e uso offline;
- Anatomia do Livro;
- superfícies Ateliê, Prática e Leituras.

Essa matriz não implementa funcionalidades. Ela decide quais lacunas precisam ser portadas, quais podem ser aposentadas e quais impedem cada tipo de ship.

## Evidência principal

- `docs/logs/2026-08-01-e2v-infinitivo-pessoal-fechamento.md`;
- `docs/linguistics/verb-provenance.json`;
- `docs/personas/EVA_CHARA_SCORECARD.md`;
- `tests/fixtures/verb-morphology-evaluation.json`;
- `scripts/audit-verb-evidence.mjs`;
- `docs/logs/2026-07-29-m1-e2-inventario-lexical.md`;
- `docs/audits/M1_E2_LEXICAL_INVENTORY.*`.

## Regras de execução

- não aumentar contagem de alertas como objetivo;
- não copiar dependência pesada para o runtime;
- usar corpora e fontes externas como banca, não como muleta;
- nunca alterar regra sem caso positivo e negativo reproduzível;
- separar corpus de desenvolvimento e avaliação;
- toda correção registra ganho, custo e limite;
- engines acionadas pela interface analisam o snapshot vivo do Tiptap;
- respostas perdem validade quando a assinatura da entrada muda;
- não contar declarações sobrescritas como cobertura efetiva;
- não consolidar definições conflitantes sem comparar redações;
- manter PR em rascunho e `main` intacta;
- executar CI completa após código e novamente após documentação final;
- registrar evidência exata no PR sem commit autorreferente;
- não iniciar Gate 14.

## Próxima ação

1. validar a cabeça documental deste fechamento;
2. registrar SHA, workflows e artefatos no PR;
3. criar a matriz formal de paridade;
4. decidir requisitos de beta versus substituição integral;
5. retomar lotes pequenos de integridade lexical;
6. fundamentar as demais famílias verbais;
7. abrir Sintaxe v1 somente depois dessas decisões;
8. manter Gate 14 suspenso.
