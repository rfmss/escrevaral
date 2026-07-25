#!/usr/bin/env python3
# Migração transitória: desaparece da branch depois de sincronizar a entrega.
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = "20260725-argila-entry"
NEW = "20260725-editor-status"

index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")
if OLD not in index:
    raise SystemExit(f"versão esperada ausente em index.html: {OLD}")
index = index.replace(OLD, NEW)
controller_anchor = f'    <script src="pomodoro-controller.js?v={NEW}" defer></script>'
controller_tag = f'    <script src="editor-status-controller.js?v={NEW}" defer></script>'
if controller_tag not in index:
    if controller_anchor not in index:
        raise SystemExit("âncora do pomodoro não encontrada")
    index = index.replace(controller_anchor, controller_anchor + "\n" + controller_tag, 1)
index_path.write_text(index, encoding="utf-8")

ui_path = ROOT / "ui-dialog.js"
ui = ui_path.read_text(encoding="utf-8")
if OLD not in ui:
    raise SystemExit("versão lexical esperada ausente em ui-dialog.js")
ui_path.write_text(ui.replace(OLD, NEW), encoding="utf-8")

archive_css_path = ROOT / "css" / "14-archive-inspector.css"
archive_css = archive_css_path.read_text(encoding="utf-8")
import_line = f'@import url("./17-editor-status-argila.css?v={NEW}");'
if import_line not in archive_css:
    lines = archive_css.splitlines()
    insertion = 0
    while insertion < len(lines) and lines[insertion].startswith("@import "):
        insertion += 1
    lines.insert(insertion, import_line)
    archive_css = "\n".join(lines) + "\n"
archive_css = archive_css.replace(OLD, NEW)
archive_css_path.write_text(archive_css, encoding="utf-8")

wood_path = ROOT / "css" / "wood-icons.css"
wood = wood_path.read_text(encoding="utf-8")
if '14-archive-inspector.css?v=20260725-v3' not in wood:
    raise SystemExit("versão fixa do inspector inesperada em wood-icons.css")
wood = wood.replace('14-archive-inspector.css?v=20260725-v3', '14-archive-inspector.css?v=20260725-v4', 1)
wood_path.write_text(wood, encoding="utf-8")

sw_path = ROOT / "service-worker.js"
sw = sw_path.read_text(encoding="utf-8")
if 'vereda-offline-v946' not in sw:
    raise SystemExit("cache-base inesperado")
sw = sw.replace('vereda-offline-v946', 'vereda-offline-v947', 1)
sw = sw.replace(OLD, NEW)
sw = sw.replace('14-archive-inspector.css?v=20260725-v3', '14-archive-inspector.css?v=20260725-v4', 1)
css_asset = f'  `./css/17-editor-status-argila.css?v=${{ASSET_VERSION}}`,'
if css_asset not in sw:
    anchor = f'  `./css/16-entry-argila.css?v=${{ASSET_VERSION}}`,'
    if anchor not in sw:
        raise SystemExit("âncora do CSS de entrada ausente no service worker")
    sw = sw.replace(anchor, anchor + "\n" + css_asset, 1)
js_asset = f'  `./editor-status-controller.js?v=${{ASSET_VERSION}}`,'
if js_asset not in sw:
    anchor = f'  `./pomodoro-controller.js?v=${{ASSET_VERSION}}`,'
    if anchor not in sw:
        raise SystemExit("âncora do pomodoro ausente no service worker")
    sw = sw.replace(anchor, anchor + "\n" + js_asset, 1)
sw_path.write_text(sw, encoding="utf-8")

assert OLD not in index_path.read_text(encoding="utf-8")
assert OLD not in ui_path.read_text(encoding="utf-8")
assert controller_tag in index_path.read_text(encoding="utf-8")
assert import_line in archive_css_path.read_text(encoding="utf-8")
assert '14-archive-inspector.css?v=20260725-v4' in wood_path.read_text(encoding="utf-8")
assert 'const ASSET_VERSION = "20260725-editor-status"' in sw_path.read_text(encoding="utf-8")
assert 'vereda-offline-v947' in sw_path.read_text(encoding="utf-8")
assert '14-archive-inspector.css?v=20260725-v4' in sw_path.read_text(encoding="utf-8")
assert css_asset in sw_path.read_text(encoding="utf-8")
assert js_asset in sw_path.read_text(encoding="utf-8")

Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "migrar-editor-status-argila.yml"
if workflow.exists():
    workflow.unlink()
