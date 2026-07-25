#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "scripts" / "auditor-entry-argila.py"
text = path.read_text(encoding="utf-8")
old = '''    context.add_init_script(
        """values => {
          for (const [key, value] of Object.entries(values)) {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
          }
          localStorage.removeItem('escrevaral-termos-v1');
        }""",
        values,
    )'''
new = '''    payload = json.dumps(values, ensure_ascii=False)
    context.add_init_script(
        f"""() => {{
          const values = {payload};
          for (const [key, value] of Object.entries(values)) {{
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
          }}
          localStorage.removeItem('escrevaral-termos-v1');
        }}"""
    )'''
if old not in text:
    raise SystemExit("assinatura antiga não encontrada")
path.write_text(text.replace(old, new, 1), encoding="utf-8")
Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "corrigir-auditor-entry.yml"
if workflow.exists():
    workflow.unlink()
