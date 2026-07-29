# Mass Notes Tiptap — Gate 10

## Decisão

O Mass Notes Next passa a oferecer consulta Palavras/Léxico local e somente de leitura, acionada por seleção real do Tiptap ou por busca digitada.

## Fontes preservadas

- `lexical-engine.js`;
- `lexical-data.json`;
- `norma-data.json`.

Essas fontes permanecem intactas. A aplicação nova as consome por `src/engines/lexicalAdapter.ts`, que isola carregamento, normalização, validação e tradução para tipos do produto.

## Contrato de seleção

A comunicação entre editor e Palavras ocorre por snapshot em memória:

- identidade do documento;
- posição inicial ProseMirror;
- posição final ProseMirror;
- texto selecionado.

O snapshot pode ser lido quando o painel monta e também é distribuído a assinantes futuros. A seleção não é escrita no documento, no IndexedDB ou no backup.

## Contrato de leitura

- a consulta é executada no navegador;
- nenhuma parte do manuscrito é enviada para serviço externo;
- ocorrências são contadas no texto atual com normalização de acentos;
- definições registradas podem ser exibidas sem ocorrência;
- classe e função contextuais exigem contexto verificável;
- fallback morfológico sem registro e sem ocorrência não é tratado como verbete;
- termos desconhecidos recebem estado seguro;
- falhas da engine não interrompem o editor.

## Contrato autoral

Palavras não possui ação de substituir, aplicar, corrigir ou reescrever. A leitura não altera:

- JSON Tiptap;
- texto;
- seleção;
- histórico;
- revisão;
- autosave;
- biblioteca;
- backup.

A classificação é uma hipótese linguística local. Polissemia, oralidade, registro e intenção podem mudar a leitura.

## Compatibilidade e arquitetura

A engine não conhece React ou Tiptap. O editor publica somente o snapshot; o painel consome somente o bridge e o adaptador. Mudanças futuras na engine devem continuar atrás desse contrato.

Uma futura ação de substituição, catálogo de sinônimos ou análise de frase exige gate separado, com comando Tiptap explícito, histórico reversível e testes próprios. Não é permitido introduzir aplicação automática como extensão silenciosa deste gate.

## Evidência

Workflow `30420965045`: build, Chromium, Firefox, publicação, cache e verificação pública aprovados; 91 cenários por navegador e 182 execuções verdes.

## Fora do gate

- substituição por sinônimo;
- catálogo novo de sinônimos;
- análise sintática de frase;
- decoration lexical;
- consulta externa;
- reescrita generativa;
- correção em massa;
- promoção para `main`.

## Próximo gate proposto

Gate 11 — organização da biblioteca sobre os campos já existentes, sem iniciar automaticamente e sem criar nova hierarquia persistente antes de um contrato de migração.
