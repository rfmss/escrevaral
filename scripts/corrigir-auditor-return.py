#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "scripts" / "auditor-entry-argila.py"
text = path.read_text(encoding="utf-8")
old = '''        before = json.loads(page.evaluate("key => localStorage.getItem(key)", STORAGE_KEY))
        before_ids = [item.get("id") for item in before.get("manuscripts", [])]
        page.locator('[data-action="accept-terms-continue"]').click()
        overlay.wait_for(state="hidden", timeout=8_000)
        page.wait_for_selector(".writing-area", state="visible", timeout=8_000)
        page.wait_for_timeout(250)
        after = json.loads(page.evaluate("key => localStorage.getItem(key)", STORAGE_KEY))
        after_ids = [item.get("id") for item in after.get("manuscripts", [])]
        if before_ids != after_ids:
            issues.append("retomada alterou a coleção de manuscritos")
        if not after.get("activeId"):
            issues.append("retomada não definiu manuscrito ativo")'''
new = '''        stored_raw = page.evaluate("key => localStorage.getItem(key)", STORAGE_KEY)
        before = json.loads(stored_raw) if stored_raw else {}
        before_ids = [item.get("id") for item in before.get("manuscripts", [])]
        debug = {
            "stored": bool(stored_raw),
            "manuscripts": len(before_ids),
            "activeId": before.get("activeId"),
            "newVisible": visible(new_state),
            "continueVisible": visible(continue_state),
        }
        if not visible(continue_state):
            issues.append(f"diagnóstico do retorno: {json.dumps(debug, ensure_ascii=False)}")
        else:
            page.locator('[data-action="accept-terms-continue"]').click()
            overlay.wait_for(state="hidden", timeout=8_000)
            page.wait_for_selector(".writing-area", state="visible", timeout=8_000)
            page.wait_for_timeout(250)
            after = json.loads(page.evaluate("key => localStorage.getItem(key)", STORAGE_KEY))
            after_ids = [item.get("id") for item in after.get("manuscripts", [])]
            if before_ids != after_ids:
                issues.append("retomada alterou a coleção de manuscritos")
            if not after.get("activeId"):
                issues.append("retomada não definiu manuscrito ativo")'''
if old not in text:
    raise SystemExit("bloco de retorno não encontrado")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "corrigir-auditor-return.yml"
if workflow.exists():
    workflow.unlink()
