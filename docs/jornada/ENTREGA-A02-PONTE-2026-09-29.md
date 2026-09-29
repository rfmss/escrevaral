# A02 parcial — ponte entre armazenamento e consulta lexical

## Base, decisão e alcance

Main conferida: `b72c00dc89180eb6d2cb4ac1d02d1e9c1caec5f8`. Rafael autorizou A2 a assumir a continuidade em 28/09 e reiterou execução autônoma e atualização do plano a cada avanço em 29/09/2026. Esta entrega conecta o armazenamento existente à consulta paginada em prova isolada; não instala dados reais no aplicativo nem encerra A02. Produto permanece v6-32.

Escolha: adaptador experimental com store injetado, sem modificar o banco nem a API síncrona do cofre. Alterar já `store.read()` para retornar descritores exigiria novo contrato de produção; duplicar hash no adaptador adicionaria trabalho e dependência. A ponte fixa o catálogo verificado por `inspect`, confronta o descritor lexical com tamanho/hash desse catálogo e usa `store.read()` para revalidar os bytes. A dependência de confiança é explícita: o store injetado precisa cumprir seu contrato de integridade, propriedade dos buffers e conclusão física.

A captura do catálogo plano tem limite deliberadamente pequeno. Ela permite provar a ligação e seus erros agora, mas não resolve escala: `inspect` e `read` do store v1 ainda materializam o registro completo da versão. Não aumentamos metadataChars nem anunciamos orçamento de RAM total.

## Implementação e contrato

`packages/experiments/lexical-index/store-reader.js` exporta `open(options, done)`, que retorna `{cancel()}`. Recebe uma instância dedicada de `createPackageStore` e `resources:[{packageId,version,ticket}]`. O ticket vem da instalação ou de uma seleção anterior explicitamente resolvida; a ponte não consulta `active()` e não muda versões durante a consulta. Copia apenas campos limitados dos pedidos. Abertura inspeciona versões em sequência, exige estado ready e confere dependências fixadas. Erros de abertura chegam em callback; opções inválidas falham sincronamente e devem ser capturadas pelo futuro consumidor do produto.

O resultado oferece `readBlock(packageId,version,blockId,done,expected)`, `close()` e `stats()`. A assinatura atende ao quinto argumento de descritor do lookup paginado. O catálogo interno copia id, bytes e hash; não guarda o envelope inteiro, recibos ou payloads. Uma leitura só começa se o tamanho e hash esperados coincidirem com o catálogo fixado. O store verifica os bytes; a ponte exige tamanho exato, decodifica UTF-8 estrito e confere comprimento UTF-16 antes de entregar string imutável. O hash retornado é o descritor confrontado e verificado pelo store, nunca uma alegação calculada a partir do pedido sem vínculo.

