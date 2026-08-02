# Mass Notes Next — fundação Tiptap

Experimento isolado que preserva a identidade editorial e as engines locais do Escrevaral/Mass Notes, substituindo o editor artesanal por Tiptap/ProseMirror e evoluindo as leituras linguísticas por evidência reproduzível.

## Estado

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155` — aberto e em rascunho;
- preview: `https://raw.githack.com/rfmss/escrevaral/preview-mass-notes-tiptap/index.html`;
- aplicação pública, `main` e service worker público: intactos;
- Gates 1 a 13 e Gate 10.5: concluídos;
- M0.9: encerrado como auditoria técnica, sem autorizar lançamento ou substituição;
- milestone estrutural: **M1.0 — Engines superiores ao Escrevaral legado**;
- tranche estratégica ativa: **M1-R0 — Biblioteca de Autoridade e ética de aprendizagem**;
- última cabeça integral validada antes da abertura do mapa de fontes: `8ac6020ba0d431d9781e40f1b631a4b3c53c663d`, **182 cenários por navegador, 364 execuções**;
- Biblioteca de Autoridade inicial: **nove obras registradas**, sem binários no repositório;
- pergunta ativa: sujeito expresso, recuperável/oculto, indeterminado e oração sem sujeito;
- engine de Sintaxe de produção: **não autorizada**;
- engines expostas: Revisão, Espelho de Voz, Contexto, RimaLab, Palavras/Léxico e análise morfológica verbal;
- E2-V: 34 casos de desenvolvimento e 24 casos em conjunto adversarial separado;
- infinitivo pessoal: primeira família verbal com proveniência verificada e avaliação separada em **24/24**;
- inventário lexical: 1.008 declarações brutas, 936 chaves efetivas e 66 grupos conflitantes;
- P0/P1 funcionais conhecidos nas engines: 0/0;
- beta fechada online: `SHIP COM CONDIÇÕES`;
- lançamento público e substituição integral: `NO-SHIP`;
- Gate 14 permanece suspenso.

M1-R0 é uma pausa deliberada antes de novas engines ou novos lotes lexicais. O objetivo é aprender com obras, corpora e recursos externos sem copiar, sem incorporar binários protegidos e sem confundir biblioteca de referência com corpus.

## Retomar o projeto

Leia nesta ordem:

1. `docs/governance/CAPSULA_DE_APRENDIZAGEM_E_BIBLIOTECA_DE_AUTORIDADE.md` — ética, ciclo de fontes, persona e M1-R0;
2. `docs/memory/2026-08-02-m1-r0-biblioteca-e-mapa-sujeito.md` — memória operacional atual e primeiro mapa comparativo;
3. `docs/sources/source-registry.yaml` — registro machine-readable das nove obras e seus limites;
4. `docs/sources/rule-card.schema.yaml` — contrato da ficha obrigatória por regra;
5. `AGENTS.md` — obrigações de qualquer agente;
6. `docs/METHODS.md` — CLARO, banca e validação;
7. `docs/logs/2026-08-01-m1-e2-algures-outrora.md` — fechamento lexical mais recente e falhas preservadas;
8. `docs/logs/2026-08-01-e2v-infinitivo-pessoal-fechamento.md` — fechamento E2-V e limites;
9. `docs/M1_0_ENGINES_SUPERIORES.md` — missão, critérios, fases e adversário mensurável;
10. `docs/PLAN.md` — sequência aprovada anterior à pausa estratégica;
11. `docs/personas/EVA_CHARA.md`, `EVA_CHARA_PROMPT.md` e `EVA_CHARA_SCORECARD.md`;
12. `docs/linguistics/verb-provenance.json` — estado das famílias verbais e suas evidências;
13. `docs/logs/2026-07-29-m1-e2-inventario-lexical.md` — integridade lexical pendente;
14. `docs/MEMORY.md` e `docs/CHANGELOG.md` — histórico consolidado anterior e mudanças relevantes;
15. contratos globais em `../docs/product/`.

A tabela de disponibilidade presente na abertura histórica da cápsula não deve ser usada como estado corrente. `docs/sources/source-registry.yaml` é a referência atual da Biblioteca de Autoridade.

Não declare superioridade global por contagem ou por corpus pequeno. Cada avanço exige baseline, caso reproduzível, correção mínima, matriz integral, documentação e evidência na cabeça exata.

## Executar e validar

```bash
npm ci
npm run audit:lexicon
npm run build
npx playwright install chromium firefox
npm run test:e2e
npm run test:verb:evaluation:target
```

Fronteira pública:

```bash
python3 scripts/test-auditor-asset-version.py
python3 scripts/auditor-asset-version.py
```

## Organização da fonte

```text
src/
├── backup/       # cópia nativa versionada
├── components/   # apresentação e interação React
├── domain/       # contrato do documento
├── editor/       # Tiptap, posições, seleção e decorations
├── engines/      # adaptadores e camadas contextuais locais
├── export/       # formatos derivados
├── import/       # adaptadores e planos auditáveis
├── library/      # consulta pura da biblioteca
├── pages/        # superfícies especiais
├── storage/      # IndexedDB, revisão, conflitos e transações
├── styles/       # camadas visuais
└── transitions/  # transições entre superfícies
```

Regras de formato, conversão, filtro ou engine não entram diretamente em `App.tsx` ou `RightRail.tsx`.

## Princípios ativos

