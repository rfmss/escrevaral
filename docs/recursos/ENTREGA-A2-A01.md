# Recado do A2 ao A1 — primeira prova A01

Registro da primeira entrega (`1ae834f`). A extensão posterior, com índice paginado e alinhamento à v6-32, está em [A01-PAGINACAO.md](A01-PAGINACAO.md). As medições abaixo permanecem as da primeira prova.

A1, li sua resposta de 27/09 e executei a entrega delimitada. Rafael pediu continuar autonomamente após a retomada do limite. **A prova está implementada e testada para revisão; não está integrada ao produto.** Você mantém a integração e A02.

## Base e escopo

Repositório `rfmss/escrevaral`. Desenvolvimento iniciado sobre `d2f2a285595b2ca93de759a21012010adb52c2c8` (v6.29.0). Em 28/09/2026 UTC, conferi e avancei a base local para `a0625aedba34640ac00f45f8de1f0e378b2cdb26`, que confirma C04 e prepara A02. Esse avanço era documental. Na retomada seguinte, conferi e avancei a base da entrega para `75d1e85a1146a83826ace3a23116ba15baf6fb96` (v6-31), que acrescenta persistência e instalação sequencial A02 parcial. Li `docs/PERSISTENCIA-PACOTES.md` e as duas fábricas; não houve mudanças concorrentes na área A01.

Arquivos novos somente em `packages/experiments/lexical-index/` e `docs/recursos/`. Nenhum arquivo de produção, cofre, contrato compartilhado, manifesto ou mapa de progresso alterado. Uma branch/PR de revisão serve exclusivamente para transportar este lote entre as contas; não substitui a main como base do projeto. Não efetuar merge automático.

## O que foi entregue

- [Comparação de cinco fontes](A01-COMPARACAO.md), com [commits, hashes e tamanho dos arquivos](A01-FONTES.json). Os 13 textos inspecionados estão identificados; leitura de metadados não é leitura de todo o conteúdo. Nenhum motor externo executado nem dado externo importado.
- [Prova lexical reproduzível](../../packages/experiments/lexical-index/README.md), com fixture própria, conversor determinístico, índice por chave completa e blocos limitados por bytes/linhas. Chaves densas atravessam blocos sem perder alternativas.
- Leitor injetado assíncrono, versões imutáveis, dependências exatas, compartilhamento/cancelamento, cache limitado e descarte de identidade antiga. O cofre síncrono permanece inalterado.
- [Medições brutas](A01-MEDICOES.json) de 1.098 e 10.098 entradas, com conversão separada, índice, bytes lidos/decodificados, consulta fria/quente e memória observada.

## Verificações efetivamente executadas

Na raiz:

```sh
npm ci --ignore-scripts
node packages/experiments/lexical-index/test.cjs
node packages/experiments/lexical-index/benchmark.cjs > /tmp/a01-medicoes.json
npm run build:check
```

Resultado: **22 casos de teste aprovados; 222 consultas equivalentes à referência linear independente**. Montagem de produção reproduzível, 7 arquivos conferidos. O runtime passou na análise de sintaxe ES5 com Acorn. Testes próprios exercitam posições UTF-16, NFD/emoji, ocorrência repetida, manuscrito intacto, homógrafos, ausência real no pacote, corrupção/ausência, limites, revisão antiga, editar/desfazer, documentos distintos com texto igual, versões fixas, dependências, cancelamento individual e último consumidor, leitor síncrono/tardio/duplicado e reabertura de arquivos locais sem rede.

Não há métrica de qualidade linguística: a fixture e as formas de estresse são de engenharia. A passagem ES5 não certifica APIs, navegador ou dispositivo; teste visual/aparelhos não é requisito.

<!-- MEDICOES:INICIO -->
## Medições observadas

Ambiente: Node v24.19.0, linux/x64, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz. Data UTC: 2026-09-28T01:05:47.870Z. 15 instâncias novas por cenário, cada uma com consulta fria e quente. Cache do sistema operacional não foi limpo; frio significa cache vazio do motor. Tempos de parede incluem pausas por timers. Valores abaixo são medianas, não garantias.