`utf8.js` implementa decodificação limitada em ES5. Preserva NUL, BOM, acentos e forma decomposta; recusa sequências truncadas, continuações inválidas, representações excessivamente longas, substitutos isolados e valores fora do intervalo Unicode. Não normaliza o texto. Implementação própria guiada pelas seções 3–4 da [RFC 3629](https://www.rfc-editor.org/rfc/rfc3629), consultada durante a implementação; não foi copiado um decodificador externo. Não requer TextDecoder, Promise, fetch ou AbortController. ArrayBuffer/Uint8Array continuam requisitos desta capacidade opcional; ausência dessas APIs não bloqueia o editor.

Fila: uma operação física por instância, início/entrega assíncronos mesmo com store síncrono, limite de pendentes contando ativa e aguardando. Cancelar um pedido enfileirado não toca o store. Cancelar o ativo solicita interrupção, descarta sua resposta e conserva a vaga até o callback físico. Duplicatas são ignoradas. Se cancel() lançar ou o store nunca responder, a ponte não presume conclusão e não inicia outra operação. Não há timeout que libere orçamento sem confirmação física.

`close()` cancela leituras, esvazia catálogo e recusa pedidos novos; não fecha o store emprestado. O hospedeiro fecha seu store depois da drenagem e não compartilha essa instância com instalação/outras operações enquanto a ponte a utiliza. Não há orçamento global entre instâncias/abas. Exceção síncrona de um método do store é tratada como falha da operação; pelo contrato, o hospedeiro não deve lançar depois de iniciar I/O sem garantir sua conclusão.

Erros conservam código/nome original; ausência ou corrupção nunca produzem `ausente-no-pacote`. Códigos como BLOCK_UNAVAILABLE, INTEGRITY_FAILED ou STORAGE_UNAVAILABLE chegam ao lookup como falha incompleta, sem candidatos parciais. A apresentação amigável desses erros pertence à integração futura.

## Limites padrão

Até 8 pacotes, 128 descritores somados, 32.768 caracteres de metadados inspecionados, 4.096 bytes por bloco codificado, 8.192 bytes de payload UTF-16 decodificado e 8 pedidos pendentes. Limites configuráveis exigem inteiros positivos; nomes desconhecidos falham. A quantidade de descritores é conferida antes da cópia; o tamanho do envelope é conferido após sua materialização por inspect. Objetos, strings intermediárias, buffers do store, hash e VM têm custos adicionais; nenhum desses limites certifica RAM total.

## Verificações e evidência

15 casos novos passaram em `test-store-reader.cjs`, incluindo 2.417 vetores de UTF-8 contra saídas literais e TextDecoder fatal do Node. A referência moderna é somente de teste. Casos cobrem opções/metadados, versões/dependências, mutação pelo chamador, descriptor/hash divergentes antes de I/O, excesso de fila, cancelamento antes/durante leitura e durante hash real, fechamento, callbacks síncronos/duplicados, exceções, API ausente, corrupção e consumidores compartilhados. Acorn confirma sintaxe ES5 do adaptador/decodificador; o manifesto de produção não importa esses arquivos.

Ensaio integrado: `createPackageInstaller` → `createPackageStore` → fechar/reabrir conexão → ponte → lookup paginado. 138 entradas próprias/artificiais, 22 descritores, envelope de 2.440 caracteres, raiz lexical de 813 bytes UTF-8. A sequência de consultas do teste realizou 15 leituras (3 de índice e 12 de dados), 15.743 bytes, 17 acertos de cache; consultas quentes não acrescentaram I/O. Não são números por consulta individual. Dados brutos e método em [A02-EVIDENCIA-PONTE.json](../recursos/A02-EVIDENCIA-PONTE.json).

O ensaio usa fake-indexeddb em memória, hash do Node e instalação de fixture já disponível no teste. Demonstra encadeamento e reabertura lógica; não persistência física entre processos, interface, recursos linguísticos reais, 1 GB ou desempenho de aparelhos. Tempos observados em uma execução são telemetria, não benchmark. Manuscritos não foram acessados.

`npm run build:check`: aprovado, 7 arquivos. Wrapper essencial `tests/a01-lexical.cjs` ampliado de três para quatro suítes, incluindo estes 15 casos; total de 57 casos aprovado pelo CI da main fac34c6. CI e Pages concluídos com sucesso. Não repetidas medições anteriores sem risco novo.

## Reprodução

```sh
node packages/experiments/lexical-index/test-store-reader.cjs
node tests/a01-lexical.cjs
npm run build:check
```

Ferramentas Node/dependências de desenvolvimento já existentes; nenhuma dependência adicionada. Fontes do store e instalador permanecem intactas; conversores e lookup anteriores também. Reversão por commit retirando os dois módulos experimentais, seu teste e chamada no wrapper; nenhuma migração de banco/manuscritos.

## Plano e próximo incremento

Estudado: contrato do store e UTF-8. Implementado/testado: ponte experimental e ensaio encadeado. Integração no aplicativo: pendente. Publicação na main: `fac34c665080bbc42dca7d91a697389ef88a2590`. [CI](https://github.com/rfmss/escrevaral/actions/runs/36559880501) e [Pages](https://github.com/rfmss/escrevaral/actions/runs/36559879277): completed/success. Árvore publicada idêntica à testada: `551ba14a4df85e580d5cfe85aedf59fcb6db0710`. Atualizados estado.json, plano-voo.json, Plano Mestre e Jornada gerada; registro de avanço parcial não fecha caixa indevida.

Próximo A02: decidir e implementar endereçamento limitado dos descritores de instalação. Comparar catálogo paginado versus descritores em registros separados, com orçamento de abertura/ativação, integridade, retomada, migração e preservação da versão anterior. Critério: consultar um bloco sem carregar a lista integral, instalar sem ativar conteúdo parcial e provar falhas/cancelamento. Só depois ampliar o piloto, catálogo e controles de instalação/reabertura offline. A03 continua dependente desse contrato.

Plano v3: 10/24 DONE | entrega +0 (avanço parcial A02: ponte) | próximo A02 (metadados limitados) | publicação: main fac34c6, CI/Pages success | limite: catálogo plano, integração do produto e persistência física. Fundação 5/5; compatibilidade 4/4; acervo 1/3; motores 0/8; experiência 0/2; revisão 0/2.

O gerador do Plano Mestre agora apresenta o campo opcional de progresso parcial de cada marco. Assim, o avanço aparece na árvore sem converter TODO em DONE; a geração foi conferida como determinística.

## Avanço posterior no mesmo dia

O endereçamento de metadados indicado acima foi implementado/testado em banco experimental separado; veja a [entrega de metadados](ENTREGA-A02-METADADOS-2026-09-29.md). O modo v1 desta entrega mantém seu limite histórico. Fila atual: catálogo em arquivo e coordenador sequencial.
