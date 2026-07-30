# Scorecard Eva Chara — progresso rumo à excelência

Atualizado em: 2026-07-30  
Head de referência inicial: `19c03095e8e70e5c504fbd22b5d8e559ffdff983`  
Estado: E2-V em estabilização; PR #155 em rascunho

## Placar inicial

| Dimensão | Peso | Atual | Meta | Lacuna | Estado |
|---|---:|---:|---:|---:|---|
| Concepção linguística | 10% | 8,5 | 9,5 | 1,0 | Em rota |
| Autoria, contexto e não automatismo | 10% | 9,0 | 9,5 | 0,5 | Em rota |
| Morfologia verbal | 15% | 7,0 | 9,0 | 2,0 | Atenção |
| Léxico e polissemia | 10% | 6,5 | 9,0 | 2,5 | Crítico |
| Sintaxe e estrutura oracional | 15% | 4,5 | 9,0 | 4,5 | Crítico |
| Variação, registro e norma | 10% | 6,5 | 9,0 | 2,5 | Crítico |
| Fundamentação e proveniência | 10% | 4,5 | 9,0 | 4,5 | Crítico |
| Engenharia e auditabilidade | 10% | 8,5 | 9,5 | 1,0 | Em rota |
| Validação humana e acadêmica | 10% | 4,0 | 9,0 | 5,0 | Crítico |

- nota ponderada inicial: **6,475/10**;
- meta ponderada: **9,15/10**;
- dimensões críticas: **5**;
- regra: a nota geral nunca compensa dimensão crítica.

## Arquivos da planilha

- `EVA_CHARA_PROGRESSO.csv` — fonte versionada, textual e legível por agentes;
- este arquivo — interpretação normativa e regras de atualização;
- `eva_chara_progresso_escrevaral.xlsx` — artefato humano gerado, com fórmulas, gráfico, backlog e histórico; deve ser regenerado a partir da fonte versionada quando houver mudança de nota.

O binário `.xlsx` não é a fonte de verdade do repositório. Isso impede que agentes dependam de um formato opaco e mantém o progresso auditável em diff.

## Como atualizar

Uma nota só muda quando houver, na mesma cabeça:

1. comportamento ou corpus versionado;
2. casos positivos e negativos;
3. matriz integral ou banca humana pertinente;
4. evidência de não regressão;
5. limitações declaradas;
6. parecer Eva registrado em breadcrumb ou fechamento CLARO.

Toda atualização deve acrescentar uma linha ao histórico da planilha com data, SHA, fase, nota, veredito e próxima exigência.

## Ordem inicial pela lacuna ponderada

1. validação humana e acadêmica;
2. sintaxe e estrutura oracional;
3. fundamentação e proveniência;
4. léxico e polissemia;
5. variação, registro e norma;
6. morfologia verbal;
7. concepção, autoria e engenharia.

A ordem não significa abandonar o Pack Verbal em curso. O próximo passo lógico continua sendo estabilizar E2-V; a rubrica impede apenas que seu fechamento seja confundido com excelência global.
