<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-42.json -->
# Coordenação nominal com um artigo em cada constituinte

v6.42: A casa e o jardim / Um livro ou uma revista recebem hipótese de coordenação nominal com artigos e cinco apoios localizáveis. M02-coordenacao-artigos-1 cumprida; revista/revistas entram no inventário real com todos os homógrafos.

Base: `3f88abe795f7134a7aa62e4c528d1f1ba555799b`. Coordenação solo; data 04/10/2026.

## Retomada e escopo

A manutenção do ambiente removeu a cópia de trabalho antiga. Repositório recuperado da main em 3f88abe; as correções históricas de triagem, expressões e repetição já estão incorporadas e foram superadas pela arquitetura modular e pela análise explícita. Não reaplicar o HTML antigo ou a fila de lentes. Esta entrega segue a próxima ação vigente em estado.json, sob a coordenação solo aprovada. Não muda armazenamento, cadernos, controles de escrita ou política de análise.

## Regra e experiência

PTBR-CTX-012 exige exatamente artigo + nome + e/ou + artigo + nome, separados por espaços horizontais e delimitados por início/fim de recorte completo ou pontuação .!?;:. Cada nome precisa de leitura NOUN externa com Gender/Number explícitos compatíveis com o próprio artigo. Gênero/número podem diferir entre os dois grupos. Um artigo indefinido ou ao menos um núcleo com apenas substantivo no inventário oferece apoio adicional; o canto e o trabalho permanece aberto. A hipótese conserva candidatos, incluindo homógrafos verbais, confiança moderada e syntaxResolved false. Os cinco achados distinguem artigo, constituinte e conectivo, com os mesmos cinco apoios originais. Não infere sujeito/objeto, concordância coletiva, sentido de ou, referente, intenção quantitativa ou coordenação de orações.

## Critérios de abstenção e prioridade

A regra de cinco tokens vem antes do fallback artigo definido + nome, mas depois das regras de sujeito/clítico, determinante e grupos nominais já existentes. Não sobrescreve uma decisão contextual anterior. Pontuação interna, quebra de linha, código/aspas/endereço protegido, modificador, palavra desconhecida, falta de traços, incompatibilidade dentro de um par, lista maior, oração continuada ou recorte truncado impedem a nova hipótese. Artigo em apenas um dos constituintes continua fora do recorte. Abstenção significa que a regra não decidiu; não acusa erro de escrita.

## Fontes e inventário

UD v2 conj (https://universaldependencies.org/u/dep/conj.html) e det em português (https://universaldependencies.org/pt/dep/det.html) consultados em 04/10/2026: referências para distinguir constituintes coordenados e relação determinante/núcleo. Não são algoritmos de desambiguação e não validam o recorte computacional. Nenhuma leitura nova de livro é alegada. Revista ainda não tinha registro morfológico externo na base; não foram inventados seus traços. Incluído o lema revista no conversor existente, a partir de PortiLexicon-UD 315e063da1f89c89e2097c6e72428ebefb9ab1d1, com os 12 hashes conferidos e atribuição/licença preservadas. Novas formas revista/revistas incluem 13 leituras; total 3.201 formas/5.644 leituras/503 lemas incluindo homógrafos. Dados 122.117→122.347 bytes (+230). Todas as triplas antigas foram comparadas e preservadas. OWN-PT não recebeu novas definições.

## Amostra e verificações

nominal-6/desenvolvimento.json e avaliacao.json fixados antes do código. Cada conjunto tem 16 alvos: sete hipóteses esperadas e nove abstenções. Base: zero decisões úteis, sete lacunas e nove abstenções por conjunto. Depois: sete úteis, zero erradas, zero lacunas e nove abstenções por conjunto. Gabaritos preservados. Amostra própria, não independente nem cega; não estima acurácia geral. Teste adicional confere ausência de traços em cada núcleo, Unicode decomposto/emoji, seleção e apoios no original, texto intacto, truncamento por caracteres/tokens, uma consulta lexical por token, piso ES5, alcance do painel e preservação da regra sem artigos. Regressões dirigidas passaram; auditoria ampla continua no plano.

## Custo, publicação e reversão

Cofre 658.363→661.265 bytes (+2.902); portátil 1.372.942→1.375.852 (+2.910). App/CSS sem mudança de conteúdo. Limites de 8.000 unidades UTF-16, 1.600 tokens e 100 achados mantidos; janela constante de cinco tokens, dados consultados uma vez por token, sem rede ou dependência nova em execução. Bytes não equivalem a medição de RAM/latência. Versão 6.42.0 gerada de fontes; publicação autorizada na main sem force push. CI/Pages por SHA confirmam os estados. Reversão por commit normal e remontagem, sem migração de documentos.

## Verificações e publicação

Passaram 32 alvos novos, papéis dos cinco tokens, traços ausentes, homógrafos/clíticos, fronteiras/protegidos, seleção UTF-16/NFD, truncamento e teto de uma consulta por token, ES5 e painel. Passaram também 28 alvos de coordenação sem artigos, 17 contrastes nominais, 30 determinantes, 26 PortiLexicon/contexto, 63 contextuais e oito grupos do inventário. Comparação das triplas decodificadas preservou todas as 3.199 formas/5.631 leituras anteriores. Build:check confere sete saídas; regressão completa fica no CI. CI e Pages devem ser conferidos no SHA desta entrega.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02: delimitar coordenação de dois grupos artigo + nome + adjetivo (a casa branca e o jardim bonito), com gabaritos antes da regra, traços explícitos e abstenção para adjetivos homógrafos verbais; preservar recortes anteriores sem ampliar para orações.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: dois pares artigo + nome, sem modificadores, entre limites explícitos; traços ausentes ou duas alternativas verbais com artigos definidos causam abstenção; não é parser de orações
