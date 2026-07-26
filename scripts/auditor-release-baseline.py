#!/usr/bin/env python3
"""Valida a coerência entre a versão pública e a documentação de lançamento."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports" / "auditoria" / "release-baseline-artifacts"
REPORT_JSON = REPORT_DIR / "report.json"
REPORT_MD = REPORT_DIR / "report.md"

CHECKS: list[str] = []
FAILURES: list[str] = []


def require(condition: bool, success: str, failure: str) -> None:
    if condition:
        CHECKS.append(success)
    else:
        FAILURES.append(failure)


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        FAILURES.append(f"arquivo obrigatório ausente: {path}")
        return ""
    return target.read_text(encoding="utf-8")


def tracked_files() -> set[str]:
    output = subprocess.check_output(["git", "ls-files"], cwd=ROOT, text=True)
    return {line.strip() for line in output.splitlines() if line.strip()}


def main() -> int:
    version_text = read("VERSION").strip()
    require(
        bool(re.fullmatch(r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?", version_text)),
        f"VERSION contém versão semântica válida: {version_text}",
        f"VERSION inválido: {version_text!r}",
    )

    readme = read("README.md")
    changelog = read("CHANGELOG.md")
    release_index = read("docs/release/README.md")
    checklist = read("docs/release/LAUNCH_CHECKLIST.md")
    baseline = read("docs/release/BASELINE_1.0.0_RC1_2026-07-26.md")

    required_paths = {
        "VERSION",
        "README.md",
        "CHANGELOG.md",
        "docs/release/README.md",
        "docs/release/LAUNCH_CHECKLIST.md",
        "docs/release/BASELINE_1.0.0_RC1_2026-07-26.md",
        "docs/release/ARGILA_RELEASE_CANDIDATE_2026-07-25.md",
    }
    tracked = tracked_files()
    missing_tracked = sorted(required_paths - tracked)
    require(
        not missing_tracked,
        "arquivos da baseline estão versionados",
        "arquivos da baseline fora do Git: " + ", ".join(missing_tracked),
    )

    require(
        f"Versão: `{version_text}`" in readme,
        "README declara a versão pública atual",
        "README não declara a mesma versão de VERSION",
    )
    for link in (
        "docs/release/README.md",
        "docs/release/LAUNCH_CHECKLIST.md",
        "CHANGELOG.md",
        "ARCHITECTURE.md",
    ):
        require(link in readme, f"README aponta para {link}", f"README sem link para {link}")

    heading_pattern = rf"^## \[{re.escape(version_text)}\] - \d{{4}}-\d{{2}}-\d{{2}}$"
    require(
        bool(re.search(heading_pattern, changelog, flags=re.MULTILINE)),
        "CHANGELOG possui seção datada da versão",
        f"CHANGELOG sem seção datada para {version_text}",
    )

    require(
        version_text in release_index,
        "índice de releases declara a versão atual",
        "docs/release/README.md diverge de VERSION",
    )
    require(
        version_text in checklist,
        "checklist declara a versão em estabilização",
        "checklist diverge de VERSION",
    )
    require(
        "P0 reproduzido: 0" in baseline and "P1 reproduzido: 0" in baseline,
        "baseline registra ausência de P0/P1",
        "baseline não registra o estado de P0/P1",
    )
    require(
        "dba5ce5d8e4b844efe921a46a048617dd0d3c02a" in baseline,
        "baseline registra o ponto de partida",
        "baseline sem commit de partida verificável",
    )

    if version_text.endswith("-rc.1"):
        require(
            "[ ]" in checklist,
            "candidata mantém itens finais explicitamente pendentes",
            "checklist da candidata não mostra pendências finais",
        )
    elif version_text == "1.0.0":
        require(
            "[ ]" not in checklist,
            "checklist final está integralmente concluído",
            "VERSION é 1.0.0, mas o checklist ainda contém itens pendentes",
        )

    status = "aprovado" if not FAILURES else "reprovado"
    report = {
        "date": date.today().isoformat(),
        "version": version_text,
        "status": status,
        "checks": CHECKS,
        "failures": FAILURES,
    }
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Auditoria da baseline de lançamento",
        "",
        f"Versão: `{version_text}`",
        f"Status: {status}",
        "",
        "## Verificações aprovadas",
        "",
    ]
    lines.extend(f"- {item}" for item in CHECKS)
    if FAILURES:
        lines.extend(["", "## Falhas", ""])
        lines.extend(f"- {item}" for item in FAILURES)
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Baseline de release: {status}; versão={version_text}; falhas={len(FAILURES)}")
    for failure in FAILURES:
        print(f"FALHA: {failure}")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
