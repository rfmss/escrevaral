# A01 — segunda prova: paginar o próprio índice

Base da prova: PR #188, commit `1ae834fbd675e1bed27acd42ac930082791ce7a2`. Main consultada: `63acd3c08ebaa65dc83dcf4df2b8e21fec932218` (A02 parcial, transporte de arquivo v6-32). Na conferência inicial não havia comentário no PR. Na retomada de 28/09, a main `494b0f1` já incorporava a primeira prova, com aceite em `docs/recursos/REVISAO-A1-A01-2026-09-28.md`. Li essa revisão e a atualização do contrato: A1 aceita o primeiro lote e solicita expressamente esta paginação. Rafael pediu continuar; este lote permanece experimental, sem mudar contratos ou arquivos de produção.

## Decisão local

A primeira prova carrega o índice inteiro. Para retirar esse custo crescente da inicialização, comparar formato v1 com uma árvore de páginas v2: raiz pequena no manifesto, descritores de páginas com hash/intervalo e folhas de dados já conhecidas. Uma consulta percorre apenas intervalos que contêm sua chave, inclusive todos os intervalos sobrepostos quando uma chave densa ocupa várias páginas.

Alternativas consideradas: prefixo fixo não limita prefixos densos; índice plano mantém custo linear de início; trie comprimida/binário acrescenta codificação e depuração antes de haver medida que justifique. Escolhida árvore ordenada de páginas JSON limitadas a 4 KiB, reutilizando validação, cache, leitor e cancelamento. O formato v1 permanece aceito para comparar resultados.

É proposta experimental de formato, não API aprovada do produto. O conversor continua em memória no ambiente de construção; conversão streaming é outra tarefa. Nenhum léxico externo é incorporado. Não há preparação durante digitação nem instalação de 1 GB.

## Contratos a preservar

Raiz pequena, páginas e dados limitados antes de parse; profundidade, número de páginas e dados por consulta limitados separadamente. Cache compartilhado entre páginas e dados; descritores descendentes vinculados ao hash da página pai. Erros e limites produzem incompletude, nunca ausência. Mesmo pedido/identidade, versões fixas, posições literais e todas as ambiguidades da primeira prova.

O leitor experimental recebe o descritor como quinto argumento opcional em `readBlock(packageId, version, blockId, done, descriptor)`. Isso permite ao hospedeiro verificar a página sem guardar o índice inteiro. Não altera o leitor A02 do A1: uma futura ponte traduz para `{id, version, block:{id, bytes, sha256}}`, fixa tickets e decodifica UTF-8 estritamente. O manifesto da raiz exige procedência/integridade confiável.


## Reprodução e verificações

```sh
npm ci --ignore-scripts
node packages/experiments/lexical-index/test.cjs
node packages/experiments/lexical-index/test-paged.cjs
node packages/experiments/lexical-index/benchmark-paged.cjs > /tmp/a01-paginado.json
npm run build:check
```

22 casos anteriores continuam aprovados, incluindo 222 consultas da referência linear e sintaxe ES5. Os 9 casos novos passaram: 221 consultas comparadas com o índice plano e uma referência independente; árvore de quatro níveis com páginas pequenas; chave densa em múltiplas páginas; cache mínimo/quente; página ausente/corrompida; página com hash válido mas estrutura inválida; limites; compartilhamento/cancelamento/identidade; reabertura de arquivos locais. São execuções de engenharia, não 443 fenômenos linguísticos distintos. O build da base do PR confere 7 arquivos; nenhum módulo foi incluído no aplicativo.

O formato v2 usa `root` no lugar de `index`, descritores `kind:index|data`, `level` decrescente e intervalos completos. Hash faz parte da identidade de cache; nunca reutilizar outra versão/payload pelo simples ID do bloco. V1 e v2 são formatos de pacote, não versões intercambiáveis do mesmo recurso.

Limites adicionais: raiz aceita até 8 KiB de string UTF-16, profundidade até 8, até 32 páginas e 32 blocos de dados por pedido. Para rejeitar catálogo grande **antes do parse**, a medição v2 configura `maxIndexDecodedBytes:8192` como limite agregado dos manifestos. O padrão de 1 MiB permanece para a comparação v1; `maxRootDecodedBytes` sozinho valida depois do parse. Páginas e dados compartilham o mesmo cache de até 64 KiB de strings/16 unidades e os limites de 4 KiB UTF-8/8 KiB UTF-16 por bloco. Objetos/transientes/VM continuam fora desse contador de cache.

## Medições

[Dados brutos](A01-MEDICOES-PAGINADAS.json), medidos em 2026-09-28T13:29:39.064Z, Node v24.19.0, Linux/x64, AMD EPYC 9V74 80-Core Processor. Conversão e cada cenário executam em processos separados. Sete pares frio/quente; cache do SO não limpo. As medianas abaixo incluem timers. Não comparar tempos históricos como ensaio controlado entre versões; não houve homologação de aparelhos.

| Entradas | Raiz UTF-8 / string UTF-16 | Índice plano equivalente UTF-8 | Níveis / páginas / dados | Dados UTF-8 | Páginas UTF-8 |
| --- | --- | --- | --- | --- | --- |
| 10098 | 818 / 1624 B | 57831 B | 2 / 18 / 316 | 1281137 B | 68278 B |
| 100098 | 818 / 1624 B | 583275 B | 3 / 180 / 3219 | 12804040 B | 696918 B |

