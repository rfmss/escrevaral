#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = "20260725-archive-inspector"
NEW = "20260725-argila-foundation"

index_path = ROOT / "index.html"
sw_path = ROOT / "service-worker.js"
ui_path = ROOT / "ui-dialog.js"
wood_path = ROOT / "css" / "wood-icons.css"
brand_path = ROOT / "css" / "15-brand-argila.css"
archive_path = ROOT / "css" / "14-archive-inspector.css"

index = index_path.read_text(encoding="utf-8")
index = index.replace(OLD, NEW)
index = index.replace('<meta name="theme-color" content="#150a03">', '<meta name="theme-color" content="#f5f2ec">')
index = index.replace(
    '<title>Escrevaral — A Oficina Literária Brasileira. Escreva. Prove. Publique.</title>',
    '<title>Escrevaral — antes que as palavras sequem.</title>',
)
index = index.replace(
    '<meta property="og:title" content="Escrevaral — A Oficina Literária Brasileira. Escreva. Prove. Publique.">',
    '<meta property="og:title" content="Escrevaral — antes que as palavras sequem.">',
)
index = index.replace(
    '<meta name="twitter:title" content="Escrevaral — A Oficina Literária Brasileira. Escreva. Prove. Publique.">',
    '<meta name="twitter:title" content="Escrevaral — antes que as palavras sequem.">',
)
index = index.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700&family=Literata:opsz,wght@7..72,300;7..72,400;7..72,500;7..72,600;7..72,700&display=swap" rel="stylesheet">',
)
index = index.replace('<link rel="stylesheet" href="css/wood-icons.css">', f'<link rel="stylesheet" href="css/wood-icons.css?v={NEW}">')
index = index.replace('<span>para escritoras e escritores brasileiros</span>', '<span>Antes que as palavras sequem.</span>')
index_path.write_text(index, encoding="utf-8")

sw = sw_path.read_text(encoding="utf-8")
sw = sw.replace('const CACHE_NAME = "vereda-offline-v944";', 'const CACHE_NAME = "vereda-offline-v945";')
sw = sw.replace(f'const ASSET_VERSION = "{OLD}";', f'const ASSET_VERSION = "{NEW}";')
sw = sw.replace('"./css/14-archive-inspector.css?v=20260725-v1",', '"./css/14-archive-inspector.css?v=20260725-v2",\n  `./css/15-brand-argila.css?v=${ASSET_VERSION}`,')
sw = sw.replace('"./css/wood-icons.css",', '`./css/wood-icons.css?v=${ASSET_VERSION}`,')
sw_path.write_text(sw, encoding="utf-8")

ui = ui_path.read_text(encoding="utf-8").replace(OLD, NEW)
ui_path.write_text(ui, encoding="utf-8")

wood = wood_path.read_text(encoding="utf-8").replace("20260725-v1", "20260725-v2")
wood_path.write_text(wood, encoding="utf-8")

brand = brand_path.read_text(encoding="utf-8")
brand = brand.replace('--argila-font-ui: Inter, "Libre Franklin",', '--argila-font-ui: "Libre Franklin", Inter,')
brand = brand.replace('--argila-font-reading: "Noto Serif", Literata,', '--argila-font-reading: Literata, "Noto Serif",')
brand_path.write_text(brand, encoding="utf-8")

archive = archive_path.read_text(encoding="utf-8")
archive = archive.replace('"Noto Serif", Georgia, serif', 'Literata, "Noto Serif", Georgia, serif')
archive_path.write_text(archive, encoding="utf-8")

assert OLD not in index
assert f'ASSET_VERSION = "{NEW}"' in sw
assert 'vereda-offline-v945' in sw
assert '15-brand-argila.css' in sw
assert f'wood-icons.css?v={NEW}' in index
assert 'Antes que as palavras sequem.' in index

# A migração é descartável e não permanece como mecanismo de produto.
Path(__file__).unlink()
workflow = ROOT / ".github" / "workflows" / "migrar-argila-foundation.yml"
if workflow.exists():
    workflow.unlink()
