# Contrato de produto — Engines superiores ao legado

Data: 2026-07-29

Estado: **M1.0 em execução — E0 concluída e primeira tranche E1 aprovada**

## Decisão

O programa ativo do Mass Notes Next é **M1.0 — Engines superiores ao Escrevaral legado**.

A meta não é reproduzir números antigos nem declarar maturidade por volume. A meta é preservar capacidades úteis e demonstrar superioridade em contexto, explicabilidade, segurança autoral, integração e evidência reproduzível.

## Promessa permitida durante o programa

> As leituras são locais, preservam o manuscrito e ajudam a observar possibilidades linguísticas. Elas não substituem decisão autoral nem fingem certeza onde o contexto não basta.

Também é permitido afirmar, com escopo explícito:

> A camada contextual nova superou a baseline integrada em seis fronteiras do corpus morfossintático v1, elevando o resultado de 8/14 para 14/14 casos únicos.

Essa afirmação não equivale a superioridade global das engines.

## Promessas proibidas até o veredito final

- “corrige português automaticamente”;
- “entende qualquer frase”;
- “substitui integralmente o Escrevaral antigo”;
- “100% preciso”;
- “cobertura completa do português brasileiro”;
- “melhor que o legado” sem delimitar corpus, versão e resultado;
- transformar contagem de entradas em prova de utilidade.

## Critérios obrigatórios

1. texto, metadados e revisão não podem ser alterados por consulta;
2. nenhuma saída autoral pode sair pela rede;
3. cada correção exige caso reproduzível anterior à implementação;
4. ambiguidades devem ser representadas, não escondidas;
5. diacríticos participam da decisão gramatical;
6. regras contextuais recebem controles negativos;
7. dados lexicais precisam de inventário, auditoria e regressão;
8. comparação separa quantidade, acerto, utilidade e experiência;
9. avaliação humana usa rubrica versionada;
10. alternativas nunca são aplicadas automaticamente;
11. o PR permanece em rascunho;
12. `main` e a aplicação pública permanecem intactos.

## Ordem aprovada

1. E0 — baseline e corpus;
2. E1 — Léxico/Sintaxe contextual;
3. E2 — profundidade lexical auditável;
4. E3 — qualidade das cinco engines;
5. E4 — veredito de substituição.

## Baseline histórica

A documentação v916 do legado informa aproximadamente:

- 1.350 entradas de sinônimos;
- 1.020+ definições;
- 110+ casos de polissemia;
- 600+ entradas contextuais;
- 2.045 formas verbais regulares no presente;
- bancada sintática 17/17 e golden 91/0;
- 10 gestos e 9 campos semânticos no Espelho de Voz;
- enciclopédia 50 e `grammarWords` 348 no RimaLab.

Esses valores são alvo de inventário, não selo de qualidade.

## Primeira evidência aprovada

Corpus v1 de 14 casos únicos:

- locuções `por enquanto` e `enquanto isso`;
- `enquanto` em oração;
- pares `publica/pública` e `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

Baseline:

- 8/14 casos únicos corretos;
- seis lacunas repetidas nos dois navegadores;
- 264/276 execuções aprovadas.

Após a primeira camada contextual tipada:

- 14/14 casos únicos corretos;
- 276/276 execuções aprovadas;
- nenhuma regressão nos oito casos já corretos;
- nenhuma alteração em `lexical-engine.js` ou nas bases legadas;
- nenhuma mutação do manuscrito;
- nenhuma substituição automática.

Evidência funcional:

- cabeça `d44791ff1a317610c9dd152360cfbb9b168c503a`;
- Mass Notes `30493491424`;
- Argila `30493491638`;
- coerência `30493491411`;
- artefato `mass-notes-tiptap-30493491424`.

## Próxima fronteira

Antes de ampliar vocabulário ou interface:

1. criar controles negativos para as regras contextuais novas;
2. medir as contagens reais das bases;
3. auditar duplicatas, autorreferências, ciclos e definições frágeis;
4. escolher expansão lexical brasileira pequena e fundamentada;
5. desenhar uma bancada sintático-morfológica integrada;
6. ampliar a avaliação humana das cinco engines.

## Fronteira de release

M1.0 não autoriza merge, promoção, lançamento público ou substituição do produto antigo. A autorização depende do veredito E4 e dos gates de release ainda abertos, incluindo PWA/offline, dependência externa da Anatomia, Prova de Autoria, exportação avançada e validações físicas de acessibilidade.
