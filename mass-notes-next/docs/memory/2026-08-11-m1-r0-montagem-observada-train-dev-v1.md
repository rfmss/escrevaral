# M1-R0 — montagem reproduzível do pool observado `train + dev`

Atualizado em: 2026-08-11  
Base técnica anterior: `26deb4a529a7d77d930269bb42b87d9f56616f03` — 18/18 workflows verdes  
Branch oficial: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Sintaxe de produção: `not_authorized`  
Execução observada real desta tranche: **ainda não realizada neste ambiente**

## CLARO

### C — cenário

A receita determinística do piloto sintético de 16 casos já está versionada e provada. Para executá-la sem montagem manual, ainda faltava transformar os dois arquivos locais autenticados do UD Portuguese Porttinari (`train` e `dev`) no mesmo pool combinado que, em 2026-08-08, produziu os agregados observados de 6.735 sentenças, 2.448 predecessores documentais exatos e 67 candidatos sem sujeito direto com predecessor comprovado.

O minerador existente é deliberadamente split-local. Isso é correto para sua função isolada, mas não recupera sozinho continuidades em que a sentença-alvo está em um split e seu predecessor documental exato está no outro. O registro de 2026-08-08 demonstrou 270 continuidades `dev → train` e 256 continuidades `train → dev`.

### L — limite antes da fronteira

O montador não deve virar um segundo analisador sintático. A classificação estrutural continua pertencendo exclusivamente a `mine-subject-candidates.mjs`.

Portanto a nova camada pode apenas:

1. autenticar os dois arquivos locais;
2. chamar o minerador já auditado para cada split;
3. construir um índice conjunto por `documento + ordinal` derivado de `sent_id`;
4. substituir somente `previousContext` e `signals.previousPluralNominals` quando existir ordinal exatamente anterior no mesmo documento;
5. recalcular agregados e falhar se eles divergirem da evidência registrada.

Ela não pode consultar `test`, classificar recuperabilidade/indeterminação, preencher anotação humana, abrir a avaliação sintética reservada ou autorizar Sintaxe.

### A — proveniência e autenticação

Fonte:

- `UniversalDependencies/UD_Portuguese-Porttinari`;
- revisão `87a07e1fb761d6d0a6e2a4d82b11b308344dabb9`;
- licença CC BY 4.0.

Arquivos aceitos:

```text
train
  pt_porttinari-ud-train.conllu
  Git blob SHA: 6dac8d4a5b6bf208dc9146291e7b9014e404bc59
  SHA-256: b685d552f23dd0155072b11b1282d6e52dc7f4b57f335cc3486be23ef68c4ead
  sentenças esperadas: 5.893

dev
  pt_porttinari-ud-dev.conllu
  Git blob SHA: 19e5a75cec5087a7aa92dc112e21e9f9d74bdaa7
  sentenças esperadas: 842
```

O Git blob do `dev` foi recuperado diretamente da revisão fixada. Um SHA-256 independente do `dev` não foi inventado; a autenticação v1 usa o blob Git exato da revisão para esse arquivo e registra também o SHA-256 efetivamente calculado na futura execução local.

### R — instrumento criado

Arquivos versionáveis:

- `docs/linguistics/synthetic/m1-r0-observed-pool-assembly.json`;
- `scripts/assemble-subject-observed-pool.mjs`;
- `scripts/audit-subject-observed-pool.mjs`.

O montador:

- não possui download nem rede;
- exige caminhos de entrada e saída fora do checkout;
- autentica `train` e `dev` por Git blob SHA; autentica também o SHA-256 do `train` já conhecido;
- usa `parseConllu`, `parseSentencePosition` e `mineSubjectCandidates` do minerador já auditado;
- rejeita posição `documento + ordinal` duplicada entre splits;
- não confia na ordem física dos blocos CoNLL-U;
- preserva `candidateId`, split da sentença-alvo, balde estrutural, exclusões e target;
- reconstrói somente predecessor documental exato no índice conjunto;
- mantém toda `humanAnnotation` como `pending`/`null`;
- ordena a saída por `candidateId` para produzir bytes estáveis em relação à ordem física dos arquivos;
- escreve em modo exclusivo `wx`;
- falha se qualquer agregado real divergir da evidência congelada.

Agregados exigidos na execução real:

```text
sentenças: 6.735
predecessores documentais exatos: 2.448
candidatos estruturais: 2.217
candidatos com predecessor exato: 829

explicit_subject_control: 1.088
no_direct_subject_candidate: 183
outside_initial_scope: 946

continuidade cross-split:
  alvo train / predecessor dev: 270
  alvo dev / predecessor train: 256

no_direct_subject_candidate com predecessor exato: 67
  train: 56
  dev: 11

  conj: 32
  root: 14
  ccomp: 7
  advcl: 7
  acl:relcl: 5
  parataxis: 1
  ccomp:speech: 1
```

### Auditoria original do instrumento

A auditoria usa somente quatro sentenças originais sintéticas construídas para o teste, divididas artificialmente entre `train` e `dev`.

Ela prova:

- predecessor `dev → train` reconstruído;
- predecessor `train → dev` reconstruído;
- a mesma entrada com blocos em outra ordem física produz exatamente o mesmo relatório;
- a classificação estrutural continua idêntica à produzida pelo minerador-base em cada split;
- apenas o contexto anterior é enriquecido;
- split e `candidateId` da sentença-alvo são preservados;
- duplicata de posição documental entre splits é recusada;
- toda anotação humana continua pendente;
- os cálculos de Git blob SHA-1 e SHA-256 são testados contra vetores conhecidos;
- a trava de agregados aceita o esperado e rejeita divergência.

### Execução real não fingida

Este ambiente de trabalho consegue ler repositórios pelo conector GitHub, mas o shell de execução não possui resolução DNS externa confiável para baixar os arquivos completos do Porttinari. Por isso, **nenhum pool observado real foi produzido nesta tranche dentro deste ambiente**.

A execução real deverá ocorrer localmente sobre os dois arquivos autenticados. O comando, depois de a tranche estar verde na CI, será:

```bash
cd mass-notes-next
node scripts/assemble-subject-observed-pool.mjs \
  --train /CAMINHO/PRIVADO/pt_porttinari-ud-train.conllu \
  --dev /CAMINHO/PRIVADO/pt_porttinari-ud-dev.conllu \
  --output /CAMINHO/PRIVADO/m1-r0-porttinari-train-dev-pool.json
```

O arquivo de saída permanece privado e fora do repositório.

### O — sequência após esta tranche ficar verde

1. obter localmente os dois arquivos exatos da revisão fixada;
2. executar o montador e exigir a reprodução integral dos agregados acima;
3. passar o pool privado ao seletor `select-subject-synthetic-pilot.mjs` e gerar pacote + manifesto privados de 16 casos;
4. instalar/verificar os três modelos Ollama registrados;
5. executar `round-a` somente nos quatro primeiros casos;
6. auditar JSON, memória, latência, confiança e comportamento diante da ambiguidade;
7. se o smoke estiver estável, executar as três rotações sobre os 16 casos — 144 julgamentos sintéticos;
8. preservar desacordos e convocar Eva Chara;
9. somente depois decidir se cabe teste vermelho experimental de Sintaxe.

Nenhuma nota Eva sobe nesta etapa e a validação humana permanece deliberadamente adiada, não concluída.
