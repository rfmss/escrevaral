# Persistência de pacotes — infraestrutura experimental v0

Implementação parcial de A02 em `src/storage/pacotes.js`, v6-30. Não há instalador na interface nem recurso linguístico novo. O editor não chama esta fábrica automaticamente: incluir o módulo apenas declara `Escr.createPackageStore`.

## Fronteira

O armazenamento recebe um envelope de instalação, blocos binários e versões fixadas de dependências. Não conhece verbetes, índices lexicais, normalização, URLs de download ou manuscritos. O formato interno dos blocos continua com A2; o adaptador futuro traduzirá o manifesto aprovado para este envelope. Este esquema experimental não substitui o contrato de consulta nem aprova fontes/licenças.

Fábrica: `Escr.createPackageStore({limits, digest?})`. Os quatro limites positivos são obrigatórios: `blockBytes`, `packageBytes` (soma dos bytes dos blocos), `blocks` (quantidade máxima, também limita dependências) e `metadataChars` (JSON do envelope). Não há um orçamento universal de desempenho embutido. Índice lexical e dados comprimidos devem ser blocos sujeitos ao mesmo limite de leitura; decodificação/descompressão e limite de memória dos objetos serão tratados no adaptador após A01.

Envelope:

```json
{
  "schema": "scrvrl.package-stage",
  "schemaVersion": 1,
  "id": "lexico",
  "version": "1",
  "dependencies": [],
  "blocks": [{"id": "a-001", "bytes": 123, "sha256": "64 caracteres hexadecimais minúsculos"}]
}
```

O exemplo ilustra campos; o hash acima é um marcador, não um bloco instalável. IDs/versões são segmentos de até 80 caracteres alfanuméricos/ponto/hífen/sublinhado, começando por letra ou número. Duplicatas, dependência em si mesmo, manifesto divergente para a mesma versão e limites excedidos falham. A ordem/codificação JSON do envelope é fixa para retomada nesta v0; canonicalização entre conversores ainda depende do contrato final.

## Operações

Todos os métodos abaixo recebem `done(error, value)` e retornam `{cancel()}`. Sucesso de escrita só é anunciado depois de `transaction.oncomplete`, não no sucesso isolado de um pedido de escrita.

| Método | Comportamento |
| --- | --- |
| `stage(manifest, done)` | Cria versão incompleta ou retoma envelope idêntico. Retorna `{ticket, state}`. Não a torna ativa. |
| `put(ticket, blockId, arrayBuffer, done)` | Copia uma unidade limitada, calcula SHA-256 fora da transação e compara tamanho/hash. Bytes e recibo são gravados na mesma transação. Versões prontas são imutáveis. |
| `inspect(ticket, done)` | Lê envelope/recibos e lista blocos gravados para retomada. Não carrega payloads e não equivale a revalidar todos os bytes. |
| `activate(ticket, done)` | Confere recibos de todos os blocos e versões prontas das dependências; muda estado e ponteiro ativo na mesma transação. |
| `active(packageId, done)` | Devolve envelope/ticket da versão ativa ou `null` se nenhuma estiver ativa. Não interpreta ausência como resultado lexical. |
| `read(ticket, blockId, done)` | Só lê versões prontas. Acesso pontual a um bloco, com nova verificação de tamanho e hash; falha de integridade não retorna bytes como válidos. |
| `discard(ticket, done)` | Remove somente uma instalação ainda incompleta. Um ticket antigo não alcança outra instalação recriada com o mesmo ID/versão. |
| `close()` | Cancela operação em curso e fecha a conexão. Novos pedidos nessa instância falham; outra instância pode reabrir e retomar. |

Ticket contém chave ID/versão e token da instalação; não é credencial de segurança. Uma versão anterior pronta permanece disponível por ticket após uma atualização, para consultas/dependências fixadas. Limpeza de versões prontas e remoção de pacotes referenciados **não estão implementadas**; não há coleta automática que possa invalidar dependências. Manifestos imutáveis permitem compartilhar uma mesma versão entre lentes.

