# Escrevaral — mesa de escrita

Baixe [astra/escrevaral.html](astra/escrevaral.html) e abra o arquivo no navegador. A mesa inteira está nele: escrever, guardar e examinar sem conexão. Use Ajustes → Baixar cópia de segurança para guardar o acervo fora do navegador.

Para retomar o desenvolvimento: [memória operacional](PROJECT.md), [filosofia de trabalho](astra/FILOSOFIA-DE-TRABALHO.md) e [instruções para agentes](AGENTS.md).

Esta branch contém uma implementação independente, construída pela [Constituição](astra/CONSTITUICAO.md). Entrada nova: `astra/index.html` (arquivos separados) ou `astra/escrevaral.html` (arquivo portátil). A entrada herdada na raiz pertence ao produto anterior; não é esta entrega.

- Navegação por mês, dia e notas; busca global; criação fixa com segundos e várias folhas por minuto.
- Folha e acervo locais; exportação `.txt`/`.json`; importação como novas folhas.
- Treze lentes sob demanda, em Convenções, Gramática, Escolhas de escrita e Poesia. Incluem crase, concordância delimitada, infinitivo contextual, repetição próxima e ritmo. [Cobertura e critérios](astra/MATURACAO.md).
- Base PT-BR local: 884 formas verbais, 1.447 locuções e 18 observações decoloniais ativas; evidência, ambiguidade e limites; nenhuma reescrita.
- Papel gesso/grafite, interface unificada e Courier Prime incorporada só no editor; som opcional, desligado por padrão.
- HTML, CSS e JavaScript ES5, sem dependências no produto.

Teste a entrega com `node astra/testes/run.js`. O Node serve somente à manutenção, nunca à escrita. Resultado verificado na entrega de engines de 10/09/2026: 450 verificações, incluindo 168 casos do corpus original e 47 de transplante; zero falhas. Compatibilidade física com aparelhos antigos e renderização em navegador ainda não verificadas.

[Fase 2: cobertura e pendências](astra/FASE2.md) · [Decisões, fontes e limites](astra/DECISOES.md) · [Bancada](astra/testes/README.md) · [Continuação](astra/HANDOFF.md)

Branch solicitada: `astra/escrevaral-master`. Ela já existia em `816ca7e`; foi preservada e avançada sem reset. A comparação linguística autorizada em 10/09/2026 inventariou 68 branches; as alterações ficaram nesta branch. [Revisão online privada](https://escrevaral-review.rafamass975189.chatgpt.site).

Criado para Rafa Mass / Escrevaral. A licença existente do repositório permanece aplicável.
