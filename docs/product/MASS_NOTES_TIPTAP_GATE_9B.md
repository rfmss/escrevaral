# Mass Notes Tiptap — Gate 9B

## Decisão

O Mass Notes Next passa a possuir uma cópia nativa versionada da biblioteca e uma restauração exclusivamente não destrutiva.

## Contrato do envelope

- `schema`: `escrevaral.mass-notes-next.backup`;
- `version`: `1`;
- `app`: `mass-notes-next`;
- `exportedAt`: timestamp numérico;
- `documents`: lista não vazia de documentos completos.

Cada documento preserva o JSON Tiptap como fonte estrutural, além de texto derivado, título, situação, tags, favorito, datas, revisão e eventual referência legada.

## Contrato de restauração

- a validação do envelope inteiro antecede qualquer escrita;
- erro em um item invalida toda a operação;
- identidades de origem nunca são reutilizadas;
- todo documento restaurado recebe novo UUID;
- nenhum documento existente é atualizado ou removido;
- a página ativa não é substituída automaticamente;
- a restauração é registrada como nova cópia local.

## Compatibilidade

A versão 1 deve permanecer legível enquanto o contrato do documento continuar compatível. Uma mudança estrutural futura exige versão nova ou migrador explícito; não é permitido reinterpretar silenciosamente um envelope antigo.

O formato `.esc` do Escrevaral anterior não é tratado como equivalente ao envelope novo. Compatibilidade legada deverá entrar por adaptador separado, com política explícita para campos que não possuam correspondência segura.

## Segurança

O arquivo é local e não contém execução de código. A validação rejeita schema desconhecido, versão não suportada, documentos incompletos, estrutura Tiptap inválida e identificadores duplicados. O formato não oferece criptografia; quem possuir o arquivo poderá ler seu conteúdo.

## Evidência

Workflow `30417329783`, segunda tentativa: build, Chromium, Firefox, publicação, cache e verificação pública aprovados; 86 cenários por navegador e 172 execuções verdes.

## Fora do gate

- criptografia ou senha;
- sincronização em nuvem;
- merge com documentos existentes;
- seleção parcial;
- importação `.esc` legada;
- DOCX, RTF, ePub ou Obsidian ZIP.
