# dict-ptbr — contrato de dados 1.0

Data: 09/10/2026. Formato congelado na Fase 0; homologação nos aparelhos pendente.
Contrato das seis camadas definido aqui; runtime da Fase 0 implementa somente
carregamento de formas e consulta exata da fixture. Definir não significa executar
as fases seguintes. O plano original está em `../PLAN.md`.

## Decisões vinculantes

Nome/prefixo `dict-ptbr`; PT-BR e Acordo Ortográfico de 1990. Todas as flexões
serão armazenadas, nunca calculadas no runtime. Camadas são arquivos independentes;
instalações parciais declaram exatamente sua cobertura. Ausência na base não prova
inexistência na língua. Homógrafos não são descartados.

Somente domínio público, CC0, MIT, BSD, Apache ou CC BY com crédito em SOURCES.md.
Sem fonte sem licença clara, CC BY-SA, GPL ou similares sem autorização do dono.
Dados próprios finais sob controle do dono; não se promete exclusividade sobre
material de terceiros e suas obrigações de atribuição são preservadas. Não há
licença pública nova concedida por esta entrega. Separar licenças de código e dados.
Antes dos lotes, procurar frequência de português com licença realmente conferida;
na ausência, núcleo de aproximadamente 5 mil palavras gerado, identificado como
tal, depois ordem por prefixo. Essa quantidade é meta, não dado já existente.

ES5 puro, callbacks e DOM clássico. Android 4.4 / WebView Chromium 30 e iPad 2 /
iOS 9.3.5 são os alvos desta frente. A instrução atual substitui, somente aqui,
a dispensa histórica de aparelhos do Escrevaral. Sem merge na main nesta fase.

## Codificação e envelope

UTF-8 sem BOM, NFC na construção, LF entre registros e exatamente um LF final
em payload não vazio. Payload vazio tem zero caracteres. Sem linhas vazias ou
comentários entre registros. Proibidos NUL, CR literal, substitutos isolados
e controles C0 (exceto LF separador e TAB escapado em campo).

Cada arquivo de dados contém uma chamada e nenhuma outra instrução:

```js
D.f("f/ca", "cafe|café||\n");
```

