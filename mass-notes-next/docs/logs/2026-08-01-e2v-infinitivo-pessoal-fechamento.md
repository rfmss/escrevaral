# E2-V — fechamento do infinitivo pessoal com avaliação separada

Data: 2026-08-01  
Status de entrada: **não reproduzida na cabeça atual; fechamento documental necessário**  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Cabeça funcional observada: `0e5177d5c801a4a9b8833af35baa059af486f6c4`

> **Eva Chara, entre em banca.**

## C — Cenário observado

A retomada partiu da hipótese de que o caso adversarial abaixo ainda falhava:

> É melhor sairmos agora para evitar a chuva.

A proveniência versionada ainda registrava `22/24`, recall `0,875` e `eval-inf-pessoal-nos-oculto` como falha restante. Porém, a execução da banca na cabeça funcional atual demonstrou que essa informação estava desatualizada:

- `eval-inf-pessoal-nos-oculto` passou em Chromium;
- `eval-inf-pessoal-nos-oculto` passou em Firefox;
- os doze casos da tranche passaram nos dois navegadores;
- a matriz integral também permaneceu verde.

O comportamento atual já contém a menor distinção necessária: a forma flexionada recebe apoio na construção avaliativa `é melhor`, sem transformar os infinitivos impessoais, o infinitivo substantivado ou o futuro do subjuntivo em infinitivo pessoal.

## L — Limite e impacto

A falha funcional não é reproduzível na cabeça atual. Alterar novamente a engine criaria risco de sobregeração sem ganho demonstrável.

A dívida real é de sincronização entre:

- comportamento e banca atuais;
- `docs/linguistics/verb-provenance.json`;
- scorecard e planilha textual da Eva;
- README, plano e documento M1.0;
- corpo do PR.

O verde comprova somente os doze contratos separados desta tranche. Ele não demonstra cobertura universal do infinitivo pessoal, consenso teórico, estratificação sociolinguística ou validação humana independente.

## A — Arquitetura ou ação escolhida

Não alterar a engine.

Fechar a tranche por evidência:

1. preservar `contextResolver.ts`, `simpleAnalyzer.ts` e os corpora;
2. atualizar a avaliação do fenômeno para `24/24`, precisão `1`, recall `1` e acurácia `1`;
3. marcar somente `personal-infinitive` como `verified` dentro do escopo declarado;
4. registrar os identificadores da banca e da matriz integral;
5. manter as demais famílias verbais em `pending` ou `partial`;
6. atualizar a Eva sem elevar Morfologia verbal acima de `8,0` antes de banca humana;
7. manter Gate 14, `main` e lançamento bloqueados.

## R — Resultado reproduzível

### Banca separada do fenômeno

- workflow: **Banca E2-V — infinitivo pessoal**;
- execução: `30718951198`;
- Chromium: `12/12`;
- Firefox: `12/12`;
- total: `24/24`;
- VP: `16`;
- VN: `8`;
- FP: `0`;
- FN: `0`;
- precisão: `100%`;
- recall: `100%`;
- acurácia: `100%`;
- artifact ID: `8824240160`;
- digest: `sha256:06978a08feb9b9226e5034dc2ef105d2560c95629b3cd991db2a93b8d0560bda`.

### Matriz integral

- workflow: **Mass Notes Tiptap**;
- execução: `30718951187`;
- Chromium: `176/176`;
- Firefox: `176/176`;
- total: `352/352`;
- build, publicação, renovação de cache e smoke público: verdes;
- artifact ID final: `8824558548`;
- digest: `sha256:601a53a5dbc522b5cc5b7a2bc355d0240892429f62944ab93ea4d41d8646374e`.

## O — O que permanece aberto

- a avaliação separada possui doze casos do fenômeno, não uma amostra representativa de todo o português brasileiro;
- variação regional, registro, gênero textual, frequência e aceitabilidade ainda não foram estratificados;
- a regra de construção avaliativa continua uma hipótese computacional delimitada, não uma descrição sintática geral;
- não existe parser oracional amplo;
- outras famílias verbais ainda carecem de proveniência e avaliação completa;
- banca humana independente permanece ausente;
- a nota geral não pode compensar Sintaxe, Proveniência global e Validação humana críticas;
- Gate 14, merge e lançamento continuam suspensos.

## Parecer Eva — entrada do fechamento

- **Morfologia verbal:** evidência suficiente para reconhecer o fechamento desta tranche específica, sem alegação universal;
- **Fundamentação e proveniência:** uma família percorreu fonte, escopo, divergências, licença, avaliação separada e métrica;
- **Validação humana e acadêmica:** permanece crítica;
- **decisão:** `PROSSEGUIR COM CONDIÇÕES` para sincronização documental e auditoria de paridade; `BLOQUEAR` nova expansão desta regra sem novo corpus positivo e negativo.
