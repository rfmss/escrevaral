# Devolução Gemini — auditoria e reprodução

26/09/2026, data local de Rafael · P02/P03/P10. Pacote recebido: `DEVOLUCAO-GEMINI-ESCREVARAL.zip`, 24.284 bytes, sete arquivos. SHA-256: `e3f9c488cb52c5ac7fee75f35733648a109dba492fc382e00ea092b11bc0683f`.

## Decisão

Aproveitar os exemplos como avaliação externa a revisar e as fichas como propostas lexicais. **Não aceitar as métricas declaradas como reprodução do motor nem considerar o QA de navegador aprovado.** Não importar dados ou regras automaticamente. A avaliação não é cega: a exposição anterior foi declarada pelo próprio Gemini.

O arquivo original foi preservado. A reprodução foi feita sobre o snapshot **v6-22**, não sobre a v6-23 desenvolvida posteriormente. Código executado: HTML conhecido do kit enviado; os arquivos da devolução foram tratados apenas como dados JSON.

## Identidade e integridade

Conferem exatamente:

- Manifesto da base: `c3585d75d02fb2bdee67adbf4175936a709d2279296ce298ecdf34e3ba72b4b8`.
- HTML v6-22: `2649df84d3a672a8b8407d9af07fef318ff77b81eefae50412c893331b07d36f`.
- Corpus recebido: `8c4ed08167edcb95e07213ad8688a05e2ce75574151137732a88e17925cdf111`.

São 80 casos em quatro grupos de 20 e 30 fichas de homógrafos. Os **175 trechos anotados** satisfazem a correspondência UTF-16 com o texto. Isso é útil e foi verificado separadamente das conclusões do relatório.

Há uma seleção inválida em G01-80: fim 43 para um documento com 42 unidades UTF-16. Não foi truncada ou corrigida silenciosamente para executar o caso. As cinco últimas entradas concentram emoji, NFD, repetição, quebra de linha e citação/seleção; não cumprem a solicitação de pelo menos oito casos com desafios de posição.

O horário de congelamento interno do corpus difere do manifest. Início, fim e congelamento no manifest têm o mesmo instante; todas as execuções repetem esse horário. Os hashes identificam os arquivos finais, mas esses registros não comprovam a sequência temporal de congelamento e execução. Não concluir intenção ou autoria dos problemas a partir disso.

## Reprodução de G01

Procedimento versionado: `ptbr/ferramentas/reproduzir-devolucao-gemini.cjs`.
Resultados reais completos: `ptbr/auditoria/devolucao-gemini-reproducao-v6-22.json`.

| Medida | Declarado pelo Gemini | Reprodução local da v6-22 |
| --- | --- | --- |
| Casos com “acerto de leitura” | 32 | 12 desses casos produzem achados; 20 retornam zero |
| Casos sem achados | Não fornecido como saída real | 67 pedidos válidos retornam zero |
| Pedido inválido | Não assinalado | 1 seleção fora do documento, G01-80 |
| Saída bruta | 80 descrições textuais | Objetos reais de resultado, achados, limites e versões preservados |
| Erros nos trechos anotados | Nenhum declarado | Zero nos 175 spans; seleção inválida tratada à parte |

Exemplos de divergência: G01-11 “Os alunos andaram.”, G01-21 “O escritor está lendo o conto.”, G01-39 “A menina não vai chorar.” e G01-78, com duas ocorrências de “O autor leu o livro.”, foram marcados como acertos, mas a base congelada não retorna leituras. Há lacunas lexicais, padrões fora da cobertura e lemas não contemplados; não é tudo o mesmo problema.

Os 12 casos com achados são G01-03, 05, 07, 09, 12, 14, 15, 22, 23, 35, 37 e 40. Cinco pertencem ao grupo de locuções: 22, 23, 35, 37 e 40. Seus objetos reais estão no JSON de reprodução. Ter achados não equivale, por si só, a validação integral de todos os rótulos; por isso não se anunciou uma nova precisão global.

