# Calibração linguística do Escrevaral — pt-BR

## Objetivo

O Escrevaral usa conhecimento linguístico explícito, auditável e executável localmente. A calibração não treina um modelo neural e não copia obras de referência para o produto: converte conhecimento linguístico em regras, condições, exceções, exemplos próprios e testes reproduzíveis.

A unidade de trabalho é:

`fonte → proposição linguística → classificação → regra → contraexemplos → teste → engine → versão`

## Princípios

1. **Offline primeiro.** Depois de carregado, o conhecimento necessário à análise deve funcionar sem rede.
2. **Norma e estilo são camadas diferentes.** Uma infração normativa pode gerar erro; uma escolha estilística deve ser descrita como efeito, tendência ou hipótese, nunca promovida a erro por conveniência da engine.
3. **Sintaxe governa pontuação normativa.** Regras de vírgula e segmentação devem preferir relações sintáticas a heurísticas de pausa ou comprimento.
4. **Variação não é erro.** Quando a bibliografia reconhece mais de uma forma culta, a engine registra variação aceita e não corrige uma forma válida para outra.
5. **Divergência é dado.** Se fontes qualificadas divergem, a regra recebe status `controversa` e deve apresentar a alternativa ao escritor em vez de produzir diagnóstico absoluto.
6. **Português brasileiro é o alvo.** Diferenças sistemáticas entre usos brasileiro e europeu precisam ser identificadas; a interface não deve impor padrão lusitano ao escritor brasileiro.
7. **Regra antes do código.** Nenhuma alteração normativa entra na engine sem caso positivo, caso negativo e caso-limite reproduzíveis.
8. **Explicabilidade.** Todo diagnóstico deve poder responder: o que foi encontrado, qual relação linguística está em jogo, por que importa e qual ação é possível.
9. **Sem corpus proprietário embarcado.** Obras protegidas podem servir para estudo e calibração, mas textos extensos, verbetes ou exemplos editoriais não são copiados para dados distribuídos pelo Escrevaral.
10. **Exemplos do produto são próprios.** Casos de teste e exemplos de UI devem ser produzidos especificamente para o Escrevaral ou ter licença compatível.

## Classes de conhecimento

| classe | tratamento no produto |
|---|---|
| `norma_consolidada` | diagnóstico objetivo quando a condição é comprovada |
| `variacao_aceita` | informa opções; não marca erro |
| `controversa` | apresenta divergência/critério; sem correção automática |
| `estilo` | descreve efeito provável; nunca chama de erro |
| `genero` | avalia adequação ao template/ofício selecionado |
| `lexico_contextual` | apresenta matizes e alternativas condicionadas ao contexto |

## Hierarquia operacional de evidência

A hierarquia não declara uma obra "superior" de forma absoluta; ela define o papel de cada fonte no Escrevaral.

1. **Gramática estrutural / sintaxe:** Cunha & Cintra; Evanildo Bechara.
2. **Dúvidas normativas e uso:** Evanildo Bechara, *Novo Dicionário de Dúvidas*.
3. **Pontuação normativa aplicada:** Cláudio Moreno, apoiada pela estrutura sintática das gramáticas.
4. **Pontuação estilística:** Noah Lukeman — exclusivamente como camada de efeito e ritmo, não como autoridade normativa do pt-BR.
5. **Sinonímia e precisão lexical:** Antenor Nascentes — matizes semânticos e adequação contextual, sem substituição cega.
6. **Coesão, coerência, figuras e interpretação:** Evanildo Bechara, *Compreender e interpretar os textos*.
7. **Tira-dúvidas/prática:** Dad Squarisi & Paulo José Cunha; Luiz Antonio Sacconi — fontes auxiliares, sempre confrontadas com a camada estrutural quando houver conflito.

## Matriz inicial das referências recebidas

