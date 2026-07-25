#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDITOR = ROOT / "scripts" / "auditor-palavras.py"

old = '''def open_words(page: Page) -> None:
    target = page.locator('[data-view-target="biblioteca"]:visible').first
    target.wait_for(state="visible", timeout=10_000)
    target.click()
    page.wait_for_selector('.app-shell[data-view="biblioteca"]', timeout=10_000)
'''

new = '''def open_words(page: Page) -> None:
    # Palavras é uma view pública do produto. O auditor não deve depender
    # da posição visual do controle que a abre, pois desktop e mobile usam
    # hierarquias de navegação diferentes.
    page.wait_for_function("() => typeof setView === 'function'", timeout=10_000)
    page.evaluate("() => setView('biblioteca', { updateRoute: true, routeMode: 'replace' })")
    page.wait_for_selector('.app-shell[data-view="biblioteca"]', timeout=10_000)
    page.wait_for_selector(
        '.view[data-view-panel="biblioteca"].is-active',
        state="visible",
        timeout=10_000,
    )
'''

content = AUDITOR.read_text(encoding="utf-8")
if old not in content:
    raise SystemExit("função open_words esperada não encontrada")
AUDITOR.write_text(content.replace(old, new, 1), encoding="utf-8")

updated = AUDITOR.read_text(encoding="utf-8")
assert 'setView(\'biblioteca\'' in updated
assert '[data-view-target="biblioteca"]:visible' not in updated

Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "migrar-auditor-palavras-oficina.yml"
if workflow.exists():
    workflow.unlink()
