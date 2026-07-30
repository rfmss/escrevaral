# Scorecard Eva Chara — progresso rumo à excelência

Atualizado em: 2026-07-30  
Head funcional de referência: `986b21f1d5a1136d8bdce5affe60c061a033930f`  
Head documental validada: `d5eeb3b4ac53bf623331b5e119a66ad2efdc297f`  
Estado: E2-V v1 estabilizado; PR #155 em rascunho

## Placar atual

| Dimensão | Peso | Atual | Meta | Lacuna | Estado |
|---|---:|---:|---:|---:|---|
| Concepção linguística | 10% | 8,5 | 9,5 | 1,0 | Em rota |
| Autoria, contexto e não automatismo | 10% | 9,0 | 9,5 | 0,5 | Em rota |
| Morfologia verbal | 15% | 7,8 | 9,0 | 1,2 | Em rota |
| Léxico e polissemia | 10% | 6,5 | 9,0 | 2,5 | Crítico |
| Sintaxe e estrutura oracional | 15% | 4,5 | 9,0 | 4,5 | Crítico |
| Variação, registro e norma | 10% | 6,5 | 9,0 | 2,5 | Crítico |
| Fundamentação e proveniência | 10% | 4,5 | 9,0 | 4,5 | Crítico |
| Engenharia e auditabilidade | 10% | 8,5 | 9,5 | 1,0 | Em rota |
| Validação humana e acadêmica | 10% | 4,0 | 9,0 | 5,0 | Crítico |

- nota ponderada atual: **6,595/10**;
- nota ponderada inicial: **6,475/10**;
- meta ponderada: **9,15/10**;
- dimensões críticas: **5**;
- regra: a nota geral nunca compensa dimensão crítica.

## Evidência que alterou a nota

O aumento de Morfologia verbal de 7,0 para 7,8 está preso à cabeça funcional `986b21f1d5a1136d8bdce5affe60c061a033930f` e foi revalidado na cabeça documental `d5eeb3b4ac53bf623331b5e119a66ad2efdc297f`:

- engine verbal própria, tipada e independente da engine lexical;
- 34 casos linguísticos positivos, negativos e contextuais;
- paradigmas regulares, formas nominais, irregulares frequentes, clíticos e locuções;
- ocorrência selecionada e snapshot vivo;
- distinções adversariais como `canto`, `sabia/sábia`, `larga` e `pública`;
- HTML autoral preservado e nenhuma substituição automática;
- matriz integral **350/350** em Chromium e Firefox;
- publicação, cache, smoke, Argila e coerência verdes.

Evidência documental final:

- Mass Notes `30585419280`;
- Argila `30585419262`;
- coerência `30585419245`;
- artefato `mass-notes-tiptap-30585419280`;
- artifact ID `8776474903`;
- digest `sha256:8c2dcbefec1d91dd8ceb1dfdb1f33d9280cc9558044c6997d5912cac0b5ebbf8`.

O avanço não altera Sintaxe, Proveniência ou Validação humana. Testes verdes comprovam reprodutibilidade do corpus versionado, não cobertura universal nem consenso acadêmico.

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

## Ordem atual pela lacuna ponderada

1. validação humana e acadêmica;
2. sintaxe e estrutura oracional;
3. fundamentação e proveniência;
4. léxico e polissemia;
5. variação, registro e norma;
6. morfologia verbal;
7. concepção, autoria e engenharia.

A ordem não significa abandonar o Pack Verbal. O próximo passo imediato é a tranche adversarial e de proveniência do E2-V; a rubrica impede apenas que seu fechamento v1 seja confundido com excelência global.

## Histórico

| Data | Head | Fase | Nota geral | Morfologia verbal | Veredito | Próxima exigência |
|---|---|---|---:|---:|---|---|
| 2026-07-30 | `19c03095e8e70e5c504fbd22b5d8e559ffdff983` | Baseline Eva | 6,475 | 7,0 | Promissor; E2-V ainda em estabilização. | Corpus verde, controles negativos e limites explícitos. |
| 2026-07-30 | `986b21f1d5a1136d8bdce5affe60c061a033930f` | E2-V v1 funcional | 6,595 | 7,8 | Engine morfológica reproduzível; ainda não é cobertura completa. | Corpus adversarial, proveniência por regra, métricas e banca humana. |
| 2026-07-30 | `d5eeb3b4ac53bf623331b5e119a66ad2efdc297f` | Fechamento documental | 6,595 | 7,8 | Parecer, scorecard e planilha revalidados em 350/350. | Iniciar E2-V adversarial e proveniência. |
