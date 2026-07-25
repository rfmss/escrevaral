#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Auditor visual: percorre as views pelo contrato público, sem depender da posição dos controles.
auditor = ROOT / "scripts" / "auditor-navegacao-visual.py"
text = auditor.read_text(encoding="utf-8")
old = '''    reachable = {}\n    for view in APP_VIEWS:\n        clicked = False\n        if viewport["width"] >= 820:\n            clicked = click_if_visible(page, f'.module-tabs [data-view-target="{view}"]')\n        elif viewport["width"] >= 600:\n            clicked = click_if_visible(page, f'.mobile-dock [data-view-target="{view}"]')\n        else:\n            clicked = click_if_visible(page, f'.mobile-dock [data-view-target="{view}"]')\n            if not clicked and view == "cronograma":\n                clicked = click_if_visible(page, '[data-action="toggle-bandeja"]')\n                if clicked:\n                    clicked = click_if_visible(page, '.bandeja-item[data-view-target="cronograma"]')\n\n        reachable[view] = clicked\n        if clicked:\n            add_state(record, page, viewport, f"app-{view}")\n'''
new = '''    reachable = {}\n    page.wait_for_function("() => typeof setView === 'function'", timeout=10_000)\n    for view in APP_VIEWS:\n        try:\n            page.evaluate("view => setView(view, { updateRoute: true, routeMode: 'replace' })", view)\n            page.wait_for_function(\n                "view => document.querySelector('.app-shell')?.dataset.view === view",\n                arg=view,\n                timeout=5_000,\n            )\n            page.wait_for_timeout(700)\n            reachable[view] = True\n            add_state(record, page, viewport, f"app-{view}")\n        except Exception:\n            reachable[view] = False\n'''
if old not in text:
    raise SystemExit("loop antigo do auditor visual não encontrado")
auditor.write_text(text.replace(old, new, 1), encoding="utf-8")

# Workflow: app local para visual/console/overflow; produção continua para publicação e canário.
workflow = ROOT / ".github" / "workflows" / "release-candidate-argila.yml"
workflow_text = workflow.read_text(encoding="utf-8")
old_step = '''      - name: Executar Teste Master de produção\n        id: master\n        shell: bash\n        run: |\n          set +e\n          python scripts/teste-master.py --sem-local\n          code=$?\n          echo "exit_code=$code" >> "$GITHUB_OUTPUT"\n          exit 0\n'''
new_step = '''      - name: Iniciar candidata local\n        run: |\n          python -m http.server 8799 > /tmp/escrevaral-release-server.log 2>&1 &\n          echo $! > /tmp/escrevaral-release-server.pid\n          for tentativa in {1..30}; do\n            if curl -fsS http://127.0.0.1:8799/ > /dev/null; then\n              exit 0\n            fi\n            sleep 1\n          done\n          cat /tmp/escrevaral-release-server.log\n          exit 1\n\n      - name: Executar Teste Master da candidata\n        id: master\n        shell: bash\n        env:\n          ESCREVARAL_AUDIT_URL: http://127.0.0.1:8799\n        run: |\n          set +e\n          python scripts/teste-master.py\n          code=$?\n          echo "exit_code=$code" >> "$GITHUB_OUTPUT"\n          exit 0\n'''
if old_step not in workflow_text:
    raise SystemExit("etapa antiga do Teste Master não encontrada")
workflow.write_text(workflow_text.replace(old_step, new_step, 1), encoding="utf-8")

assert "setView(view" in auditor.read_text(encoding="utf-8")
assert "ESCREVARAL_AUDIT_URL" in workflow.read_text(encoding="utf-8")
assert "--sem-local" not in workflow.read_text(encoding="utf-8")

Path(__file__).unlink()
migration_workflow = ROOT / ".github" / "workflows" / "migrar-release-auditoria-local.yml"
if migration_workflow.exists():
    migration_workflow.unlink()
