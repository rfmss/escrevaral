# Logos do Escrevaral

## Cores da marca

| Token         | Hex       | Uso                                      |
|---------------|-----------|------------------------------------------|
| Tinta escura  | `#150a03` | Logo no tema Alvorada (fundo claro)      |
| Pergaminho    | `#f6f1eb` | Logo no tema Vereda (fundo escuro); fundo de PNGs |
| Fundo de ícone| `#150a03` | Background dos PNGs de aba (favicon, atalho) |

---

## Gerações de logo

### Geração atual (2026-05 — Aba + Full)

Dois variantes:
- **Aba** — marca gestual simplificada, sem barras horizontais. Otimizado para miniaturização (favicon, PWA).
- **Full** — marca completa com barras horizontais. Para uso em contextos maiores (open graph, splash).

Estrutura SVG: `fill-rule="evenodd"` com fundo arredondado + marca como knockout transparente.

---

## Arquivos-fonte (pasta raiz — não editar)

| Arquivo                          | Formato | Cor do path | Variante | Fundo      |
|----------------------------------|---------|-------------|----------|------------|
| `EScrevaral_Vereda_Aba.svg`      | SVG     | `#150a03`   | Aba      | transparente (evenodd) |
| `EScrevaral_Alvorada_Aba.svg`    | SVG     | `#ffffff`   | Aba      | transparente (evenodd) |
| `EScrevaral_Vereda_Aba.png`      | PNG     | knockout    | Aba      | `#150a03` |
| `EScrevaral_Alvorada_Aba.png`    | PNG     | knockout    | Aba      | `#ffffff` |
| `EScrevaral_Vereda_Dark.svg`     | SVG     | `#150a03`   | Full     | transparente (evenodd) |
| `Escrevaral_Alvorada_Light.svg`  | SVG     | `#ffffff`   | Full     | transparente (evenodd) |

---

## Arquivos operacionais (SVG — nesta pasta)

| Arquivo                          | Cor      | Fundo        | Onde é usado                          |
|----------------------------------|----------|--------------|---------------------------------------|
| `escrevaral-logo-ink-dark.svg`   | `#150a03`| evenodd      | Topbar e marca — temas claros         |
| `escrevaral-logo-ink-light.svg`  | `#f6f1eb`| evenodd      | Topbar e marca — temas escuros        |
| `escrevaral-aba-dark.svg`        | `#150a03`| evenodd      | Aba/favicon — tema claro              |
| `escrevaral-aba-light.svg`       | `#ffffff`| evenodd      | Aba/favicon — tema escuro             |
| `vereda-logo-dark.svg`           | alias    | SVG externo  | Legado — aponta para `ink-dark`       |
| `vereda-logo-light.svg`          | alias    | SVG externo  | Legado — aponta para `ink-light`      |
| `Logo.svg`                       | alias    | SVG externo  | Legado — aponta para `ink-dark`       |
| `Logo-tab.svg`                   | alias    | SVG externo  | Legado — aponta para `aba-dark`       |

O swap no topbar funciona via CSS em `css/02-shell-navigation.css`:
```css
.brand-logo { content: url("../icons/escrevaral-logo-ink-dark.svg"); }
[data-theme="scriptorium"] .brand-logo { content: url("../icons/escrevaral-logo-ink-light.svg"); }
```

Regra de nomenclatura: `ink-dark` e `ink-light` indicam a cor da tinta do logo, não o tema em que ele aparece. Logo de tinta escura entra em fundo claro; logo de tinta clara entra em fundo escuro.

---

## Arquivos operacionais (PNG)

Gerados a partir de `EScrevaral_Vereda_Aba.png` (1024×1024, RGBA) com Pillow — LANCZOS.

### Favicons (`favicon_io/`)

| Arquivo                    | Tamanho | Usado em                                   |
|----------------------------|---------|--------------------------------------------|
| `tab-favicon-16x16.png`    | 16×16   | `<link rel="icon" sizes="16x16">`          |
| `tab-favicon-32x32.png`    | 32×32   | `<link rel="icon" sizes="32x32">`          |
| `tab-favicon-48x48.png`    | 48×48   | `<link rel="icon" sizes="48x48">` (padrão) |
| `tab-favicon-180x180.png`  | 180×180 | `<link rel="apple-touch-icon">`            |
| `apple-touch-icon.png`     | 180×180 | iOS — atalho na tela inicial               |
| `android-chrome-192x192.png`| 192×192| `site.webmanifest` + atalhos PWA           |
| `android-chrome-512x512.png`| 512×512| `site.webmanifest` (splash)                |
| `favicon-16x16.png`        | 16×16   | Legado                                     |
| `favicon-32x32.png`        | 32×32   | Legado                                     |
| `favicon.ico`              | multi   | Fallback ICO (16, 32, 48, 64)              |
| `tab-favicon.ico`          | multi   | Fallback ICO (16, 32, 48, 64)              |

### Ícones do app (`icons/`)

| Arquivo               | Tamanho | Usado em                                           |
|-----------------------|---------|----------------------------------------------------|
| `escrevarallogo.png`  | 512×512 | `<img>` no topbar (fallback se SVG falhar)         |
| `escrevaral-512.png`  | 512×512 | `manifest.webmanifest` — ícone principal PWA       |
| `escrevaral-192.png`  | 192×192 | `manifest.webmanifest` — ícone compacto PWA        |
| `escrevaral-logo.png` | 256×256 | Open Graph / compartilhamento social               |

---

## Como regenerar os PNGs

Requer `Pillow` instalado (`pip3 install pillow --break-system-packages`).

```python
from PIL import Image

src = 'EScrevaral_Vereda_Aba.png'
img = Image.open(src).convert('RGBA')

# Redimensionar para cada tamanho alvo
img.resize((48, 48), Image.LANCZOS).save('favicon_io/tab-favicon-48x48.png', optimize=True)
# ... etc
```

`favicon.svg` usa `prefers-color-scheme` para alternar entre `#150a03` (tema claro) e `#ffffff` (tema escuro), com o path das Aba files e `fill-rule="evenodd"`.
