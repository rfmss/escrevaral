# Costura artesanal — v6.4

Integração aprovada em 21/09/2026. Base publicada: `f3ce417e` (PR 175). O anexo contém a continuação do PR 176, recepção e ensaio de caixas. Esta entrega reúne essas camadas em uma branch isolada.

## Contrato de organização

- Cadernos continuam acessíveis na mesa, sem caixa obrigatória. Criar caixa é uma ação separada e opcional; ela começa vazia.
- Caixa representa uma obra e reúne cadernos. Dentro da caixa, cada caderno pode representar um volume. A unidade de escrita continua no editor existente.
- Ajustes permite mover um caderno para uma caixa ou devolvê-lo à mesa. Identidades de textos, fichas, desenho, calendário e linhagem são conservadas.
- Caixa abre sua lista de cadernos, mesmo quando há apenas um: o retorno é previsível. O caminho superior e a sessão conservam o contexto. A indicação ABERTO permanece.
- A lixeira de uma caixa oculta seus cadernos sem alterar o estado individual de cada um. Restaurar a caixa não restaura acidentalmente cadernos anteriormente descartados.

## Dados e pacotes

`originalId` aceita somente um identificador válido ou ausência de caixa. Objetos inválidos são rejeitados antes da gravação. Na inicialização, o defeito conhecido do ensaio (`{originalId: id}`) é reparado com diário e rollback, sem reescrever manuscritos. Referências órfãs recuperam uma caixa identificada pelo ID; nomes já perdidos em exportações antigas não podem ser reconstruídos.

Pacotes `escrevaral-cadernos` v2 incluem cadastro de caixas, vínculos e inventário. Exportação por caixa, por caderno ou completa. Importações v1 continuam aceitas; sem cadastro de caixas verificável, os cadernos ficam acessíveis na mesa. Colisões produzem cópias e remapeiam vínculos sem sobrescrever originais. A importação de cadastros e documentos participa do mesmo diário de recuperação.

## Apresentação e compatibilidade

Caixas usam gradientes e sombras estáticas. Contagens são reunidas por caderno em uma passagem pelos documentos. A recepção conserva a identidade, simplifica a linguagem e menciona exportação. O convite de instalação depende da disponibilidade real da ação. O layout da recepção tem apresentação básica sem depender de CSS Grid. Não há nova dependência de execução.

Aplicativo e arquivo portátil têm conteúdo idêntico. Cache passa a `20260921-scrvrl-costura-v6-4`. O código do aplicativo continua ES5; o service worker é opcional nos aparelhos antigos.

## Verificação

Verificações locais: sintaxe ES5 de 37 scripts; versões sincronizadas; contratos de cadernos, quadro, universo, linguística e linhagem; caixas opcionais; pacote completo/parcial; importação v1; cópias; falhas de escrita; recuperação do ensaio; lixeira; duas instâncias de armazenamento.

A primeira execução em Chromium/WebKit passou integralmente: [run 35562527501](https://github.com/rfmss/escrevaral/actions/runs/35562527501), commit `bf5ef674`. As capturas revelaram pouco espaço para caixas em 320 px: a mesa móvel passa a ter uma única rolagem, caixas proporcionais e lembretes abaixo dos cadernos. Um teste verifica que a caixa inteira e o botão de criação cabem na área visível. A execução final valida também esse ajuste e as correções posteriores de recuperação.

WebKit atual e tamanhos de viewport não equivalem a teste em iPad iOS 9.3.5 ou Android KitKat físico.