A instância aceita uma operação em curso e retorna `BUSY` às demais. Isso limita alocação por essa instância; não impõe orçamento global entre instâncias ou abas. Cancelar não interrompe o hash nativo já iniciado: descarta sua resposta e mantém a instância ocupada até ele terminar. Transações ainda abortáveis são canceladas. Uma transação já concluída não é desfeita por cancelamento posterior.

## Persistência e falhas

Banco próprio `escrevaral-pacotes`, versão 1, stores `versions`, `receipts`, `blocks`, `active`. Nenhuma abertura automática, requisição de rede, leitura de localStorage, alteração dos cadernos ou migração do acervo. Banco separado organiza responsabilidades, mas não protege contra limpeza de toda a origem pelo navegador.

Ausência de IndexedDB, abertura bloqueada ou com tempo excedido são erros explícitos. O hash padrão usa Web Crypto quando disponível; ausência ou falha devolve `INTEGRITY_UNAVAILABLE`. `digest(arrayBuffer, done)` pode ser injetado por um hospedeiro confiável; nos testes usa SHA-256 do Node. Um verificador futuro para ambientes antigos precisará de implementação/procedência e avaliação próprias; nunca aceitar blocos sem verificação para contornar a falta da API.

Falhas de quota/gravação abortam a transação. A versão anterior ativa não é apagada para abrir espaço; bytes parcialmente recebidos ficam apenas na versão incompleta e podem ser retomados/descartados. Atualização exige espaço para ambas as versões e trabalho temporário. A estimativa e a apresentação desse custo na interface ainda não existem. Corrupção encontrada na consulta retorna erro; o módulo não tenta baixar novamente nem anuncia ausência lexical.

## Evidência e limites de conclusão

`tests/pacotes.cjs` usa `fake-indexeddb@6.2.5` como dependência **somente de desenvolvimento**, Apache-2.0, fixada no lockfile. Verifica retomada após fechar/reabrir conexão, versões incompletas, hash divergente, quota durante escrita e durante ativação, rollback, dependência ausente, ticket antigo, versão imutável, corrupção, API ausente e cancelamento durante hash. Inclui o caminho padrão Web Crypto com implementação do Node.

O simulador mantém dados em memória: reabrir uma conexão nele comprova continuidade lógica, **não persistência física entre processos ou reinícios do navegador**. Não foi feito teste visual/aparelho, conforme orientação do projeto. O módulo expõe uma fronteira persistente nativa; ainda não declaramos A02 concluída.

A prova A01 e suas extensões foram incorporadas isoladamente na main (ver [retomada A2](jornada/RETOMADA-A2-2026-09-28.md)). Faltam ponte textual e adaptação do manifesto, catálogo/interface de instalação, escolha de recursos, estimativa de espaço, apresentação do progresso, limpeza segura, caminho de pacote para capacidades antigas, recuperação apresentada ao usuário e evidência de consulta dos pacotes reais offline após reabertura. Escrita e núcleo portátil continuam disponíveis independentemente dessas capacidades.

## Coordenação de instalação — v6-31, A02 parcial

`src/storage/instalador-pacotes.js` acrescenta `Escr.createPackageInstaller({store, readBlock})`. Usa a fábrica de armazenamento acima, sem modificar seu esquema. O hospedeiro fornece uma instância dedicada à instalação e um leitor; o coordenador não escolhe transporte, URLs, fontes ou licenças. Fábrica incluída na montagem, ainda sem consumidor na interface. Não há instalação automática nem acervo novo nesta entrega.

`installer.install(manifest, onProgress, done)` retorna `{cancel()}`. O manifesto é copiado na chamada; a validação permanece no armazenamento. O início e as continuações cedem execução por `setTimeout`, inclusive quando o leitor responde sincronamente. Uma instalação em curso por coordenador; outra recebe `BUSY`. Não há orçamento global entre instâncias/abas.

