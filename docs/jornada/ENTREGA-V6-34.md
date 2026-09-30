# M01 — formas, lemas e leituras morfológicas reais

Base: main `9fc70321a3d9217d3b3186052aed73c60b5246b8`. Coordenação/publicação A2; Rafael pediu continuidade autônoma em 30/09/2026. Prioridade mantida: motores úteis, verificações essenciais e avaliação ampla depois.

## Tarefas cumpridas neste incremento

- [x] M01-flexoes-1: extrair recorte real e rastreável do PortiLexicon-UD.
- [x] Preservar homógrafos de todas as classes das formas selecionadas, inclusive lemas fora da lista inicial.
- [x] Ligar forma → lema → sentidos existentes, com ausência de definição explícita.
- [x] Integrar no mesmo controle do editor/portátil, sem rede nem alteração do manuscrito.
- [x] Verificar ambiguidades, limites, licença incorporada e comportamento do painel.

O marco amplo M01 continua parcial: cobertura fechada da primeira versão, revisão linguística/avaliação reservada e expansão ainda pendentes. Não criar um novo marco global para cada incremento: plano permanece v4, **11/25 DONE**, entrega +0 marcos completos, com tarefa M01-flexoes-1 cumprida.

## Comportamento entregue

Selecionar **carros**, **fui**, **canto**, **casas** ou **lemos**, abrir Examinar e Consultar palavra. Entrada manual também disponível. A consulta apresenta lemas, classes e traços possíveis, seguida dos sentidos disponíveis para os lemas. Não muda as lentes contextuais existentes nem afirma que a classe lexical é a classe da palavra naquela frase.

`carros` leva a `carro` e seus quatro grupos OWN-PT. `fui` conserva `ir` e `ser`, tanto VERB quanto AUX conforme a fonte, sem definições OWN-PT no recorte. `canto` conserva substantivo/canto e verbo/cantar. `casas` preserva casa e casar. `lemos` preserva presente e pretérito. `pode` e `pôde` continuam diferentes; `pode` também preserva as leituras de podar presentes no léxico. Não há redução por sufixo, escolha de sentido ou correção automática.

Contagem: **3.009 formas, 5.286 triplas distintas, 204 lemas de seleção e 473 lemas encontrados incluindo homógrafos**. Não são 473 paradigmas completos. Todos os registros das formas escolhidas foram buscados nas 12 tabelas; nove classes aparecem no recorte. UD não equivale automaticamente às dez classes da gramática escolar. O painel explica possibilidades e distingue fonte morfológica de fonte de sentidos.

## Fonte e decisão de reutilização

