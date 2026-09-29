# A01 — conversão com ordenação externa

Próximo passo independente executado pela A2 a pedido de Rafael: retirar a retenção integral da fonte, dos blocos e dos descritores do conversor. Base: `e026ad8`, paginação do PR #188; main consultada `494b0f1`, com primeira prova aceita. A1 conserva ponte/instalação e contratos de produção. Nenhuma alteração do formato v2 ou do runtime lexical é necessária neste lote.

## Decisão

Entrada NDJSON percorrida por linhas limitadas. Ordenação externa em arquivos temporários, primeiro por ID para rejeitar duplicatas inclusive distantes, depois por chave/ID para preservar a ordem do conversor de referência. Corridas limitadas por bytes e quantidade de linhas; intercalação com número fixo de arquivos abertos. Blocos e páginas são escritos por nível, com descritores temporários em disco, sem catálogo completo em RAM.

Alternativas: exigir fonte já ordenada transfere o problema a outro programa; manter todos os IDs num Set continua crescendo com o acervo; SQLite adicionaria uma dependência/API ao ambiente de construção. A ordenação externa usa apenas Node e disco. O custo é mais I/O e espaço temporário, medidos separadamente da saída.

A ferramenta roda no ambiente de construção, não no aparelho do escritor. O runtime ES5 permanece intacto. Ainda não autoriza importar léxico externo: procedência/licença devem ser explícitas na chamada, sem rotular qualquer arquivo de terceiros como fixture CC0. Os ensaios usam exclusivamente dados próprios artificiais.


## Reprodução

Na raiz do repo, com Node moderno apenas no ambiente de construção:

```sh
node packages/experiments/lexical-index/build-stream.cjs fixture /tmp/a01-fonte.jsonl 400000
node packages/experiments/lexical-index/build-stream.cjs convert-own-fixture /tmp/a01-fonte.jsonl /tmp/a01-pacote-novo
node packages/experiments/lexical-index/test-stream.cjs
node packages/experiments/lexical-index/benchmark-stream.cjs > /tmp/a01-conversao.json
npm run build:check
```

Os destinos devem ser novos e seus diretórios pais devem existir. `fixture` e `convert-own-fixture` são comandos para a base própria de engenharia, não autorização de atribuir CC0 a outro arquivo. A API `convert(input, output, options)` exige `source:{kind,license,generator}`; importar dados externos ainda exige sua origem/licença verificadas. Cada linha contém exatamente cinco campos string: id, form, lemma, pos, features; form não vazio. Campos extras são recusados. CR/LF e última linha sem LF são aceitos; linha vazia, JSON quebrado e UTF-8 inválido falham. Normalização é a mesma limitada da prova anterior.

`source.sha256` é calculado incrementalmente sobre a representação JSON do array dos registros na ordem de entrada (não sobre os bytes NDJSON com espaços/LF). Os mesmos registros/ordem/propriedades da referência produzem o mesmo hash. O identificador do conversor muda para `a01-stream-1`; a versão de recurso padrão é `3-stream`, sem misturar o artefato com versões anteriores.

## Limites e falhas

Padrões: corridas de no máximo 262.144 bytes de registros serializados ou 2.048 linhas, até oito leitores de intercalação simultâneos, buffer de leitura de 4.096 bytes, linha de até 4.096 bytes, temporários até 268.435.456 bytes e saída até 268.435.456 bytes. Os budgets de disco contabilizam bytes realmente escritos pelo conversor; não incluem entrada original, diretórios, metadados do filesystem, journal ou reservas de quota. Um arquivo de saída adicional é aberto além dos leitores. Cada registro também precisa caber num bloco lexical; não há truncamento.

O contador de corrida cobre payload serializado. Array, objetos, strings, buffers transitórios, estruturas de ordenação e VM custam mais; por isso medimos heap/RSS e executamos sob flags de heap. Nenhum limite de payload é apresentado como teto da memória total. Não há lista de todos os arquivos/candidatos ou Set de todos os IDs em memória: corridas são endereçadas por número; IDs duplicados são detectados numa passagem ordenada.

A saída é reservada com criação exclusiva. Diretório existente é recusado, sem alteração. Dados/páginas são escritos primeiro; `manifest.partial` só vira `manifest.json` no fim. Falhas tratadas removem apenas a saída criada nesta chamada e seu diretório temporário; entrada é preservada. Teste injeta erro físico durante escrita de bloco, confere ausência de manifesto prematuro e fechamento de descritores. Isso não é uma transação do instalador: encerramento forçado do processo/queda de energia pode deixar temporários ou diretório incompleto. Não há retomada do build nem promessa de durabilidade por fsync; artefatos precisam da verificação de hash ao consumir.

A raiz continua limitada a 8 KiB; blocos/páginas mantêm limites do v2. Profundidade máxima 8 e IDs b/p de seis dígitos impõem teto explícito. Metadados de procedência, cobertura e dependências também são limitados. A callback opcional `onCheckpoint` existe apenas para observação/aborto do build; não entra no runtime nem no manifesto.

