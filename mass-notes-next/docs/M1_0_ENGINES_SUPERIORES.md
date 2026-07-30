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
- matriz atual: **144 cenários por navegador, 288 execuções**;
- cabeça funcional E1 estabilizada: `8579aa9b92589c57bd02df0f7eead5eebf99f1e8`;
- Mass Notes `30501052382`, Argila `30501052355` e coerência `30501052360`: verdes;
- engines expostas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- famílias legadas carregadas localmente por adaptadores tipados;
- P0/P1 conhecidos nas engines: 0/0;
- primeiro delta contextual comprovado: corpus v1 passou de 8/14 para 14/14 casos únicos;
- estabilização inicial: corpus integrado v1.1 em 16/16 e quatro controles diretos por navegador;
- lacunas principais restantes: profundidade lexical, superfície sintático-morfológica autônoma e prova qualitativa das cinco engines.

## Adversário mensurável

A baseline v916 do legado declarava:

- Análise geral: `CLIQUES_PT` 1000 e `PLEONASMOS` 500;
- Espelho de Voz: 10 gestos e 9 campos semânticos;
- RimaLab: enciclopédia 50 e `grammarWords` 348;
- Léxico: aproximadamente 1350 entradas de sinônimos, 1020+ definições e 110+ casos de polissemia;
- Contexto/Decolonial: 600+ entradas em 9 categorias;
- Sintaxe/Morfologia: bancada 17/17, golden 91/0 e 2045 formas verbais regulares no presente.

Esses números são baseline histórica, não prova suficiente de qualidade. O produto novo deve preservar o que é útil e revelar onde quantidade escondia ambiguidade, falso positivo ou explicação fraca.

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
- cobertura lexical igual ou superior à baseline antiga, sem autorreferências ou duplicatas silenciosas;
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

Casos:

- `enquanto` em oração, `por enquanto` e `enquanto isso`;
- `publica/pública`;
- `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

Baseline medida:

- 8/14 casos únicos aprovados;
- 6/14 casos únicos incorretos;
- 264/276 execuções passaram antes da correção;
- falhas idênticas em Chromium e Firefox.

### E1 — Léxico e Sintaxe contextual

Estado: **primeira tranche e estabilização inicial concluídas; fase continua aberta**.

Entregue na primeira tranche:

- locuções `por enquanto` e `enquanto isso`;
- decisão sensível a diacrítico para `publica/pública`;
- particípio após auxiliar de voz passiva;
- forma verbal após pronome sujeito em itens ambíguos registrados;
- adjetivo pós-nominal com evidência determinante + nome;
- notas que explicam a evidência usada;
- decisão provável, e não certeza falsa, quando a regra depende de contexto.

Estabilização inicial:

- criado `src/engines/contextualLexicalResolver.ts` como módulo puro;
- `lexicalAdapter.ts` voltou a concentrar somente carga, validação e composição;
- locuções exigem ocorrência exata no contexto;
- controles negativos preservam `pública`, `ficou preso` e `os presos` sem override indevido;
- `A menina larga a mochila` e `O corredor estreita os olhos` recebem leitura verbal provável;
- marcador de objeto à direita é avaliado antes da hipótese adjetiva pós-nominal;
- criado `tests/m1-contextual-resolver.spec.ts`;
- corpus integrado ampliado de 14 para 16 casos únicos.

Resultado:

- baseline crítica: 14/14 casos únicos aprovados;
- corpus integrado v1.1: 16/16 casos únicos aprovados;
- quatro controles diretos por navegador;
- 288/288 execuções aprovadas;
- nenhuma regressão nos 14 casos anteriores;
- nenhuma alteração em `lexical-engine.js` ou nos dados legados;
- nenhuma mutação do manuscrito ou substituição automática.

Pendente em E1:

- ampliar negativos junto com novas formas verbais e particípios ambíguos;
- criar experiência sintático-morfológica integrada;
- testar regionalismos, oralidade e ordem marcada.

### E2 — Profundidade lexical auditável

Objetivo:

- inventariar definições, sinônimos, polissemia e lacunas;
- superar a baseline antiga com qualidade e não apenas contagem;
- adicionar regionalismos e literatura brasileira com fonte e revisão;
- eliminar duplicatas, autorreferências, alternativas circulares e definições genéricas.

### E3 — Qualidade das cinco engines

Objetivo:

- corpora separados de prosa, poesia, diálogo, ensaio, oralidade e regionalismos;
- falsos positivos e negativos documentados;
- comparação lado a lado com o legado;
- rubrica humana versionada.

### E4 — Veredito de substituição

Responder separadamente:

1. o novo produto iguala o legado em cobertura útil?
2. supera o legado em contexto e segurança?
3. existe alguma promessa antiga que deve ser aposentada em vez de copiada?
4. pode substituir integralmente o Escrevaral antigo?

## Evidência E0/E1

Logs:

- `docs/logs/2026-07-29-m1-e0-e1-lexico-contextual.md`;
- `docs/logs/2026-07-29-m1-e1-controles-negativos.md`.

Cabeça funcional estabilizada:

- `8579aa9b92589c57bd02df0f7eead5eebf99f1e8`.

Workflows:

- Mass Notes `30501052382`: 288/288, publicação, cache e smoke público;
- Argila `30501052355`: verde;
- coerência `30501052360`: verde;
- artefato `mass-notes-tiptap-30501052382`.

## Regras de execução

- não aumentar contagem de alertas como objetivo;
- não copiar dependência pesada para o runtime;
- usar corpora e ferramentas externas como banca, não como muleta;
- nunca alterar regra sem caso de regressão reproduzível;
- toda correção deve registrar ganho e possível custo;
- manter PR em rascunho e `main` intacta;
- CI completa após código e novamente após documentação final;
- evidência exata no corpo do PR, sem commit autorreferente.

## Próxima ação

1. validar a cabeça documental exata desta estabilização;
2. inventariar contagens reais de definições, sinônimos, polissemia e entradas contextuais;
3. auditar duplicatas, autorreferências, alternativas circulares e lacunas de definição;
4. selecionar a primeira expansão lexical brasileira com fonte e corpus;
5. iniciar desenho da bancada sintático-morfológica integrada;
6. repetir a matriz e registrar o delta.
