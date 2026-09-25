#!/usr/bin/env python3
"""Audita a entrada experimental Mass Notes sem executar publicação.

O auditor verifica a fronteira estrutural do experimento: arquivos referenciados,
IDs, ordem de scripts, sintaxe JavaScript e ausência de acesso direto às engines
pelo controlador da interface.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENTRY = ROOT / "mass-notes.html"
REPORT_DIR = ROOT / "reports" / "auditoria" / "mass-notes-mvp-artifacts"
REPORT_PATH = REPORT_DIR / "resultado.json"

REQUIRED_FILES = [
    "mass-notes.html",
    "css/mass-notes/00-tokens.css",
    "css/mass-notes/01-shell.css",
    "css/mass-notes/02-components.css",
    "css/mass-notes/03-responsive.css",
    "js/mass-notes/core/store.js",
    "js/mass-notes/integrations/engines.js",
    "js/mass-notes/controllers/app.js",
    "js/mass-notes/core/bootstrap.js",
    "analise-engine.js",
    "voice-engine.js",
    "rimalab-engine.js",
    "decolonial-engine.js",
    "proof-engine.js",
    "export-engine.js",
    "pagination-engine.js",
]

REQUIRED_IDS = {
    "mn-app",
    "mn-library",
    "mn-inspector",
    "mn-editor",
    "mn-title",
    "mn-document-list",
    "mn-outline",
    "mn-review-results",
    "mn-voice-results",
    "mn-rhyme-results",
    "mn-authorship-results",
    "mn-overlay",
}

ENGINE_SCRIPTS = [
    "syntax-engine.js",
    "punctuation-engine.js",
    "analise-engine.js",
    "voice-engine.js",
    "rimalab-engine.js",
    "decolonial-engine.js",
    "proof-engine.js",
    "export-engine.js",
    "pagination-engine.js",
]

NEW_LAYER_SCRIPTS = [
    "js/mass-notes/core/store.js",
    "js/mass-notes/integrations/engines.js",
    "js/mass-notes/controllers/app.js",
    "js/mass-notes/core/bootstrap.js",
]


class EntryParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.local_assets: list[str] = []
        self.scripts: list[str] = []
        self.html_lang: str | None = None
        self.title_depth = 0
        self.title = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if tag == "html":
            self.html_lang = data.get("lang")
        if data.get("id"):
            self.ids.append(str(data["id"]))
        if tag == "script" and data.get("src"):
            src = str(data["src"])
            self.scripts.append(src)
            if is_local(src):
                self.local_assets.append(src)
        if tag == "link" and data.get("href"):
            href = str(data["href"])
            if is_local(href):
                self.local_assets.append(href)
        if tag == "title":
            self.title_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self.title_depth:
            self.title_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.title_depth:
            self.title += data


def is_local(value: str) -> bool:
    return not value.startswith(("http://", "https://", "//", "data:", "mailto:", "#"))


def local_path(value: str) -> Path:
    return ROOT / value.split("?", 1)[0].lstrip("./")


def run_node_check(path: Path) -> tuple[bool, str]:
    node = shutil.which("node")
    if not node:
        return False, "Node.js não está disponível no ambiente do auditor."
    result = subprocess.run(
        [node, "--check", str(path)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    output = (result.stdout + result.stderr).strip()
    return result.returncode == 0, output


def main() -> int:
    failures: list[str] = []
    warnings: list[str] = []
    checks: dict[str, object] = {}

    missing_required = [path for path in REQUIRED_FILES if not (ROOT / path).is_file()]
    checks["required_files"] = {"missing": missing_required}
    if missing_required:
        failures.append("Arquivos obrigatórios ausentes: " + ", ".join(missing_required))

    if not ENTRY.is_file():
        write_report(checks, failures, warnings)
        return 1

    parser = EntryParser()
    parser.feed(ENTRY.read_text(encoding="utf-8"))

    duplicate_ids = sorted(identifier for identifier, count in Counter(parser.ids).items() if count > 1)
    missing_ids = sorted(REQUIRED_IDS.difference(parser.ids))
    checks["html"] = {
        "lang": parser.html_lang,
        "title": parser.title.strip(),
        "duplicate_ids": duplicate_ids,
        "missing_required_ids": missing_ids,
    }
    if parser.html_lang != "pt-BR":
        failures.append('A entrada experimental deve usar lang="pt-BR".')
    if duplicate_ids:
        failures.append("IDs duplicados: " + ", ".join(duplicate_ids))
    if missing_ids:
        failures.append("IDs obrigatórios ausentes: " + ", ".join(missing_ids))
    if not parser.title.strip():
        failures.append("O título da página está vazio.")

    missing_assets = sorted({asset for asset in parser.local_assets if not local_path(asset).is_file()})
    checks["local_assets"] = {"count": len(parser.local_assets), "missing": missing_assets}
    if missing_assets:
        failures.append("Assets locais referenciados e ausentes: " + ", ".join(missing_assets))

    script_positions = {src: parser.scripts.index(src) for src in parser.scripts}
    absent_scripts = [src for src in ENGINE_SCRIPTS + NEW_LAYER_SCRIPTS if src not in script_positions]
    if absent_scripts:
        failures.append("Scripts obrigatórios não carregados: " + ", ".join(absent_scripts))
    else:
        last_engine = max(script_positions[src] for src in ENGINE_SCRIPTS)
        first_new_layer = min(script_positions[src] for src in NEW_LAYER_SCRIPTS)
        if last_engine >= first_new_layer:
            failures.append("A nova camada foi carregada antes do fim das engines existentes.")
        expected_new_positions = [script_positions[src] for src in NEW_LAYER_SCRIPTS]
        if expected_new_positions != sorted(expected_new_positions):
            failures.append("A ordem store → integrations → controller → bootstrap foi alterada.")
    checks["script_order"] = parser.scripts

    js_paths = [ROOT / path for path in NEW_LAYER_SCRIPTS]
    syntax_results = {}
    for path in js_paths:
        ok, output = run_node_check(path)
        syntax_results[str(path.relative_to(ROOT))] = {"ok": ok, "output": output}
        if not ok:
            failures.append(f"Sintaxe JavaScript inválida em {path.relative_to(ROOT)}: {output}")
    checks["javascript_syntax"] = syntax_results

    controller_text = (ROOT / "js/mass-notes/controllers/app.js").read_text(encoding="utf-8")
    direct_engine_references = sorted({token for token in [
        "VeredaAnalise",
        "VeredaVoice",
        "VeredaRimaLab",
        "VeredaDecolonial",
        "VeredaProof",
        "VeredaExport",
        "VeredaPagination",
    ] if token in controller_text})
    checks["controller_boundary"] = {"direct_engine_references": direct_engine_references}
    if direct_engine_references:
        failures.append("O controlador acessa engines diretamente: " + ", ".join(direct_engine_references))

    store_text = (ROOT / "js/mass-notes/core/store.js").read_text(encoding="utf-8")
    destructive_storage_calls = [needle for needle in ["localStorage.clear(", f'localStorage.removeItem("vereda.manuscripts.v1"'] if needle in store_text]
    checks["legacy_preservation"] = {
        "reads_legacy_key": "vereda.manuscripts.v1" in store_text,
        "destructive_calls": destructive_storage_calls,
    }
    if "vereda.manuscripts.v1" not in store_text:
        failures.append("A migração não referencia a chave legada esperada.")
    if destructive_storage_calls:
        failures.append("A migração contém chamada destrutiva sobre o armazenamento legado.")

    external_runtime_assets = sorted(asset for asset in parser.local_assets if not is_local(asset))
    checks["privacy_boundary"] = {"external_runtime_assets": external_runtime_assets}

    write_report(checks, failures, warnings)
    if failures:
        print("[FALHOU] Auditoria Mass Notes MVP")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("[OK] Auditoria Mass Notes MVP")
    print(f"- {len(parser.ids)} IDs únicos")
    print(f"- {len(parser.local_assets)} assets locais encontrados")
    print(f"- {len(js_paths)} arquivos JavaScript com sintaxe válida")
    print("- controlador sem acesso direto às engines")
    print("- fonte legada preservada")
    return 0


def write_report(checks: dict[str, object], failures: list[str], warnings: list[str]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(
            {
                "status": "failed" if failures else "passed",
                "checks": checks,
                "failures": failures,
                "warnings": warnings,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    sys.exit(main())