O leitor recebe `readBlock({id, version, block:{id, bytes, sha256}}, done)` e pode retornar `{cancel()}`. Deve respeitar o tamanho declarado **antes de alocar/baixar** e entregar um `ArrayBuffer` de sua propriedade, que não será alterado nem reutilizado após o callback. O armazenamento copia esse buffer e verifica tamanho/hash. O pico inclui pelo menos payload e cópia; uma unidade de cada vez não significa ausência de cópias. Não implementar transporte que leia o pacote inteiro para extrair um bloco.

O leitor deve concluir exatamente uma vez, inclusive após cancelamento ou timeout definido pelo próprio transporte. O coordenador tolera callback duplicado/tardio, mas não transforma silêncio em término físico: permanece ocupado até a resposta para não sobrepor trabalho ainda em curso. Leitor que nunca conclui impede a retomada nessa instância; o adaptador de transporte deverá garantir esse contrato. Não há repetição automática de tentativas nem resolução/download implícito das dependências.

Fluxo: `stage` → `inspect` → receber/gravar cada bloco faltante → `activate`. Retomar usa recibos persistidos e preserva blocos completos; não certifica novamente todos os bytes já presentes. A consulta continua verificando hash, como descrito acima. Instalar explicitamente uma versão pronta reaproveita seus blocos e ativa a versão solicitada, mesmo que outra esteja ativa; isso não é seleção automática da versão mais recente.

Progresso e resultado são snapshots com `phase`, `ticket`, `storedBlocks`, `storedBytes`, `totalBlocks` e `totalBytes`. O total é conhecido após inspeção do envelope validado. Fases: `staging`, `inspecting`, `resumed`, `receiving`, `storing`, `stored`, `activating`; conclusão em `done(error, report)` com `installed`, `failed` ou `cancelled`. Contadores avançam após gravação confirmada; todos os bytes gravados ainda não significam versão ativa. Erros mantêm código/nome original (integridade, quota, dependência, transporte); nunca viram ausência lexical. O relatório de falha pode conter ticket para inspeção/descarte explícito. Uma gravação confirmada pouco antes do cancelamento pode reaparecer apenas na inspeção da retomada.

`cancel()` retorna `true` ao aceitar interrupção antes da ativação. Solicita cancelamento da operação em curso, aguarda sua conclusão, descarta sua resposta e não recebe outro bloco. A versão incompleta é preservada para retomar; não há descarte automático. Na fase `activating`, retorna `false` e aguarda sucesso/falha da transação curta: não promete desfazer uma ativação que pode já ter sido confirmada. Também retorna `false` depois do término ou num pedido recusado por `BUSY`.

`tests/instalador-pacotes.cjs` exercita armazenamento real do módulo sobre IndexedDB simulado: sequência/progresso, interrupção/retomada, quota, hash inválido, dependência ausente, callback síncrono/duplicado/tardio, cancelamento, entrada mutável e exceções do leitor/progresso. A prova não demonstra instalação real via rede/arquivo nem reabertura física offline. A02 continua TODO; próxima integração requer catálogo aprovado, transporte limitado e controles visíveis ao autor.

## Transporte local limitado — v6-32, A02 parcial

`Escr.createPackageFileReader({resolveFile, maxBlockBytes, timeoutMs})` retorna `{readBlock, close}`. Os dois limites são obrigatórios, positivos e inteiros; timeout não ultrapassa o intervalo de timer de 32 bits. `readBlock` encaixa diretamente no leitor injetado do coordenador. A fábrica apenas declara o recurso; não abre seletor de arquivos, rede ou banco. O hospedeiro fornecerá arquivos escolhidos pelo autor e o mapa aprovado de blocos. Catálogo, parsing limitado do manifesto e interface continuam pendentes.

