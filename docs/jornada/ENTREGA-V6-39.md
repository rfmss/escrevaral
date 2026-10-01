<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-39.json -->
# Possessivos e demonstrativos acompanhando nomes

v6.39: Classes de palavras reconhece possessivos/demonstrativos antes de nomes, com artigo definido opcional, traços explícitos e alternativas preservadas. M02-determinantes-1 cumprida; usos sem nome permanecem sem decisão contextual.

Base: `aff9c5366e6fc747d778b3a743dcc4b5984f4df3`. Coordenação solo; data 01/10/2026.

## Escopo e experiência

M02-determinantes-1 cumprida: possessivo ou demonstrativo imediatamente antes de nome, com artigo definido opcional. Exemplos: Minha casa.; Este livro.; As minhas casas.; A sua casa caiu.; Aquela menina chegou. O resultado apresenta possessivo/demonstrativo acompanhando um nome e conserva determinante (UD) como categoria da fonte. Não identifica possuidor, referente, pessoa mencionada, sujeito ou objeto. Uma lente por escolha; nenhum texto modificado e nenhuma análise durante digitação.

## Regra e proteção contra decisões indevidas

PTBR-CTX-008 exige candidato DET com Poss=Yes ou PronType=Dem, seguido de NOUN com gênero/número explícitos compatíveis; artigo definido anterior também precisa corresponder. Não completa traços ausentes por sufixo. Sem nome contíguo, mantém alternativas lexicais: Este chegou.; O meu caiu.; A minha. Um candidato nome/adjetivo seguido de outro nome, como minha velha casa, fica fora do recorte. Artigo + possessivo/demonstrativo sem núcleo bloqueia o fallback que classificaria meu como substantivo apenas porque a fonte também registra NOUN. Pronome/clítico/verbo já decidido tem precedência. Pontuação, linhas e trechos protegidos interrompem a ligação. Sintaxe/relativas continuam com inventário legado.

## Fonte e recorte reutilizados

PortiLexicon-UD, mesmo snapshot 315e063da1f89c89e2097c6e72428ebefb9ab1d1: oito sementes acrescentadas (meu, teu, seu, nosso, vosso, este, esse, aquele). Recorte 3 contém 215 sementes, 3.197 formas, 5.629 leituras e 497 lemas incluindo homógrafos; 12 hashes de entrada verificados. Todas as 3.165 formas anteriores e suas leituras foram preservadas exatamente. DET/PRON/NOUN e leituras verbais como aquelar não são apagadas para forçar a regra. ORIGEM.json registra hash/tamanho/subsetVersion=3; atribuição e decisão de licença continuam conforme entrega v6.34.

## Referências e avaliação

Consultadas em 30/09/2026 as páginas UD v2 https://universaldependencies.org/u/feat/Poss.html e https://universaldependencies.org/u/feat/PronType.html. Poss e PronType são traços separados; sua presença lexical não resolve função ou referente na frase. A decisão contextual é uma hipótese local, não um parser UD nem uma regra normativa geral. Nenhuma nova leitura de livros é alegada. A amostra nominal-3 foi fixada antes da regra/importação: 15 alvos de desenvolvimento e 15 de avaliação. Em cada conjunto: 0→8 decisões úteis, oito lacunas resolvidas, sete abstenções esperadas preservadas e zero decisões erradas observadas. Um alvo por frase; avaliação própria, não cega nem independente. Após a execução, a amostra entra também como regressão.

## Verificação e limites observados

Além da amostra, verificadas alternativas PRON/DET, preservação de homógrafos, bloqueio do fallback em o meu/a minha, desacordo explícito, traços ausentes, deslocamento de apoios após emoji/NFD, uma consulta por token, ES5 e integração simulada do painel. Um teste adicional supôs erroneamente que papel não tinha Gender; a inspeção do recurso corrigiu o exemplo para madeira, que realmente não o informa. Motor e gabaritos pré-fixados não foram alterados para acomodar essa suposição. Minha madeira permanece fora do recorte por falta de gênero explícito. Casos sem nome ou com adjetivo intermediário são lacunas declaradas, não erros de escrita.

## Custo, estados e reversão

Recurso lexical 115.077→122.038 bytes (+6.961); cofre 641.871→652.218 bytes (+10.347); portátil 1.366.799 bytes. App/CSS sem mudança de conteúdo. Máximo de 11 leituras por forma, 128 bytes por registro; recorte abaixo de 256 KiB. Uma consulta morfológica por token, até 8.000 unidades UTF-16/1.600 tokens/100 achados; passagem adicional com janela curta e comparações limitadas aos candidatos dos dois tokens. Sem rede, dependência nova ou cache de manuscrito. São limites e tamanhos, não medição de RAM/latência em aparelhos antigos. Implementado/integrado/verificado localmente; CI e Pages do commit são a confirmação externa de publicação. Reversão por commit normal e remontagem, sem alteração de textos ou formatos.

## Verificações e publicação

Passaram 30 novos alvos e testes de fonte/ambiguidade, fronteiras, traços ausentes, UTF-16, limites, ES5 e painel; 63 casos contextuais, 26 contrastes PortiLexicon, 20 indefinidos e 40 preposicionais preservados. O recurso completo passou em oito grupos (3.197 formas/5.629 leituras); 3.165 formas anteriores preservadas exatamente. Build:check conferiu sete saídas. Regressão completa: execução única no CI do commit; resultado em Actions.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02: delimitar usos possessivos/demonstrativos sem nome expresso (este chegou; o meu caiu), contrastando pronome, elipse e substantivação; fixar evidências e abstenções antes da regra, sem inferir referente.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: núcleo nominal contíguo com traços explícitos; sem resolução de referente ou usos sem nome; avaliação própria
