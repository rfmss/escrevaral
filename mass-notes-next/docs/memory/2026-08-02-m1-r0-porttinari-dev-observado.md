# Memória operacional — M1-R0 Porttinari dev observado

Atualizado em: 2026-08-02  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado linguístico: `source_mapped`  
Sintaxe de produção: `not_authorized`

> **Eva Chara, entre em banca.**

## Retomada curta

O split `dev` do UD Portuguese Porttinari foi recebido como arquivo local, verificado contra a revisão fixada e minerado fora do repositório.

Nenhum corpus bruto, fila privada, sentença do corpus ou rótulo humano foi versionado.

A execução revelou uma fronteira metodológica que não aparecia na fixture original: a ordem física do arquivo não corresponde à ordem discursiva dos documentos. O minerador foi corrigido para aceitar contexto anterior somente quando o `sent_id` comprova:

1. o mesmo documento;
2. a sentença ordinal imediatamente anterior.

A primeira família sintática permanece limitada a:

> terceira pessoa do plural com sujeito recuperável versus sujeito indeterminado.

Nenhuma engine foi escrita ou autorizada.

---

## CLARO

### C — cenário

A tranche anterior havia criado um minerador local que:

- recebe CoNLL-U externo ao checkout;
- busca verbos finitos em terceira pessoa do plural;
- separa controles com sujeito direto, candidatos sem sujeito direto e sinais fora do escopo;
- mantém toda decisão linguística humana como `pending` e `null`;
- rejeita `test`, rede, download automático e saída dentro do repositório.

Faltava executar o instrumento sobre uma fonte observada real.

O arquivo recebido foi:

```text
pt_porttinari-ud-dev.conllu
```

Fonte registrada:

- recurso: UD Portuguese Porttinari;
- revisão: `87a07e1fb761d6d0a6e2a4d82b11b308344dabb9`;
- split: `dev`;
- licença: CC BY 4.0.

### L — limites

A execução não poderia:

- consultar o split `test`;
- classificar sujeito recuperável ou indeterminado automaticamente;
- converter relação UD em verdade do produto;
- versionar o corpus ou a fila privada;
- exibir corpus observado como exemplo autoral do Escrevaral;
- elevar nota linguística;
- autorizar Sintaxe de produção.

Contexto discursivo só pode existir quando a própria proveniência estrutural o comprova. Proximidade física dentro de um arquivo não é evidência de continuidade textual.

### A — autenticidade da entrada

Verificação local:

```text
bytes: 1.151.522
linhas: 20.115
codificação: UTF-8
sentenças CoNLL-U: 842
Git blob SHA: 19e5a75cec5087a7aa92dc112e21e9f9d74bdaa7
SHA-256: 208483e5f5a29a0f6b6e0fc1f6e6499a10a5f5cbde53fdad20b30bf146a9e316
```

O Git blob SHA local coincide exatamente com o blob oficial do arquivo na revisão fixada.

### R — primeira mineração

A estrutura produziu:

```text
sentenças: 842
candidatos estruturais: 268
explicit_subject_control: 125
no_direct_subject_candidate: 26
outside_initial_scope: 117
```

Sinais de exclusão observados, com sobreposição possível:

```text
finite_auxiliary: 81
passive_signal: 55
contains_se: 37
impersonal_expletive_signal: 8
```

Os 26 candidatos sem sujeito direto se distribuem assim pelo vínculo do verbo-alvo:

```text
conj: 10
root: 9
advcl: 3
acl:relcl: 3
ccomp: 1
```

Essas relações são somente sinais de estratificação. Não são rótulos linguísticos do Escrevaral.

### O — descoberta sobre contexto

A ordem física contém 841 pares adjacentes de sentenças. Entre eles:

```text
mesmo documento: 2
mesmo documento e ordinal consecutivo: 0
```

Reconstruindo a posição pelo `sent_id`, existem:

```text
sentenças com predecessor documental exato: 34
alvos candidatos com predecessor exato: 4
candidatos sem sujeito direto com predecessor exato: 0
```

