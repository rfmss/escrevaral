#!/usr/bin/env python3
"""Sincronização transitória e estritamente textual da fundação do Design System."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD_VERSION = "20260726-text-muted-contrast-v1"
NEW_VERSION = "20260726-design-system-foundation-v1"
OLD_CACHE = 'const CACHE_NAME = "vereda-offline-v960";'
NEW_CACHE = 'const CACHE_NAME = "vereda-offline-v962";'


def replace_exact(path: str, old: str, new: str, *, minimum: int = 1) -> int:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count < minimum:
        raise SystemExit(
            f"[sync-foundation] FALHA: {path} contém {count} ocorrência(s) de {old!r}; "
            f"esperado ao menos {minimum}"
        )
    target.write_text(text.replace(old, new), encoding="utf-8")
    print(f"[sync-foundation] {path}: {count} substituição(ões)")
    return count


def ensure_absent(path: str, value: str) -> None:
    text = (ROOT / path).read_text(encoding="utf-8")
    if value in text:
        raise SystemExit(
            f"[sync-foundation] FALHA: {value!r} ainda aparece em {path}"
        )


def main() -> None:
    index_count = replace_exact(
        "index.html",
        OLD_VERSION,
        NEW_VERSION,
        minimum=60,
    )
    replace_exact("service-worker.js", OLD_CACHE, NEW_CACHE)
    replace_exact(
        "service-worker.js",
        OLD_VERSION,
        NEW_VERSION,
        minimum=2,
    )
    replace_exact("ui-dialog.js", OLD_VERSION, NEW_VERSION)
    replace_exact(
        "css/14-archive-inspector.css",
        "20260725-editor-status",
        NEW_VERSION,
        minimum=3,
    )
    replace_exact(
        "css/wood-icons.css",
        "20260725-v4",
        NEW_VERSION,
    )
    replace_exact(
        "css/15-brand-argila.css",
        "--text-statistic-label: var(--muted);",
        "--text-statistic-label: var(--soft-ink);",
    )

    for path in ("index.html", "service-worker.js", "ui-dialog.js"):
        ensure_absent(path, OLD_VERSION)
    ensure_absent("css/14-archive-inspector.css", "20260725-editor-status")
    ensure_absent("css/wood-icons.css", "20260725-v4")

    service_worker = (ROOT / "service-worker.js").read_text(encoding="utf-8")
    if NEW_CACHE not in service_worker:
        raise SystemExit("[sync-foundation] FALHA: CACHE_NAME v962 ausente")
    if f'const ASSET_VERSION = "{NEW_VERSION}";' not in service_worker:
        raise SystemExit("[sync-foundation] FALHA: ASSET_VERSION novo ausente")

    index = (ROOT / "index.html").read_text(encoding="utf-8")
    if index.count(NEW_VERSION) != index_count:
        raise SystemExit(
            "[sync-foundation] FALHA: quantidade final de versões no index divergiu"
        )

    for transient in (
        ROOT / "scripts" / "_sincronizar-fundacao-design-system.py",
        ROOT / ".github" / "workflows" / "_sync-design-system-foundation.yml",
    ):
        transient.unlink(missing_ok=True)

    print(
        f"[sync-foundation] aprovado versão={NEW_VERSION} cache=v962 "
        f"referências_index={index_count}"
    )


if __name__ == "__main__":
    main()
