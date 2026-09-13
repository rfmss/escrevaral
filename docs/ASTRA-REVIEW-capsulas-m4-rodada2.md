# PR #165 — re-revisão Astra, rodada 2 / 2.1

**Parecer: MERGE SIM em `encore`, para o HEAD `730c746191af29d22127c9ed69a9c98b315fd00c`.**

Data: 2026-09-13. Base: `2a380c0b4f981dfabc8722271323cfb31236d755`.
Nenhum merge realizado. A decisão e a ordem de promoção pertencem ao dono.

Os seis bloqueios da revisão original estão fechados no HEAD acima: os 14 runners passaram, **363/363**, e as oito reproduções independentes da primeira revisão passaram sem alteração do diagnóstico. O fluxo real do `index.html` também descarta a resposta pendente ao desligar ou trocar a lente. Há uma regressão auxiliar de destaque de palavras, descrita abaixo, que não bloqueia a integração das cápsulas pelo contrato `check()`.

## Qual código foi examinado

A revisão começou no SHA solicitado, `f9f2d23f432dc5050d713d7da022c8ed1f9b534f`. Nesse estado, R1–R4 passaram, mas R5 não pôde ser comprovado sem os JSONs de origem e R6 ainda permitia renderizar uma resposta depois de desligar a lente. Antes de persistir o parecer, o HEAD avançou para `730c746`, que acrescentou os dois oráculos e invalidou a sessão em `deactivate()`.

Esse último commit foi incorporado à revisão. Os arquivos locais utilizados foram conferidos pelos hashes de blobs Git; nenhuma engine, dado, fixture ou golden foi editado pelo revisor. O commit deste parecer acrescenta apenas documentação, diagnóstico e evidências. A recomendação se aplica ao código examinado, não a futuras alterações da branch.

## Fechamento R1–R6

| Item | Estado | Evidência executada / revisão de código |
| --- | --- | --- |
| R1 — piso ES5 | Fechado | Acorn com `ecmaVersion: 5` aceita as duas engines, contracts, runtime e tokenizer. As reproduções independentes passam. Os scripts reais também analisam com APIs opcionais modernas removidas da VM. O parser vendado pertence aos testes e não é carregado pelo demo. |
| R2 — probes e posições | Fechado | Objetos do tokenizer preservam `value` e span; análise sem probes funciona no demo; integração verifica duas ocorrências de “casa” em spans distintos e probe ausente. Fallback de string continua deliberadamente limitado à primeira ocorrência. |
| R3 — Finding canônico | Fechado | Arrays `[start,end]`, severidade numérica 1..3 e confidence 0..1 nos dois adaptadores, confirmados pelas reproduções e pelos runners de contrato. |
| R4 — contexto | Fechado | `snapshot.context || snapshot.options`; reprodução de poesia volta à contagem esperada. Goldens literários: 114/114, sem regeneração nesta revisão. |
| R5 — gate e proveniência | Fechado | 9/9: cinco parses, dois hashes dos JSONs vendados e duas igualdades entre JSON e módulo embutido. Os hashes coincidem com os pins já declarados antes desta rodada. Fonte ausente ou divergente é falha; não é aprovação. |
| R6 — fila e resposta obsoleta | Fechado | Toda análise do demo usa `runtime.enqueue`; integração 7/7. Diagnóstico que executa os scripts e handlers reais confirma troca de lente e ativação → desligamento antes da conclusão. O incremento em `deactivate()` invalida a resposta pendente. |

Hashes SHA-256 dos oráculos efetivamente usados em `src/test/provenance/`:

- `lexical-data.json`: `d0e1e3f39b59cca73992dda9d60f240bab739eda8cd29ca6541abd7712e1036f`
- `norma-data.json`: `d8aca87b3b2b70775cc24f9a2a8e3cc09f2550a49b817da994945addc1d52763`

A verificação comprova correspondência com os pins e igualdade dos dados embutidos. Não constitui autenticação independente da revisão histórica local `2a0d3ff`, que não estava acessível neste ambiente.

