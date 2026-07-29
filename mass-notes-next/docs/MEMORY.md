# Memória consolidada — Mass Notes Next

Atualizado em: 2026-07-28

## Estado atual

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública e `main`: intactas;
- editor artesanal anterior: referência de UX, não fundação técnica;
- Gates 1, 2, 3, 4, 5, 6, 6.5, 6.75, 6.9, 7, 8 e 9A: verdes;
- navegadores obrigatórios: Chromium e Firefox;
- engines integradas: Revisão, Espelho de Voz, Termos que pedem contexto e RimaLab;
- contrato de posições aprovado e auditado com textos brasileiros reais;
- primeira projection inline aprovada somente para ranges verificáveis da Revisão;
- navegação de cartão para trecho e ocultação reversível aprovadas;
- estabilização visual e fusão Blueprint Tokon aprovadas sem alterar a fundação;
- Anatomia do Livro integrada por runtime fiel e leve gerado na CI;
- exportação estrutural local aprovada em TXT, Markdown e HTML;
- dependências reproduzíveis por overrides, `package-lock.json` e `npm ci`;
- preview com assets estáveis, fallback e smoke test público;
- matriz atual: 80 cenários por navegador, 160 execuções;
- próximo passo lógico proposto: Gate 9B, cópia nativa e restauração segura.

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
24. Offsets linguísticos usam unidades de código UTF-16; emoji pode ocupar duas ou mais unidades.
25. `documentId` identifica a página; `contentSignature` identifica a estrutura. Um não substitui o outro.
26. A assinatura estrutural é calculada sobre JSON estável e independe de `revision`.
27. Separadores `\n\n` entre blocos são virtuais e exigem afinidade explícita.
28. Ranges formados apenas por separadores virtuais colapsam em fronteira segura.
29. `hardBreak` corresponde a um `\n` e a uma unidade ProseMirror.
30. Blocos vazios, inclusive o parágrafo final criado pelo Tiptap, são estrutura válida e não devem ser apagados pelo derivado textual.
31. Consultar o contrato não pode despachar transação, alterar seleção, HTML, histórico ou manuscrito.
32. Decorations ficam fora do contrato de posições e vivem em plugin isolado, com política de obsolescência própria.
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
46. `br.ProseMirror-trailingBreak` e `br.ProseMirror-separator` são placeholders técnicos do DOM, não `hardBreak` autoral nem unidade textual.
47. Um oráculo DOM independente deve reconstruir apenas texto autoral e ignorar placeholders de edição.
48. Diferenças do atalho nativo `Home` entre navegadores não invalidam o contrato quando HTML, assinatura e seleção permanecem iguais antes/depois dentro de cada motor.
49. A família Tiptap deve permanecer travada por versões diretas, overrides e lockfile.
50. CI e retomadas locais usam `npm ci`; `npm install` não é o caminho normal após o lockfile.
51. Corpora negativos e auditorias de posição devem usar texto original controlado, mas próximo do uso editorial brasileiro real.
52. O Gate 7 autoriza marcações apenas para ranges verificáveis da Revisão; não autoriza outras engines nem aplicação automática.
53. Uma marca só existe quando documento, assinatura, posição e fragmento correspondem ao snapshot atual.
54. Edição ou troca de documento remove projections antigas; não se mapeia leitura obsoleta para texto novo.
55. A forma do DOM não é contrato para decorations sobrepostas; cartões e navegação por ocorrência são o comportamento observável.
56. Ocultar marcas muda somente a apresentação e não apaga cartões, ranges, leitura ou conteúdo.
57. Assets de preview usam nomes estáveis e o workflow precisa validar o endereço público antes de concluir.
58. `anatomia-original.html` é a fonte preservada; o runtime público é gerado durante a CI e não deve ser reconstruído manualmente.
59. `preview-mass-notes-tiptap` é produto de build. Correções definitivas pertencem à branch de fonte.
60. Exportações partem do JSON Tiptap; `plainText` não substitui a estrutura quando o formato consegue representá-la.
61. Serialização pura, download do navegador e interface React ficam em módulos separados.
62. HTML exportado escapa conteúdo e só mantém links com protocolos `http`, `https`, `mailto` ou `tel`.
63. Exportar é operação somente de leitura: não altera JSON, título, seleção, histórico, revisão, biblioteca ou persistência.
64. Cada formato preserva somente a semântica que consegue representar honestamente; TXT não finge possuir rich text.
65. DOCX, RTF, ePub, Obsidian e exportação múltipla exigem gates próprios e não entram por acréscimo oportunista ao serializador atual.
66. Exportação de documento não é cópia de segurança. Backup precisa de envelope versionado, validação, política de colisão e restauração não destrutiva.

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
- No Gate 6.9, o oráculo DOM contou `ProseMirror-trailingBreak` de parágrafos vazios como quebra autoral; o contrato estava correto e o oráculo foi corrigido.
- Uma instalação limpa resolveu cópia transitiva incompatível de `@tiptap/core` dentro do StarterKit; overrides e lockfile eliminaram a variação.
- A preview ficou branca porque HTML cacheado podia apontar para assets hash antigos removidos após force-push; assets estáveis, fallback, purge e smoke test público fecharam a lacuna.
- O primeiro teste do Gate 7 aceitava apenas “trecho localizado”; o plural correto revelou falso negativo no teste.
- Decorations sobrepostas fundiram atributos DOM; a suíte passou a provar cartões e navegações reais, não contagem de atributos internos.
- O prop `document` sombreou o global do navegador; TypeScript impediu `document.body` e a referência passou a ser `window.document.body`.
- Mudanças concorrentes criaram dois controles de visibilidade e dois testes equivalentes; ficaram apenas o controle contextual e a suíte dedicada.
- O StPageFlip emitiu evento tardio depois do retorno do miolo; o handler passou a ignorá-lo quando o palco não usa pageflip ou não há índice interior selecionado.
- A primeira execução do Gate 9A falhou porque o teste esperava um espaço dentro da tag `<em>` que não existia no HTML correto; a asserção foi corrigida sem alterar o exportador.

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

