# Mass Notes Next — Gate 9A: exportação estrutural mínima

Data: 2026-07-28

## Decisão de produto

O Mass Notes Next passa a permitir que a pessoa retire o documento atual do navegador em três formatos simples e abertos:

- Texto (`.txt`);
- Markdown (`.md`);
- Página HTML (`.html`).

A geração é local. O manuscrito não é enviado para serviços externos.

## Promessa deste gate

A pessoa pode exportar o documento atual sem perder a estrutura básica já existente no editor e sem alterar o original salvo no Escrevaral.

O produto preserva, conforme a capacidade de cada formato:

- título;
- situação e tags;
- títulos internos;
- parágrafos e quebras autorais;
- ênfases;
- links seguros;
- citações;
- listas simples, numeradas e aninhadas;
- caracteres brasileiros, Unicode e emoji.

## Linguagem da interface

A interface apresenta formatos pelo uso humano, seguido da extensão:

- `Texto (.txt)`;
- `Markdown (.md)`;
- `Página (.html)`.

A explicação informa que os arquivos são gerados localmente a partir da estrutura do documento.

Página vazia não gera erro enganoso. O produto informa que título e metadados ainda serão preservados.

## Limites honestos

Este gate não promete:

- fidelidade tipográfica de processador de texto;
- DOCX;
- RTF;
- ePub;
- arquivo para KDP;
- pacote de Obsidian;
- exportação de toda a biblioteca;
- cópia de segurança restaurável;
- sincronização ou publicação na internet.

TXT é deliberadamente simples. Ele não simula rich text.

Markdown e HTML preservam apenas elementos suportados pelo editor atual e aprovados pelos testes do gate.

## Segurança e privacidade

- nenhuma requisição de rede é necessária para gerar os arquivos;
- conteúdo HTML é escapado;
- scripts e atributos perigosos não entram no arquivo exportado;
- links só permanecem ativos para `http`, `https`, `mailto` e `tel`;
- links rejeitados preservam o texto visível;
- o download não altera o documento, histórico ou armazenamento.

## Critérios de aceite

1. os três formatos aparecem juntos na área de ferramentas;
2. cada botão produz o nome e a extensão corretos;
3. o conteúdo deriva do JSON Tiptap;
4. estruturas básicas permanecem reconhecíveis no arquivo;
5. Unicode, acentos e emoji sobrevivem;
6. página vazia gera arquivo válido;
7. exportar não modifica o manuscrito;
8. o painel funciona em desktop e drawer móvel;
9. Chromium e Firefox aprovam a matriz completa;
10. preview só é publicada depois do gate verde.

## Evidência

Workflow `30415258895`:

- build aprovado;
- 80 cenários no Chromium;
- 80 cenários no Firefox;
- 160 execuções aprovadas;
- publicação da preview aprovada;
- renovação de cache aprovada;
- verificação pública aprovada.

## Próxima decisão

O próximo passo de preservação é um gate separado para cópia nativa e restauração segura.

Esse gate deverá definir:

- envelope versionado;
- validação antes de gravar;
- política de colisão;
- restauração sem apagar a biblioteca atual;
- compatibilidade isolada com `.esc` legado.

Novos formatos editoriais não devem ser misturados com a implementação do backup.
