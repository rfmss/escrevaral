# Contrastes M02 — matriz anterior às regras novas

Base v6.50, cb50d7ab11156ddcacf5b8e9289bc1e53edc52bb; 06/10/2026. Exemplos próprios, sem avaliação independente. Seleção contextual não elimina candidatos lexicais.

| Forma/uso | Exemplo | Decisão deste lote | Apoio/lacuna |
|---|---|---|---|
| como interrogativo direto | Como você chegou? | Meta ADV em unidade completa de três tokens | ADV real, pronome explícito, indicativo compatível, ? |
| como verbo | Eu como. | Preservar CTX-001 | comer real; não sobrescrever |
| como comparação/conjunção | Eu canto como ela canta. | Abstenção nova | ADV/ADP/CCONJ/SCONJ/comer conservados |
| como indireto/exclamação | Ela sabe como eu canto. / Como eu canto! | Abstenção nova | Construções maiores/intensidade fora do recorte |
| se pronome | Ela se viu. | CTX-022 v6.52 em unidade completa de três tokens | Fonte se: PRON Case Acc/Dat/Nom Person=3 PronType=Prs; importada na v6.52. Sem Reflex ou Number; não resolver reflexividade/passiva/reciprocidade |
| se conjunção | Se ela chegou, eu saio. | Abstenção nova | SCONJ no snapshot; preservada na v6.52; condição não inferida |
| que integrante | Eu sei que ela chegou. | CTX-023 v6.53 com dois pares pronome/indicativo e saber/dizer | SCONJ real; exigir construção apoiada, nunca só presença de que |
| que relativo | O livro que eu li. | Abstenção nova | PRON Rel real; lente Relativas separada |
| que interrogativo | Que você viu? | Abstenção nova | PRON Int real; outras construções abertas |
| que exclamativo | Que belo! | Abstenção nova | INTJ/DET/ADV reais; sem intenção inferida |
| que na locução | Eu saio assim que ela chega. | Preservar CTX-020 do grupo | Não classificar que isoladamente |

## Fontes consultadas

Priberam, como (https://dicionario.priberam.org/como); UD v2 PronType (https://universaldependencies.org/u/feat/PronType.html), Reflex (https://universaldependencies.org/u/feat/Reflex.html), advmod e mark em português, consultados em 06/10/2026. Referências de uso/anotação, não algoritmos da obra. ADV de como não tem PronType=Int na fonte: interrogativo será interpretação local, sem adicionar traço lexical. Reflex lexical não demonstra função reflexiva contextual.

Corpus fixado em ptbr/corpus/contrastes-1 antes do motor: seis metas e dez exclusões em cada conjunto; gabaritos preservados. Se/que têm decisões futuras explicitamente pendentes; não contar sua simples presença nesta matriz como implementação.

V6.52: corpus se-pronominal-1 fixado antes da importação/motor; CTX-022 decide só pronome, mantendo Case/Reflex/voz/sintaxe abertos. Que permanece pendente de regra própria.

V6.53: que-integrante-1 fixado antes do motor; CTX-023 decide conjunção no recorte apoiado de cinco tokens. Relativos, perguntas, exclamações, outros verbos e continuação conservam abstenção. Matriz implementada em três recortes positivos próprios, sem resolver todos os usos; consolidação por classe/família ainda necessária.