- JSON Tiptap é a fonte estrutural; HTML, Markdown e texto são derivados;
- IndexedDB é a fonte principal;
- nenhuma aba sobrescreve outra silenciosamente;
- metadados usam a mesma revisão e persistência do documento;
- mudanças editoriais preservam leituras textuais válidas;
- filtros da biblioteca são projeções puras;
- restauração nativa e importação legada são formatos distintos;
- `.esc` legado é validado integralmente antes de qualquer escrita;
- nenhum documento existente é substituído por restauração ou importação;
- exportação usa o estado React/Tiptap atual, inclusive antes do autosave convergir;
- conflito misto preserva as duas versões;
- recuperação emergencial retoma o mesmo documento e limpa o envelope após persistir;
- engines não alteram o snapshot semântico do ProseMirror;
- engines funcionam localmente e não aplicam alternativas automaticamente;
- diacríticos participam da decisão gramatical, não apenas da busca;
- contexto pode produzir leitura `provável`; ausência de evidência deve produzir ambiguidade ou indeterminação honesta;
- toda nova regra linguística exige caso positivo e negativo versionado;
- corpus de desenvolvimento e conjunto de avaliação permanecem separados;
- uma família só recebe estado `verified` com fontes, escopo, divergências, licença e avaliação integralmente aprovada;
- livros e obras de referência são professores temporários, não datasets do produto;
- Biblioteca de Autoridade e corpus permanecem separados;
- PDFs, EPUBs e TXTs integrais protegidos não entram no repositório nem nos artefatos;
- sínteses, exemplos e explicações finais devem ser originais ou licenciados;
- a persona primária da leitora-escritora orienta pesquisa sem excluir ou estereotipar outros públicos;
- métricas de CI detectam regressão e não constituem SLA ou consenso linguístico;
- automação de zoom equivalente não substitui zoom real, leitor de tela ou dispositivo físico;
- a Anatomia ainda carrega `page-flip@2.0.7` do `unpkg`, bloqueando promessa offline integral;
- preview só é publicada após build, Chromium, Firefox, cache e smoke público verdes.

## Evidências M1.0 consolidadas

### Léxico e contexto

O corpus contextual passou de 8/14 para 14/14 casos únicos e depois recebeu controles negativos adicionais. As correções cobrem fronteiras delimitadas como:

- `enquanto`, `por enquanto` e `enquanto isso`;
- `publica/pública` e `seria/séria`;
- `preso` como particípio, adjetivo e substantivo;
- `larga` como adjetivo e verbo;
- `canto` como verbo e substantivo.

A duplicata idêntica de `quica` foi removida sem mudar sua definição efetiva. `algures` e `outrora` foram consolidados em uma declaração ativa por verbete, com contratos próprios. Restam 66 conflitos editoriais. Esse ganho não constitui superioridade lexical global.

### E2-V — infinitivo pessoal

A cabeça funcional `0e5177d5c801a4a9b8833af35baa059af486f6c4` demonstrou:

- 12 casos separados do fenômeno;
- oito positivos e quatro negativos por navegador;
- distinções contra infinitivo impessoal, uso substantivado e futuro do subjuntivo;
- reconhecimento de sujeito expresso e recuperável, incluindo `É melhor sairmos agora`;
- Chromium `12/12` e Firefox `12/12`;
- precisão, recall e acurácia de 100% dentro do conjunto contratado;
- nenhuma alteração automática do manuscrito.

O estado `verified` vale somente para o escopo declarado em `docs/linguistics/verb-provenance.json`. Não representa uma teoria completa do infinitivo flexionado nem aprovação acadêmica.

## Estado M1-R0

Concluído:

1. ética de aprendizagem e Biblioteca de Autoridade formalizadas;
2. nove obras registradas com papel, escopo, cautelas e restrições;
3. duas gramáticas centrais consultadas no recorte da primeira pergunta;
4. primeiro mapa de convergências, divergências e fronteiras criado;
5. exemplos originais de pesquisa criados, ainda fora de corpus;
6. contrato da ficha de regra criado;
7. nenhuma engine, nota ou corpus alterado.

Próximo trabalho lógico:

1. fechar a leitura comparativa de `se`, passiva pronominal e concordância;
2. fechar a divergência sobre `ter` existencial, marcando variante e registro;
3. consultar pontualmente o *Novo dicionário de dúvidas* para `haver`, `ter` e construções com `se`;
4. preencher a primeira ficha de regra sem autorizar implementação;
5. pesquisar corpus brasileiro aberto e licenciado;
6. separar desenvolvimento e avaliação;
7. convocar Eva Chara com negativos adversariais;
8. decidir entre abrir uma família mínima de Sintaxe v1 ou continuar pesquisando.

A persona primária de pesquisa é a **leitora-escritora de travessia**: mulher brasileira jovem-adulta, leitora e escritora de ficção, com afinidade especial por romance, fantasia e romantasia. É hipótese estratégica a validar, não totalidade do público nem autorização para estereótipos.

## Limites atuais

Ainda não estão aprovados reimportação seletiva, deduplicação automática, importação parcial, pastas, operações em massa, sincronização, colaboração, DOCX, RTF, ePub, Obsidian ZIP, PWA própria, Prova de Autoria na nova fundação, autonomia offline da Anatomia, zoom real de 200%, leitores de tela/dispositivos físicos, Tauri, SQLite, paginação física, aplicação automática de sugestões ou promoção para `main`.
