# Morfologia Verbal — SPEC

**Engine:** VERB-MORPH · **Domínio:** morfologia-verbal · **Versão:** 1.2.0

## Missão
Identificar formas verbais do português brasileiro — lema e flexão — com baixa RAM, offline e em ES5, sem transformar ambiguidade em certeza.

## Entrada / saída
- Entrada: trecho contínuo tokenizado com spans no texto original.
- Saída: zero ou mais Findings com lema, flexão e posição.
- Execução no produto: uma cápsula Worker por vez; resposta devolvida; Worker terminado.

## Arquitetura
- trie curta para formas curadas;
- lista explícita de exceções;
- léxico core de 65 lemas para autorizar regras produtivas;
- regra contextual delimitada para infinitivo pessoal;
- nenhuma tabela universal de conjugações residente;
- nenhuma dependência de framework, módulo, Promise, `fetch` ou Service Worker.

## Cobertura atual

### Base curada
- 11 formas completas;
- 4 exceções "não se meta";
- ênclise e mesóclise nos casos legados: `fazê-lo`, `dar-te-ei`, `vendê-la`.

### Tranche 1 — infinitivo pessoal
- formas flexionadas regulares em -ar, -er e -ir:
  - 2ª pessoa singular;
  - 1ª, 2ª e 3ª pessoas do plural;
- formas não flexionadas de 1ª e 3ª pessoas do singular quando há sujeito expresso imediatamente anterior;
- distinção contextual delimitada entre:
  - infinitivo pessoal;
  - infinitivo impessoal;
  - futuro do subjuntivo homógrafo;
  - infinitivo substantivado;
- construção avaliativa delimitada: `é melhor sairmos`.

A regra só deriva uma forma quando o lema está no léxico core carregado.

## Limites
- não é parser oracional;
- não cobre todo o léxico verbal;
- não resolve universalmente sujeitos recuperáveis;
- não prescreve obrigatoriedade de flexão;
- não cobre ainda irregulares amplos, defectivos, particípios duplos ou locuções;
- ambiguidade, registro e variação regional continuam parcialmente desconhecidos.

## Evidência reproduzível
- regressão legada: 14/14;
- runtime serializado: 5/5 na versão anterior, preservado por compatibilidade;
- banca congelada de infinitivo pessoal: 12/12;
- origem exata da banca e das regras: [PROVENANCE.json](PROVENANCE.json);
- gate físico da versão 1.2.0: pendente.

## Artefatos
- engine: 12.519 bytes;
- seed de formas: 1.895 bytes;
- exceções: 304 bytes;
- lemas core: 1.396 bytes;
- tokenizador: 1.290 bytes;
- total aproximado do núcleo carregável: 17.404 bytes.

## Fontes
- base ES5: inventário Antigravity em `catalogo/fonte-C-antigravity.md`;
- tranche contextual e banca: Mass Notes preservado em `rfmss/escrevaral@816ca7ea2140f49b93a5bfaeabd0b898871760e5`;
- detalhes de caminhos, condições de uso e lacunas em [PROVENANCE.json](PROVENANCE.json).
