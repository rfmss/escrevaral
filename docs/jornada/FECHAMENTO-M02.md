# M02 — fechamento delimitado da primeira versão

06/10/2026. Critério aplicado: COBERTURA-M02, estabelecido antes deste fechamento. DONE significa recortes da primeira versão entregues; não significa cobertura integral das classes ou avaliação reservada concluída.

## Evidências por critério

1. Dez classes têm decisão contextual acessível em Classes: substantivo/artigo CTX-002/006/007; adjetivo CTX-006/013; pronome CTX-003/009/022; verbo CTX-001/005; advérbio CTX-014/021; numeral CTX-015; preposição CTX-007; conjunção CTX-011/012/013/023; interjeição CTX-016. Determinante UD e observação possessiva não contam como novas classes. Cinco famílias de locução têm inventários explícitos, CTX-017–020/024. Demais grupos têm decisão de escopo em ESCOPO-LOCUCOES-M02.
2. Corpora anteriores a cada regra preservam positivos, exclusões e ambiguidades; testes dirigidos cobrem proteção, fronteiras e ausência de fonte/traços. Como/se/que têm matriz e 96 alvos próprios. O novo corpus adjetival foi medido na base v6.54 antes do motor.
3. CONSOLIDACAO-M02 reproduz 621 alvos de 37 arquivos: 270 úteis, zero erradas nos controles declarados, 343 abstenções, duas lacunas, seis observações. Sondas separadas: 12 desejadas e oito abertas. Não há avaliação cega, frases únicas ou taxa geral inferida. Metas ausentes não foram retiradas.
4. Grupos preservam componentes, candidatos, trechos e apoios UTF-16. Seleção, autoria, uma lente por escolha, custos e apresentação têm testes dirigidos; contratos de revisão/cancelamento/IME seguem no CI. O cofre permanece síncrono, com tetos 8.000 UTF-16/1.600 tokens/100 achados e uma consulta por token. Nenhuma preparação incremental foi ativada.
5. Build reproduzível e testes dirigidos antecedem o commit. Integridade completa e Pages são conferidos no SHA da entrega v6.55. O fechamento no plano usa definição de entrega implementada/documentada e verificada; o registro por SHA distingue publicação de implementação. Q02 continua TODO.

## Lacunas aceitas neste escopo

| Alvo | Limite e motivo | Continuidade |
|---|---|---|
| nominal-7 AVA04/AVA06 revista/revistas | Inventário admite núcleo/modificador alternativos; a regra preserva abstenção sem resolver sentido. Continuam duas lacunas positivas | M03/M06: apoio estrutural/semântico antes de ampliar |
| Casa caiu. | Nome sem artigo e homógrafo verbal; recorte nominal não decide | M03: sujeito/núcleo |
| Uma casa. | Par indefinido isolado; alternativa quantitativa não resolvida | M01/M03: refinamento delimitado |
| A casa é bonita. | Predicativo fora dos grupos nominais atuais | M03 |
| Eu canto. / alvo Eu | Pronome pessoal usado como apoio, sem seleção própria; classe pronome já coberta em outros recortes | M03 |
| Canto. | Verbo/nome isolado, sem apoio desambiguador | M01/M06 |
| Ela nunca chegou. | Regra de negação limita-se a não; nunca fora do inventário da regra | M06: escopo de negação |
| Para cantar. / alvo Para | CTX-005 decide infinitivo; não decide preposição homógrafa | M03/M05 |
| Eu canto mas ela dança. / alvo mas | Coordenação oracional adversativa fora dos conectivos delimitados | M03 |

Essas lacunas aceitas não alteram os gabaritos nem removem compromissos das etapas seguintes. O registro não apresenta os casos abertos como acertos.

## Próxima etapa

M03: inventariar as construções já presentes em Sintaxe/Locuções, fechar recortes e exclusões e ligar somente os candidatos reais necessários. Prioridade inicial: sujeito pessoal explícito + verbo finito, com evidência de pessoa/número, comparando a análise legada antes de alterar o motor. Não propagar automaticamente Classes para Sintaxe nem inferir subordinação apenas por que.
