# Núcleo de linguagem — revisão de 10/09/2026

O núcleo passa de nove para treze lentes. Esta entrega compara o legado linguístico das branches, incorpora recortes testados e torna explícito quando uma análise tem amostra suficiente. Não certifica a gramática inteira nem a compatibilidade física do iPad.

## Comparação reproduzível

Foram obtidas as 68 branches remotas, sem checkout, merge ou alteração delas. A inspeção ficou nos arquivos de linguagem, dados, contratos e corpus pertinentes. A mudança permanece em `astra/escrevaral-master`, a partir de `ac40c3c10ec58d667343f131ebc55722a8f5922d`.

`oficina/comparacao-branches.json` registra branch, commit e blob de cada arquivo do recorte. São 17 conjuntos distintos após incluir o catálogo de sinônimos e o módulo antigo de orações relativas. Igualdade de blobs evita revisar repetidamente a mesma implementação. O filtro está em `oficina/comparar-branches.py`; não equivale a auditoria integral de todo arquivo do repositório. Branches de distribuição sem fontes correspondentes ficam em um grupo vazio; o ZIP do cofre tem proveniência própria, já registrada em `proveniencia-cofre.json`.

| Família inspecionada | Evidência útil | Limite encontrado | Decisão |
| --- | --- | --- | --- |
| `main`, `backup-engines-vault-2026-08-23`, `experiment/mass-notes-tiptap`, `feat/escrevaral-paper-home` | Suplementos C2/C5 de concordância e crase, corpus com positivos e controles negativos, morfologia em camadas | TypeScript, lookbehind, propriedades Unicode, imports e APIs modernas; algumas regras inferem plural apenas por `s` | Melhor origem dos recortes normativos nesta comparação; portar comportamento delimitado, sem carregar adaptadores de tela |
| `stabilize/paper-home-final` | Mesmos blobs de engines selecionadas da main, com conjunto menor de arquivos auxiliares | Não há ganho demonstrado de engine nesse recorte | Reutilizar a main como fonte comum |
| Família `staging/fase-1-*`, `feat/cofre-core-contract-v1` e derivados | Separação e documentação de contratos; morfologia verbal e dados compartilhados | Adaptadores anteriores, dependências modernas; planos não são código linguístico novo | Usar como referência de fronteiras; não substituir o runtime atual |
| `staging/m1-r0-*` | Regras de anotação, proveniência de corpus e estados de pesquisa explícitos | Candidatos de anotação sintética e seleção de modelos não constituem engine determinística aprovada | Manter na oficina; nenhum modelo ou peso entra no produto |
| `encore` / `gh-pages` | Engines ES5 e contratos separados | Morfologia seed pequena; nó `_meta` substitui homografias; restauração de clíticos é ampla demais | Preservar as 884 formas e múltiplas leituras atuais |
| `experiment/encore-piso-2012` / `experiment/codex-caderno-core` | Infinitivo condicionado a lema conhecido, preposição e contexto nominal | Cobertura pequena; não prova análise geral de clíticos ou subjuntivo | Melhor base compatível para o novo recorte de infinitivo contextual |
| Backups/restores e famílias `agent/*`, `codex/*` | Catálogos, poesia, vocabulário e análise descritiva evoluem entre snapshots | Volume de entradas e comentários como “100% madura” não demonstram precisão | Reaproveitar dados com proveniência e contagens; não importar juízos sobre “aberturas fracas”, voz ou emoção |
| `astra/escrevaral-master` anterior | Findings com offsets, preservação de ambiguidades, limite de execução e testes do acervo | Nove lentes; faltavam recortes normativos e uma política de amostra explícita | Base de integração e contrato mantidos |

Não há uma branch vencedora para tudo. “Mais madura” aqui significa melhor evidência para uma função delimitada, não ser a mais recente ou ter mais linhas.

`oficina/sondar-legado.js` reproduz duas diferenças concretas com entradas sintéticas: registrar `fui` como ser e ir no Encore conserva apenas a última leitura; a tabela atual conserva ambas. O restauro legado aceita `amá-me` a partir de `amar`; esse restauro não foi incorporado. Resultados e SHA estão em `sondas-legado.json`. Essas duas sondas não estimam a taxa de acerto geral.

## Critério de entrada no produto

Cada recorte precisa de origem identificável, comportamento delimitado, evidência exibida, testes positivos e de abstenção, offsets válidos, preservação do manuscrito e execução ES5 sem rede. Estados técnicos e linguísticos são separados:

- Catalogado: material preservado, ainda sem comportamento ativo.
- Ativo com limites: passa nos testes desse recorte e declara o que não sabe. As novas lentes estão neste estado.
- Validado no aparelho: exige medição física de abertura, latência e preservação. Nenhuma promoção foi feita para esse estado.

