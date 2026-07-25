#!/usr/bin/env python3
from pathlib import Path

# Migração idempotente: executa depois que o workflow já existe na branch.
ROOT = Path(__file__).resolve().parents[1]
VERSION = "20260725-clarity-desktop-v1"

styles = ROOT / "styles.css"
index = ROOT / "index.html"
sw = ROOT / "service-worker.js"

styles_text = styles.read_text(encoding="utf-8")
main_import = '@import url("./css/20-product-clarity-desktop.css?v=20260725-clarity-desktop-v1");'
control_import = '@import url("./css/20-product-clarity-desktop-controls.css?v=20260725-clarity-desktop-v1");'
if main_import not in styles_text:
    raise SystemExit("import principal da clareza ausente")
if control_import not in styles_text:
    styles_text = styles_text.replace(main_import, main_import + "\n" + control_import, 1)
styles.write_text(styles_text, encoding="utf-8")

index_text = index.read_text(encoding="utf-8")
oficina_script = f'    <script src="oficina-navigation-controller.js?v={VERSION}" defer></script>'
clarity_script = f'    <script src="product-clarity-controller.js?v={VERSION}" defer></script>'
if oficina_script not in index_text:
    raise SystemExit("script da Oficina ausente do index")
if clarity_script not in index_text:
    index_text = index_text.replace(oficina_script, oficina_script + "\n" + clarity_script, 1)
index.write_text(index_text, encoding="utf-8")

sw_text = sw.read_text(encoding="utf-8")
main_css_asset = '  "./css/20-product-clarity-desktop.css?v=20260725-clarity-desktop-v1",'
control_css_asset = '  "./css/20-product-clarity-desktop-controls.css?v=20260725-clarity-desktop-v1",'
if main_css_asset not in sw_text:
    raise SystemExit("CSS principal ausente do pacote offline")
if control_css_asset not in sw_text:
    sw_text = sw_text.replace(main_css_asset, main_css_asset + "\n" + control_css_asset, 1)

oficina_asset = '  `./oficina-navigation-controller.js?v=${ASSET_VERSION}`,'
clarity_asset = '  `./product-clarity-controller.js?v=${ASSET_VERSION}`,'
if oficina_asset not in sw_text:
    raise SystemExit("controlador Oficina ausente do pacote offline")
if clarity_asset not in sw_text:
    sw_text = sw_text.replace(oficina_asset, oficina_asset + "\n" + clarity_asset, 1)
sw.write_text(sw_text, encoding="utf-8")

for path in (
    ROOT / "css" / "20-product-clarity-desktop-controls.css",
    ROOT / "product-clarity-controller.js",
):
    if not path.exists():
        raise SystemExit(f"arquivo distribuído ausente: {path.relative_to(ROOT)}")

print("controles de clareza distribuídos no index, ponto CSS e pacote offline")
