# A02 parcial — descritores por chave e cabeçalhos compactos

## Base, decisão e estados

Base main `2521956ba78d802a9d13c8320b19a0a189000c2c`, conferida novamente após a pausa. Execução e publicação seguem a transferência de coordenação para A2; Rafael reiterou atualizar o plano a cada avanço. Produto permanece v6-32.

A [decisão de arquitetura](DECISAO-A02-METADADOS-2026-09-29.md) foi registrada antes da implementação: usar registros por chave do IndexedDB, em vez de outra árvore de catálogo ou aumento de metadataChars. `addressed-store.js` implementa a prova em banco separado. `store-reader.js` aceita modo explícito `addressed:true`, usando cabeçalho e leitura verificada por chave; o modo v1 continua disponível. Sem mudanças nos stores, bundles ou dados do aplicativo publicado.

Estudado/decidido: formato, atomicidade, migração e limites. Implementado/testado: store experimental, retomada por ordinal e consulta ligada à ponte/lookup. Publicação na main: `44c92d6043163dd45da491a47e22aa6dd6f875de`. [CI](https://github.com/rfmss/escrevaral/actions/runs/36646518644) e [Pages](https://github.com/rfmss/escrevaral/actions/runs/36646517577): completed/success. Árvore publicada idêntica à testada: `aa23a7fd0d028c546ed6bb30697eab17ec8c7706`. Integração de produto e conclusão de A02: pendentes.

## Contrato implementado

`addressed-store.create({indexedDB,digest,limits})` exige capacidades injetadas e limites inteiros positivos: blockBytes, packageBytes, blocks, headerChars e dependencies. Sem abrir banco na criação. O banco `escrevaral-pacotes-addressed-experiment`, versão física 1, contém headers, descriptors, receipts, blocks e active. Envelope lógico schemaVersion 2 tem exatamente schema, schemaVersion, id, version, dependencies, blockCount, totalBytes e catalogHash. Não contém lista de blocos. O limite headerChars cobre o manifesto canônico; token, estado, cursor e contadores acrescentam overhead pequeno separado, medido abaixo.

`stage` reserva/retoma versão com manifesto canônico idêntico e devolve ticket. `append(ticket,ordinal,descriptor)` grava um descritor canônico e avança cursor, bytes e hash da cadeia na mesma transação. Repetição exata é idempotente; ordinal divergente, ID duplicado ou hash/soma final incorretos falham. O hash acontece fora da transação; antes de gravar, cabeçalho/cursor são lidos novamente, impedindo que duas instâncias sobrescrevam a mesma posição.

`put` verifica tamanho/hash, depois grava payload, recibo e contadores atomicamente. Repetir uma gravação confirmada não infla contagem. `snapshot` lê um cabeçalho por ticket. `describe` lê cabeçalho, um descritor e seu recibo, sem payload; o recibo indica gravação lógica confirmada, não revalidação dos bytes. São primitivas para retomada limitada, não um instalador de arquivos completo.

`activate` exige cadeia, contagens e soma completas e dependências prontas. Usa contadores mantidos nas transações, sem varrer todos os recibos; estado e ponteiro ativo mudam atomicamente. `active` resolve uma versão explicitamente, sem escolher automaticamente a mais recente. Versões prontas são imutáveis; ativar uma atualização preserva o ticket anterior. A ponte fixa tickets antes da consulta e não acompanha o ponteiro ativo.

`readVerified(ticket,id,{bytes,sha256},done)` confere cabeçalho pronto e o descritor pontual contra o esperado, lê um bloco e revalida seu hash fora da transação. A ponte só declara payload depois dessa verificação, do UTF-8 estrito e do comprimento decodificado. Cada leitura de bloco consulta exatamente dois registros de metadados e um payload. Nenhum getAll/cursor faz parte desses caminhos.

Todos os métodos operacionais recebem callback e retornam cancel(). Uma operação física por instância; BUSY não é ausência lexical. Cancelar durante hash descarta a entrega e retém a vaga até callback. Uma transação já concluída pode ter efeito persistido, mesmo que o cancelamento seguinte descarte sua resposta: retomar pelo estado confirmado. close() cancela e impede novas operações. Callback de digest é aceito uma vez; digest confiável é obrigatório, não há caminho que aceite bytes sem hash.

## Evidências

15 casos novos em `test-addressed-store.cjs`: cadeia/cabeçalho, retomada e idempotência, descritor/recibo pontuais, catálogo alterado/duplicado/incompleto, limites/conflitos, versões anteriores, quota/rollback em catálogo/recibo/ativação, duas instâncias com hashes concorrentes, cancelamento de catálogo/payload/leitura, dependências/tickets, descritor forjado/corrupção, acessos por chave e ES5/API ausente/isolamento. Todos passaram. Os 15 casos anteriores da ponte também passaram após a mudança de modo.

[Dados brutos](../recursos/A02-EVIDENCIA-METADADOS.json): fixture própria/artificial com 138 entradas produziu 6 descritores; 5.098 entradas produziram 170. Ambos os ensaios usaram montagem lexical padrão, fecharam/reabriram a conexão e proibiram getAll/openCursor. A abertura da ponte leu um cabeçalho e reteve zero descritores em ambos. Os manifestos retidos mediram 227 e 230 caracteres; o maior registro de metadados devolvido pelo banco mediu 436 e 445 caracteres, respectivamente.

A consulta fria da chave densa carregado preservou suas 80 alternativas: no pacote menor, 4 payloads e 8 registros de metadados; no maior, 5 payloads e 10 registros. O número de páginas lexicais pode aumentar com a árvore, mas cada acesso ao catálogo de instalação continua pontual. Esses tamanhos são caracteres JSON observados, não bytes de heap nem certificação de RAM constante do navegador.

A implementação foi analisada como ES5. `npm run build:check` aprovou os 7 arquivos de produção. Wrapper essencial ampliado para cinco suítes: 72 casos aprovados no CI (22 + 9 + 11 + 15 + 15). Plano e Jornada regenerados; referências locais e geração determinística conferidas. Nenhuma dependência adicionada; produção permanece sem importar os módulos experimentais.

## Limites preservados

Os testes usam fake-indexeddb em memória, SHA-256 do Node e um montador de catálogo apenas no teste, que mantém a fixture inteira. Não demonstram pipeline de instalação por arquivo, conversão de catálogo grande em memória limitada, persistência física entre processos, desempenho em aparelho ou 1 GB. A medição prova quantidade/tamanho dos registros entregues à aplicação, não o custo interno do índice do banco.

A cadeia de descritores tem formato explicitamente definido na decisão; implica um hash/transação por descritor e mais I/O. Não oferece prova de autenticidade: o cabeçalho/hash final deve vir de fonte aprovada. Metadados locais e contadores são confiados após suas transações; um atacante capaz de reescrever a origem não está isolado por este banco. Corrupção de payload é detectada na leitura. Ativação não refaz todos os hashes nem reinspeciona fisicamente cada recibo.

Sem migração automática, coleta de versões ou descarte de rascunhos neste store. Um catálogo inválido já confirmado parcialmente não é reescrito silenciosamente; limpeza/reinício precisam de fluxo explícito futuro. A migração proposta é reinstalação validada e opcional, mantendo v1 até sucesso. A fábrica antiga e seu catálogo plano continuam intactos; a melhoria só se aplica ao novo modo experimental.

## Reprodução, reversão e próximo incremento

```sh
node packages/experiments/lexical-index/test-addressed-store.cjs
node packages/experiments/lexical-index/test-store-reader.cjs
npm run build:check
```

Reversão por commit retirando o novo store/teste e o modo addressed da ponte, restaurando o wrapper anterior. O banco experimental não é aberto pelo produto; nenhuma migração do manuscrito ocorre.

Próximo A02: gerar o catálogo de descritores em arquivo sequencial no conversor externo, com hash final, limites e raiz lexical transportável; criar coordenador de instalação por unidades/retomada usando stage/append/describe/put/activate. Provar o caminho de arquivos ao store, cancelar/retomar e reabrir sem depender da fixture integral do teste. Depois integrar catálogo/controles explícitos, alternativa de capacidade e comprovar persistência física offline. Não repetir o store nem a ponte já entregues.

Plano v3: 10/24 DONE | entrega +0 (A02 parcial: metadados por chave) | próximo A02 (catálogo em arquivo e instalação sequencial) | publicação: main 44c92d6, CI/Pages success | limite: produtor/coordenador, integração e persistência física. Fundação 5/5; compatibilidade 4/4; acervo 1/3; motores 0/8; experiência 0/2; revisão 0/2.
