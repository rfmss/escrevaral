# Banca crítica — continuidade, manual e agência

**Data:** 2026-06-17  
**Objeto:** crítica por pares do `MANUAL_DE_CONTINUIDADE` e da `AGENCIA_CONTINUIDADE`

---

## Composição da banca

- Direção de produto
- Arquitetura de informação
- UX writing
- Frontend de superfície
- Governança operacional
- QA / risco

---

## Deliberação resumida

A banca entendeu que o manual e a agência estavam bons como orientação de espírito, mas ainda incompletos como sistema de continuidade autônoma.

O diagnóstico comum foi:

- havia visão, mas faltava governança
- havia direção, mas faltava critério de parada
- havia backlog, mas faltava estado operacional mais rígido
- havia autonomia, mas faltava limite explícito para decisões que não podem ser tomadas no escuro

---

## Críticas por par

### Par 1 — Produto + IA

**Crítica:** o manual dizia “como pensar”, mas não dizia com clareza suficiente quem pode decidir mudanças grandes sem coordenação.

**Furo:** risco de um agente confundir convicção com permissão.

**Correção aplicada:** seção `Quem decide o quê` adicionada ao manual.

### Par 2 — UX writing + arquitetura de informação

**Crítica:** a continuidade estava descrita em termos bonitos, mas faltava forma de provar que uma mudança realmente melhorou a experiência.

**Furo:** qualquer agente poderia declarar vitória sem critério observável.

**Correção aplicada:** seção `Como provar que uma melhoria melhorou`.

### Par 3 — Operação + QA

**Crítica:** faltava regra de parada.

**Furo:** agentes criativos demais tendem a transformar boa rodada curta em refactor ansioso.

**Correção aplicada:** seção `Regra de parada` no manual e `Critério de parada` nas pílulas da agência.

### Par 4 — Governança + produto

**Crítica:** faltava dizer o que não deve ser automatizado por impulso.

**Furo:** áreas delicadas como autoria, direitos, voz e classificação moral do texto poderiam escorregar para excesso de zelo algorítmico.

**Correção aplicada:** seção `O que não automatizar por impulso`.

### Par 5 — Continuidade + handoff

**Crítica:** o backlog tinha direção, mas ainda não tinha estados operacionais suficientes.

**Furo:** pílulas poderiam ficar esquecidas, duplicadas ou “meio abertas”.

**Correção aplicada:** `Estados possíveis de uma pílula` e `Ritual mínimo da agência`.

---

## O que não estava sendo dito

1. Nem toda autonomia é desejável.
2. Nem toda melhoria precisa virar código.
3. Nem toda ideia boa merece a rodada atual.
4. Continuidade sem governança vira deriva elegante.
5. Criatividade sem condição de parada parece visão, mas costuma virar inflação.

---

## Decisão da banca

O sistema de continuidade do Escrevaral passa a ter duas camadas obrigatórias:

1. **espírito**
   no `MANUAL_DE_CONTINUIDADE`

2. **operação**
   na `AGENCIA_CONTINUIDADE`

Nenhuma das duas basta sozinha.

---

## Implementações decorrentes desta banca

- reforço do manual com governança, prova de melhora, regra de parada e limites de automação
- reforço da agência com ritual, estados e donos temporários

---

## Próximo risco conhecido

Agora que existe governança, o próximo risco é o oposto:

- burocratizar demais a continuidade

Regra prática:

se o agente gastar mais energia descrevendo o trabalho do que executando uma pílula pequena e segura, o sistema endureceu demais.
