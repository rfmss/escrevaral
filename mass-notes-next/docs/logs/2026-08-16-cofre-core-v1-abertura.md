# Breadcrumb — abertura deliberativa do Cofre Core v1

- Data: 2026-08-16
- Branch: `feat/cofre-core-contract-v1`
- Base: `5174f18c4cd66d4aad572d66abe8009907cc7240`
Estado: **documentação para deliberação; implementação ainda não autorizada**

> **Eva Chara, entre em banca.**

## Cenário

O mantenedor propôs iniciar a etapa em que as engines linguísticas do Escrevaral passam a formar um núcleo capaz de se acoplar a qualquer editor. Também disponibilizou nove obras privadas já cadastradas na Biblioteca de Autoridade e uma cópia histórica das engines.

## Evidência observada

- o Cofre continua `deferred` no mapa canônico;
- a branch existe e ainda parte de uma cabeça integralmente verde;
- Morfologia Verbal é o melhor piloto técnico;
- engines legadas ainda usam globais, `fetch()` relativo e adapters de navegador;
- a cópia histórica é útil como referência forense, mas diverge da branch e não é canônica;
- as nove obras já estão registradas em `docs/sources/source-registry.yaml`;
- `partes.zip` contém apenas derivados fragmentados de seis obras;
- nenhum material bruto foi copiado para o repositório.

## Maior risco antes da fronteira

Transformar uma exceção arquitetural limitada em autorização silenciosa para migrar todas as engines, abrir Sintaxe ampla ou reconstruir conhecimento protegido a partir dos livros.

## Menor próximo passo seguro

Deliberar e registrar um ADR que autorize, no máximo:

1. Contrato v1;
2. registry e DataProvider;
3. transplante sem expansão da Morfologia Verbal;
4. prova em Node, navegador, worker, vanilla e Tiptap;
5. nova parada deliberativa ao final.

## O que permanece bloqueado

- Sintaxe de produção;
- migração geral das engines;
- novo aplicativo ou redesign;
- publicação no npm;
- incorporação de TXT/ZIP/PDF/EPUB;
- reconstrução de dicionários ou exemplos protegidos;
- promoção para `main` ou Gate 14;
- aumento de notas linguísticas.

## Parecer Eva preliminar

- decisão: `PROSSEGUIR COM CONDIÇÕES`;
- notas: sem alteração;
- condição central: aprovação humana explícita da exceção limitada antes do primeiro código;
- próxima banca: fechamento da prova de transplante F3.

## Documento operacional

Ver `docs/memory/2026-08-16-plano-de-voo-cofre-core-v1.md`.
