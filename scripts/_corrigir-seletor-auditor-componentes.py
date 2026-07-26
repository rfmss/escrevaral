#!/usr/bin/env python3
"""Correção transitória e exata do seletor do auditor de componentes."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDITOR = ROOT / "scripts" / "auditor-design-system-components.py"
OLD = "selector = f'{scope} [data-variant=\"{variant}\"]:not([data-size]):not([data-state])'"
NEW = "selector = f'{scope} [data-variant=\"{variant}\"]:not([data-size]):not([data-state]):not([data-icon-only])'"

text = AUDITOR.read_text(encoding="utf-8")
if text.count(OLD) != 1:
    raise SystemExit(
        f"[fix-auditor] FALHA: esperado exatamente um seletor antigo; encontrado {text.count(OLD)}"
    )
AUDITOR.write_text(text.replace(OLD, NEW), encoding="utf-8")

for transient in (
    ROOT / "scripts" / "_corrigir-seletor-auditor-componentes.py",
    ROOT / ".github" / "workflows" / "_fix-auditor-componentes.yml",
):
    transient.unlink(missing_ok=True)

print("[fix-auditor] seletor secundário corrigido e arquivos transitórios removidos")
