# Gate 6 — contrato de posições no Mass Notes Tiptap

## Situação

**Aprovado para avaliação manual e continuidade experimental em 2026-07-28.**

- branch: `experiment/mass-notes-tiptap`;
- pull request: `#155` (rascunho);
- workflow funcional: `30323402744`;
- matriz: 40 cenários em Chromium e 40 em Firefox;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública, `main`, service worker, engines e bases: não alterados.

Esta aprovação não autoriza merge, lançamento, decorations visíveis ou alteração automática do manuscrito.

## Objetivo aprovado

Criar uma infraestrutura comum e reversível entre:

- texto derivado usado por análises linguísticas;
- offsets devolvidos por engines;
- posições internas do ProseMirror.

O gate prova apenas o contrato. Não mostra sublinhados, highlights ou tooltips.

## Modelo do snapshot

O snapshot versão 1 contém:

- `documentId`;
- `contentSignature`;
- `offsetEncoding: "utf-16"`;
- separador de blocos `\n\n`;
- separador de `hardBreak` `\n`;
- texto derivado;
- tamanho do documento ProseMirror;
- blocos textuais;
- segmentos de texto, quebra, átomo e separador virtual.

## Identidades distintas

### Documento

`documentId` responde: **de qual página veio este resultado?**

Duas páginas com o mesmo conteúdo possuem IDs diferentes.

### Conteúdo estrutural

`contentSignature` responde: **a estrutura analisada ainda é esta?**

A assinatura é calculada sobre uma serialização estável do JSON Tiptap. Ela muda quando um parágrafo vira título, mesmo que as palavras permaneçam iguais. Não depende de `revision` e não é apenas hash do texto visível.

## Codificação dos offsets

Offsets usam unidades de código UTF-16, compatíveis com:

- `String#indexOf`;
- regex JavaScript;
- comprimentos de strings;
- offsets dentro de nós textuais do ProseMirror.

Consequência explícita: um emoji como `🌿` ocupa duas unidades UTF-16, embora seja percebido como um grafema visual.

O contrato não chama essas unidades de “caracteres” para evitar ambiguidade.

## Texto derivado

O texto nasce do Node ProseMirror real, não de HTML reparseado.

Regras:

- cada textblock vira um bloco textual;
- texto inline mantém seus offsets UTF-16;
- `hardBreak` vira um `\n` real e mapeável;
- blocos vizinhos recebem `\n\n` virtual;
- blocos vazios preservam âncora própria;
- átomos inline desconhecidos recebem caractere de substituição de objeto;
- listas são atravessadas até seus parágrafos internos;
- wrappers sem texto não inventam conteúdo.

## Separadores virtuais e afinidade

Os dois `\n` entre blocos não existem como caracteres editáveis no ProseMirror. Por isso um offset no interior do separador exige afinidade:

- `backward`: fim do bloco anterior;
- `forward`: início do próximo bloco.

Um range composto apenas por separadores virtuais colapsa em fronteira segura. Isso impede uma futura decoration de selecionar wrappers ou produzir marcação fantasma.

## Blocos vazios

Blocos vazios não são descartados.

Isso inclui o parágrafo final que o Tiptap mantém depois de certos títulos e listas para permitir continuidade da escrita. O texto visível pode ser igual, mas a estrutura derivada registra esse bloco com separador final e âncora própria.

## API aprovada

O contrato oferece:

1. offset textual → posição ProseMirror;
2. posição ProseMirror → offset textual;
3. range textual → range ProseMirror;
4. range ProseMirror → range textual;
5. afinidade anterior ou posterior;
6. clamp defensivo;
7. colapso seguro de ranges virtuais.

A API de integração é anexada à instância DOM atual do editor para QA e consumo interno futuro. Isso não transforma DOM em fonte de autoridade e não autoriza engines a manipulá-lo.

## Pureza

As consultas foram testadas para não alterar:

- HTML;
- seleção;
- documento;
- histórico;
- manuscrito persistido.

Nenhum elemento, classe ou atributo de decoration foi criado.

## Matriz final

A suíte completa possui 40 cenários por navegador, 80 execuções.

O Gate 6 acrescentou nove cenários:

1. documento vazio com âncora estável;
2. acentos e emoji em UTF-16;
3. afinidade e range exclusivamente virtual;
4. `hardBreak` com largura unitária;
5. títulos e listas através de wrappers;
6. bloco vazio entre separadores consecutivos;
7. assinatura estrutural com texto visível equivalente;
8. identidade de documento separada da assinatura;
9. clamp, range invertido e pureza de consulta.

## Incidentes encontrados

### Serialização estrita

`JSON.stringify()` pode devolver `undefined`. A assinatura normaliza esse caso para uma representação determinística.

### Ciclo de vida Tiptap

A versão usada não fornece `{ editor }` no callback `onDestroy`. O cleanup foi removido porque a propriedade de integração pertence ao próprio nó descartado.

### Pipeline com `tee`

O primeiro registro de `build.log` mascarou o código de saída da compilação. O workflow agora usa `set -o pipefail`, mantendo log e falha real.

### Parágrafo final

O primeiro auditor tratou o parágrafo vazio final como ruído. O teste foi corrigido para preservar a estrutura válida.

### Contagem da suíte

A documentação anterior dizia 30 cenários por navegador no Gate 5. O relatório agregado mostrou 31 antes do Gate 6. Com nove cenários novos, a fonte de verdade atual é 40 por navegador.

## Evidências

- TypeScript/Vite: aprovado;
- Chromium: 40/40;
- Firefox: 40/40;
- total: 80 execuções;
- gates anteriores: aprovados novamente;
- preview: publicada após gate verde;
- artefato: relatório Playwright e `build.log`;
- workflow: `30323402744`;
- commit funcional: `59d83c82056db14d898c9a9ca9276807607caeb3`.

Log detalhado: `mass-notes-next/docs/logs/2026-07-28-gate-6-contrato-posicoes.md`.

## Limites

Ainda não estão aprovados:

- auditoria ampla com textos reais, Unicode combinante e listas profundamente aninhadas;
- decorations ProseMirror;
- sublinhados, highlights ou tooltips;
- navegação acessível entre issue e trecho;
- substituição automática;
- service worker e abertura offline em nova sessão;
- promoção para a aplicação pública.

## Próxima decisão

O mantenedor deve auditar ranges com textos reais antes de autorizar qualquer decoration.

Sem bloqueadores e mediante autorização explícita, o próximo gate proposto é um plugin ProseMirror de decorations somente de leitura, começando por uma engine e sempre verificando `documentId` e `contentSignature` antes de aplicar resultados.