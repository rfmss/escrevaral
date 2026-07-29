# Memória operacional — Mass Notes Next

Esta pasta permite retomar o subprojeto sem depender do histórico de uma conversa.

## Estado resumido

- Gates 1 a 13 e Gate 10.5: concluídos;
- M0.9: encerrado como auditoria técnica e decisória;
- milestone atual: **M1.0 — Engines superiores ao Escrevaral legado**;
- matriz atual: **138 cenários por navegador, 276 execuções**;
- primeira tranche M1.0: corpus lexical contextual 8/14 → 14/14 casos únicos;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público e substituição integral: `NO-SHIP`;
- P0/P1 conhecidos nas engines: 0/0;
- PR `#155`: aberto e em rascunho;
- `main`, aplicação pública e service worker público: intactos;
- Gate 14: suspenso.

## Ordem de leitura

1. `M1_0_ENGINES_SUPERIORES.md` — memória executável do programa atual;
2. `logs/2026-07-29-m1-e0-e1-lexico-contextual.md` — baseline, seis lacunas e ganho comprovado;
3. `logs/2026-07-29-m0-9-encerramento-m1-abertura.md` — decisão de transição;
4. `PLAN.md` — objetivo e sequência aprovada;
5. `MEMORY.md` — decisões permanentes e estado consolidado;
6. `CHANGELOG.md` — mudanças relevantes;
7. `M0_9_AUDITORIA_OPERACIONAL.md` e `M0_9_ERRATA_MATRIZ.md` — histórico e evidência da auditoria;
8. `logs/2026-07-29-m0-9-decisoes-p2.md` — bloqueios de beta, lançamento e substituição;
9. contratos globais em `../../docs/product/`.

## Regra de continuidade

Antes de cada sessão:

- conferir branch, PR e workflows;
- ler `M1_0_ENGINES_SUPERIORES.md`;
- localizar a fase incompleta E1, E2, E3 ou E4;
- declarar qual engine, caso e evidência serão beneficiados;
- não alterar regra linguística sem caso reproduzível;
- não usar volume de dados ou alertas como prova isolada de qualidade.

Ao implementar uma melhoria de engine:

- congelar a baseline antes da correção;
- registrar entrada, esperado, observado e fonte;
- preferir `ambíguo` ou `indeterminado` a classificação falsa;
- preservar texto, metadados, revisão e autonomia autoral;
- manter processamento local e sem substituição automática;
- adicionar controles negativos contra generalização excessiva;
- repetir a matriz integral em Chromium e Firefox;
- documentar ganho, custo e limites.

Ao encerrar um lote:

- atualizar `M1_0_ENGINES_SUPERIORES.md`;
- criar ou completar log técnico;
- atualizar `PLAN.md`, `MEMORY.md` e `CHANGELOG.md`;
- atualizar contrato global quando a promessa mudar;
- validar a cabeça documental exata;
- registrar SHA e workflows no corpo do PR sem criar commit posterior.

## Baseline histórica a superar

A documentação v916 do legado informa aproximadamente:

- 1.350 entradas de sinônimos;
- 1.020+ definições;
- 110+ casos de polissemia;
- 600+ entradas contextuais em 9 categorias;
- 2.045 formas verbais regulares no presente;
- bancada sintática 17/17 e golden 91/0;
- 10 gestos e 9 campos semânticos no Espelho de Voz;
- enciclopédia 50 e `grammarWords` 348 no RimaLab.

Esses números são adversário de inventário, não selo automático de qualidade.

## Primeira evidência M1.0

Baseline do corpus v1:

- 8/14 casos únicos corretos;
- falhas em `por enquanto`, `enquanto isso`, `publica`, `foi preso`, `estrada larga` e `eu canto`;
- 264/276 execuções aprovadas.

Após a camada contextual tipada:

- 14/14 casos únicos corretos;
- 276/276 execuções aprovadas;
- nenhuma regressão nos oito casos já corretos;
- nenhuma alteração em motores ou dados legados;
- nenhuma mutação do manuscrito ou substituição automática.

Evidência funcional:

- cabeça `d44791ff1a317610c9dd152360cfbb9b168c503a`;
- Mass Notes `30493491424`;
- Argila `30493491638`;
- coerência `30493491411`;
- artefato `mass-notes-tiptap-30493491424`.

## Bloqueios herdados de release

Continuam vigentes:

- PWA/offline próprio ausente;
- `page-flip` externo da Anatomia;
- Prova de Autoria ausente;
- DOCX, RTF, ePub e Obsidian ZIP ausentes;
- zoom real, tecnologias assistivas e dispositivos físicos ainda não validados.

Esses itens não bloqueiam pesquisa e melhoria das engines, mas continuam bloqueando as promessas correspondentes de lançamento ou substituição integral.