| referência | domínio primário | engines candidatas | prioridade |
|---|---|---|---|
| Cunha & Cintra — *Nova gramática do português contemporâneo* | fonologia, morfologia, sintaxe, pontuação, variação | syntax, punctuation, lexical, analise | P0 |
| Bechara — *Lições de Português pela Análise Sintática* | sintaxe, concordância, regência, ordem, pontuação | syntax, punctuation, analise | P0 |
| Cláudio Moreno — *Guia prático do português correto: pontuação* | pontuação orientada pela estrutura sintática | punctuation, syntax | P0 |
| Bechara — *Novo Dicionário de Dúvidas da Língua Portuguesa* | dúvidas normativas, regência, flexão, variação | lexical, syntax, analise | P0 |
| Antenor Nascentes — *Dicionário de sinônimos* | sinonímia, matiz, precisão | lexical, precision | P0 |
| Bechara — *Compreender e interpretar os textos* | coesão, coerência, semântica, figuras, tipologia | analise, lexical, precision | P1 |
| Dad Squarisi & Paulo José Cunha — *1001 Dicas de Português* | consulta prática, ortografia, uso | analise, lexical, syntax | P1 |
| Luiz Antonio Sacconi — *Não Erre Mais* | norma culta, dúvidas recorrentes, uso brasileiro | analise, lexical, syntax | P2 |
| Noah Lukeman — *A arte da pontuação* | ritmo e efeito expressivo da pontuação | punctuation/analise em camada estilística | P1 |

## Contrato de uma regra calibrada

Cada regra nova ou revisada deve registrar, no código ou corpus de testes:

```ts
type LinguisticCalibrationRule = {
  id: string
  domain: 'orthography' | 'morphology' | 'syntax' | 'punctuation' | 'lexicon' | 'cohesion' | 'style' | 'genre'
  class: 'norma_consolidada' | 'variacao_aceita' | 'controversa' | 'estilo' | 'genero' | 'lexico_contextual'
  proposition: string
  conditions: string[]
  exceptions: string[]
  sources: string[]
  positiveCases: string[]
  negativeCases: string[]
  boundaryCases: string[]
  affectedEngine: string
  version: string
}
```

## Política de implementação

- Primeiro adicionar/ajustar a banca de calibração.
- Rodar a engine atual contra a banca.
- Classificar falhas em `falso positivo`, `falso negativo`, `ausência de cobertura` ou `divergência de fonte`.
- Corrigir somente a regra necessária.
- Não generalizar regex a partir de um exemplo único.
- Preferir sinal sintático já disponível no `syntax-engine` quando a decisão depende de sujeito, predicado, complementos, adjuntos, aposto, vocativo ou tipo de oração.
- Se a engine não dispõe do sinal estrutural necessário, registrar a lacuna antes de criar heurística textual frágil.

## Primeiros blocos de calibração

### C1 — Pontuação normativa + sintaxe

1. não separar sujeito e verbo;
2. não separar verbo e complemento integrado;
3. reconhecer vocativo e aposto explicativo;
4. tratar deslocamentos e intercalações;
5. tratar subordinadas adverbiais e coordenação;
6. separar escolha normativa de efeito rítmico.

### C2 — Concordância, regência e impessoalidade

- haver/fazer impessoais;
- existir pessoal;
- concordância nominal e verbal;
- regências de alta frequência;
- colocação pronominal com foco no português brasileiro e suas zonas de variação.

### C3 — Léxico contextual

- sinônimo como conjunto de candidatos com matiz;
- polissemia antes de sugestão;
- registro e campo semântico;
- bloquear substituição automática sem confirmação contextual.

### C4 — Coesão e coerência

- coesão referencial, sequencial e recorrencial;
- conectores e relações semânticas;
- repetição funcional versus repetição acidental;
- alertas de referência ambígua apenas quando houver evidência suficiente.

### C5 — Gêneros e templates

- calibrar `precision-engine` por propriedades observáveis de gênero/ofício;
- separar requisito estrutural, tendência editorial e preferência estilística;
- nenhum score sem explicação dos checks que o compõem.

## Definition of Done de um bloco

Um bloco de calibração só é encerrado quando:

- as proposições foram documentadas sem copiar a fonte;
- existe banca com positivos, negativos e limites;
- falsos positivos conhecidos estão explicitados;
- a engine passa a banca;
- a UI consegue explicar o diagnóstico;
- a mudança funciona offline;
- a fonte e a versão da calibração podem ser rastreadas.
