<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-37.json -->
# Família nominal: sequências com de e construção solo

v6.37: Classes de palavras amplia a família nominal para sequências com de/do/da/dos/das e apoio finito. Coordenação solo e entrega por ficha única; M02-complemento-1 cumprida, M02 geral parcial.

Base: `75c73b0aa938f20c43051315fe67759fba57aa38`. Coordenação solo; data 30/09/2026.

## Método solo aprovado e trabalho cumprido

Rafael confirmou que o outro Astra não participa mais e aprovou o método em 30/09/2026. Um único responsável prepara, implementa, revisa e integra; não há espera ou pedido de revisão ao A1. Separar atividades não significa fingir independência. M02-complemento-1 cumprida como parte da família nominal: de/do/da/dos/das, artigo definido separado opcional, exclusões e explicações. Processo-solo-1 cumprida: remover execução de suítes ao importar auxiliar, uma verificação de build no CI e ficha única para o relato. M02 geral continua parcial; nenhum novo marco contado.

## Experiência e alcance

Em Examinar → Classes de palavras, experimentar O filho da vizinha chegou.; Os livros dos homens chegaram.; O livro de papel chegou.; O livro de o homem chegou. A hipótese classifica artigo, nomes e de/contração, preserva candidatos e explica os apoios. O verbo final apenas apoia a hipótese: não determina sujeito, posse, função ou vínculo sintático. Continua uma lente por escolha, sem análise ao digitar e sem modificar manuscrito. Adjetivos v6.36 permanecem no mesmo conjunto de regressão.

## Implementação delimitada

PTBR-CTX-007 usa janela de cinco/seis tokens com espaços contíguos. O primeiro nome exige NOUN com gênero/número explícitos correspondentes ao artigo; a forma finita final exige terceira pessoa e o mesmo número, sem candidato nominal. O segundo nome deve constar do inventário. Havendo artigo e registro NOUN externo, os traços também precisam corresponder; quando só existe nome legado sem traços, como vizinha, aceita a classe lexical sem inventar concordância e informa a lacuna. De sem artigo também não autoriza alegar concordância verificada. Não atravessa pontuação, quebra de linha, proteção, coordenação ou complemento encadeado. Pronome/clítico/verbo decidido antes tem precedência. Contrações conservam o rótulo composto, não viram uma classe escolar isolada. Função de leitura de traços compartilhada com a regra nominal anterior; nenhuma DSL ou novo parser.

## Fontes e amostra fixada antes da implementação

Referências técnicas consultadas em 30/09/2026: https://universaldependencies.org/pt/dep/nmod.html e https://universaldependencies.org/pt/dep/case.html. Apoiam a distinção entre sequência nominal, preposição e dependência; a regra de decisão é local. Nenhuma nova leitura de livros ou importação de dados é alegada. Dados e licenças de PortiLexicon permanecem na entrega v6.34. Em ptbr/corpus/nominal-1 há 20 frases de desenvolvimento e 20 de avaliação, escritas e fixadas antes da alteração do motor. São exemplos próprios, não manuscritos coletados. O mesmo agente criou amostra e implementação: avaliação não independente nem cega, apesar da separação e gabarito fixo. Não apresentar como corpus reservado validado externamente. Depois da execução, os casos também entram como regressão.

## Comparação com v6.36 e limites observados

Relatórios nominal-1-antes/depois em docs/jornada/avaliacoes: desenvolvimento 5→11 decisões úteis, 8→2 lacunas, 0 decisões erradas, 7 abstenções esperadas; avaliação 6→13 úteis, 7→0 lacunas, 0 decisões erradas, 7 abstenções esperadas. São 40 alvos, um por frase; não é precisão de todos os tokens nem estimativa da língua. Duas lacunas preservadas: A casa da mulher caiu. (apoio verbal fora do inventário) e O filho de uma mulher chegou. (artigo indefinido fora do recorte). Não alteramos gabaritos para esconder essas lacunas. CTX-022 volta à hipótese substantivo em O filho da vizinha chegou.; histórico da abstenção v6.35 preservado. A avaliação não levou a uma segunda rodada de ajustes.

## Economia de trabalho comprovada e pendente

O auxiliar ptbr/teste-painel.js passa a executar a suíte somente como programa principal. Cinco testes importavam setup/Node e executavam todo o painel; junto ao runner, eram seis execuções do painel e seis verificações adicionais de build. Agora o CI executa o painel uma vez e build:check uma vez; preserva casos e comparação exata das sete saídas. Removidos build seguido de diff redundantes no mesmo CI. Uma ficha JSON gera esta entrega, estado vigente, progresso do plano, retrato e Jornada. AGENTS conserva diretrizes, sem mini-relato a cada versão. Deploy é conferido em Actions por commit; não gerar commit extra só para repetir confirmação. Publicar só fontes e construir no CI continua piloto pendente: não mudamos configuração Pages nem removemos assets antigos nesta entrega.

## Custo, estados e reversão

Cofre 632.629→636.317 bytes (+3.688), portátil 1.350.892 bytes; app/CSS sem mudança de conteúdo. Sem dependência de produto, rede ou consulta adicional por token. Limites mantidos: 8.000 unidades UTF-16, 1.600 tokens, 100 achados; janela fixa adicional. São limites e tamanhos, não medição de heap ou promessa de latência em aparelho antigo. Implementado, integrado e verificado localmente; publicação é estado externo do commit em Actions. Reversão por commit normal e remontagem, preservando textos e formatos. Nenhum force push, migração de armazenamento ou certificação de aparelho.

## Verificações e publicação

Passaram 40 alvos do piloto (duas lacunas documentadas), fronteiras e traços, preservação de candidatos, seleção UTF-16, teto de uma consulta/token, ES5, 63 casos contextuais, 26 contrastes PortiLexicon, 17 nominais, painel e build:check com sete saídas. Regressão completa: execução única no CI do commit; consultar o resultado em Actions.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

M02: ampliar a mesma família nominal para artigos indefinidos e apoios verbais frequentes, começando pelas duas lacunas medidas; preparar novos contrastes antes de implementar. Piloto de publicação por artefato separado e sem bloquear motores.

Plano v4: 11/25 DONE | entrega +0 marcos | próximo M02 | publicação: Actions por commit | limite: janelas restritas, dois alvos ainda sem decisão, avaliação própria não independente
