# Escrevaral

Uma oficina local para escrever em português brasileiro, construída com HTML, CSS e JavaScript ES5. A aparência usa papel sage, tinta nanquim e tipografia nativa. A manutenção depende de módulos pequenos, contratos explícitos e decisões registradas.

**Esta branch é a reconstrução, versão 0.1.** A produção continua em [escrevaral.com](https://escrevaral.com). A referência anterior está em [vaultOUT26](https://github.com/rfmss/escrevaral/tree/vaultOUT26), fixada no commit `53c4afe5090f3bcdc3a5fac9bd920c4783a2acae`. O código desta árvore foi escrito para a base nova; ainda não contém o cofre linguístico.

## O que já funciona

Uma Mesa de texto simples com título, gravação após pausa, cópia de recuperação por sessão, revisão anterior e exportação `.txt`. Ctrl/Cmd+S solicita gravação. Uma falha de armazenamento mantém o rascunho disponível para copiar ou baixar. Seleção e composição de acentos permanecem com o campo nativo; a interface não reescreve o texto durante a digitação.

Dados desta frente usam `escrevaral.next.mesa.v1.`. Ela não migra nem altera as chaves do site antigo. O modo portátil funciona com arquivos incorporados; a persistência de arquivos locais depende do navegador, e a interface informa falhas. A cópia baixada deve ser mantida pelo autor.

Ainda faltam cadernos, migração, importação, motores, formatação, impressão e instalação PWA. Há detecção de conflitos e cópias independentes por sessão; não há transação atômica entre abas em localStorage. Recuperações não têm limpeza automática neste primeiro lote. Esta fatia não substitui o produto em uso.

## Rodar e conferir

Node 22+ apenas no desenvolvimento. O aplicativo entregue não usa npm, CDN ou framework.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm start
```

Abra `http://127.0.0.1:8080`. `dist/site/` contém o site estático; `dist/escrevaral-portatil.html` contém os mesmos fontes incorporados para abertura local. O CI disponibiliza os dois como artefato de download, sem mudar o domínio de produção.

`index.html` é a entrada legível. `modules.json` declara a composição privada; o gerador apenas reúne fábricas ES5 e injeta dependências explícitas. Não há carregador genérico ou namespace global do aplicativo. `assets/mesa.js` e `dist/` são gerados e ficam fora do Git. Uma mudança de fonte requer nova montagem.

## Como continuar

Leia [estado](docs/ESTADO.md), [diário de bordo](docs/DIARIO.md) e [arquitetura](docs/ARQUITETURA.md). A [matriz de continuidade](docs/CONTINUIDADE.json) separa funções antigas de funções novas. A [decisão de fundação](docs/decisoes/001-fundacao.md) registra o que está aprovado e o que ainda é hipótese.

O projeto é desenvolvido por Rafa Mass com assistência de modelos de linguagem, decisões explícitas e revisão orientada ao risco. Nenhum teste é apresentado como prova de qualidade literária ou compatibilidade universal. O README descreve o que existe; planos ficam identificados como planos.
