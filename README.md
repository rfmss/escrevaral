# Escrevaral — mesa Astra

Baixe [astra/escrevaral.html](astra/escrevaral.html) e abra o arquivo no navegador. A mesa inteira está nele: escrever, guardar e examinar sem conexão. Use Ajustes → Baixar cópia de segurança para guardar o acervo fora do navegador.

Esta branch contém uma implementação independente, construída pela [Constituição](astra/CONSTITUICAO.md). Entrada nova: `astra/index.html` (arquivos separados) ou `astra/escrevaral.html` (arquivo portátil). A entrada herdada na raiz pertence ao produto anterior; não é esta entrega.

- Folha e acervo locais; exportação `.txt`/`.json`; importação como novas folhas.
- Três lentes sob demanda: ortografia, acentuação e pontuação mecânica.
- Quatro regras identificadas; evidência, ambiguidade e limites; nenhuma reescrita.
- Tema de roteiro e som opcional, desligado por padrão.
- HTML, CSS e JavaScript ES5, sem dependências no produto.

Teste a entrega com `node astra/testes/run.js`. O Node serve somente à manutenção, nunca à escrita. Resultado verificado: 196 verificações, incluindo 168 casos do corpus; zero falhas. Compatibilidade física com aparelhos antigos e renderização em navegador ainda não verificadas.

[Decisões, fontes e limites](astra/DECISOES.md) · [Bancada](astra/testes/README.md) · [Continuação](astra/HANDOFF.md)

Branch solicitada: `astra/escrevaral-master`. Ela já existia em `816ca7e`; foi preservada e avançada sem reset. Nenhuma outra branch foi alterada ou consultada para reutilizar implementação. Não houve implantação no domínio público.

Criado para Rafa Mass / Escrevaral. A licença existente do repositório permanece aplicável.
