# Memória operacional — M1-R0 minerador local de CoNLL-U

Atualizado em: 2026-08-02  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado linguístico: `source_mapped`  
Implementação de Sintaxe: `not_authorized`

> **Eva Chara, entre em banca.**

## Retomada curta

A primeira família sintática continua limitada a:

> terceira pessoa do plural com sujeito recuperável pelo contexto versus sujeito indeterminado.

Nesta tranche foi criado somente um instrumento de pesquisa para reduzir arquivos CoNLL-U locais a uma fila privada de candidatos estruturais. Ele não é engine, não classifica sujeito e não consulta automaticamente nenhum corpus.

Arquivos centrais:

1. `scripts/mine-subject-candidates.mjs`;
2. `scripts/audit-subject-miner.mjs`;
3. `tests/fixtures/subject-miner-original.conllu`;
4. `docs/corpora/m1-r0-subject-corpus-sources.json`;
5. `tests/fixtures/subject-recoverability-development.json`;
6. `tests/fixtures/subject-recoverability-evaluation.json`;
7. `docs/logs/2026-08-02-m1-r0-triagem-corpora-sujeito.md`;
8. `docs/linguistics/rules/m1-r0-subject-boundaries.yaml`.

## CLARO

### C — cenário

A pesquisa já possuía:

- mapa conceitual de sujeito;
- ficha formal ainda não autorizada para implementação;
- registro de nove corpora candidatos;
- desenvolvimento sintético original com 24 casos;
- avaliação sintética original e reservada com 16 casos.

Faltava uma maneira controlada de localizar ocorrências reais em uma fonte licenciada sem:

- fazer download por dentro do projeto;
- copiar corpus bruto para o repositório;
- abrir o split de teste;
- transformar relações UD em verdade linguística;
- misturar seleção de exemplos e decisão de produto.

### L — limite e impacto

O minerador:

- não pertence ao runtime;
- não é importado pelo React;
- não altera a engine verbal ou lexical;
- não gera decoration ou sugestão;
- não atribui `subject_recoverable`, `subject_indeterminate` ou qualquer rótulo linguístico;
- não pode sustentar estado `verified`;
- não acessa rede;
- não executa shell;
- não aceita `test`;
- não aceita corpus nem saída dentro do diretório do repositório;
- não sobrescreve fila anterior.

O impacto é exclusivamente na auditabilidade da pesquisa.

### A — arquitetura

```text
arquivo .conllu local e externo ao repositório
                    │
                    ▼
         parser CoNLL-U puro e local
                    │
                    ▼
  verbos finitos: Person=3 + Number=Plur
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
sujeito direto  sem sujeito   sinais fora
  expresso         direto       do escopo
  controle       candidato    se/passiva/AUX
       │            │            │
       └────────────┴────────────┘
                    ▼
          fila privada em JSON
                    │
                    ▼
          anotação humana pendente
```

Cada candidato preserva:

- fonte registrada;
- repositório de origem;
- revisão fixada;
- licença;
- split;
- `sent_id`;
- token-alvo;
- morfologia CoNLL-U;
- dependentes de sujeito direto;
- nominais plurais na sentença;
- nominais plurais na sentença anterior;
- sinais de passiva;
- sinais de `se`;
- sinais expletivos;
- estado humano `pending` com rótulo `null`.

Os baldes `explicit_subject_control`, `no_direct_subject_candidate` e `outside_initial_scope` são apenas organização estrutural. Eles não equivalem à análise final de sujeito.

### R — resultado reproduzível

A fixture `subject-miner-original.conllu` foi escrita integralmente para o projeto e contém sete sentenças:

- três controles com sujeito direto expresso;
- duas ocorrências sem sujeito direto;
- uma construção com `se` e passiva;
- uma construção passiva com auxiliar finito.

A auditoria exige:

```text
sentenças: 7
candidatos estruturais: 7
explicit_subject_control: 3
no_direct_subject_candidate: 2
outside_initial_scope: 2
decisão linguística automática: false
split test aceito: false
```

Também verifica:

- ausência de `fetch`, HTTP, HTTPS, XHR e `child_process`;
- ausência de importação da avaliação reservada;
- ausência dos rótulos finais no código do minerador;
- fonte autorizada e revisão exata na CLI;
- entrada e saída fora do repositório;
- criação exclusiva da saída com `flag: 'wx'`;
- contexto anterior e referentes plurais concorrentes preservados;
- separação de `se`, passiva e auxiliar do escopo inicial;
- rejeição efetiva do split `test`.