Conclusão:

> O `dev` do Porttinari é útil para controles estruturais e para localizar ausências de sujeito direto, mas não fornece, nesta amostra, casos confiáveis da fronteira principal de recuperação pela sentença imediatamente anterior.

Ele não pode, sozinho, validar sujeito recuperável por contexto intersentencial.

---

## Vermelho preservado

### Cabeça

`0aaa4471f6bfe59fb5858aa45f3add9cc1c5a31f`

### Run

`30772027687`

A auditoria nova exigiu que o contexto anterior:

- não viesse da posição física do bloco;
- pertencesse ao mesmo documento;
- tivesse ordinal imediatamente anterior;
- carregasse prova explícita de continuidade.

O minerador anterior falhou corretamente porque:

- aceitou como contexto uma sentença fisicamente anterior de outro documento;
- perdeu uma sentença do mesmo documento colocada fora de ordem;
- não declarava que a ordem física era não confiável;
- não contabilizava contextos documentais comprovados.

Build, navegadores e preview foram bloqueados antes da publicação.

---

## Menor correção

A cabeça funcional inicial da correção é:

`4406b0e74bba6659e32f782b3f22804249373f99`

O minerador agora:

1. interpreta `sent_id` com documento e ordinal;
2. cria índice documental independente da ordem física;
3. só recupera a sentença `n - 1` do mesmo documento;
4. usa `previousContext: null` quando a continuidade não é comprovada;
5. marca contexto aceito com `same_document_consecutive_sentence_id`;
6. declara `fileOrderTrustedAsDiscourseOrder: false`;
7. contabiliza sentenças e candidatos com contexto anterior confiável.

A fixture adversarial usa três blocos fora de ordem:

```text
DOC A / sentença 1
DOC B / sentença 2
DOC A / sentença 2
```

A banca exige:

- rejeitar `DOC A / 1` como contexto físico de `DOC B / 2`;
- recuperar `DOC A / 1` como contexto real de `DOC A / 2`;
- preservar todas as demais fronteiras do minerador.

A execução local da CLI corrigida sobre o arquivo observado produziu:

```text
schemaVersion: 2
sentenças: 842
contextos anteriores confiáveis: 34
candidatos estruturais: 268
candidatos com contexto anterior confiável: 4
rótulos linguísticos automáticos: 0
split test aberto: false
```

### Validação oficial da correção

A cabeça `4406b0e74bba6659e32f782b3f22804249373f99` passou:

```text
auditorias linguísticas: verdes
TypeScript e build: verdes
Chromium + Firefox: 364/364
publicação da preview: verde
renovação de cache: verde
smoke público: verde
workflows oficiais: 18/18
```

Artefato da matriz:

```text
mass-notes-tiptap-30772080509
ID: 8840943539
SHA-256: 7ffcbe1eace1cb8d377425ef1aafb1e8e0e1ec3bbf2ca841990308ee7bb3d74b
tamanho: 19.683.191 bytes
```

---

## Interpretação linguística permitida

A amostra observada permite estudar, com anotação humana:

- sujeito direto explícito como controle;
- sujeito compartilhado em coordenação;
- recuperação dentro da própria sentença;
- relativas e subordinadas sem sujeito direto ligado ao alvo;
- possíveis casos de indeterminação;
- ambiguidades ou inconsistências da anotação UD.

A amostra não permite ainda concluir:

- que ausência de `nsubj` equivale a sujeito indeterminado;
- que todo verbo `root` sem sujeito direto é indeterminado;
- que todo `conj` herda automaticamente o sujeito do primeiro verbo;
- que o modelo do Escrevaral está correto;
- que o Porttinari representa ficção, diálogo ou oralidade;
- que existe cobertura intersentencial suficiente.

---

## Piloto cego provisório — execução suspensa

Foi preparada uma amostra privada de 16 casos como ensaio do instrumento. Ela não deve ser entregue aos anotadores antes da mineração conjunta de `train + dev`, porque o `dev` isolado não oferece predecessor confiável para nenhum dos 26 candidatos sem sujeito direto.

