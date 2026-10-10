# Fontes e política — Fase 0

## Material efetivamente incorporado

`fixture-ia-20261009`: duas linhas sintéticas (`café`, `cafés`) criadas nesta
execução para ensaiar o transporte. Não extraídas de dicionário, site, livro
ou léxico existente. Sem definição, exemplo, sinônimo, frequência ou lema real.
Revisão `a`, lote `phase0-fixture-1`, geração em 09/10/2026 por Codex;
identificador exato do modelo não disponibilizado nesta execução.
Instrução do lote: “criar duas formas de teste de café, sem lema/classe,
para carregar um fragmento fake na Fase 0; não importar corpus”.
Produzidas 2, aceitas como fixture 2, rejeitadas 0/2; sem revisão linguística
humana e sem alegação de cobertura. Arquivo reprodutível: `build/fixture.cjs`.
Hashes/bytes exatos: `dist/manifest.js`.

Plano fornecido pelo dono: `../PLAN.md`, cópia integral do anexo
“Plano de execução — Dicionário PT-BR offline (núcleo universal).md”.
SHA-256 `3534c9be4dc3528293573eab2fcf5f71c422a0f94e2791d7059f3cb151993699`.
Não havia PLAN.md na raiz da main `620d0134be55eb18f64fbfb927dbc9f992edcb65`.
Não tratar as alegações históricas do plano como licenças verificadas.

Nenhum dado de terceiro incorporado. A instrução do dono reserva seu controle
sobre o conjunto final, sem concessão pública de licença nova nesta fase.
Permissões futuras de terceiros devem ser preservadas; não declarar que fontes
abertas passam a pertencer exclusivamente ao projeto.

## Fontes técnicas realmente consultadas em 09/10/2026

Android Developers, [Android KitKat, seção Chromium WebView](https://developer.android.com/about/versions/kitkat).
A documentação oficial descreve WebView do Android 4.4 baseada em Chromium,
suporte à maior parte dos recursos HTML5 do Chrome para Android 30 e depuração
remota. Isso orienta o ensaio; não comprova qual engine existe num aparelho não
inspecionado. Não houve cópia de código/dados dessa página para o runtime.

Apple, [HTML5 Offline Application Cache, documentação arquivada](https://developer.apple.com/library/archive/documentation/iPhone/Conceptual/SafariJSDatabaseGuide/OfflineApplicationCache/OfflineApplicationCache.html).
O documento exige manifesto com recursos, mesma origem e MIME
`text/cache-manifest`. Atualização requer alteração do manifesto. Uma falha
de download impede a nova geração; arquivo local não substitui ensaio HTTP
do AppCache. Esses pontos orientam a página experimental e o servidor de
testes; não validam quota, retenção ou funcionamento específico no iPad 2.

## Verificações ainda não realizadas e sem uso de dados

Dicionário Aberto, Kaikki/Wikcionários, Hunspell/LibreOffice, OpenWordnet-PT,
TeP e VOLP/ABL são apenas candidatos históricos do plano. Nenhum download,
licença aprovada, volume ou cobertura afirmados nesta fase. Não usar os dados
já existentes no Escrevaral como atalho para contornar a política atual.

Para cada fonte, antes de ingestão: abrir licença/termos originais, fixar
versão/commit/data/URL, guardar hash do arquivo usado, escopo, créditos e
transformações. Fonte sem licença clara não entra. Compartilha-igual exige
parada e consulta se for necessária, nunca mistura automática.

Frequência aberta ainda não pesquisada: não é entrada da Fase 0. A busca e
verificação precederão seu uso nos lotes autorizados; fallback autorizado é
núcleo de cerca de 5 mil palavras gerado e marcado, depois prefixo.
Nenhum núcleo de 5 mil palavras foi produzido agora.

Acordo de 1990/exceções, termos VOLP, licenças de corpus e limites medidos
continuam `[VERIFICAR]` antes de uso. A Fase 0 não corrige grafias antigas.
