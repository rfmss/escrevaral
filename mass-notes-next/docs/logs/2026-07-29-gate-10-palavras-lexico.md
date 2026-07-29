# Gate 10 — Palavras/Léxico local e somente de leitura

Data: 2026-07-29

## Objetivo

Integrar a superfície Palavras do Escrevaral anterior à fundação Tiptap sem modificar a engine lexical, sem depender da forma acidental do DOM e sem oferecer substituição automática do manuscrito.

## Escopo entregue

- carregamento local de `lexical-engine.js`;
- fornecimento local de `lexical-data.json` e `norma-data.json` durante a inicialização da engine;
- adaptador TypeScript defensivo em `src/engines/lexicalAdapter.ts`;
- ponte tipada e durável da seleção em `src/editor/lexicalSelectionBridge.ts`;
- publicação do snapshot em `onCreate`, `onUpdate` e `onSelectionUpdate` do Tiptap;
- consumo da última seleção mesmo quando o painel Palavras é aberto depois do gesto no editor;
- busca digitada por palavra ou expressão curta;
- apresentação de definição, classe, confiança, função, campo, ocorrências e leituras alternativas disponíveis;
- estado seguro para termo sem registro local;
- layout isolado e responsivo em `src/styles/lexical-panel.css`;
- nenhuma alteração em documento, seleção, histórico, autosave, biblioteca ou engine.

## Organização

```text
src/editor/lexicalSelectionBridge.ts
src/engines/lexicalAdapter.ts
src/components/LexicalPanel.tsx
src/components/RightRail.tsx
src/styles/lexical-panel.css
tests/gate10-lexical.spec.ts
```

O editor conhece somente o contrato de seleção. O painel conhece somente o bridge e o adaptador. A engine legada não conhece React, Tiptap ou ProseMirror.

## Contrato de seleção

O snapshot contém:

- `documentId`;
- `from`;
- `to`;
- `text`.

A ponte mantém apenas o snapshot mais recente em memória e notifica assinantes. Não há persistência da seleção no IndexedDB ou no JSON autoral. O painel rejeita seleção vazia, maior que 120 caracteres ou longa demais para esta primeira leitura lexical.

## Contrato de leitura lexical

1. a engine e as duas bases são carregadas localmente;
2. a consulta é normalizada sem apagar o texto autoral;
3. ocorrências são contadas no texto atual com equivalência de acentos;
4. termos registrados são reconhecidos nas bases e nas chaves declaradas da engine;
5. uma definição registrada pode existir sem ocorrência no manuscrito;
6. classe e função contextuais não são afirmadas sem ocorrência suficiente;
7. fallback morfológico sem registro e sem ocorrência é descartado;
8. falha de carga ou termo desconhecido produz estado seguro;
9. nenhum serviço externo é consultado.

## Segurança autoral

- não existe botão de substituir, aplicar ou trocar palavra;
- o painel não emite comando Tiptap;
- o adaptador não recebe referência do editor;
- a leitura não cria decoration;
- nenhuma resposta altera o rascunho ou dispara persistência;
- definições e classificações são apresentadas como leitura local, não como veredito absoluto.

## Testes adicionados

Cinco cenários por navegador:

- busca por termo registrado sem inventar classe quando ele não aparece no texto;
- seleção Tiptap preservada até a abertura posterior do painel;
- comprovação de que a leitura não altera o manuscrito;
- ausência total de ação automática de substituição;
- termo desconhecido e drawer móvel sem overflow real.

A matriz final contém 91 cenários por navegador e 182 execuções.

## Estabilização e incidentes

### Contratos responsivos

A primeira suíte tentou abrir o botão `Abrir ferramentas` também no desktop. O helper passou a reconhecer que o rail é permanente no desktop e drawer apenas no mobile. Uma regressão antiga do RimaLab também fixava seis abas; a superfície possui sete após Palavras.

### Seleção perdida

O primeiro desenho usava evento efêmero e estado global no `window`. Quando Palavras ainda não estava montado, a seleção era perdida. O desenho foi substituído por um bridge tipado que oferece leitura do snapshot atual e assinatura de atualizações.

### Classe falsa sem contexto

A palavra “melancolia” possui definição editorial local, mas a heurística morfológica podia classificá-la como `Verbo (imperfeito)` quando ela não aparecia no manuscrito. O adaptador passou a separar registro lexical de classificação contextual. Sem ocorrência, a definição permanece e a classe é declarada indeterminada.

### Termo artificial

A engine gera descrições genéricas para formas desconhecidas. O adaptador passou a verificar se o termo existe nas bases ou nas tabelas declaradas da engine. Sem registro e sem ocorrência, a consulta retorna ausência segura.

### Cobertura do RimaLab

Durante a estabilização, uma regravação ampla simplificou acidentalmente o arquivo de testes do RimaLab. A suíte robusta anterior foi restaurada integralmente, incluindo prosa, verso, blocos vazios, invalidação e falha controlada. A única mudança legítima foi a contagem de sete abas.

### Arredondamento móvel

A penúltima execução terminou com 180/182 aprovações porque `getBoundingClientRect()` retornou aproximadamente 342,2 px para um rail de 342 px. Documento e rail já estavam sem overflow. A asserção passou a aceitar 1 px de diferença subpixel entre Chromium e Firefox, mantendo as verificações rígidas de `scrollWidth`.

### Sincronização da exportação

A primeira validação da cabeça documental terminou com 181/182 no Firefox. O fixture do Gate 9 confirmava a árvore visível do Tiptap, mas podia iniciar o download antes de o estado React receber o conteúdo estruturado. O teste passou a salvar o documento-base vazio, aguardar a alteração do paste, salvar novamente e só então abrir o painel de exportação. O exportador não foi alterado.

## Evidência

- cabeça final validada: `31f6fbe92b3a6742affe26ad797046d9b2ae0e3a`;
- workflow final: `30422368445`;
- matriz: 91 cenários por navegador, 182 execuções;
- build: aprovado;
- Chromium: aprovado;
- Firefox: aprovado;
- publicação da preview: aprovada;
- renovação de cache: aprovada;
- verificação pública: aprovada.

## Limitações honestas

- o painel novo ainda não carrega o catálogo separado de sinônimos existente no aplicativo anterior;
- frases completas não recebem análise sintática nesta superfície;
- não há decoration lexical;
- não há histórico de consultas;
- não há edição ou substituição por clique;
- a cobertura lexical é limitada às bases e regras locais existentes;
- classificações polissêmicas continuam dependentes de heurísticas e contexto disponível.

## Próximo passo lógico

O próximo gate recomendado é **Gate 11 — organização da biblioteca**. O corte deve aproveitar estado, favorito, tags, busca e datas já persistidos antes de considerar novos campos ou hierarquias. Ele não começa automaticamente.