Primeiro argumento = ID global `camada/prefixo` (ex.: `f/ca`, `d/ca`), evitando
colisões entre camadas do exemplo abreviado do plano. Metadados usam `f/ca.meta`.
Segundo argumento = uma única string, nunca array, com LF codificado como `\n`
no literal JS. O gerador usa escape JSON compatível com ES5: `"`, `\`, controles,
U+2028 e U+2029 escapados; `<` como `\u003c` impede fechamento de script em eventual
incorporação. Não usar continuação de linha JS. Arquivos são externos, confiáveis:
script executa antes de qualquer validação de payload; hash não é sandbox.

Há duas camadas de escape. Primeiro, em cada campo de dados: barra invertida
vira `\\`, barra vertical vira `\p`, LF interno vira `\n`, CR interno `\r`,
TAB interno `\t`, vírgula literal `\c`. Só esses seis escapes são válidos;
escape desconhecido ou barra solta é erro. Depois aplicar escape do literal JS.
Separar registros por LF, campos por `|`, listas por `,` ANTES de desescapar.
Campo vazio não é espaço e não significa zero. Nenhum trim implícito em dados.
Lista vazia é campo vazio; itens vazios/repetidos são inválidos. Exemplo de campo
decodificado `a|b,c\d` = texto de dados `a\pb\cc\\d` = literal JS
`"a\\pb\\cc\\\\d"`.

## Chave e ordenação

Algoritmo `ptbr-key-1`, tabela fixa, sem `normalize()` e sem localeCompare.
Conversão para minúsculas somente A–Z e as maiúsculas correspondentes de
`àáâãäåèéêëìíîïòóôõöùúûüçñýÿ`. Não usar lowercasing dependente de locale.
Depois mapear esses caracteres para `aaaaaaeeeeiiiiooooouuuucnyy`.
As combinações de base latina + um acento desta mesma tabela são compostas
pela tabela antes da remoção; assim `café` e `cafe\u0301` têm chave `cafe`.
Demais caracteres são preservados, sem transliteração, sem remover hífen,
apóstrofo ou espaço. Unicode fora dessa tabela não é fingido como normalizado;
novas necessidades vão para revisão antes de mudar o algoritmo.

Comparação lexicográfica por unidades UTF-16 (`<`, `>` de strings JS), sempre
sobre chave já normalizada; nenhuma ordenação regional. Desempates: forma,
lid, classe por mesma comparação. Para `l/d/e/s`, chave de roteamento é a chave
do lema, obtida do lid removendo o último sufixo `.clN`. Números de sentido
e desambiguação ordenados numericamente. Duplicatas de linha são inválidas.

## Fragmentação e limites

Prefixo inicial = duas primeiras unidades UTF-16 da chave; chave de uma unidade
tem fragmento próprio de uma unidade. Chaves vazias são inválidas. Se o segundo
code unit cortar um par substituto, incluir o par inteiro. Prefixos subdividem
por uma unidade adicional (sem cortar pares), a partir de três, até caber.
Manifesto lista apenas folhas, sem sobreposição de prefixos. Todas as linhas de
uma mesma chave ficam juntas. Se uma chave sozinha exceder o limite, PARAR e
consultar o dono: não criar paginação silenciosa nem descartar homógrafos.

Arquivo `.js` completo descomprimido e payload UTF-8 têm teto provisório de
300.000 bytes cada. É política inicial, NÃO limite de RAM medido. O manifesto
também não pode ultrapassar 300.000 bytes; se crescer além disso, parar para
decidir um índice hierárquico versionado. Não carregar catálogo ilimitado.
Uma linha de dados tem no máximo 16.384 unidades UTF-16; campos forma/chave
têm no máximo 128. Máximo de 64 leituras por consulta exata; excesso é erro
explícito, jamais truncamento silencioso. Casos reais que excedam isso exigem
revisão com o dono antes da ingestão. Um cache de payload, uma leitura em curso.
String UTF-16, compilação, DOM e temporários consomem RAM além dos bytes UTF-8.

Caminhos relativos à pasta `dist/`, declarados no manifesto. Prefixos ASCII
`[a-z0-9]+` usam o nome literal, por exemplo `f/ca.js`. Outros prefixos usam `u-`
seguido dos code units em hexadecimal de quatro dígitos separados por `-`.
O prefixo real continua no descritor, sem depender do nome do arquivo.
Não permitir caminhos absolutos, `..`, query, fragmento ou origem externa.

## Registros das camadas

Camada 1, `f`: `chave|forma|lid|cl`. Forma vigente com acentos. `lid` e `cl`
vazios juntos antes da Camada 3; preenchidos juntos depois. Uma linha por
forma/lema/classe, não uma por grafia. Para provar homógrafos sem colisão,
Camada 3 usa IDs diferentes mesmo quando grafia/classe coincidem.

Camada 2, `x`: `k|chave|forma1,forma2` ou `o|antiga|vigente`.
O discriminador explícito resolve a ambiguidade dos dois tipos no plano.
`k` exige duas ou mais formas distintas, ordenadas por código; `o` guarda grafia
antiga com acentos e roteia por sua chave. Vários destinos de uma antiga são
linhas distintas. Não transformar toda grafia acentuada em antiga.

Camada 3, `l`: `lid|lema|cl|info`. `lid` = `<chave>.<cl><N>`, N positivo sem zeros
iniciais. IDs estáveis, nunca renumerar em expansão; registro persistente na
construção resolve novos homógrafos. `info` é lista ordenada, separada por vírgulas:
`g=m`, `g=f`, `g=c`, `g=mf`; `num=s`, `num=p`, `num=sp`;
`reg=intr`, `reg=td`, `reg=ti`, `reg=tdi`, `reg=lig`, `reg=pron`.
Vazio significa não informado; múltiplas regências são permitidas.

Dez classes fechadas: `a` artigo, `s` substantivo, `j` adjetivo, `n` numeral,
`p` pronome, `v` verbo, `d` advérbio, `r` preposição, `c` conjunção, `i` interjeição.

Camada 4, `d`: `lid|n|marcas|definição`. Sentido n positivo estável por lid,
nunca reutilizado com outro significado. Marcas são lista ordenada por código.
Lista fechada 1.0: registro `pop` popular, `gir` gíria, `chu` chulo,
`for` formal, `lit` literário; região `NE`, `S`, `SE`, `N`, `CO`, `reg` (regional
sem precisão suficiente); época `arc`; área `agr`, `anat`, `art`, `bio`, `bot`,
`dir`, `econ`, `fis`, `geo`, `gram`, `hist`, `inf`, `mat`, `med`, `mus`, `qui`,
`rel`, `zoo`, `tec`. Área não coberta vai para revisão; não inventar código.
Campo vazio = uso não marcado, não informação regional implícita.

Camada 5, `e`: `lid|n|exemplo`. Um exemplo original por sentido nesta versão;
até 140 pontos de código Unicode, não bytes. Deve conter lema ou forma vinculada.
Sem copiar frases de obras/sites. Exemplos gerados continuam `rev=a` até revisão.

Camada 6, `s`: `lid|n|sin1,sin2,...`. Itens são IDs de lema (lids), não texto
solto: desambiguam homógrafos e devem existir em `l`. O sentido de origem é n;
não afirma equivalência em todos os sentidos do destino. Sem auto-referência,
sem duplicata, sem inversa automática. UI resolve lid para lema.

Dependências de referência: `l` é necessária para `d`; `d` para `e` e `s`;
`s` também exige todos os lids em `l`. `f` pode operar isoladamente com campos
vazios; `x` exige `f`. Não há implementação de `x/l/d/e/s` nesta Fase 0.

## Proveniência, revisão e frequência

Cada fragmento tem proveniência padrão `sources` (IDs de SOURCES.md), `rev`
(`a` gerado, `h` revisado por humano, `v` verificado com evidência), `batch`.
Overrides por linha usam arquivo paralelo `<prefixo>.meta.js`, payload
`linha|fontes|rev|lote|rank`. Linha = ordinal 1-based no fragmento referenciado;
fontes é lista de IDs. Sem override, vale a proveniência padrão do descritor.
Não misturar origens sem metadados; metadados ficam fora do carregamento lexical
normal, mas acompanham a distribuição e seus checksums. Cada novo build pode
mudar ordinais, por isso sidecar e fragmento sempre pertencem à mesma versão.

`rank` só se aplica às linhas de `l`; inteiro positivo, menor = mais frequente,
vazio = desconhecido. Empates permitidos. Não converter rank em contagem
observada. Núcleo gerado usa `rank` editorial com fonte gerada explícita, nunca
rotulado como frequência de corpus. Antes de usar fontes reais, fixar URL,
versão/commit, data, licença lida, hashes e créditos em SOURCES.md. Lote gerado
registra modelo informado pelo ambiente (ou indisponível), data, prompt e rejeição.

## Manifesto

`dist/manifest.js` contém apenas `D.m(<objeto JSON>);` com chaves nesta ordem:
`project`, `formatVersion`, `dataVersion`, `kind`, `normalization`, `encoding`,
`maxFileBytes`, `layers`. `formatVersion: 1`; `kind: "fixture"` ou `"release"`;
`dataVersion` imutável para cada conjunto de bytes. Sem data de build volátil.
`normalization: "ptbr-key-1"`, `encoding: "UTF-8/NFC/LF"`, `maxFileBytes: 300000`.

`layers` contém `f,x,l,d,e,s` nessa ordem. Cada camada tem `records` (quantidade
de linhas de dados, não de palavras distintas), `fragments` (array de folhas),
`metadata` (array de sidecars). Camada não instalada é representada por zero e arrays vazios;
as seis chaves sempre existem, inclusive na fixture. Cada descritor tem `id`, `prefix`,
`path`, `records`, `bytes`, `sha256`, `payloadBytes`, `payloadSha256`, `sources`,
`rev`, `batch`. Sidecars acrescentam `target` (ID do fragmento principal).
Arrays ordenados por prefixo e ID; somas e referências conferidas na construção.

Checksums SHA-256 hexadecimal minúsculo: `sha256` sobre bytes exatos do arquivo
JS, inclusive LF final; `payloadSha256` sobre UTF-8 do segundo argumento já
interpretado como string JS, ANTES de desescapar campos. Não hashear arquivo
compactado HTTP. Manifesto não inclui seu próprio hash (evita ciclo); pacote
futuro registra esse hash externamente. Build verifica hashes. Runtime esqueleto
confere tamanho/estrutura/contagem, NÃO SHA-256 em script transport. Não afirmar
autenticidade nem integridade criptográfica no navegador desta fase.

## API do esqueleto

Carregar `runtime/dict.js`, depois `dist/manifest.js`, depois configurar
`D.configure({base: "../dist/", timeout: 10000})`. Base pertence ao hospedeiro,
nunca à palavra digitada. Só uma instância global `D` por página; namespace já
ocupado produz erro, não sobrescrita. Não precisa de CDN, instalação ou polyfill.

`D.lookup(palavra, callback)` responde `callback(error, resultado)`; erro nulo
em sucesso, caso contrário `{code, message}`. Callback pode ser síncrono em cache
ou entrada inválida. Resultado `{status, key, entries}`; status `found` ou
`absent-in-fixture`/`absent-in-package`. Entries são `{key, form, lid, cl}`.
Consulta exata ignora caixa e compõe apenas acentos da tabela; conserva acentos
na comparação. `cafe` NÃO implica `café` no esqueleto: busca sem acento é Fase 2.
Limite de entrada 128 UTF-16. Palavra nunca vira URL ou HTML.

`D.key(text)` expõe chave da tabela. `D.clear()` libera a referência ao cache,
sem prometer forçar coleta de lixo. Não limpa leitura em curso. `D.stats()`
informa cache/leituras iniciadas e transporte bloqueado, não RAM do processo.
`D.f(id, payload)` é entrada do transporte, não carregador público antecipado.
Um pedido em andamento → `E_BUSY`, sem fila ilimitada. Falta de DOM, versão,
configuração, arquivo, callback de registro, formato ou excesso retornam erros
distintos. Nunca converter falha de transporte em palavra ausente.

Script é removido depois de onload/onerror; timeout remove o nó e bloqueia
novas leituras até recarregar a página: remoção não garante cancelamento físico,
e um script tardio não pode contaminar pedido novo. Callback uma vez por pedido.
Cache contém no máximo um payload; percorre linhas sem split do corpus inteiro.
Modo XHR fica reservado para adaptador posterior (não implementado na Fase 0);
ele deverá receber texto de dados, sem eval/new Function, e seguir os mesmos
limites/erros. `file://` não é presumido viável em todo iOS.

