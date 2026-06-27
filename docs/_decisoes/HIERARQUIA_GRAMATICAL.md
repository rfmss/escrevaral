# Hierarquia Gramatical do Escrevaral

**Data:** 2026-06-27
**Tipo:** referência técnica e linguística
**Status:** norma interna — orienta o lexical-engine.js e o uso de `decisao`

---

## Hierarquia de autoridade

Cada camada tem uma função diferente. Elas não devem ser fundidas.

| Camada | Autoridade | Uso |
|--------|-----------|-----|
| Interface escolar | NGB — vocabulário de base | O que a escritora lê na tela |
| Fundamentação | Bechara · Cunha & Cintra | O que explica a decisão |
| Camada técnica | Universal Dependencies (UD) | O que o motor usa internamente |

Quando divergirem: registrar a divergência, não apagá-la. Cada tradição tem fraquezas conhecidas.

---

## Tabela de conversão UD → escolar (interface)

| UD interno | Interface escolar | Exceção / cuidado |
|------------|------------------|-------------------|
| NOUN | Substantivo | — |
| PROPN | Substantivo próprio | Maiúscula é indício, não garantia |
| VERB | Verbo flexionado | — |
| AUX | Verbo auxiliar | Escolarmente ainda é "verbo" |
| ADJ | Adjetivo | — |
| ADV | Advérbio | — |
| PRON | Pronome | Subtipo varia muito (pessoal, relativo, indefinido…) |
| DET + PronType=Art | Artigo | Não confundir com pronome demonstrativo |
| ADP | Preposição | Contrações (do/ao/pelo) têm duas peças |
| CCONJ | Conjunção coordenativa | — |
| SCONJ | Conjunção subordinativa | — |
| NUM | Numeral | — |
| INTJ | Interjeição | — |
| PART | Partícula | Não tem equivalente escolar limpo; usar "Pronome" ou "Partícula" conforme caso |
| X | Desconhecido | Interface deve dizer "indeterminado", nunca substantivo por padrão |

---

## Estados de decisão (campo `decisao` em analyze())

```text
classificado  — fonte lexical direta confirma (localLexicon, lista fechada)
provavel      — regra morfológica ou POLISSEMIA resolvida por contexto
ambiguo       — POLISSEMIA sem contexto, ou className já expõe "ou"
indeterminado — palavra desconhecida sem contexto suficiente para inferir
```

Regra: o campo `decisao` só deve aparecer na interface quando há **contexto de frase disponível**. Palavra isolada quase sempre mente — `seca` sozinha é enigma; em frase, tem leitura mais provável.

---

## Trios de exemplos por regra existente

Formato: `regra | fonte | exemplo+ | exemplo− | exemplo ambíguo | quando dizer "provável" ou "ambíguo"`

---

### Pronomes pessoais retos (regra 1)

**Fonte:** Bechara §§ 163-165 · NGB  
**Set:** `PRON_PESSOAIS_RETOS` — eu/tu/ele/ela/nós/vós/eles/elas

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "Eu escrevi." | Pronome pessoal — classificado |
| ✗ | "ele" após artigo "o ele" | não ocorre em PB natural |
| ~ | "nós" como substantivo plural informal ("os nós do enredo") | ambíguo — mas marginal |

**Decisão:** sempre `classificado`. Lista fechada, sem ambiguidade relevante em PB.

---

### Artigos (regra 3)

**Fonte:** Bechara §§ 128-130 · NGB  
**Set:** `_ARTIGOS` — o/a/os/as/um/uma/uns/umas + contrações

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "o livro chegou" — prev=nulo, next=substantivo | Artigo — classificado |
| ✗ | "trouxe-o" — clítico pós-hífen | Pronome oblíquo, não artigo |
| ~ | "a" em "vou a São Paulo" | Preposição, não artigo — `decisao: "ambiguo"` sem contexto |

**Decisão:** `classificado` quando prev vazio e next é substantivo. `ambiguo` se `a` isolado sem contexto — pode ser preposição, artigo ou pronome.

---

### Preposições simples (regra 5 + _PREP_EXT)

**Fonte:** Bechara §§ 298-310 · NGB  
**Set:** de/em/por/para/com/sem/sob/sobre/ante/após/até/desde/entre/perante/mediante/através/acerca/diante/dentre

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "partiu de manhã" | Preposição — classificado |
| ✗ | "com" como início de frase exclamativa ("Com licença!") | Interjeição, não preposição — mas raro |
| ~ | "por" em "por que" vs "por causa de" | Preposição simples vs locução — `provavel` |

**Decisão:** `classificado` para lista fechada. `provavel` para "por" em contexto de interrogativa indireta.

---

### Sufixos nominais — substantivos (-ção/-são/-mento/-dade/-ade/-eza/-ura/-ismo/-ista)

