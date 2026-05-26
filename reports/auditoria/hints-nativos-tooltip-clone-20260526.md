# Auditoria: hints nativos e clone de tooltip Escrevaral

Data: 2026-05-26

Objetivo: levantar tudo que hoje pode acionar dica/aviso padrão do navegador ou do sistema e preparar a troca por um clone visual próprio, com temas Alvorada e Vereda.

## Decisão de produto

O Escrevaral não deve depender de dicas visuais nativas do navegador para explicar ferramentas, estados ou ações da interface. A experiência precisa parecer uma oficina própria, não uma página genérica com balões do sistema operacional.

Regra: todo aviso curto de interface que hoje aparece por `title` deve ser interceptado e exibido por um componente visual do Escrevaral, com variações coerentes para Alvorada e Vereda.

Essa decisão vale para:

- Dicas de botões e ícones.
- Ações de statusbar, como `Alterar meta`, `Definir meta de palavras` e temporizador.
- Controles da topbar, painéis laterais, barra de formatação, arquivo, cronograma, academia e modo leitor.
- Elementos criados dinamicamente por JS.

Essa decisão não vale para:

- Janelas inevitavelmente controladas pelo navegador, como o prompt nativo de instalação PWA.
- Permissões do navegador, seletor de arquivos, impressão/salvar PDF, menu de contexto, autocomplete e outras superfícies de segurança ou sistema.
- Nomes acessíveis obrigatórios, como `iframe title`, sem substituição acessível equivalente.

Diretriz: quando uma UI nativa for inevitável, o Escrevaral deve preparar a pessoa antes, com texto e desenho próprios, e só então acionar o recurso nativo. O nativo deve ser exceção consciente, não vazamento visual.

Motivo:

- Coerência de marca: Alvorada e Vereda precisam cobrir microinterações, não apenas telas grandes.
- Confiança: balões cinza do sistema quebram a sensação de ferramenta artesanal e local.
- Acessibilidade: `title` é frágil para teclado, toque e leitores de tela; o clone deve preservar `aria-label` e foco.
- Mobile: tooltip nativo não resolve bem em touch.
- Produto: dicas são parte do vocabulário da oficina, não detalhe técnico.

Critério de aceite da decisão:

- Nenhum controle visível depende de `title` para explicar sua função.
- A interface continua compreensível por mouse, teclado e toque.
- O clone visual respeita tokens existentes e alterna corretamente entre Alvorada e Vereda.
- Exceções nativas ficam documentadas e justificadas.

## Resumo executivo

Foram encontrados 74 pontos relevantes no app de produção usando `title`, `.title = ...` ou templates dinâmicos equivalentes.

Não foram encontrados usos diretos de `alert()`, `confirm()` ou `prompt()` para mensagens comuns. O único `prompt()` encontrado é o prompt nativo de instalação PWA em `backup-controller.js:39`, que é uma API do navegador e não pode ser redesenhado integralmente.

Já existem alguns componentes próprios que podem virar base ou referência:

- `#grammar-tooltip` em `index.html:1411` com CSS em `css/03-editor-toolbar.css:356`
- `#word-popover` em `index.html:1414` com CSS em `css/03-editor-toolbar.css:414`
- `.precision-hint-tooltip` em `editor-controller.js:428` com CSS em `css/03-editor-layout.css:126`
- `.syntax-token-tooltip` em `syntax-controller.js:77`
- toasts próprios: `#academia-hint-toast`, `#delete-undo-toast`, `#save-hint-toast`, `.reader-hint-toast`, `.pomodoro-done-toast`

## Contagem por arquivo

| Arquivo | Ocorrências |
| --- | ---: |
| `index.html` | 51 |
| `app.js` | 7 |
| `archive-controller.js` | 6 |
| `cronograma-controller.js` | 7 |
| `academia-controller.js` | 2 |
| `editor-modes.js` | 1 |

Total: 74.

## Alertas e prompts nativos

| Arquivo | Linha | Achado | Observação |
| --- | ---: | --- | --- |
| `backup-controller.js` | 39 | `deferredInstallPrompt.prompt()` | Prompt nativo de instalação PWA. Não dá para clonar a janela do navegador; recomendação é criar uma explicação própria antes de chamar o prompt nativo. |

Não há `alert()` ou `confirm()` nos arquivos principais auditados.

## Hotspots por superfície

### Topbar e navegação principal

