# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-29

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- preview: `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: intactos;
- Gates 1 a 10 e Gate 10.5 de higiene: verdes;
- navegadores obrigatórios: Chromium e Firefox;
- matriz atual: 91 cenários por navegador, 182 execuções;
- cabeça funcional do Gate 10.5: `572af55fc19b59e2c9c9330ce35ccf95be622074`;
- workflows verdes: coerência `30430515120`, Argila `30430515008`, Mass Notes `30430515420`;
- engines integradas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- exportações aprovadas: TXT, Markdown e HTML;
- cópia nativa aprovada: schema `escrevaral.mass-notes-next.backup`, versão `1`;
- próximo gate aprovado: organização da biblioteca.

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
21. A seleção lexical possui ponte própria e tipada; não usa estado global improvisado nem depende de o painel estar montado.
22. O snapshot lexical inclui identidade do documento e posições ProseMirror, além do texto selecionado.
23. Uma definição registrada pode ser consultada sem ocorrência, mas classe contextual não pode ser inventada sem contexto.
24. Uma inferência morfológica sem ocorrência e sem registro local não é apresentada como verbete existente.
25. Palavras/Léxico é somente leitura: não altera JSON, histórico, seleção, autosave ou biblioteca.
26. Tolerâncias geométricas entre navegadores devem considerar arredondamento subpixel sem tolerar overflow real.
27. Testes que verificam saídas derivadas devem sincronizar o estado React, não apenas a árvore DOM visível do editor.
28. O auditor global de versões protege somente a distribuição pública raiz.
29. Aplicações isoladas com build e cache próprios não devem avançar artificialmente a versão pública.
30. PRs mistos continuam obrigados a versionar qualquer JS/CSS público real; exclusões são por prefixo explícito e testado.
31. Alterar a lista de superfícies isoladas exige teste de regressão e documentação do pipeline responsável.

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

## Contrato de seleção lexical

Snapshot em memória:

- `documentId`: impede transportar seleção para outro documento;
- `from` e `to`: posições do estado ProseMirror;
- `text`: recorte normalizado para consulta, limitado a 120 caracteres;
- publicação em `onCreate`, `onUpdate` e `onSelectionUpdate`;
- leitura imediata do último snapshot e assinatura para atualizações futuras.

A superfície Palavras aceita seleção curta ou busca digitada. O adaptador carrega localmente:

- `lexical-engine.js`;
- `lexical-data.json`;
- `norma-data.json`.

Regras defensivas:

- consulta vazia ou longa demais é recusada;
- ocorrências são contadas localmente com normalização de acentos;
- registro explícito é reconhecido pelas bases e chaves declaradas da engine;
- sem ocorrência e sem registro, o fallback morfológico é descartado;
- sem ocorrência, uma leitura apenas provável perde função sintática e classe contextual;
- falha de carregamento gera estado seguro e não interrompe o editor;
- nenhum serviço externo é consultado.

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

## Contrato de fronteiras de distribuição

A aplicação pública raiz usa:

- `index.html` com uma versão única em todas as referências;
- `service-worker.js` com `ASSET_VERSION` igual ao índice;
- `CACHE_NAME` crescente quando a versão pública muda;
- `ui-dialog.js` alinhado ao controlador lexical;
- `scripts/auditor-asset-version.py` para comparar assets públicos com `main`.

O Mass Notes Next usa:

- fonte isolada em `mass-notes-next/`;
- build Vite próprio;
- bundles com hash;
- workflow `Mass Notes Tiptap`;
- branch `preview-mass-notes-tiptap` como produto de build;
- purge e smoke público próprios.

Consequências:

- mudanças exclusivas em `mass-notes-next/` não exigem `ASSET_VERSION` ou `CACHE_NAME` novos na aplicação pública;
- `mass-notes-next/**` é excluído do gatilho do workflow global e do filtro interno do auditor;
- assets públicos fora desse prefixo continuam bloqueando a CI quando mudam sem versão;
- `scripts/test-auditor-asset-version.py` protege a fronteira com casos positivos e negativos;
- não criar tags automáticas para satisfazer auditoria.

## Incidentes relevantes

- O protótipo artesanal exigiu correções repetidas de cursor, Enter, Backspace, paste e histórico; foi substituído por Tiptap.
- O QA encontrou perda silenciosa entre abas; conflitos passaram a preservar as duas versões.
- Firefox revelou condições temporais em autosave, tema, paste e troca de documentos; por isso permanece obrigatório.
- A preview ficou branca por cache apontando para assets hash removidos; publicação passou a usar assets estáveis, purge e smoke público.
- O primeiro ciclo do Gate 9A teve uma asserção HTML com espaço incorreto; o teste foi corrigido sem alterar o exportador.
- A primeira execução do Gate 9B teve 171 aprovações e uma falha temporal antiga do Gate 7 no Firefox; a repetição integral terminou 172/172 verde.
- No início do Gate 10, testes abriram o botão móvel também no desktop e uma regressão antiga fixava seis abas; ambos os contratos de teste foram corrigidos.
- A palavra “melancolia” revelou que a engine podia inferir `Verbo (imperfeito)` sem uma ocorrência no texto. O adaptador passou a separar definição registrada de classe contextual.
- O primeiro fluxo de seleção lexical dependia de evento efêmero e perdia o recorte quando Palavras ainda não estava montado. A ponte durável substituiu esse desenho.
- Uma regravação ampla demais simplificou acidentalmente a suíte do RimaLab. A cobertura robusta anterior foi restaurada integralmente, mudando somente a contagem para sete abas.
- A penúltima execução terminou com 180/182 porque `getBoundingClientRect()` diferiu cerca de 0,2 px entre engines. O teste passou a aceitar 1 px de arredondamento, mantendo verificações rígidas do documento e do rail.
- O workflow `30420965045` concluiu a cabeça funcional do Gate 10 com 182/182, publicação, cache e verificação pública verdes.
- A primeira validação da cabeça documental teve 181/182 no Firefox porque o fixture de exportação verificava a DOM Tiptap antes de o estado React receber o conteúdo. O helper passou a salvar o documento-base, aguardar a alteração estruturada e salvar novamente antes do download.
- O workflow `30422368445` validou a cabeça final do Gate 10 com 182/182 e preview pública verde.
- O auditor global tratava qualquer `.js` ou `.css` do monorepo como asset público e exigia versão global para os estilos do Mass Notes. A fronteira foi corrigida em vez de criar uma versão pública falsa.
- O workflow `30430515120` aprovou três regressões e confirmou zero assets públicos alterados; Argila `30430515008` e Mass Notes `30430515420` permaneceram verdes.

## Limitações conhecidas

Ainda não estão aprovados:

- importação do `.esc` legado;
- criptografia ou senha de backup;
- seleção parcial ou merge de restauração;
- DOCX, RTF, ePub e Obsidian ZIP;
- catálogo de sinônimos na superfície nova de Palavras;
- análise sintática de frases na superfície nova de Palavras;
- service worker/offline em nova sessão;
- Tauri e SQLite;
- paginação física;
- decorations para Voz, Contexto, RimaLab ou Palavras;
- aplicação automática de sugestões;
- promoção para a entrada pública.

## Como retomar

1. conferir branch, PR e workflows mais recentes;
2. ler `PLAN.md`, este arquivo e o log mais recente;
3. instalar com `npm ci`;
4. não tocar diretamente na branch de preview;
5. não alterar engines ou bases para fazer teste passar;
6. preservar JSON Tiptap como fonte estrutural;
7. registrar nova versão antes de mudar o envelope nativo;
8. preservar `lexicalSelectionBridge.ts` como fronteira entre editor e Palavras;
9. não reclassificar palavra ausente como se houvesse contexto;
10. não avançar versão pública por mudanças exclusivas de `mass-notes-next/`;
11. manter testes da fronteira do auditor ao alterar pipelines ou diretórios isolados;
12. iniciar o Gate 11 inventariando filtros e campos já existentes na biblioteca.
