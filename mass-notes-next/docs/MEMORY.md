# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-28

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública e `main`: intactas;
- editor artesanal anterior: referência de UX, não fundação técnica;
- Gates 1, 2, 3, 4, 5, 6, 6.5 e 6.75: verdes;
- navegadores obrigatórios: Chromium e Firefox;
- engines integradas: Revisão, Espelho de Voz, Termos que pedem contexto e RimaLab;
- contrato de posições aprovado sem decorations;
- estabilização visual aprovada sem redesign;
- fusão visual Blueprint Tokon aprovada sem alterar layout;
- matriz atual: 50 cenários por navegador, 100 execuções;
- próximo passo: auditoria manual do contrato com textos reais antes de decorations ProseMirror.

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
22. Nomes acessíveis já usados por testes e usuários são contratos estáveis; mudanças cosméticas devem ser feitas por CSS.
23. O contrato de posições nasce do Node ProseMirror real, não de HTML reparseado.
24. Offsets linguísticos usam unidades de código UTF-16; emoji pode ocupar duas unidades.
25. `documentId` identifica a página; `contentSignature` identifica a estrutura. Um não substitui o outro.
26. A assinatura estrutural é calculada sobre JSON estável e independe de `revision`.
27. Separadores `\n\n` entre blocos são virtuais e exigem afinidade explícita.
28. Ranges formados apenas por separadores virtuais colapsam em fronteira segura.
29. `hardBreak` corresponde a um `\n` e a uma unidade ProseMirror.
30. Blocos vazios, inclusive o parágrafo final criado pelo Tiptap, são estrutura válida e não devem ser apagados pelo derivado textual.
31. Consultar o contrato não pode despachar transação, alterar seleção, HTML, histórico ou manuscrito.
32. Decorations não fazem parte do contrato; terão gate, plugin e política de obsolescência próprios.
33. Pipelines com `tee` devem usar `set -o pipefail`; registrar logs nunca pode mascarar falha.
34. Tokens visuais devem ser semânticos: texto, superfície, controle, ativo, desabilitado, foco, seleção, ação e análise são papéis diferentes.
35. Modo noite não pode depender de herança acidental de cor.
36. A troca de tema não deve atravessar frames de baixo contraste; controles não interpolam cores entre papel e noite.
37. Em até 1040 px, o manuscrito é a prioridade e biblioteca/ferramentas operam como drawers.
38. Desktop não deve depender de rolagem horizontal silenciosa na toolbar; mobile pode usar rolagem explícita com alvos maiores.
39. O laranja de seleção não deve ser reutilizado como linguagem de análise linguística.
40. Capturas visuais devem ser feitas depois do fim das transições relevantes e nunca substituem medições geométricas.
41. No tema Blueprint, o blueprint é o ambiente e o manuscrito é o objeto principal.
42. Paleta, aplicação e composição do papel permanecem em arquivos separados e reversíveis.
43. O canvas pode ser azul técnico; a folha clara deve permanecer papel quente opaco.
44. Pautas do papel usam tile de 48 px e `repeat-y`; `repeating-linear-gradient` não deve ser reintroduzido na folha.
45. Mudanças de skin não autorizam alteração de DOM, grid, larguras, breakpoints, Tiptap, engines ou persistência.

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
- O primeiro corte do RimaLab alterou nomes acessíveis das abas; o contrato estável foi restaurado.
- Uma frase chamada de prosa neutra continha padrões sonoros reais; corpora negativos devem ser foneticamente controlados.
- Um corpus chamado de verso sem rima continha rima toante entre “céu” e “luz”; o auditor foi corrigido, não a engine.
- O `plainText` geral apagava fronteiras de estrofe; o RimaLab passou a usar serialização própria.
- O primeiro build do Gate 6 falhou por tipagem estrita da serialização e pelo uso incorreto de `onDestroy` no Tiptap 3.
- O primeiro registro de `build.log` usou `tee` sem `pipefail`, mascarou a falha e deixou os testes abrirem uma página 404.
- O primeiro auditor do contrato tentou remover o parágrafo vazio final que o Tiptap cria depois de lista ou título.
- A documentação do Gate 5 dizia 30 cenários por navegador, mas a suíte executável anterior continha 31.
- No Gate 6.5, uma regra de 1280 px sobrescreveu o padding móvel e voltou a cortar o título.
- Firefox revelou overflow subpixel no título mesmo quando Chromium já passava.
- A marca aparecia completa, mas sem respiro; o auditor passou a medir a caixa do texto renderizado com `Range`.
- A captura inicial de 1024 px ocorria durante a transição do drawer.
- Firefox capturou o instante intermediário da troca de tema com contraste insuficiente; as transições cromáticas foram removidas.
- No Gate 6.75, o primeiro auditor lia tokens noturnos no elemento errado, usava nome acessível antigo e capturava a animação da folha; o auditor foi corrigido sem alterar o produto.
- Um paste do teste do RimaLab disparava análise antes de React refletir a transação no Firefox; o auditor passou a aguardar o ciclo `Alterado/Salvando` → `Salvo`.
- A primeira pauta Blueprint usava `repeating-linear-gradient` e lavava o papel com ciano. Diagnóstico por camadas provou que grain, halftone e canvas não eram a causa. A pauta passou a ser tile de 48 px.

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