| Linha | Elemento | Texto atual |
| ---: | --- | --- |
| `index.html:139` | chip de autoria | `Integridade da escrita — clique para ver Prova de Autoria` |
| `index.html:145` | sons ambiente | `Sons ambiente de escrita` |
| `index.html:148` | busca | `Buscar` |
| `index.html:157` | status offline | `Pronto sem internet` |
| `index.html:165` | fundo de mesa | `Fundo de mesa` |
| `index.html:168` | tema | `Mudar para Vereda` |
| `app.js:163` | tema dinâmico | `Mudar para Alvorada` / `Mudar para Vereda` |
| `index.html:171` | foco | `Escrever sem distração` |

### Painéis laterais e trilhos

| Linha | Elemento | Texto atual |
| ---: | --- | --- |
| `index.html:178` | trilho esquerdo | `Abrir acervo` |
| `index.html:182` | toggle esquerdo | `Ocultar acervo` |
| `app.js:128` | toggle esquerdo dinâmico | `Abrir hierarquia` / `Ocultar hierarquia` |
| `index.html:1040` | toggle direito | `Ocultar análise linguística` |
| `index.html:1071` | trilho direito | `Abrir análise linguística` |
| `app.js:134` | toggle direito dinâmico | `Abrir análise linguística` / `Ocultar análise linguística` |

### Manuscrito e barra de formatação

| Linha | Elemento | Texto atual |
| ---: | --- | --- |
| `index.html:188` | nova nota | `Nova nota` |
| `index.html:226` | trocar lado do guia | `Trocar o guia de lado: esquerda ↔ direita` |
| `index.html:229` | ocultar guia | `Ocultar guia` |
| `app.js:261` | guia dinâmico | usa texto longo de ajuda quando não há conteúdo |
| `index.html:246` | modo leitor | `Ler — revisão como leitor` |
| `index.html:251` | apagar nota | `Apagar esta nota` |
| `index.html:260` | negrito | `Negrito (Ctrl+B)` |
| `index.html:263` | itálico | `Itálico (Ctrl+I)` |
| `index.html:267` | tipo de bloco | `Tipo de bloco` |
| `index.html:274` | alinhar esquerda | `Alinhar à esquerda` |
| `index.html:277` | centralizar | `Centralizar` |
| `index.html:280` | alinhar direita | `Alinhar à direita` |
| `index.html:283` | justificar | `Justificar` |
| `index.html:293` | ferramentas editoriais | `Formato e exportação` |
| `index.html:296` | preset editorial | `Preset editorial` |
| `index.html:303` | página | `Ver texto em página` |
| `index.html:308` | classes gramaticais | `Colorir por classe gramatical` |
| `index.html:311` | quebra de página | `Quebra de página` |
| `index.html:314` | exportar RTF | `Baixar para Word / LibreOffice` |
| `index.html:317` | imprimir | `Imprimir / Salvar como PDF` |

### Prova de autoria, arquivo e exportação

| Linha | Elemento | Texto atual |
| ---: | --- | --- |
| `index.html:383` | sessões anteriores | `Ver sessões anteriores` |
| `index.html:549` | exportar TXT | `Baixar como texto simples (.txt)` |
| `index.html:553` | exportar Markdown | `Baixar em Markdown (.md)` |
| `index.html:557` | exportar HTML | `Baixar como página HTML (.html)` |
| `index.html:637` | exportar RTF | `Baixar para Word / LibreOffice (.rtf)` |

### Biblioteca, cronograma e modo foco

| Linha | Elemento | Texto atual |
| ---: | --- | --- |
| `index.html:828` | biblioteca | `Biblioteca da Escrita — 21 livros e 42 critérios` |
| `index.html:1024` | seletor do cronograma | `Escolher data no cronograma` |
| `cronograma-controller.js:126` | atalhos de dia | feriado ou `Ir para DD/MM/AAAA` |
| `cronograma-controller.js:147` | ano anterior | `Ano anterior` |
| `cronograma-controller.js:150` | mês anterior | `Mês anterior` |
| `cronograma-controller.js:154` | próximo mês | `Próximo mês` |
| `cronograma-controller.js:157` | próximo ano | `Próximo ano` |
| `cronograma-controller.js:257` | concluir item | `Desmarcar` / `Concluir` |
| `cronograma-controller.js:261` | remover item | `Remover` |
| `index.html:1077` | sair do foco | `Sair (Escape)` |
| `index.html:1090` | linha de leitura | `Linha de leitura` |

