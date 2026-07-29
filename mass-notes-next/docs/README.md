# Memória operacional — Mass Notes Next

Esta pasta permite retomar o subprojeto sem depender do histórico de uma conversa.

## Estado resumido

- Gates 1 a 13 e Gate 10.5: concluídos;
- matriz: 111 cenários por navegador, 222 execuções;
- gate mais recente: importação auditável do `.esc` legado;
- próximo gate proposto: preferências locais e retomada previsível da biblioteca;
- PR `#155` permanece em rascunho;
- `main`, aplicação pública e service worker permanecem intactos.

## Ordem de leitura

1. `PLAN.md` — objetivo, gates e próximo passo;
2. `MEMORY.md` — decisões e restrições ativas;
3. `CHANGELOG.md` — mudanças relevantes;
4. `logs/2026-07-29-gate-13-importacao-esc-legado.md` — lote mais recente;
5. demais arquivos em `logs/`;
6. `../../docs/product/MASS_NOTES_TIPTAP_GATE_13.md` — contrato global mais recente.

## Regra de continuidade

Antes de cada lote:

- conferir branch, PR e workflows;
- revisar plano e memória;
- inventariar capacidades existentes;
- declarar escopo, riscos e critérios de parada;
- não promover preview ou arquitetura sem gate correspondente.

Ao encerrar:

- atualizar plano, memória e changelog;
- criar log técnico e contrato global;
- atualizar o corpo do PR;
- registrar workflow, commit e limitações;
- repetir a CI sobre a cabeça documental final.

O Gate 14 permanece apenas proposto. Persistir preferências da biblioteca não pode persistir rascunhos, selecionar documentos ou criar efeitos de gravação no IndexedDB.

Documentação é parte do produto. Um lote sem memória atualizada e evidência final não está concluído.