## Evidência

11 casos novos passaram: equivalência do gerador, equivalência byte a byte de 80 arquivos de dados/páginas contra `build-paged.cjs`, corridas pequenas com múltiplas intercalações, páginas densas em várias camadas, duplicatas distantes em chaves distintas, vazio/EOF, UTF-8 dividido entre buffers, limites/entrada inválida, falha de disco, proteção de saída existente, procedência e consulta final. Nos manifestos, a comparação desconsidera apenas o identificador do conversor; todo o restante, inclusive hashes/raiz, é comparado. Não é um oráculo linguístico: para as consultas, 60 resultados também foram comparados com filtro linear independente sobre os registros originais.

O runtime e seus 31 casos anteriores não foram alterados neste lote; o gerador novo teve sua equivalência ao antigo testada. `npm run build:check` aprovou os 7 arquivos gerados de produção; nenhum módulo experimental novo entra no bundle. A expansão de CI para este teste é decisão do A1 ao incorporar o lote.

## Medições de conversão

[Dados brutos](A01-MEDICOES-CONVERSAO.json), capturados em 2026-09-28T20:11:39.105Z; Node v24.19.0, linux/x64, AMD EPYC 9V74 80-Core Processor. Fonte gerada no processo pai; conversão e reabertura/consulta em processos filhos separados. Uma execução por tamanho, sem inferência estatística de velocidade.

| Entradas | Fonte NDJSON | Saída | Pico temporário | Total temporário escrito | Conversão |
| --- | --- | --- | --- | --- | --- |
| 10098 | 1089127 B | 1350236 B | 2561642 B | 5191742 B | 0.35 s |
| 400098 | 43899127 B | 54306790 B | 103001642 B | 414798298 B | 18.33 s |

| Entradas | Corridas iniciais por ID / passes de intercalação totais | Maior corrida: linhas / bytes | Leitores simultâneos | Heap amostrado máximo | RSS de pico do processo |
| --- | --- | --- | --- | --- | --- |
| 10098 | 5 / 2 | 2048 / 260096 | 5 | 13845600 B | 56840 KiB |
| 400098 | 197 / 6 | 2048 / 262144 | 8 | 17492632 B | 76868 KiB |

Os filhos usaram `--max-old-space-size=32 --max-semi-space-size=1`; o limite total informado pelo V8 foi 36700160 bytes. A entrada maior (43899127 bytes) excede esse limite de heap e concluiu sem carregar o arquivo todo na memória. Isso **não** significa usar apenas 32 MiB de RAM: RSS inclui memória nativa/VM e foi medido separadamente.

O algoritmo é síncrono no ambiente de construção; timer de amostragem não executaria durante o trabalho. A medição observa pontos de corrida e cada 2.048 escritas, podendo perder picos transitórios. O limite V8 é uma evidência adicional, não substituto da medição do processo. Espaço temporário e I/O crescem com volume, mesmo quando a corrida em RAM fica limitada.

| Entradas / consulta após reabrir | Alternativas | Leituras de páginas + dados | Bytes lidos |
| --- | --- | --- | --- |
| 10098 / CARRO | 1 | 2 + 1 | 7823 |
| 10098 / carregado | 80 | 2 + 4 | 19854 |
| 10098 / zzzz-ausente | 0 | 0 + 0 | 0 |
| 400098 / CARRO | 1 | 4 + 1 | 13827 |
| 400098 / carregado | 80 | 4 + 3 | 21857 |
| 400098 / zzzz-ausente | 0 | 0 + 0 | 0 |

As consultas quentes preservaram resultados e não acrescentaram I/O. A reabertura foi real em outro processo Node, em arquivos locais; não comprova IndexedDB persistente nem o aplicativo no navegador. A fonte é artificial; não se mediu qualidade lexical, desempenho em aparelhos ou 1 GB.

## Entrega e próximo limite independente

Arquivos novos: conversor, teste, benchmark e este relatório/JSON; única ampliação de fixture é um gerador equivalente. O formato de páginas, lookup, leitor, contratos e arquivos de A1 permanecem iguais. Publicação somente no PR #188 para revisão; incorporação na main fica com A1. Reversão: retirar esse incremento do experimento; nenhum formato do escritor ou banco foi migrado.

Esta prova resolve a retenção integral no conversor para o recorte NDJSON. O limite que continua na ponte de A02 é o envelope plano de instalação: o relatório de paginação já quantifica esse custo. Não escondê-lo nem contorná-lo aumentando metadataChars. A1 decide a evolução do armazenamento; A2 pode seguir com verificação de procedência/licença e adaptação de um recorte lexical externo aprovado, preservando este conversor e sua referência de equivalência.

Plano v3: 10/24 DONE na base consultada | entrega +0 | próximo A02 (ponte), piloto externo após licença | publicação: incremento isolado do PR #188 | limite: envelope de instalação e dados reais ainda não validados.
