# PTBR na main do Escrevaral

**Autoridade de implementação:** `rfmss/escrevaral@main`. O protótipo ASTRA, outras branches e o pacote recebido são referências de extração; não são base para substituir o produto.

## Estado desta entrega
- `ptbr/triagem.js` é a primeira camada transplantada. É uma API ES5 independente, **ainda não ligada ao HTML**, ao editor, ao painel nem ao service worker. O site publicado permanece como estava.
- `ptbr/teste-triagem.js` é um teste isolado com motor simulado, executável com `node ptbr/teste-triagem.js`. Ele não substitui testes de integração real ou de navegador.
- O arquivo PTBR.tar.gz recebido **não foi incorporado ao repositório nesta entrega**. Não anunciar a nova análise como disponível até a carga real do motor e dos dados.
- A triagem observa presença de formas do léxico, dificuldades, expressões e token `que`; este último **não** comprova oração subordinada ou função sintática.
- A versão da triagem fica em memória, não armazena manuscrito fora do aparelho. `run()` compara o texto integral com a versão triada, processa somente lentes sinalizadas, valida Findings por posição e pode ser cancelado.

## Ordem de integração
1. Extrair e conferir SHA-256 de todos os JSON de `PTBR/dados/_proveniencia.json`. Executar `node PTBR/testes/run.js` e `node PTBR/testes/integracao.js`.
2. Auditar efeitos globais antes do transplante: `classes-morfologia.js` adiciona polyfills a `String.prototype` e `Array.prototype`; o polyfill de `matchAll` acessa `RegExp.flags`, não garantido no piso ES5. Isolar e testar em Safari/iOS antigo; não adicionar polyfills globais à main sem necessidade.
3. Integrar motor/dados com **carga sob demanda** no modo de exame. Não aumentar a inicialização do gabinete com todos os inventários. Garantir que a versão HTML portátil também funcione sem rede e sem módulos modernos; não usar `fetch` como único caminho em navegadores antigos.
4. No texto em edição, agendar somente `triage(texto)` após pausa de 600–800 ms; cancelar durante composição IME. Nenhum Finding completo a cada tecla. Quando o comprimento exceder o limite, mostrar alcance parcial sem fazer parecer que tudo foi examinado.
5. Preservar o painel existente: em tela grande, lateral; em tela pequena, vertical. A roleta apresenta só lentes com sinais. O botão **Análise** inicia a execução serial e mostra resultados por lente à medida que concluem, sem substituir o texto. A triagem não é um parser sintático.
6. Reaproveitar o contrato de Finding, os controles de autoria e o cancelamento já existentes. Não criar armazenamento paralelo dos manuscritos; não alterar gavetas, cadernos e exportação.
7. Antes de ativar: testes do pacote, `node ptbr/teste-triagem.js`, testes atuais do Escrevaral, instalação offline em perfil limpo, HTML portátil em modo avião e verificação de composição/acento, foco, pouca memória e dispositivo legado.

**Regra de publicação:** uma etapa técnica verde não autoriza dizer que a funcionalidade está disponível na interface. Documentar separadamente testes locais, automáticos e em dispositivo real.
