#!/usr/bin/env python3
"""Falha quando os identificadores da distribuição pública do Escrevaral divergem."""

from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
SERVICE_WORKER = ROOT / "service-worker.js"
UI_DIALOG = ROOT / "ui-dialog.js"
VERSION_PATTERN = re.compile(r"[?&]v=([0-9]{8}-[A-Za-z0-9._-]+)")
ASSET_PATTERN = re.compile(r'const ASSET_VERSION = "([^"]+)";')
CACHE_PATTERN = re.compile(r'const CACHE_NAME = "vereda-offline-v(\d+)";')
DISTRIBUTION_EXCLUDED_PREFIXES = (
    "reports/",
    # Aplicação Vite independente, com build, hashes e preview próprios.
    "mass-notes-next/",
)


def fail(message: str) -> None:
    raise SystemExit(f"[asset-version] FALHA: {message}")


def single_index_version(index_text: str, label: str) -> tuple[str, int]:
    versions = VERSION_PATTERN.findall(index_text)
    if len(versions) < 60:
        fail(f"{label} possui apenas {len(versions)} referências versionadas; esperado: ao menos 60")

    unique_versions = sorted(set(versions))
    if len(unique_versions) != 1:
        fail(f"{label} mistura versões: {', '.join(unique_versions)}")
    return unique_versions[0], len(versions)


def is_public_distributed_asset(path: str) -> bool:
    """Retorna True somente para JS/CSS servidos pela aplicação pública raiz."""
    return (
        path.endswith((".js", ".css"))
        and not path.startswith(DISTRIBUTION_EXCLUDED_PREFIXES)
    )


def compare_with_base(index_version: str, cache_number: int) -> list[str]:
    base_ref = os.getenv("GITHUB_BASE_REF", "").strip()
    if not base_ref:
        return []

    base_name = f"origin/{base_ref}"
    try:
        base_index = subprocess.check_output(
            ["git", "show", f"{base_name}:index.html"],
            cwd=ROOT,
            text=True,
        )
        base_sw = subprocess.check_output(
            ["git", "show", f"{base_name}:service-worker.js"],
            cwd=ROOT,
            text=True,
        )
        changed_output = subprocess.check_output(
            ["git", "diff", "--name-only", f"{base_name}...HEAD"],
            cwd=ROOT,
            text=True,
        )
    except subprocess.CalledProcessError as error:
        fail(f"não foi possível comparar com {base_name}: {error}")

    base_version, _ = single_index_version(base_index, f"{base_name}/index.html")
    base_cache_match = CACHE_PATTERN.search(base_sw)
    if not base_cache_match:
        fail(f"CACHE_NAME não encontrado em {base_name}/service-worker.js")
    base_cache = int(base_cache_match.group(1))

    changed_files = [line.strip() for line in changed_output.splitlines() if line.strip()]
    distributed_changes = sorted(filter(is_public_distributed_asset, changed_files))

    if distributed_changes and index_version == base_version:
        preview = ", ".join(distributed_changes[:8])
        suffix = "…" if len(distributed_changes) > 8 else ""
        fail(
            "JavaScript ou CSS público mudou sem nova versão global: "
            f"{preview}{suffix}"
        )

    if index_version != base_version and cache_number <= base_cache:
        fail(
            f"a versão mudou de {base_version} para {index_version}, "
            f"mas o cache não avançou além de v{base_cache}"
        )

    return distributed_changes


def main() -> None:
    index_text = INDEX.read_text(encoding="utf-8")
    sw_text = SERVICE_WORKER.read_text(encoding="utf-8")
    ui_text = UI_DIALOG.read_text(encoding="utf-8")

    index_version, reference_count = single_index_version(index_text, "index.html")

    asset_match = ASSET_PATTERN.search(sw_text)
    if not asset_match:
        fail("ASSET_VERSION não encontrado no service-worker.js")
    asset_version = asset_match.group(1)
    if asset_version != index_version:
        fail(f"ASSET_VERSION={asset_version} difere do index={index_version}")

    cache_match = CACHE_PATTERN.search(sw_text)
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

    distributed_changes = compare_with_base(index_version, cache_number)
    print(
        "[asset-version] aprovado "
        f"versao={asset_version} referencias={reference_count} cache=v{cache_number} "
        f"arquivos_publicos_alterados={len(distributed_changes)}"
    )


if __name__ == "__main__":
    main()
