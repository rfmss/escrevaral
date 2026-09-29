# A02 — metadados endereçados, decisão e escopo

Base: main `2521956ba78d802a9d13c8320b19a0a189000c2c`. A ponte anterior fixa versões e verifica UTF-8, mas captura um catálogo plano; o store v1 também relê esse catálogo em cada consulta. Próximo incremento autorizado: remover essa retenção na prova, antes de integrar instalação ao produto.

## Alternativas e decisão

Catálogo paginado em blocos serviria a vários transportes, mas exigiria outra árvore de busca só para localizar descritores dentro do IndexedDB. Registros de descritores por chave aproveitam o índice já oferecido pelo banco; escolhemos essa alternativa para persistência. A árvore lexical continua responsável por encontrar palavras. Aumentar metadataChars mantém o problema; modificar/migrar imediatamente o banco publicado acrescentaria risco sem consumidor de produto.

Prova separada em `packages/experiments/lexical-index/`, banco `escrevaral-pacotes-addressed-experiment`, versão física 1, envelope experimental schemaVersion 2. Stores: cabeçalhos compactos, descritores, recibos, blocos e ponteiros ativos. Sem lista de blocos no cabeçalho, sem getAll/cursor para consultar ou ativar. Cada operação lê quantidade delimitada de registros; instalação é sequencial e incremental.

## Integridade e retomada

Cabeçalho aprovado declara ID/versão, dependências fixadas, quantidade de blocos, soma de bytes e hash final de uma cadeia ordenada de descritores. Descritor canônico contém apenas id, bytes e sha256. Cadeia começa em 64 zeros; próximo hash é SHA-256 dos bytes ASCII de `scrvrl-descriptor-chain-v1\n` + hash anterior + `\n` + JSON canônico do descritor. O hash final é produzido no build e pertence à fonte confiável; hash sozinho não prova autenticidade.

Um descritor por chamada/transaction. Ordinal, soma e hash corrente ficam no cabeçalho; contadores e descritor são gravados atomicamente. Repetição exata de um ordinal confirmado é idempotente; mesma posição divergente ou ID duplicado em outra posição falha. Retomada usa ordinal/hash confirmados, sem lista de todos os registros. Concorrência entre instâncias exige conferir novamente o cursor na transação de escrita após o hash; cursor alterado produz conflito, não sobrescrita.

Payload passa por tamanho/hash antes da gravação; recibo e contadores são atômicos e repetição não infla contagem. Ativação exige catálogo completo com hash/soma conferidos, todos os recibos contabilizados e dependências prontas; troca de estado/ponteiro é atômica. A versão anterior permanece acessível. Uma consulta confere ticket, estado e descritor pontual contra o descritor lexical esperado, lê somente o bloco e revalida hash. O banco local/metadados não são fronteira contra atacante com escrita na origem; corrupção de payload continua detectada na leitura.

## Limites e compatibilidade

ES5/callbacks, uma operação física por instância. Não manter transação aberta aguardando hash. Cancelar durante hash retém a vaga até callback; cada commit tem efeito explícito, não prometer desfazer transação já concluída. Sem Promise/TextDecoder obrigatórios no módulo; IndexedDB, ArrayBuffer/Uint8Array e digest confiável são capacidades injetadas desta prova opcional.

Custo: cabeçalho/dependências limitados, descritor único, payload limitado; objetos e cópias continuam adicionais. A cadeia requer um hash e transação por descritor: memória previsível troca por I/O; não é promessa de instalação rápida para 1 GB. Medir acessos/bytes de metadados em pacotes de tamanhos distintos. Ferramenta de produção do catálogo em disco, instalador de fluxo, coleta/descarte, interface e persistência física entre processos ainda não são entregas deste lote.

## Migração e reversão

Não abrir nem migrar banco de manuscritos ou o banco v1 de pacotes. Esta prova vive fora do bundle, sem download automático. Migração futura será explícita por reinstalação validada no novo formato, mantendo v1 disponível até sucesso; não copiar uma lista inteira para RAM para simular migração incremental. Reversão remove módulos/testes experimentais, sem mudança em dados do escritor.

## Aceite do incremento

Provar instalação/retomada, catálogo alterado/duplicado/incompleto, quota/rollback, concorrência, versão anterior, cancelamento durante hash, leitura/abertura sem catálogo integral, dependências, corrupção e ligação com ponte/lookup. Evidências e publicação serão registradas na entrega; A02 continua TODO.
