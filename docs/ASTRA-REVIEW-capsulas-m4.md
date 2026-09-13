# Parecer Astra — PR #165, cápsulas M4

**Decisão: MERGE em `encore`: NÃO, nesta revisão.**

Data: 13/09/2026. PR: https://github.com/rfmss/escrevaral/pull/165.
Cabeça examinada: `b4f217368bf5ae16ccd0f1ed468a1fd2343fdd72`.
Base informada pelo PR: `encore`, `2a380c0b4f981dfabc8722271323cfb31236d755`.

O port reproduz os resultados das bancas congeladas em Node atual, mas não atende ao piso ES5 nem ao contrato/integrador da represa. Há falhas reproduzíveis de execução e representação; não se trata de solicitar mais acabamento. Nenhuma engine foi editada e nenhum merge foi executado. Este commit acrescenta apenas parecer e evidências de revisão.

## Método e limites

Lidos HANDSHAKE-ASTRA.md, AGENTS.md, docs/index.md, docs/11, docs/10, catalogo/index.md, fichas de fusão/maturidade, contratos, runtime e diff do PR. O worktree `/tmp/opencode/encore-work` não existe nesta sessão. Os arquivos foram obtidos pelo GitHub no SHA acima: 51 arquivos de entrada, dados e testes, com bytes conferidos contra seus blobs Git. Execução: Node v24.19.0, Linux. Sem edição de runtime, fontes, fixtures ou runners originais.

Distinguem-se: fidelidade ao ouro, conformidade estrutural e execução real do fluxo da interface em bancada. Não houve renderização de navegador nem teste físico de iPad/KitKat. O diagnóstico adicional é código de oficina, fora do carregamento do produto; usa Acorn apenas para a verificação sintática, com a cópia embutida no Node desta sessão como alternativa.

## Rodagem reproduzida — 13 processos separados

| Runner | Saída declarada pelo runner | Exit |
| --- | ---: | ---: |
| run-lexico.js | 36/36 | 0 |
| run-lexico-adversarial.js | 35/35 | 0 |
| run-analise-literaria.js | 114/114 | 0 |
| run-analise-literaria-adversarial.js | 43/43 | 0 |
| run-es5-purity.js | 4/4, incluindo **duas comparações de dados puladas** | 0 |
| run-decolonial.js | 7/7 | 0 |
| run-morphology.js | 14/14 | 0 |
| run-pontuacao.js | 11/11 | 0 |
| run-relative-clause.js | 11/11 | 0 |
| run-rima-metro.js | 29/29 | 0 |
| run-runtime.js | 5/5 | 0 |
| run-sintaxe.js | 31/31 | 0 |
| run-voz-estilistica.js | 11/11 | 0 |

Total anunciado: **351/351**. Duas dessas aprovações são saltos por ausência da fonte, não verificações de igualdade. Saídas completas em [pr165-runners.json](revisoes/pr165-runners.json).

Na raiz da branch, executar:

```sh
(cd src/test && for runner in \
  run-lexico.js run-lexico-adversarial.js \
  run-analise-literaria.js run-analise-literaria-adversarial.js \
  run-es5-purity.js run-decolonial.js run-morphology.js \
  run-pontuacao.js run-relative-clause.js run-rima-metro.js \
  run-runtime.js run-sintaxe.js run-voz-estilistica.js; do
  node "$runner" || exit 1
done)
node docs/revisoes/pr165-verificar.js
```

**Correção do HANDSHAKE:** `node run-decolonial.js run-morphology.js ...` executa só o primeiro arquivo; os demais viram argumentos. O laço acima executa todos. No SHA examinado, o diagnóstico adicional termina com **exit 1: seis verificações falham e duas passam**, conforme [pr165-verificacao.json](revisoes/pr165-verificacao.json). As duas aprovações confirmam que os callbacks são diferidos, sem atestar latência ou fluidez no aparelho.

## Bloqueios concretos

### R1 · P1 — As duas cápsulas não são ES5 sintático

- `src/core/engines/lexico-classes.js:465`: `/^\p{Lu}/u`; outros usos de `\p{L}` e flags `gu` em 3363 e 3386.
- `src/core/engines/analise-literaria.js:1024`: `/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÜÇ])/u`.
- Acorn com `ecmaVersion:5` rejeitou ambos: `Invalid regular expression flag (465:21)` e `(1024:14)`. Remover só a flag não resolve o lookbehind nem a semântica de propriedades Unicode.
- Além da sintaxe, `normalize('NFD')` segue sem alternativa nas linhas 3390 e 1036. O teste por ausência de `const/let/=>` não audita essas exigências.

**Impacto:** uma engine pode falhar ao carregar, antes de registrar sua classe; o registro da página depende dessas classes. Chromium atual e Node não demonstram execução no piso do projeto.

**Correção mínima:** portar regex e normalização para recursos aceitos pela base, preservando acentos e posições no texto original; usar parser ES5 e cenários sem APIs opcionais no gate. Não mudar o piso nem adicionar um framework.

### R2 · P1 — O botão Classes de palavras envia objetos ao classificador

`index.html:333–335` passa a saída de `Tokenizer.tokenize(text)` como probes. Cada item é `{value, span}` (`src/core/services/tokenizer.js:19–22`). O adaptador, em `lexico-classes.js:3426`, faz `String(probes[i])`: isso produz **`[object Object]`**.

