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
css_asset = f'  `./css/19-oficina-navigation.css?v=${{ASSET_VERSION}}`,'
if css_asset not in sw:
    anchor_asset = f'  `./css/18-editor-status-layout.css?v=${{ASSET_VERSION}}`,'
    if anchor_asset not in sw:
        raise SystemExit("âncora do layout do status ausente no service worker")
    sw = sw.replace(anchor_asset, anchor_asset + "\n" + css_asset, 1)
js_asset = f'  `./oficina-navigation-controller.js?v=${{ASSET_VERSION}}`,'
if js_asset not in sw:
    anchor_asset = f'  `./editor-status-controller.js?v=${{ASSET_VERSION}}`,'
    if anchor_asset not in sw:
        raise SystemExit("âncora do controlador de status ausente no service worker")
    sw = sw.replace(anchor_asset, anchor_asset + "\n" + js_asset, 1)
sw_path.write_text(sw, encoding="utf-8")

assert OLD not in index_path.read_text(encoding="utf-8")
assert OLD not in ui_path.read_text(encoding="utf-8")
assert tag in index_path.read_text(encoding="utf-8")
assert 'const ASSET_VERSION = "20260725-oficina-nav"' in sw_path.read_text(encoding="utf-8")
assert 'vereda-offline-v948' in sw_path.read_text(encoding="utf-8")
assert css_asset in sw_path.read_text(encoding="utf-8")
assert js_asset in sw_path.read_text(encoding="utf-8")

Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "migrar-oficina-navigation.yml"
if workflow.exists():
    workflow.unlink()
