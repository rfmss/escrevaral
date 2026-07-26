# Fronteira do repositório público

Data: 2026-07-26

## Problema observado

O repositório público acumulou dezenas de relatórios datados produzidos por auditorias locais e automáticas. Esses arquivos repetiam resultados que já podem ser preservados como resumos e artefatos do GitHub Actions, aumentavam o ruído da navegação e faziam saídas de execução parecerem documentação vigente.

## Decisão

`reports/` deixa de armazenar resultados versionados. Apenas `reports/README.md` permanece na árvore.

Resultados automáticos devem ser mantidos como:

- resumo da execução;
- artefato temporário do workflow;
- registro curado em `docs/_decisoes/` somente quando houver uma decisão durável.

## O que permanece público

- código executável do produto;
- service worker, manifestos e ativos necessários à publicação;
- testes, auditores e workflows reproduzíveis;
- documentação atual;
- decisões arquiteturais duráveis;
- arquivos de governança e suporte.

## O que não deve voltar à `main`

- relatórios datados de execução;
- capturas automáticas;
- logs, estados e arquivos temporários;
- resultados verdes repetitivos;
- credenciais ou infraestrutura local.

## Material operacional ainda presente

Agentes, habilidades e personas não são removidos por esta decisão. Eles só devem sair do repositório público depois que houver um repositório privado dedicado e uma cópia verificada. Repositórios privados de outros projetos não serão reutilizados como destino improvisado.

## Reabertura

Esta decisão pode ser revista quando um relatório específico funcionar como fixture estável ou baseline indispensável. Nesse caso, ele deve ser movido para uma pasta de testes com nome e contrato explícitos, não devolvido ao diretório genérico `reports/`.
