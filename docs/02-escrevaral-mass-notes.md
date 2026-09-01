# 02. Escrevaral Mass Notes (branch mass-notes-tiptap)

Fonte: `/home/rafamass/projetos/escrevaral-mass-notes/` (branch `mass-notes-tiptap`, clone de 14/ago/2026). É a variante "rigor técnico": reescreve o core em **TypeScript modular** (`mass-notes-next/`), sem substituir a main. Estado declarado: beta fechada `SHIP COM CONDIÇÕES`; lançamento público `NO-SHIP`; Gate 14 suspenso.

> Para o Encore: o que importa aqui é o **método e a morfologia verbal**, não o stack TS (que não roda em KitKat). Os dados/evidências são portáveis; o TS é redigido em ES5 com a mesma lógica.

---

## Core de valor

```
Feature: Morfologia verbal (verbMorphology) — O MAIS VALIOSO
O que faz: análise morfológica de verbos PT-BR — analisador simples, paradigmas regulares, léxico de irregulares, léxico de lemas, parsing de clíticos, construções compostas, resolução de contexto.
Formato/dados: 10 módulos TS (normalization, regularParadigms, irregularLexicon, verbLemmaLexicon, cliticParser, compoundConstructions, contextResolver, simpleAnalyzer, types, verbMorphologyAdapter). Família "infinitivo pessoal" validada 24/24 (precisão/recall/acurácia 100% no escopo declarado).
Fonte: mass-notes-next/src/engines/verbMorphology/
Reuso: SIM — a lógica/método migra para ES5 no Encore
```

```
Feature: Resolvedor lexical contextual (contextualLexicalResolver)
O que faz: desambigua lexical por contexto (escolhe o sentido/classe certo de uma palavra pelo entorno).
Fonte: mass-notes-next/src/engines/contextualLexicalResolver.ts
Reuso: SIM (lógica)
```

```
Feature: Provenirância de fontes / Biblioteca de Autoridade
O que faz: registra léxico/regras com fonte, escopo e licença verificáveis (schema v3); inventário lexical de 1008 declarações → 936 chaves efetivas e 66 grupos conflitantes; corpus de 9 obras registradas sem binários no repo.
Fonte: mass-notes-next/docs/sources/ e docs/linguistics/verb-provenance.json
Reuso: REFERÊNCIA (governança de dados do Encore)
```

```
Feature: Testes de adversarial + matriz integral
O que faz: 34 specs e2e (Playwright); avaliação separada por família verbal; matéria integral 182 cenários/navegador (364 execuções).
Fonte: mass-notes-next/tests/
Reuso: METODOLOGIA (o Encore valida por domínio, um engine por vez)
```

```
Feature: Engines adaptadas (adapter)
O que faz: adapta engines legadas (lexical, rimalab, voice, decolonial, review, proof, precision) para o core novo, com dados de suplemento (crase, verbos normativos, figuras, sinônimos curados, coesão, nuance lexical).
Fonte: mass-notes-next/src/engines/*Adapter.ts e *Supplement.ts
Reuso: REFERÊNCIA de contrato (traduzir para ES5)
```

---

### Dados para o Encore

- Inventário lexical com proveniência (936 chaves efetivas) — base sólida do léxico.
- Regras verbais verificadas com fonte — núcleo da morfologia do Encore.
- Método de "matriz integral + adversarial" — padrão de teste hipotético do Encore (um engine por vez).