### O — o que permanece aberto

- executar o minerador localmente sobre `train` e `dev` do Porttinari na revisão fixada;
- registrar somente uma seleção mínima depois de revisão de direitos e atribuição;
- criar contrato de anotação humana com dois anotadores;
- preservar rejeições e divergências;
- definir concordância mínima antes de congelar hipótese;
- tornar a ocorrência-alvo inequívoca nos conjuntos sintéticos por token ou offset;
- não abrir PetroGold, DANTEStocks ou qualquer split reservado antes do congelamento;
- não escrever engine nesta tranche.

---

## Uso autorizado

O arquivo CoNLL-U e a saída devem ficar fora do checkout:

```bash
npm run mine:subject-candidates -- \
  --input /tmp/porttinari/pt_porttinari-ud-dev.conllu \
  --output /tmp/escrevaral-subject-candidates-dev.json \
  --source-id ud-portuguese-porttinari-2.18 \
  --revision 87a07e1fb761d6d0a6e2a4d82b11b308344dabb9 \
  --split dev
```

O comando falha quando:

- a fonte não está registrada;
- a fonte não está autorizada para desenvolvimento;
- a revisão diverge;
- o split é `test` ou qualquer valor diferente de `train`/`dev`;
- entrada ou saída está dentro do repositório;
- a saída já existe;
- o CoNLL-U não possui dez colunas ou `HEAD` inteiro.

O JSON gerado é uma fila privada de trabalho. Não deve ser versionado automaticamente.

---

## Vermelho preservado

Cabeça vermelha: `bef9c53b0f7a81a2684e5b018637a4b3411d349e`  
Mass Notes: `30767179722`

A auditoria produziu corretamente os sete candidatos e todos os contadores esperados, mas recusou a execução por `network-or-shell-capability`.

Causa:

- a regra `/\bexec(?:File|Sync)?\s*\(/` pretendia detectar chamadas de shell;
- ela também reconheceu o método legítimo `RegExp.exec()` usado para ler comentários CoNLL-U;
- não havia importação de `child_process`, execução de shell ou rede.

Correção:

- removida somente a regex ambígua de nome de método;
- preservado o bloqueio explícito de `child_process` e capacidades de rede;
- preservados todos os testes comportamentais e fronteiras da CLI.

A preview não foi publicada na cabeça vermelha: build, navegadores, publicação, cache e smoke foram corretamente interrompidos.

---

## Parecer Eva Chara

### Acertos

- a pesquisa ganhou instrumento reprodutível sem virar engine;
- o corpus continua fora do repositório;
- a fonte precisa estar autorizada e pinada;
- `test` permanece lacrado;
- a saída não contém decisão automática;
- contexto anterior e concorrência referencial são preservados para análise humana;
- `se`, passiva e auxiliar são apartados da primeira família;
- o vermelho da auditoria não foi contornado por remoção dos controles reais.

### Riscos

- `nsubj` direto é sinal estrutural, não prova discursiva;
- a sentença anterior pode ser contexto insuficiente;
- nominais plurais são candidatos, não referentes;
- relações UD podem conter erro ou convenção incompatível com a explicação do produto;
- o texto local ainda exige manejo seguro e atribuição;
- a pessoa anotadora pode ser influenciada pelo balde estrutural;
- a fixture original prova o instrumento, não a língua real.

### Decisão

`PROSSEGUIR COM CONDIÇÕES`

Nenhuma nota sobe.

Condições:

1. matriz integral verde na cabeça final;
2. mineração somente local sobre Porttinari `train`/`dev`;
3. nenhum commit automático de saída;
4. anotação humana separada do minerador;
5. preservação dos casos rejeitados;
6. hipótese congelada antes de qualquer fonte de avaliação;
7. engine continua bloqueada.

---

## Próximo passo seguro

Depois da validação integral desta cabeça:

1. executar o minerador sobre uma cópia local do `dev` do Porttinari;
2. selecionar uma amostra estratificada pequena de controles, ausências de sujeito direto e exclusões;
3. registrar IDs e metadados antes de qualquer trecho;
4. criar protocolo de anotação cega por duas pessoas;
5. resolver divergências sem consultar a avaliação reservada;
6. convocar nova banca Eva;
7. somente então decidir se existe hipótese computacional suficiente para um teste vermelho de Sintaxe.
