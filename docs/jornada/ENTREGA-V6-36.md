# M02 — grupos nominais curtos na lente de classes

Base: main `691461a891289d4ce23d53f7c610fb18ac4a1dae`, confirmação da v6-35. A2 integra/publica por autorização reiterada de Rafael em 30/09/2026. A1 pode revisar esta passagem sem bloquear a continuidade.

## Entrega e uso

- [x] M02-nominal-1: hipótese local para artigo definido + nome + adjetivo, nas duas ordens.
- [x] Usar gênero/número explícitos do léxico e distinguir ausência de traço de compatibilidade comprovada.
- [x] Preservar candidatos, abstenções, manuscrito, posições e limites; integrar site/portátil.
- [x] Registrar contrastes e verificar o comportamento no painel simulado.

No editor: **Examinar → Classes de palavras**. Experimente `As casas brancas.`, `Os carros vermelhos.`, `O velho homem.`, `O grande homem.` e `A mulher feliz.`. São hipóteses de classe com confiança moderada; nenhuma alteração do texto ou julgamento de correção. Abrir/digitar não executa análise.

M02 geral permanece parcial. Plano v4: **11/25 DONE**, entrega +0 marcos; tarefa M02-nominal-1 cumprida. Árvore: fundação 5/5; compatibilidade 4/4; acervo 1/3; motores 1/9; experiência 0/2; validação 0/2.

## Regra, decisões e abstenções

`PTBR-CTX-006`, em `ptbr/morfologia-contextual.js`, examina três tokens contíguos: o/a/os/as, nome e adjetivo. Exige leitura NOUN com gênero/número correspondentes ao artigo e ADJ com o mesmo número. Se o gênero do adjetivo estiver registrado, também precisa corresponder. Sem gênero no ADJ, a hipótese continua possível, mas a explicação declara que esse traço não foi verificado. Ausência de gênero não vira classificação automática de adjetivo invariável. Valores múltiplos separados por vírgula são conjuntos de candidatos.

Se ambas as palavras admitem NOUN/ADJ, não escolhe a ordem e impede que a regra curta artigo + nome decida por acidente: `A bela menina.` mantém a ambiguidade, embora seja uma construção comum. Essa abstenção conservadora é uma perda conhecida de decisão, não um erro do escritor. Fica explícita no resultado. O recorte não interpreta semântica para eliminar leituras raras.

Leitura verbal finita no candidato a adjetivo impede a nova decisão (`A mulher baixa.`). Decisões anteriores de pronome/verbo/clítico têm precedência (`Tu as casas brancas.`). Pontuação, quebra de linha, citações/código protegidos e palavras intermediárias interrompem o grupo. `As casas branco.` não satisfaz os traços; não gera aviso de erro. Outras regras antigas podem ainda classificar parte dessas frases.

Não atribui sujeito, objeto, adjunto, vínculo semântico ou concordância geral; não atravessa complemento preposicional. Sintaxe/relativas mantêm seus inventários anteriores. Candidatos e apoios exatos permanecem disponíveis. Não adiciona novos tipos de posição ao contrato; a seleção desloca os apoios existentes.

## Fontes e custo

Consulta técnica em 30/09/2026: [UD amod em português](https://universaldependencies.org/pt/dep/amod.html), [Gender](https://universaldependencies.org/u/feat/Gender.html) e [Number](https://universaldependencies.org/u/feat/Number.html). As páginas documentam relações/traços; o algoritmo de desambiguação restrito é local, não uma regra geral prescrita por UD. Nenhuma nova leitura de livros é alegada. Reutiliza os dados PortiLexicon, hashes, licença/atribuição e limites da [v6-34](ENTREGA-V6-34.md); nenhum dado externo novo incorporado.

Uma consulta morfológica por token, até 8.000 unidades UTF-16/1.600 tokens; uma passagem adicional com janela de três palavras. Busca combinações apenas nas leituras dos dois tokens (o recorte possui no máximo 11 leituras por forma). Sem consulta de sentidos, rede, dependência, cache persistente ou análise durante digitação. Cofre 629.316 → 632.629 bytes (+3.313); portátil 1.347.204 bytes; app/CSS sem alteração de conteúdo. São tamanhos sem compressão, não medição de RAM/latência nem certificação de aparelhos. Motor `contexto-3-nominal`, conhecimento `local-20260930-contexto-3`.

## Verificações e estados

`tests/contexto-nominal.cjs`: 17 contrastes (5 positivos, 11 exclusões e 1 ambiguidade), lacunas/valores combinados de traços, prioridade do clítico, seleção após emoji/NFD, apoios UTF-16, teto de consultas e painel com uma lente/manuscrito intacto. Um primeiro teste tentou usar o contrato do editor no runtime puro do cofre; ajustado para carregar os dois módulos reais do adaptador antes da prova de seleção. Não foi necessário alterar produto por essa falha de montagem do teste.

Passaram também os 63 casos contextuais existentes e 26 contrastes PortiLexicon, incluindo isolamento de sintaxe/relativas, ES5 e painel. Nenhuma nova expectativa antiga alterada. `npm run build:check`: 7 arquivos reproduzíveis. Demais regressões ficam no CI. Casos são de desenvolvimento; avaliação linguística reservada continua pendente. Visual/aparelhos não são gates.

Estudado, implementado, testado localmente e integrado. Publicação aguardando push/CI/Pages; registrar confirmação abaixo depois do resultado real. Reversão por commit normal do módulo e remontagem, sem alteração de formato dos textos ou das bases lexicais. Não usar force push.

## Próximo incremento

M02-complemento-1: delimitar artigo + nome + de/do/da + nome (artigo opcional após de), começando por `O filho da vizinha chegou.` e contraexemplos de verbo, pontuação e vínculo ambíguo. Definir fronteiras e evidência antes de implementar; não propagar a hipótese para sintaxe/relativas. M01 continua parcial; A02 não bloqueia estes recortes pequenos.

Plano v4: 11/25 DONE | entrega +0 marcos (M02-nominal-1 cumprida) | próximo M02-complemento-1 | publicação: aguardando confirmação | limite: três palavras, ambiguidade de ordem e avaliação reservada pendente.