## Correção futura e compatibilidade

Fase 2: candidatos pela chave, grafia antiga e Levenshtein até 1 (até 2 quando
chave tiver 8 ou mais pontos de código); máximo 5, por rank conhecido antes de
desconhecido, depois distância, chave, forma e lid. Vizinhos = folhas cujo prefixo
pode conter candidato dentro do orçamento de edições, inclusive erro inicial;
não apenas o anterior/próximo lexicográfico. Deduplicar grafias sem perder leituras.
Algoritmo/custo real ainda serão implementados e ensaiados nessa fase.

Mudança de significado de campo, escape, normalização ou roteamento exige nova
versão de formato. Novos leitores devem continuar lendo versão 1; leitor 1
rejeita versão desconhecida explicitamente. Extensões opcionais só são admissíveis
sem alterar interpretação anterior, com fixtures de retrocompatibilidade.

Offline: baixar arquivos estáticos não prova persistência. AppCache é experimento
separado; seu manifesto lista TODOS os arquivos necessários e só sinaliza pronto
após evento de conclusão. Reabrir sem rede é teste obrigatório. “Salvar página”
não equivale a salvar todos os fragmentos. Não adicionar service worker, IndexedDB
obrigatório ou APIs modernas para encobrir uma falha do alvo. Se AppCache/local
falhar no aparelho, parar e relatar antes de decidir alternativa.
