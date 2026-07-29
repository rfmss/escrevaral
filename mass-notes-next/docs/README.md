# Memória operacional — Mass Notes Next

Esta pasta permite retomar o subprojeto sem depender do histórico de uma conversa.

## Estado resumido

- Gates 1 a 13 e Gate 10.5: concluídos funcionalmente;
- matriz anterior ao milestone: 111 cenários por navegador, 222 execuções;
- gate mais recente: importação auditável do `.esc` legado;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- Gate 14 está suspenso até o veredito da auditoria geral;
- PR `#155` permanece em rascunho;
- `main`, aplicação pública e service worker permanecem intactos.

## Ordem de leitura

1. `M0_9_AUDITORIA_OPERACIONAL.md` — execução, decisões, achados, placar e evidências do milestone atual;
2. `PLAN.md` — objetivo, gates e sequência aprovada;
3. `MEMORY.md` — decisões e restrições permanentes;
4. `CHANGELOG.md` — mudanças relevantes;
5. log mais recente em `logs/`;
6. demais arquivos em `logs/`;
7. contratos globais em `../../docs/product/`.

## Regra de continuidade

Antes de cada lote ou sessão de auditoria:

- conferir branch, PR e workflows;
- ler a memória operacional M0.9;
- revisar plano e memória consolidada;
- localizar P0/P1 abertos e a próxima fase incompleta;
- declarar qual evidência será produzida;
- não iniciar feature nova durante o diagnóstico.

Ao tomar decisão importante:

- registrar a decisão em `M0_9_AUDITORIA_OPERACIONAL.md`;
- atualizar placar, paridade ou achados quando aplicável;
- atualizar `PLAN.md` e `MEMORY.md` se a decisão for permanente;
- registrar commit e evidência.

Ao encerrar:

- atualizar plano, memória e changelog;
- criar ou completar log técnico e contrato global;
- atualizar o corpo do PR;
- registrar workflow, commit e limitações;
- repetir a CI sobre a cabeça documental final.

O Gate 14 permanece apenas proposto e está suspenso. Persistir preferências da biblioteca não pode começar antes do veredito M0.9.

Documentação é parte do produto. Um lote sem memória atualizada e evidência final não está concluído.
