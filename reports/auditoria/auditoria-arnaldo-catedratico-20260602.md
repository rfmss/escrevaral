# Auditoria Arnaldo Figueiredo — Catedrático — v381 (2026-06-02)

## Persona

Arnaldo Figueiredo, 61 anos. Professor titular de Língua Portuguesa (UFMG). Especialista em morfossintaxe. Testa engines, não UI.

## Metodologia

24 frases do corpus `scripts/corpus-catedratico.txt` — 7 zonas de risco.  
Engines testadas: Sintaxe (`syntaxEngine.analisarMorfologia`), Pontuação (`VeredaPunctuation.analyze`), RimaLab (`VeredaRimaLab.analyze`).

## Placar geral: 18/24 (75%)

| Zona | Resultado | Detalhe |
|---|---|---|
| Adjetivos sem sufixo | 3/5 ⚠️ | "certas" falso-positivo; "nobre" sem tag |
| Pronomes possessivos | 3/3 ✅ | meu/teu/nossa corretos |
| Ordinais | 3/3 ✅ | primeiro/terceira/décima como Numeral |
| Interjeições | 3/3 ✅ | ei/ah/ufa corretos |
| Diacríticos | 2/2 ✅ | lá/cá/então corretos após fixes históricos |
| Pontuação literária | 4/4 ✅ | travessão, fragmento, ponto-e-vírgula — sem falsos positivos |
| RimaLab | 0/4 ❌ | frases de prosa não detectam rima interna |

## Achados específicos

### A1 — "certas" classificado como Pronome/Substantivo (falso positivo)
- **Frase:** "Ela tinha um jeito triste de dizer as coisas certas."
- **Obtido:** `['Pronoun','Noun']` — "certas" está em `PRONOMES_INDF`
- **Gabarito:** Adjective
- **Causa:** `PRONOMES_INDF` inclui "certas" (de "certo/certa") — conflito com adjetivo
- **Fix:** remover "certas"/"certos" do PRONOMES_INDF; deixar apenas "certo/certa" como pronome

### A2 — "nobre" sem tag (lacuna de cobertura)
- **Frase:** "Havia algo nobre na forma como ele errava."
- **Obtido:** `[]`
- **Gabarito:** Adjective
- **Causa:** adjetivo sem sufixo canônico, não está em ADJETIVOS_PRIM
- **Fix:** adicionar "nobre/nobres" ao ADJETIVOS_PRIM — caso de alta frequência literária

### R1 — RimaLab não detecta rima em prosa lírica
- **Frases:** "A chuva cai e vai e trai quem fica." etc.
- **Obtido:** scheme='?', pairs=0 — engine detecta como prosa (isProse heuristic)
- **Gabarito:** detectar rima interna em verso único ou prosa poética
- **Causa:** `detectarProsa()` classifica linhas longas como prosa → retorna early sem analisar rima
- **Decisão PO:** limitação conhecida e documentada; RimaLab é para poesia em versos, não prosa poética. Não alterar — adicionar nota na UI quando `isProse=true`.

## Decisões

- **A1 (certas/certos):** fix simples — remover de PRONOMES_INDF — implementar
- **A2 (nobre):** adicionar ao ADJETIVOS_PRIM — implementar
- **R1 (RimaLab prosa):** manter comportamento atual; documentar limite

## Próximo

Aplicar A1 e A2 em norma-data.json ou syntax-engine.js.
