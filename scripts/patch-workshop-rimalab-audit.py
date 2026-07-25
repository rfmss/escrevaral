#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sw = ROOT / "service-worker.js"
auditor = ROOT / "scripts" / "auditor-product-clarity-workshop.py"

sw_text = sw.read_text(encoding="utf-8")
anchor = '  `./css/22-product-clarity-workshop-authorship.css?v=${ASSET_VERSION}`,'
asset = '  `./css/22-product-clarity-workshop-refine.css?v=${ASSET_VERSION}`,'
if anchor not in sw_text:
    raise SystemExit("âncora do CSS do bloco ausente")
if asset not in sw_text:
    sw_text = sw_text.replace(anchor, anchor + "\n" + asset, 1)
sw.write_text(sw_text, encoding="utf-8")

auditor_text = auditor.read_text(encoding="utf-8")
old_activation = '''            second.focus()\n            second.press("Enter")\n            page.wait_for_timeout(150)\n            target_id = second.get_attribute("for")\n            checked = page.locator(f"#{target_id}").is_checked() if target_id else False\n            if not checked:\n                add(issues, name, "atelier-keyboard", "Enter não ativou a ferramenta escolhida.")\n            evidence["atelier"] = screenshot(page, output, name, "atelier")\n\n            # Autoria\n'''
new_activation = '''            second.focus()\n            second.press("Enter")\n            page.wait_for_timeout(220)\n            target_id = second.get_attribute("for")\n            checked = page.locator(f"#{target_id}").is_checked() if target_id else False\n            if not checked:\n                add(issues, name, "atelier-keyboard", "Enter não ativou a ferramenta escolhida.")\n\n            for selector, label in ((".at-panel-rimalab", "painel"), (".rimalab-tool", "ferramenta"), (".rimalab-workbench", "bancada")):\n                node = page.locator(f'[data-view-panel="academia"] {selector}').first\n                if not node.count() or not node.is_visible():\n                    add(issues, name, "rimalab-missing", f"{label} do RimaLab não ficou visível.")\n                    continue\n                dimensions = node.evaluate("el => ({scroll:el.scrollWidth, client:el.clientWidth})")\n                if dimensions["scroll"] > dimensions["client"] + 2:\n                    add(issues, name, "rimalab-internal-overflow", f"{label}: {dimensions}")\n            evidence["atelier"] = screenshot(page, output, name, "atelier-rimalab")\n\n            # Autoria\n'''
if old_activation not in auditor_text:
    raise SystemExit("bloco de ativação do Ateliê não encontrado")
auditor_text = auditor_text.replace(old_activation, new_activation, 1)

old_initial = '''            if open_count != 1 or not steps.nth(0).evaluate("el => el.open"):\n                add(issues, name, "authorship-initial", f"etapas abertas={open_count}; a primeira deveria estar aberta.")\n\n            required = (\n'''
new_initial = '''            if open_count != 1 or not steps.nth(0).evaluate("el => el.open"):\n                add(issues, name, "authorship-initial", f"etapas abertas={open_count}; a primeira deveria estar aberta.")\n            evidence["authorship_initial"] = screenshot(page, output, name, "authorship-initial")\n\n            required = (\n'''
if old_initial not in auditor_text:
    raise SystemExit("ponto da captura inicial da Autoria não encontrado")
auditor_text = auditor_text.replace(old_initial, new_initial, 1)
auditor.write_text(auditor_text, encoding="utf-8")

print("cache e auditor do RimaLab atualizados")
