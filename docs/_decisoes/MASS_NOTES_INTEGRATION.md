# Decisão: Mass Notes como nova shell do Escrevaral

**Situação:** aprovada para experimento em branch isolada  
**Branch:** `experiment/mass-notes-integration`  
**Base:** `main`  
**Produto-alvo:** Escrevaral com interface e modelo de interação do Mass Notes

## Decisão

O Mass Notes passa a ser a shell experimental do Escrevaral. A interface atual não será usada como referência de arquitetura da informação, navegação ou composição visual.

As engines, dados linguísticos, formatos de saída, prova de autoria, paginação, preservação local, PWA e auditores existentes serão mantidos e conectados ao novo produto por adaptadores explícitos.

A primeira integração não reescreverá engines, não moverá engines e não removerá a interface antiga fisicamente. Arquivos antigos deixarão de ser carregados somente depois de existir uma shell nova funcional e validada.

## Princípios obrigatórios

1. O documento continua sendo a superfície principal.
2. A pessoa pode ignorar todas as análises e apenas escrever.
3. Engines não conhecem o DOM da nova interface.
4. Controladores não chamam engines diretamente; usam adaptadores.
5. Texto de manuscrito permanece local por padrão.
6. Nenhum dado legado é apagado durante a migração.
7. Movimentação física e mudança comportamental permanecem em commits diferentes.
8. A branch experimental não será incorporada diretamente em `main`.

## Fronteira técnica

### Mantidos

- `document-engine.js`
- `pagination-engine.js`
- `lexical-engine.js`
- `syntax-engine.js`
- `punctuation-engine.js`
- `analise-engine.js`
- `voice-engine.js`
- `rimalab-engine.js`
- `decolonial-engine.js`
- `proof-engine.js`
- `export-engine.js`
- `backup-engine.js`
- `vrda-engine.js`
- bases `*-data.js`, `*-data.json` e `synonyms/`
- `service-worker.js` na raiz
- `manifest.webmanifest`
- páginas públicas e políticas
- auditores, golden files e workflows de release

### Substituídos gradualmente

- shell visual do `index.html`
- estado global acoplado ao DOM
- controladores da interface anterior
- editor e toolbar anteriores
- navegação por módulos principais
- apresentação antiga das análises

### Preservados sem exposição inicial

- Ateliê/Academia
- Planejamento
- modos de treinamento
- temporizador
- sons e máquina de escrever
- badges e combos
- guias standalone
- Mesa Portátil
- direitos autorais

Esses recursos permanecem no repositório e serão avaliados depois do MVP. Não entram na primeira shell apenas para evitar que o editor nasça novamente como um painel de módulos.

## APIs existentes que justificam a estratégia

| Capacidade | API global atual | Uso no Mass Notes |
|---|---|---|
| Análise geral | `window.VeredaAnalise` | aba Revisão |
| Voz | `window.VeredaVoice` | aba Voz |
| Rimas | `window.VeredaRimaLab` | aba Rimas |
| Vocabulário decolonizador | `window.VeredaDecolonial` | seção “Termos que pedem contexto” |
| Prova de autoria | `window.VeredaProof` | propriedade e pacote de autoria |
| Exportação | `window.VeredaExport` | menu Exportar |
| Paginação | `window.VeredaPagination` | visualização Página |

O inventário completo de métodos será registrado antes da ligação de cada adaptador.

## Acoplamentos conhecidos

1. `state-store.js` exige seletores da interface antiga durante o carregamento e não será reutilizado diretamente.
2. Algumas engines carregam dados por `fetch()` relativo à raiz; seus arquivos não serão movidos no MVP.
3. A ordem de scripts no `index.html` é significativa.
4. Toda mudança de arquivo distribuído exige sincronizar versão do HTML, `ASSET_VERSION`, `CACHE_NAME`, `CORE_ASSETS` e carregadores dinâmicos.
5. O service worker permanece na raiz para conservar o escopo.
6. A exportação atual recebe principalmente `manuscript.text`; o novo documento também possui `contentHtml`, exigindo adaptação por formato.
7. A paginação trabalha com HTML e deve manter quebras automáticas fora da fonte persistida.

## Modelo de integração

