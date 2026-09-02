# Morfologia Verbal — Maturidade

**LEVEL:** M3 — TESTED
**VERSION:** 1.2.0
**LAST REVIEWED:** 2026-09-01
**STEWARD:** ainda não nomeado

## Mission
Identificar morfologia verbal do português brasileiro em ES5 de baixa RAM, com posições preservadas e execução em uma cápsula descartável por vez.

## Coverage
- 11 formas curadas no trie;
- 4 exceções explícitas;
- 65 lemas core;
- primeira tranche contextual: infinitivo pessoal regular;
- distinções delimitadas com infinitivo impessoal, substantivado e futuro do subjuntivo.

Cobertura total do português: UNKNOWN.

## Knowledge
- Infinitivo pessoal: VERIFIED no Mass Notes dentro da banca upstream declarada; PORTED no Encore.
- Base ES5 Antigravity: origem inventariada; commit exato ainda ausente.
- Demais famílias: pending ou partial.
- Proveniência detalhada: `PROVENANCE.json`.

## Corpus
- Regressão legada: 14 casos — VERIFIED.
- Banca congelada de infinitivo pessoal: 12 casos — VERIFIED no runner local.
- Casos positivos da banca: 8.
- Fronteiras negativas da banca: 4.
- Variação regional, registro e aceitabilidade: UNKNOWN.
- Banca humana independente: UNKNOWN.

## Quality
- Regressão legada: 14/14.
- Banca congelada da tranche: 12/12.
- Runtime serializado anterior: 5/5.
- Sintaxe ES5 dos scripts de dispositivo: VERIFIED.
- Worker simulado com engine 1.2.0: VERIFIED.
- Gate físico da versão 1.1.0 no iPad MD531GP/A, iOS 9.3.5: VERIFIED.
- Gate físico da versão 1.2.0 no iPad MD531GP/A, iOS 9.3.5: VERIFIED — 12/12.
- Known false positives fora da banca: UNKNOWN.

## Runtime
- Engine + seed + exceções + lemas + tokenizador: ~17.404 bytes.
- Uma engine por Worker; Worker terminado após a resposta.
- Peak RAM: não mensurável diretamente no Safari legado; descarte observável.
- Versão 1.1.0 no iPad:
  - partida fria: 2.310 ms;
  - repetições: 36–48 ms;
  - offline após primeiro carregamento: VERIFIED.
- Versão 1.2.0 no iPad:
  - banca completa: 12/12;
  - primeira passagem: 4.774 ms;
  - repetições: 1.586, 1.571 e 1.563 ms;
  - mediana das repetições: 1.571 ms para 12 Workers descartáveis (~131 ms/caso, incluindo criação, carga, análise e descarte);
  - reabertura offline específica desta versão: não repetida nesta sessão.

## Highest-value gap
Procurar falso-positivos fora da banca congelada e obter revisão humana independente. A execução física já deixou de ser o gargalo.

## Evidence for current level
M3 permanece correto. A tranche tem proveniência, regressão, banca congelada verde e gate físico 12/12 no aparelho-alvo, mas ainda não possui corpus adversarial independente nem validação humana. Nenhum nível foi pulado.

## Promotion candidate
M4 — ADVERSARIAL somente após:
1. corpus adicional que não tenha orientado a implementação;
2. falso-positivos medidos;
3. revisão independente.

## Changelog
- 2026-08-31 — seed ES5, 14/14, tokenização e runtime serializado.
- 2026-09-01 — versão 1.1.0 aprovada fisicamente no iPad alvo; 36–48 ms após partida fria.
- 2026-09-01 — versão 1.2.0 porta a tranche de infinitivo pessoal do Mass Notes: 65 lemas core, regressão 14/14 e banca congelada 12/12; nível mantido em M3.
- 2026-09-01 — gate físico 1.2.0 aprovado no iPad alvo: 12/12; 4.774 ms na primeira passagem e 1.563–1.586 ms nas repetições; Worker descartado por caso.
