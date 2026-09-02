# Morfologia Verbal — SPEC

**Engine:** VERB-MORPH · **Domínio:** morfologia-verbal · **Versão:** 1.2.2

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
- guarda nominal imediata: artigo, possessivo ou cardinal pequeno antes da forma prevalece sobre gatilhos verbais distantes;
- contração `ao` reconhecida como introdutor de infinitivo flexionado;
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

A regra só deriva uma forma quando o lema está no léxico core carregado. A versão 1.2.1 impede que homógrafos como `seus deveres` e `os olhares` sejam promovidos por uma preposição ou conjunção anterior. A versão 1.2.2 acrescenta as fronteiras externas `três andares` (nome) e `Ao passarem` (verbo).

## Limites
- não é parser oracional;
- não cobre todo o léxico verbal;
- não resolve universalmente sujeitos recuperáveis;
- não prescreve obrigatoriedade de flexão;
- não cobre ainda irregulares amplos, defectivos, particípios duplos ou locuções;
- a guarda nominal cobre artigos, demonstrativos, possessivos e cardinais de dois a dez; não substitui resolução lexical ampla;
- ambiguidade, registro e variação regional continuam parcialmente desconhecidos.

## Evidência reproduzível
- regressão legada: 14/14;
- runtime serializado: 5/5 na versão anterior, preservado por compatibilidade;
- banca congelada de infinitivo pessoal: 12/12;
- banca negativa de trechos intocados do legado: 7/9 antes da correção, 9/9 depois;
- banca externa UD Portuguese-GSD: 6/8 antes da correção, 8/8 depois;
- runtime serializado na versão 1.2.1: 5/5;
- origem exata das bancas e regras: [PROVENANCE.json](PROVENANCE.json);
- gate físico da versão 1.2.0: 12/12;
- gate físico da versão 1.2.1: 21/21 no iPad MD531GP/A com iOS 9.3.5; mediana quente de 2.658 ms (~127 ms/caso);
- gate físico da versão 1.2.2 com 29 casos: pendente.

## Artefatos
- engine: 13.593 bytes;
- seed de formas: 1.896 bytes;
- exceções: 305 bytes;
- lemas core: 1.397 bytes;
- tokenizador: 1.291 bytes;
- total aproximado do núcleo carregável: 18.482 bytes.

## Fontes
- base ES5: inventário Antigravity em `catalogo/fonte-C-antigravity.md`;
- tranche contextual e banca: Mass Notes preservado em `rfmss/escrevaral@816ca7ea2140f49b93a5bfaeabd0b898871760e5`;
- corpus externo: UD Portuguese-GSD no commit `c91edee46c9d096c684dda4848637dff5f4299e9`, CC BY-SA 4.0, usado somente em teste;
- detalhes de caminhos, condições de uso e lacunas em [PROVENANCE.json](PROVENANCE.json).
