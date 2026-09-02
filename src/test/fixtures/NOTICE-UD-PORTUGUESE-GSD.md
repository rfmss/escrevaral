# UD Portuguese-GSD — atribuição da banca

As fixtures `morphology-ud-portuguese-gsd.json` e
`relative-clause-ud-portuguese-gsd.json` derivam anotações e janelas
contextuais curtas de:

- projeto: Universal Dependencies — Portuguese GSD;
- repositório: `UniversalDependencies/UD_Portuguese-GSD`;
- commit: `c91edee46c9d096c684dda4848637dff5f4299e9`;
- licença declarada: CC BY-SA 4.0;
- origem linguística: português brasileiro;
- arquivos e identificadores de sentença: registrados em cada caso da fixture.

O corpus não entra no runtime, no cache offline ou na distribuição do
Escrevaral. As fixtures existem somente para verificação reproduzível. O README
da fonte informa que UPOS foi convertido de anotação manual, enquanto lemas e
features são automáticos, e separa os direitos das anotações dos direitos do
texto subjacente. Por isso, somente o menor contexto necessário foi preservado.

Na fixture de orações adjetivas, `acl:relcl` e a distinção `PRON`/`CCONJ`
sustentam detecção ou abstenção. Esses rótulos não provam, sozinhos, a leitura
semântica explicativa/restritiva; os casos positivos externos permanecem
`ambigua` quando não há evidência textual forte.

Fontes:

- https://universaldependencies.org/treebanks/pt_gsd/index.html
- https://github.com/UniversalDependencies/UD_Portuguese-GSD/blob/c91edee46c9d096c684dda4848637dff5f4299e9/README.md
- https://github.com/UniversalDependencies/UD_Portuguese-GSD/blob/c91edee46c9d096c684dda4848637dff5f4299e9/LICENSE.txt
