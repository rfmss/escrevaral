# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-29

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- preview: `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: intactos;
- Gates 1 a 12 e Gate 10.5 de higiene: verdes;
- navegadores obrigatórios: Chromium e Firefox;
- matriz atual: 105 cenários por navegador, 210 execuções;
- cabeça funcional do Gate 12: `70226195cd742b714ad53bb2a9c4cd815210d821`;
- workflows verdes: Mass Notes `30452750643`, Argila `30452747030`, coerência `30452747019`;
- engines integradas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- exportações aprovadas: TXT, Markdown e HTML;
- cópia nativa aprovada: schema `escrevaral.mass-notes-next.backup`, versão `1`;
- biblioteca aprovada: busca, estado, favorito, tag, ordenação, contagem e estado vazio;
- metadados aprovados: edição unitária de estado, favorito e tags no mesmo contrato versionado do documento;
- próximo gate proposto: importação auditável do `.esc` legado.

## Decisões permanentes

1. Tiptap/ProseMirror é o motor de edição.
2. JSON Tiptap é a fonte estrutural; HTML, Markdown e texto são derivados.
3. IndexedDB é a fonte principal; localStorage serve a preferências e recuperação emergencial.
4. Nenhuma aba pode sobrescrever outra silenciosamente.
5. Engines não conhecem React, Tiptap ou DOM; entram por adaptadores tipados.
6. Toda análise é local e apresentada como hipótese de trabalho.
7. Nenhuma engine aplica ou substitui texto automaticamente.
8. Offsets linguísticos usam UTF-16 e nascem do Node ProseMirror real.
9. Decorations ficam fora do JSON autoral e são removidas quando o manuscrito muda.
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
21. A seleção lexical possui ponte própria e tipada; não usa estado global improvisado.
22. Definição registrada pode existir sem ocorrência, mas classe contextual não pode ser inventada.
23. Palavras/Léxico é somente leitura e não altera JSON, histórico, seleção ou autosave.
24. Tolerâncias geométricas consideram arredondamento subpixel sem tolerar overflow real.
25. Testes de saídas derivadas sincronizam o estado React, não apenas a DOM visível.
26. O auditor global de versões protege somente a distribuição pública raiz.
27. Aplicações isoladas com build próprio não avançam artificialmente a versão pública.
28. PRs mistos continuam obrigados a versionar qualquer JS/CSS público real.
29. Alterar superfícies isoladas exige teste de regressão e documentação do pipeline.
30. Consulta e apresentação da biblioteca vivem separadas em `src/library/` e `components/`.
31. Filtros da biblioteca são projeções puras e nunca gravam no documento ou IndexedDB.
32. Aplicar um filtro não pode trocar, fechar ou descartar a página ativa.
33. Busca e equivalência de tags ignoram caixa e acentos sem reescrever os valores autorais.
34. Representante de tags equivalentes deve ser determinístico e independente da ordem recente dos documentos.
35. Ordenação possui desempates explícitos; títulos repetidos não dependem da ordem acidental do banco.
36. Estado, favorito e tags são parte do mesmo `EscrevaralDocument` e da mesma `revision` do manuscrito.
37. Não existe repositório, tabela, autosave ou regra de conflito paralela para metadados.
38. Uma alteração editorial nunca recebe merge silencioso com uma alteração concorrente.
39. `DraftMutationKind` distingue somente efeitos derivados: `manuscript` invalida leituras; `metadata` preserva leituras textuais válidas.
40. Título, `content` Tiptap e `plainText` são mutações de manuscrito.
41. Estado, favorito e tags são mutações editoriais.
42. Mudança editorial atualiza `updatedAt`, incrementa `revision`, participa da recuperação emergencial e é transmitida por BroadcastChannel.
43. Atualização remota limpa de metadados não desmonta o editor, não reinicia o mapa de posições e não apaga decorations válidas.
44. Se há rascunho local sujo, qualquer revisão remota mais nova abre conflito, independentemente do campo alterado.
45. Resolver conflito carregando a outra aba só reinicia o editor quando o manuscrito realmente difere.
46. Guardar conflito como cópia preserva integralmente a versão local e gera identidade nova.
47. Favorito é uma ação unitária explícita.
48. Tags são aplicadas como conjunto atômico, não salvas caractere por caractere.
49. Tags são limitadas a 8 itens de 32 caracteres, deduplicadas por caixa e acentos e removíveis individualmente.
50. Operações em massa, taxonomia automática e hierarquia persistente exigem gates próprios.

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

Não houve migração de schema no Gate 12. Os campos já existiam em documentos novos, restaurados e migrados.

## Contrato de mutações e persistência

A fronteira de coordenação fica no `App.tsx`:

- `DraftMutationKind = 'manuscript' | 'metadata'`;
- `dirtyKindRef` acumula a categoria mais forte enquanto há alterações não salvas;
- se qualquer mudança de manuscrito ocorre no lote, a publicação é classificada como `manuscript`;
- `saveDocument(current, current.revision)` continua sendo a única gravação normal;
- sucesso incrementa revisão, limpa recuperação e publica `{ id, revision, kind }`;
- conflito continua sendo detectado pelo repositório com revisão esperada;
- o canal não contém o documento nem autoriza gravação: ele apenas anuncia que a fonte IndexedDB mudou.

Efeitos derivados:

- `manuscript`: limpa Revisão, issues, decorations, navegação e pode reiniciar o editor em atualização remota;
- `metadata`: mantém posição estrutural, Tiptap montado, seleção e leituras baseadas no mesmo conteúdo;
- mensagens antigas sem `kind` usam comparação defensiva de título, `plainText` e JSON Tiptap para inferir o efeito correto.

## Contrato do editor de metadados

Superfície: `src/components/DocumentMetadataEditor.tsx`, dentro da aba Pulso.

Favorito:

- botão com `aria-pressed`;
- alternância imediata da página ativa;
- participa do autosave normal;
- aparece nos cartões e no filtro após a atualização da biblioteca.

Tags:

- entrada textual separada por vírgulas;
- `parseLibraryTags` normaliza espaços, limita comprimento e quantidade;
- equivalência usa `normalizeLibraryText`;
- a primeira grafia informada no conjunto é preservada;
- salvar aplica o conjunto completo de uma vez;
- remoção por chip gera nova alteração editorial unitária;
- lista vazia remove todos os marcadores;
- nenhum valor é enviado para serviço externo.

Estado:

- os chips já existentes passam a usar a categoria `metadata`;
- mudar estado não invalida a leitura linguística;
- o valor continua no documento, backup, cartões e filtros.

## Contrato de organização da biblioteca

Camada pura: `src/library/libraryQuery.ts`.

- combina `search`, `status`, `favoritesOnly`, `tag` e `sort`;
- retorna nova lista sem modificar a entrada;
- busca em título, texto derivado, tags e estado;
- normaliza somente para comparação, preservando dados armazenados;
- variantes equivalentes aparecem uma vez no filtro;
- ordenações usam desempates explícitos;
- página ativa fora do recorte gera aviso, mas permanece aberta;
- filtros não alteram rascunho, seleção, histórico, autosave ou revisão.

As mudanças do Gate 12 aparecem na biblioteca somente depois de passar pelo mesmo estado React e pelo autosave; não há escrita direta a partir do rail esquerdo.

## Contrato de seleção lexical

Snapshot em memória inclui `documentId`, posições ProseMirror e texto normalizado. A superfície Palavras carrega localmente `lexical-engine.js`, `lexical-data.json` e `norma-data.json`. Sem ocorrência e sem registro, fallback morfológico é descartado. Nenhum serviço externo é consultado.

Mudar apenas estado, favorito ou tags não altera a seleção lexical nem o conteúdo consultado.

## Contrato de cópia nativa

Envelope versão 1 usa schema `escrevaral.mass-notes-next.backup`, app `mass-notes-next`, data e lista não vazia de documentos. Validação ocorre antes de qualquer transação. Restauração usa `add`, gera UUID novo, acrescenta `— restaurado`, reinicia revisão e não troca a página ativa.

Estado, favorito e tags editados no Gate 12 integram a próxima cópia nativa porque já pertencem ao documento versionado; nenhuma alteração no schema foi necessária.

## Contrato de fronteiras de distribuição

A aplicação pública raiz usa versão única em `index.html`, `ASSET_VERSION`, `CACHE_NAME` crescente e auditor próprio. O Mass Notes usa fonte isolada, build Vite, bundles hashados, workflow e preview próprios. Mudanças em `mass-notes-next/` não exigem versão pública; assets públicos reais continuam auditados.

## Incidentes relevantes

- O editor artesanal foi substituído por Tiptap após falhas recorrentes de cursor, paste e histórico.
- Conflitos entre abas passaram a preservar as duas versões após perda silenciosa detectada em QA.
- Firefox permanece obrigatório por revelar condições temporais não vistas no Chromium.
- A preview passou a usar publicação controlada, purge e smoke público após cache apontar para hashes removidos.
- Gate 9B exigiu repetição por falha temporal antiga; a cabeça final ficou 172/172.
- Gate 10 substituiu evento lexical efêmero por bridge durável e separou definição de classe contextual.
- A suíte robusta do RimaLab foi restaurada após simplificação acidental durante o Gate 10.
- Gate 10 terminou 182/182 após corrigir arredondamento subpixel e sincronização de exportação.
- Gate 10.5 separou o auditor público do build Vite isolado, sem criar versão falsa.
- Gate 11 estabilizou nomes acessíveis, texto exato de títulos e canonicalização de tags antes de concluir 196/196.
- A primeira execução do Gate 12 concluiu os 210 casos, mas teve 12 falhas: quatro testes antigos fixavam a palavra “escreveu”, três cenários por navegador presumiam que o documento inicial já estivesse no localStorage e um cenário por navegador usava “Pronto” sem distinguir filtro de estado editorial.
- A mensagem de conflito mais ampla foi preservada; os testes antigos passaram a verificar “alterou”.
- O helper do Gate 12 passou a descobrir o documento ativo por chave lembrada, título atual ou registro mais recente, sem impor comportamento inexistente ao produto.
- Controles de estado nos testes passaram a ser localizados dentro de `#panel-pulso`.
- O workflow `30452750643` concluiu o Gate 12 com 210/210, publicação, cache e verificação pública verdes.

