#!/usr/bin/env python3
"""Falha quando os identificadores de distribuição do Escrevaral divergem."""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
SERVICE_WORKER = ROOT / "service-worker.js"
UI_DIALOG = ROOT / "ui-dialog.js"


def fail(message: str) -> None:
    raise SystemExit(f"[asset-version] FALHA: {message}")


def main() -> None:
    index_text = INDEX.read_text(encoding="utf-8")
    sw_text = SERVICE_WORKER.read_text(encoding="utf-8")
    ui_text = UI_DIALOG.read_text(encoding="utf-8")

    index_versions = re.findall(r"[?&]v=([0-9]{8}-[A-Za-z0-9._-]+)", index_text)
    if len(index_versions) < 60:
        fail(f"index.html possui apenas {len(index_versions)} referências versionadas; esperado: ao menos 60")

    unique_index_versions = sorted(set(index_versions))
    if len(unique_index_versions) != 1:
        fail(f"index.html mistura versões: {', '.join(unique_index_versions)}")
    index_version = unique_index_versions[0]

    asset_match = re.search(r'const ASSET_VERSION = "([^"]+)";', sw_text)
    if not asset_match:
        fail("ASSET_VERSION não encontrado no service-worker.js")
    asset_version = asset_match.group(1)
    if asset_version != index_version:
        fail(f"ASSET_VERSION={asset_version} difere do index={index_version}")

    cache_match = re.search(r'const CACHE_NAME = "vereda-offline-v(\d+)";', sw_text)
    if not cache_match:
        fail("CACHE_NAME não segue vereda-offline-vN")
    cache_number = int(cache_match.group(1))
    if cache_number < 1:
        fail("CACHE_NAME inválido")

    controller_match = re.search(
        r"lexical-view-controller\.js\?v=([0-9]{8}-[A-Za-z0-9._-]+)",
        ui_text,
    )
    if not controller_match:
        fail("versão do lexical-view-controller.js não encontrada em ui-dialog.js")
    controller_version = controller_match.group(1)
    if controller_version != asset_version:
        fail(
            "controlador lexical usa "
            f"{controller_version}, mas ASSET_VERSION usa {asset_version}"
        )

    expected_core_asset = "`./lexical-view-controller.js?v=${ASSET_VERSION}`"
    if expected_core_asset not in sw_text:
        fail("controlador lexical não usa ASSET_VERSION no CORE_ASSETS")

    print(
        "[asset-version] aprovado "
        f"versao={asset_version} referencias={len(index_versions)} cache=v{cache_number}"
    )


if __name__ == "__main__":
    main()
