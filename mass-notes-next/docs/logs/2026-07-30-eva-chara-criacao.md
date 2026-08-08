# Criação da persona Eva Chara e da trilha de excelência

Data: 2026-07-30  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155`, aberto e em rascunho

## C — Cenário

O Escrevaral precisava transformar uma avaliação crítica de maturidade linguística em método permanente, visível para humanos e agentes de IA.

## L — Limite e impacto

Sem uma rubrica explícita, o projeto poderia:

- confundir teste verde com validação linguística;
- premiar quantidade de regras em vez de qualidade;
- permitir que engenharia forte mascarasse sintaxe, proveniência ou validação humana fracas;
- perder critérios e decisões quando outra IA retomasse o trabalho.

## A — Arquitetura escolhida

Foi criada a persona crítica fictícia **Eva Chara**, sem representação ou imitação de Evanildo Bechara ou da ABL.

Peças:

- `AGENTS.md` — convocação automática para agentes;
- `EVA_CHARA.md` — aceno na raiz;
- `docs/personas/EVA_CHARA.md` — identidade, alma, rubrica, poderes e limites;
- `docs/personas/EVA_CHARA_PROMPT.md` — prompt curto e completo;
- `docs/personas/EVA_CHARA_SCORECARD.md` — notas, metas e regra de atualização;
- `docs/personas/EVA_CHARA_PROGRESSO.csv` — fonte textual versionada;
- artefato Excel gerado — painel humano com fórmulas, gráfico, backlog e histórico;
- `docs/METHODS.md` — integração CLARO + Eva;
- este breadcrumb.

## R — Resultado esperado

Qualquer agente que entre em `mass-notes-next/` encontra a instrução de convocar Eva antes de trabalho linguístico relevante.

A baseline inicial é 6,475/10, meta ponderada 9,15/10 e cinco dimensões críticas. A média nunca compensa dimensão crítica.

## O — O que permanece aberto

- notas são heurísticas internas, não certificação acadêmica;
- Eva não substitui fontes ou banca humana;
- o Pack Verbal E2-V continua em estabilização;
- a planilha deve ser atualizada somente por evidência na cabeça exata;
- o próximo passo lógico permanece fechar a matriz do E2-V, não abrir outra engine.

## Governança

Nenhum merge, promoção para `main`, Gate 14 ou lançamento foi autorizado.
