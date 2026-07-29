# Contrato de produto — Mass Notes Tiptap Gate 13

Data: 2026-07-29

## Nome

**Importação auditável do `.esc` legado**

## Problema

Pessoas com acervo do Escrevaral antigo precisam trazer seus manuscritos para a nova fundação sem migração manual, perda silenciosa, sobrescrita ou confusão com a cópia nativa atual.

## Promessa aprovada

O produto aceita o envelope legado real `.esc`/`vrda` versão 1, valida integralmente o arquivo, mostra uma prévia e só grava após confirmação explícita.

A importação sempre cria novas cópias rastreáveis.

## Formato aceito

- JSON;
- `format: "esc"` ou `format: "vrda"`;
- `schemaVersion: 1`;
- checksum FNV-1a hexadecimal de oito caracteres;
- checksum sobre `JSON.stringify(stableSort(payload))`;
- `payload.manuscripts` não vazio;
- máximo defensivo de 2.000 itens.

A cópia nativa `escrevaral.mass-notes-next.backup` é outro contrato e usa parser próprio.

## Validação

Antes de qualquer escrita, o importador valida:

- JSON;
- extensão de arquivo na interface;
- formato;
- versão;
- payload;
- checksum;
- limite do lote;
- ID legado presente;
- unicidade de IDs dentro do lote;
- conteúdo textual recuperável.

Falha em qualquer item rejeita o lote inteiro.

## Prévia

Selecionar arquivo:

- não grava;
- cria plano em memória;
- exibe quantidade e formato;
- mostra até cinco documentos;
- informa título, tipo legado, palavras e estado convertido;
- permite cancelar.

Cancelar descarta o plano e preserva integralmente a biblioteca.

## Conversão

- texto legado vira JSON Tiptap por `plainTextToContent`;
- título é preservado quando disponível;
- estado é mapeado conservadoramente;
- tags usam limites e normalização já aprovados;
- `favorite` ou `pinned` verdadeiro vira favorito;
- datas válidas são aproveitadas no plano;
- campos sem equivalente não recebem invenção silenciosa.

## Persistência

A confirmação:

- abre uma transação IndexedDB única;
- importa todos os itens ou nenhum;
- gera UUID novo para cada documento;
- acrescenta `— importado`;
- inicia `revision: 0`;
- preserva `legacySourceId`;
- usa `add`;
- só anuncia a mudança depois do sucesso integral.

## Identidade e conflito

`legacySourceId`:

- é trilha de origem;
- não é ID atual;
- não é chave de merge;
- não autoriza sobrescrita;
- não autoriza deduplicação silenciosa.

Reimportar o mesmo arquivo cria novas cópias. Uma política seletiva futura exige novo gate.

## Privacidade

- leitura e conversão são locais;
- nenhum arquivo é enviado;
- nenhum texto é transmitido para serviço externo.

## Acessibilidade e responsividade

- mensagens usam região de status;
- confirmação e cancelamento são explícitos;
- interface cabe no drawer móvel;
- foco retorna ao acionador ao fechar o drawer;
- Chromium e Firefox são obrigatórios.

## Evidência

Cabeça funcional: `323e8a1e131a3692932e960e9285570df49a1460`.

- Mass Notes `30457008816`: 222/222, publicação, cache e smoke público verdes;
- Argila `30457009394`: verde;
- coerência `30457008762`: verde.

## Fora do contrato

- importação parcial;
- seleção de documentos dentro do lote;
- comparação de versões;
- merge;
- deduplicação automática;
- substituição de documentos atuais;
- conversão de estruturas ricas não representadas no texto legado;
- formatos DOCX, RTF, ePub ou Obsidian ZIP;
- sincronização em nuvem;
- promoção para `main`.

## Relação com o M0.9

O Gate 13 está funcionalmente aprovado. Seu fechamento documental e sua validação transversal passam a integrar o milestone **M0.9 — Candidata Integrada do Escrevaral**.
