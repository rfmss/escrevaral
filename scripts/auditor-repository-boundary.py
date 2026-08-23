#!/usr/bin/env python3
"""Audita a fronteira entre código público, saídas geradas e superfície do produto."""

from __future__ import annotations

import json
import subprocess
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TODAY = date.today().isoformat()
REPORT_DIR = ROOT / "reports" / "auditoria" / "repository-boundary-artifacts"
REPORT_JSON = REPORT_DIR / "report.json"
REPORT_MD = REPORT_DIR / "report.md"

FAILURES: list[str] = []
CHECKS: list[str] = []


def require(condition: bool, success: str, failure: str) -> None:
    if condition:
        CHECKS.append(success)
    else:
        FAILURES.append(failure)


def tracked_files() -> set[str]:
    output = subprocess.check_output(
        ["git", "ls-files"],
        cwd=ROOT,
        text=True,
    )
    return {line.strip() for line in output.splitlines() if line.strip()}


def audit_tree(files: set[str]) -> None:
    required = {
        "index.html",
        "service-worker.js",
        "manifest.webmanifest",
        "CNAME",
        ".nojekyll",
        "reports/README.md",
    }
    missing = sorted(required - files)
    require(
        not missing,
        "Entradas de publicação e contrato de reports presentes",
        f"Arquivos obrigatórios ausentes: {', '.join(missing)}",
    )

    report_files = sorted(path for path in files if path.startswith("reports/"))
    require(
        report_files == ["reports/README.md"],
        "Somente reports/README.md permanece versionado",
        "Saídas geradas voltaram ao Git: " + ", ".join(report_files[:20]),
    )

    # A raiz publicada e a aplicação Mass Notes possuem escopos PWA distintos.
    # O worker de mass-notes-next/public é um asset-fonte da aplicação isolada e
    # só é publicado dentro da sua própria preview/build; não disputa o escopo
    # do service-worker.js canônico da raiz.
    allowed_scoped_workers = {"mass-notes-next/public/service-worker.js"}
    nested_workers = sorted(path for path in files if path.endswith("/service-worker.js"))
    unexpected_workers = sorted(set(nested_workers) - allowed_scoped_workers)
    require(
        not unexpected_workers,
        "Workers aninhados permanecem limitados aos escopos explicitamente autorizados",
        "Service worker duplicado ou movido fora dos escopos autorizados: " + ", ".join(unexpected_workers),
    )
    require(
        allowed_scoped_workers.issubset(files),
        "Worker isolado da aplicação Mass Notes permanece versionado no seu escopo",
        "Worker isolado esperado ausente: mass-notes-next/public/service-worker.js",
    )


def audit_ignore_rules() -> None:
    text = (ROOT / ".gitignore").read_text(encoding="utf-8")
    require(
        "reports/**" in text and "!reports/README.md" in text,
        "Saídas de reports são ignoradas com exceção explícita do README",
        ".gitignore não protege reports/** e reports/README.md corretamente",
    )


def audit_runtime_surface() -> None:
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    forbidden = ("docs/", "reports/", "personas/", ".agents/", ".claude/")

    for label, text in (("index.html", index), ("service-worker.js", worker)):
        found = [token for token in forbidden if token in text]
        require(
            not found,
            f"{label} não referencia material administrativo",
            f"{label} referencia material fora do produto: {', '.join(found)}",
        )

    require(
        'const CACHE_NAME = "vereda-offline-' in worker,
        "Service worker mantém cache versionado",
        "CACHE_NAME versionado não foi encontrado no service-worker.js",
    )
    require(
        'const ASSET_VERSION = "' in worker,
        "Service worker mantém versão global de assets",
        "ASSET_VERSION não foi encontrado no service-worker.js",
    )

    scoped_worker_path = ROOT / "mass-notes-next" / "public" / "service-worker.js"
    scoped_worker = scoped_worker_path.read_text(encoding="utf-8")
    require(
        "escrevaral-paper-home-offline-" in scoped_worker
        and "__ESCREVARAL_BUILD_ID__" in scoped_worker
        and "__ESCREVARAL_PRECACHE_ASSETS__" in scoped_worker,
        "Worker Mass Notes mantém cache/build/precache próprios e isolados",
        "Worker Mass Notes perdeu o contrato de cache/build/precache isolado",
    )


def audit_domain() -> None:
    cname = (ROOT / "CNAME").read_text(encoding="utf-8").strip()
    require(
        cname == "escrevaral.com",
        "Domínio canônico permanece escrevaral.com",
        f"CNAME inesperado: {cname!r}",
    )


def write_report() -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "status": "reprovado" if FAILURES else "aprovado",
        "checks": CHECKS,
        "failures": FAILURES,
    }
    REPORT_JSON.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    lines = [
        "# Fronteira do repositório público",
        "",
        f"Status: {'REPROVADO' if FAILURES else 'APROVADO'}",
        "",
        "## Verificações",
        "",
        *[f"- OK — {check}" for check in CHECKS],
    ]
    if FAILURES:
        lines += ["", "## Falhas", "", *[f"- {failure}" for failure in FAILURES]]
    REPORT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    files = tracked_files()
    audit_tree(files)
    audit_ignore_rules()
    audit_runtime_surface()
    audit_domain()
    write_report()

    if FAILURES:
        for failure in FAILURES:
            print(f"ERRO: {failure}")
        return 1

    for check in CHECKS:
        print(f"OK: {check}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
