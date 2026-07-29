# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-29

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto, mesclável e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: intactos;
- Gates 1 a 13 e Gate 10.5: verdes;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- primeira tranche M0.9: concluída;
- navegadores obrigatórios: Chromium e Firefox;
- matriz atual: 116 cenários por navegador, 232 execuções;
- cabeça funcional da primeira tranche: `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`;
- workflows verdes: Mass Notes `30463426867`, Argila `30463426847`, coerência `30463426811`;
- nota provisória geral: 85/100;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público: `NO-SHIP` provisório;
- substituição integral do produto antigo: `NO-SHIP` provisório;
- P0 abertos: 0;
- P1 abertos: 0;
- Gate 14 está suspenso até o veredito final M0.9.

## Fontes de retomada do milestone

1. `M0_9_AUDITORIA_OPERACIONAL.md` — memória executável viva;
2. `audits/M0_9_AUDITORIA_GERAL.md` — relatório humano;
3. `audits/M0_9_AUDITORIA_GERAL.json` — estado estruturado;
4. `logs/2026-07-29-m0-9-auditoria-integrada-tranche-1.md` — evidência da primeira tranche;
5. `../../docs/product/MASS_NOTES_TIPTAP_M0_9.md` — contrato global.

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
21. O milestone M0.9 precede o Gate 14 e qualquer nova feature.
22. A auditoria geral é memória operacional viva; decisões e achados são registrados no repositório quando mudam.
23. Durante o M0.9, auditar precede corrigir.
24. Correção durante a auditoria só é aceita para remover bloqueio de medição ou P0, sempre com documentação e matriz completa posterior.
25. Beta fechada, lançamento público e substituição do Escrevaral antigo recebem vereditos separados.
26. O PR permanece em rascunho e `main` intacta durante todo o milestone.
27. Notas e vereditos da primeira tranche são provisórios enquanto houver fases obrigatórias pendentes.
28. Uma falha temporal de teste não deve ser promovida a defeito de produto sem reprodução funcional.
29. Estados intermediários rápidos do autosave podem não ser observáveis; a convergência final para `Salvo` continua obrigatória.

## Primeira tranche M0.9

Criado `tests/m0-9-integrated.spec.ts` com cinco cenários por navegador.

### Jornada de escrita e retomada

Aprovados:

- criação de página;
- título e texto;
- estado editorial;
- favorito;
- tags;
- autosave;
- recarga;
- retomada do conteúdo e dos metadados.

### Engines em sequência

Executadas na mesma página:

- Revisão;
- Espelho de Voz;
- Termos que pedem contexto;
- RimaLab;
- Palavras/Léxico.

Resultado:

- texto preservado;
- `revision` preservada;
- `plainText` preservado;
- nenhuma aplicação automática;
- frase autoral sentinela ausente de URL e corpo de requisição.

### Organização

Aprovados:

- busca e filtro que excluem a página ativa do recorte;
- página ativa continua aberta;
- filtros não incrementam revisão;
- rascunho não é descartado;
- limpar filtros restaura o cartão ativo.

### Mobile integrado

Aprovado em 320 e 390 px:

- drawer;
- sete abas;
- ausência de overflow horizontal bloqueador;
- fechamento por Escape;
- retorno de foco ao acionador.

### Escala funcional

Aprovados:

- 100 documentos no IndexedDB;
- documento ativo acima de 100 mil caracteres;
- editor editável;
- biblioteca pesquisável;
- página ativa preservada fora do recorte.

Essa evidência comprova funcionamento, mas ainda não define orçamento de latência ou memória.

## Incidente da primeira tranche

Primeira execução:

- cabeça `f3ab89db816557984ed19bc8ab17d2d96137d946`;
- 231/232;
- todos os dez casos M0.9 passaram;
- única falha em helper antigo do RimaLab no Firefox.

Causa:

- o helper exigia observar `Alterado|Salvando` após paste;
- o autosave já havia convergido para `Salvo` antes da asserção.

Decisão:

- instabilidade temporal de teste;
- produto não alterado;
- helper aceita `Alterado|Salvando|Salvo` antes do comando explícito;
- `Salvo` permanece obrigatório como estado final.

Repetição:

- cabeça `a3989f8dfe24cd8a8d035a2c494f5263f1bd3510`;
- 232/232;
- publicação, cache e smoke público verdes;
- Argila e coerência verdes.

## Achados provisórios

### P0

Nenhum.

### P1

Nenhum.

### P2

- `M09-F001`: aplicação nova sem contrato próprio de PWA/offline; bloqueia lançamento público.
- `M09-F002`: Prova de Autoria ausente; bloqueia substituição integral enquanto não houver decisão explícita.
- `M09-F003`: exportação sem DOCX, RTF, ePub e Obsidian ZIP; não bloqueia beta, mas bloqueia paridade integral para fluxos dependentes.

### P3

- `M09-F004`: busca, filtros e ordenação da biblioteca não persistem entre sessões; Gate 14 permanece suspenso.

## Placar provisório

- editor e preservação: 92;
- biblioteca: 90;
- engines: 86;
- UIX: 82;
- acessibilidade: 80;
- responsividade: 89;
- importação e exportação: 83;
- privacidade: 92;
- desempenho: 84;
- release: 72;
- geral: 85.

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

O parser `src/import/legacyEscImport.ts` valida todo o lote, cria prévia em memória e converte texto com `plainTextToContent`.

`importLegacyDocumentsAsCopies` usa uma transação única, UUIDs novos, sufixo `— importado`, `revision: 0`, `add` e preservação de `legacySourceId`.

Não existem importação parcial, substituição, merge, escolha automática de versão, deduplicação silenciosa ou upload externo.

## Limitações conhecidas

Ainda não estão aprovados:

- persistência de filtros entre sessões;
- reimportação seletiva ou comparação de versões legadas;
- deduplicação automática por `legacySourceId`;
- importação parcial;
- operações em massa;
- pastas ou coleções persistentes;
- DOCX, RTF, ePub e Obsidian ZIP;
- Prova de Autoria na nova fundação;
- criptografia de backup;
- sincronização em nuvem e colaboração;
- service worker/PWA da aplicação nova;
- Tauri, SQLite e paginação física;
- aplicação automática de sugestões;
- promoção para `main`.

## Segunda tranche — próxima ação obrigatória

1. conflito real entre duas páginas envolvendo manuscrito e metadados;
2. exportação antes da persistência;
3. cópia nativa/restauração e importação legada na mesma sessão;
4. acessibilidade ampliada, zoom, movimento reduzido e tecnologias assistivas/dispositivos reais;
5. observação integral de rede;
6. sessão prolongada, latência e memória;
7. corpus ampliado por engine;
8. decisões explícitas para os P2;
9. veredito final e CI na cabeça exata sem commit posterior.

## Como retomar

1. conferir branch, PR e workflows;
2. ler `M0_9_AUDITORIA_OPERACIONAL.md`;
3. revisar P0/P1, P2 e próxima fase;
4. consultar relatório humano e JSON;
5. não editar a branch de preview;
6. não adicionar feature durante o diagnóstico;
7. não enfraquecer checksum, atomicidade ou convergência de salvamento;
8. iniciar o Gate 14 somente após veredito final explícito do M0.9.