[PortiLexicon-UD](https://github.com/LuceleneL/PortiLexicon-UD/tree/315e063da1f89c89e2097c6e72428ebefb9ab1d1), commit `315e063da1f89c89e2097c6e72428ebefb9ab1d1`. README identifica dados e acessor neste repositório; LICENSE da raiz concede MIT, copyright Lucelene Lopes (2023). Preservamos a licença integral tanto em arquivo quanto no módulo gerado incorporado ao site/portátil. Atribuição a Lopes, Duran, Fernandes e Pardo (2022), visível na consulta.

A [página institucional POeTiSA](https://sites.google.com/icmc.usp.br/poetisa/resources-and-tools), relida em 30/09, anuncia os dados sob CC-BY e liga ao mesmo repositório; não especifica versão. A decisão de integração usa a licença explícita MIT do snapshot distribuído com dados, conservando também a atribuição institucional. **Não rebatizamos a menção CC-BY como CC BY 4.0**, não atribuímos MIT à fonte UNITEX-PB nem importamos outro acervo sob essa licença. Registro das duas evidências em ORIGEM.json. Isso resolve o bloqueio operacional deste recorte de snapshot; não é afirmação de equivalência entre licenças ou auditoria jurídica de toda a genealogia do corpus.

Consultados: README, LICENSE, listagem do repositório, página institucional e linhas das 12 tabelas por extração sequencial. Não executamos o acessor Python externo, modelo, analisador de contexto nem servidor remoto. Referência dos autores: [Lopes et al. (2022)](https://aclanthology.org/2022.lrec-1.715/). Metadados/hashes de cada TSV em `resources/pt-BR/portilexicon/entrada.json` e `ORIGEM.json`.

## Transplante e limites

`ferramentas/importar-portilexicon.py`: verifica hashes antes de ler; primeira passagem seleciona formas dos lemas explícitos; segunda conserva todas as análises dessas formas. Normaliza NFC/minúsculas, deduplica triplas iguais, compacta IDs de lemas/classes/traços. Não guarda as tabelas completas em memória. Mantém o conjunto do recorte, não oferece orçamento global de RAM para qualquer seleção futura. Teto de 10.000 formas, 32 leituras/forma, 4 KiB/registro e 256 KiB de módulo final; rejeita saída excessiva. Não altera os dados originais.

Três formas da fonte não cabem no contrato de palavra: `tinhas:`, `vens:`, `vinhas:`. Foram excluídas e registradas, sem retirar pontuação silenciosamente ou fabricar uma correção. A fonte pode conter outras lacunas e análises discutíveis; a consulta não certifica ortografia, uso ou classe contextual.

Módulo gerado: **109.924 bytes**, maior registro **122 bytes**, máximo **11 leituras por forma**. Dados pequenos incorporados integralmente ao bundle; só a forma solicitada é desserializada, com tabelas compartilhadas para decodificar IDs. Não é carregamento físico sob demanda. A consulta integrada lê até oito lemas e apresenta até 24 sentidos com aviso de limite; nenhuma varredura do manuscrito. Sem cache adicional, dependência npm ou API nova no caminho do autor.

`lookupMorphology(chaveCanônica)` e `describeMorphology(leitura)` são pontes internas síncronas; `lookupLexeme` normaliza a entrada e combina as duas fontes com suas versões. `vault.analyze()` continua inalterado. Resultados novos por chamada, manuscrito imutável, reset/cancelamento/IME do painel preservados. Campo limitado a 64 unidades UTF-16. O portátil carrega o mesmo recurso sem rede.

## Verificação executada

`node tests/portilexicon.cjs`: **8 grupos aprovados**, incluindo 3.009 formas/5.286 leituras, plural, irregularidade, homógrafos, ambiguidade temporal, acentos, lacunas, isolamento, tamanhos/hashes, ES5, limites de parse e integração simulada do painel. `node tests/lexico-own-pt.cjs`: 11 grupos anteriores aprovados, 179 consultas. A expectativa de ausência para carros foi substituída por forma inexistente; carros agora tem teste positivo próprio. `npm run build:check`: 7 arquivos reproduzíveis. A suíte anterior do painel também foi executada pelos testes de integração.

São casos de desenvolvimento e fidelidade à fonte, não prova de acurácia linguística em corpus reservado. Testes visuais/aparelhos não são gate. Demais regressões ficam no CI, sem repetição local desnecessária.

## Continuidade e publicação

Integrado, testado localmente e publicado, com CI/Pages confirmados abaixo. Nenhuma migração de manuscrito ou banco. Reversão por commit normal retirando os módulos morfológicos do build e restaurando a consulta v6-33, preservando os textos.

Próximo **M02**: alimentar a lente Classes de palavras com essas leituras como candidatos, mantendo regras de contexto, ambiguidades e abstenção. Começar por contrastes nominais/verbais (`canto`, `casas`) sem confundir riqueza do léxico com análise contextual. M01 continua em expansão/revisão; A02 segue para acervos maiores, sem bloquear este recorte. A1 pode revisar a entrega, sem espera obrigatória para A2 continuar.

## Confirmação de publicação e custo — 30/09/2026

Main `b3969c259b68564ac9955fa1fdccc0e580553cc4`, árvore `82370ededa0b437dccf758c41efe5d8006bb085c`, idêntica à testada. [CI](https://github.com/rfmss/escrevaral/actions/runs/36674620940) e [Pages](https://github.com/rfmss/escrevaral/actions/runs/36674620305) concluídos com sucesso. Atualização sem force push e sem alteração concorrente observada.

Cofre: 513.879 → 626.739 bytes (+112.860); aplicação: 288.764 → 289.896 (+1.132); CSS inalterado. Portátil: 1.341.314 bytes. Medidas de distribuição sem compressão, não RAM ou latência.

Plano v4: 11/25 DONE | entrega +0 marcos (M01-flexoes-1 cumprida) | próximo M02 | publicação: b3969c2, CI/Pages success | limite: recorte parcial e sem desambiguação contextual.
