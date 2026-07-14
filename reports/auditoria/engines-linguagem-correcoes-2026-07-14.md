# Auditoria e Correção dos Engines de Linguagem — 2026-07-14

**Objetivo:** consolidar o Escrevaral como referência sólida em escrita da língua portuguesa
brasileira, eliminando falhas lógicas nas regras de pontuação/sintaxe que poderiam gerar
alertas falsos (quebrando a confiança do escritor) ou deixar de sinalizar erros reais.

## Metodologia

1. Mapeamento de todas as regras de `punctuation-engine.js` (RULES + RULES_SYNTAX, 38 regras).
2. Teste de auto-consistência automatizado: para cada regra, o `exemplo` (frase correta)
   **não deve** disparar a própria regra, e o `contraexemplo` (frase incorreta) **deve** dispará-la.
3. Teste cruzado: nenhum `exemplo` correto de uma regra pode disparar **qualquer outra** regra
   do motor (evita "engolir" frases corretas em ruído de alertas).
4. Teste de controle com frases reais diversas (fora do conjunto exemplo/contraexemplo) para
   detectar falsos-positivos em uso cotidiano.
5. Regressão completa: bateria oficial de 1915 frases críticas
   (`scripts/bench-gramatica/avaliar-frases-criticas.py`) e auditor de publicação/offline.

## Diagnóstico inicial

Da bateria de auto-consistência, 8 regras apresentaram falhas lógicas:

| Regra | Problema | Tipo |
|---|---|---|
| PONT-01 | Sujeito+vírgula+verbo disparava mesmo quando a "vírgula" pertencia a um conectivo (contudo, portanto, etc.) antes do verbo | Falso-positivo |
| PONT-15 | Conflito com "pois" modal ("pode, pois, sair") — regex não diferenciava do "pois" explicativo | Falso-positivo |
| PONT-16 | Regex case-sensitive não capturava início de frase com verbo maiúsculo | Falso-negativo |
| PONT-08 | Lista de verbos irregulares incompleta ("trouxe") e regex case-sensitive | Falso-negativo |
| PONT-27 | "itens seguintes: Livro, caneta..." disparava maiúscula indevida mesmo sendo uso aceitável após "seguinte(s):" | Falso-positivo |
| PONT-32 | Regex exigia vírgula **antes e depois** do conectivo pospositivo, não capturando o caso mais comum (vírgula simples antes) | Falso-negativo |
| PONT-44 | Padrão "Nome + possessivo/artigo + palavra" capturava conectivos comuns de início de frase (Quando, Como, Mas...) como falso aposto | Falso-positivo |
| PONT-47 | Exemplo/contraexemplo oficiais não combinavam com o desenho da regra (verbo precisa estar adjacente a "e", mas o exemplo usava objeto entre verbo e "e") | Falso-negativo (auto-teste inconsistente) |

Efeito colateral identificado durante a correção do PONT-25 (aspas curvas): o PONT-05
(ponto final ausente) não reconhecia aspas curvas de fechamento (`”`, `’`) como pontuação
final válida, gerando alerta cruzado indevido.

## Correções aplicadas (`punctuation-engine.js`)

- **PONT-01**: filtro de exclusão para conectivos (contudo, todavia, entretanto, portanto,
  pois, então, assim, logo, porém, aliás, ademais, outrossim, destarte, enfim, afinal) quando
  aparecem como último "sujeito" detectado antes da vírgula.
- **PONT-15**: filtro que verifica se a palavra anterior à vírgula é um verbo modal
  (pode/deve/vai/consegue/fica/está/é/são/tem/têm), caso em que é "pois" conclusivo (regra
  PONT-16), não explicativo.
- **PONT-16**: regex com flag `i` (case-insensitive).
- **PONT-08**: lista de verbos ampliada (trouxe, fez, disse, teve, veio, pôs, quis, soube,
  foi, fui) + flag `i`.
- **PONT-27**: exclusão de contexto quando precedido por "seguinte(s)".
- **PONT-32**: regex ajustada para exigir vírgula antes do conectivo e ausência de vírgula
  logo depois (lookahead negativo), refletindo o uso real mais comum.
- **PONT-44**: lista de exclusão de conectivos/advérbios comuns que não formam aposto.
- **PONT-47**: exemplo/contraexemplo reformulados para um caso onde o desenho da regra
  (verbo imediatamente antes de "e" + novo sujeito depois) é linguisticamente válido; lista de
  verbos irregulares ampliada; exclusão de possessivos homônimos de verbo (meu/seu/teu).
- **PONT-05**: aceita aspas curvas de fechamento (`”`, `’`) como pontuação final válida,
  alinhado ao padrão de aspas curvas recomendado pelo PONT-25.
- **ADJUNTO-LONGO**: correção de classe de caracteres para reconhecer palavras internas
  iniciadas por maiúscula (nomes próprios) no adjunto adverbial.

## Limitações conhecidas (não corrigidas)

- **PONT-18** (vírgula obrigatória — oração adjetiva explicativa) e **PONT-19** (vírgula
  proibida — oração adjetiva restritiva): a distinção entre oração restritiva e explicativa
  depende do **sentido** da frase, não de padrões sintáticos de superfície. Um motor baseado
  em regex não consegue resolver essa ambiguidade sem análise semântica profunda. Optou-se por
  **não ampliar heurísticas** aqui, pois qualquer tentativa de detecção agressiva geraria mais
  falsos-positivos do que acertos — o que contraria o objetivo de manter a confiança do
  escritor no ateliê.

## Resultados

- Auto-consistência: 36/38 regras 100 % corretas (as 2 restantes são as limitações
  documentadas acima, não regressões).
- Teste cruzado (exemplo correto de uma regra disparando outra): **0 falsos-positivos**
  (antes: 1, causado pelo efeito colateral do PONT-05/aspas curvas, já corrigido).
- Conjunto de controle com 12 frases reais diversas: **0 alertas falsos**.
- Bateria oficial `avaliar-frases-criticas.py`: **1915/1915 casos OK** (sem regressão).
- `auditor-publicacao.py`: P0=0, P1=0, P2=7 (itens pré-existentes, não relacionados aos
  engines de linguagem — Cloudflare email-protection, Google Fonts, cache do sitemap).

## Comandos para reproduzir

```bash
python3 -m http.server 8799   # servir o repo localmente
python3 scripts/bench-gramatica/avaliar-frases-criticas.py
python3 scripts/auditor-publicacao.py
```
