# Memória operacional — Mass Notes Next

Esta pasta permite retomar o subprojeto sem depender do histórico de uma conversa.

## Estado resumido

- Gates 1 a 13 e Gate 10.5: concluídos;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- duas tranches automatizadas: 119 cenários por navegador, 238 execuções verdes;
- nota provisória: 87/100;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público e substituição integral: `NO-SHIP` provisório;
- P0/P1 abertos: 0/0;
- Gate 14 suspenso até o veredito final;
- PR `#155` permanece em rascunho;
- `main`, aplicação pública e service worker permanecem intactos.

## Ordem de leitura

1. `M0_9_AUDITORIA_OPERACIONAL.md` — execução, decisões, achados, placar e evidências;
2. `audits/M0_9_AUDITORIA_GERAL.md` — relatório humano;
3. `audits/M0_9_AUDITORIA_GERAL.json` — estado estruturado;
4. `logs/2026-07-29-m0-9-auditoria-integrada-tranche-2.md` — lote mais recente;
5. `PLAN.md` — objetivo e sequência aprovada;
6. `MEMORY.md` — decisões permanentes;
7. `CHANGELOG.md` — mudanças relevantes;
8. contratos globais em `../../docs/product/`.

## Regra de continuidade

Antes de cada sessão:

- conferir branch, PR e workflows;
- ler a memória operacional M0.9;
- revisar P0/P1 e P2 pendentes de decisão;
- localizar a próxima fase incompleta;
- declarar a evidência que será produzida;
- não iniciar feature nova durante o diagnóstico.

Ao tomar decisão importante:

- registrar em `M0_9_AUDITORIA_OPERACIONAL.md`;
- atualizar placar, paridade ou achados;
- atualizar `PLAN.md` e `MEMORY.md` quando permanente;
- registrar commit e evidência.

Ao encerrar:

- atualizar relatório humano e JSON;
- atualizar plano, memória e changelog;
- criar ou completar log e contrato global;
- atualizar o corpo do PR;
- repetir CI na cabeça documental exata;
- registrar SHA e workflows no PR sem criar commit posterior.

Gate 14 permanece apenas proposto e suspenso. Documentação é parte do produto; um lote sem memória e evidência final não está concluído.
