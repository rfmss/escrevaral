# Morfologia Verbal — Maturidade

**LEVEL:** M3 — TESTED
**VERSION:** 1.2.1
**LAST REVIEWED:** 2026-09-02
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
- Banca negativa de trechos intocados do legado: 9 casos — 7/9 antes da correção, 9/9 depois.
- Variação regional, registro e aceitabilidade: UNKNOWN.
- Banca humana independente: UNKNOWN.

## Quality
- Regressão legada: 14/14.
- Banca congelada da tranche: 12/12.
- Runtime serializado 1.2.1: 5/5.
- Sintaxe ES5 dos scripts de dispositivo: VERIFIED.
- Worker simulado com engine 1.2.0: VERIFIED.
- Gate físico da versão 1.1.0 no iPad MD531GP/A, iOS 9.3.5: VERIFIED.
- Gate físico da versão 1.2.0 no iPad MD531GP/A, iOS 9.3.5: VERIFIED — 12/12.
- Falsos positivos conhecidos fora da banca original: 2 reproduzidos (`deveres`, `olhares`) e corrigidos na banca negativa.
- Falsos positivos além das bancas atuais: UNKNOWN.
- Gate físico da versão 1.2.1: PENDING.

## Runtime
- Engine + seed + exceções + lemas + tokenizador: ~18.223 bytes.
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
- Versão 1.2.1: gate interno 9/9 negativo + 14/14 regressão + 12/12 tranche + 5/5 runtime; gate físico pendente.

## Highest-value gap
Executar o gate físico de 21 casos da versão 1.2.1. Depois, obter corpus externo e revisão humana; o legado já encontrou e eliminou dois falsos positivos.

## Evidence for current level
M3 permanece correto. A versão 1.2.1 possui regressão, banca de tranche e banca negativa verdes, mas o código corrigido ainda não atravessou o aparelho e não possui corpus externo nem validação humana. Nenhum nível foi pulado.

## Promotion candidate
M4 — ADVERSARIAL somente após:
1. gate físico 1.2.1;
2. corpus externo que não pertença à linhagem do projeto;
3. falso-positivos medidos nesse corpus;
4. revisão humana independente.

## Changelog
- 2026-08-31 — seed ES5, 14/14, tokenização e runtime serializado.
- 2026-09-01 — versão 1.1.0 aprovada fisicamente no iPad alvo; 36–48 ms após partida fria.
- 2026-09-01 — versão 1.2.0 porta a tranche de infinitivo pessoal do Mass Notes: 65 lemas core, regressão 14/14 e banca congelada 12/12; nível mantido em M3.
- 2026-09-01 — gate físico 1.2.0 aprovado no iPad alvo: 12/12; 4.774 ms na primeira passagem e 1.563–1.586 ms nas repetições; Worker descartado por caso.
- 2026-09-02 — banca negativa do legado reproduziu 2 falsos positivos em 9 casos (`deveres`, `olhares`); guarda nominal imediata corrigiu ambos; versão 1.2.1 fechou 9/9 + 14/14 + 12/12 + 5/5; gate físico pendente.
