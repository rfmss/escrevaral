#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
controller = ROOT / "workshop-authorship-clarity-controller.js"
auditor = ROOT / "scripts" / "auditor-product-clarity-workshop.py"

controller_text = controller.read_text(encoding="utf-8")
old_move = '    nodes.forEach((node) => body.appendChild(node));\n'
if controller_text.count(old_move) != 1:
    raise SystemExit("movimento prematuro dos nós não encontrado de forma única")
controller_text = controller_text.replace(old_move, "", 1)
controller.write_text(controller_text, encoding="utf-8")

auditor_text = auditor.read_text(encoding="utf-8")
old_summary = '                summary = steps.nth(index).locator("summary")\n'
new_summary = '                summary = steps.nth(index).locator(".proof-clarity-summary").first\n'
if auditor_text.count(old_summary) != 1:
    raise SystemExit("seletor amplo do resumo não encontrado de forma única")
auditor_text = auditor_text.replace(old_summary, new_summary, 1)
auditor.write_text(auditor_text, encoding="utf-8")

print("montagem mobile e resumo externo corrigidos")