## Limitações conhecidas

Ainda não estão aprovados:

- edição ou exclusão de metadados em massa;
- filtros salvos entre sessões;
- pastas, coleções ou hierarquia persistente;
- taxonomia ou sugestão automática de tags;
- merge campo a campo entre abas;
- importação do `.esc` legado;
- criptografia ou senha de backup;
- seleção parcial ou merge de restauração;
- DOCX, RTF, ePub e Obsidian ZIP;
- catálogo de sinônimos e análise sintática de frases em Palavras;
- sincronização em nuvem e colaboração;
- service worker/offline em nova sessão;
- Tauri, SQLite e paginação física;
- decorations para Voz, Contexto, RimaLab ou Palavras;
- aplicação automática de sugestões;
- promoção para a entrada pública.

## Como retomar

1. conferir branch, PR e workflows mais recentes;
2. ler `PLAN.md`, este arquivo e o log mais recente;
3. instalar com `npm ci`;
4. não tocar diretamente na branch de preview;
5. preservar JSON Tiptap como fonte estrutural;
6. não alterar engines ou bases para fazer teste passar;
7. não avançar versão pública por mudanças exclusivas de `mass-notes-next/`;
8. preservar `src/library/libraryQuery.ts` como fronteira pura da organização;
9. preservar uma única gravação versionada para manuscrito e metadados;
10. não invalidar leitura linguística quando apenas estado, favorito ou tags mudarem;
11. não fazer merge silencioso entre revisões concorrentes;
12. antes do Gate 13, inventariar o formato `.esc` legado real e documentar conversão e rejeição atômica.
