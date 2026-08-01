# M1 E2 — Inventário lexical reproduzível

Data: 2026-07-29

## Escopo

Esta auditoria mede as estruturas efetivamente carregadas pelo produto e pelo legado integrado. Ela não altera dados, não aumenta vocabulário e não transforma contagem em prova de qualidade.

Fontes medidas:

- `lexical-engine.js`;
- `lexical-data.json`;
- `norma-data.json`;
- `js/data/synonym-data.js`;
- `decolonial-data.json`;
- `rimalab-data.json`.

Reprodução:

```bash
cd mass-notes-next
npm run audit:lexicon
```

O comando gera relatórios completos em JSON e Markdown, incluindo linhas e textos de todas as definições repetidas.

## Baseline histórica versus medição efetiva

| Área | Declaração histórica | Medição efetiva |
|---|---:|---:|
| Entradas de sinônimos | ~1.350 | 1.343 |
| Definições | 1.020+ | 936 |
| Regras de polissemia | 110+ | 175 |
| Entradas contextuais | 600+ | 606 |
| Formas regulares no presente | 2.045 | 2.045 brutas / 2.028 normalizadas |
| RimaLab — enciclopédia | 50 | 50 |
| RimaLab — `grammarWords` | 348 | 407 |

A documentação histórica acerta a ordem de grandeza, mas não descreve a cobertura efetiva atual com precisão. Em particular, as 1.010 declarações brutas de definição resultam em apenas 936 chaves ativas.

## Cobertura complementar

- 7.766 alternativas brutas de sinônimos;
- 7.763 pares direcionados únicos após normalização;
- 527 entradas completas no léxico editorial local;
- 95 locuções brutas, 94 únicas após normalização;
- 2.000 formas verbais irregulares brutas, 1.936 normalizadas;
- 606 entradas de Contexto em nove categorias, todas estruturalmente completas;
- 1.685 alternativas contextuais;
- 50/50 verbetes completos na enciclopédia do RimaLab.

## P0 — definições sobrescritas silenciosamente

O bloco `DEFINICOES` contém:

- 1.010 declarações brutas;
- 936 chaves efetivas;
- 68 grupos com chave repetida;
- 74 declarações descartadas pela semântica normal de objetos JavaScript;
- zero grupos idênticos após a remoção segura de `quica`;
- zero grupos apenas equivalentes após normalização;
- **68 grupos com textos conflitantes**.

O lote seguro de `quica` removeu uma declaração idêntica sem alterar a definição efetiva. Os 68 grupos restantes são todos conflitantes e continuam bloqueados para revisão editorial em lotes separados.

A última ocorrência de cada chave é a única visível no runtime. As anteriores não aumentam cobertura e não podem ser contadas como definições disponíveis.

Exemplos de conflitos:

- `silencio`: três redações; a última substitui duas anteriores;
- `ironia`: quatro redações; a última substitui três anteriores;
- `eufemismo`: três redações;
- `enredo` e `climax`: três redações cada;
- `saudade`, `solidao`, `lacuna`, `metafora`, `hiperbole`, `analepse`, `prolepse` e outras entradas editoriais têm duas redações concorrentes.

Não é seguro remover todas as ocorrências anteriores sem revisão. Embora a remoção preserve o comportamento atual, algumas redações descartadas podem ser editorialmente melhores ou conter informação complementar.

## P1 — integridade lexical

### Autorreferências de sinônimos

Foram encontrados oito pares que retornam à própria entrada após normalização:

- `avo` → `avô`;
- `gaúcho` → `gaucho`;
- `anacoluto` → `anacoluto`;
- `canonico` → `canônico`;
- `autoficcao` → `autoficção`;
- `aguardar` → `aguardar`;
- `ansiar` → `ansiar`;
- `contundente` → `contundente`.

Alguns casos representam variante gráfica, não sinonímia. Eles precisam ser separados entre alias de busca e alternativa editorial.

### Aliases técnicos expostos

Quatro chaves com sufixo numérico aparecem como verbetes efetivos:

- `ode2`;
- `contemplar2`;
- `denso2`;
- `silencio2`.

Essas chaves devem ser auditadas como mecanismo técnico ou conteúdo público; não podem permanecer numa zona ambígua.

## P2 — qualidade e explicabilidade

- `leitor_modelo` possui definição vazia;
- quatro textos de definição efetivos são reutilizados por chaves diferentes;
- 124 das 175 regras de polissemia não têm cartão explícito de alternativas;
- há uma locução repetida após normalização: `a menos que`;
- listas morfológicas possuem diferenças entre volume bruto e formas normalizadas, que precisam ser tratadas como cobertura potencial, não como quantidade única.

A ausência de cartão de alternativas não significa automaticamente uma regra incorreta. Ela indica que a interface pode classificar sem tornar as leituras concorrentes igualmente transparentes.

## Decisões

1. não ampliar o vocabulário antes da estabilização da integridade;
2. não apagar definições conflitantes automaticamente;
3. conservar a última ocorrência como descrição do comportamento atual até revisão;
4. revisar primeiro as 68 colisões conflitantes por grupos editoriais;
5. separar alias ortográfico de sinônimo real;
6. impedir novas chaves duplicadas por auditoria de CI;
7. manter os relatórios completos regeneráveis, em vez de depender de artefato manual;
8. não declarar superioridade lexical global com base nesta contagem.

## Próxima tranche

- consolidar duplicatas em lotes pequenos, com comparação entre redações;
- criar testes para verbetes alterados antes da consolidação;
- corrigir autorreferências sem quebrar aliases de busca;
- decidir o destino das quatro chaves técnicas;
- preencher `leitor_modelo` ou removê-lo da cobertura declarada;
- só depois selecionar a primeira expansão lexical brasileira fundamentada.

## Fronteira de release

Este inventário não autoriza merge, promoção para `main`, lançamento público, Gate 14 ou substituição integral do produto legado.
