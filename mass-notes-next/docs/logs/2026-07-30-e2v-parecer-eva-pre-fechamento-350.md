# E2-V — parecer Eva Chara de pré-fechamento 350

Data: 2026-07-30  
PR: #155, aberto e em rascunho  
Head funcional avaliada: `986b21f1d5a1136d8bdce5affe60c061a033930f`

## C — Cenário

O Pack Verbal PT-BR v1 foi estabilizado depois de uma banca vermelha que separou infraestrutura, sobregeração, cooperação entre engines e três fronteiras linguísticas finais.

Evidência da mesma cabeça:

- Mass Notes `30584536527`: auditoria E2, TypeScript, build, **350/350**, publicação, cache e smoke verdes;
- Argila `30584536247`: verde;
- coerência `30584536248`: verde;
- artefato `mass-notes-tiptap-30584536527`;
- artifact ID `8776155458`;
- digest `sha256:1b826aaa98a94d556f7102626611053be206b099b1ba9519c3f0d561bbff0ac7`.

A banca verbal contém 34 casos linguísticos agrupados em seis jornadas por navegador, somando doze execuções novas sobre a matriz anterior de 338.

## L — Limite e impacto

A matriz comprova comportamento reproduzível para o corpus versionado. Ela não comprova cobertura universal do português brasileiro nem autoridade acadêmica.

Permanecem limites importantes:

- o léxico irregular detalhado ainda é curado e limitado a verbos frequentes;
- o inventário legado de formas irregulares é usado apenas como sinal seguro, não como análise inventada;
- não há métrica formal de precisão, revocação ou desempenho por fenômeno;
- a proveniência bibliográfica ainda não está ligada a cada regra;
- a variação regional, de registro e de gênero textual ainda não foi estratificada;
- não houve banca humana independente nem acordo entre anotadores;
- a engine verbal não substitui um parser sintático oracional amplo.

## A — Arquitetura e cobertura comprovadas

A engine verbal é independente da leitura lexical e opera sobre o snapshot vivo e a ocorrência selecionada. Ela não altera o manuscrito.

O corpus v1 comprova:

- paradigmas regulares em `-ar`, `-er` e `-ir`;
- presente, pretéritos, futuros, subjuntivo e formas nominais;
- infinitivo pessoal governado por preposição;
- irregulares frequentes e ambiguidade `ser/ir`;
- próclise, ênclise e mesóclise;
- ajustes ortográficos e forma normativa;
- tempos compostos, futuro perifrástico, progressivo e passiva;
- distinções `canto` substantivo/verbo, `sabia/sábia`, `larga` e `pública`;
- governo local do verbo principal por auxiliares;
- preservação do HTML autoral e ausência de substituição automática.

## R — Parecer Eva Chara

> O Pack Verbal v1 deixou de ser um piloto baseado em exceções e tornou-se uma engine morfológica explicável, com corpus positivo, negativo e contextual. A matriz verde justifica progresso real, mas não autoriza chamá-la de cobertura completa nem de excelência linguística.

### Atualização da rubrica

- Morfologia verbal: **7,0 → 7,8**;
- lacuna para a meta 9,0: **1,2**;
- estado: **Em rota**;
- nota ponderada geral: **6,475 → 6,595**;
- dimensões críticas permanecem: **5**.

Nenhuma outra dimensão recebe aumento nesta cabeça. Engenharia verde não compensa sintaxe, proveniência ou validação humana.

## O — Próximo passo exigido

Eva não recomenda abrir outra engine agora. O próximo passo seguro do E2-V é criar uma tranche adversarial e de proveniência:

1. medir cobertura por fenômeno, não apenas por total de testes;
2. ampliar irregulares por frequência e risco, com fonte registrada;
3. incluir homógrafos, formas defectivas, particípios duplos e construções limítrofes;
4. registrar origem, tradição gramatical, divergência e licença por regra importante;
5. manter um conjunto de avaliação separado do corpus usado para construir as regras;
6. preparar uma pequena banca humana antes de elevar Morfologia verbal acima de 8,0.

O PR permanece em rascunho. Este parecer não autoriza merge, Gate 14 ou lançamento.
