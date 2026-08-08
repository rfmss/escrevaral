# Log — Gate 6.75: fusão visual Blueprint

Data: 2026-07-28
Estado: aprovado
Branch: `experiment/mass-notes-tiptap`
PR: `#155` (rascunho)

## Autorização

O mantenedor autorizou a integração visual e pediu continuidade até estabilização das propostas.

## Objetivo

Transplantar a atmosfera do protótipo Blueprint Tokon para o layout atual, sem alterar estrutura, comportamento ou produto.

## Regra

O blueprint é o ambiente; o manuscrito continua sendo o objeto principal.

## Escopo executado

- tokens Blueprint isolados;
- canvas azul técnico;
- retícula, diagonais e moldura de construção;
- papel quente, pauta e margem técnica;
- superfícies laterais de papel técnico;
- filetes, sombras e microtipografia coerentes;
- papel e noite;
- regressões visuais em Chromium e Firefox;
- atualização da preview somente depois do gate verde.

## Fora do escopo preservado

- mudança de layout, DOM ou arquitetura da informação;
- novas features;
- decorations ou marcações inline;
- alteração do Tiptap, engines, bases, persistência ou schema;
- mudança de breakpoints;
- aplicação automática;
- promoção para `main`.

## Organização

```text
src/styles/theme-blueprint.tokens.css
src/styles/theme-blueprint.css
src/styles/theme-blueprint-composition.css
```

A separação mantém paleta, aplicação e proteção do papel reversíveis e auditáveis.

## Registro de execução

### Primeira execução

O build passou, mas quatro cenários novos falharam por premissas do auditor:

- tokens noturnos eram lidos no elemento raiz, embora fossem definidos no `body`;
- o teste procurava um nome acessível antigo da busca;
- capturas eram feitas durante a animação de entrada da folha.

O produto não foi alterado nessa correção.

### Segunda execução

A matriz ficou verde, mas a inspeção visual reprovou o papel: a folha estava azulada demais e perdia prioridade diante do canvas.

### Terceira execução

O contrato passou a exigir as cores calculadas exatas do papel. Um cenário antigo do RimaLab revelou uma corrida do auditor no Firefox: o paste já estava no Tiptap, mas a análise era disparada antes de o documento React concluir o ciclo de atualização.

O teste passou a aguardar `Alterado/Salvando`, salvar e confirmar `Salvo`. A engine e o produto permaneceram intactos.

### Diagnóstico de pintura

Foram comparadas quatro capturas controladas:

1. composição normal;
2. sem grain e halftone;
3. sem a camada blueprint;
4. papel sólido.

Grain, halftone e blueprint não eram a causa. A lavagem vinha da pauta criada com `repeating-linear-gradient` dentro da própria folha.

### Correção estabilizada

A pauta foi substituída por uma imagem linear de 48 px repetida somente no eixo vertical. O papel voltou a ficar praticamente idêntico à cor sólida, mantendo pontos, margem e filetes técnicos.

O teste diagnóstico temporário foi removido. A descoberta virou regressão permanente.

## Gate funcional definitivo

- commit funcional limpo: `ebea3db935e5efb7322e0b8db50204db9170d7b7`;
- workflow: `30333192558`;
- build: verde;
- Chromium: 50/50;
- Firefox: 50/50;
- total: 100/100;
- preview: publicada;
- capturas em papel, noite e mobile: revisadas;
- layout, Tiptap, engines, persistência e `main`: intactos.

## Decisão final

**Gate 6.75 aprovado para continuidade experimental.**

A fusão visual está estabilizada. O próximo lote continua sendo a auditoria manual do contrato de posições. Decorations permanecem bloqueadas.