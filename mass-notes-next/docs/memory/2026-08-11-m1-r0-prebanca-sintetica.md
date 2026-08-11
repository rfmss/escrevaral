# M1-R0 — pré-banca sintética antes da comunidade humana

Atualizado em: 2026-08-11  
Branch de trabalho: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Sintaxe de produção: `not_authorized`  
Validação humana independente: ainda não realizada

## CLARO

### C — cenário

A primeira fronteira sintática já possui corpus observado, continuidade documental reconstruída, um pool de 67 candidatos intersentenciais, protocolo cego e pacotes privados preparados. O passo anteriormente previsto era convocar imediatamente dois anotadores humanos independentes.

Para a fase atual do Escrevaral, porém, mobilizar uma comunidade humana ainda é prematuro. O protocolo, os rótulos, os critérios de confiança e os casos difíceis precisam amadurecer antes de consumir atenção humana em escala.

A estratégia passa a incluir uma **pré-banca sintética explícita**, executada por LLMs e tratada como instrumento de pesquisa, nunca como pessoa humana ou gold linguístico.

### L — limites e riscos

A pré-banca sintética:

- não conta como validação humana;
- não cria gold humano;
- não aumenta a dimensão `Validação humana e acadêmica` da Eva;
- não autoriza estado `verified`;
- não prova consenso acadêmico;
- não substitui uma banca humana independente quando o fenômeno estiver maduro;
- não autoriza `main`, Gate 14 ou lançamento;
- não permite versionar corpus observado bruto ou filas privadas do Porttinari.

Os principais riscos são correlação entre modelos, excesso de confiança, reprodução do mesmo viés em vários perfis e transformação indevida de consenso sintético em verdade linguística. Por isso, consenso sintético serve para triagem e maturação de protocolo, não para apagar ambiguidade.

### A — arquitetura escolhida

Foram estudados projetos existentes no GitHub para evitar reinventar o fluxo:

- `refuel-ai/autolabel`, revisão `404dcd014276b343ce6653670c0f75778e392e11`, licença MIT: referência operacional para configuração explícita, dry-run, rótulos estruturados, confiança, explicação e encaminhamento de casos difíceis;
- `HumanSignal/label-studio`, revisão `f010f38324df5d15cecd32358bb64b67079491d8`, licença Apache-2.0: possível superfície futura para anotação humana/comunitária, pre-label e integração por API.

Nenhum desses projetos foi incorporado como dependência do produto nesta tranche e nenhum código de terceiros foi copiado. O Escrevaral implementa um harness mínimo próprio, adequado à sua governança.

O painel sintético inicial possui três perfis independentes por prompt:

1. `s1_contextual_conservative` — exige evidência textual forte;
2. `s2_discourse_referent` — examina continuidade e referência discursiva;
3. `s3_adversarial_ambiguity` — procura leituras concorrentes e excesso de confiança.

Os três recebem somente:

- ID cego derivado;
- contexto anterior textual;
- sentença-alvo;
- forma verbal-alvo.

Eles não recebem relações UD, split, bucket estrutural, manifesto, sinais do minerador ou resposta dos demais julgadores.

Os rótulos continuam sendo:

- `subject_recoverable`;
- `subject_indeterminate`;
- `subject_ambiguous`;
- `explicit_subject_control`;
- `outside_initial_scope_or_annotation_issue`.

Cada julgamento registra confiança, escopo de recuperação, referente mínimo quando houver, justificativa curta e flags. O relatório calcula unanimidade, consenso provisório, acordo bruto, Cohen's kappa e matrizes de confusão **sempre identificados como sintéticos**.

A execução v1 é model-agnostic. Ollama local é o caminho padrão; endpoint OpenAI-compatible existe como opção. Endpoints remotos ficam bloqueados por padrão e exigem opt-in explícito. Cada execução registra provider e modelo para permitir comparação posterior.

### R — resultado reproduzível do instrumento

A auditoria original do harness comprova:

```text
M1-R0 pré-banca sintética: 3 perfis
Rótulos contratados: 5
Payload estrutural ocultado: true
Gold humano produzido: false
Validação humana produzida: false
Auditoria da pré-banca sintética aprovada: cegamento, consenso e fronteira humano/sintético íntegros.
```

A auditoria não chama modelo externo nem usa corpus protegido. Ela usa caso inteiramente original e testa cegamento, contrato de saída, consenso estável/provisório, encaminhamento para revisão e métricas por pares.

### O — aberto

1. auditar licença, privacidade e competência pt-BR dos modelos candidatos antes de eleger uma baseline;
2. recuperar ou regenerar deterministicamente o pacote privado de 16 casos a partir do pool observado;
3. rodar o painel sintético em modelos registrados;
4. medir consenso, acordo, kappa e confusões sintéticas;
5. preservar baixa confiança e desacordos como material prioritário de pesquisa;
6. refinar rótulos e protocolo sem abrir a avaliação lacrada;
7. convocar Eva Chara sobre a pré-banca;
8. decidir se há maturidade para um primeiro teste vermelho **experimental** de Sintaxe;
9. manter a banca humana independente para uma fase posterior, antes de `verified` ou de qualquer alegação de excelência;
10. quando protocolo e interface estiverem maduros, avaliar Label Studio ou ferramenta equivalente para a comunidade.

## Nova sequência de maturidade

```text
pool observado
        ↓
pré-banca sintética cega
        ↓
consenso / discordância / baixa confiança sintéticos
        ↓
refino do protocolo
        ↓
banca Eva
        ↓
implementação experimental + avaliação separada, se autorizada
        ↓
banca humana independente quando madura
        ↓
comunidade de anotação quando protocolo e interface estiverem estáveis
        ↓
verified somente com a evidência humana pertinente
```

## Regra de interpretação

Automatizar cedo reduz desperdício de atenção humana; **não reduz o padrão final de evidência**. Um painel de LLMs pode revelar instabilidade, produzir hipóteses e priorizar casos, mas não deve ser contabilizado como comunidade, especialista, consenso humano ou aprovação acadêmica.
