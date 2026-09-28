# A01 — consulta lexical por blocos, prova isolada

Experimento do ASTRA 2, entregue para revisão do ASTRA 1. A extensão [de paginação](../../../../docs/recursos/A01-PAGINACAO.md) acrescenta formato v2 e preserva a comparação v1. Não integra o aplicativo, o cofre, o instalador ou o build. Não implementa triagem nem preparação durante a digitação. Não envia texto à rede.

Comprova uma consulta explícita com índice ordenado por chave completa, blocos limitados por bytes/linhas, versões fixas, ambiguidades preservadas e resultado vinculado ao pedido. Não deduz classe em contexto, subordinação ou definições de dicionário.

## Executar

Na raiz do repositório, com Node moderno (medido em 24.19.0):

```sh
npm ci --ignore-scripts
node packages/experiments/lexical-index/test.cjs
node packages/experiments/lexical-index/test-paged.cjs
node packages/experiments/lexical-index/build.cjs /tmp/a01-pacote 10000
node packages/experiments/lexical-index/benchmark.cjs > /tmp/a01-medicoes.json
npm run build:check
```

Somente o teste de sintaxe usa a dependência Acorn já existente na raiz. Conversor, leitor Node e benchmark usam módulos nativos. O runtime `normalize.js` + `lookup.js` é CommonJS em sintaxe ES5, sem DOM, storage, rede, Promise, fetch ou Worker. A1 precisará fornecer empacotamento e leitor para o navegador; o leitor Node não faz parte da promessa de compatibilidade.

## Arquivos e dados

- `fixture.cjs`: 18 entradas próprias para engenharia, mais formas artificiais de estresse. As 80 alternativas de “carregado” são deliberadamente artificiais. Não medir precisão linguística com elas.
- `build.cjs`: conversor desta fixture; ordena pela chave e ID, divide inclusive chaves densas, registra SHA-256, bytes e intervalos. Rejeita entrada ou índice acima do limite, sem truncar. Mantém o conjunto todo em memória durante a conversão; não é conversor de 1 GB em streaming.
- `normalize.js`: minúsculas e decomposição explícita de 23 letras latinas acentuadas. Preserva acentos; avó e avô são diferentes. Não é implementação completa de normalização Unicode: não reordena marcas combinantes e não cobre todas as letras. O ID da normalização faz parte do pacote.
- `lookup.js`: runtime de consulta e cache.
- `reader.cjs`: hospedeiro Node com leitura de arquivo limitada a bytes declarados + 1, UTF-8 válido e SHA-256 verificado. Pode simular atraso/cancelamento nos testes.
- `test.cjs`: referência linear independente, baseada nas entradas originais e na normalização NFD nativa de Node; não reutiliza índice nem normalizador do runtime.
- `benchmark.cjs`: conversão e cenários em processos separados; não conserva a base inteira no processo de consulta.

Os **dados próprios gerados pela fixture**, exclusivamente, são dedicados sob CC0-1.0: <https://creativecommons.org/publicdomain/zero/1.0/>. Isso não relicencia o repositório nem dados externos. O conversor rotula a fonte como própria; não o use para importar dados de terceiros sem implementar e revisar metadados/licença específicos.

## Fronteira com o hospedeiro

```js
var engine = require('./lookup').create({
  manifests: [manifestJsonString],
  readBlock: readBlock,
  isCurrent: isCurrent
});
var handle = engine.lookup(request, function (result) { /* entregar se vigente */ });
handle.cancel();
engine.dispose();
```

`readBlock(packageId, version, blockId, done, descriptor)` retorna `{cancel:function(){}}`. `done(error, payload)` recebe `{text, byteLength, sha256}`. O hospedeiro deve verificar **os bytes reais** contra o manifesto confiável; o runtime confere a declaração e a estrutura, mas não executa criptografia. Hash sem procedência confiável não autentica a origem. O exemplo Node faz a verificação real.

O leitor entrega uma string imutável, não uma visão sobre buffer reutilizável. Depois de entregar, pode liberar seus buffers. O runtime retém a string no cache ou em callback pendente, e descarta arrays decodificados após cada bloco. Uma leitura física pode atender vários consumidores: cancelar um não cancela os outros; o último pede cancelamento físico. O leitor deve concluir exatamente uma vez, inclusive após cancelamento. A vaga física permanece ocupada até essa confirmação; uma tentativa sobre a mesma leitura em encerramento recebe falha `read-draining`. Resposta tardia de um pedido cancelado não preenche cache nem chega ao consumidor; callback duplicado é ignorado. Se o leitor nunca concluir, a vaga não será artificialmente liberada. O consumidor deve liberar handles/resultados de que não precisa; a memória desses objetos também conta no produto.

`isCurrent(identity)` é obrigatório e deve ser puro, rápido e não lançar exceções. O hospedeiro compara requestId, documento, registro, revisão, **geração monotônica do texto**, escopos e versões antes da entrega. Comparar apenas a string é insuficiente após editar/desfazer. A1 ainda fará a ponte com a identidade real do editor. Para exibir/localizar um achado, o consumidor também confere o trecho literal na posição original.

