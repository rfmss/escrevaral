# Estado do scaffold — Mass Notes integrado

**Branch:** `experiment/mass-notes-integration`  
**Entrada experimental:** `/mass-notes.html`  
**Entrada pública atual:** `/index.html` — não alterada  
**Service worker:** não alterado  
**Manifesto:** não alterado

## Estado da fase

O primeiro scaffold funcional foi criado de forma aditiva e isolada.

Nenhum arquivo existente foi modificado ou removido. O experimento usa namespaces próprios em:

```text
css/mass-notes/
js/mass-notes/
```

Essa organização é deliberadamente temporária. Ela permite validar a nova shell sem mudar os consumidores da aplicação atual. A promoção para os diretórios definitivos acontecerá somente depois do gate visual e funcional.

## Arquivos adicionados

```text
mass-notes.html

css/mass-notes/
├── 00-tokens.css
├── 01-shell.css
├── 02-components.css
└── 03-responsive.css

js/mass-notes/
├── core/
│   ├── store.js
│   └── bootstrap.js
├── integrations/
│   └── engines.js
└── controllers/
    └── app.js

scripts/
└── auditor-mass-notes-mvp.py

.github/workflows/
└── mass-notes-experiment.yml
```

## Capacidades visíveis no scaffold

- biblioteca de documentos;
- criação de documento;
- busca;
- recentes;
- favoritos;
- título independente;
- editor rich text básico;
- toolbar familiar;
- salvamento automático em IndexedDB;
- modo temporário quando IndexedDB falha;
- migração somente-leitura de `vereda.manuscripts.v1`;
- estrutura por H1, H2 e H3;
- painel contextual;
- revisão local;
- Espelho de Voz;
- RimaLab;
- termos que pedem contexto;
- registro de autoria local;
- exportação TXT pela engine existente;
- tema claro e escuro;
- modo foco;
- drawers responsivos;
- interface em pt-BR.

## Engines carregadas no experimento

```text
syntax-engine.js
punctuation-engine.js
analise-engine.js
voice-engine.js
rimalab-engine.js
decolonial-engine.js
proof-engine.js
export-engine.js
pagination-engine.js
```

As engines são carregadas antes da nova camada e não conhecem o DOM do Mass Notes.

## Contrato de fronteira

O controlador `js/mass-notes/controllers/app.js` acessa apenas:

- `MassNotesStore`;
- `MassNotesEngines`;
- APIs do navegador.

As referências `Vereda*` ficam restritas ao adaptador `js/mass-notes/integrations/engines.js`.

## Persistência

Banco experimental:

```text
mass-notes-escrevaral-experiment
```

A chave antiga `vereda.manuscripts.v1` é lida para migração, mas nunca removida ou sobrescrita.

O scaffold ainda não substitui o modelo de armazenamento público do Escrevaral.

## Gate automatizado

O workflow `Experimento Mass Notes` executa:

- sintaxe Python do auditor;
- sintaxe JavaScript com `node --check`;
- existência dos assets locais;
- ausência de IDs duplicados;
- presença dos IDs contratuais;
- ordem das engines e da nova camada;
- proibição de acesso direto às engines pelo controlador;
- preservação da chave de armazenamento antiga;
- geração de artefato JSON com o resultado.

## Limites desta primeira versão

- `index.html` ainda é o produto atual;
- o service worker ainda não inclui o experimento;
- não existe instalação offline específica do scaffold;
- a paginação está carregada, mas ainda não possui superfície ativa;
- a exportação visível está limitada a TXT;
- léxico e sinônimos ainda não possuem aba própria;
- pastas, tags avançadas, lixeira e cópia de segurança completa ainda não foram migradas;
- não houve teste visual automatizado em navegador nesta fase;
- não existe PR aberto.

## Próximo lote aprovado pelo contrato

1. observar o resultado do gate estrutural;
2. corrigir falhas do auditor, se houver;
3. criar teste de navegador do scaffold;
4. validar IndexedDB e migração com massa controlada;
5. ativar paginação pelo adaptador;
6. adicionar léxico contextual;
7. ampliar exportação sem prometer preservação não testada;
8. somente depois avaliar inclusão no cache offline;

## Condição para substituir `index.html`

A substituição da entrada pública só poderá ser proposta quando:

- o scaffold passar nos testes de navegador;
- a migração for reversível e validada;
- o funcionamento offline estiver comprovado;
- o release candidate estiver verde;
- o mantenedor autorizar explicitamente a promoção.
