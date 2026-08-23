# Contrato de produto — Engines superiores ao legado

Data: 2026-07-29

Estado: **M1.0 em execução — E0 concluída, E1 contextual estabilizada e baseline E2 inventariada**

## Decisão

O programa ativo do Mass Notes Next é **M1.0 — Engines superiores ao Escrevaral legado**.

A meta não é reproduzir números antigos nem declarar maturidade por volume. A meta é preservar capacidades úteis e demonstrar superioridade em contexto, explicabilidade, segurança autoral, integração e evidência reproduzível.

## Promessa permitida durante o programa

> As leituras são locais, preservam o manuscrito e ajudam a observar possibilidades linguísticas. Elas não substituem decisão autoral nem fingem certeza onde o contexto não basta.

Também é permitido afirmar, com escopo explícito:

> A camada contextual nova superou a baseline integrada em seis fronteiras do corpus morfossintático v1, elevando o resultado de 8/14 para 14/14 casos únicos.

> O corpus integrado v1.1 passou 16/16 casos únicos e os primeiros controles negativos impediram generalização indevida entre adjetivo e verbo com sujeito nominal.

Sobre cobertura, a formulação permitida é:

> O inventário E2 mediu a cobertura efetiva atual e revelou diferenças entre declarações históricas, declarações brutas e chaves realmente disponíveis no runtime.

Sobre integração, a formulação permitida é:

> As engines acionadas pela interface analisam o snapshot vivo do Tiptap e descartam respostas que ficaram antigas durante a execução.

Essas afirmações não equivalem a superioridade global das engines.

## Promessas proibidas até o veredito final

- “corrige português automaticamente”;
- “entende qualquer frase”;
- “substitui integralmente o Escrevaral antigo”;
- “100% preciso”;
- “cobertura completa do português brasileiro”;
- “melhor que o legado” sem delimitar corpus, versão e resultado;
- transformar contagem de entradas em prova de utilidade;
- contar declarações sobrescritas como definições disponíveis;
- afirmar que 936 definições efetivas superam a baseline histórica de 1.020+.

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
11. uma análise iniciada pela interface usa o snapshot vivo do Tiptap;
12. resposta assíncrona é descartada se a assinatura do texto mudar;
13. chaves repetidas não podem ser aceitas como cobertura adicional;
14. conflitos editoriais não podem ser removidos em massa sem comparação;
15. alias ortográfico e sinônimo editorial devem ser diferenciados;
16. o PR permanece em rascunho;
17. `main` e a aplicação pública permanecem intactos.

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

## Evidência E0/E1 aprovada

Baseline E0:

- 8/14 casos únicos corretos;
- seis lacunas repetidas nos dois navegadores;
- 264/276 execuções aprovadas.

Após a primeira camada contextual:

- 14/14 casos únicos corretos;
- 276/276 execuções aprovadas;
- nenhuma alteração em `lexical-engine.js` ou nas bases legadas;
- nenhuma mutação ou substituição automática.

Após a estabilização inicial:

- corpus integrado v1.1: 16/16 casos únicos;
- controles diretos: quatro por navegador;
- matriz funcional: 144 cenários por navegador, 288 execuções;
- `A menina larga a mochila` e `O corredor estreita os olhos` preservam leitura verbal;
- nenhuma regressão nos 14 casos anteriores.

## Baseline E2 — cobertura efetiva

A auditoria reproduzível mede as estruturas realmente carregadas:

- 1.343 entradas de sinônimos;
- 7.766 alternativas brutas de sinônimos;
- 936 definições efetivas derivadas de 1.011 declarações;
- 175 regras de polissemia;
- 55 cartões explícitos de alternativas;
- 606 entradas contextuais em nove categorias;
- 527 entradas completas no léxico editorial local;
- 95 locuções brutas e 94 normalizadas;
- 2.045 formas regulares brutas no presente e 2.028 normalizadas;
- RimaLab com enciclopédia 50 e `grammarWords` 407.

Achados de integridade:

- uma família **P0**: 69 grupos de definições repetidas, 75 declarações sobrescritas e 68 conflitos de redação;
- uma única duplicata idêntica: `quica`;
- duas famílias **P1**: oito autorreferências de sinônimos e quatro aliases numéricos expostos;
- `leitor_modelo` vazio;
- quatro textos de definição repetidos entre chaves;
- 124 regras de polissemia sem cartão explícito de alternativas.

O inventário E2 não demonstra superioridade lexical. Ele demonstra que a cobertura histórica não pode ser usada sem auditoria e estabelece a fila de correção.

## Evidência de integração viva

Uma execução no Firefox mostrou quatro versos presentes no ProseMirror e o RimaLab respondendo “página vazia”. A ferramenta usava uma projeção React que podia ficar um ciclo atrás do editor.

Foi criado `src/editor/editorSnapshotBridge.ts`. O Tiptap publica sincronamente JSON, texto e assinatura estrutural. RimaLab, Contexto e Palavras/Léxico usam essa entrada no instante da ação e descartam resultados se ocorrer nova edição.

Cabeça funcional:

- `3c9c6d74e7638392a5bacfe4a2e82565e8af2583`;
- Mass Notes `30505264198`: auditor E2, build, 288/288, publicação, cache e smoke público;
- Argila `30505264208` e coerência `30505264199`: verdes;
- artefato `mass-notes-tiptap-30505264198`;
- digest `sha256:cd0627c79d7e2337d7077241246dcdf52a531de954bbcceebc5d00fae071523f`.

## Decisão de integridade

Antes de ampliar vocabulário ou interface:

1. validar a cabeça documental e a matriz integral;
2. consolidar `quica` com teste de não regressão;
3. revisar os 68 conflitos em lotes pequenos;
4. corrigir autorreferências sem destruir aliases úteis;
5. decidir o destino de `ode2`, `contemplar2`, `denso2` e `silencio2`;
6. preencher ou retirar `leitor_modelo` da cobertura;
7. impedir novas colisões pela CI;
8. só então escolher uma expansão lexical brasileira fundamentada.

## Fronteira de release

M1.0 não autoriza merge, promoção, lançamento público ou substituição do produto antigo. A autorização depende do veredito E4 e dos gates de release ainda abertos, incluindo PWA/offline, dependência externa da Anatomia, Prova de Autoria, exportação avançada e validações físicas de acessibilidade.
