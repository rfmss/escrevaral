# M1-R0 — abertura controlada dos conjuntos de sujeito

Data: 2026-08-02  
Estado: corpus sintético de pesquisa aberto; corpus observado ainda pendente  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — manter aberto e em rascunho  
Fronteira: nenhuma implementação de Sintaxe autorizada

> **Eva Chara, entre em banca.**

## CLARO

### C — cenário

A primeira ficha de Sintaxe já distingue sujeito expresso, recuperável, indeterminado e oração sem sujeito, mas ainda não possuía conjuntos separados nem política operacional para receber ocorrências de corpus.

A primeira família mínima permanece:

> terceira pessoa do plural com sujeito recuperável pelo contexto versus sujeito indeterminado.

Construções com `se`, oração sem sujeito, verbos meteorológicos e `ter` existencial continuam fora desta primeira implementação candidata.

### L — limite e impacto

Esta tranche não autoriza engine nem eleva nota.

Os dois conjuntos criados são integralmente originais e sintéticos:

- ajudam a formular e tensionar a hipótese;
- não medem uso real;
- não demonstram representatividade brasileira;
- não substituem corpus observado;
- não substituem banca humana;
- não podem sustentar estado `verified`.

Nenhum trecho de livro, notícia, tweet, artigo acadêmico ou transcrição foi incorporado.

### A — arquitetura

Foram separadas quatro camadas:

```text
Biblioteca de Autoridade
        ↓ conceitos e divergências
registro de corpora externos
        ↓ licença, versão, papel e bloqueios
desenvolvimento sintético original
        ≠
avaliação sintética original reservada
        ↓
corpus observado licenciado e revisão humana ainda pendentes
```

Arquivos:

- `docs/corpora/m1-r0-subject-corpus-sources.json`;
- `tests/fixtures/subject-recoverability-development.json`;
- `tests/fixtures/subject-recoverability-evaluation.json`;
- `scripts/audit-subject-corpus.mjs`.

A auditoria é encadeada por `npm run audit:lexicon` e bloqueia:

- IDs ou textos repetidos;
- sobreposição entre desenvolvimento e avaliação;
- casos sem proveniência original;
- ausência de classes ou gêneros contratados;
- abertura de texto externo sem licença compatível;
- uso de fonte bloqueada;
- retirada prematura do lacre de avaliação;
- mudança da ficha para `verified`;
- autorização de implementação sintática;
- incorporação de fonte bruta.

### R — resultado reproduzível

Estado contratado:

- nove fontes externas triadas;
- uma fonte aberta apenas para mineração controlada de desenvolvimento;
- duas fontes reservadas para futura avaliação externa;
- 24 casos sintéticos de desenvolvimento;
- 16 casos sintéticos de avaliação reservada;
- quatro classes em ambos os conjuntos:
  - `subject_recoverable`;
  - `subject_indeterminate`;
  - `subject_ambiguous`;
  - `subject_explicit`;
- cinco registros de gênero simulados em ambos:
  - prosa ficcional;
  - diálogo;
  - ensaio;
  - jornalismo;
  - oralidade;
- nenhuma sobreposição;
- `implementation.state: not_authorized`.

### O — o que permanece aberto

- selecionar ocorrências observadas no Porttinari sem consultar seu split de teste;
- revisar manualmente cada ocorrência e não converter relação UD diretamente em rótulo de produto;
- congelar a hipótese antes de abrir PetroGold ou DANTEStocks como candidatos de avaliação;
- obter ficção brasileira com licença documental inequívoca;
- resolver a fronteira comercial do corpus oral;
- executar concordância entre anotadores;
- criar teste vermelho de engine somente depois da banca de corpus;
- manter `se`, impessoalidade e `ter` fora da primeira família.

---

## Decisão de fontes

### Aceita para mineração controlada de desenvolvimento

#### UD Portuguese Porttinari — UD 2.18 / Porttinari 3.0

- revisão fixada: `87a07e1fb761d6d0a6e2a4d82b11b308344dabb9`;
- português brasileiro;
- jornalismo;
- anotação ouro manualmente revisada;
- inclui texto;
- licença declarada: CC BY 4.0.

Condições:

- usar somente `train` e `dev` durante o desenho;
- preservar `sent_id`, split, revisão e atribuição;
- selecionar o mínimo de ocorrências;
- revisar o rótulo humano independentemente da anotação UD;
- não usar o `test` para corrigir a hipótese.

### Reservadas para avaliação externa futura

#### UD Portuguese PetroGold

- revisão fixada: `5814c7f92b88b64ccb9ba2d8ef33c64535dc881f`;
- português brasileiro acadêmico do domínio de petróleo e gás;
- anotação integralmente revisada;
- inclui texto;
- CC BY-SA 4.0.

Não será consultado para casos-alvo antes do congelamento da hipótese. O domínio especializado e a obrigação ShareAlike permanecem explícitos.

