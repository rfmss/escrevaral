#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = "20260725-editor-status"
NEW = "20260725-oficina-nav"

index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")
if OLD not in index:
    raise SystemExit(f"versão esperada ausente em index.html: {OLD}")
index = index.replace(OLD, NEW)
anchor = f'    <script src="editor-status-controller.js?v={NEW}" defer></script>'
tag = f'    <script src="oficina-navigation-controller.js?v={NEW}" defer></script>'
if tag not in index:
    if anchor not in index:
        raise SystemExit("âncora do editor-status não encontrada")
    index = index.replace(anchor, anchor + "\n" + tag, 1)
index_path.write_text(index, encoding="utf-8")

ui_path = ROOT / "ui-dialog.js"
ui = ui_path.read_text(encoding="utf-8")
if OLD not in ui:
    raise SystemExit("versão lexical esperada ausente em ui-dialog.js")
ui_path.write_text(ui.replace(OLD, NEW), encoding="utf-8")

sw_path = ROOT / "service-worker.js"
sw = sw_path.read_text(encoding="utf-8")
if 'vereda-offline-v947' not in sw:
    raise SystemExit("cache-base inesperado")
sw = sw.replace('vereda-offline-v947', 'vereda-offline-v948', 1)
sw = sw.replace(OLD, NEW)

status_css = f'  `./css/18-editor-status-layout.css?v=${{ASSET_VERSION}}`,'
nav_css = f'  `./css/19-oficina-navigation.css?v=${{ASSET_VERSION}}`,'
css_anchor = f'  `./css/17-editor-status-argila.css?v=${{ASSET_VERSION}}`,'
if status_css not in sw:
    if css_anchor not in sw:
        raise SystemExit("âncora do CSS de status ausente no service worker")
    sw = sw.replace(css_anchor, css_anchor + "\n" + status_css, 1)
if nav_css not in sw:
    sw = sw.replace(status_css, status_css + "\n" + nav_css, 1)

js_asset = f'  `./oficina-navigation-controller.js?v=${{ASSET_VERSION}}`,'
if js_asset not in sw:
    js_anchor = f'  `./editor-status-controller.js?v=${{ASSET_VERSION}}`,'
    if js_anchor not in sw:
        raise SystemExit("âncora do controlador de status ausente no service worker")
    sw = sw.replace(js_anchor, js_anchor + "\n" + js_asset, 1)
sw_path.write_text(sw, encoding="utf-8")

assert OLD not in index_path.read_text(encoding="utf-8")
assert OLD not in ui_path.read_text(encoding="utf-8")
assert tag in index_path.read_text(encoding="utf-8")
assert 'const ASSET_VERSION = "20260725-oficina-nav"' in sw_path.read_text(encoding="utf-8")
assert 'vereda-offline-v948' in sw_path.read_text(encoding="utf-8")
assert status_css in sw_path.read_text(encoding="utf-8")
assert nav_css in sw_path.read_text(encoding="utf-8")
assert js_asset in sw_path.read_text(encoding="utf-8")

Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "migrar-oficina-navigation.yml"
if workflow.exists():
    workflow.unlink()
