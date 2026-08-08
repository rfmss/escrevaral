# M1.0 — E1: controles negativos da camada lexical contextual

Data: 2026-07-29

## Objetivo

Estabilizar a primeira camada contextual antes de ampliar cobertura lexical, impedindo que regras aprovadas em pares mínimos sejam generalizadas para estruturas vizinhas sem evidência suficiente.

## Baseline de entrada

Cabeça funcional anterior: `7a3ff060442c8c610676caef5085fa581f6e4024`.

- Mass Notes `30495155369`: 276/276, publicação, cache e smoke público verdes;
- Argila `30495155514`: verde;
- coerência `30495155428`: verde;
- corpus E0/E1: 14/14 casos únicos.

## Risco confirmado

A regra inicial de adjetivo pós-nominal reconhecia o padrão superficial:

`determinante + nome + forma ambígua`

Esse padrão explica corretamente:

- `A estrada larga cortava o vale.` → adjetivo.

Mas também aparece em orações com sujeito nominal e verbo transitivo:

- `A menina larga a mochila.` → verbo;
- `O corredor estreita os olhos.` → verbo.

Sem observar o token à direita, a regra podia classificar `larga` e `estreita` como adjetivos nesses dois controles. A falha é de produto: generalização excessiva da heurística contextual.

## Implementação

Foi criado o módulo puro:

- `src/engines/contextualLexicalResolver.ts`.

O fluxo passou a ser:

`lexical-engine legado → lexicalAdapter → contextualLexicalResolver → LexicalPanel`

Mudanças:

1. regras contextuais foram retiradas do adaptador de carga e isoladas em função pura;
2. locuções só recebem override quando a expressão exata aparece no contexto;
3. diacríticos continuam preservados na decisão;
4. voz passiva continua exigindo auxiliar imediatamente anterior;
5. sujeito pronominal continua favorecendo leitura verbal;
6. sujeito nominal seguido de marcador explícito de objeto favorece leitura verbal antes da hipótese adjetiva;
7. a hipótese adjetiva pós-nominal permanece como fallback contextual provável;
8. nenhuma alteração foi feita em `lexical-engine.js` ou nas bases legadas.

## Testes adicionados

Teste direto do resolvedor:

- `tests/m1-contextual-resolver.spec.ts`.

Ele cobre:

- locução presente e locução ausente;
- `publica` versus `pública`;
- `foi preso` versus `ficou preso` e `os presos`;
- verbos ambíguos com sujeito nominal e objeto explícito.

O corpus integrado passou de 14 para 16 casos únicos com:

- `A menina larga a mochila quando chega em casa.`;
- `O corredor estreita os olhos diante da luz forte.`.

Os dois casos continuam exigindo persistência anterior à consulta, ausência de substituição automática, editor editável e `innerHTML` autoral idêntico antes/depois.

## Resultado funcional

Cabeça de código e testes: `8579aa9b92589c57bd02df0f7eead5eebf99f1e8`.

- Mass Notes `30501052382`: **288/288**, build, Chromium, Firefox, publicação, cache e smoke público verdes;
- Argila `30501052355`: verde;
- coerência `30501052360`: verde;
- artefato `mass-notes-tiptap-30501052382`;
- digest do artefato: `sha256:cad619c69155a71733d121a0865e9655b905fd9dde0c731b3c3d9d6e5bf37e2c`.

Delta:

- matriz anterior: 138 cenários por navegador, 276 execuções;
- matriz atual: 144 cenários por navegador, 288 execuções;
- corpus integrado: 16/16 casos únicos;
- controles diretos: 4 casos por navegador;
- regressões nos 14 casos anteriores: 0.

## Veredito

A camada contextual está mais estável contra generalização excessiva nas fronteiras já cobertas.

Formulação permitida:

> A nova camada superou a baseline legada no primeiro corpus crítico de desambiguação contextual e passou os primeiros controles negativos de generalização.

Isto não prova superioridade lexical global, não autoriza substituição integral e não altera os bloqueios de release herdados.

## Estado

- E1 primeira tranche contextual: concluída;
- E1 estabilização por controles negativos iniciais: concluída;
- P0/P1 novos: 0/0;
- PR #155: continua aberto e em rascunho;
- `main`: intacta;
- branch de preview: publicada exclusivamente pelo workflow;
- Gate 14: não iniciado;
- próxima ação: inventário quantitativo e qualitativo E2 das bases lexicais reais.