## Rodagem reproduzível

Ambiente: Node `v24.19.0`, snapshot local do HEAD obtido pelo GitHub conectado. O worktree `/tmp/opencode/encore-work` não existia neste ambiente.

| Runner | Resultado |
| --- | --- |
| run-lexico.js | 36/36 |
| run-lexico-adversarial.js | 35/35 |
| run-analise-literaria.js | 114/114 |
| run-analise-literaria-adversarial.js | 43/43 |
| run-es5-purity.js | 9/9 |
| run-integration.js | 7/7 |
| run-decolonial.js | 7/7 |
| run-morphology.js | 14/14 |
| run-pontuacao.js | 11/11 |
| run-relative-clause.js | 11/11 |
| run-rima-metro.js | 29/29 |
| run-runtime.js | 5/5 |
| run-sintaxe.js | 31/31 |
| run-voz-estilistica.js | 11/11 |
| **Total** | **363/363** |

Execute cada runner em processo próprio. `node primeiro.js segundo.js` executa apenas o primeiro script; o restante vira argumento.

```sh
cd src/test
for runner in \
  run-lexico.js run-lexico-adversarial.js \
  run-analise-literaria.js run-analise-literaria-adversarial.js \
  run-es5-purity.js run-integration.js \
  run-decolonial.js run-morphology.js run-pontuacao.js \
  run-relative-clause.js run-rima-metro.js run-runtime.js \
  run-sintaxe.js run-voz-estilistica.js
do
  node "$runner" || exit 1
done
cd ../..
node docs/revisoes/pr165-verificar.js
node docs/revisoes/pr165-r2-fluxo.js
```

- [Saída integral dos 14 runners](revisoes/pr165-r21-runners.json): todos com exit 0.
- [Oito reproduções originais](revisoes/pr165-r21-reproducoes.json): 8/8, exit 0; diagnóstico original preservado.
- [Diagnóstico do fluxo real](revisoes/pr165-r2-fluxo.js) e [resultado](revisoes/pr165-r21-fluxo.json): 5/6, exit 1 exclusivamente pela observação auxiliar abaixo. Os casos de R6 passam.

O diagnóstico carrega os scripts reais na ordem do HTML, com DOM mínimo e timers controlados. Não mede renderização, latência, memória ou funcionamento em iPad/iOS 9. O parse ES5 e a retirada de APIs opcionais reduzem o risco de incompatibilidade, mas não substituem certificação física.

## Observação não bloqueante — helper de destaque (P2)

`VeredaLexical.createHighlightedContext('A casa caiu.', 'casa', escapeFn)` devolve `A casa caiu.`; deveria devolver `A <mark>casa</mark> caiu.`.

Em `src/core/engines/lexico-classes.js`, `splitLetterRuns` compara `isL` booleano com `mode` numérico usando `===`. Depois do primeiro caractere, o agrupamento quebra em caracteres individuais e o helper não encontra a palavra inteira. Correção pequena: manter o estado e a comparação no mesmo tipo, preservando ES5.

O helper é exportado, mas não participa da análise `check()` nem é chamado pelo demo atual, que renderiza mensagens. Por isso este defeito não reabre R1 nem impede a promoção das cápsulas avaliadas. Deve ser corrigido antes de conectar o destaque ao produto; o diagnóstico persistido fornece a contraprova. Não se deve anunciar todos os diagnósticos como verdes: os 363 testes da suíte passam, este caso adicional não.

## Próxima ação concreta — regra-mãe docs/11

O dono pode decidir e ordenar o merge do PR #165 em `encore` com base neste parecer. Após essa decisão, corrigir `splitLetterRuns` em uma alteração pequena e repetir `node docs/revisoes/pr165-r2-fluxo.js`, esperando 6/6. Não há necessidade de reabrir a arquitetura ou ampliar a auditoria para concluir esta entrega.
