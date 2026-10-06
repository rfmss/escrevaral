<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-52.json -->
# Se pronominal com fonte e função em aberto

v6.52: se entre pronome pessoal de terceira pessoa e indicativo real compatível recebe hipótese de pronome em unidade completa de três palavras; casos lexicais e SCONJ preservados, sem decidir reflexividade ou voz.

Base: `15d4fed9f44240d89364fe9e9eeb3446cc10d923`. Coordenação solo; data 06/10/2026.

## Regra e referências

Matriz CONTRASTES-M02 anterior às regras; corpus se-pronominal-1 anterior à importação/motor. UD v2 PronType e Reflex, consultados em 06/10/2026: PRON pessoal inclui usos diversos; traço lexical Reflex não prova função contextual. CTX-022 exige sujeito pessoal de terceira pessoa explícito, se PRON Person=3/PronType=Prs real e indicativo real compatível, contiguidade e unidade completa de três tokens. Escolhe só pronome, confiança moderada. Case/reflexivity/voice/syntaxResolved false. Não rotula semântica reflexiva, passiva, reciprocidade ou impessoalidade.

## Fonte e conservação

Importador existente verifica doze hashes do snapshot 315e063da1f89c89e2097c6e72428ebefb9ab1d1. Se adiciona uma forma/quatro leituras: PRON Case=Acc/Dat/Nom Person=3 PronType=Prs e SCONJ _. Sem Number/Reflex na fonte, nenhum traço inventado. Recorte 12: 230 sementes,3220 formas,5683 leituras,517 lemas incluindo homógrafos; máximo11 leituras/forma,128 bytes/registro. Comparação decodificada conservou todas3219 formas/5679 leituras anteriores. Licença/atribuição intactas; OWN-PT inalterado.

## Corpus e contratos

Dois conjuntos de dezesseis alvos: seis metas/dez exclusões cada, antes zero úteis/seis lacunas/dez abstenções; depois seis úteis/zero erradas ou lacunas/dez abstenções. Sem cegamento/independência, gabaritos conservados. Oito perturbações removem PRON/VERB ou Person/PronType de se ou Mood/Person/Number/VerbForm do verbo. Primeira/segunda pessoa, se conjunção, sujeito nominal, condicionais/subjuntivos, negação/modificador, pontuação interna, linhas e proteção excluídos. Como e conjuntiva antigos preservados; regressão dirigida de negação/63 expectativas passou. Seleção com emoji/NFD, apoios exatos, texto intacto, painel somente Classes, uma consulta/token, tetos8000/1600/100 e ES5 passaram. Sondas continuam12 desejadas/8 abertas; metas revista/revistas mantidas.

## Custo e continuidade

Dados123526→123888 bytes (+362); cofre685005→687220 (+2215); portátil1400000→1402207 (+2207); app/CSS iguais. Janela de três tokens sem consulta adicional; sem medição de RAM/latência ou certificação de aparelhos. M02 geral TODO,11/25 DONE. Que integrante apoiado é próximo, seguido de relatório por classe/família e escopo de locuções adjetivas/demais grupos. Q02 mantém avaliação reservada. Referência/importação/regra/teste/distribuição registrados; conferir CI/Pages por commit ao publicar. Reversão por commit normal/build, sem migração de textos.

## Verificações e publicação

32 alvos pré-fixados e oito perturbações de fonte/traços passaram; Case/SCONJ conservados, seleção/autoria, proteção, truncamentos, custo limitado, ES5 e painel. Como 32 alvos, negação 32/63 regressões e conjuntivas 32 passaram com dados novos. Todas 3219 formas/5679 leituras anteriores conservadas por comparação decodificada. Vinte sondas permanecem doze desejadas/oito abertas/zero diferentes. Build:check; regressão completa CI e Pages por SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-contrastes-3: que integrante com dois pares pronome/indicativo real e apoio lexical delimitado de saber/dizer; exemplos e exclusões antes do código. Depois consolidar relatório por classe/família e delimitar locuções adjetivas/demais grupos antes de fechar M02.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: Somente pronome pessoal terceira pessoa + se + indicativo real compatível em unidade completa. Sem decisão de Case, reflexividade, reciprocidade, passiva, impessoalidade ou sintaxe.
