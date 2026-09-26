# Verificação da etapa linguística 1 — 25/09/2026

Base remota conferida: `9d167407962300d82393dee3262c3dbb32cc994f`, branch `main`.
Trabalho preparado na main local, conforme orientação do autor. Nenhuma outra branch foi adotada como base. O SHA de trabalho é o commit que contém esta entrega; a revisão externa identifica esse SHA integralmente.

## Estados

| Estado | Resultado |
| --- | --- |
| Implementado | Correções locais das lentes e triagem; não há integração do motor completo PTBR |
| Testado | Casos reais, testes de painel, sintaxe ES5 e navegadores conforme tabela abaixo |
| Integrado | Cópias locais dos HTMLs sincronizadas; nenhum envio à main remota |
| Publicado | Não; o briefing exige aprovação explícita de Rafa |

## Casos essenciais

| Entrada | Base | Correção local | Classificação |
| --- | --- | --- | --- |
| `de vez em quando` | Ausente | Expressão com posição exata | Lacuna de catálogo corrigida com inclusão editorial local |
| `Em última análise` com acentos decompostos | Ausente | Expressão reconhecida | Normalização corrigida sem perder posições |
| `No final. Das contas` | Sem apontamento | Sem apontamento | Negativo correto na main; falso positivo pertence ao pacote externo |
| `muito muito` | Fora do limiar anterior | Repetição adjacente descritiva | Regra nova explícita, sem julgamento estilístico |
| `falou que falou` | Fora do limiar anterior | Retorno X que X descritivo | Regra nova explícita; não classifica oração |
| Três `casa` em até 40 tokens | Reconhecido | Reconhecido | Regra anterior preservada |
| `pode pôde`, flexões diferentes, citações e código | Sem equivalência indevida | Sem equivalência indevida | Negativos por regra explícita |

A matriz JSON contém 29 casos com sinais, quantidades e posições. O teste de triagem cobre 16 casos e limites de trabalho. O teste de lentes também comprova o teto de 100 apontamentos.

## Resultados de QA

- Triagem, painel simulado, lentes reais, análise incremental/linhagem e armazenamento: passaram.
- 41 scripts de produto passaram no parser ES5. HTML de entrada e portátil idênticos; versões de cache alinhadas. Ferramentas de desenvolvimento usam Node moderno.
- Cadernos, caixas opcionais, universo e quadro: suites de dados passaram.
- Chromium 140, Playwright 1.55: posições NFD, foco no trecho, escolhas compartilhadas e persistidas, acesso manual, digitação sem executar lentes, IME, cancelamento por edição/troca de folha, larguras 1366/390/320, PWA offline com perfil limpo e HTML portátil offline passaram.
- Primeiro acesso/exportação mobile: Chromium passou. Suite existente de orientação/linhagem: Chromium passou antes do ajuste cosmético final da contagem de observações.
- WebKit 26/WPE: fluxos linguísticos, larguras e HTML portátil com requisições HTTP/HTTPS bloqueadas conforme `navegador-webkit.json`. Recarga PWA offline **não aprovada**: `page.reload: WebKit encountered an internal error`, reproduzido também na base sem mudanças. O modo offline do contexto também falhou ao abrir arquivo local; no teste portátil de WebKit o bloqueio de rede é feito por interceptação HTTP/HTTPS. O teste normal separa o gate de PWA; `PTBR_PWA_WEBKIT=1` o habilita explicitamente.
- Capturas desktop e mobile conferidas visualmente. Em telas pequenas o painel mantém rolagem vertical, sem transbordamento horizontal.

Chromium usou CPU simulada 6 vezes mais lenta na medição de triagem. Os recortes de documentos de 200.000 e 800.000 caracteres ficaram limitados a 7.998 caracteres e 1.032 tokens neste cenário. Tempos completos estão no JSON; não são promessa de desempenho em telefone antigo. A análise completa sob comando tem teto de 200.000 caracteres, mas não recebeu certificação de latência em hardware antigo.

Neste ambiente, WebKit precisou de bibliotecas Ubuntu isoladas e de preservação do caminho dessas bibliotecas no lançador local; nenhum arquivo do produto foi alterado para iniciar o navegador. O resultado representa WebKit/WPE Linux, não Safari em aparelho Apple.

## Auditoria do pacote externo

Os sete hashes conferem; suites originais retornam 0. Uma falha injetada no corpus também retorna 0 no executor original. O acumulador corrigido em memória retorna 1, como deve. Acorn ES5 rejeita o motor morfológico. A expressão com ponto atravessado e a ausência de `de vez em quando` foram reproduzidas. O auditor retorna 1 por bloqueios reais, não por falha da etapa local.

O anexo não foi modificado. Licenças, qualidade das leituras e efeitos globais continuam pendentes. A integração dos inventários grandes, de sinônimos e de morfologia não faz parte desta entrega.

## Lacunas e revisão antes de publicação

Não foram verificados: iOS 9.3.5, Android KitKat, dispositivo físico com pouca memória, instalação do aplicativo na tela inicial, sessão longa em telefone antigo e recuperação de PWA em WebKit/Safari real. Simulação de CPU e viewport não substitui esses testes.

Não foi feito push, merge ou deploy. A revisão deve conferir os blocos linguísticos, pontes mínimas e alterações de versão nos arquivos compartilhados. A implementação de PWA permanece a mesma; somente identificadores de cache foram alinhados. O problema offline do WebKit fica documentado para o responsável pela integração.
