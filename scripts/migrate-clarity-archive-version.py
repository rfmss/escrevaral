#!/usr/bin/env python3
"""Sincroniza a distribuição da fase Clareza do Acervo."""

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
OLD = "20260725-clarity-desktop-v1"
NEW = "20260725-clarity-archive-v1"

index = ROOT / "index.html"
styles = ROOT / "styles.css"
service_worker = ROOT / "service-worker.js"
ui_dialog = ROOT / "ui-dialog.js"
product_controller = ROOT / "product-clarity-controller.js"
oficina_controller = ROOT / "oficina-navigation-controller.js"

index_text = index.read_text(encoding="utf-8")
if OLD not in index_text and NEW not in index_text:
    raise SystemExit("nenhuma versão conhecida encontrada em index.html")
index_text = index_text.replace(OLD, NEW)
versions = re.findall(r"[?&]v=([0-9]{8}-[A-Za-z0-9._-]+)", index_text)
if len(versions) < 60 or set(versions) != {NEW}:
    raise SystemExit(f"index incoerente: refs={len(versions)} versões={sorted(set(versions))}")
index.write_text(index_text, encoding="utf-8")

styles_text = styles.read_text(encoding="utf-8").replace(OLD, NEW)
required_imports = (
    f'./css/20-product-clarity-desktop.css?v={NEW}',
    f'./css/20-product-clarity-desktop-controls.css?v={NEW}',
    f'./css/21-product-clarity-archive.css?v={NEW}',
)
for required in required_imports:
    if required not in styles_text:
        raise SystemExit(f"import ausente em styles.css: {required}")
styles.write_text(styles_text, encoding="utf-8")

for path in (ui_dialog, product_controller, oficina_controller):
    text = path.read_text(encoding="utf-8").replace(OLD, NEW)
    path.write_text(text, encoding="utf-8")

sw_text = service_worker.read_text(encoding="utf-8")
if f'const ASSET_VERSION = "{NEW}";' not in sw_text:
    raise SystemExit("ASSET_VERSION do Acervo ausente")
if 'const CACHE_NAME = "vereda-offline-v951";' not in sw_text:
    raise SystemExit("cache v951 ausente")
for asset in (
    "./css/21-product-clarity-archive.css?v=${ASSET_VERSION}",
    "./archive-clarity-controller.js?v=${ASSET_VERSION}",
):
    if asset not in sw_text:
        raise SystemExit(f"recurso ausente do pacote offline: {asset}")

lexical_pattern = f"lexical-view-controller.js?v={NEW}"
if lexical_pattern not in ui_dialog.read_text(encoding="utf-8"):
    raise SystemExit("controlador lexical não foi sincronizado")

print(f"migração concluída: {OLD} -> {NEW}; referências={len(versions)}; cache=v951")
