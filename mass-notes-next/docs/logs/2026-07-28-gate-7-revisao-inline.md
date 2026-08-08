# 2026-07-28 — Gate 7: Revisão inline somente de leitura

## Contexto

O Gate 6 criou o contrato de posições e o Gate 6.9 auditou ranges editoriais em textos brasileiros reais. As duas etapas proibiam decorations. O Gate 7 foi autorizado como corte pequeno para provar uma única engine, sem aplicação automática de sugestões.

## Escopo autorizado

- engine inicial: Revisão;
- plugin ProseMirror isolado;
- projection somente de leitura;
- navegação de cartão para range;
- invalidação por documento e assinatura;
- ocultação reversível;
- Chromium e Firefox;
- nenhuma mudança na aplicação pública.

## Implementação

### Ranges localizados

O adaptador separa observações gerais de observações com `fragment` e `pos`. Cada candidata é conferida contra o snapshot textual atual antes de ser convertida em posição ProseMirror.

O resultado apresentado contém:

- identificador estável da ocorrência;
- regra e severidade;
- fragmento;
- range textual;
- range ProseMirror verificado;
- `documentId` e `contentSignature` do snapshot.

### Plugin

`src/editor/reviewDecorations.ts` mantém um `DecorationSet` fora do documento. Metadados `set` e `clear` substituem ou removem o conjunto. Qualquer `transaction.docChanged` limpa as projections em vez de tentar transportar uma leitura antiga para conteúdo novo.

### Interface

O painel Revisão passou a distinguir:

- **Trechos localizados**: cartões com fragmento e “Ir ao trecho”;
- **Observações gerais**: leitura sem range verificável.

As marcas usam a cor semântica de análise, não a cor de seleção, e não capturam eventos de ponteiro.

### Visibilidade

O botão “Ocultar marcas / Mostrar marcas” fica no cabeçalho dos trechos localizados. Ele alterna a classe `review-marks-hidden` no `body`, removendo apenas fundo e sublinhado visual. Cartões, ranges e leitura continuam montados.

A troca de documento ou de conjunto de observações restaura o estado visível. O cleanup remove a classe global ao desmontar o painel.

## Testes

A suíte principal cobre:

1. decoration exata sem alteração do documento;
2. navegação depois de emoji e `hardBreak`;
3. invalidação imediata após edição;
4. isolamento entre documentos;
5. fragmentos repetidos e decorations sobrepostas;
6. rejeição de posição ou fragmento não verificável;
7. cor reservada, ausência de eventos e mobile.

A suíte dedicada de visibilidade cobre:

- ocultar e restaurar marcas;
- preservação dos cartões;
- estado acessível do controle;
- remoção e retorno do estilo visual;
- preservação de texto e assinatura estrutural.

## Incidentes e decisões

### Flexão do status

O produto apresentou “3 trechos localizados”. O teste aceitava apenas singular. A regex foi corrigida para aceitar a flexão correta.

### Sobreposição de decorations

Duas ocorrências de `PONT-49` coexistiam com um range maior. O ProseMirror fundiu atributos DOM em uma das regiões sobrepostas. A marca visual e as duas navegações estavam corretas.

Decisão: não contar atributos DOM como contrato de ocorrência. O teste passou a exigir dois cartões e a provar que cada botão seleciona o bloco correto.

### Controle duplicado

Duas mudanças concorrentes criaram um controle na toolbar e outro no painel. O controle da toolbar foi removido. A visibilidade pertence ao contexto da Revisão.

### Colisão com `document`

O componente recebe um prop chamado `document`. O uso de `document.body` foi interpretado por TypeScript como acesso ao manuscrito. A referência correta passou a ser `window.document.body`.

### Teste duplicado

A visibilidade foi coberta temporariamente pela suíte principal e pela suíte dedicada. A duplicata foi removida; o cenário dedicado permaneceu.

## Preview

A avaliação revelou uma página branca na raw.githack. O diagnóstico apontou risco de HTML cacheado referenciar nomes hash antigos depois que a branch de preview era substituída por force-push.

Proteções adicionadas:

- assets estáveis `assets/index.js` e `assets/index.css`;
- fallback de carregamento visível;
- mensagem de falha após 12 segundos;
- purge best-effort do cache;
- smoke test público com tentativas por até três minutos;
- validação do HTML e dos tamanhos mínimos de JavaScript e CSS.

## Fechamento

Workflow final: `30367072054`.

- `npm ci`: verde;
- TypeScript/Vite: verde;
- Chromium: 67/67;
- Firefox: 67/67;
- total: 134/134;
- falhas: 0;
- flakiness: 0;
- preview publicada;
- cache renovado;
- endereço público verificado;
- artefato guardado.

## Estado seguinte

Gate 7 encerrado tecnicamente. Próximo passo: avaliação manual da preview. Nenhuma nova engine, aplicação de sugestão, promoção para `main` ou Gate 8 começa sem autorização explícita.
