# M1-R0 — Porttinari train + dev: fronteira observada antes do piloto humano

Atualizado em: 2026-08-08  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado linguístico: `source_mapped`  
Sintaxe de produção: `not_authorized`

> **Eva Chara, entre em banca.**

## CLARO

### C — cenário

O split `dev` do UD Portuguese Porttinari já havia sido autenticado e minerado fora do repositório. Ele mostrou que a ordem física do arquivo não é ordem discursiva e, isoladamente, não fornecia nenhum candidato sem sujeito direto com predecessor documental comprovado.

O split `train` foi então recebido localmente para completar somente a união autorizada `train + dev`, mantendo `test` lacrado.

### L — limites e risco antes da próxima fronteira

A próxima fronteira ainda não provada é a seleção de uma amostra humana cega. Os riscos são:

1. selecionar por impressão linguística e introduzir cherry-picking;
2. deixar relações UD funcionarem como rótulos do produto;
3. misturar desenvolvimento e avaliação;
4. vazar o manifesto estrutural aos anotadores;
5. confundir continuidade documental com certeza sobre referente;
6. elevar nota ou autorizar Sintaxe antes de concordância humana.

Portanto, qualquer piloto deve ser selecionado por sinais estruturais e procedimento determinístico, não por resposta linguística antecipada. O manifesto de seleção deve permanecer privado dos anotadores.

### A — autenticidade e ação de pesquisa

Fonte: UD Portuguese Porttinari  
Revisão fixada: `87a07e1fb761d6d0a6e2a4d82b11b308344dabb9`  
Licença: CC BY 4.0

`train` recebido:

```text
arquivo: pt_porttinari-ud-train.conllu
bytes: 8.194.157
linhas: 143.100
sentenças CoNLL-U: 5.893
Git blob SHA: 6dac8d4a5b6bf208dc9146291e7b9014e404bc59
SHA-256: b685d552f23dd0155072b11b1282d6e52dc7f4b57f335cc3486be23ef68c4ead
```

O Git blob local coincide exatamente com o blob esperado na revisão fixada.

A mineração observada continua sendo executada fora do checkout. Nenhum CoNLL-U bruto, fila privada ou sentença do corpus é versionado.

### R — resultado reproduzível agregado

#### `train` isolado

```text
sentenças: 5.893
sentenças com predecessor no próprio train: 1.888
candidatos estruturais: 1.949
candidatos com predecessor no próprio train: 653
explicit_subject_control: 963
no_direct_subject_candidate: 157
outside_initial_scope: 829
```

Sinais de exclusão, com sobreposição possível:

```text
finite_auxiliary: 579
passive_signal: 281
contains_se: 239
impersonal_expletive_signal: 61
```

Entre os 157 casos sem sujeito direto, 50 possuem predecessor documental no próprio `train`.

#### união autorizada `train + dev`

A reconstrução por `sent_id`, independente da ordem física e sem abrir `test`, produz:

```text
sentenças totais: 6.735
sentenças com predecessor documental exato: 2.448
candidatos estruturais: 2.217
candidatos com predecessor documental exato: 829
explicit_subject_control: 1.088
no_direct_subject_candidate: 183
outside_initial_scope: 946
```

Dos 183 candidatos sem sujeito direto, **67** possuem predecessor documental exato.

Distribuição estrutural desses 67 casos:

```text
conj: 32
root: 14
ccomp: 7
advcl: 7
acl:relcl: 5
parataxis: 1
ccomp:speech: 1
```

Origem da sentença-alvo:

```text
train: 56
dev: 11
```

A união recupera continuidade entre splits sem misturar `test`: 270 sentenças de `train` encontram predecessor em `dev`, e 256 sentenças de `dev` encontram predecessor em `train`.

Isso muda a decisão metodológica: agora existe um pool observado suficiente para um **piloto humano intersentencial**, mas não existe ainda qualquer rótulo linguístico validado.

### O — aberto

- nenhum dos 67 casos foi julgado por dois humanos independentes;
- `nsubj` ausente continua sendo apenas filtro estrutural;
- relações como `conj`, `root`, `ccomp` e `advcl` não são classes finais de sujeito;
- o domínio continua majoritariamente jornalístico;
- a amostra não prova representatividade do português brasileiro amplo;
- o split `test` permanece lacrado;
- a avaliação sintética reservada permanece lacrada;
- Sintaxe de produção permanece `not_authorized`;
- nenhuma nota da Eva deve mudar nesta etapa.

## Parecer Eva Chara

Dimensão crítica diretamente tocada: **Sintaxe e estrutura oracional — 4,5/10**.  
Validação humana e acadêmica permanece **4,0/10**.  
Fundamentação e proveniência permanece **5,0/10**.

### Acertos

- `train` autenticado pela revisão fixada;
- `test` não foi aberto;
- continuidade reconstruída por documento + ordinal, não por posição física;
- pool observado cresceu de 0 para 67 candidatos intersentenciais sem decisão automática;
- corpus bruto e fila continuam fora do repositório;
- nenhum score foi inflado por volume.

### Falsos positivos, falsos negativos e ambiguidades

Ainda não mensuráveis linguisticamente: não há gold humano. O único diagnóstico permitido é estrutural. Qualquer tentativa de chamar os 67 casos de recuperáveis ou indeterminados antes da anotação seria sobreinterpretação.

### Menor próximo passo seguro

1. formar um piloto privado de 16 casos: 12 candidatos sem sujeito direto com predecessor comprovado + 4 controles explícitos;
2. selecionar por estratos estruturais e ordenação determinística, sem ler a resposta linguística como critério;
3. gerar pacotes A e B com ordem diferente e sem relações UD, split, balde ou manifesto;
4. obter dois julgamentos independentes;
5. medir acordo bruto, Cohen's kappa e matriz de confusão;
6. preservar todos os desacordos antes de adjudicação;
7. convocar nova banca antes de escrever qualquer teste vermelho de Sintaxe.

### Decisão

`PROSSEGUIR COM CONDIÇÕES`

Nenhuma alteração de nota é proposta para `EVA_CHARA_PROGRESSO.csv` nesta etapa.