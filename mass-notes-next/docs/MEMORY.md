# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-29

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto, mesclável e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: intactos;
- Gates 1 a 13 e Gate 10.5: verdes;
- navegadores obrigatórios: Chromium e Firefox;
- matriz: 111 cenários por navegador, 222 execuções;
- cabeça funcional do Gate 13: `323e8a1e131a3692932e960e9285570df49a1460`;
- workflows verdes: Mass Notes `30457008816`, Argila `30457009394`, coerência `30457008762`;
- próximo gate proposto: preferências locais e retomada previsível da biblioteca.

## Decisões permanentes

1. Tiptap/ProseMirror é o motor de edição e JSON Tiptap é a fonte estrutural.
2. IndexedDB é a fonte principal; localStorage guarda apenas preferências e recuperação emergencial.
3. Nenhuma aba sobrescreve outra silenciosamente.
4. Engines entram por adaptadores tipados, funcionam localmente e não aplicam texto.
5. Offsets linguísticos usam UTF-16 sobre o Node ProseMirror real.
6. Decorations ficam fora do JSON autoral e só são invalidadas quando o manuscrito muda.
7. Exportadores, backups, importadores e consultas vivem em camadas próprias.
8. Cópia nativa e `.esc` legado são formatos diferentes e nunca compartilham parser por conveniência.
9. Documentação, testes e evidências fazem parte da definição de pronto.
10. A preview é produto de build; a branch de preview nunca recebe edição direta.
11. Filtros da biblioteca são projeções puras e não alteram documento ou IndexedDB.
12. Estado, favorito e tags pertencem ao mesmo documento, revisão, autosave e conflito do manuscrito.
13. Mudanças editoriais preservam leituras textuais válidas; mudanças de manuscrito as invalidam.
14. Operações em massa, hierarquia persistente e sincronização exigem gates próprios.
15. Importação sempre valida tudo antes de qualquer escrita.
16. Um lote legado inválido é rejeitado integralmente.
17. Selecionar arquivo legado não autoriza gravação; a confirmação explícita é obrigatória.
18. Importação legada nunca reutiliza IDs atuais nem substitui documentos existentes.
19. `legacySourceId` é trilha de origem, não identidade atual nem chave de merge.
20. Reimportação não recebe deduplicação silenciosa ou merge automático.

## Contrato do documento

Cada documento mantém:

- `id` atual em UUID;
- `title`;
- `content` Tiptap;
- `plainText` derivado;
- `status`, `tags` e `favorite`;
- `createdAt`, `updatedAt` e `revision`;
- `legacySourceId` opcional.

## Contrato do `.esc` legado

Fonte real inventariada nos arquivos raiz `vrda-engine.js`, `backup-engine.js` e `archive-engine.js`.

Envelope suportado:

- `format`: `esc` ou `vrda`;
- `schemaVersion`: exatamente `1`;
- `checksum`: FNV-1a hexadecimal de oito caracteres;
- checksum calculado sobre `JSON.stringify(stableSort(payload))`;
- `payload.manuscripts`: lista não vazia;
- limite defensivo: 2.000 itens por lote.

O parser `src/import/legacyEscImport.ts`:

- lê JSON localmente;
- valida formato, versão, payload, checksum e limite;
- exige `id` legado não vazio e único no lote;
- exige conteúdo textual em `text` ou `content`;
- cria um `LegacyEscImportPlan` em memória;
- não conhece IndexedDB nem React;
- converte texto com `plainTextToContent`;
- mapeia estado de forma conservadora;
- normaliza tags pelos contratos da biblioteca;
- converte `pinned` ou `favorite` para favorito;
- preserva datas válidas e usa fallback previsível.

Mapeamento de estado:

- pronto, finalizado, publicado ou concluído → `Pronto`;
- corte, revisão ou edição → `Em corte`;
- demais valores → `Rascunho`.

## Contrato de prévia e confirmação

Superfície: `BackupPanel`, seção “Trazer acervo antigo”.

- aceita somente nome terminado em `.esc`;
- seleção limpa qualquer plano anterior;
- arquivo válido mostra quantidade, formato e até cinco itens;
- cada item apresenta título, tipo legado, palavras e estado convertido;
- cancelar descarta o plano sem escrita;
- confirmação chama uma única função transacional;
- mensagens são anunciadas por `role=status`;
- a interface cabe no drawer móvel sem overflow.

## Contrato transacional

`importLegacyDocumentsAsCopies`:

- recebe somente documentos já convertidos e validados;
- abre uma transação `readwrite` única;
- exige `legacySourceId` em todos os itens;
- gera UUID novo para cada documento;
- acrescenta `— importado` ao título;
- inicia `revision` em zero;
- atribui novos tempos de criação e atualização em ordem estável;
- mantém `legacySourceId`;
- usa `add`, nunca `put` sobre identidade de origem;
- só publica BroadcastChannel depois do sucesso integral.

Não existem:

- importação parcial;
- substituição de documentos;
- merge campo a campo;
- escolha automática de “mais novo”;
- deduplicação silenciosa entre importações;
- upload externo.

## Cópia nativa versus importação legada

Cópia nativa:

- schema `escrevaral.mass-notes-next.backup`, versão 1;
- preserva JSON Tiptap completo;
- restaura com sufixo `— restaurado`;
- não preserva `legacySourceId` da fonte como identidade de restauração.

Importação legada:

- lê envelope `esc|vrda` v1;
- converte texto simples para JSON Tiptap;
- usa sufixo `— importado`;
- preserva `legacySourceId` somente para auditoria.

## Incidentes do Gate 13

- A primeira matriz ficou em 219/222.
- Dois testes do Gate 9B ainda exigiam exatamente duas ações no painel; o novo importador tornou três ações corretas.
- Um teste móvel do Gate 12 sofreu condição temporal única no Firefox ao clicar em “Salvar marcadores” enquanto o botão ainda estabilizava.
- Todos os seis cenários novos do Gate 13 passaram já na primeira matriz.
- A segunda matriz passou 222/222 sem alterar o contrato do importador.
- Workflow funcional final: `30457008816`.

## Limitações conhecidas

Ainda não estão aprovados:

- persistência de filtros entre sessões;
- reimportação seletiva ou comparação de versões legadas;
- deduplicação automática por `legacySourceId`;
- importação parcial;
- operações em massa;
- pastas ou coleções persistentes;
- DOCX, RTF, ePub e Obsidian ZIP;
- criptografia de backup;
- sincronização em nuvem e colaboração;
- service worker da aplicação nova;
- Tauri, SQLite e paginação física;
- aplicação automática de sugestões;
- promoção para `main`.

## Como retomar

1. conferir branch, PR e workflows;
2. ler `PLAN.md`, este arquivo e o log mais recente;
3. instalar com `npm ci`;
4. não editar a branch de preview;
5. manter importação em `src/import/` e persistência em `src/storage/`;
6. não enfraquecer checksum ou atomicidade para aceitar fixtures;
7. não usar `legacySourceId` como ID atual;
8. iniciar o Gate 14 somente após revisar o contrato de preferências.
