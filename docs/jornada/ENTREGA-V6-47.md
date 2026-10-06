<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-47.json -->
# Primeira locução adverbial contextual em Classes

v6.47: de vez em quando recebe hipótese de locução adverbial em unidade curta com pronome e indicativo compatível. Classe do grupo separada dos componentes, com leituras reais preservadas e anotação sem repetir palavras.

Base: `49da806752bbba87fee5cf14f84c1a05f4a44a62`. Coordenação solo; data 06/10/2026.

## Referências e regra local

Priberam, verbete vez (https://dicionario.priberam.org/vez), seção de vez em quando, e Universal Dependencies v2 fixed (https://universaldependencies.org/u/dep/fixed.html), consultados em 06/10/2026. O verbete registra uso intermitente; a referência UD distingue expressão de classe externa e componentes. Esta regra não afirma que a expressão tem dependência fixed anotada no snapshot, não importa ExtPos e não cria parser. PTBR-CTX-017 é hipótese local para grupo adverbial de quatro palavras contíguas, com pronome pessoal e indicativo compatível: Eu canto de vez em quando / De vez em quando, eu canto. Nenhuma definição extensa foi copiada ou nova leitura de livro alegada.

## Contrato de grupo e componentes

Inspect mantém items lexicais por token e acrescenta locutions separado. A análise produz um achado do intervalo integral da locução com seis apoios no original, quatro componentes com todas as leituras e confiança moderada. Classe resultante locução adverbial; frequencyResolved e syntaxResolved false. Não escolhe classe contextual para cada palavra da expressão; quando conserva ADV/CCONJ/SCONJ. O apoio é pronome sujeito conhecido e forma indicativa compatível em pessoa/número, antes ou depois do grupo, em unidade completa de seis tokens. Só a ordem anterior ao par sujeito/verbo aceita vírgula separadora, obrigatória neste recorte.

## Exclusões e apresentação

Locução isolada, infinitivo ou indicativo incompatível, nome/pronome desconhecido, não/clítico/complemento/modificador, continuação, pontuação interna, quebras de linha, trecho protegido/citado e ordem anterior sem vírgula ficam sem esta regra. Não interpreta frequência, alcance, circunstância de toda oração, dependências, emoção ou intenção. Não reutiliza achados de Expressões/Sintaxe nem executa outra lente. A leitura anotada mostra um cartão da locução e evita repetir seus componentes na reconstrução do trecho; os achados lexicais e seus candidatos continuam na análise. Ajuda passa a mencionar palavra ou locução. Teste simulado confirma original reconstruído e um cartão do grupo nas duas ordens, sem edição do manuscrito.

## Importação e conservação

Importador existente executado no snapshot PortiLexicon-UD 315e063da1f89c89e2097c6e72428ebefb9ab1d1 com os 12 hashes conferidos. De/vez/em/quando acrescentados: cinco formas (inclui vezes) e oito leituras, preservando quando ADV/CCONJ/SCONJ e vezes VERB/NOUN. Recorte 10: 227 sementes, 3.217 formas, 5.670 leituras e 514 lemas incluindo homógrafos; máximo 11 leituras/forma e 128 bytes/registro. Comparação decodificada preservou todas as 3.212 formas/5.662 leituras anteriores. Licença/atribuição e OWN-PT mantidos.

## Evidência e cobertura

Locucoes-adverbiais-1 pré-fixado antes da importação/código: dezesseis alvos por conjunto, seis metas positivas/dez exclusões. Base zero úteis/seis lacunas/dez abstenções; depois seis úteis/zero erradas ou lacunas/dez abstenções por conjunto. Corpus próprio sem cegamento ou independência; não é avaliação reservada. Vinte sondas permanecem doze desejadas e oito abertas, sem classe diferente; a locução é um grupo e não acrescenta quatro advérbios à contagem. Matriz distingue agora padrão adverbial de grupo de catálogo literal. M02 ainda exige outras famílias, que/se/como e consolidação por classe; revista/revistas e demais lacunas antigas não foram retiradas.

## Custo, estados e reversão

Dados 123.153→123.335 bytes (+182); cofre 671.802→675.180 (+3.378); app 289.896→290.313 (+417); portátil 1.386.382→1.390.173 (+3.791); CSS inalterado. Uma consulta lexical por token, janela de seis tokens; seleção visual compara somente achados já limitados a cem. Tetos 8.000 unidades UTF-16/1.600 tokens/100 achados mantidos, sem rede/dependência ou análise automática nova. Bytes/operações não medem RAM/latência ou certificam aparelhos. Fonte lida, regra/dados integrados, testes dirigidos/distribuição concluídos; CI/Pages por commit confirmam publicação. Reversão por commit normal e build, sem migração de documentos. Próximo lote verbal delimitado, mantendo locuções prepositivas/conjuntivas e que/se/como na matriz.

## Verificações e publicação

Passaram 32 alvos de locução (seis úteis/dez abstenções por conjunto), retirada de cada componente real, indicativo/compatibilidade e unidade completa, proteção/truncamento, seleção com emoji/NFD, apoios exatos, autoria/custo/100 achados/ES5. Painel de uma lente e anotação sem duplicar palavras passaram nas duas ordens. Passaram 32 contrastes de negação, 63 regressões contextuais e 32 contrastes de interjeição. Todas as 3.212 formas/5.662 leituras anteriores preservadas. Vinte sondas M02 continuam doze desejadas/oito abertas/zero classes diferentes; grupo não é contado como palavra. Build:check sete saídas; regressão completa no CI e Pages por SHA.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02-locucoes-verbais-1: revisar o grupo verbal já existente e delimitar poder + infinitivo com sujeito pessoal, dados AUX/VERB reais, fontes/gabaritos/contrastes antes da implementação em Classes. Classe do grupo separada dos componentes; não executar Sintaxe em fila nem tratar AUX lexical como função contextual automaticamente. Outras locuções e que/se/como seguem na matriz.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: de vez em quando antes com vírgula ou depois de pronome + indicativo compatível, unidade completa de seis palavras; não mede frequência, resolve sintaxe ou propaga classe do grupo às palavras