### Statusbar e redes

| Linha | Elemento | Texto atual |
| ---: | --- | --- |
| `index.html:1161` | X | `Escrevaral no X` |
| `index.html:1164` | Bolha.us/Mastodon | `Escrevaral no Bolha.us` |
| `index.html:1167` | Bluesky | `Escrevaral no Bluesky` |
| `index.html:1170` | e-mail | `oi@escrevaral.com` |
| `index.html:1177` | meta atual | `Alterar meta` |
| `index.html:1179` | definir meta | `Definir meta de palavras` |
| `index.html:1182` | pomodoro | `Temporizador — 25 minutos` |

### Modo leitor e editorial

| Linha | Elemento | Texto atual |
| ---: | --- | --- |
| `index.html:1378` | ritmo | `Ritmo de rolagem` |
| `index.html:1382` | linha de leitura | `Linha de leitura` |
| `index.html:1386` | tamanho da letra | `Tamanho da letra` |
| `index.html:1438` | abrir editorial | `Abrir em nova aba` |
| `index.html:1442` | iframe editorial | `Leitura editorial` |

Observação: `iframe title` é também nome acessível. Se a meta for remover qualquer tooltip nativo, trocar por outra estratégia precisa preservar acessibilidade do iframe.

### Templates dinâmicos em JS

| Linha | Elemento | Texto atual |
| ---: | --- | --- |
| `archive-controller.js:32` | apagar nota na árvore | `Apagar nota` |
| `archive-controller.js:252` | fixar/desfixar projeto | `${pinLabel}` |
| `archive-controller.js:271` | abrir rápido | `Abrir no editor` |
| `archive-controller.js:275` | duplicar | `Duplicar nota` |
| `archive-controller.js:279` | exportar | `Exportar nota` |
| `archive-controller.js:384` | fixar/desfixar lista | `${pinLabel}` |
| `app.js:847` | nota de sinônimos | `Clique para substituir...` |
| `app.js:849` | botão de sinônimo | `Substituir por '...' — revise...` |
| `app.js:1403` | teatro remover fala | `Remover fala` |
| `editor-modes.js:237` | teatro remover fala | `Remover fala` |
| `academia-controller.js:280` | badge de rima | `RHYME_TITLES[...]` |
| `academia-controller.js:437` | alternativa decolonial | `Copiar alternativa` |

## O que não é tooltip nativo, mas deve entrar na padronização

Estes já são componentes próprios, porém têm estilos e mecanismos diferentes. Vale unificar tokens, posicionamento e tema:

| Componente | Local |
| --- | --- |
| Tooltip de gramática | `index.html:1411`, `css/03-editor-toolbar.css:356`, `grammar-controller.js:2` |
| Popover lexical | `index.html:1414`, `css/03-editor-toolbar.css:414`, `grammar-controller.js:534` |
| Tooltip de precisão | `editor-controller.js:426-428`, `css/03-editor-layout.css:126` |
| Tooltip de sintaxe | `syntax-controller.js:77`, `syntax-controller.js:161` |
| Toast de academia | `index.html:1237`, `editor-controller.js:598`, `app.js:1322` |
| Toast desfazer exclusão | `index.html:1277`, `archive-controller.js:99` |
| Toast de salvamento local | `index.html:1307`, `app.js:1907` |
| Toast do leitor | `reader-controller.js:27`, `css/03-editor-modes.css:555` |
| Toast do pomodoro | `pomodoro-controller.js:29`, `css/03-editor-toolbar.css:540` |

## Recomendação de implementação para Claude

### 1. Criar um sistema central

Criar um módulo pequeno, por exemplo `tooltip-controller.js`, carregado depois do HTML base.

Responsabilidades:

- Procurar elementos com `[title]` interativos.
- Copiar `title` para `data-vrda-tooltip`.
- Remover `title` para impedir o tooltip nativo.
- Preservar acessibilidade: se não houver `aria-label`, preencher com o texto do tooltip.
- Mostrar um único elemento global, por exemplo `<div id="vrda-tooltip" role="tooltip">`.
- Acionar em `pointerenter`, `focusin`, `pointerleave`, `focusout`, `keydown Escape`.
- Reposicionar em `scroll`, `resize` e quando o alvo mudar de tamanho.
- Usar `MutationObserver` para pegar templates renderizados por `archive-controller.js`, `cronograma-controller.js`, `academia-controller.js`, `app.js` e `editor-modes.js`.

