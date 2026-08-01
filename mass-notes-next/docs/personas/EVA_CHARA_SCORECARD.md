# Scorecard Eva Chara — progresso rumo à excelência

Atualizado em: 2026-08-01  
Head funcional de referência: `0e5177d5c801a4a9b8833af35baa059af486f6c4`  
Head de proveniência de referência: `68c19cfbfc8b442ea8d02be8fcf2c0c38f452f31`  
Estado: infinitivo pessoal fechado em avaliação separada; PR #155 em rascunho

## Placar atual

| Dimensão | Peso | Atual | Meta | Lacuna | Estado |
|---|---:|---:|---:|---:|---|
| Concepção linguística | 10% | 8,5 | 9,5 | 1,0 | Em rota |
| Autoria, contexto e não automatismo | 10% | 9,0 | 9,5 | 0,5 | Em rota |
| Morfologia verbal | 15% | 7,8 | 9,0 | 1,2 | Em rota |
| Léxico e polissemia | 10% | 6,5 | 9,0 | 2,5 | Crítico |
| Sintaxe e estrutura oracional | 15% | 4,5 | 9,0 | 4,5 | Crítico |
| Variação, registro e norma | 10% | 6,5 | 9,0 | 2,5 | Crítico |
| Fundamentação e proveniência | 10% | 5,0 | 9,0 | 4,0 | Crítico |
| Engenharia e auditabilidade | 10% | 8,5 | 9,5 | 1,0 | Em rota |
| Validação humana e acadêmica | 10% | 4,0 | 9,0 | 5,0 | Crítico |

- nota ponderada atual: **6,645/10**;
- nota ponderada anterior: **6,595/10**;
- nota ponderada inicial: **6,475/10**;
- meta ponderada: **9,15/10**;
- dimensões críticas: **5**;
- regra: a nota geral nunca compensa dimensão crítica.

## Evidência que alterou a nota

### Morfologia verbal permanece em 7,8

A engine continua sustentada por:

- arquitetura própria, tipada e independente da engine lexical;
- 34 casos de desenvolvimento positivos, negativos e contextuais;
- paradigmas regulares, formas nominais, irregulares frequentes, clíticos e locuções;
- ocorrência selecionada e snapshot vivo;
- preservação do HTML autoral e ausência de substituição automática;
- matriz integral **352/352** em Chromium e Firefox.

O fechamento de um fenômeno adversarial melhora a evidência, mas não comprova cobertura morfológica ampla. Morfologia não ultrapassa 8,0 antes de banca humana e expansão adversarial de outras famílias.

### Fundamentação e proveniência sobe de 4,5 para 5,0

O infinitivo pessoal é a primeira família verbal a percorrer o caminho completo exigido pela Eva:

1. fonte bibliográfica identificável;
2. escopo declarado;
3. tradição e uso brasileiro contrastados;
4. divergências publicadas;
5. licença ou condição de uso registrada;
6. corpus de avaliação separado do corpus de desenvolvimento;
7. positivos e negativos;
8. métricas por navegador;
9. matriz integral sem regressão;
10. fechamento CLARO com limites explícitos.

Evidência da banca separada:

- workflow `30718951198`;
- 12 casos por navegador, **24/24** execuções;
- VP 16, VN 8, FP 0 e FN 0;
- precisão, recall e acurácia: **100%**;
- artifact ID `8824240160`;
- digest `sha256:06978a08feb9b9226e5034dc2ef105d2560c95629b3cd991db2a93b8d0560bda`.

Evidência da matriz integral:

- workflow `30718951187`;
- Chromium `176/176`;
- Firefox `176/176`;
- total **352/352**;
- build, publicação, cache e smoke público verdes;
- artifact ID `8824558548`;
- digest `sha256:601a53a5dbc522b5cc5b7a2bc355d0240892429f62944ab93ea4d41d8646374e`.

O aumento é deliberadamente pequeno. Sete das oito famílias do registro verbal ainda estão em `pending` ou `partial`, e a proveniência lexical global continua incompleta.

## O que não pode ser alegado

- cobertura universal do infinitivo pessoal;
- consenso entre tradições gramaticais;
- representatividade regional, geracional ou de gênero textual;
- excelência linguística global;
- validação acadêmica independente;
- parser sintático oracional amplo;
- autorização para Gate 14, merge ou lançamento.

## Arquivos da planilha

- `EVA_CHARA_PROGRESSO.csv` — fonte versionada, textual e legível por agentes;
- este arquivo — interpretação normativa e regras de atualização;
- `eva_chara_progresso_escrevaral.xlsx` — artefato humano gerado, com fórmulas, gráfico, backlog e histórico; deve ser regenerado a partir da fonte versionada quando houver mudança de nota.

O binário `.xlsx` não é a fonte de verdade do repositório.

## Como atualizar

Uma nota só muda quando houver:

1. comportamento ou corpus versionado;
2. casos positivos e negativos;
3. matriz integral ou banca humana pertinente;
4. evidência de não regressão;
5. limitações declaradas;
6. parecer Eva registrado em breadcrumb ou fechamento CLARO.

Toda atualização deve acrescentar uma linha ao histórico com data, SHA, fase, nota, veredito e próxima exigência.

## Ordem atual pela lacuna ponderada

1. validação humana e acadêmica;
2. sintaxe e estrutura oracional;
3. fundamentação e proveniência das famílias restantes;
4. léxico e polissemia;
5. variação, registro e norma;
6. morfologia verbal;
7. concepção, autoria e engenharia.

O próximo passo de produto é a auditoria formal de paridade entre o Escrevaral legado e o Mass Notes. Ela deve separar capacidade presente, superior, parcial, ausente, aposentada e bloqueadora. Nenhuma nova regra de infinitivo pessoal entra sem corpus positivo e negativo adicional.

## Histórico

| Data | Head | Fase | Nota geral | Morfologia verbal | Proveniência | Veredito | Próxima exigência |
|---|---|---|---:|---:|---:|---|---|
| 2026-07-30 | `19c03095e8e70e5c504fbd22b5d8e559ffdff983` | Baseline Eva | 6,475 | 7,0 | 4,5 | Promissor; E2-V ainda em estabilização. | Corpus verde, controles negativos e limites explícitos. |
| 2026-07-30 | `986b21f1d5a1136d8bdce5affe60c061a033930f` | E2-V v1 funcional | 6,595 | 7,8 | 4,5 | Engine morfológica reproduzível; ainda não é cobertura completa. | Corpus adversarial, proveniência por regra, métricas e banca humana. |
| 2026-07-30 | `d5eeb3b4ac53bf623331b5e119a66ad2efdc297f` | Fechamento documental v1 | 6,595 | 7,8 | 4,5 | Parecer e planilha revalidados em 350/350. | Iniciar E2-V adversarial e proveniência. |
| 2026-08-01 | `0e5177d5c801a4a9b8833af35baa059af486f6c4` | Infinitivo pessoal verificado | 6,645 | 7,8 | 5,0 | Primeira família com fonte, corpus separado e 24/24; escopo permanece estreito. | Auditar paridade e fundamentar as demais famílias. |
