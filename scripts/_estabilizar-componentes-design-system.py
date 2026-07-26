#!/usr/bin/env python3
"""Aplica correções exatas já validadas localmente e remove a si mesma."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDITOR = ROOT / "scripts" / "auditor-design-system-components.py"
CSS = ROOT / "css" / "15-brand-argila.css"

old_selector = "compact_selector = f'{scope} [data-size=\"compact\"]'"
new_selector = "compact_selector = f'{scope} [data-component=\"action-button\"][data-size=\"compact\"]'"
auditor = AUDITOR.read_text(encoding="utf-8")
if auditor.count(old_selector) != 1:
    raise SystemExit(
        f"[stabilize-components] FALHA: seletor compacto antigo aparece {auditor.count(old_selector)} vez(es)"
    )
AUDITOR.write_text(auditor.replace(old_selector, new_selector), encoding="utf-8")

anchor = """  font-family: var(--argila-font-ui);\n}\n\nhtml,\nbody {\n"""
overrides = """  font-family: var(--argila-font-ui);\n}\n\n/*\n * Aliases semânticos precisam ser recomputados no mesmo escopo que redefine\n * os tokens físicos. Sem isso, o valor resolvido em :root seria herdado de\n * Alvorada dentro de Vereda.\n */\n[data-theme=\"scriptorium\"] {\n  --action-button-primary-background: var(--primary);\n  --action-button-primary-border: var(--primary);\n  --action-button-primary-text: var(--on-primary);\n  --action-button-secondary-border: var(--line);\n  --action-button-secondary-text: var(--soft-ink);\n  --action-button-secondary-hover-background: var(--card);\n  --action-button-ghost-hover-background: var(--surface-low);\n  --text-statistic-label: var(--soft-ink);\n  --text-statistic-value: var(--ink);\n  --text-statistic-detail: var(--soft-ink);\n}\n\nhtml,\nbody {\n"""
css = CSS.read_text(encoding="utf-8")
if '[data-theme="scriptorium"] {\n  --action-button-primary-background:' in css:
    raise SystemExit("[stabilize-components] FALHA: overrides de Vereda já existem")
if css.count(anchor) != 1:
    raise SystemExit(
        f"[stabilize-components] FALHA: âncora CSS aparece {css.count(anchor)} vez(es)"
    )
CSS.write_text(css.replace(anchor, overrides), encoding="utf-8")

for transient in (
    ROOT / "scripts" / "_estabilizar-componentes-design-system.py",
    ROOT / ".github" / "workflows" / "_stabilize-design-system-components.yml",
):
    transient.unlink(missing_ok=True)

print("[stabilize-components] seletor compacto e aliases de Vereda corrigidos")
