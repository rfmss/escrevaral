# Gate 4 — Termos que pedem contexto no Mass Notes Tiptap

## Situação

**Aprovado para avaliação manual e continuidade experimental em 2026-07-27.**

- branch: `experiment/mass-notes-tiptap`;
- pull request: `#155` (rascunho);
- commit funcional documentado: `e6c9886813ce5873a1e7702b40246d94cc8cb6ba`;
- commit visual validado: `741340070f5f37f420aaee0f2f76ad74b7f734f7`;
- workflow funcional: `30316728298`;
- workflow visual: `30316983906`;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública, `main`, service worker, engine e base: não alterados.

Esta aprovação não autoriza merge, lançamento, alteração automática do manuscrito ou decorations dentro do editor.

## Objetivo aprovado

Integrar `decolonial-engine.js` e `decolonial-data.json` à nova shell por um adaptador tipado, apresentando as ocorrências como leitura histórica, social e narrativa que depende de decisão humana.

## Linguagem de produto

A superfície se chama **Termos que pedem contexto**.

Ela usa:

- Termo encontrado;
- Por que observar;
- Leitura de contexto;
- Alternativas possíveis;
- número de ocorrências.

Ela não usa o resultado como acusação, proibição ou correção automática. A interface lembra que narrador, personagem, época, citação e intenção crítica podem justificar ou transformar o uso de um termo.

## Superfície

A aba `Contexto` apresenta:

- termo;
- categoria;
- contagem;
- motivo para observação;
- orientação contextual da base;
- alternativas possíveis;
- ressalva de decisão humana.

Não há botão para aplicar alternativas, mudança automática, sublinhado ou marcação no Tiptap.

## Arquitetura

A engine original busca `decolonial-data.json` por caminho relativo. O adaptador:

1. importa engine e base originais como recursos raw do Vite;
2. instala uma ponte temporária de `fetch` para esse caminho;
3. executa a engine clássica;
4. mantém a ponte ativa durante `ensureLoaded()`;
5. compartilha uma única promessa de inicialização;
6. restaura `window.fetch` em `finally`;
7. normaliza o retorno em contrato TypeScript do produto.

A base não foi transcrita ou mantida em uma cópia manual editável.

## Matriz final

Os Gates 1 a 4 totalizam 21 cenários em Chromium e Firefox, 42 execuções de navegador.

O Gate 4 acrescentou:

1. página vazia sem falso alerta;
2. múltiplos termos e ocorrências contados corretamente;
3. alternativas e contexto apresentados;
4. manuscrito preservado;
5. ausência de ação automática nos cartões;
6. texto sem termos com retorno neutro;
7. resultado invalidado após edição;
8. falha controlada sem quebrar o editor;
9. aba acessível e sem overflow no mobile;
10. nomes dos termos sem corte ou quebra artificial.

## Incidentes encontrados

### Contrato inventado pelo teste

O primeiro helper esperava um atributo inexistente na biblioteca. A solução foi sincronizar pela interface real, sem poluir o produto com atributo de teste.

### Concorrência na carga da base

A engine iniciava uma carga ao ser executada e o adaptador iniciava outra após restaurar o `fetch`. A segunda chamada falhava e marcava erro. O carregamento passou a ser serializado, mantendo a ponte local durante toda a inicialização.

### Teste contra fonte, não contra build

O teste de exceção tentou importar um arquivo TypeScript que não existe no build. Ele passou a confirmar a carga real e interagir com a API global do produto compilado.

### Quebra visual do termo

O contador reduzia o espaço do título e quebrava “DENEGRIR” no meio. A contagem passou para linha própria e uma asserção geométrica impede regressão.

## Evidências

- TypeScript/Vite: aprovado;
- Chromium: aprovado;
- Firefox: aprovado;
- falha controlada: aprovada;
- mobile: aprovado;
- integridade do manuscrito: aprovada;
- atualização da preview condicionada ao gate: aprovada;
- log detalhado: `mass-notes-next/docs/logs/2026-07-27-gate-4-termos-contexto.md`;
- memória operacional: `mass-notes-next/docs/`.

## Limites

Ainda não estão aprovados:

- calibração da base com corpus amplo na nova interface;
- leitor de tela real;
- teclado virtual real;
- navegação de um cartão até o trecho;
- decorations inline;
- aplicação automática de alternativas;
- service worker e abertura offline em nova sessão;
- promoção para a aplicação pública.

## Próxima decisão

O mantenedor deve experimentar a aba `Contexto` com textos de gêneros, épocas e narradores diferentes. P0/P1 interrompem o avanço. Sem bloqueadores e mediante autorização explícita, o próximo gate proposto é o RimaLab sem marcações inline.