# Logos do Escrevaral

## Cores da marca

| Token         | Hex       | Uso                                      |
|---------------|-----------|------------------------------------------|
| Tinta escura  | `#150a03` | Logo no tema Alvorada (fundo claro)      |
| Pergaminho    | `#f6f1eb` | Logo no tema Vereda (fundo escuro); fundo de PNGs |
| Fundo de ícone| `#150a03` | Background de todos os PNGs (favicon, PWA, atalho) |

---

## Arquivos-fonte

Ficam nesta pasta (`icons/`). Não editar os arquivos operacionais diretamente — editar a fonte e regenerar.

| Arquivo             | Cor do path | Fundo    | Uso                          |
|---------------------|-------------|----------|------------------------------|
| `LogoOK_v2.svg`     | `#f6f1eb`   | transparente | Fonte oficial — versão creme |
| `LogoOK_v2dark.svg` | `#150a03`   | transparente | Fonte oficial — versão escura |

---

## Arquivos operacionais (SVG)

Derivados diretos da fonte. Atualizados automaticamente ao rodar o script de build.

| Arquivo                  | Cor      | Fundo        | Onde é usado                          |
|--------------------------|----------|--------------|---------------------------------------|
| `vereda-logo-dark.svg`   | `#150a03`| transparente | Topbar — tema Alvorada (padrão)       |
| `vereda-logo-light.svg`  | `#f6f1eb`| transparente | Topbar — tema Vereda (CSS content swap) |
| `Logo.svg`               | `#150a03`| transparente | Alias para integrações externas       |
| `Logo-tab.svg`           | `#150a03`| transparente | Alias para integrações externas       |

O swap no topbar funciona via CSS em `css/02-shell-navigation.css`:
```css
.brand-logo { /* aponta para vereda-logo-dark.svg no HTML */ }
[data-theme="scriptorium"] .brand-logo { content: url("../icons/vereda-logo-light.svg"); }
```

---

## Arquivos operacionais (PNG)

Gerados via `cairosvg` + achate Pillow. Fundo sólido `#150a03`, logo `#f6f1eb`.

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

### Ícones do app (`icons/`)

Margem maior (18%) para respeitar o safe zone do PWA maskable.

| Arquivo               | Tamanho | Usado em                                           |
|-----------------------|---------|----------------------------------------------------|
| `escrevarallogo.png`  | 512×512 | `<img>` no topbar (fallback se SVG falhar)         |
| `escrevaral-512.png`  | 512×512 | `manifest.webmanifest` — ícone principal PWA       |
| `escrevaral-192.png`  | 192×192 | `manifest.webmanifest` — ícone compacto PWA        |
| `escrevaral-logo.png` | 256×256 | Open Graph / compartilhamento social               |

---

## Como regenerar os PNGs

Requer `cairosvg` e `Pillow` instalados:

```bash
pip3 install cairosvg pillow --break-system-packages
```

Depois rodar o script Python que:
1. Lê `icons/LogoOK_v2.svg` e extrai o path via `xml.etree.ElementTree`
2. Monta SVG quadrado (2000×2000) com fundo `#150a03` e path `#f6f1eb`
3. Renderiza com `cairosvg.svg2png` e achata alpha via `PIL.Image.alpha_composite`
4. Salva em todos os tamanhos acima
