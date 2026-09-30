#!/usr/bin/env python3
"""Extrator do snapshot OWN-PT fixado. Ferramenta de desenvolvimento, sem rede.
Não é parser Turtle geral: aceita apenas os registros do snapshot com hash conferido.
Uso: python3 ferramentas/importar-own-pt.py DIRETORIO_COM_TTL
"""
import hashlib, json, pathlib, re, sys, unicodedata
ROOT = pathlib.Path(__file__).resolve().parents[1]
DEST = ROOT / 'resources/pt-BR/own-pt'
COMMIT = '264016d5899e6969f6f7cb4f1d75fa06037c1fd7'
HASHES = {'own-pt-synsets.ttl':'e0050a04bb1c43a6c259d7c096a98d6c9f9c0d1343485733c18ddc17fd5e33e8', 'own-pt-wordsenses.ttl':'537222fc22c8f116ccb35c375e76d4d0150cb024bf5e6bbcb4724e4e1315f6f1'}
def literals(block, prop):
    m = re.search(re.escape(prop) + r'\s+((?:"(?:[^"\\]|\\.)*"@pt\s*(?:,\s*)?)+)', block)
    return [] if not m else [json.loads(x) for x in re.findall(r'("(?:[^"\\]|\\.)*")@pt', m[1])]
def convert(folder):
    texts = {}
    for name, digest in HASHES.items():
        data = (pathlib.Path(folder) / name).read_bytes()
        if hashlib.sha256(data).hexdigest() != digest: raise ValueError('Snapshot divergente: ' + name)
        texts[name] = data.decode('utf-8')
    requested = (DEST / 'recorte.txt').read_text().splitlines()
    selected = set(requested)
    terms = {}; wanted = set()
    for block in texts['own-pt-wordsenses.ttl'].split('\n\n'):
        m = re.match(r'own-pt:wordsense-(\d{8}-[nvar])-\d+ a owns:WordSense', block)
        if not m: continue
        labels = literals(block, 'rdfs:label')
        if len(labels) != 1: raise ValueError('Rótulo inesperado')
        label = labels[0]; key = unicodedata.normalize('NFC', label.lower())
        terms.setdefault(m[1], []).append(label)
        if key in selected: wanted.add(m[1])
    senses = {}
    for block in texts['own-pt-synsets.ttl'].split('\n\n'):
        m = re.match(r'own-pt:synset-(\d{8}-[nvar]) a ', block)
        if m and m[1] in wanted:
            senses[m[1]] = {'id':m[1], 'pos':m[1][-1], 'terms':sorted(set(terms[m[1]])), 'definitions':literals(block, 'owns:gloss')}
    if set(senses) != wanted: raise ValueError('Sentido ausente no snapshot')
    entries = {key:[senses[sid] for sid in sorted(senses) if any(unicodedata.normalize('NFC',t.lower())==key for t in senses[sid]['terms'])] for key in sorted(selected)}
    missing = [key for key,v in entries.items() if not v]
    entries = {key:v for key,v in entries.items() if v}
    def compact(x): return json.dumps(x,ensure_ascii=False,separators=(',',':'))
    # Um registro por chave; somente o registro solicitado passa por JSON.parse.
    packed = {key:compact(value) for key,value in entries.items()}
    max_record = max(len(s.encode('utf-8')) for s in packed.values())
    if max_record > 16384: raise ValueError('Registro maior que 16 KiB')
    provenance = {'source':'OpenWordNet-PT','repository':'https://github.com/own-pt/openWordnet-PT','commit':COMMIT,'license':'CC-BY-4.0','authors':['Alexandre Rademaker','Valeria de Paiva','Fredson Aguiar','colaboradores OWN-PT'],'inputSha256':HASHES,'requested':len(requested),'headwords':len(entries),'synsets':len(senses),'synsetsWithPortugueseDefinition':sum(bool(s['definitions']) for s in senses.values()),'missingHeadwords':missing,'maxRecordBytes':max_record,'selection':'Lista editorial explícita; todos os sentidos do snapshot associados a cada lema escolhido, sem flexões, desambiguação ou tradução automática.'}
    js = '/* Dados derivados de OpenWordNet-PT, CC BY 4.0. Autores, hashes e alterações em resources/pt-BR/own-pt/ORIGEM.json. Gerado por ferramentas/importar-own-pt.py. */\n(function(root){\n  "use strict";\n  root.Escr.ownPtLexicon = '+compact({'version':COMMIT[:12]+'-recorte-1','source':provenance['source'],'license':provenance['license'],'headwords':len(entries),'entries':packed})+';\n}(typeof window!=="undefined"?window:this));\n'
    # Evita fechar o script do HTML portátil e separadores não aceitos por ES5.
    js = js.replace('</','<\\/').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
    if len(js.encode('utf-8')) > 147456: raise ValueError('Recorte maior que 144 KiB')
    (DEST/'lexico.js').write_text(js)
    provenance['outputBytes']=len(js.encode('utf-8')); provenance['outputSha256']=hashlib.sha256(js.encode()).hexdigest()
    (DEST/'ORIGEM.json').write_text(json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in provenance.items() if k not in ('inputSha256','authors','selection')},ensure_ascii=False))
if __name__ == '__main__': convert(sys.argv[1])
