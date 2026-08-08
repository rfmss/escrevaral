# Gate 13 — importação auditável do `.esc` legado

Data: 2026-07-29

## Objetivo

Reconectar o acervo do Escrevaral antigo ao Mass Notes Next sem confundir formatos, sobrescrever documentos atuais ou aceitar conversões parciais silenciosas.

## Inventário do formato real

O formato legado foi localizado em:

- `vrda-engine.js`;
- `backup-engine.js`;
- `archive-engine.js`.

Envelope suportado:

- JSON;
- `format: "esc"` ou `format: "vrda"`;
- `schemaVersion: 1`;
- `checksum` FNV-1a hexadecimal de oito caracteres;
- checksum calculado sobre `JSON.stringify(stableSort(payload))`;
- `payload.manuscripts` como lista não vazia.

O formato legado não é equivalente à cópia nativa `escrevaral.mass-notes-next.backup`.

## Decisões de produto

1. Selecionar um arquivo não autoriza gravação.
2. O arquivo inteiro é validado antes de qualquer transação.
3. A prévia permanece somente em memória.
4. Cancelar não altera a biblioteca.
5. A confirmação importa o lote inteiro ou nenhum item.
6. Cada documento recebe UUID novo.
7. Nenhum documento existente é substituído.
8. `legacySourceId` preserva a origem, mas não funciona como identidade atual ou chave de merge.
9. Reimportação não recebe deduplicação silenciosa.
10. Não existe importação parcial, escolha automática de versão ou merge campo a campo.

## Implementação

### Parser e plano

Criado `src/import/legacyEscImport.ts`.

Responsabilidades:

- ler JSON localmente;
- validar formato, versão, payload, checksum e limite;
- exigir ID legado não vazio e único no lote;
- exigir conteúdo textual em `text` ou `content`;
- converter texto por `plainTextToContent`;
- mapear estado, tags, favorito e datas;
- construir `LegacyEscImportPlan` sem conhecer React ou IndexedDB.

Limite defensivo: 2.000 manuscritos por arquivo.

### Mapeamento editorial

Estado:

- pronto, finalizado, publicado ou concluído → `Pronto`;
- corte, revisão ou edição → `Em corte`;
- demais valores → `Rascunho`.

Favorito:

- `favorite` ou `pinned` verdadeiro → favorito.

Tags:

- normalizadas pelo contrato existente da biblioteca;
- quantidade e comprimento seguem os limites atuais.

Datas:

- datas válidas são preservadas no plano;
- valores inválidos recebem fallback previsível.

### Transação

Criada `importLegacyDocumentsAsCopies` em `src/storage/documentRepository.ts`.

- uma transação `readwrite` para o lote inteiro;
- exige `legacySourceId` em cada item;
- gera UUID novo;
- acrescenta `— importado` ao título;
- inicia `revision: 0`;
- usa `add`;
- publica BroadcastChannel somente depois do sucesso integral.

### Interface

O `BackupPanel` recebeu a seção “Trazer acervo antigo”.

- seletor restrito a `.esc`;
- prévia com quantidade, formato e até cinco documentos;
- título, tipo legado, palavras e estado convertido;
- confirmação explícita;
- cancelamento;
- mensagens por `role=status`;
- layout responsivo no drawer móvel.

Criada `src/styles/legacy-import.css`.

## Testes

Criado `tests/gate13-legacy-import.spec.ts` com seis cenários por navegador:

1. seleção válida cria prévia sem escrita e cancelamento preserva a biblioteca;
2. confirmação cria novas cópias e preserva metadados/origem;
3. checksum inválido rejeita todo o lote;
4. IDs duplicados e versão futura não gravam;
5. reimportação cria novas cópias sem merge silencioso;
6. painel móvel não apresenta overflow e mantém foco reversível.

Matriz total:

- 111 cenários por navegador;
- 222 execuções.

## Incidente de estabilização

Primeira execução:

- 219/222 aprovados;
- os seis cenários do Gate 13 passaram em ambos os navegadores;
- duas falhas pertenciam ao Gate 9B, que ainda exigia exatamente duas ações no painel de cópia;
- o novo importador tornou três ações o comportamento correto;
- uma falha temporal isolada ocorreu no Gate 12 móvel no Firefox, com botão de tags ainda estabilizando.

Ajuste realizado:

- Gate 9B passou a esperar as três ações legítimas;
- nenhuma regra do importador foi enfraquecida;
- a matriz completa foi repetida.

## Evidência funcional

Cabeça: `323e8a1e131a3692932e960e9285570df49a1460`.

- Mass Notes `30457008816`: build, Chromium, Firefox, 222/222, publicação, cache e smoke público verdes;
- Argila `30457009394`: verde;
- coerência `30457008762`: verde.

## Limitações honestas

Não foram aprovados:

- reimportação seletiva;
- comparação de versões legadas;
- deduplicação por `legacySourceId`;
- importação parcial;
- merge com documentos existentes;
- preservação de estrutura rica inexistente no texto legado;
- DOCX, RTF, ePub ou Obsidian ZIP;
- criptografia de importação.

## Encerramento

O Gate 13 está funcionalmente aprovado. Seu fechamento documental integra o início do milestone M0.9, que repetirá a validação na cabeça documental e transversal exata.