| Entradas / consulta | Páginas + dados lidos | Bytes de páginas + dados | Cache UTF-16 retido | Fria / quente (ms) |
| --- | --- | --- | --- | --- |
| 10098 / CARRO | 2 + 1 | 5943 + 1880 | 15644 B | 9.84 / 8.41 |
| 10098 / carregado | 2 + 4 | 5943 + 13911 | 39706 B | 18.75 / 15.42 |
| 10098 / zzzz-ausente | 0 + 0 | 0 + 0 | 0 B | 1.24 / 1.21 |
| 100098 / CARRO | 3 + 1 | 7176 + 2630 | 19610 B | 12.29 / 10.41 |
| 100098 / carregado | 3 + 4 | 7176 + 14701 | 43752 B | 20.25 / 17.60 |
| 100098 / zzzz-ausente | 0 + 0 | 0 + 0 | 0 B | 1.24 / 1.19 |

A raiz ficou em 818 bytes nas duas amostras. O ganho é reduzir o catálogo inicial; o custo é ler páginas intermediárias nas consultas frias e armazenar descritores extras em disco. As 80 alternativas artificiais foram preservadas; cache quente não fez nova leitura. Ausência fora do intervalo da raiz não abriu página alguma. Isso não prova RAM constante para o aplicativo inteiro nem acervo de 1 GB.

No processo de 100.098 entradas/chave densa: heap baseline 7180600 B; após criar motor/GC 6995048 B; após primeira consulta quente/GC 7275816 B; máximo amostrado 9197624 B; pico RSS do processo 46676 KiB. Amostra a cada 1 ms mais pontos explícitos; pode perder picos transitórios. JSON separa leitura, hash, decodificação, busca, RAM observada e conversão.

## Limite concreto encontrado na ponte A02

A paginação lexical resolve o índice que o motor carrega. **O envelope do armazenamento A02 continua plano**, com um descritor por bloco. Na main `63acd3c`, `read()` busca o registro da versão, cujo manifesto contém a lista inteira, e encontra o bloco percorrendo essa lista. Assim, ligar os módulos diretamente pode trazer novamente metadados proporcionais ao acervo a cada leitura.

Para 10098 entradas, um envelope plano no esquema atual, enumerando páginas e dados desta prova, mede 35527 bytes UTF-8 / 35527 caracteres JSON. Para 100098 entradas, um envelope plano no esquema atual, enumerando páginas e dados desta prova, mede 360417 bytes UTF-8 / 360417 caracteres JSON. Essa contagem é gerada na conversão, sem instalar no banco. Não inclui a inclusão/distribuição da raiz como um bloco separado, recibos, cópias nem overhead de objetos; não é ocupação medida de IndexedDB.

Proposta ao A1: manter limite explícito do envelope na primeira integração pequena; para maior volume, avaliar metadados de bloco endereçáveis separadamente do registro da versão e ativação que não dependa de materializar todo o catálogo por consulta. Não elevar `metadataChars` como substituto da medição. Essa mudança pertence à frente A02 e não foi implementada pelo A2.

O leitor local v6-32 já aceita faixa e descritor limitado, mas não verifica hash por si: a instalação/store faz isso. A ponte de consulta precisa usar o caminho verificado, fixar ticket, validar UTF-8 e preservar bloqueio quando o transporte não confirma término físico. Não basta renomear campos.

## Estado e próxima ação

Esta extensão está implementada/testada apenas no experimento do PR #188; sem alterações de produto, novo dado externo ou incorporação da paginação na main. A primeira prova (`1ae834f`) já foi aceita e incorporada isoladamente por A1 em `494b0f1`; os registros históricos permanecem em ENTREGA-A2-A01.md e no aceite do A1. O aceite anterior não se estende automaticamente ao novo formato v2. Conversor streaming e licença do piloto externo continuam pendentes. Arquivos produzidos para medir são temporários; somente código, fixture e relatórios ficam no Git.

Próxima decisão conjunta: A1 escolhe um pacote pequeno para a ponte com limites do envelope atual ou delimita a evolução de metadados A02; A2 mede/converte o recorte escolhido. O formato paginado é proposta, ainda não contrato estável.

Plano v3: 10/24 DONE na árvore consultada | entrega +0 | próximo A02 (revisão da paginação/ponte) | publicação: atualização isolada do PR #188 | limite: metadados de instalação e conversão de grande volume.

Entrega sincronizada sobre `494b0f1a8ee2566c9846097c2578904d7d206315`, preservando os arquivos da primeira prova e todos os incrementos do A1. Nessa base, `node tests/a01-lexical.cjs` (22 casos/222 consultas), `node packages/experiments/lexical-index/test-paged.cjs` (9 casos/221 consultas), `npm run build:check` (7 arquivos) e `git diff --cached --check` passaram novamente após a aplicação do lote. O PR continua aberto para transportar somente a extensão pendente em relação à main. Ao aceitar o lote, A1 deverá incluir `test-paged.cjs` na rotina de CI que hoje executa apenas a primeira suíte. Não alterei seu wrapper em `tests/`.
