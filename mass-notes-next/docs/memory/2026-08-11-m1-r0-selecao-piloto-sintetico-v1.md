# M1-R0 — receita determinística do piloto sintético observado

Atualizado em: 2026-08-11  
Base de pesquisa: `e1ee718b8ed55910b481a97222a0ce31927ee170`  
Branch oficial: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Sintaxe de produção: `not_authorized`

## CLARO

### C — cenário

O registro de 2026-08-08 provou um pool observado de 67 candidatos `no_direct_subject_candidate` com predecessor documental exato em Porttinari `train + dev`, distribuídos em sete relações estruturais. A banca Eva determinou um piloto de 16 itens: 12 candidatos sem sujeito direto + 4 controles explícitos, escolhido por estratos e ordenação determinística.

Ao retomar a preparação para a pré-banca sintética, a pesquisa no repositório, memória e discussão do PR confirmou que **a antiga preparação privada não deixou versionada a receita completa de desempate nem os IDs dos 16 casos**. Reivindicar que seria possível reproduzir exatamente aqueles 16 a partir da documentação disponível criaria uma falsa memória experimental.

Como a banca humana foi deliberadamente adiada e nenhum julgamento humano foi produzido com aquele pacote, a pré-banca sintética ganha uma receita v1 própria, congelada antes de qualquer modelo observar os casos.

### L — limites

A seleção:

- não usa o texto da sentença ou do contexto para ordenar casos;
- não usa resposta linguística, rótulo humano ou saída de modelo;
- não consulta `test`;
- não altera a avaliação sintética reservada;
- não pretende estimar a frequência populacional das estruturas;
- não autoriza Sintaxe, `verified`, excelência ou aumento de nota;
- mantém pacote observado e manifesto de seleção fora do repositório.

O objetivo desta amostra pequena é **maturação de protocolo com cobertura estrutural**, não representatividade estatística do português brasileiro.

### A — receita congelada

Fonte canônica:

- UD Portuguese Porttinari;
- revisão `87a07e1fb761d6d0a6e2a4d82b11b308344dabb9`;
- apenas `train` e `dev`;
- `test` bloqueado.

O seletor só aceita o pool se reproduzir exatamente a evidência já registrada:

```text
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

A amostra de 12 candidatos usa quotas **coverage-first**:

```text
conj: 4
root: 2
ccomp: 2
advcl: 1
acl:relcl: 1
parataxis: 1
ccomp:speech: 1
```

Assim, todos os sete estratos entram no piloto, inclusive os dois estratos unitários. Isso é uma sobreamostragem deliberada de raridades para descobrir fragilidade do protocolo; as proporções não podem ser lidas como estimativa do corpus.

Dentro de cada estrato, a ordem é dada exclusivamente por:

```text
SHA-256(salt fixo + NUL + candidateId)
```

em ordem crescente, com `candidateId` apenas como desempate final. Os 4 controles `explicit_subject_control` com predecessor comprovado usam outro salt fixo e o mesmo procedimento.

O pacote final contém 16 casos. Seus primeiros quatro formam apenas um **smoke operacional** para validar modelos locais antes dos 144 julgamentos completos:

- 3 candidatos sem sujeito direto de estratos distintos;
- 1 controle explícito.

Os quatro são escolhidos por hash determinístico; os 12 restantes recebem outra ordenação hash de apresentação.

### R — instrumento criado

Arquivos versionáveis contêm somente método e auditoria:

- `docs/linguistics/synthetic/m1-r0-private-pilot-selection.json`;
- `scripts/select-subject-synthetic-pilot.mjs`;
- `scripts/audit-subject-pilot-selector.mjs`.

O seletor recebe um pool privado observado e, quando necessário, um pool privado separado de controles. Ele gera **fora do repositório**:

1. pacote privado de 16 casos, com o texto necessário para a anotação;
2. manifesto privado sem texto observado, contendo IDs, hashes, estratos, posições e fingerprints.

O pacote e o manifesto são escritos em modo exclusivo, sem sobrescrever arquivos existentes. O pacote registra SHA-256 dos inputs e da configuração; o manifesto registra também o SHA-256 do próprio pacote.

A auditoria usa somente casos sintéticos originais construídos em memória. Ela prova que:

- o pool canônico precisa ter 67 casos e a distribuição registrada;
- as quotas 12 + 4 são cumpridas;
- os sete estratos entram;
- o smoke de quatro contém 3 candidatos de estratos distintos + 1 controle;
- repetir com os mesmos IDs produz a mesma seleção;
- mudar todo o texto mantendo IDs/metadados **não muda a seleção**;
- a mudança textual altera o fingerprint do pacote;
- `test` é recusado;
- caso previamente rotulado deixa de ser elegível;
- o manifesto não contém o texto observado.

### O — próximo passo

1. deixar a matriz do head `e1ee718...` terminar antes de novo avanço da branch oficial;
2. integrar este seletor somente se sua auditoria passar na CI;
3. localizar no ambiente privado o pool canônico de 67 e uma coleção de controles elegíveis, ou regenerá-los a partir dos arquivos locais autenticados;
4. gerar o pacote de 16 e registrar seus fingerprints, sem versionar conteúdo;
5. instalar/verificar os três modelos locais;
6. executar `round-a` nos quatro primeiros casos;
7. só se o smoke operacional estiver estável, executar 16 × 3 × 3 = 144 julgamentos sintéticos;
8. preservar desacordos e convocar Eva antes de qualquer teste vermelho de Sintaxe.
