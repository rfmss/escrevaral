#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")

pairs = (
    ('<h2 class="ob-pillar-title">Mesa de escrita</h2>', '<h2 class="ob-pillar-title">Abra uma página.</h2>'),
    ('<h2 class="ob-pillar-title">Guias de escrita</h2>', '<h2 class="ob-pillar-title">Conhecer a oficina</h2>'),
    ('<!-- Abra uma página. — entrada principal, dois estados -->', '<!-- Entrada principal — dois estados -->'),
    ('<!-- Guias de escrita — entrada secundária -->', '<!-- Oficina — entrada secundária -->'),
)
for old, new in pairs:
    if old not in index:
        raise SystemExit(f"trecho não encontrado: {old}")
    index = index.replace(old, new, 1)

index_path.write_text(index, encoding="utf-8")
assert '<h2 class="ob-pillar-title">Abra uma página.</h2>' in index
assert '<h2 class="ob-pillar-title">Conhecer a oficina</h2>' in index

Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "corrigir-entry-copy.yml"
if workflow.exists():
    workflow.unlink()
