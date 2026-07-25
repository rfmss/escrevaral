#!/usr/bin/env python3
"""Sincronização descartável do segundo corte da fundação Argila."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = "20260725-argila-foundation"
NEW = "20260725-argila-foundation-2"

for relative in ("index.html", "ui-dialog.js"):
    path = ROOT / relative
    path.write_text(path.read_text(encoding="utf-8").replace(OLD, NEW), encoding="utf-8")

sw_path = ROOT / "service-worker.js"
sw = sw_path.read_text(encoding="utf-8")
sw = sw.replace('vereda-offline-v945', 'vereda-offline-v946')
sw = sw.replace(OLD, NEW)
sw = sw.replace('14-archive-inspector.css?v=20260725-v2', '14-archive-inspector.css?v=20260725-v3')
sw_path.write_text(sw, encoding="utf-8")

wood_path = ROOT / "css" / "wood-icons.css"
wood = wood_path.read_text(encoding="utf-8").replace('20260725-v2', '20260725-v3')
wood_path.write_text(wood, encoding="utf-8")

archive_path = ROOT / "css" / "14-archive-inspector.css"
archive = archive_path.read_text(encoding="utf-8").replace(OLD, NEW)
archive_path.write_text(archive, encoding="utf-8")

assert OLD not in (ROOT / "index.html").read_text(encoding="utf-8")
assert NEW in sw_path.read_text(encoding="utf-8")
assert 'vereda-offline-v946' in sw_path.read_text(encoding="utf-8")

Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "migrar-argila-focus.yml"
if workflow.exists():
    workflow.unlink()
