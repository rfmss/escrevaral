# Gate 5 — RimaLab no Mass Notes Tiptap

## Situação

**Aprovado para avaliação manual e continuidade experimental em 2026-07-27.**

- branch: `experiment/mass-notes-tiptap`;
- pull request: `#155` (rascunho);
- workflow funcional: `30319511220`;
- matriz: 30 cenários em Chromium e 30 em Firefox;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública, `main`, service worker, engine e base: não alterados.

Esta aprovação não autoriza merge, lançamento, marcações inline ou alteração automática do manuscrito.

## Objetivo aprovado

Integrar `rimalab-engine.js` e `rimalab-data.json` à nova shell por adaptador tipado, oferecendo uma oficina sonora local que distingue prosa e verso.

## Linguagem de produto

A superfície se chama **RimaLab — oficina sonora**.

Princípios:

- ausência de rima não é defeito;
- prosa não precisa se comportar como verso;
- escansão automática é aproximação pedagógica;
- sinalefa, dicção regional, oralidade e intenção musical podem mudar a contagem;
- resultados são convite à escuta, não veredito;
- nenhuma ação altera o texto.

## Superfície de prosa

A leitura de prosa apresenta:

- modo `Ecos dentro da frase`;
- padrões sonoros internos percebidos;
- palavras agrupadas por eco;
- retorno neutro quando não há padrão;
- ressalva de que a prosa pode trabalhar ritmo sem rimar.

Não há metro, esquema de rimas ou falsa escansão para prosa.

## Superfície de verso

A leitura de verso apresenta:

- quantidade de versos;
- metro dominante aproximado;
- variação entre medidas;
- isometria percebida;
- esquema de rimas;
- nome do esquema quando reconhecido;
- estrofes;
- escansão por verso;
- palavra final e tonicidade;
- sinalefas consideradas;
- pares de rima e classificação;
- retorno neutro para verso livre.

A interface limita visualmente listas muito grandes e preserva rolagem no rail.

## Arquitetura

O adaptador:

1. importa engine e base originais como recursos raw do Vite;
2. instala uma ponte temporária para `rimalab-data.json`;
3. executa a engine clássica;
4. mantém a ponte durante `ensureLoaded()`;
5. compartilha uma única promessa de carregamento;
6. restaura `window.fetch` em `finally`;
7. normaliza o resultado em união discriminada TypeScript de prosa ou verso.

## Fonte sonora derivada

O `plainText` geral separa blocos para leitura e análise comum. Esse formato não preserva adequadamente versos e estrofes para o RimaLab.

Foi criado um serializador derivado do JSON Tiptap que:

- mantém uma linha por parágrafo ou título;
- preserva `hardBreak` como quebra interna;
- mantém blocos vazios como separadores de estrofe;
- achata listas de forma defensiva;
- não modifica o documento armazenado.

JSON Tiptap continua sendo a fonte estrutural de autoridade.

## Matriz final

Os Gates 1 a 5 totalizam 30 cenários em cada navegador, 60 execuções.

O Gate 5 acrescentou:

1. página vazia sem falsa leitura;
2. prosa com ecos internos;
3. prosa sem padrão com retorno neutro;
4. poema rimado com esquema, escansão e pares;
5. bloco vazio preservando duas estrofes;
6. verso livre sem pares com linguagem não punitiva;
7. invalidação após edição;
8. falha controlada sem quebrar editor ou Revisão;
9. seis abas e ausência de overflow no mobile.

## Incidentes encontrados

### Contrato acessível das abas

A primeira implementação capitalizou os rótulos e acrescentou acento a `revisao`, quebrando o contrato usado pelos gates anteriores.

A solução foi restaurar os nomes acessíveis estáveis em minúsculas. A apresentação visual em caixa alta permanece no CSS.

### Corpus neutro que não era neutro

Uma frase escolhida para testar ausência de padrão produziu assonâncias válidas para a heurística.

O corpus foi substituído por finais foneticamente controlados. A engine não foi enfraquecida.

### Rima toante em suposto verso sem rima

A engine percebeu uma rima toante entre “céu” e “luz”. O resultado foi mantido como leitura legítima da heurística; apenas o corpus do teste foi corrigido.

### Estrofes apagadas pelo texto geral

O separador geral de blocos faria cada verso parecer uma estrofe independente. A integração passou a gerar uma fonte sonora específica a partir do JSON Tiptap.

## Evidências

- TypeScript/Vite: aprovado;
- Chromium: aprovado;
- Firefox: aprovado;
- engine e base intactas;
- manuscrito preservado;
- prosa e verso diferenciados;
- estrofes preservadas;
- falha controlada isolada;
- mobile sem overflow;
- preview condicionada ao gate.

Log detalhado: `mass-notes-next/docs/logs/2026-07-27-gate-5-rimalab.md`.

## Limites

Ainda não estão aprovados:

- calibração ampla com cordel, repente, letra de música e variedades regionais;
- busca interativa de rimas;
- enciclopédia completa na nova interface;
- áudio ou leitura em voz alta;
- contrato comum de posições;
- decorations ProseMirror;
- aplicação automática;
- service worker e abertura offline em nova sessão;
- promoção para a aplicação pública.

## Próxima decisão

O mantenedor deve experimentar o RimaLab com prosa, poesia, cordel, canção, verso livre e oralidades diferentes. P0/P1 interrompem o avanço.

Sem bloqueadores e mediante autorização explícita, o próximo gate proposto é o contrato de posições entre texto derivado, offsets das engines e posições ProseMirror, ainda sem mostrar decorations.