# 12. Lição Aprendida — Scaffold com Agents (padrão do Antigravity)

Lição de processo documentada a partir de `/home/rafamass/Área de trabalho/2027/escrevaral-antigravity-starter/`. **Referência de reuso** — NÃO executada no Encore (decisão do dono: documentar primeiro; só materializar agents quando houver código/engines reais).

---

## O modelo (como o Antigravity fez)

Constelação de agents + regras + modelo de maturidade, dividido em camadas:

```
.agents/
  rules/                    → regras transversais (Always On)
    00-canon.md             → constituição: CANON > SPEC > ROADMAP > WORKSHOP > tarefa
    05-context-isolation.md → só usa arquivos do projeto (nada de histórico externo)
    10-linguistic-integrity.md → knowledge/analyzer/testes: norma vs descrição vs estilo
    15-engine-maturity.md   → stewards são curadores, maturidade só sobe com evidência
    20-legacy-runtime.md    → piso Android 4.4/API19, iPad legado, ES5, offline
    30-testing.md           → GREEN requer evidência; nunca apagar teste p/ verde
    40-git-integration.md   → commits pequenos, worktree, Integration Gatekeeper
    ORCHESTRATOR.md         → (modelo antigo) ciclos semanais, registry, veto powers
    STEWARDSHIP.md          → (modelo antigo) ciclo semanal, promoções, penalidades
  agents/
    conductor/agent.md      → interface operacional única (mainAgent)
    <dominio>-steward/agent.md → 15 stewards de domínio linguístico (ortografia→estilometria)
    <especialista>/agent.md → chief-linguist, rule-researcher, exception-hunter,
                              corpus-builder, adversarial-reviewer, test-builder,
                              runtime-engineer, legacy-reviewer, editorial-reviewer,
                              integration-gatekeeper, artifact-writer, cognitive-ergonomics-reviewer
  registry/stewards.json    → painel: domínio, agent, since, last_check, level, status
```

`.opencode/agents/owner-auditor.md` → **segunda cabeça read-only** do dono (mode primary, edit deny, bash ask).

## Peças-chave reaproveitáveis

### Conductor = interface única (anti-burocracia)
> O usuário não deve operar agents, escolher especialistas ou executar a burocracia do Workshop. O Main Agent/Conductor transforma intenção de alto nível em fluxo operacional e usa especialistas internamente. Nunca transfira ao usuário a escolha/coordenação.

### Owner-Auditor = verificação independente (epistemologia)
> Segunda cabeça read-only. Não edita. Audita o Conductor. Separa VERIFIED / INFERRED / UNKNOWN. Declara flagrantes: overclaim, teste que prova menos que o relatório, decisão arquitetural disfarçada de fato, conhecimento não verificado vira contrato, complexidade prematura.
> `CODE_PRESENT != FUNCTIONALLY_TESTED != HOST_TESTED != LEGACY_TESTED`; `CANDIDATE != VERIFIED`; `OOV != erro`.

### Modelo de maturidade (M0–M7) — o coração anti-Illusão de progresso
```
M0 SEED → M1 SPECIFIED → M2 GROUNDED → M3 TESTED → M4 ADVERSARIAL
→ M5 RUNTIME READY → M6 LEGACY READY → M7 MATURE
```
- Níveis não podem ser pulados.
- Maturidade SÓ sobe com evidência verificável; sem evidência → NO PROMOTION.
- UNKNOWN é preferível a dado inventado.
- PROMOÇÃO requer registro: CURRENT, TARGET, EVIDENCE, FILES, CORPUS, TESTS, ADVERSARIAL, LEGACY, RISKS, INDEPENDENT REVIEW.

### Persistência de artefatos (anti-chat-como-memória)
> Conversas NÃO são memória institucional. Estado verdadeiro = o persistido no repo. Toda tarefa que cria/altera artefato: grava → verifica no filesystem → lê → só então reporta sucesso. Proibido declarar EXISTS/PROMOTED/PERSISTED sem verificação do filesystem.

### Decisão por DEFINIÇÃO, decisão de dono é do dono (epistemologia)
- Diferencie: fonte humana / norma / descrição / estilo / preferência editorial.
- Um agente nunca pesquisa, aprova e integra sozinho regra crítica.
- Ninguém aprova sozinho regra normativa que acabou de produzir.

## O que NÃO copiar (a@rmadilha)
- **Burocracia prematura**: 15 stewards + 12 especialistas com 0 código é complexidade ornamental (regra 1 do antiprompt). Stewards só valem quando há engines reais para curar.
- Dois modelos sobrepostos de orquestração (ORCHESTRATOR/STEWARDSHIP antigo + Conductor novo) → conflito/duplicação. Manter um só.
- `.agents/` (formato próprio) vs `.opencode/agents/` (executável) duplicados → fonte de verdade ambígua.

## Recomendação de reuso para o Encore
1. Começar com **2 agents apenas** (acima): Conductor (executa) + Owner-Auditor (reedit).
2. Adotar o **modelo M0–M7** como régua de honestidade por engine desde o início.
3. Adotar **persistência de artefatos** + **epistemologia VERIFIED/INFERRED/UNKNOWN** no AGENTS.md.
4. Eleger um único orchestrator (reutilizar o padrão Conductor novo; descartar ORCHESTRATOR/STEWARDSHIP).
5. Dave os stewards por domínio só quando o engine correspondente ganhar um mínimo de corpo real.
```

> Status: DOCUMENTADO (regra 7 do antiprompt — intuição → método). Não executado. Reavaliar quando o Encore tiver sua primeira engine.
