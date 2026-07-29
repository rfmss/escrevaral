# Memória operacional — Mass Notes Next

Esta pasta permite retomar o subprojeto sem depender do histórico de uma conversa.

## Estado resumido

- Gates 1 a 13 e Gate 10.5: concluídos;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- primeira tranche: 116 cenários por navegador, 232 execuções verdes;
- nota provisória: 85/100;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público e substituição integral: `NO-SHIP` provisório;
- Gate 14 está suspenso até o veredito final;
- PR `#155` permanece em rascunho;
- `main`, aplicação pública e service worker permanecem intactos.

## Ordem de leitura

1. `M0_9_AUDITORIA_OPERACIONAL.md` — execução, decisões, achados, placar e evidências do milestone atual;
2. `audits/M0_9_AUDITORIA_GERAL.md` — relatório humano e veredito provisório;
3. `audits/M0_9_AUDITORIA_GERAL.json` — estado estruturado;
4. `PLAN.md` — objetivo, gates e sequência aprovada;
5. `MEMORY.md` — decisões e restrições permanentes;
6. `CHANGELOG.md` — mudanças relevantes;
7. log mais recente em `logs/`;
8. contratos globais em `../../docs/product/`.

## Regra de continuidade

Antes de cada sessão de auditoria:

- conferir branch, PR e workflows;
- ler a memória operacional M0.9;
- revisar P0/P1 abertos e P2 pendentes de decisão;
- localizar a próxima fase incompleta;
- declarar qual evidência será produzida;
- não iniciar feature nova durante o diagnóstico.

Ao tomar decisão importante:

- registrar a decisão em `M0_9_AUDITORIA_OPERACIONAL.md`;
- atualizar placar, paridade ou achados quando aplicável;
- atualizar `PLAN.md` e `MEMORY.md` se a decisão for permanente;
- registrar commit e evidência.

Ao encerrar:

- atualizar relatório humano e JSON;
- atualizar plano, memória e changelog;
- criar ou completar log técnico e contrato global;
- atualizar o corpo do PR;
- registrar workflow, commit e limitações;
- repetir a CI sobre a cabeça documental final.

O Gate 14 permanece apenas proposto e suspenso. Persistir preferências da biblioteca não pode começar antes do veredito M0.9.

Documentação é parte do produto. Um lote sem memória atualizada e evidência final não está concluído.
