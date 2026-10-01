#!/usr/bin/env python3
"""Extrai formas dos lemas escolhidos e TODAS as leituras dessas formas no snapshot.
Uso: python3 ferramentas/importar-portilexicon.py DIRETORIO_TSV
Duas passagens sequenciais; não importa o runtime Python da fonte.
"""
import hashlib, json, pathlib, re, sys, unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1]; DEST=ROOT/'resources/pt-BR/portilexicon'
def canonical(s): return unicodedata.normalize('NFC',s.lower())
def records(folder, config):
    for name in sorted(config['sha256']):
        with (folder/name).open(encoding='utf-8') as f:
            for number,line in enumerate(f,1):
                if len(line)>4096: raise ValueError('Linha longa')
                fields=line.rstrip('\r\n').split('\t')
                if len(fields)!=3 or not all(fields): raise ValueError(f'Linha inválida {name}:{number}')
                yield canonical(fields[0]), canonical(fields[1]), name[:-4], fields[2]
def convert(folder):
    folder=pathlib.Path(folder);config=json.loads((DEST/'entrada.json').read_text())
    for name,digest in config['sha256'].items():
        h=hashlib.sha256()
        with (folder/name).open('rb') as f:
            for chunk in iter(lambda:f.read(65536),b''):h.update(chunk)
        if h.hexdigest()!=digest:raise ValueError('Snapshot divergente: '+name)
    seeds=set((DEST/'lemas.txt').read_text().splitlines());forms=set();excluded=set()
    for form,lemma,pos,feat in records(folder,config):
        if lemma in seeds:
            if len(form)<=64 and re.fullmatch(r"[a-zà-öø-ÿ]+(?:[-'’][a-zà-öø-ÿ]+)*",form):forms.add(form)
            else:excluded.add(form)
    data={form:set() for form in forms}
    for form,lemma,pos,feat in records(folder,config):
        if form in data:data[form].add((lemma,pos,feat))
    # Dicionários de compressão estáticos, sem runtime ou dependência adicional.
    lemmas=sorted({r[0] for rows in data.values() for r in rows});tags=sorted({r[1] for rows in data.values() for r in rows});features=sorted({r[2] for rows in data.values() for r in rows})
    li={s:i for i,s in enumerate(lemmas)};pi={s:i for i,s in enumerate(tags)};fi={s:i for i,s in enumerate(features)}
    compact=lambda x:json.dumps(x,ensure_ascii=False,separators=(',',':'))
    entries={key:compact([[li[a],pi[b],fi[c]] for a,b,c in sorted(data[key])]) for key in sorted(data)}
    maximum=max(len(v.encode()) for v in entries.values());max_readings=max(map(len,data.values()))
    if maximum>4096 or len(entries)>10000 or max_readings>32:raise ValueError('Recorte excedeu orçamento')
    resource={'version':config['commit'][:12]+'-recorte-'+str(config.get('subsetVersion',1)),'source':'PortiLexicon-UD','forms':len(data),'lemmas':lemmas,'tags':tags,'features':features,'entries':entries}
    license=(DEST/'LICENSE').read_text()
    js='/* PortiLexicon-UD — dados de Lopes, Duran, Fernandes e Pardo (2022).\nRecorte/compactação Escrevaral; origem e hashes em ORIGEM.json.\n'+license+'*/\n(function(root){"use strict";root.Escr.portiLexicon='+compact(resource)+';}(typeof window!=="undefined"?window:this));\n'
    js=js.replace('</','<\\/').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
    if len(js.encode())>262144:raise ValueError('Recorte maior que 256 KiB')
    (DEST/'flexoes.js').write_text(js)
    meta={**config,'authors':['Lucelene Lopes','Magali S. Duran','Paulo Fernandes','Thiago A. S. Pardo'],'licenseEvidence':{'snapshot':'MIT, LICENSE na raiz; README identifica dados e acessor neste repositório.','institutional':'POeTiSA anuncia dados CC-BY sem especificar versão, com link para este repositório.','institutionalUrl':'https://sites.google.com/icmc.usp.br/poetisa/resources-and-tools'},'seedLemmas':len(seeds),'forms':len(data),'readings':sum(map(len,data.values())),'lemmasIncludingHomographs':len(lemmas),'maxReadingsPerForm':max_readings,'maxRecordBytes':maximum,'outputBytes':len(js.encode()),'outputSha256':hashlib.sha256(js.encode()).hexdigest(),'excludedForms':sorted(excluded),'changes':'Seleção por lemas, inclusão de todas as análises das formas selecionadas nas 12 tabelas, composição NFC/minúsculas, deduplicação de triplas e compactação. Sem gerar flexões por sufixo ou desambiguar classes.'}
    (DEST/'ORIGEM.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in meta.items() if k in ['seedLemmas','forms','readings','lemmasIncludingHomographs','maxReadingsPerForm','maxRecordBytes','outputBytes','excludedForms']},ensure_ascii=False))
if __name__=='__main__':convert(sys.argv[1])