Reprodução com `A casa caiu. A casa ficou.` pelo mesmo caminho de dados da interface: **seis resultados “Substantivo”, todos com `{start:0,length:15}`**, inclusive para artigos e verbos. Os runners usam probes de strings e não exercitam essa integração.

Mesmo com strings, `indexOf` em 3429 sempre encontra a primeira ocorrência: os dois probes `casa` retornam início 2, ignorando a segunda ocorrência em 15. Um probe ausente ainda é forçado ao início 0.

**Correção mínima:** consumir `token.value` e o `token.span` original, com adaptação explícita se probes textuais continuarem suportados. Cobrir repetição, palavra ausente e artigos/verbos pelo tokenizador real da página.

### R3 · P1 — Findings não obedecem a contracts.js

`src/core/contracts.js:10–14` define `span:[start,end]`, gravidade 1–3 e confiança numérica 0–1.

- Léxico, linhas 3430–3435: devolve objeto `{start,length}`, `severity:'info'` e `confidence:'high'`.
- Literária, linhas 2096–2099: devolve gravidades 0.6/0.3 fora da faixa; nível “alto” vira 1, que no contrato significa leve.
- O runner léxico chega a validar `fd.span.start`, reforçando o formato divergente. Outros checks aceitam apenas a presença dos campos.

**Impacto:** posição, ordenação e apresentação por gravidade passam a depender da cápsula em vez do contrato compartilhado. Exibir apenas `message` na página mascara a divergência.

**Correção mínima:** adaptar as saídas ao contrato existente e validar tipos, limites e correspondência do trecho. Ajustar os testes de contrato, sem reescrever o contrato para fazer a cápsula passar.

### R4 · P1 — A análise literária perde o contexto do snapshot

`LinguisticSnapshot` guarda opções em `context` (`contracts.js:27–29`), mas o adaptador lê somente `snapshot.options` (`analise-literaria.js:2086`).

Reprodução com o corpus já existente `sujeira-vicios` e `new LinguisticSnapshot(text,{poesia:true})`: a chamada direta com opções produz **11 alertas**; `check` produz **12**, acrescentando `[economia] redundancia`. O teste do poema existente não distingue esses caminhos neste corpus e deixa passar a perda de contexto.

**Correção mínima:** encaminhar `snapshot.context` à análise e testar um texto que realmente diferencie poesia de prosa. Os outros nomes de opção devem seguir um único contrato documentado.

## Gates e integração que precisam de correção

**R5 · P2 — Pureza e proveniência superestimadas.** `run-es5-purity.js:115–119` incrementa `passed` quando os JSONs originais não existem. Nesta execução, ambos foram pulados e a saída mesmo assim foi 4/4. O scanner não é parser e não detecta R1. A origem deve ser fixada por revisão/hash; ausência precisa aparecer como SKIP ou bloqueio, nunca como igualdade demonstrada.

Contraprova adicional: passando o checkout disponível de `rfmss/escrevaral` (arquivos legados conservados em `f8343d27bf9cd0a3edef8230c66036a0ac1dc59d`) como argumento, o runner terminou em **2/4, exit 1**, com divergência nos dois JSONs. Esse checkout não foi comprovado como a versão exata usada pelo Cofre: o resultado **não demonstra corrupção**, mas confirma que o nome genérico “escrevaral” não torna a reprodução verificável. As fichas também registram expansão/normalização dos dados. Fixar a fonte realmente pretendida e explicar as transformações.

**R6 · P2 — Serialização ainda não demonstrada na integração.** Os callbacks novos usam `setTimeout`, mas o corpo inteiro de cada análise continua síncrono dentro dele. `runOne` não usa `_running`; a fila existe em `enqueue`, e a página não a usa. O ramo novo do léxico chama `check` diretamente. Clique em outra lente ou desativação não invalida um callback pendente antes de `render`. Parte disso é preexistente na base; não atribuo sua criação inteira ao PR. A nova integração deve passar pelo caminho serial e descartar resposta obsoleta. `run-runtime.js` testa cinco saídas de morfologia em sequência, não duas solicitações concorrentes nem as cápsulas novas. Não confundir execução serial com uma única engine residente: os scripts continuam carregados juntos.

As fichas de maturidade documentam fidelidade e testes anteriores do Cofre; não comprovam por si só conformidade com esta represa. Preservar a evidência histórica, mas não considerar a integração M4 aprovada por Astra enquanto R1–R5 persistirem. Não é necessário abrir outra rodada de arquitetura ou de expansão léxica para resolver os bloqueios identificados.

## Decisão → próxima ação → critério → teste

**Decisão:** não mergear este SHA em `encore`; conservar as cápsulas na branch de trabalho.

**Próxima ação concreta:** o emissor corrige R1–R4 nos adaptadores/conversão e fecha as lacunas R5–R6 de gate e integração, em commit separado. Engines permaneceram intocadas nesta revisão.

**Critério de retorno:** os 13 runners executados separadamente; nenhuma fonte ausente contada como PASS; parser ES5 aprovado; tokens reais e ocorrências corretos; Finding canônico; contexto preservado; fila e descarte de respostas obsoletas exercitados.

**Teste:** repetir a rodagem acima e acrescentar a regressão de troca rápida de lentes. Reemitir o parecer no novo SHA. O merge continua sujeito à ordem expressa de Rafa; este documento não o autoriza nem o executa.
