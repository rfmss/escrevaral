#!/usr/bin/env python3
"""Executa o smoke Mass Notes com readiness independente de visibilidade.

O estado de salvamento é ocultado visualmente no mobile, mas continua presente e
atualizado para tecnologias assistivas. O runner exige apenas que o nó exista.
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "test-mass-notes-browser.py"

spec = importlib.util.spec_from_file_location("mass_notes_browser_suite", SOURCE)
if spec is None or spec.loader is None:
    raise SystemExit("Não foi possível carregar o smoke Mass Notes.")

suite = importlib.util.module_from_spec(spec)
spec.loader.exec_module(suite)


def wait_ready(page) -> None:
    page.goto(suite.BASE_URL, wait_until="networkidle")
    page.locator("#mn-save-state").wait_for(state="attached")
    page.wait_for_function(
        """() => ['Salvo', 'Alterações temporárias'].includes(document.querySelector('#mn-save-state')?.textContent?.trim())""",
        timeout=20_000,
    )


suite.wait_ready = wait_ready
raise SystemExit(suite.main())
