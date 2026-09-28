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

Faltam prova A01 e adaptação do manifesto, catálogo/instalador explícito, escolha de recursos, estimativa de espaço, progresso, limpeza segura, caminho de pacote para capacidades antigas, recuperação apresentada ao usuário e evidência de consulta dos pacotes reais offline após reabertura. Escrita e núcleo portátil continuam disponíveis independentemente dessas capacidades.

## Referências técnicas consultadas

- [W3C IndexedDB, recomendação de 2015](https://www.w3.org/TR/2015/REC-IndexedDB-20150108/): transações, eventos de conclusão/aborto e atualização de esquema. A atomicidade é da transação; não manter transação aberta esperando hash assíncrono.
- [fakeIndexedDB, documentação oficial](https://github.com/dumbmatter/fakeIndexedDB): implementação em memória para testes, não persistência em disco. Versão e integridade da dependência fixadas em `package-lock.json`; não entra nos bundles.