#### UD Portuguese DANTEStocks

- revisão fixada: `4268e8e1b2c95708136e34f38b8e8af96de86dd2`;
- tweets brasileiros sobre mercado financeiro;
- texto social não normalizado;
- revisão manual após processamento automático;
- inclui texto;
- CC BY 4.0.

É candidato de variação social, não substituto de diálogo espontâneo. Qualquer trecho exige revisão ética de conteúdo e dados pessoais.

### Condicionais ou apenas benchmark

- **UD Portuguese GSD:** anotações sob CC BY-SA, mas o próprio projeto registra cautela separada para os direitos do texto subjacente. Nenhuma frase entra nas fixtures.
- **UD Portuguese Bosque:** mistura material brasileiro e europeu; exige filtro inequívoco de variante.
- **Corpus Carolina:** licença varia por documento; nenhuma ocorrência é aceita sem inspeção individual.
- **C-ORAL-BRASIL I:** excelente candidato de fala espontânea, mas a licença não comercial impede incorporação automática ao produto.
- **CORAA:** CC BY-NC-ND; rejeitado para derivação e vendorização.
- **UD Portuguese CINTIL:** CC BY-NC-ND e não especificamente brasileiro; rejeitado para vendorização.

---

## Desenho dos conjuntos sintéticos

### Desenvolvimento

O conjunto de desenvolvimento pode ser lido durante o desenho da hipótese. Contém:

| Classe | Casos |
|---|---:|
| sujeito recuperável | 8 |
| sujeito indeterminado | 8 |
| leitura ambígua | 4 |
| sujeito expresso | 4 |
| **Total** | **24** |

### Avaliação reservada

O conjunto de avaliação:

- possui textos e IDs diferentes;
- declara `sealedUntil: implementation_hypothesis_frozen`;
- não pode ser importado por runner de desenvolvimento;
- não pode sustentar `verified`;
- só deverá ser aberto depois de congelada uma hipótese computacional.

| Classe | Casos |
|---|---:|
| sujeito recuperável | 5 |
| sujeito indeterminado | 5 |
| leitura ambígua | 3 |
| sujeito expresso | 3 |
| **Total** | **16** |

---

## Parecer Eva Chara — entrada da tranche

### Dimensões

| Dimensão | Antes | Depois | Evidência | Limite |
|---|---:|---:|---|---|
| Sintaxe e estrutura oracional | 4,5 | 4,5 | fenômeno mínimo e controles foram separados | não existe engine nem corpus observado |
| Variação, registro e norma | 6,5 | 6,5 | gêneros simulados e fontes variadas foram mapeados | simulação não é variação observada |
| Fundamentação e proveniência | 5,0 | 5,0 | fontes, licenças, versões e papéis foram registrados | nenhuma ocorrência externa foi anotada |
| Engenharia e auditabilidade | 8,5 | 8,5 | auditoria impede contaminação e abertura prematura | ainda falta provar a auditoria na matriz |
| Validação humana e acadêmica | 4,0 | 4,0 | avaliação foi lacrada | não há anotadores independentes |

### Acertos

- a família inicial foi reduzida;
- desenvolvimento e avaliação não compartilham texto;
- casos ambíguos são resposta legítima;
- sujeito expresso funciona como controle;
- licença e adequação linguística foram tratadas separadamente;
- o corpus oral não foi incorporado por conveniência;
- nenhuma nota subiu.

### Riscos prioritários

- exemplos sintéticos podem refletir demais a teoria que pretendem testar;
- jornalismo domina a primeira fonte observada;
- PetroGold e DANTEStocks introduzem vieses de domínio;
- anotações UD não resolvem por si mesmas recuperabilidade discursiva;
- uma janela de apenas um período pode perder anáfora mais longa;
- a avaliação deixa de ser cega se for consultada antes do congelamento.

### Decisão

`PROSSEGUIR COM CONDIÇÕES`

Condições:

1. validar a auditoria na matriz integral;
2. minerar apenas candidatos de `train` e `dev` do Porttinari;
3. preservar casos rejeitados e divergência entre anotadores;
4. congelar a hipótese antes de abrir fontes reservadas;
5. não escrever engine nesta cabeça;
6. não elevar scorecard;
7. submeter a próxima seleção observada a nova banca Eva.

---

## Menor próximo passo seguro

Criar um minerador local e descartável para arquivos CoNLL-U que:

1. receba um caminho local e nunca faça download automático;
2. preserve repositório, revisão, split e `sent_id`;
3. localize verbos finitos em terceira pessoa do plural;
4. separe candidatos com `nsubj` expresso, sem `nsubj` e com relações concorrentes;
5. produza apenas uma lista privada de candidatos;
6. exija anotação humana antes de qualquer entrada versionada;
7. nunca consulte o split `test` durante o desenvolvimento.