O pedido v1 contém `requestId`, `documentId`, `recordId`, `revision`, `textGeneration`, `engineId`, `engineVersion`, `resources:[{packageId,version}]`, `snapshot`, `baseOffset`, `scope:{start,end}` e `contextScope:{start,end}`. Escopos são UTF-16, fim exclusivo; contextScope delimita exatamente o snapshot. Não separar par de surrogates. A consulta conserva o trecho selecionado, não o snapshot inteiro. Há exemplo completo no benchmark.

Todas as versões do catálogo são imutáveis na instância. Dependências usam versão exata; conflitos/ciclos não escolhem outra versão silenciosamente. Atualizações requerem outra instância/conjunto resolvido, tarefa de A02.

## Resultados e limites

| Situação | Resultado |
| --- | --- |
| Uma ou mais entradas | `encontrado`, `complete:true`, todas as alternativas dentro do pacote consultado |
| Nenhuma entrada após consulta completa | `ausente-no-pacote`, `complete:true`; não significa ausência na língua |
| Pacote/bloco ausente | `indisponivel`, `complete:false` |
| Corrupção, incompatibilidade, ciclo, limite de blocos/achados/leituras | `falha`, `complete:false`, sem resultados parciais |
| Cancelamento, descarte por identidade antiga ou dispose | Nenhum callback de resultado; contadores registram descarte/cancelamento |
| Pedido/manifesto inválido ou excesso de pedidos simultâneos | Exceção síncrona; hospedeiro deve tratar sem apresentar ausência |

Resposta inclui identidade, scope, snippet literal, chave, razão, candidatos e cobertura por pacote visitado. Se a resolução de dependências falhar antes de terminar, cobertura pode ficar vazia. Cancelamento silencioso é uma proposta para o contrato v0, não uma alteração unilateral do produto.

Padrões provisórios: bloco ≤ 4.096 bytes UTF-8 e ≤ 8.192 bytes de string UTF-16; ≤ 64 linhas; soma dos manifestos ≤ 1.048.576 bytes de string; cache ≤ 65.536 bytes de payload e 16 blocos; ≤ 8 pedidos, 4 leituras físicas, 32 blocos/pedido, 256 candidatos, 8 manifestos; snapshot ≤ 4.096 unidades e chave normalizada ≤ 128 unidades UTF-16. O índice v1 fica inteiro em memória; no formato v2 somente a raiz e páginas consultadas são carregadas. O limite é verificado antes do parse, mas não representa a RAM dos objetos resultantes.

**`maxCachePayloadBytes` não é teto da RAM total.** `residentPayloadBytes` e `peakCachePayloadBytes` contabilizam somente strings mantidas no cache após evicção. Índices, objetos do parser, candidatos, callbacks, buffers do leitor e a própria VM ficam fora dessa conta; o benchmark observa também memória real do processo. `indexStringBytes` estima a representação textual, não o heap do índice. Buffers podem coexistir com strings. Em leitura fria há duas decodificações: validação antes do cache e consulta por consumidor; isso está incluído no tempo medido.

Cada bloco produz uma pausa no fluxo assíncrono. `maxSliceMs:4` apenas registra excessos na decodificação e busca: não interrompe JSON.parse nem garante fatias de 4 ms em qualquer máquina. Resolução do índice, abertura do catálogo, hash do hospedeiro e alocações também têm custo. O leitor demonstrativo procura o descritor linearmente no catálogo, custo pequeno nesta escala mas a rever antes de crescer.

## Evidência e próximos passos

22 casos anteriores (222 consultas de referência) e 9 casos de paginação (221 consultas comparadas com v1 e referência independente). Reabertura local sem rede, bytes inválidos, ambiguidades, Unicode, versões, dependência compartilhada e descarte estão exercitados. O teste de cache frio/quente não depende de preparação.

Veja [comparação](../../../../docs/recursos/A01-COMPARACAO.md), [medições](../../../../docs/recursos/A01-MEDICOES.json) e [entrega](../../../../docs/recursos/ENTREGA-A2-A01.md). As medições são Node/Linux; não certificam navegador ou aparelho. Não foi importado léxico externo nem demonstrado acervo de 1 GB. A paginação agora tem prova até 100.098 entradas. Antes da escala de 1 GB: orçamento dos metadados de instalação/heap e conversor streaming, além de A02 para persistência/recuperação. Teste visual/aparelhos não é gate desta entrega.

## Formato paginado experimental

`build-paged.cjs`, `test-paged.cjs` e `benchmark-paged.cjs` reproduzem a segunda prova. `build-paged.cjs /tmp/a01-paginado 100000` gera dados e páginas sem incorporar arquivos gerados no repo. O runtime aceita schemaVersion 1 e 2; use outra versão de recurso quando mudar o formato. O quinto argumento do leitor é uma cópia do descritor de bloco verificado na página pai; leitores v1 que usam somente quatro argumentos continuam funcionando para v1.

No caminho v2, configure `limits:{maxIndexDecodedBytes:8192}` para limitar a soma das raízes antes de JSON.parse. Há também limites de 32 páginas por consulta, profundidade 8 e raiz de 8 KiB; os demais limites continuam compartilhados. Leia o relatório de paginação para os custos de páginas intermediárias e o crescimento do envelope A02, que a paginação lexical sozinha não resolve.
