---
name: auditar-homografos
description: Verificar se uma forma adjetiva candidata colide com forma verbal via diacritic-stripping antes de adicionar a adjetivos_comuns em norma-data.json.
---

# Auditar Homógrafos

Use antes de adicionar qualquer entrada a `adjetivos_comuns` em `norma-data.json`.

## O problema

O lookup de `syntax-engine.js` usa `_stripDiac()` — remove acentos antes de comparar. Isso significa que "séria" e "seria" chegam como "seria" ao Set. A cadeia `else if` (linha 252 do syntax-engine) checa adjetivos ANTES dos verbos, então formas verbais registradas como adjetivos nunca chegam à verificação de verbo.

Casos já removidos por esse motivo: `seria`, `precisa`, `sabia`, `muda`.

## Formas de risco alto

Qualquer adjetivo acentuado cuja forma sem acento seja também uma forma verbal:

- Terminações `-ia`: séria→seria, sábia→sabia, própria→propria (propria não é verbal, mas checar)
- Terminações `-ava`: achava, estava, ficava (quase sempre formas do imperfeito)
- Terminações `-era`: vivera, bebera (formas do mais-que-perfeito)
- Terminações `-esse`: qualquer forma do subjuntivo imperfeito

## Formas seguras

- `-oso/a`: amoroso, corajoso, curioso, generoso, orgulhoso
- `-ável/-ível`: amável, visível, possível, sensível
- `-ente`: ausente, presente, evidente, urgente
- `-udo/a`: barbudo, miúdo, metido (checar miúdo — não é verbal)
- `-ivo/a`: expressivo, intuitivo, criativo
- `-ado/a` (particípio com sentido adjetival estável): cansado, perdido, silenciado

## Procedimento

1. Identificar a forma stripped do candidato:

```python
import unicodedata

def strip_diac(s):
    return ''.join(
        c for c in unicodedata.normalize('NFD', s.lower())
        if unicodedata.category(c) != 'Mn'
    )

candidato = "séria"
stripped = strip_diac(candidato)
print(stripped)  # seria
```

2. Buscar a forma stripped nas listas de verbos do `norma-data.json`:

```bash
python3 -c "
import json
with open('norma-data.json') as f:
    d = json.load(f)
stripped = 'seria'  # substituir pelo candidato stripped
verbos = set(d.get('formas_verbais_irr', [])) | set(d.get('verbos_pres_reg', []))
print('CONFLITO' if stripped in verbos else 'livre')
"
```

3. Se `CONFLITO`: não adicionar. Se `livre`: adicionar com segurança.

## Cuidados

- Não confiar só no sufixo — sempre verificar contra as listas reais do `norma-data.json`.
- Formas em `-ado/a` são geralmente seguras, mas verbos no particípio podem aparecer; checar caso a caso.
- Atualizar `META_ENGINES_100.md` se a auditoria revelar gap sistemático novo.
