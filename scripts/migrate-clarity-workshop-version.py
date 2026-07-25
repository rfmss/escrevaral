#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OLD = "20260725-clarity-archive-v1"
NEW = "20260725-clarity-workshop-v1"

index = ROOT / "index.html"
styles = ROOT / "styles.css"
sw = ROOT / "service-worker.js"
ui = ROOT / "ui-dialog.js"

styles_text = styles.read_text(encoding="utf-8")
css_import = '@import url("./css/22-product-clarity-workshop-authorship.css?v=20260725-clarity-workshop-v1");'
if css_import not in styles_text:
    anchor = '@import url("./css/21-product-clarity-archive.css?v=20260725-clarity-archive-v1");'
    if anchor not in styles_text:
        raise SystemExit("âncora CSS do Acervo ausente")
    styles_text = styles_text.replace(anchor, anchor + "\n" + css_import, 1)
styles.write_text(styles_text, encoding="utf-8")

index_text = index.read_text(encoding="utf-8")
if OLD not in index_text:
    raise SystemExit("versão anterior ausente no index")
index_text = index_text.replace(OLD, NEW)
script = f'    <script src="workshop-authorship-clarity-controller.js?v={NEW}" defer></script>'
app = f'    <script src="app.js?v={NEW}" defer></script>'
if app not in index_text:
    raise SystemExit("app versionado ausente")
if script not in index_text:
    index_text = index_text.replace(app, app + "\n" + script, 1)
versions = re.findall(r"[?&]v=([0-9]{8}-[A-Za-z0-9._-]+)", index_text)
if len(versions) < 60 or set(versions) != {NEW}:
    raise SystemExit(f"index incoerente: refs={len(versions)} versões={sorted(set(versions))}")
index.write_text(index_text, encoding="utf-8")

sw_text = sw.read_text(encoding="utf-8")
sw_text = sw_text.replace('const CACHE_NAME = "vereda-offline-v951";', 'const CACHE_NAME = "vereda-offline-v952";', 1)
sw_text = re.sub(r'const ASSET_VERSION = "[^"]+";', f'const ASSET_VERSION = "{NEW}";', sw_text, count=1)
css_asset = '  `./css/22-product-clarity-workshop-authorship.css?v=${ASSET_VERSION}`,'
js_asset = '  `./workshop-authorship-clarity-controller.js?v=${ASSET_VERSION}`,'
css_anchor = '  `./css/21-product-clarity-archive-refine.css?v=${ASSET_VERSION}`,'
js_anchor = '  `./oficina-navigation-controller.js?v=${ASSET_VERSION}`,'
if css_asset not in sw_text:
    if css_anchor not in sw_text: raise SystemExit("âncora CSS offline ausente")
    sw_text = sw_text.replace(css_anchor, css_anchor + "\n" + css_asset, 1)
if js_asset not in sw_text:
    if js_anchor not in sw_text: raise SystemExit("âncora JS offline ausente")
    sw_text = sw_text.replace(js_anchor, js_anchor + "\n" + js_asset, 1)
sw.write_text(sw_text, encoding="utf-8")

ui_text = ui.read_text(encoding="utf-8")
ui_text, count = re.subn(
    r"lexical-view-controller\.js\?v=[0-9]{8}-[A-Za-z0-9._-]+",
    f"lexical-view-controller.js?v={NEW}",
    ui_text,
)
if count < 1:
    raise SystemExit("versão lexical não atualizada")
ui.write_text(ui_text, encoding="utf-8")

for path in (ROOT / "css" / "22-product-clarity-workshop-authorship.css", ROOT / "workshop-authorship-clarity-controller.js"):
    if not path.exists(): raise SystemExit(f"recurso ausente: {path.name}")

print(f"distribuição concluída: {NEW}; refs={len(versions)}; cache=v952")