A descrição “lista fechada de 42 substantivos” também não coincide com o código: a tabela da sintaxe contém **68 formas nominais explícitas** distribuídas em gênero/número, além do tratamento separado de quatro nomes próprios. Forma e lema são contagens diferentes. A limitação lexical é real, mas o número e a classificação causal precisam ser corrigidos.

Não ajustar o motor para coincidir com as alegações de execução. O corpus agora está exposto ao implementador e poderá alimentar desenvolvimento; futuras métricas de generalização precisam de outro conjunto reservado, com protocolo verificável.

## G02: ambiente, simulação e histórico

- Não há novos logs de execução de navegador ou capturas no pacote. “Passou” em DOM simulado não aprova layout, teclado, IME físico, portátil ou offline em navegador.
- EXE-05 remete os eventos IME a `regras-locais.js`; o controle de composição está no painel. A referência não demonstra a execução alegada.
- EXE-09 usa o teste estático como prova de abertura portátil. Esse teste não executa navegador; o estado aceito é **verificação estática**, com uso portátil real ainda pendente.
- BUG-01 descreve bloqueio de ambiente, sem novo log que sustente três reproduções. Não é um defeito linguístico ou de armazenamento do aplicativo.
- BUG-02/EXE-10 apontam para `webkit-offline-base.log`, que já estava no kit e identifica explicitamente **BASE 9d16740**, anterior à v6-22. Esse registro sustenta a pendência histórica de WebKit/WPE, não uma nova execução da versão avaliada nem uma generalização para Safari/aparelhos de usuários.
- A recomendação de alterar o Service Worker não foi aplicada: falta evidência nova que localize a causa no código do produto.

O bloqueio conhecido de Chromium não foi contornado ou repetido sem mudança de ambiente. Continua necessário executar o QA preparado em navegador funcional.

## G03: o que aproveitar e o que revisar

As 30 fichas preservam alternativas e assinalam fontes não conferidas. Nenhuma contém conferência efetiva da fonte. Páginas sugeridas não serão promovidas a referências lidas.

São propostas úteis para revisão: preservar esta/está e nos/nós, manter alternativas de foi, registrar nós como possível plural de nó, e avaliar contextos contrastantes de substantivo/verbo. Não importar automaticamente as listas como exaustivas.

Condições que exigem correção ou aprofundamento:

- `por` inclui pôr sem acento sob a justificativa de erro/grafia antiga. Uma hipótese de erro não deve virar leitura verbal regular dessa grafia no léxico atual.
- `que` menciona quê como substantivo: forma de superfície e lema precisam permanecer distintos; a ficha não basta para fundir grafias.
- `canta` como substantivo regional/arcaico carece de fonte; manter pendente.
- Regras como “se junto de verbo”, “que após antecedente” ou “para entre sujeito e objeto” não bastam para desambiguar. Exigem construção inteira, função, regência e alternativas.
- As listas têm omissões e classificações que dependem da abordagem; não tratá-las como dicionário completo.

BUG-03, “O motorista para o carro.”, reproduz abstenção na sintaxe. Não há diagnóstico prepositivo devolvido pela lente nesse caso. O exemplo reúne substantivos não cobertos, lema/forma verbal não incorporados e ausência de padrão de regência de parar; não isola uma colisão de acentos como causa. A demanda válida é ampliação lexical/contextual, com casos que controlem esses fatores.

## Continuidade

1. Conservar o corpus original e o relatório de reprodução; aceitar as anotações somente após revisão linguística e de escopo.
2. Planejar ampliação nominal em lote próprio, com formas, gênero/número, candidatos e proveniência explícitos. Não misturar lacuna lexical, valência e fronteira de oração nas métricas.
3. Solicitar nova avaliação reservada apenas depois da revisão dos critérios; não reapresentar estes 80 exemplos como inéditos.
4. Usar o QA em navegador quando houver ambiente funcional. Uma entrega de simulação continua valiosa, desde que identificada como tal.

Nenhuma publicação, alteração do pacote original ou importação automática ocorreu nesta auditoria. O estudo de relativas prosseguiu separadamente, na v6-23.
