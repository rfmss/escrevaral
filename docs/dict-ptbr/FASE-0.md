# dict-ptbr — relatório da Fase 0

09/10/2026. Base lida: `rfmss/escrevaral`, main
`620d0134be55eb18f64fbfb927dbc9f992edcb65`. Branch da entrega:
`dict-ptbr/fase-0`. Autorização: executar somente Fase 0 e criar pasta no repo;
nenhuma mesclagem na main ou avanço de fase autorizado.

## Estado e entrega

Plano integral lido do anexo e preservado em `PLAN.md` na raiz, ausente na base.
Contrato `dict-ptbr/SPEC.md` versão 1.0: encoding/escapes, IDs, ordenação,
fragmentação, seis esquemas, classes/marcas, metadados, checksums, versões e
limites. A especificação fica congelada; o aceite de aparelho está pendente.
As decisões atuais do dono prevalecem sobre opções do plano e sobre a dispensa
histórica de aparelhos/uso de main presente na documentação do editor.

Manifesto e fixture determinísticos, carregador ES5 via script, consulta exata,
normalização por tabela, uma leitura e um payload de cache, erros explícitos,
demo copiável, ensaio AppCache e protocolo de testes. Sem dependências de runtime.
O runtime valida estrutura/tamanho, não verifica SHA-256 no navegador; hashes
são conferidos na construção. Script de fonte não confiável não é sandbox.

Camadas 2–6 apenas especificadas, sem dados nem motores implementados. Nenhuma
fonte externa baixada, nenhum léxico existente reaproveitado, nenhuma integração
no editor/site. Os marcos da Jornada do Escrevaral não foram promovidos por
esta prova independente. Não gerar estado público do editor como se houvesse
nova capacidade integrada. Relação com a futura P03/M01 exige etapa própria.

## Contagens e custos observáveis

Um fragmento `f/ca`, duas linhas/duas formas de teste (`café`, `cafés`), ambas
geradas e `rev=a`. Zero lemas identificados, definições, exemplos, sinônimos,
fontes lexicais externas e registros pendentes em revisar.csv. Nenhuma forma
de produção. Demais cinco camadas: zero registros/fragmentos.

Fragmento JS: 47 bytes; payload UTF-8: 28 bytes; manifesto: 783 bytes; runtime:
12.303 bytes. Tamanho de fragmento inclui envoltório; não confundir byte UTF-8,
unidade UTF-16 e memória real. Teto provisório: 300.000 bytes por arquivo e por
payload, sem medição do teto do aparelho. O build reproduz os mesmos bytes.

## Testado e onde

Linux 6.18.44 x86_64, Node 24.19.0, Acorn 8.15.0: **23 grupos de teste passaram**,
zero falhas finais. Abrangem gramática ES5, ausência de APIs proibidas,
hashes/contagens/NFC, rebuild idêntico, acentos, consulta fria/quente, descarte,
erro de arquivo, timeout/retorno tardio, carga concorrente, entrada inválida,
homógrafos, escape, ordenação, versões e limites. Transporte DOM simulado.
O teste de 65 homógrafos inicialmente ordenava linhas serializadas em vez dos
campos; foi corrigido para seguir SPEC, e o erro de limite esperado foi observado.

`npm run build:check`: **passou**, sete saídas de produção conferidas. Não houve
alteração do bundle. Instalação `npm ci --ignore-scripts` usou o lock existente,
sem mudar dependências ou package files. Sem suíte linguística ampla alheia ao lote.

`browser.cjs`: **falhou no ambiente antes de executar consultas**. Chromium:
SIGSEGV no lançamento; WebKit: biblioteca `libgstreamer-1.0.so.0` ausente.
Zero resultados de navegação ou latência declarados. Esses binários seriam
apenas controle desktop, nunca emulação dos alvos antigos. Falha de ambiente
não é tratada como incompatibilidade observada do runtime.

Android 4.4/Chromium 30 e iPad 2/iOS 9.3.5: **não executados**; não existem SDK,
emulador, Xcode ou aparelhos acessíveis aqui. Critério de aceite da Fase 0
**não cumprido ainda**. Nenhuma promessa de compatibilidade certificada.
Detalhes e roteiro: [`DEVICES.md`](../../dict-ptbr/tests/DEVICES.md).

## Decisões técnicas e riscos restantes

O envelope usa ID com camada (`f/ca`), resolvendo colisão entre `f/ca` e `d/ca`.
Tipos `k/o` ganham discriminador; listas têm escape próprio para vírgula.
Sinônimos usam IDs de lema para preservar homógrafos. IDs/sentidos são estáveis,
sem renumeração em lote posterior. Campos vazios da fixture são legais até
Camada 3, sem inventar relações lexicais para passar um teste de transporte.

Cache unitário e varredura de linhas evitam duplicar todo fragmento em arrays.
Uma leitura concorrente retorna ocupado; após timeout, recarregar é necessário
para impedir resposta tardia de contaminar outro pedido. Não há fila, worker,
polyfill ou IndexedDB obrigatório. Modo XHR está reservado, ainda não entregue.

AppCache foi documentado na fonte primária Apple e é apenas ensaio. O download
estático não garante persistência nem que qualquer tamanho caiba em qualquer
aparelho. Sem medição de quota/memória; sem promessa de salvar a página no iOS
como substituto de pacote completo. Se a prova revelar incompatibilidade, parar
e consultar antes de mudar o caminho de instalação. Mesmo procedimento para
chave única que exceda fragmento ou manifesto acima do teto.

Fontes/licenças/frequência/Acordo de 1990 ainda não usados: itens `[VERIFICAR]`
continuam explícitos em [`SOURCES.md`](../../dict-ptbr/SOURCES.md), sem inventar
licenças ou contagens. Não há fonte compartilha-igual necessária a esta prova;
portanto não se abre pedido de exceção de licença nesta fase.

## Como fechar a fase e decisões do dono

Primeiro, disponibilizar ensaio Android 4.4 com WebView Chromium 30 identificada
e iPad 2 físico em 9.3.5. Servir a demo na rede local, registrar `found: café`,
erros, latência, versão/build/UA e SHA; depois desligar servidor/rede e reabrir
a página de AppCache. Simulador iOS 9 só como apoio; não substitui iPad 2/RAM.
O roteiro inclui falha de download, cache frio/quente e reabertura após reinício.

Nenhuma nova decisão de arquitetura foi exigida pelos dados sintéticos.
Faltam acesso aos alvos/evidências de aceite e, depois, autorização explícita
para Fase 1. Merge na main continua dependendo de autorização separada. Não
interpretar entrega desta branch como liberação dessas ações.

Estudado: plano e contratos pertinentes. Especificado: formato 1.0.
Implementado: esqueleto e fixture. Testado: contrato local; navegador bloqueado.
Integrado ao editor: não. Publicado no site: não. Aceito nos alvos: não.

Reversão: remover/reverter somente o commit desta branch; nenhum dado do autor,
estado persistente ou distribuição do editor foi migrado. Próxima ação concreta:
executar o protocolo de aparelhos ainda na Fase 0 e anexar as evidências.