```text
Mass Notes document
        │
        ▼
DocumentSnapshot
        │
        ├── AnalysisAdapter ─── VeredaAnalise
        ├── VoiceAdapter ────── VeredaVoice
        ├── RhymeAdapter ────── VeredaRimaLab
        ├── DecolonialAdapter ─ VeredaDecolonial
        ├── ProofAdapter ─────── VeredaProof
        ├── ExportAdapter ────── VeredaExport
        └── PaginationAdapter ── VeredaPagination
```

Cada adaptador deve:

- aceitar um snapshot imutável;
- converter HTML em texto quando necessário;
- normalizar resultado e erro;
- não tocar no DOM;
- registrar a revisão analisada;
- descartar resultados obsoletos;
- permitir engine ausente ou dados ainda não carregados;
- documentar limitações reais.

## Modelo de dados experimental

```text
document
├── id
├── title
├── contentHtml
├── plainText
├── folderId
├── tags[]
├── favorite
├── createdAt
├── updatedAt
├── deletedAt
├── revision
├── wordCount
├── characterCount
├── kind?
├── description?
├── authorshipRecord?
├── analysisCache?
├── engineSchemaVersion?
└── legacySourceId?
```

Campos antigos não se tornam obrigatórios apenas porque existem no produto anterior.

## Migração de dados

Fonte principal conhecida: `vereda.manuscripts.v1`.

A migração deve:

1. ler e validar sem modificar a origem;
2. converter cada manuscrito para o schema novo;
3. preservar IDs em `legacySourceId` quando necessário;
4. preservar título, texto, tags, datas, tipo, descrição e prova de autoria válida;
5. gravar todos os registros em transação;
6. verificar contagem e conteúdo após a gravação;
7. marcar a migração como concluída;
8. manter as chaves antigas intactas;
9. oferecer arquivo recuperável se qualquer etapa falhar.

## Estrutura nova aprovada

```text
js/
├── core/
├── controllers/
├── integrations/
├── views/
└── data/

css/
├── 00-tokens.css
├── 01-base.css
├── 02-app-shell.css
├── 03-library.css
├── 04-editor.css
├── 05-editor-toolbar.css
├── 06-inspector.css
├── 07-dialogs-menus.css
├── 08-responsive.css
├── 09-print.css
└── 10-engine-surfaces.css
```

As engines atuais ficam na raiz durante o experimento inicial.

## Sequência de commits

1. documentação e inventário;
2. scaffold modular sem mudança comportamental;
3. extração do Mass Notes em CSS e JavaScript;
4. estado, IndexedDB e sanitização;
5. migração compatível do acervo anterior;
6. adaptadores das engines;
7. superfícies contextuais;
8. PWA, manifesto e cache;
9. auditores do MVP;
10. correções de QA.

## Gates

### Gate estrutural

- caminhos válidos;
- scripts em ordem explícita;
- nenhum arquivo de engine movido;
- nenhuma mudança em dados calibrados;
- nenhum erro de sintaxe.

### Gate funcional do MVP

- criar, editar, salvar e reabrir documento;
- importar acervo antigo sem apagar a origem;
- executar ao menos uma análise de cada engine integrada;
- exportar documento;
- gerar pacote de autoria;
- instalar e abrir sem internet;
- ausência de erros no console;
- ausência de overflow em 320, 390 e 430 px;
- teclado e foco previsíveis.

### Gate de incorporação

O experimento aprovado visualmente será reorganizado em PRs menores. A `main` só será alterada mediante solicitação explícita e release candidate verde.

## Riscos principais

1. perda ou duplicação de dados na migração;
2. regressão de rich text na conversão para engines orientadas a texto simples;
3. análise pesada bloqueando digitação;
4. caminhos relativos quebrados após reorganização;
5. cache servindo combinação incoerente de versões;
6. registro de autoria associado ao documento errado;
7. apresentação excessiva das engines reduzindo a área de escrita;
8. falso suporte de formatação em formatos de exportação.

## Critério de reversibilidade

A branch deve permanecer reversível porque:

- `main` não será alterada;
- dados legados não serão apagados;
- engines não serão reescritas no MVP;
- arquivos antigos permanecerão no histórico e inicialmente no branch;
- a nova interface pode ser desativada sem invalidar o acervo anterior.
