# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-28

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- preview: `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: intactos;
- Gates 1 a 9B: verdes;
- navegadores obrigatórios: Chromium e Firefox;
- matriz atual: 86 cenários por navegador, 172 execuções;
- workflow final: `30417867701`;
- engines integradas: Revisão, Espelho de Voz, Contexto e RimaLab;
- exportações aprovadas: TXT, Markdown e HTML;
- cópia nativa aprovada: schema `escrevaral.mass-notes-next.backup`, versão `1`;
- próximo gate proposto: Palavras/Léxico.

## Decisões permanentes

1. Tiptap/ProseMirror é o motor de edição.
2. JSON Tiptap é a fonte estrutural; HTML, Markdown e texto são derivados.
3. IndexedDB é a fonte principal; localStorage serve a preferências e recuperação emergencial.
4. Nenhuma aba pode sobrescrever outra silenciosamente.
5. Engines não conhecem React, Tiptap ou DOM; entram por adaptadores tipados.
6. Toda análise é local e apresentada como hipótese de trabalho.
7. Nenhuma engine aplica ou substitui texto automaticamente.
8. Offsets linguísticos usam UTF-16 e nascem do Node ProseMirror real.
9. Decorations ficam fora do JSON autoral e são removidas quando o conteúdo muda.
10. A preview é produto de build e nunca recebe correção direta.
11. `npm ci`, lockfile e versões Tiptap exatas integram o contrato de reprodução.
12. Documentação, testes e evidências fazem parte da definição de pronto.
13. A Anatomia original permanece fonte e o runtime é gerado na CI.
14. Exportadores vivem em `src/export/`; regras de formato não entram no App ou rail.
15. Backup vive em `src/backup/`; persistência conhece somente documentos já validados.
16. Um envelope inválido é rejeitado integralmente antes de qualquer escrita.
17. Restauração nunca reutiliza IDs de origem nem substitui documentos existentes.
18. Mudança do contrato de backup exige nova versão ou migrador explícito.
19. O `.esc` legado não é equivalente ao envelope novo e exige adaptador próprio.
20. O canvas Blueprint é ambiente; o manuscrito permanece o objeto principal.

## Contrato de documento

Cada documento mantém pelo menos:

- `id`;
- `title`;
- `content` em JSON Tiptap;
- `plainText` derivado;
- `status`;
- `tags`;
- `favorite`;
- `createdAt` e `updatedAt`;
- `revision`;
- eventual `legacySourceId`.

## Contrato de cópia nativa

Envelope versão 1:

- `schema`: `escrevaral.mass-notes-next.backup`;
- `version`: `1`;
- `app`: `mass-notes-next`;
- `exportedAt`: timestamp;
- `documents`: lista não vazia.

Validação obrigatória:

- JSON válido;
- schema e app reconhecidos;
- versão suportada;
- data válida;
- documentos completos;
- conteúdo Tiptap com raiz `doc`;
- estados, tags, favorito, datas e revisão válidos;
- IDs de origem únicos dentro do envelope.

Restauração:

- usa transação IndexedDB de escrita somente depois da validação;
- usa `add`, não `put` sobre identidades importadas;
- gera UUID novo para cada item;
- adiciona `— restaurado` ao título;
- reinicia revisão local em zero;
- não troca a página ativa automaticamente;
- atualiza a biblioteca pelo BroadcastChannel existente.

## Incidentes relevantes

- O protótipo artesanal exigiu correções repetidas de cursor, Enter, Backspace, paste e histórico; foi substituído por Tiptap.
- O QA encontrou perda silenciosa entre abas; conflitos passaram a preservar as duas versões.
- Firefox revelou condições temporais em autosave, tema, paste e troca de documentos; por isso permanece obrigatório.
- A preview ficou branca por cache apontando para assets hash removidos; publicação passou a usar assets estáveis, purge e smoke público.
- O primeiro ciclo do Gate 9A teve uma asserção HTML com espaço incorreto; o teste foi corrigido sem alterar o exportador.
- A primeira execução do Gate 9B teve 171 aprovações e uma falha temporal antiga do Gate 7 no Firefox; a repetição integral terminou 172/172 verde.

## Limitações conhecidas

Ainda não estão aprovados:

- importação do `.esc` legado;
- criptografia ou senha de backup;
- seleção parcial ou merge de restauração;
- DOCX, RTF, ePub e Obsidian ZIP;
- service worker/offline em nova sessão;
- Tauri e SQLite;
- paginação física;
- decorations para Voz, Contexto ou RimaLab;
- aplicação automática de sugestões;
- promoção para a entrada pública.

## Como retomar

1. conferir branch, PR e workflow mais recente;
2. ler `PLAN.md`, este arquivo e o log mais recente;
3. instalar com `npm ci`;
4. não tocar diretamente na branch de preview;
5. não alterar engines ou bases para fazer teste passar;
6. preservar JSON Tiptap como fonte estrutural;
7. registrar nova versão antes de mudar o envelope nativo;
8. iniciar o Gate 10 somente após inventariar engine e bases de Palavras/Léxico.
