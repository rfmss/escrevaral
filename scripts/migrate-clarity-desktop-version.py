#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OLD = "20260725-release-candidate"
NEW = "20260725-clarity-desktop-v1"

index = ROOT / "index.html"
sw = ROOT / "service-worker.js"
ui = ROOT / "ui-dialog.js"

index_text = index.read_text(encoding="utf-8")
if OLD not in index_text:
    raise SystemExit(f"versão antiga ausente em index.html: {OLD}")
index_text = index_text.replace(OLD, NEW)
versions = re.findall(r"[?&]v=([0-9]{8}-[A-Za-z0-9._-]+)", index_text)
if len(versions) < 60 or set(versions) != {NEW}:
    raise SystemExit(f"index incoerente após migração: refs={len(versions)} versões={sorted(set(versions))}")
index.write_text(index_text, encoding="utf-8")

sw_text = sw.read_text(encoding="utf-8")
sw_text, count = re.subn(
    r'const ASSET_VERSION = "[^"]+";',
    f'const ASSET_VERSION = "{NEW}";',
    sw_text,
    count=1,
)
if count != 1:
    raise SystemExit("ASSET_VERSION não migrado")
if 'const CACHE_NAME = "vereda-offline-v950";' not in sw_text:
    raise SystemExit("cache v950 ausente")
if "./css/20-product-clarity-desktop.css?v=20260725-clarity-desktop-v1" not in sw_text:
    raise SystemExit("camada de clareza ausente do pacote offline")
sw.write_text(sw_text, encoding="utf-8")

ui_text = ui.read_text(encoding="utf-8")
ui_text, count = re.subn(
    r"lexical-view-controller\.js\?v=[0-9]{8}-[A-Za-z0-9._-]+",
    f"lexical-view-controller.js?v={NEW}",
    ui_text,
)
if count < 1:
    raise SystemExit("versão lexical não migrada em ui-dialog.js")
ui.write_text(ui_text, encoding="utf-8")

print(f"migração concluída: {OLD} -> {NEW}; referências={len(versions)}; lexical={count}")
