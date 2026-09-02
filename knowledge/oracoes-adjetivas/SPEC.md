# Orações Adjetivas — SPEC

**Engine:** REL-CLAUSE · **Domínio:** oracoes-adjetivas · **Versão:** 1.1.0

## Missão
Reconhecer construções introduzidas por `que` e classificar somente quando houver evidência textual forte de leitura restritiva ou explicativa. Na dúvida, devolver `ambigua`; diante de conjunção integrante, não interferir.

## Entrada / saída
- Entrada: uma fatia de texto preservando posições originais.
- Saída: zero ou mais Findings sobre o antecedente, com tipo, confiança e orientação.
- Execução no produto: uma cápsula Worker por vez; resposta devolvida; Worker terminado.

## Arquitetura
- varredura sequencial de `que`;
- extração conservadora do antecedente numa janela curta;
- normalização ES5 por mapa explícito de acentos;
- dicionários pequenos de determinantes, delimitadores e verbos de complemento;
- contrações nominais brasileiras reconhecidas sem léxico residente amplo;
- preposição relativa final separada do antecedente (`na área em que`);
- abstenção em comparativas delimitadas e conjunções integrantes conhecidas;
- nenhuma dependência, módulo, Promise, `fetch`, parser universal ou tabela grande.

## Cobertura atual
- restritiva com delimitador explícito (`apenas`, `somente`, `só`);
- explicativa com referente único curado;
- explicativa com quatro propriedades gerais curadas;
- ambiguidade como saída padrão;
- antecedente com artigo, possessivo, demonstrativo, `outro` e contrações curadas;
- relativas preposicionadas simples;
- abstenção em lista curada de verbos introdutores de complemento;
- `o que` demonstrativo permanece fora do escopo deliberado.

## Limites
- não é parser oracional;
- não cobre todo pronome relativo (`cujo`, `onde`, `quem`, `o qual`);
- antecedentes nus sem determinante podem ser omitidos;
- a lista de verbos de complemento não é universal;
- o corpus externo confirma relativo versus complemento, mas não valida sozinho explicativa versus restritiva;
- intenção, variação regional e aceitabilidade exigem revisão humana.

## Evidência reproduzível
- banca original Encore: 11/11;
- banca externa UD Portuguese-GSD: 2/9 antes da correção, 9/9 depois;
- todas as suítes do branch: 157/157 após a correção;
- gate físico com 19 casos no iPad MD531GP/A, iOS 9.3.5: pendente;
- a alegação legada `22/22 + 1915/1915` não é reproduzível no snapshot GitHub disponível e não sustenta promoção.

## Artefatos
- engine: 14.097 bytes;
- banca externa: 3.264 bytes, somente em teste;
- runner externo: 1.460 bytes, somente em teste;
- runtime da cápsula: contratos + engine; nenhum corpus entra na RAM do produto.

## Fontes
- comportamento legado: catálogo do Escrevaral; artefato original e bateria não preservados no commit auditado;
- corpus externo: UD Portuguese-GSD no commit `c91edee46c9d096c684dda4848637dff5f4299e9`, CC BY-SA 4.0, usado somente em teste;
- detalhes e lacunas: [PROVENANCE.json](PROVENANCE.json).
