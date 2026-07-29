# M1.0 — Engines superiores ao Escrevaral legado

Atualizado em: 2026-07-29

## Missão

Igualar as capacidades linguísticas úteis do Escrevaral legado e superá-las em contexto, explicabilidade, segurança autoral, experiência integrada e evidência auditável.

Este programa não aceita como prova frases como “100% concluído” sem corpus, métrica, bordas, falhas registradas e comparação reproduzível.

## Estado de entrada

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto e em rascunho;
- `main` e aplicação pública: intactos;
- M0.9: auditoria técnica concluída, com 124 cenários por navegador e 248 execuções na matriz consolidada;
- engines expostas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- famílias legadas carregadas localmente por adaptadores tipados;
- P0/P1 conhecidos nas engines: 0/0;
- lacunas principais: profundidade lexical, superfície sintático-morfológica autônoma e prova qualitativa de utilidade.

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

Estado: **em execução**.

Entregáveis:

- corpus v1 de 14 casos morfossintáticos;
- testes em Chromium e Firefox;
- comparação com a bancada legada;
- inventário de falhas reais antes de alterar regras.

Casos iniciais:

- `enquanto` em oração, `por enquanto` e `enquanto isso`;
- `publica/pública`;
- `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

### E1 — Léxico e Sintaxe contextual

Objetivo:

- corrigir o corpus E0 sem lookup cego por forma normalizada;
- preservar diacríticos na decisão;
- representar particípio adjetivado e substantivação;
- explicar a evidência contextual;
- expor uma bancada sintático-morfológica integrada, não um painel técnico invasivo.

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

1. executar corpus E0;
2. classificar cada falha como engine, adapter, UI, fixture ou expectativa incorreta;
3. corrigir o menor conjunto de regras que melhora contexto sem degradar casos existentes;
4. repetir a matriz integral;
5. registrar baseline e delta;
6. iniciar inventário lexical quantitativo e qualitativo.
