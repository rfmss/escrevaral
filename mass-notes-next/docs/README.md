# Memória operacional — Mass Notes Next

Esta pasta permite que uma pessoa, IA ou plataforma retome o subprojeto sem depender do histórico de uma conversa.

## Ordem de leitura

1. `PLAN.md` — objetivo, fases, gates e próximo passo autorizado;
2. `MEMORY.md` — estado consolidado, decisões e restrições ativas;
3. `CHANGELOG.md` — mudanças relevantes em ordem cronológica;
4. `logs/` — diário técnico de cada lote, incluindo tentativas, falhas e evidências;
5. documentação global em `../../docs/_decisoes/` e `../../docs/product/`.

## Regra de continuidade

Antes de cada lote:

- conferir branch e PR;
- revisar `PLAN.md` e `MEMORY.md`;
- declarar escopo, riscos e critérios de parada;
- não promover preview, arquitetura ou feature sem gate correspondente.

Ao encerrar cada lote:

- atualizar o plano;
- atualizar a memória consolidada;
- registrar mudanças no changelog;
- criar ou completar o log do lote;
- registrar workflow, commit e limitações honestas.

Documentação é parte do produto. Um lote sem memória atualizada não está concluído.