A auditoria editorial aprovada cobre 39 ranges por navegador em prosa, diálogo, ensaio, poesia, cordel, canção, Unicode e documento extenso. A evidência consolidada está em `docs/audits/GATE_6_9_POSITION_AUDIT.json`.

### Decorations da Revisão

- somente observações com posição e fragmento verificáveis recebem projection;
- a projection carrega identidade do documento e assinatura do conteúdo;
- o plugin mantém `DecorationSet` fora do JSON e do HTML autoral;
- `transaction.docChanged` limpa todas as marcas;
- navegação seleciona range e rola para o trecho sem editar;
- marks sobrepostas podem dividir ou fundir atributos DOM;
- visibilidade é apresentação reversível por classe no `body`;
- nenhuma sugestão é aplicada.

### Exportação estrutural

- `src/export/documentExport.ts` contém a serialização pura e o download isolado;
- `src/components/ExportPanel.tsx` contém somente a interface dos formatos;
- `src/styles/export-panel.css` contém a apresentação do painel;
- a API aceita um `EscrevaralDocument` e um `ExportFormat` explícito;
- formatos aprovados: `txt`, `md` e `html`;
- títulos, parágrafos, headings, `hardBreak`, marks, blockquote e listas são percorridos pelo JSON;
- conteúdo HTML e atributos são escapados;
- protocolos não permitidos são descartados, preservando o texto visível;
- nomes de arquivo são normalizados sem depender do DOM;
- o download usa `Blob` e URL temporária, revogada após o disparo;
- falhas futuras de um formato não devem contaminar os demais.

### Dependências

- versões Tiptap diretas permanecem exatas;
- `overrides` impedem resolução transitiva incompatível;
- `package-lock.json` é obrigatório e versionado;
- workflow e retomadas usam `npm ci`;
- alteração de dependência exige atualização consciente do lockfile e repetição da matriz completa.

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
- seleção, ação principal e análise possuem papéis cromáticos separados;
- o canvas usa blueprint azul, enquanto o papel claro permanece `#f3eee4`;
- a pauta é tileada a cada 48 px para não colorir a folha inteira;
- o painel de exportação usa o rail existente e não cria modal, overlay ou camada visual paralela.

### Qualidade

Toda regressão relevante deve virar teste quando automatizável. Chromium e Firefox são obrigatórios para o editor, para cada infraestrutura linguística, para exportação e para mudanças visuais transversais. Capturas são evidência complementar; não substituem interação, corpus controlado, assinatura estrutural, round-trip de posições, conteúdo real do download, contraste ou asserções geométricas.

Matriz atual: 80 cenários por navegador, 160 execuções no Gate 9A. Workflow `30415258895`: build, navegadores, publicação, renovação de cache e verificação pública verdes.

## Limitações conhecidas

Ainda não estão aprovados:

- cópia nativa e restauração do Mass Notes Next;
- compatibilidade de restauração com `.esc` legado;
- DOCX, RTF, ePub, Obsidian e exportação múltipla;
- decorations para Voz, Contexto, RimaLab ou qualquer outra engine;
- aplicação automática de sugestões;
- calibração ampla do RimaLab com cordel, repente, canção, poesia falada e variedades regionais;
- service worker e abertura offline em nova sessão;
- Tauri e SQLite;
- paginação física;
- leitores de tela reais;
- teclado virtual real;
- promoção para a entrada pública.

## Como retomar

1. ler `README.md`, `PLAN.md`, `MEMORY.md` e o log mais recente;
2. conferir o estado do PR `#155` e o último workflow;
3. instalar com `npm ci`, nunca depender de resolução transitiva nova;
4. abrir a preview e verificar os três downloads do Gate 9A antes de desenvolver outro lote;
5. não pressupor que capturas representam o produto atual;
6. reproduzir qualquer falha antes de corrigir;
7. declarar se um offset é UTF-16 antes de comparar resultados;
8. preservar blocos vazios e separar texto visível de estrutura textual derivada;
9. ignorar placeholders técnicos do ProseMirror ao construir oráculos DOM;
10. não ampliar decorations para outra engine sem autorização explícita e gate próprio;
11. preservar os tokens semânticos e testar os dois temas ao alterar componentes;
12. preservar a separação entre canvas Blueprint e papel quente;
13. para o Gate 9B, registrar primeiro o envelope versionado, a política de colisão e a restauração não destrutiva;
14. não misturar cópia de segurança com novos formatos editoriais;
15. atualizar esta memória ao encerrar o lote.