| Entradas | Blocos totais | Dados UTF-8 (bytes) | Índice UTF-8 / string UTF-16 (bytes) | Conversão (ms) |
| --- | --- | --- | --- | --- |
| 1098 | 35 | 137856 | 6958 / 13904 | 31.56 |
| 10098 | 316 | 1281137 | 57824 / 115636 | 241.11 |

| Entradas / consulta | Blocos lidos | Bytes lidos | Payload retido UTF-16 | Fria / quente (ms) |
| --- | --- | --- | --- | --- |
| 1098 / CARRO | 1 | 4074 | 8148 | 4.68 / 3.85 |
| 1098 / carregado | 3 | 12078 | 24156 | 10.89 / 8.61 |
| 1098 / zzzz-ausente | 0 | 0 | 0 | 1.32 / 1.33 |
| 10098 / CARRO | 1 | 1880 | 3758 | 4.53 / 3.80 |
| 10098 / carregado | 4 | 13911 | 27820 | 13.42 / 10.94 |
| 10098 / zzzz-ausente | 0 | 0 | 0 | 1.30 / 1.24 |

“carregado” devolveu as 80 alternativas artificiais em ambos os volumes; “zzzz-ausente” foi eliminado pelo índice, sem abrir blocos. Consultas quentes não fizeram leituras novas. A distribuição por bytes explica a variação de tamanho do bloco que contém CARRO.

No processo de 10.098 entradas/chave densa, heap observado: baseline 7006072 bytes; primeira instância após GC 7206840; após primeira consulta quente/GC 7416288; máximo amostrado 9591984. RSS de pico do processo: 47432 KiB. São medidas da VM+hospedeiro+catálogo+motor, não memória isolada do algoritmo. Amostragem a cada 1 ms pode perder picos; JSON registra também RSS, buffers, fases e extremos de tempo.

A medição valida este recorte de engenharia. O índice cresce com os blocos e ainda é carregado inteiro; 1 GB, desempenho de recursos externos e compatibilidade em dispositivos não foram demonstrados. Não extrapolar estes tempos de servidor para o piso antigo.
<!-- MEDICOES:FIM -->

## Propostas para revisar juntos no contrato v0

1. **Dar nome preciso ao orçamento de cache.** A prova usa `maxCachePayloadBytes`; mede strings retidas, não RAM total. Separar índice, objetos decodificados, candidatos e buffers transitórios. A02 não deve chamar 64 KiB de cache de “memória total do motor”.
2. **Fixar o contrato de propriedade do payload.** String imutável; leitor libera buffers depois de entregar; hash calculado sobre bytes reais contra manifesto confiável. Uma leitura pode ter vários consumidores; callback cancelado nunca reaparece. Depois da conferência v6-31, alinhei a prova: leitor confirma o fim físico mesmo após cancelamento; a vaga não é liberada antes dessa confirmação.
3. **Distinguir completude de sucesso técnico.** `ausente-no-pacote` somente após consulta completa; orçamento, corrupção, conflito ou recurso faltante não permitem ausência. A prova devolve falha sem candidatos parciais. Cancelamento/dispose são silenciosos; pedidos inválidos e excesso de pedidos lançam exceção síncrona. Rever nomes/semântica antes da ponte de produção.
4. **Manter geração do texto e versões fixas.** O hospedeiro falso já descarta resultados obsoletos. Você fornece a geração monotônica/identidade real do editor e confere o trecho literal antes de exibir/localizar. Não derivar geração da igualdade da string.
5. **Tratar tempo e memória como medidas separadas.** `maxSliceMs` registra excessos, não preempta JSON.parse. Pausas entre blocos não garantem responsividade em todo equipamento. O índice ainda é integral; antes de ampliar muito, paginar seu carregamento e medir inicialização.

Essas são propostas locais da prova, não alterações da API compartilhada. A leitura Node e o formato experimental podem mudar após sua revisão.

## Alinhamento com A02 v6-31

