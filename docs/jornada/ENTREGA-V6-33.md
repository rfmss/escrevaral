# M01a — primeira consulta lexical real no editor

## Direção e base

Rafael priorizou motores funcionando em 29/09/2026: entregas completas pequenas, verificações essenciais, avaliação ampla depois. A instalação sofisticada A02 deixa de bloquear a primeira integração linguística. A2 continua responsável por integrar/publicar, sem esperar A1. Base remota conferida: `a5364c348195adb1bb4b7459ce4befd84a922b9c`. Fechamento em 30/09/2026, horário de Brasília.

A explicação anterior no chat descreveu apenas o experimento lexical e omitiu as 16 lentes delimitadas já existentes. Elas continuam disponíveis; esta entrega acrescenta consulta lexical explícita, não o primeiro analisador do projeto.

## Entrega ao autor

No editor, selecionar uma palavra, abrir **Examinar** e clicar **Consultar palavra · léxico inicial**. O campo recebe a seleção de até 64 unidades UTF-16; também aceita digitação manual, inclusive sem seleção disponível. Exemplos: **banco**, **saudade**, **carro**. Abrir/digitar não dispara consulta. O resultado ocupa a mesma área das lentes, sem alterar o manuscrito. Consultar cancela a lente pendente; escolher outra lente substitui a consulta. Edição, IME, fechar painel ou trocar folha descartam o resultado pelo reset existente.

Recorte: **179 lemas, 1.090 sentidos distintos da fonte, 255 com definição em português**. As associações por lema podem compartilhar sentidos. Não é dicionário geral, conjugador, corretor ou desambiguador. `carros` não é automaticamente reduzido a `carro`; ausência no recorte não significa erro. A ordem dos sentidos é por ID, não frequência. Até 24 sentidos apresentados, com aviso se houver mais.

## Fonte, licença e decisão

OpenWordNet-PT, commit `264016d5899e6969f6f7cb4f1d75fa06037c1fd7`: [repositório e autoria](https://github.com/own-pt/openWordnet-PT/tree/264016d5899e6969f6f7cb4f1d75fa06037c1fd7), [licença da fonte](https://github.com/own-pt/openWordnet-PT/blob/264016d5899e6969f6f7cb4f1d75fa06037c1fd7/LICENSE), [apresentação pelos autores](https://aclanthology.org/C12-3044/). Consultados README, LICENSE, registros de palavras/sentidos e definições; não foi feita revisão linguística integral do acervo.

Dados OWN-PT sob CC BY 4.0, atribuição a Alexandre Rademaker, Valeria de Paiva, Fredson Aguiar e colaboradores. Licença original conservada, com referência upstream à Princeton WordNet; dados ingleses não importados. Origem, commit, hashes SHA-256, seleção editorial e transformações em `resources/pt-BR/own-pt/ORIGEM.json`. Somente o recorte OWN-PT desta entrega foi aprovado para incorporação; PortiLexicon/Portparser continuam separados.

Escolha: usar dados reais com licença explícita e runtime próprio mínimo. Reaproveita grupos de sentidos e definições, sem instalar servidor RDF, modelo, Python ou dependência no aparelho. A ferramenta Python externa extrai um snapshot fixado; não é parser Turtle geral e rejeita hashes diferentes. Alterações aos dados: seleção por lista explícita de lemas, organização em JSON, ordenação/deduplicação de termos; sem completar definições ou traduzir silenciosamente.

A fonte reúne variedades do português. Não a rotulamos como inventário exclusivamente brasileiro. Em `carro`, os quatro sentidos não trazem definição portuguesa: isso aparece em cada resultado. `banco` conserva tanto assento quanto instituição financeira; não escolhemos o sentido pela presença da palavra. Grupos incluem associações discutíveis ou amplas (ex.: carro/veículo); são exibidos como **termos agrupados pela fonte**, não como substituições recomendadas. Revisão editorial e maior cobertura permanecem pendentes.

## Arquitetura e custo

`resources/pt-BR/own-pt/lexico.js`: **135.240 bytes** de fonte gerada, teto de 144 KiB para este recorte. Todos esses dados pequenos residem no bundle; não alegamos carregamento físico por demanda. Cada valor do mapa é uma string JSON; apenas a chave pedida é desserializada, sem varrer o manuscrito, todos os verbetes ou criar cache adicional. Maior registro: **2.872 bytes UTF-8**. Os limites são de dados serializados, não medição de heap total.

`packages/cofre/src/consulta-lexical.js`: `E.lookupLexeme(string)` síncrono, independente de DOM/rede/armazenamento, com estados `found`, `uncovered`, `invalid`. Usa normalização existente que compõe acentos portugueses previstos e preserva diacríticos; não é normalização Unicode universal. Resultado novo por chamada, separado do inventário. API exposta no runtime do cofre, sem alterar o contrato de `vault.analyze()`.

`ptbr/painel.js`: formulário leve integrado à oficina, máximo de 64 unidades por consulta, no máximo 24 sentidos em DOM. Renderização textual, sem HTML vindo da fonte. Campo/botão com rótulo, Enter e bloqueio durante composição. A consulta é síncrona e pequena; não gera resposta assíncrona que precise de novo protocolo de identidade.

Site e portátil incluem o mesmo recorte. Portátil funciona sem fetch, IndexedDB, Worker ou serviço remoto para esta consulta; no site o offline depende do caminho de cache já existente. Links externos de origem/licença são opcionais e identificados. Nenhuma mudança em armazenamento/exportação de manuscritos. O experimento A02 não foi incorporado para sustentar este recorte pequeno.

## Verificação essencial

- `node tests/lexico-own-pt.cjs`: 11 grupos aprovados; 179 consultas, hashes/orçamentos, banco/saudade/carro, NFD, ausências/flexões, isolamento, ES5, seleção, texto intacto, troca/cancelamento de lentes, IME, painel fechado e reset de folha. Inclui a simulação existente do painel.
- `node tests/cofre-portabilidade.cjs`: aprovado, 290 casos equivalentes; transporte do cofre e instâncias isoladas.
- `node tests/offline-access.cjs`: aprovado, alternativa portátil/ativação e recursos essenciais incorporados.
- `npm run build:check`: montagem reproduzível, 7 arquivos.

São verificações de desenvolvimento e integração simulada. Não são avaliação linguística reservada, medição em aparelho ou certificação de compatibilidade. Não ampliar testes sem risco identificado. CI da main verifica as demais regressões automaticamente.

## Plano, publicação e continuidade

M01a acrescentado como marco delimitado; plano v4 **11/25 DONE**, entrega +1. O denominador aumenta de 24 para 25 para tornar visível a primeira fatia entregue; M01 (léxico/flexões) continua TODO parcial. A02/A03 permanecem pendentes, com seus experimentos preservados. Isso não mede porcentagem da língua.

Estados desta cópia: fonte estudada no recorte, implementado, integrado e testes locais aprovados; publicação/CI/Pages serão confirmados abaixo. Não declarar implantação apenas pelo build local.

Próximo: M01 — integrar flexões de uma fonte morfológica licenciada ao mesmo fluxo, mostrar lemas/classes possíveis sem escolher classe contextual; priorizar palavras ausentes no uso. Ampliar definições e rever os grupos da fonte por unidades. Não retomar A02 como bloqueio automático desses recortes. Avaliação ampla Q01/Q02 permanece na fila.

Reversão: commit normal retirando os dois módulos do build e o controle lexical, restaurando versão/bundles por montagem; não há migração de dados do usuário a desfazer. Revisão de continuidade solicitada a A1 nos commits, sem gate de espera.