**Fonte:** Cunha & Cintra §§ 73-80  
**Risco:** sufixo sugere, mas não garante

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "narração", "beleza", "firmeza" | Substantivo — provável |
| ✗ | "ação" em contexto de nome verbal — "a ação de escrever" | Correto como substantivo; mas "ação" pode ser verbo em outro contexto |
| ~ | "proteção" quando "protestar" tem "protestação" como alternativa arcaica | provável, não classificado |

**Decisão:** sempre `provavel`. Nunca `classificado` apenas por sufixo. Sufixo não exclui outros usos.

---

### Sufixos adjetivais (-oso/-osa, -ável/-ível, -ente/-ante, -ivo/-iva, -al, -ar)

**Fonte:** Bechara §§ 55-63  
**Risco:** formas em -al podem ser substantivos (jornal, canal, hospital)

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "corajoso", "amável", "brilhante" | Adjetivo — provável |
| ✗ | "canal", "jornal", "hospital" — terminam em -al mas são substantivos | cobertos pelo localLexicon — classificado |
| ~ | "natural" como substantivo ("o natural é diferente") | provável, não ambíguo: contexto resolve na maioria dos casos |

**Decisão:** `provavel` para sufixo adjetival. `classificado` apenas se localLexicon confirma.

---

### Verbos no infinitivo (sufixo -ar/-er/-ir)

**Fonte:** Bechara §§ 200-207  
**Risco:** "devagar" termina em -ar e não é verbo; "lar" é substantivo

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "escrever", "narrar", "sentir" | Verbo no infinitivo — provável |
| ✗ | "devagar" | Advérbio — exceção explícita na regra 20 |
| ✗ | "lar", "bar", "mar" | Substantivo — cobertos pelo localLexicon |
| ~ | "cantar" em título de música | Verbo no infinitivo é o mais provável, mas pode ser substantivo |

**Decisão:** `provavel` para sufixo. `classificado` só se localLexicon confirma ou contexto é claro.

---

### Verbos flexionados — VERBOS_PRES + formas passadas

**Fonte:** Bechara §§ 208-270  
**Sets:** `_VERBOS_PRES_SET` (2045 formas) · `_PERF_IRR_ISSE` · `VERBOS_ACENTUADOS`

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "chegou", "escreveu", "disse" | Verbo flexionado — classificado |
| ✗ | "chegou" como nome próprio (marginal) | Não tratado — aceitável |
| ~ | "foi" em "foi bom" (cópula) vs "foi embora" (movimento) | Verbo flexionado em ambos, mas função sintática difere |

**Decisão:** `classificado` quando em lista fechada de formas irregulares ou `_VERBOS_PRES_SET`. `provavel` quando inferido por terminação.

---

### POLISSEMIA — palavras com múltiplas classes possíveis

**Fonte:** Bechara §§ 12-15 (transposição de classe) · Cunha & Cintra §§ 48-52  
**Map:** `POLISSEMIA` — 59 entradas (que/se/como/tarde/claro/fundo/etc.)

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "tarde" após artigo "a tarde" | Substantivo — provável (contexto resolveu) |
| ✓ | "tarde" em "chegou tarde" | Advérbio — provável (contexto resolveu) |
| ~ | "tarde" sem contexto | ambíguo — ambos são possíveis |

**Regra:** com texto → `provavel`. Sem texto → `ambiguo`. A interface só deve mostrar a ambiguidade quando `text` está disponível e o contexto ainda não discrimina.

---

### Fallback para substantivo (palavra desconhecida)

**Risco:** maior fonte de falsos positivos

| | Exemplo | Resultado esperado |
|--|---------|-------------------|
| ✓ | "xyzwq" | indeterminado — palavra desconhecida |
| ✗ | "streetwear", "selfie" | indeterminado — estrangeirismo não curado |
| ~ | topônimo novo ou nome próprio não curado | indeterminado, não substantivo presumido |

**Decisão:** sempre `indeterminado`. Nunca `classificado` por padrão para palavra desconhecida.

---

## Regras de ouro (síntese)

1. Sufixo sugere, não classifica. Fonte lexical classifica.
2. Palavra isolada mente mais do que palavra em frase.
3. `ambiguo` não é erro do motor — é honestidade sobre a língua.
4. `indeterminado` é preferível a um `classificado` falso.
5. A interface fala como NGB; o motor pensa como UD; a explicação cita Bechara.
6. Antes de criar nova regra: trio de exemplos + fonte gramatical + regressão.
7. Não punir variedade brasileira ou registro literário como erro.

---

## Próximos passos (quando houver evidência)

- [ ] Integrar `decisao` na UI do Léxico — só quando `text` disponível e `decisao === "ambiguo"`
- [ ] Tabela de conversão UD → escolar mais granular para subtipos de pronome
- [ ] Corpus de validação manual (frases com gabarito comentado)
- [ ] Trio de exemplos para as 59 entradas de POLISSEMIA (prioridade: as 15 mais frequentes)
