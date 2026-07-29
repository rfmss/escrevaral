# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-29

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- preview: `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: intactos;
- Gates 1 a 11 e Gate 10.5 de higiene: verdes;
- navegadores obrigatórios: Chromium e Firefox;
- matriz atual: 98 cenários por navegador, 196 execuções;
- cabeça funcional do Gate 11: `1e4ca1784b145b510ba6d3749025230d22f7d632`;
- workflows verdes: Mass Notes `30449369857`, Argila `30449371552`, coerência `30449371768`;
- engines integradas: Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico;
- exportações aprovadas: TXT, Markdown e HTML;
- cópia nativa aprovada: schema `escrevaral.mass-notes-next.backup`, versão `1`;
- biblioteca aprovada: busca, estado, favorito, tag, ordenação, contagem e estado vazio;
- próximo gate proposto: edição segura de metadados editoriais.

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
36. Edição de favorito ou tags exige gate próprio com revisão e conflito definidos.
37. Operações em massa e hierarquia persistente não entram silenciosamente como extensão da organização visual.

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

## Contrato de organização da biblioteca

Camada pura: `src/library/libraryQuery.ts`.

Consulta:

- recebe lista de documentos e um objeto `LibraryQuery`;
- combina `search`, `status`, `favoritesOnly`, `tag` e `sort`;
- retorna nova lista sem modificar a entrada;
- busca em título, texto derivado, tags e estado;
- normaliza somente para comparação, preservando dados armazenados.

Ordenações:

- `updated-desc`: alteração mais recente, depois título e identidade;
- `created-desc`: criação mais recente, depois título e identidade;
- `title-asc`: colação `pt-BR`, numérica, depois atualização e identidade.

Tags:

- equivalência usa texto sem diacríticos e em minúsculas;
- variantes equivalentes aparecem uma única vez no filtro;
- o rótulo canônico prefere maior informação diacrítica, inicial maiúscula e colação estável;
- selecionar uma variante encontra documentos com qualquer grafia equivalente;
- nenhuma tag é alterada no documento.

Interface:

- estado, favorito e tag são filtros combináveis;
- busca existente participa do mesmo objeto de consulta;
- contagem mostra visíveis e total;
- estado vazio explica o recorte e permite limpar filtros;
- favorito e até duas tags aparecem nos cartões;
- a página ativa fora do recorte gera aviso, mas permanece aberta;
- desktop mantém rail; mobile usa drawer com Escape e retorno de foco;
- filtros não alteram rascunho, seleção, histórico, autosave ou revisão.

## Contrato de seleção lexical

Snapshot em memória:

- `documentId`;
- `from` e `to` ProseMirror;
- texto normalizado, limitado a 120 caracteres;
- publicação em criação, atualização e mudança de seleção;
- leitura imediata e assinatura para atualizações futuras.

A superfície Palavras carrega localmente `lexical-engine.js`, `lexical-data.json` e `norma-data.json`. Sem ocorrência e sem registro, fallback morfológico é descartado. Nenhum serviço externo é consultado.

## Contrato de cópia nativa

Envelope versão 1:

- `schema`: `escrevaral.mass-notes-next.backup`;
- `version`: `1`;
- `app`: `mass-notes-next`;
- `exportedAt`;
- lista não vazia de documentos.

Validação ocorre antes de qualquer transação. Restauração usa `add`, gera UUID novo, acrescenta `— restaurado`, reinicia revisão e não troca a página ativa. Favorito e tags restaurados tornam-se imediatamente visíveis aos filtros do Gate 11.

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
- A primeira execução do Gate 11 falhou por nomes acessíveis ambíguos e porque o ícone favorito integrava o texto exato do título; controles e estrutura do cartão foram corrigidos.
- A segunda execução ficou 192/196 porque o rótulo de tags equivalentes dependia da ordem por atualização; a canonicalização tornou o representante estável.
- A terceira execução ficou 194/196 porque o teste comparava o texto de todo o grupo de chips com um chip individual; a asserção passou a localizar cada chip precisamente.
- O workflow `30449369857` concluiu o Gate 11 com 196/196, publicação, cache e verificação pública verdes.

## Limitações conhecidas

Ainda não estão aprovados:

- edição de favorito e tags na biblioteca;
- edição ou exclusão em massa;
- pastas ou hierarquia persistente;
- importação do `.esc` legado;
- criptografia ou senha de backup;
- seleção parcial ou merge de restauração;
- DOCX, RTF, ePub e Obsidian ZIP;
- catálogo de sinônimos e análise sintática de frases em Palavras;
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
9. não fazer filtros dispararem troca de página ou persistência;
10. iniciar o Gate 12 somente após definir revisão e conflito para mudanças exclusivamente de metadados.
