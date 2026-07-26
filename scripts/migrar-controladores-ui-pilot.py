#!/usr/bin/env python3
"""Gera, apenas no CI do piloto, um pacote verificável da migração de controladores."""

from __future__ import annotations

import json
import shutil
import subprocess
import traceback
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "reports" / "auditoria" / "migracao-controladores"
OLD_VERSION = "20260725-js-controllers-pilot-v1"
NEW_VERSION = "20260726-js-controllers-ui-v1"
MOVES = {
    "editor-status-controller.js": "js/controllers/editor-status-controller.js",
    "oficina-navigation-controller.js": "js/controllers/oficina-navigation-controller.js",
    "training-controller.js": "js/controllers/training-controller.js",
}


def replace_required(text: str, old: str, new: str, source: str) -> str:
    if old not in text:
        raise RuntimeError(f"Marcador ausente em {source}: {old}")
    return text.replace(old, new)


def update_text(path: str, transform) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    target.write_text(transform(text), encoding="utf-8")


def copy_to_package(relative: str) -> None:
    source = ROOT / relative
    destination = PACKAGE / "files" / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def main() -> int:
    if PACKAGE.exists():
        shutil.rmtree(PACKAGE)
    PACKAGE.mkdir(parents=True)

    for old, new in MOVES.items():
        source = ROOT / old
        destination = ROOT / new
        if not source.is_file():
            raise RuntimeError(f"Origem ausente: {old}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(source, destination)

    def transform_index(text: str) -> str:
        text = replace_required(text, OLD_VERSION, NEW_VERSION, "index.html")
        for old, new in MOVES.items():
            text = replace_required(text, f'src="{old}?v=', f'src="{new}?v=', "index.html")
        return text

    update_text("index.html", transform_index)

    def transform_worker(text: str) -> str:
        text = replace_required(
            text,
            'const CACHE_NAME = "vereda-offline-v956";',
            'const CACHE_NAME = "vereda-offline-v957";',
            "service-worker.js",
        )
        text = replace_required(text, OLD_VERSION, NEW_VERSION, "service-worker.js")
        for old, new in MOVES.items():
            text = replace_required(
                text,
                f"`./{old}?v=${{ASSET_VERSION}}`",
                f"`./{new}?v=${{ASSET_VERSION}}`",
                "service-worker.js",
            )
        return text

    update_text("service-worker.js", transform_worker)
    update_text(
        "ui-dialog.js",
        lambda text: replace_required(text, OLD_VERSION, NEW_VERSION, "ui-dialog.js"),
    )

    workflow_moves = {
        ".github/workflows/editor-status-argila-pr.yml": (
            "editor-status-controller.js",
            "js/controllers/editor-status-controller.js",
        ),
        ".github/workflows/oficina-navigation-pr.yml": (
            "oficina-navigation-controller.js",
            "js/controllers/oficina-navigation-controller.js",
        ),
    }
    for path, (old, new) in workflow_moves.items():
        update_text(path, lambda text, old=old, new=new, path=path: replace_required(text, old, new, path))

    decision_path = ROOT / "docs" / "_decisoes" / "ESTRUTURA_RAIZ.md"
    decision = decision_path.read_text(encoding="utf-8")
    heading = "## Segundo lote de controladores — 2026-07-26"
    if heading not in decision:
        decision = decision.rstrip() + (
            "\n\n"
            f"{heading}\n\n"
            "Mais três controladores de interface foram migrados para `js/controllers/` em um lote isolado. "
            "Os workflows especializados que validam situação do editor e navegação da Oficina foram "
            "atualizados junto; nenhuma lógica de produto foi refatorada.\n"
        )
        decision_path.write_text(decision, encoding="utf-8")

    evidence_path = ROOT / "docs" / "_decisoes" / "PILOTO_ESTRUTURA_JS_CONTROLLERS_UI_2026-07-26.md"
    evidence_path.write_text(
        """# Segundo lote estrutural — controladores de interface

Data: 2026-07-26

## Decisão

Mover um novo grupo pequeno de controladores para `js/controllers/`, mantendo conteúdo, ordem de carregamento e comportamento.

## Arquivos

- `editor-status-controller.js` → `js/controllers/editor-status-controller.js`;
- `oficina-navigation-controller.js` → `js/controllers/oficina-navigation-controller.js`;
- `training-controller.js` → `js/controllers/training-controller.js`.

## Consumidores atualizados

- `index.html`;
- `service-worker.js`;
- `ui-dialog.js`, apenas para coerência da versão global;
- `.github/workflows/editor-status-argila-pr.yml`;
- `.github/workflows/oficina-navigation-pr.yml`.

## Limites

Nenhuma função, variável global, chave de armazenamento, evento, ordem de script ou comportamento de interface foi alterado.

## Evidência mínima

- conteúdos preservados durante a mudança de caminho;
- sintaxe dos três destinos verificada;
- referências executáveis atualizadas;
- novos caminhos servidos por HTTP;
- coerência de versão e cache validada.
""",
        encoding="utf-8",
    )

    for path in MOVES.values():
        subprocess.run(["node", "--check", str(ROOT / path)], check=True, cwd=ROOT)

    subprocess.run(["git", "fetch", "origin", "main"], check=True, cwd=ROOT)
    result = subprocess.run(
        ["python", "scripts/auditor-asset-version.py"],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    (PACKAGE / "asset-version.stdout.txt").write_text(result.stdout, encoding="utf-8")
    (PACKAGE / "asset-version.stderr.txt").write_text(result.stderr, encoding="utf-8")
    if result.returncode != 0:
        raise RuntimeError(
            "auditor-asset-version.py recusou a candidata: "
            + (result.stderr or result.stdout or f"exit {result.returncode}")
        )

    package_files = [
        "index.html",
        "service-worker.js",
        "ui-dialog.js",
        ".github/workflows/editor-status-argila-pr.yml",
        ".github/workflows/oficina-navigation-pr.yml",
        "docs/_decisoes/ESTRUTURA_RAIZ.md",
        "docs/_decisoes/PILOTO_ESTRUTURA_JS_CONTROLLERS_UI_2026-07-26.md",
        *MOVES.values(),
    ]
    for relative in package_files:
        copy_to_package(relative)

    manifest = {
        "version": NEW_VERSION,
        "cache": "vereda-offline-v957",
        "files": package_files,
        "delete": list(MOVES.keys()),
    }
    (PACKAGE / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (PACKAGE / "deletions.txt").write_text("\n".join(MOVES) + "\n", encoding="utf-8")
    print(f"Pacote de migração gerado em {PACKAGE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    try:
        exit_code = main()
    except Exception:
        PACKAGE.mkdir(parents=True, exist_ok=True)
        (PACKAGE / "error.txt").write_text(traceback.format_exc(), encoding="utf-8")
        raise
    raise SystemExit(exit_code)
