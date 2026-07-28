# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-27

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública e `main`: intactas;
- editor artesanal anterior: referência de UX, não fundação técnica;
- Gates 1, 2, 3, 4 e 5: verdes;
- navegadores obrigatórios: Chromium e Firefox;
- engines integradas: Revisão, Espelho de Voz, Termos que pedem contexto e RimaLab;
- matriz atual: 30 cenários por navegador, 60 execuções;
- próximo passo: avaliação manual do RimaLab antes do contrato de posições.

## Decisões que não devem ser reabertas sem evidência

1. Tiptap/ProseMirror é o motor de edição.
2. JSON do Tiptap é a fonte estrutural; HTML e texto são derivados.
3. Engines não conhecem React, Tiptap ou DOM; entram por adaptadores.
4. IndexedDB é a fonte principal; localStorage serve apenas para preferências e recuperação emergencial.
5. Nenhuma aba pode sobrescrever outra silenciosamente.
6. Cada documento possui histórico de edição isolado.
7. Preview não é publicação e só é atualizada após gate verde.
8. A identidade visual é editorial brasileira, sem ornamentos cobrindo o papel.
9. Não criar regras próprias de cursor quando o comportamento válido do ProseMirror é suficiente.
10. Documentação, testes e logs fazem parte da definição de pronto.
11. Uma análise linguística é invalidada por mudança do documento ou do conteúdo, não por autosave do mesmo conteúdo.
12. Voz, público e ecos literários são hipóteses heurísticas, nunca diagnóstico definitivo.
13. Termos contextuais não são erros nem palavras proibidas; narrador, personagem, época, citação e intenção crítica fazem parte da decisão.
14. Nenhuma alternativa contextual pode alterar o manuscrito sem ação humana explícita e um gate próprio.
15. Bases carregadas por caminho relativo devem ser fornecidas pelo adaptador durante toda a inicialização assíncrona, sem editar a engine ou manter cópia manual divergente.
16. Prosa e verso recebem contratos e linguagens diferentes no RimaLab.
17. Escansão automática é aproximação pedagógica; sinalefa, dicção regional, oralidade e intenção musical podem mudar a leitura.
18. Ausência de rima não é defeito e verso livre continua sendo verso.
19. O RimaLab recebe uma serialização sonora derivada do JSON Tiptap; o `plainText` geral não deve ser usado quando apagar fronteiras de verso ou estrofe.
20. Blocos vazios são preservados como separadores de estrofe na fonte sonora.
21. Rimas toantes reconhecidas pela engine não devem ser descartadas apenas para fazer um teste passar.
22. Nomes acessíveis já usados por testes e usuários são contratos estáveis; mudanças cosméticas devem ser feitas por CSS, não renomeando a interface sem motivo.

## Incidentes que orientam a arquitetura

- O protótipo com `contenteditable` exigiu correções repetidas de Enter, Backspace, paste, seleção e histórico.
- O QA encontrou perda silenciosa entre duas abas.
- O primeiro drawer móvel ficou abaixo do overlay por stacking context.
- O histórico Tiptap inicialmente atravessava documentos; foi isolado remontando a instância por documento.
- O workflow passou a bloquear a publicação da preview quando o gate falha.
- O Espelho de Voz inicialmente desaparecia após autosave porque a revisão persistida era confundida com mudança semântica; Firefox revelou a condição temporal.
- O vocabulário contextual inicialmente falhou porque duas chamadas concorrentes de `ensureLoaded()` usaram fontes de dados diferentes; o carregamento passou a usar uma promessa compartilhada.
- Um teste tentou importar TypeScript de fonte no build compilado; testes de falha agora atuam sobre a API global já carregada pelo produto.
- A primeira captura contextual quebrou “DENEGRIR” no meio; nomes de termos agora ocupam linha própria e possuem regressão geométrica.
- O primeiro corte do RimaLab capitalizou e acentuou nomes de abas, quebrando o contrato acessível dos gates anteriores. Os nomes estáveis foram restaurados; a aparência em caixa alta permanece no CSS.
- Uma frase escolhida como “prosa neutra” continha três padrões sonoros reais para a heurística. Corpora de teste sonoro precisam ser foneticamente controlados.
- Um corpus chamado de “verso livre sem rima” continha uma rima toante entre “céu” e “luz”. O auditor foi corrigido, não a engine.
- O `plainText` com dois separadores entre todos os blocos transformaria cada verso em estrofe isolada. O RimaLab passou a usar serialização própria do JSON Tiptap.

## Contratos técnicos ativos

### Documento

Mantém pelo menos:

- `id`;
- `title`;
- `content` em JSON Tiptap;
- `plainText`;
- `revision`;
- `status`;
- datas e metadados.

### Engines

Cada adaptador deve:

- carregar a engine original sem modificá-la;
- declarar tipos próprios;
- normalizar resposta defensivamente;
- tratar ausência ou exceção;
- não manipular DOM;
- receber snapshot explícito;
- permitir descarte de resultado obsoleto;
- preservar disclaimers, contexto e níveis de confiança importantes;
- coordenar carregamento assíncrono sem alterar `fetch` além do menor intervalo necessário;
- restaurar qualquer ponte global em `finally`;
- criar derivado textual específico quando a engine depender de estrutura que o `plainText` geral não preserva.

### Qualidade

Toda regressão relevante deve virar teste quando automatizável. Chromium e Firefox são obrigatórios para o editor e para cada nova engine integrada. Capturas são evidência complementar; não substituem interação, corpus controlado nem asserções geométricas.

## Limitações conhecidas

Ainda não estão aprovados:

- calibração ampla do RimaLab com cordel, repente, canção, poesia falada e variedades regionais;
- contrato comum de offsets e posições ProseMirror;
- decorations inline;
- aplicação automática de sugestões;
- service worker e abertura offline em nova sessão;
- Tauri e SQLite;
- DOCX;
- paginação física;
- leitores de tela reais;
- teclado virtual real;
- promoção para a entrada pública.

## Como retomar

1. ler `README.md`, `PLAN.md`, `MEMORY.md` e o log mais recente;
2. conferir o estado do PR `#155` e o último workflow;
3. não pressupor que capturas representam o produto atual;
4. reproduzir qualquer falha antes de corrigir;
5. usar textos foneticamente controlados ao testar ausência de padrões;
6. atualizar esta memória ao encerrar o lote.