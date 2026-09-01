# Proposta de Prioridade de Porting (para decisão do dono)

Critérios combinados desta proposta (você pode alterar):
1. **Maturidade da origem** (muita evidência + fácil portar = entra cedo).
2. **Necessidade do produto** (docs/10: o editor e as 10 engines do núcleo).
3. **Trade-off baixa RAM** (dados pesados = mais tarde/sob demanda).

## Relatório de decisão — significado dos critérios
- "Portar" aqui = trazer **comportamento/dados** para a forma de engine ES5 do Encore (contrato `check(snapshot, done)` → `Finding[]`), seguindo a origem madura indicada no mapap[por-domínio].
- Cada engine que entra ganha `src/core/engines/<domínio>.js` + `knowledge/<domínio>/MATURITY.md` (M0 seed) e sobe de nível por evidência.

## Prioridade proposta (ondas)

### Onda 1 — base do editor (bloqueia tudo)
| Engine | Origem madura | Por quê primeiro |
|---|---|---|
| **Morfologia verbal** | C antigravity (ES5, M6) + B mass-notes (lemas) | Já temos esqueleto; é a fundação para sintaxe/análise |
| **Léxico / classes** | C antigravity (lexicon shards O(1)) | Editor precisa colorir/classificar palavras; é o "dicionário" leve |

### Onda 2 — revisão da norma (o que o escritor mais usa)
| Engine | Origem madura | Por quê |
|---|---|---|
| **Sintaxe / função** | C antigravity (M6) + A escrevaral (85-100%) | Coração da análise; base p/ pontuação sintática |
| **Pontuação** | A escrevaral (40 regras, 100%) | Bebê uso diário de quem escreve |
| **Análise literária** | A escrevaral (39 critérios) | O "relatório" que o editor entrega |

### Onda 3 — expressividade (diferencial do produto)
| Engine | Origem madura | Por quê |
|---|---|---|
| **Rima / métrica** | A escrevaral (100%) | Diferencial p/ poetas |
| **Voz / estilística** | A escrevaral (100%) | "Espelho de voz" — assinatura do escritor |
| **Decolonial / termos** | A escrevaral (100%) | Diferencial de contexto |

### Onda 4 — autoria e portabilidade
| Engine | Origem madura | Por quê |
|---|---|---|
| **Prova de autoria** | E eskrev (ECDSA) + A (ritmo) | O "cartório"; exige decisão de pré-cadastro |
| **Export/import** | A escrevaral | Fecha o fluxo do produto (TXT/MD/HTML/EPUB/DOCX) |

### Onda 5 — resolver o trade-off do dicionário grande
| Engine | Origem madura | Decisão pendente do dono |
|---|---|---|
| **Dicionário 360k** | E eskrev (~38 MB) | Escolher: shards sob demanda (piso) vs. delay de carregamento vs. léxico curado pequeno do D uairer. DECISÃO humana (valores/limites de device) |

## Decisão que preciso de você agora
Quero sua palavra sobre duas coisas (regra 8 — são decisões de produto, não minhas):

1. **Começo pela Onda 1?** (Morfologia + Léxico) — ou prefere outra ordem (ex.: começar pelo que mais aparece na sua escrita no dia a dia)?
2. **Dicionário grande**: qual caminho você prioriza para o Encore — cobertura total sob demanda (shards) ou léxico curado e leve (uairer)?