### Posições

O contrato aprovado fornece:

- snapshot versão 1;
- `documentId`;
- `contentSignature`;
- codificação `utf-16`;
- texto derivado;
- blocos e segmentos;
- conversão offset → posição com afinidade;
- conversão posição → offset com afinidade;
- conversão de ranges nos dois sentidos;
- clamp defensivo;
- colapso de ranges exclusivamente virtuais.

A API de QA fica anexada à instância DOM atual do editor como propriedade somente de integração. Isso não autoriza engines a manipular DOM nem constitui API pública estável.

### Design e responsividade

- `design-stabilization.css` e `design-stabilization-mobile.css` preservam contraste e responsividade;
- `theme-blueprint.tokens.css`, `theme-blueprint.css` e `theme-blueprint-composition.css` formam a skin Blueprint;
- papel e noite possuem tokens próprios;
- conteúdo autoral usa contraste alto;
- controles ativos, inativos e desabilitados devem ser visualmente distinguíveis;
- toolbar pode quebrar linha no desktop e rolar apenas no mobile;
- em até 1040 px os rails são drawers;
- acionadores permanecem montados para devolução de foco, mas ficam abaixo do drawer aberto;
- marca e título possuem regressões geométricas em Chromium e Firefox;
- seleção, ação principal e futura análise possuem papéis cromáticos separados;
- o canvas usa blueprint azul, enquanto o papel claro permanece `#f3eee4`;
- a pauta é tileada a cada 48 px para não colorir a folha inteira.

### Qualidade

Toda regressão relevante deve virar teste quando automatizável. Chromium e Firefox são obrigatórios para o editor, para cada infraestrutura linguística e para mudanças visuais transversais. Capturas são evidência complementar; não substituem interação, corpus controlado, assinatura estrutural, round-trip de posições, contraste ou asserções geométricas.

Matriz atual: 50 cenários por navegador, 100 execuções no Gate 6.75.

## Limitações conhecidas

Ainda não estão aprovados:

- auditoria ampla do contrato com textos reais e Unicode combinante;
- decorations inline;
- navegação acessível entre issue e trecho;
- aplicação automática de sugestões;
- calibração ampla do RimaLab com cordel, repente, canção, poesia falada e variedades regionais;
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
5. declarar se um offset é UTF-16 antes de comparar resultados;
6. preservar blocos vazios e separar texto visível de estrutura textual derivada;
7. não iniciar decorations sem auditoria manual e autorização explícita;
8. preservar os tokens semânticos e testar os dois temas ao alterar componentes;
9. preservar a separação entre canvas Blueprint e papel quente;
10. atualizar esta memória ao encerrar o lote.