# Memória operacional — Mass Notes Next

Esta pasta permite que uma pessoa, IA ou plataforma retome o subprojeto sem depender do histórico de uma conversa.

## Estado resumido

- Gates 1 a 12 e Gate 10.5: concluídos;
- matriz: 105 cenários por navegador, 210 execuções;
- gate mais recente: edição segura de metadados editoriais;
- próximo gate proposto: importação auditável do `.esc` legado;
- PR `#155` permanece em rascunho;
- `main`, aplicação pública e service worker permanecem intactos.

## Ordem de leitura

1. `PLAN.md` — objetivo, gates e próximo passo proposto;
2. `MEMORY.md` — estado consolidado, decisões e restrições ativas;
3. `CHANGELOG.md` — mudanças relevantes em ordem cronológica;
4. `logs/2026-07-29-gate-12-metadados-editoriais.md` — lote mais recente;
5. demais arquivos em `logs/` — tentativas, falhas e evidências históricas;
6. documentação global em `../../docs/_decisoes/` e `../../docs/product/`;
7. contrato global mais recente: `../../docs/product/MASS_NOTES_TIPTAP_GATE_12.md`.

## Regra de continuidade

Antes de cada lote:

- conferir branch, cabeça do PR e workflows;
- revisar `PLAN.md` e `MEMORY.md`;
- declarar escopo, riscos e critérios de parada;
- inventariar capacidades existentes antes de criar novos conceitos;
- não promover preview, arquitetura ou feature sem gate correspondente.

Ao encerrar cada lote:

- atualizar o plano;
- atualizar a memória consolidada;
- registrar mudanças no changelog;
- criar ou completar o log técnico;
- atualizar o contrato global de produto;
- atualizar o corpo do PR;
- registrar workflow, commit e limitações honestas;
- repetir a CI sobre a cabeça documental final.

O Gate 13 permanece apenas proposto. Antes de qualquer código, o formato `.esc` legado real deve ser inventariado e o contrato de conversão, pré-visualização e rejeição atômica deve ser aprovado.

Documentação é parte do produto. Um lote sem memória atualizada e evidência final não está concluído.
