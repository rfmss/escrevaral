# Parecer Eva Chara — infraestrutura de proveniência e avaliação separada

Data: 2026-07-31  
Cabeça anterior validada: `44d3d8b7`  
Cabeça avaliada: `2832f6c8`

## Mudança significativa detectada

A cabeça avaliada está nove commits à frente e acrescenta duas fundações importantes para o E2-V:

- registro estruturado de proveniência das regras verbais;
- conjunto de avaliação separado do corpus de desenvolvimento;
- configuração própria para essa avaliação;
- auditor automatizado das evidências verbais.

A candidata passou integralmente nos workflows Mass Notes Tiptap, Argila e coerência. Esse verde demonstra não regressão técnica da infraestrutura, mas a banca adversarial separada ainda não integrava uma execução própria de CI.

## Dimensões afetadas

| Dimensão | Antes | Proposta | Decisão |
| --- | ---: | ---: | --- |
| Morfologia verbal | 7,8 | 7,8 | Mantida |
| Fundamentação e proveniência | 4,5 — Crítico | 4,5 — Crítico com infraestrutura iniciada | Sem aumento |
| Validação humana e acadêmica | 4,0 — Crítico | 4,0 — Crítico com avaliação separada inicial | Sem aumento |
| Engenharia e auditabilidade | 8,5 | 8,5 | Mantida |
| Nota geral | 6,595 | 6,595 | Mantida |

## Evidência positiva

A proveniência possui esquema versionado, estados explícitos — `pending`, `partial`, `verified` e `disputed` — e uma regra correta: nenhuma entrada pode ser considerada verificada sem fonte, escopo, tradição ou uso e licença registrados.

O registro separa:

- paradigmas regulares;
- infinitivo pessoal;
- irregulares curados;
- clíticos;
- locuções;
- homógrafos;
- verbos defectivos;
- particípios duplos.

A criação de corpus de avaliação separado reduz o risco de medir a engine apenas com exemplos utilizados durante o próprio desenvolvimento.

## Por que a nota não sobe

O registro é infraestrutura de proveniência, não proveniência concluída:

- nenhuma regra possui fonte bibliográfica registrada;
- nenhuma licença ou condição de uso concreta foi preenchida;
- a maior parte das regras continua como `pending`;
- irregulares e homógrafos estão apenas como `partial`;
- defectivos e particípios duplos continuam não implementados;
- ainda não havia métricas por fenômeno;
- não houve julgamento humano independente.

## Veredito

> A tranche avançou corretamente da intenção para a infraestrutura auditável. Isso é progresso real, mas ainda não é conhecimento linguístico fundamentado. A nota permanece estável até que ao menos uma família de regras atravesse o percurso completo: fonte → escopo → divergências → licença → corpus separado → métrica → parecer.

## Menor próximo passo seguro

Escolher um único fenômeno, **infinitivo pessoal**, e levá-lo de `pending` para `verified`:

1. registrar fontes identificáveis;
2. declarar tradição normativa e uso brasileiro;
3. documentar divergências;
4. registrar licença ou condição de uso;
5. criar positivos, negativos e casos limítrofes no conjunto separado;
6. publicar precisão e erros observados;
7. executar a matriz integral;
8. convocar nova banca Eva.

Nenhuma nova engine deve ser aberta antes disso.

## Decisão

**PROSSEGUIR COM CONDIÇÕES.**

A nota permanece em `6,595`. O PR continua em rascunho; `main`, produto público e Gate 14 permanecem protegidos.
