---
name: qa-overflow
description: Auditar rolagem horizontal em 320px, 390px e 430px via Playwright. Detecta scrollWidth > clientWidth no documento e em elementos internos críticos.
---

# QA Overflow Mobile

Use após qualquer mudança em CSS que toque layout, editor, toolbar, painel lateral ou modo página. Também use após mudanças em engines que injetem HTML na interface.

## O pilar

Rolagem horizontal em telas de escrita é proibida. O critério de aceite é:

```
document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth
```

em 320px, 390px e 430px. Qualquer overflow permitido precisa estar contido no próprio menu (não deslocar a página inteira).

## Procedimento

1. Garantir que o servidor local está rodando:

```bash
python3 -m http.server 8799 &
```

2. Rodar a auditoria via script existente:

```bash
python3 scripts/auditor-overflow-mobile.py
```

3. Se o script não existir ou falhar, usar Playwright direto:

```python
from playwright.sync_api import sync_playwright

viewports = [
    {"width": 320, "height": 568},
    {"width": 390, "height": 844},
    {"width": 430, "height": 932},
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    for vp in viewports:
        page = browser.new_page(viewport=vp)
        page.goto("http://localhost:8799")
        overflow = page.evaluate("""() => {
            const el = document.scrollingElement;
            return {
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                overflow: el.scrollWidth > el.clientWidth
            };
        }""")
        status = "FALHA" if overflow["overflow"] else "OK"
        print(f"{vp['width']}px: {status} (scroll={overflow['scrollWidth']}, client={overflow['clientWidth']})")
    browser.close()
```

4. Para cada viewport com FALHA, identificar o elemento causador:

```python
offenders = page.evaluate("""() => {
    const results = [];
    document.querySelectorAll('*').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 2) {
            results.push({
                tag: el.tagName,
                id: el.id,
                classes: [...el.classList].join(' '),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth
            });
        }
    });
    return results.slice(0, 10);
}""")
```

## Elementos críticos a monitorar

- `body`, `.content-stage`, `.editor-split`, `.editor-paper`
- `.writing-area`, `.specialized-editor`, `.paged-editor`
- `.toolbar`, `.analysis-panel`, `.archive-panel`

## Cuidados

- Menus horizontais intencionais (trilhos, tab bars) são exceção permitida — desde que o overflow esteja contido no componente, não na página.
- Sempre medir `scrollWidth > clientWidth`, não só olhar screenshot.
- Fechar o servidor após o teste se foi aberto só para o QA.
