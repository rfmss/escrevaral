# Auditoria Visual Curada - 2026-06-18

Alvo: `https://escrevaral.com`
Relatorio bruto: `reports/auditoria/navegacao-visual-2026-06-18.md`
Screenshots: `reports/auditoria/screenshots/navegacao-visual-2026-06-18/`

## Prompt usado

Audite o Escrevaral como uma pessoa escritora usando o produto pela primeira vez e depois como usuaria recorrente. Percorra producao em mobile, tablet e desktop; navegue por todos os modulos do app e por todas as URLs do sitemap. Registre qualquer quebra visual, overflow, texto cortado, botao sem resposta, destino escondido, erro de console/rede, rotulo confuso, alvos pequenos, fluxo sem volta ou diferenca grave entre viewports. Separe P0/P1/P2, cite evidencia e screenshot, e nao chame de falha aquilo que for apenas preferencia estetica sem impacto de uso.

## Resumo executivo

A navegacao principal em desktop e tablet esta funcional. O app principal abre e alterna entre os modulos esperados, sem console error depois de corrigido o fixture do auditor.

O que bloqueia polimento final agora esta no mobile:

1. Overflows horizontais em paginas satelite.
2. `Plano` sem caminho visivel no dock mobile.
3. Aba `Vocabulário` cortada no Atelie mobile.

## P0

### Overflow horizontal mobile nas trilhas

- `/vereda-primeiras-linhas.html`: `scrollWidth=480`, `clientWidth=390`.
- `/vereda-titulo-do-livro.html`: `scrollWidth=435`, `clientWidth=390`.

Causas provaveis:

- nav sticky com trilha horizontal em `width:max-content`;
- abas horizontais de estrutura;
- CTAs/links de rodape em layout lateral sem quebra suficiente.

Screenshots:

- `mobile-vereda-primeiras-linhas.html.png`
- `mobile-vereda-titulo-do-livro.html.png`

### Overflow horizontal mobile na biblioteca

- `/vereda-biblioteca-escrita.html`: `scrollWidth=394/395`, `clientWidth=390`.
- Causa observada: `.topbar-tabs` passa da viewport; botao `Sobre` termina em `right=394/395`.

Screenshot:

- `mobile-vereda-biblioteca-escrita.html.png`

## P1

### `Plano` inacessivel no phone

No viewport `390x844`, o app nao tem controle visivel para `cronograma`.

Dock visivel:

```text
Escrever, Acervo, Atelie, Autoria, Palavras
```

Existe `.mobile-bandeja` com `Plano`, mas nao ha botao visivel `data-action="toggle-bandeja"` para abrir a bandeja.

Correcao: adicionar `Mais` ao dock ou promover `Plano` para o dock mobile.

### Aba `Vocabulário` cortada no Atelie mobile

Evidencia:

```text
label.academy-tool-tab `language Vocabulário` 271..410 em viewport 390
```

Screenshot:

- `mobile-app-academia.png`

Correcao: ajustar `.academy-tools-tabs` para caber, rolar com affordance clara ou abreviar labels no phone.

## P2

- Barra de status pode estar cortando `17 palavras · 1 paragrafos · 100 car.` em mobile/tablet.
- Muitos alvos clicaveis abaixo de 28/32px aparecem em chips, statusbar, temporizador, fixar nota e links de apoio.
- O auditor detecta um grupo editorial do toolbar desktop fora da viewport no DOM, mas a screenshot nao mostra quebra evidente; validar manualmente antes de mexer.

## Nao bloquear por enquanto

- Texto cortado no livro 3D de `anatomia-do-livro.html`: parece intencional do objeto visual.
- `cdn-cgi/rum`: ruido de Cloudflare RUM.
- Excecao `trim` da primeira passada: causada pelo fixture antigo do auditor, corrigido na segunda passada.

## Aceite sugerido

```bash
python3 scripts/auditor-navegacao-visual.py
```

Meta minima:

```text
P0=0
Plano acessivel no mobile
Atelie mobile sem aba cortada sem affordance
```