Revisão bibliográfica independente continua pendente na concordância e nos paradigmas. Esses recortes emitem avisos condicionais ou leituras informativas, nunca sentenças automáticas de erro. A crase foi também conferida nos itens sobre infinitivo e pronome pessoal do [Manual de Comunicação do Senado](https://www12.senado.leg.br/manualdecomunicacao/estilos/crase), consultado em 10/09/2026. O manual orienta convenções; não determina escolhas da ficção.

## Quando acionar uma categoria

A pessoa escolhe uma lente em Examinar. A triagem ocorre somente nesse momento. Não há varredura contínua, inferência automática de gênero literário nem acionamento simultâneo.

| Categoria / lente | Condição de acionamento | Comportamento e abstenção |
| --- | --- | --- |
| Convenções: ortografia, acentuação, pontuação | Entrada disponível fora das regiões protegidas; palavras para lentes lexicais | Recortes originais preservados; desconhecidos não viram erros |
| Crase | Pelo menos duas palavras; encontro de `à/às` com pronome pessoal ou infinitivo registrado | Dois tipos de aviso; não caça acentos ausentes, nomes próprios, demonstrativos ou casos facultativos |
| Concordância | Pelo menos três palavras; início de frase e construção reconhecida | Cinco tipos: haver, existir, seus auxiliares e fazer temporal. Plurais vêm de lista explícita, não do sufixo `s`. Haver/existir aceitam complementos inteiros delimitados; fazer exige quantidade + unidade temporal + `que` |
| Gramática: classes e infinitivo | Palavra reconhecida; infinitivo exige lema de uma lista de 65, preposição contígua e sujeito opcional compatível | Mantém homografias; não inventa lema nem resolve subjuntivo por terminação; clíticos e infinitivos acentuados fora do recorte ficam pendentes |
| Orações simples | Ao menos duas palavras, e oração inteira reconhecida pelo analisador | Não omite desconhecidos para forçar uma análise |
| Escolhas: vocabulário decolonial e expressões | Correspondência no catálogo existente | Mantém reflexões contextuais, sem atribuir intenção ou origem histórica |
| Repetição próxima | Três ocorrências da mesma grafia em uma janela de 40 palavras do mesmo parágrafo | Exclui palavras funcionais; preserva acentos e flexões; citação e parágrafo interrompem a janela; mostra três posições verificáveis |
| Ritmo das frases | Três frases delimitadas fora das regiões protegidas | Conta palavras, mínimo, máximo, média e desvio-padrão. Não produz nota de qualidade, diagnóstico emocional ou ordem de corte |
| Poesia: rimas | Duas linhas com palavras | Candidatas gráficas; não garante equivalência sonora |
| Métrica | Uma linha com palavra | Escansão estimada e alternativas; a leitura oral decide |

Os mínimos são critérios de utilidade da comparação, não leis linguísticas nem limiares clínicos. Os detalhes ficam em `conhecimento/maturacao.js`. Entrada insuficiente retorna `status: insuficiente` com motivo; análise realizada retorna `status: examinado`. Silêncio em uma análise realizada continua significando apenas ausência de apontamentos nesse recorte.

Exemplos deliberadamente fora da concordância: `Tem muitos livros`, `Haviam os autores chegado`, `José e Maria fazem dez anos de casamento`, sujeito oculto/pessoal, fala com travessão e orações complexas. `Haverão novas palavras` também fica fora neste estágio por trazer adjetivo antes do substantivo. Essa omissão está testada; não é apresentada como cobertura completa.

## Fronteiras e custo

`cofre.js` agora apenas registra, aciona a política da lente, executa e valida Findings. O reconhecedor original foi movido sem mudar seus resultados para `maquina/basicas.js`. Dados, limiares e fontes ficam em conhecimento; algoritmos em máquina; a ponte apenas apresenta grupos, alcance e resultado. As decisões linguísticas continuam fora do DOM.

Uma lente por chamada, até 200 mil unidades UTF-16 e 100 Findings, com limite informado. A triagem lexical para ao atingir a amostra mínima. O produto pronto não exige instalação, pacote, build, rede, LLM ou servidor. Continua havendo empacotamento opcional apenas na oficina.

O HTML portátil passou de 432.980 para 456.821 bytes, acréscimo de 23.841 bytes. Os inventários, sondas e testes não entram no HTML. `medicao-maturacao.json` registra V8/Linux, não iPad: inicialização de 20,347 ms; medianas de 3,154 a 60,901 ms por lente nos textos da bancada; maior amostra de 101,397 ms. Há execuções interrompidas pelo teto de achados. Não extrapolar esses tempos para WebKit, livros inteiros, memória disponível ou latência no aparelho antigo.

## Verificação e continuidade

450 verificações passam: as 363 anteriores e 87 novas, além da ampliação de testes agrupados de interface e equivalência portátil. Incluem norma convencional, abstenções, fala brasileira, citações, NFD, emoji/UTF-16, entradas adversariais, independência entre lentes, amostra insuficiente, ausência de reanálise ao digitar, teto de resultados, ES5 e execução das novas lentes com rede e APIs modernas indisponíveis.

Comandos: `node astra/testes/run.js`, `node astra/oficina/empacotar.js --check`, `node astra/oficina/medir-cofre.js`. A comparação usa refs previamente obtidas; `python3 astra/oficina/comparar-branches.py` registra o estado dessas refs. As sondas usam os SHAs desse registro.

Próximos ganhos: revisão linguística externa do corpus de concordância, ampliação de construções nominais com casos adversariais, clíticos com múltiplas leituras e testes físicos. Regência geral, hífen abrangente, cobertura gramatical integral, diagnóstico de voz e Prova de autoria não foram declarados prontos.