### 2. API sugerida no HTML/JS

Novo padrão:

```html
<button aria-label="Alterar meta" data-vrda-tooltip="Alterar meta">...</button>
```

Durante transição:

```html
<button title="Alterar meta">...</button>
```

O controller migra automaticamente para:

```html
<button aria-label="Alterar meta" data-vrda-tooltip="Alterar meta">...</button>
```

e remove `title`.

### 3. Temas visuais

Usar tokens existentes:

- Alvorada: tema claro padrão (`:root`)
- Vereda: tema escuro (`[data-theme="scriptorium"]`)

CSS sugerido:

```css
.vrda-tooltip {
  position: fixed;
  z-index: 1000;
  max-width: min(280px, calc(100vw - 24px));
  padding: 7px 9px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: color-mix(in srgb, var(--card) 94%, var(--primary) 6%);
  color: var(--ink);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--ink) 16%, transparent);
  font: 500 11px/1.35 Inter, system-ui, sans-serif;
  letter-spacing: 0;
  pointer-events: none;
  opacity: 0;
  transform: translateY(3px);
  transition: opacity 120ms ease, transform 120ms ease;
}

.vrda-tooltip.is-visible {
  opacity: 1;
  transform: translateY(0);
}

[data-theme="scriptorium"] .vrda-tooltip {
  background: color-mix(in srgb, var(--surface) 88%, var(--primary) 12%);
  color: var(--soft-ink);
  border-color: color-mix(in srgb, var(--primary) 45%, var(--line));
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.42);
}
```

### 4. Regras de exclusão

Não migrar automaticamente:

- Objetos JS que têm propriedade `title` de manuscrito/documento. Exemplos: `app.js:611`, `app.js:630`, `app.js:656`, `archive-controller.js:646`.
- `document.title` em `app.js:67`.
- `iframe title` sem decisão explícita, porque tem função acessível.
- Elementos não visíveis ou metadados.

### 5. Prioridade de migração

1. Statusbar: `Alterar meta`, `Definir meta de palavras`, Pomodoro e redes.
2. Topbar: áudio, busca, tema, foco, fundo de mesa, offline.
3. Barra de formatação: botões icon-only e selects.
4. Painéis laterais e trilhos.
5. Arquivo e ações rápidas renderizadas em JS.
6. Cronograma.
7. Academia e modo leitor.
8. Unificação dos tooltips já próprios para compartilhar tokens e comportamento.

## Critérios de aceite

- Nenhum elemento interativo visível mantém `title` depois do bootstrap.
- Hover e foco por teclado mostram o clone próprio.
- `Escape`, `pointerleave`, `focusout`, scroll e troca de view escondem o tooltip.
- Tooltip não sai da viewport em desktop nem mobile.
- No tema Vereda, tooltip tem contraste suficiente e não parece tooltip cinza do sistema.
- No tema Alvorada, tooltip combina com o pergaminho sem virar card grande.
- Leitores de tela continuam recebendo nome acessível via `aria-label` ou conteúdo textual.
- Templates dinâmicos inseridos depois da carga também são interceptados.

## Comandos usados na auditoria

```bash
rg -n "\\btitle=|alert\\s*\\(|confirm\\s*\\(|prompt\\s*\\(|showModal\\s*\\(|setCustomValidity\\s*\\(|reportValidity\\s*\\(|aria-describedby|data-tooltip|tooltip|toast|role=\\\"tooltip\\\"|popover" . --glob '!syntax-data.json' --glob '!lexical-data.json' --glob '!synonyms/**' --glob '!templates-data.json' --glob '!analise-data.json' --glob '!rimalab-data.json' --glob '!decolonial-data.json'
rg -n "\\btitle=|\\.title\\s*=|setAttribute\\(['\\\"]title" index.html app.js archive-controller.js cronograma-controller.js academia-controller.js editor-modes.js editor-controller.js
rg -n "alert\\s*\\(|confirm\\s*\\(|window\\.confirm|window\\.alert|prompt\\s*\\(" index.html app.js archive-controller.js cronograma-controller.js academia-controller.js editor-controller.js reader-controller.js pomodoro-controller.js backup-controller.js state-store.js ui-dialog.js
```
