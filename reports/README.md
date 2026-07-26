# Relatórios gerados

Este diretório existe apenas como destino convencional para auditores locais e workflows.

Relatórios, capturas, arquivos JSON, logs e resultados datados são saídas de execução. Eles não fazem parte do código-fonte e não devem ser incorporados à `main`.

Onde consultar resultados:

- execução atual: resumo do GitHub Actions;
- evidência temporária: artefato anexado ao workflow;
- decisão durável: registro curado em `docs/_decisoes/`, quando o resultado justificar uma mudança de produto ou arquitetura.

Os scripts podem recriar livremente subdiretórios dentro de `reports/`. Todo conteúdo, exceto este README, é ignorado pelo Git.