`resolveFile(request)` é síncrono e retorna `{file, offset}`. O pedido copia ID/versão e descritor do bloco; o resolvedor deve fixar o arquivo e seu deslocamento para aquela versão, sem varrer/carregar o acervo. `offset` é **posição em bytes**, não posição de caracteres do texto. O tamanho vem de `request.block.bytes`. A faixa é validada contra `file.size` e `maxBlockBytes` antes de criar um `FileReader`. Um arquivo do tamanho exato do bloco pode ser lido diretamente; um arquivo maior exige `slice` (ou variante prefixada disponível), e somente o Blob recortado é entregue à leitura. Não há fallback que carregue um arquivo maior inteiro quando `slice` falta.

O resultado é um `ArrayBuffer` de tamanho exato. Este adaptador não decodifica, descomprime nem calcula hash: a persistência verifica integridade antes da gravação. A consulta verifica novamente, e erro não vira ausência lexical. A memória do transporte depende do limite por bloco, além das cópias do armazenamento e dos custos internos do navegador; não se promete um pico universal.

Uma leitura por instância. Callback `(error, bytes)` é assíncrono e aceito uma vez, inclusive em falha de capacidade, cancelamento ou timeout. `cancel()` interrompe por `FileReader.abort()` e descarta eventos tardios. `close()` cancela e impede novos pedidos. Timeout gera `READ_TIMEOUT`; não há repetição automática. Se `abort()` falhar ou o leitor continuar em `LOADING`, a instância passa a rejeitar novas operações com `FILE_READER_DISABLED`, evitando sobrepor novas leituras a uma operação de término incerto. Essa trava não afirma que o ambiente defeituoso conseguiu interromper o trabalho físico; o hospedeiro deve tratar a capacidade como indisponível, sem criar instâncias em laço para contornar a falha.

Outros erros: `BUSY`, `CLOSED`, `INVALID_BLOCK_REQUEST`, `BLOCK_LIMIT`, `FILE_RANGE`, `SLICE_UNAVAILABLE`, `FILE_READER_UNAVAILABLE`, `BLOCK_UNAVAILABLE`, `READ_FAILED`, `READ_ABORTED` ou erro nativo de leitura. A escrita no editor permanece independente de todas essas APIs. A alternativa completa de pacotes para ausência de IndexedDB/hash/FileReader ainda não foi escolhida.

`tests/leitor-pacotes.cjs` verifica seleção de faixa de seis bytes num descritor virtual de 1 GiB (sem alocar esse arquivo), rejeição prévia de tamanho/faixa, APIs ausentes, falhas, cancelamento, timeout e aborto defeituoso. Inclui integração do leitor com coordenador e persistência usando Blob do Node, FileReader controlado e IndexedDB simulado, com UTF-8 e consulta após reabrir a conexão. Isso verifica contratos e seleção de bytes; não mede memória de aparelho nem demonstra reabertura física offline de um pacote real. A02 permanece TODO.

## Referências técnicas consultadas

- [W3C IndexedDB, recomendação de 2015](https://www.w3.org/TR/2015/REC-IndexedDB-20150108/): transações, eventos de conclusão/aborto e atualização de esquema. A atomicidade é da transação; não manter transação aberta esperando hash assíncrono.
- [fakeIndexedDB, documentação oficial](https://github.com/dumbmatter/fakeIndexedDB): implementação em memória para testes, não persistência em disco. Versão e integridade da dependência fixadas em `package-lock.json`; não entra nos bundles.
- [W3C File API, fonte oficial](https://github.com/w3c/FileAPI/blob/main/index.bs), blob consultado `3401950c80b200ade94063e3ac9b9c13cf5b42d8`, em 28/09/2026: seções `slice-method-algo`, `readAsArrayBuffer` e `abort`. Referência do contrato de bytes/estados, sem cópia de código ou promessa de suporte universal. Consulta feita pelo repositório oficial após falha da ferramenta de navegação nas páginas W3C.