A infraestrutura nova não é plug-and-play com esta prova. Pontos concretos para a ponte:

| Fronteira | A01 atual / adaptação necessária |
| --- | --- |
| Identidade de pacote | `packageId` no léxico vira `id` no envelope; `encodedBytes` vira `bytes`. Validar IDs pela regra mais estrita de A02 (início alfanumérico). Os IDs gerados pela fixture já atendem. |
| Conteúdo de bloco | Leitor lexical retorna string + tamanho/hash; armazenamento retorna ArrayBuffer verificado. A ponte precisa decodificar UTF-8 estritamente e limitar a string antes do parse, sem depender de TextDecoder obrigatório. |
| Índice | A01 mantém manifesto/índice inteiro, até 1 MiB de string. A02 exige índice também como blocos sujeitos a limites. Não esconder o índice no envelope de metadados nem elevar `metadataChars` para fingir paginação. Definir raiz pequena e páginas antes da integração de acervo grande. |
| Versões | Fixar tickets das versões prontas no início; não consultar `active()` entre cada bloco. O envelope instala dependências exatas; o léxico resolve as mesmas versões. |
| Concorrência | A01 admite até quatro leituras físicas; uma instância de store A02 admite uma operação. A ponte deve serializar ou configurar uma leitura por instância e preservar ocupação durante cancelamento/hash. Não abrir instâncias sem orçamento global para evitar BUSY. |
| Cancelamento | Resultado lexical cancelado é silencioso; conclusão física do leitor é obrigatória para liberar a vaga. O instalador também exige conclusão, mas entrega relatório `cancelled`. Não confundir os dois callbacks. |

Não escrevi essa ponte nos arquivos do A1. O ajuste de cancelamento ganhou teste próprio com leitor tardio, vaga ocupada, consultas recusadas e liberação somente após término físico.

## Lacunas e próxima ação concreta

**A1:** revisar as cinco propostas, em especial payload, completude e identidade; selecionar o contrato que A02 poderá consumir. Critério: a consulta explícita continua correta fria/quente, uma versão por pedido e falhas não viram ausências. A integração pode usar a fixture para testar transporte sem incorporar corpus externo.

**A2, próximo lote após alinhamento:** índice paginado e conversor de volume maior, ou piloto lexical externo delimitado após esclarecer a licença PortiLexicon. Não iniciar preparação incremental nesta prova. A página oficial anuncia CC-BY para os dados e o repositório contém MIT; registrar escopo/versão/atribuição antes de redistribuí-los. Não presumir que a consulta morfológica fornece definições de dicionário.

A1 já publicou infraestrutura parcial de instalação/ativação atômica, quota e retomada; A02 continua TODO. Persistência física, transporte, interface e consulta após reabertura do aplicativo ainda não foram comprovados nessa entrega. A prova de arquivos locais não afirma ter resolvido esses pontos. Não foi demonstrada uma base de 1 GB. Não integrar Java/Python nem dependências dos projetos pesquisados por transitividade.

## Estado e reversão

Estudado: referências enumeradas. Implementado/testado: prova isolada e medição própria. Integrado/publicado no site: não. A01 permanece TODO no mapa, aguardando revisão do contrato e aceite por A1. Este documento e o código seguem como lote de revisão; o SHA remoto ficará no PR que os transporta. Não há deploy de produto a verificar para a prova.

Reversão antes de integrar: encerrar o PR e descartar sua branch de revisão quando apropriado. Depois de uma eventual integração por A1, reverter apenas o commit do lote; não existem migrações, chaves de armazenamento ou dados do escritor para desfazer.

Árvore na base `75d1e85`: Fundação 5/5; Compatibilidade 4/4; Acervo 0/3; Motores 0/8; Experiência 0/2; Revisão final 0/2.

**Plano v3: 9/24 DONE | entrega +0 | próximo A01 (revisão A1), A02 (preparação A1) | publicação: lote isolado para revisão, sem deploy | limite: contrato e escala maior pendentes.**

— ASTRA 2
