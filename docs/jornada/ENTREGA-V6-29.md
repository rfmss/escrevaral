# v6-29 — transporte e seleção com alternativas (C04)

Base: main `45306a2df8ef0501fa1d98070ebdb5fd3298ee79`. Rafael autorizou continuar o próximo passo lógico. Frente ASTRA 2 permanece isolada; nenhum arquivo da prova lexical foi alterado.

## Mudanças

- Novo módulo ES5 `src/ui/transferencia.js`: download com Blob/URL (incluindo alternativa webkitURL e msSaveBlob), liberação da URL, tratamento de falhas de leitura e seleção com verificação/alternativa por propriedades.
- Sem download disponível, os Ajustes apresentam o conteúdo completo que seria exportado, em campo somente leitura, com nome e seleção manual. Isso inclui pacotes de cadernos/gavetas/acervo, não apenas o manuscrito.
- “Trazer conteúdo copiado” aceita o conteúdo de TXT/JSON/SCRVRL pelo mesmo parser, validação e confirmação do arquivo. Ausência/falha de FileReader deixa mensagem recuperável. Nenhuma importação ocorre apenas por colar ou selecionar um arquivo.
- Exportar caderno/gaveta/acervo usa o snapshot atual da folha sem exigir uma nova gravação no armazenamento. Falta de quota para salvar o texto não impede exportá-lo enquanto os dados existentes continuam legíveis. O texto salvo e o rascunho não são alterados pela exportação.
- Seleção de trechos no painel e no controlador usa a fronteira protegida. Se a seleção programática falhar, localizar/copiar orienta seleção manual; não executa cópia externa de uma seleção errada.

## Revisão das capacidades

| Fluxo | Caminho e alternativa | Limite explícito |
| --- | --- | --- |
| Salvar | Persistência existente em localStorage, gravação em chave nova antes de remover a anterior; erros conservam o rascunho. | Sem armazenamento gravável, não prometer salvamento. Exportação TXT continua disponível mesmo sem acervo inicializado. |
| Exportar | Download disponível ou campo de cópia literal. Pacotes incluem snapshot da folha atual. | Pacote precisa de acervo legível; quadro aberto ainda precisa concluir seu flush para não omitir mudanças. IME em curso suspende exportação do pacote. |
| Importar | FileReader ou conteúdo colado; validação, confirmação e transação existentes. | Exige gravação disponível, preservação da folha corrente e limites de entrada; não contorna quota. Preferências globais podem ser substituídas conforme aviso da confirmação. |
| Selecionar/copiar | setSelectionRange ou propriedades de seleção; comando Copiar manual se necessário. | Nenhuma dependência de Clipboard API, Promise ou File System Access. Seleção não modifica o valor. |

Arquivo de importação conserva limite de 50 MB; conteúdo colado recebe também limite de comprimento antes do parser. Não há instalação de grandes pacotes linguísticos nesta entrega: isso pertence a A02. Copiar/salvar manualmente depende das ações do usuário; download solicitado não comprova que o arquivo foi guardado.

## Evidências e publicação

- `tests/transferencia.cjs`: conteúdo literal com Unicode/markup, falhas de Blob/URL/download, liberação de URL, seleção sem edição, FileReader ausente/falhando, snapshot de exportação sem gravação e confirmação de importação. Exercita funções reais do controlador.
- `tests/cadernos.cjs`: formatos, ida/volta, identidade, conflitos, quota/rollback e recuperação existentes.
- `tests/ptbr-visual.cjs`: integração da seleção com motor real e DOM simulado, preservando texto e ocorrência; não é teste visual de navegador.
- `tests/controles-static.cjs`, `npm run build:check`, `git diff --check`: ES5, hashes e distribuição reproduzível.
- Estados: implementado, integrado e verificado localmente; publicação aguardando confirmação. C04 continua TODO até confirmar a entrega remota.
- Reversão: commit normal do lote e montagem regenerada; sem migração de formatos/chaves.
- Próximo de A1: preparação de A02 (persistência/instalação), integração condicionada à prova A01 e contratos medidos de A2. Não duplicar a seleção de recursos de A2.