Composição provisória:

```text
12 candidatos sem sujeito direto
4 controles com sujeito explícito
16 sentenças únicas
```

Estratos dos doze candidatos:

```text
root sem sujeito direto: 4
conj com sujeito no núcleo relacionado: 3
conj sem sujeito no núcleo relacionado: 2
acl:relcl sem sujeito direto: 1
advcl sem sujeito direto: 1
ccomp sem sujeito direto: 1
```

O repositório não recebe os textos do pacote. Somente o protocolo e, futuramente, resultados agregados poderão ser versionados.

### Rótulo primário do protocolo

Cada anotador escolhe exatamente um:

- `subject_recoverable`;
- `subject_indeterminate`;
- `subject_ambiguous`;
- `explicit_subject_control`;
- `outside_initial_scope_or_annotation_issue`.

Também registra:

- confiança;
- escopo de recuperação;
- referente mínimo, quando existir;
- justificativa curta.

Os anotadores não podem consultar:

- relações UD;
- balde estrutural;
- manifesto de seleção;
- avaliação reservada;
- resposta do outro anotador;
- ferramenta automática de análise sintática.

### Critério provisório

Antes de qualquer hipótese computacional:

1. dois anotadores humanos independentes;
2. acordo bruto;
3. Cohen's kappa do rótulo principal;
4. matriz de confusão;
5. atenção especial a recuperável versus indeterminado;
6. preservação e adjudicação de todos os desacordos.

Regra provisória:

- `kappa >= 0.70`: continuar com condições;
- `kappa < 0.70`: revisar instruções e repetir o piloto;
- concordância alta não autoriza engine nem estado `verified`.

---

## Parecer Eva Chara

### Decisão

`PROSSEGUIR COM CONDIÇÕES`

### Acertos

- a fonte foi verificada byte a byte contra a revisão fixada;
- o corpus e a fila privada ficaram fora do GitHub;
- um erro metodológico foi descoberto antes de contaminar a anotação;
- o vermelho foi escrito antes da correção;
- a ordem física deixou de ser tratada como discurso;
- nenhuma relação UD virou rótulo de produto;
- nenhum exemplo observado foi chamado de material original do Escrevaral;
- a avaliação continua lacrada.

### Riscos restantes

- os 26 candidatos ainda não possuem julgamento humano;
- o domínio é jornalístico;
- não há candidato sem sujeito direto com sentença anterior comprovada;
- coordenação, relativas e subordinação podem exigir regras próprias;
- dois anotadores independentes ainda não concluíram o piloto;
- uma fonte com documentos contínuos ainda é necessária para a pergunta intersentencial.

### Condições

1. matriz integral verde na cabeça final documental;
2. nenhuma fila privada no repositório;
3. manter o piloto cego como provisório e não distribuí-lo antes da mineração conjunta de `train + dev`;
4. obter o `train` do Porttinari na mesma revisão fixada e verificar seu blob Git;
5. reconstruir continuidade documental apenas na união autorizada de `train + dev`, sem abrir `test`;
6. atualizar ou confirmar a amostra cega depois dessa reconstrução;
7. manter Sintaxe em `not_authorized` e a avaliação lacrada.

---

## Próximo passo seguro

1. obter `pt_porttinari-ud-train.conllu` na revisão `87a07e1fb761d6d0a6e2a4d82b11b308344dabb9`;
2. verificar que o blob Git local coincide com `6dac8d4a5b6bf208dc9146291e7b9014e404bc59`;
3. minerar `train` e reconstruir contexto sobre a união autorizada `train + dev`, mantendo `test` lacrado;
4. recalcular quantos candidatos sem sujeito direto possuem predecessor documental confiável;
5. atualizar ou confirmar o piloto cego provisório;
6. somente então entregar os pacotes A e B a anotadores independentes;
7. medir concordância, preservar divergências e convocar nova banca Eva antes de qualquer teste vermelho de Sintaxe.
