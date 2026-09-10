"""Inventário somente linguístico das refs já obtidas. Não executa código legado."""
import subprocess, json, hashlib, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[2]
def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args], text=True)
def relevant(p):
    if not p.endswith(('.js', '.ts', '.json', '.yaml')): return False
    return (p.startswith(('astra/conhecimento/', 'astra/maquina/')) and not p.endswith('acervo.js')) or bool(re.search(r'(^|/)(analise-engine|voice-engine|syntax-engine|punctuation-engine|relative-clause-engine|rimalab-engine|decolonial-engine|lexical-engine|norma-data|syntax-data|lexical-data)\.', p)) or '/src/engines/' in p or p.startswith(('src/core/engines/', 'src/data/', 'js/data/criterios-data', 'js/data/synonym-data', 'mass-notes-next/docs/linguistics/', 'mass-notes-next/tests/fixtures/linguistic-calibration/'))
refs = git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/').splitlines()
records, groups = [], {}
for ref in refs:
    files = []
    for line in git('ls-tree', '-r', ref).splitlines():
        meta, p = line.split('\t', 1)
        if relevant(p): files.append({'path': p, 'blob': meta.split()[2]})
    digest = hashlib.sha256(json.dumps(files, sort_keys=True).encode()).hexdigest()
    records.append({'branch': ref[7:], 'commit': git('rev-parse', ref).strip(), 'fingerprint': digest, 'files': files})
    groups.setdefault(digest, []).append(ref[7:])
target = ROOT / 'astra/oficina/comparacao-branches.json'
target.write_text(json.dumps({'scope': 'Inventário de arquivos linguísticos; igualdade de blobs não é revisão de todas as regras. ZIP do cofre inventariado separadamente em proveniencia-cofre.json.', 'branches': records, 'groups': list(groups.values())}, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({'branches': len(records), 'groups': list(groups.values())}, ensure_ascii=False, indent=2))
