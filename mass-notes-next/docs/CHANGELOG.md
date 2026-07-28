# Changelog técnico — Mass Notes Next

As entradas registram mudanças de arquitetura, produto e qualidade. Commits mecânicos podem ser omitidos.

## 2026-07-27

### Fundação Tiptap

- criada branch experimental a partir da `main`;
- adotados React, TypeScript, Vite e Tiptap/ProseMirror;
- transplantado look and feel editorial do Mass Notes;
- criado armazenamento IndexedDB com revisão condicional;
- implementada preservação de conflitos entre abas;
- integrada engine real de Revisão por adaptador;
- isolado histórico do editor por documento.

### Gate 2

- adicionados Chromium e Firefox;
- cobertos paste representativo de Word/Google Docs, listas e seleção;
- validada recuperação antes do autosave;
- validado fluxo completo de conflito;
- corrigido stacking do overlay móvel;
- implementados foco inicial, contenção, Escape e retorno do foco;
- criada preview estática publicada somente após gate verde.

### Limpeza visual

- removidos fita preta, adesivo vermelho e CTA flutuante sobre o papel;
- ações movidas para o rail contextual;
- adicionada regressão contra o retorno desses ornamentos.

### Resiliência documental

- criada memória operacional dentro de `mass-notes-next/docs/`;
- instituídos plano vivo, memória consolidada, changelog e logs por lote;
- documentação passou a integrar formalmente a definição de pronto.

### Gate 3 — Espelho de Voz

- criada integração de `voice-engine.js` por importação raw e adaptador TypeScript;
- engine original e bases linguísticas permaneceram intactas;
- adicionada aba `Voz` ao rail;
- apresentados confiança, gesto, descrição, métricas, forças, pontos cegos, exercícios, ecos e público provável;
- reforçada a linguagem de hipótese heurística para corpus curto;
- resultados passam a ser descartados após mudança do documento ou do conteúdo;
- corrigida invalidação indevida causada apenas pelo autosave da mesma versão textual;
- falha controlada da engine permanece isolada do editor;
- adicionados testes de vazio, baixa confiança, corpus médio, obsolescência e exceção;
- matriz aprovada em Chromium e Firefox, com 30 execuções;
- preview atualizada após gate verde.

### Gate 4 — Termos que pedem contexto

- integrados `decolonial-engine.js` e `decolonial-data.json` por adaptador, sem modificar os originais;
- criada aba `Contexto` e painel editorial separado do Tiptap;
- apresentados termo, categoria, ocorrências, motivo, contexto e alternativas possíveis;
- adotada linguagem não acusatória, sem palavras proibidas ou correção automática;
- nenhuma alternativa possui botão de aplicação;
- resultados são descartados após mudança do documento ou do conteúdo;
- carregamento da base foi serializado para impedir concorrência entre chamadas de `ensureLoaded()`;
- a ponte temporária de `fetch` é restaurada em `finally`;
- falha controlada da engine permanece isolada do editor;
- cinco abas foram organizadas em duas linhas no rail;
- nomes de termos passaram a ocupar linha própria, com regressão contra corte ou quebra artificial;
- adicionados testes de vazio, ausência de termos, múltiplas ocorrências, integridade do manuscrito, obsolescência, exceção e mobile;
- matriz aprovada em Chromium e Firefox, com 42 execuções;
- preview atualizada somente após gate funcional e visual verdes.

### Gate 5 — RimaLab

- integrados `rimalab-engine.js` e `rimalab-data.json` por adaptador, sem modificar os originais;
- criada união discriminada TypeScript para leituras de prosa e verso;
- adicionada aba `RimaLab` e oficina sonora separada do Tiptap;
- prosa passou a apresentar ecos internos sem falsa escansão;
- verso passou a apresentar resumo, metro dominante, variação métrica, esquema, estrofes, escansão e pares de rima percebidos;
- preservada a nota da engine sobre sinalefa, dicção regional e intenção musical;
- ausência de rima recebe mensagem neutra e verso livre não é tratado como defeito;
- criado serializador sonoro a partir do JSON Tiptap;
- blocos vazios preservam fronteiras entre estrofes;
- carregamento da base usa promessa compartilhada e ponte temporária de `fetch` restaurada em `finally`;
- resultados são descartados após mudança do documento ou do conteúdo, não por autosave;
- falha controlada do RimaLab permanece isolada do editor e das engines anteriores;
- seis abas foram organizadas em grade 3 × 2;
- restaurado o contrato acessível dos nomes das abas após uma capitalização indevida;
- corpora de ausência de padrão foram substituídos por exemplos foneticamente controlados;
- rima toante real entre “céu” e “luz” foi preservada como comportamento da engine, não removida para satisfazer o teste;
- adicionados testes de vazio, prosa com e sem ecos, poema rimado, estrofes, verso livre, integridade, obsolescência, exceção e mobile;
- matriz aprovada em Chromium e Firefox, com 60 execuções;
- preview atualizada somente após gate verde.