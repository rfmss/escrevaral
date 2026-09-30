# M02 — o léxico real passa a alimentar Classes de palavras

Base: main `136a41ec24a75ef4f6712efb5b6598a6cd6367e4`, confirmação da v6-34. Rafael pediu continuar em 30/09/2026; coordenação e integração A2. Sem nova fonte, dependência ou banco.

## Entrega e tarefas cumpridas

- [x] M02-candidatos-1: alimentar a lente contextual existente com leituras do PortiLexicon já incorporado.
- [x] Reconhecer formas finitas adicionais pelos traços explícitos, preservando pessoa/número, lemas e ambiguidades.
- [x] Mostrar origem dos candidatos na evidência e versão do recurso na cobertura.
- [x] Conservar manuscrito, posições, recorte e uma lente por escolha.
- [x] Preservar os inventários usados por sintaxe e relativas; verificar os limites e casos contrastantes.

M02 permanece parcial: não são dez classes plenamente desambiguadas, análise sintática geral ou avaliação reservada. Plano v4 continua **11/25 DONE**, +0 marcos completos; tarefa M02-candidatos-1 cumprida.

## Como usar

No editor, **Examinar → Classes de palavras**. `Tu casas.` favorece verbo; `As casas eram brancas.` favorece substantivo para casas. `Nós cantávamos.` e `Eu dormia.` passam a usar formas presentes no inventário real. `casas` isolado continua ambíguo. `Eu fui.` favorece classe verbal, mas mantém ir/ser e possibilidades AUX/VERB no resultado: não escolhe lema, sentido ou função auxiliar.

Pontuação, quebras de linha, citações e código interrompem o contexto conforme a proteção existente. Em `Nós, cantávamos.`, a lente não cria relação pela proximidade. `Eu casas.` não satisfaz pessoa/número; isso não gera correção nem julgamento do manuscrito. Abrir ou digitar continua sem disparar análise.

## Implementação delimitada

`ptbr/morfologia-contextual.js` acrescenta `lexicalReadings()` à lente. Une candidatos locais às classes do recorte PortiLexicon. Conversões explícitas: NOUN → substantivo; VERB/AUX → verbo; ADJ/ADV/ADP → adjetivo/advérbio/preposição; CCONJ/SCONJ → conjunção; PRON/NUM/INTJ → pronome/numeral/interjeição. DET vira artigo somente com PronType=Art; caso contrário, mantém **determinante (UD)**. Não afirmar equivalência entre toda a taxonomia UD e a gramática escolar.

Formas finitas externas exigem VERB/AUX, VerbForm=Fin, Mood=Ind/Sub, Person=1/2/3 e Number=Sing/Plur. A regra de pronome verifica pessoa/número; imperativo, infinitivo e particípio não são convertidos em indicativo. O tempo permanece identificável como UD nos candidatos compatíveis, sem inventar resolução temporal. AUX/VERB com mesmos traços não duplica a mesma flexão na lista externa de apoios. Candidatos originais completos são preservados.

A função `readings()` antiga permanece para consumidores de sintaxe/relativas. A ampliação lexical entra apenas na lente de classes; não estende automaticamente regência, papéis sintáticos ou subordinadas. `vault.analyze()` continua síncrono. `coverageInfo.lexiconVersion` informa o recurso; versão de conhecimento passa a `local-20260930-contexto-2`, e a lente a `contexto-2-portilexicon`.

## Ambiguidades e correção da condição nominal

A condição anterior de artigo + nome tratava qualquer segunda classe como se fosse leitura verbal. Com o novo léxico, `menina` é NOUN/ADJ; isso não deve exigir verbo à direita. A exigência de contexto adicional passa a valer quando há **leitura verbal finita**, coerente com o propósito da regra. `Vi a menina.` permanece contextual; `A comida.` admite leitura nominal mesmo com particípio/adjetivo na lista.

Duas expectativas antigas mudam com motivo registrado no corpus: CTX-022 (`O filho da vizinha chegou.`, alvo filho) passa a ambíguo porque a fonte também registra filhar e a regra atual não atravessa o complemento preposicional; CTX-047 (`casa` isolado) passa de lexical a ambíguo pela leitura de casar. As expectativas anteriores ficam em `previousExpected`; as outras 61 permanecem. Não apagamos leituras raras da fonte para forçar uma classificação. Essa perda delimitada de decisão contextual está aceita como pendência, não disfarçada de melhoria em todos os casos.

## Fontes e custo

Reutiliza as regras operacionais e estudo parcial registrados em [CONTEXTO-1](../../ptbr/CONTEXTO-1.md), sem nova alegação de leitura de livros. Dados, licença MIT do snapshot, atribuição, anúncio institucional CC-BY sem versão e hashes permanecem na [entrega v6-34](ENTREGA-V6-34.md). A ocorrência cita a regra herdada e PortiLexicon quando utiliza candidatos externos.

Sem dados adicionais. Até 8.000 unidades UTF-16/1.600 tokens, no máximo uma consulta morfológica por token; a consulta exata só faz JSON.parse quando a chave existe. Cada registro do recorte tem no máximo 122 bytes serializados/11 leituras. Não consulta sentidos OWN-PT durante a análise de classes. Sem cache residente novo. São limites de trabalho e dados, não medição de heap ou promessa de latência em qualquer aparelho. A análise síncrona não é interrompida no meio; cancelamento/invalidação seguem o painel.

## Verificação essencial

`tests/contexto-portilexicon.cjs`: **26 contrastes**, fonte/versão, retenção de ambiguidades, NFD/emoji e posições, isolamento de resultados e outras lentes, teto de uma consulta por token, ES5 e integração simulada do painel. A simulação executou só morfologia e manteve o manuscrito.

`tests/ptbr-contexto.cjs`: **63 casos** aprovados com as duas evoluções explícitas acima; limites, proteção e deslocamento de seleção. `tests/ptbr-sintaxe.cjs`: **78 casos** preservados. `tests/cofre-portabilidade.cjs`: **290 equivalências** entre fontes e cofre montado. `npm run build:check`: 7 arquivos. A suíte do painel também passou. Demais regressões ficam no CI. Não é corpus reservado nem certificação linguística; não exigir visual/aparelhos como gate.

## Publicação, reversão e próximo passo

Implementado, integrado e verificado localmente; confirmação de main/CI/Pages será registrada abaixo. Não há mudança de formatos do autor. Reverter por commit normal do módulo/expectativas e remontagem; preservar textos e as consultas lexicais v6-33/v6-34.

Próximo M02: grupos nominais curtos com artigo, nome e adjetivo, usando gênero/número como apoio e registrando contraexemplos. Começar pelo contraste de adjetivo/substantivo, sem resolver toda a oração nem ampliar silenciosamente sintaxe/relativas. O caso de filho com complemento preposicional fica identificado para tratamento próprio. M01 segue em expansão/revisão; A02 não volta a bloquear a entrega linguística.
