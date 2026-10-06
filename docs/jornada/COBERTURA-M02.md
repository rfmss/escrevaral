# M02 — cobertura e caminho de fechamento

Base do diagnóstico inicial: `017b4ecb7d4277c08afcb66cb42f7776a1a59a95` (v6.43), 05/10/2026. Atualização integrada v6.44 em 06/10/2026; publicação por commit em Actions. Critério vigente do Plano v4: dez classes, locuções, ambiguidades, abstenções e avaliação por classe. Esta matriz não acrescenta marcos ao denominador 25 nem transforma exemplos em porcentagem da língua.

## Classes: implementação e lacunas

| Classe | Decisão contextual existente | Evidências | Lacuna delimitada |
|---|---|---|---|
| Substantivo | Artigo/nome, grupos nominais, complementos e coordenações | CTX-002/006/007/008/011/012/013; tests/contexto-nominal.cjs e testes de coordenação | Núcleos sem artigo; duas metas com revista/revistas em nominal-7 continuam abertas |
| Artigo | Definidos/indefinidos em grupos; alternativa numeral de um/uma preservada | CTX-002/006/007/012/013; tests/contexto-indefinidos.cjs | Par indefinido + nome isolado; hipótese de artigo não decide quantidade |
| Adjetivo | Grupos de três palavras; coordenação com adjetivo posposto | CTX-006/013; tests/contexto-nominal.cjs e contexto-coordenacao-adjetivos.cjs | Predicativo, homógrafos verbais e gênero ausente |
| Pronome | Clítico junto ao verbo e demonstrativo sem nome; possessivo sem nome permanece aberto | CTX-003/009/010; tests/ptbr-contexto.cjs e contexto-sem-nome.cjs | Pronome pessoal sujeito é apoio sem decisão sobre sua própria ocorrência; contrastes de se/que |
| Verbo | Forma finita compatível com sujeito explícito e infinitivo apoiado | CTX-001/005; tests/ptbr-contexto.cjs e contexto-portilexicon.cjs | Formas isoladas, sujeito não expresso e função auxiliar |
| Advérbio | CTX-014 na v6.44: não pré-verbal com leitura ADV real e apoio indicativo | Sondas M02-11/12; tests/contexto-negacao.cjs | Outros advérbios e não sem sujeito explícito permanecem fora do recorte |
| Numeral | Apenas candidato lexical; um/uma podem receber hipótese de artigo | Sondas M02-13/14; alternativas preservadas no painel | Dois/três + nome plural em unidade curta |
| Preposição | De e contrações no complemento nominal apoiado | CTX-007; tests/contexto-preposicional.cjs | CTX-005 seleciona o infinitivo, não a preposição; regência geral também pertence a M03/M05 |
| Conjunção | E/ou na coordenação nominal delimitada | CTX-011/012/013; testes de coordenação | Mas e subordinativas, contrastes de que/se/como |
| Interjeição | Apenas candidato lexical | Sondas M02-19/20; inventário legado | Interjeição isolada com fronteira explícita; usos citados/substantivados abertos |

O determinante (UD) de CTX-008 conserva a categoria da fonte: não é décima primeira classe nem pronome contextual automaticamente. CTX-004 é o estado sem decisão; CTX-010 é observação de ambiguidade, não classe decidida. As evidências de testes apontam arquivos existentes, sem alegar nova execução de todas as suítes nesta retomada.

## Locuções: resultados de lentes diferentes não são intercambiáveis

| Família | Presente | Falta para M02 |
|---|---|---|
| Verbais | ptbr/grupos-verbais.js: quatro padrões na lente Sintaxe; corpus locucoes-1 com 65 casos | Delimitar reaproveitamento dos componentes em Classes, sem executar Sintaxe em fila ou propagar seu inventário automaticamente |
| Adverbiais | Expressões encontra literalmente de vez em quando | Contexto e função ainda não decididos; correspondência de catálogo não é classificação morfológica |
| Prepositivas/conjuntivas | Palavras simples e candidatos | Inventário pequeno, apoios e exclusões antes da implementação |
| Adjetivas e demais grupos pluriverbais | Complementos curtos em CTX-007 | Complemento não vira automaticamente locução adjetiva; delimitar decisão e alcance da primeira versão |

