#!/usr/bin/env python3
"""Migra a entrada Argila e remove a si mesma após validar o pacote."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = "20260725-argila-foundation"
NEW = "20260725-argila-entry"

index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")

old_brand = '''          <div class="ob-brand">
            <div class="ob-brand-mark brand-mark" aria-hidden="true"></div>
            <span class="ob-logo" id="ob-panel-title">Escrevaral</span>
          </div>'''
new_brand = '''          <div class="ob-brand">
            <div class="ob-brand-mark brand-mark" aria-hidden="true"></div>
            <div class="ob-brand-copy">
              <p class="ob-kicker">Oficina literária digital</p>
              <h1 class="ob-logo" id="ob-panel-title">Escrevaral</h1>
              <p class="ob-tagline">Antes que as palavras sequem.</p>
              <p class="ob-lede">Uma oficina de escrita feita no Brasil, para gente brasileira.</p>
            </div>
          </div>'''
if old_brand not in index:
    raise SystemExit("bloco de marca do onboarding não encontrado")
index = index.replace(old_brand, new_brand, 1)

replacements = {
    "Mesa de escrita": "Abra uma página.",
    "Folha limpa. Foco total.": "O texto fica neste navegador e pode seguir sem internet.",
    ">Começar a escrever<": ">Abrir uma página<",
    ">Continuar<": ">Seu texto está esperando.<",
    "Volte ao texto mais recente.": "Continue de onde parou, sem perder o fio.",
    ">Começar texto novo<": ">Abrir uma página nova<",
    ">Guias de escrita<": ">Conhecer a oficina<",
    "Romance, poesia, ENEM e roteiro.": "Guias, revisão e ferramentas quando o texto pedir.",
    ">Escolher um guia<": ">Abrir os guias<",
    "Léxico, rima, sintaxe e revisão.": "Léxico, rima e sintaxe sem sair do manuscrito.",
    "Sem nuvem. Sem IA. Só seu.": "Sem conta. Sem nuvem. Seus textos ficam com você.",
    "Leve e traga seus textos.": "Leve e traga o acervo, inclusive sem internet.",
    'Ao usar o Escrevaral você aceita os <a href="./privacidade.html" target="_blank" class="ob-link">Termos de uso</a>. Projeto independente de Rafael Mass, em construção.':
    'Seus textos ficam neste navegador. Ao continuar, você aceita os <a href="./privacidade.html" target="_blank" class="ob-link">Termos de uso</a>.',
}
for before, after in replacements.items():
    if before not in index:
        raise SystemExit(f"texto esperado não encontrado: {before}")
    index = index.replace(before, after, 1)

index = index.replace(OLD, NEW)
index_path.write_text(index, encoding="utf-8")

archive_path = ROOT / "css" / "14-archive-inspector.css"
archive = archive_path.read_text(encoding="utf-8")
archive = archive.replace(f'@import url("./15-brand-argila.css?v={OLD}");', f'@import url("./15-brand-argila.css?v={NEW}");\n@import url("./16-entry-argila.css?v={NEW}");', 1)
archive_path.write_text(archive, encoding="utf-8")

wood_path = ROOT / "css" / "wood-icons.css"
wood = wood_path.read_text(encoding="utf-8").replace("14-archive-inspector.css?v=20260725-v2", "14-archive-inspector.css?v=20260725-v3", 1)
wood_path.write_text(wood, encoding="utf-8")

sw_path = ROOT / "service-worker.js"
sw = sw_path.read_text(encoding="utf-8")
sw = sw.replace('const CACHE_NAME = "vereda-offline-v945";', 'const CACHE_NAME = "vereda-offline-v946";', 1)
sw = sw.replace(f'const ASSET_VERSION = "{OLD}";', f'const ASSET_VERSION = "{NEW}";', 1)
sw = sw.replace('"./css/14-archive-inspector.css?v=20260725-v2",', '"./css/14-archive-inspector.css?v=20260725-v3",\n  `./css/16-entry-argila.css?v=${ASSET_VERSION}`,', 1)
sw_path.write_text(sw, encoding="utf-8")

ui_path = ROOT / "ui-dialog.js"
ui_path.write_text(ui_path.read_text(encoding="utf-8").replace(OLD, NEW), encoding="utf-8")

assert OLD not in index_path.read_text(encoding="utf-8")
assert NEW in sw_path.read_text(encoding="utf-8")
assert '16-entry-argila.css' in archive_path.read_text(encoding="utf-8")
assert '16-entry-argila.css' in sw_path.read_text(encoding="utf-8")
assert 'Abra uma página.' in index_path.read_text(encoding="utf-8")
assert 'Seu texto está esperando.' in index_path.read_text(encoding="utf-8")
assert 'vereda-offline-v946' in sw_path.read_text(encoding="utf-8")

Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "migrar-argila-entry.yml"
if workflow.exists():
    workflow.unlink()
