# T3 — inventário de bridges da Paper Home

- Registrado em: 2026-08-17
- Branch: `feat/escrevaral-paper-home`
- Princípio: promover apenas circuitos consolidados para ownership React; **não** reescrever engines/domínio nem trocar um bridge simples por uma abstração maior.

## Classificação operacional

### PROMOVIDO — remover bridge

#### Estado editorial — T3a

Antes:
- `WritingEditorialStateBridge` criava a seção por DOM imperativo;
- fazia polling a cada 300 ms;
- lia/cliqueava controles escondidos de `#panel-pulso` para status/favorito.

Depois:
- `.reference-editorial-state` é JSX do `App`;
- `Rascunho / Em corte / Pronto` chama `mutateDraft(..., 'metadata')` diretamente;
- favorito altera `draft.favorite` diretamente;
- autosave, IndexedDB e conflito continuam sendo os mesmos;
- `WritingEditorialStateBridge.tsx` foi removido do repo.

Prova estrutural/comportamental:
- o teste remove o conteúdo de `#panel-pulso` do DOM;
- status e favorito canônicos continuam alterando e salvando;
- portanto a casa não depende mais dos controles escondidos do Pulso.

Falhas de bootstrap documentadas:
- run `31986992006`: patch textual procurou um ponto antigo do `App.tsx`; commit de produto não ocorreu;
- run `31987048305`: workflow efêmero falhou no parsing/startup; produto não foi alterado;
- run `31987159791`: bootstrap simplificado executou e se removeu corretamente.

Gate final T3a:
- run `31987285323`;
- head `641f0afab5eb8653814a268b129142640848c3de`;
- **32/32 testes verdes**;
- TypeScript/Vite, tipografia offline, publicação e smoke público verdes;
- `index.js`: `1.096.192 B`, gzip `306.730 B`.

### PRÓXIMO — promover

#### Biblioteca — T3b

Bridge atual: `WritingLibraryBridge`.

Motivo para promover agora:
- `App` já é dono de `sidebarOpen`;
- o botão canônico da left rail já existe no JSX;
- o bridge apenas faz polling de `open`, clica no botão móvel escondido e sincroniza ARIA/body class;
- não há engine nem dado novo envolvido.

Plano:
1. tornar `BIBLIOTECA LOCAL / DOCUMENTOS LOCAIS` texto real no JSX do `App`;
2. botão canônico chama `setSidebarOpen(true)` diretamente;
3. `aria-controls` / `aria-expanded` vêm de `sidebarOpen`;
4. body class `reference-library-open` passa a derivar de `sidebarOpen` em efeito React;
5. retirar do `WritingIntegrityBridge` a reescrita desse bloco;
6. remover `WritingLibraryBridge.tsx` após gate;
7. manter `LibraryQuery`, filtros e drawer exatamente como estão.

Critério: testes atuais da Biblioteca + nova prova de que a abertura não depende de `.mobile-menu`.

### CANDIDATO POSTERIOR — auditar antes de promover

#### Metas — `WritingGoalsBridge`

O bridge possui lógica real própria (preferência local, assinatura do live snapshot, modal e sincronização do rodapé), mas ainda encontra o gatilho e altera o statusbar por DOM. Pode ser promovido depois de Biblioteca, porém exige decidir ownership da preferência de meta no `App` antes de remover o bridge.

#### Exportar — `WritingExportBridge`

O modal e o pipeline de exportação são reais, mas o bridge intercepta o botão canônico e lê snapshot/título por bridge/DOM. Não promover até definir props/ownership explícitos para o modal.

#### Config. — `WritingConfigBridge`

O modal é real, mas aciona tema/foco/fullscreen/Anatomia clicando controles existentes. Candidato a receber callbacks explícitos depois que os circuitos menores forem removidos.

### AINDA NECESSÁRIO NESTA FASE

#### Integridade — `WritingIntegrityBridge`

Ainda protege a casa de cenografia que permanece no JSX legado: modo, Notas, pesquisa documental fictícia, quick box, distribuição, versões, foco/idioma e controles tipográficos sem contrato. Não remover como bloco. A estratégia correta é retirar uma cenografia real do JSX por tranche e diminuir o bridge junto.

## Regra de T3

Um bridge só sai quando:
1. a fonte de estado já pertence a React/domínio real;
2. não há polling/clique em controle escondido necessário;
3. comportamento visível é igual ou mais honesto;
4. gate completo permanece verde;
5. arquivo substituído é removido do repo;
6. esta memória registra falhas intermediárias e gate final.