A matriz não elimina famílias prometidas por falta de implementação. Expressões estilísticas, grupos sintáticos e classes permanecem resultados distintos.

## Diagnóstico reproduzível

`ptbr/corpus/cobertura-m02/sondas.json`: vinte alvos próprios, dois por classe, fixados antes da regra nova. A classe desejada não obriga decidir uma passagem ambígua. Não são avaliação reservada nem estimativa de acurácia geral.

`node ferramentas/medir-cobertura-contexto.cjs caminho-do-relatorio.json` registra status, candidatos, seleção e regra por alvo. O relatório `antes-v6-44.json` é da v6.43; seu nome identifica a comparação prevista, não uma v6.44 publicada.

Na base: sete decisões da classe desejada, treze casos abertos, nenhuma seleção de classe diferente. Sete classes têm ao menos um caso decidido nestas sondas; isso não mede completude dessas classes. O código dessa base também não tinha seleção contextual para advérbio, numeral ou interjeição. Na v6.44, oito decisões desejadas e doze casos abertos: uma decisão nova de advérbio. Numeral/interjeição continuam sem seleção; esses números são apenas as vinte sondas.

A primeira lacuna escolhida é não pré-verbal: reutiliza o reconhecimento de sujeito/forma finita, sem nova infraestrutura. Corpus separado `adverbios-1`: dezesseis alvos por conjunto, seis metas positivas e dez abstenções. Baseline de cada conjunto: zero decisões úteis/erradas, seis lacunas e dez abstenções esperadas. Depois da integração com o inventário real, cada conjunto teve seis decisões úteis, zero erradas, zero lacunas e dez abstenções esperadas. Gabaritos preservados; não é avaliação independente.

## Critério operacional para concluir M02

O marco permanece TODO até que estes pontos tenham evidência:

1. Cada uma das dez classes possui recorte contextual declarado e acessível em Classes. Inventário lexical e observação aberta não contam como decisão. Locuções têm inventário, construção, classe resultante e exclusões definidos, com implementação correspondente ou decisão explícita de escopo registrada.
2. Cada padrão tem exemplos positivos, negativos, ambíguos, fronteiras/proteção e ausência de traços quando aplicável, fixados antes do código. Que/se/como constam dos contrastes; reconhecer como apenas como verbo não fecha esse item.
3. Relatório por classe/família separa decisões úteis, erradas, abstenções esperadas, lacunas e observações. Meta de zero decisão indevida nos controles de exclusão declarados; metas positivas não desaparecem do gabarito. Lacunas remanescentes exigem limite e motivo explícitos antes do fechamento.
4. Trechos/apoios exatos, candidatos, fontes e limites na mesma lente; manuscrito imutável, escolha explícita, cancelamento e custos delimitados. Reusar testes existentes, sem nova homologação visual/aparelhos.
5. Integridade dirigida e regressão no CI; publicação por commit. Avaliação reservada com limiares prévios e encerramento global continuam em Q02; corpus próprio não vira reservado.

## Sequência de trabalho

Não pré-verbal; numeral cardinal com nome; interjeições delimitadas; inventário e integração de locuções; contrastes restantes de que/se/como e apoios pronominais/preposicionais; consolidação por classe. Só reabrir coordenação nominal por erro reproduzível ou necessidade do fechamento. A ordem não promete número de versões ou prazo e não altera os 25 marcos.

Próxima ação concreta: numeral cardinal dois/três seguido de nome plural, com leitura NUM e Number explícitos, unidade curta completa, gabaritos antes do código e abstenção para unidade monetária/data ou nome sem traços. Não resolver um/uma. A [entrega v6.44](ENTREGA-V6-44.md) supera a preparação histórica da [retomada técnica](RETOMADA-M02-2026-10-05.md).
