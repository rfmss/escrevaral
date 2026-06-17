# Auditoria aplicada — familiaridade de editor

Data: 2026-06-17
Responsável: Codex

## Pergunta de trabalho

Em que medida o Escrevaral aproveita o repertório de Word/Docs/Scrivener para reduzir atrito no primeiro uso, e em que pontos rompe esse repertório sem sinalização suficiente?

## Diagnóstico resumido

O editor já tem bons pontos de ancoragem:

- negrito, itálico, blocos e alinhamento aparecem primeiro;
- existe preset `Padrão Word / ABNT`;
- há exportação para Word / LibreOffice;
- a folha paginada e o acervo conversam com repertório conhecido.

O atrito estava concentrado em dois lugares:

1. No mobile, ações básicas de editor (`Copiar`, `Baixar`) ainda ficavam sem destaque suficiente por dependerem do grupo editorial.
2. Ao colar conteúdo vindo de Word/Docs, a interface registrava a colagem para autoria, mas não explicitava que a formatação rica havia sido removida.

## Ajustes aplicados

### 1. Barra do editor mais reconhecível no mobile

- `Copiar` continua visível.
- `Baixar` passa a ficar visível sem exigir abertura do grupo editorial.
- o botão `⋯` ganhou rótulo textual `Mais`, reduzindo ambiguidade do overflow.

Arquivos:

- `index.html`
- `css/08-responsive.css`

### 2. Colagem externa mais honesta

Quando a origem traz HTML rico (`Word`, `Google Docs`, similares), o aviso agora diz explicitamente:

- que a formatação foi removida;
- que o trecho entra como colagem externa na prova de autoria.

Quando a colagem é texto simples, o aviso continua curto e focado em autoria.

Arquivo:

- `app.js`

## Intenção de produto

Não transformar o Escrevaral em clone de Word.

Sim reforçar a camada de familiaridade na entrada:

- escrever;
- copiar;
- baixar;
- entender o que aconteceu ao colar.

O diferencial autoral continua depois da primeira confiança, não antes dela.
