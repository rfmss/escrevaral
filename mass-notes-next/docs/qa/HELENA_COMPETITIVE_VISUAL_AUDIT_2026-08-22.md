# Helena — auditoria visual competitiva adversarial

Data: 2026-08-22
Base auditada: `47245e7a433c8f8acd34d8d6d0ba7e0cac173b6f`
Produto: Escrevaral / Mass Notes
Modo: benchmark hostil, procurando motivos para um concorrente construir uma experiência melhor.

## Persona

**Helena Nóbrega** é a Chief Product & Design Officer da concorrente hipotética **Margem**. Tem experiência sênior em design de produto, tipografia editorial, processadores de texto, ferramentas local-first, acessibilidade e UX para autores. Sua missão não é validar o Escrevaral: é encontrar inconsistências, ruído, desperdício de área nobre, affordances enganosas, estados que parecem pertencer a outro produto e qualquer detalhe que possa ser usado como vantagem competitiva.

Pergunta-guia: **“Se eu fosse lançar um concorrente amanhã, onde eu atacaria o Escrevaral?”**

## Evidência usada nesta passagem

- três capturas atuais fornecidas pelo responsável do produto, incluindo a composição desktop 1335×654 e o estado `Tags do documento` aberto;
- shell e wiring do HEAD `47245e7…`, especialmente `App.tsx`, `RightRailImpl.tsx`, `WritingGoalsBridge.tsx`, `WritingToolsBridge.tsx`, `WritingConfigBridge.tsx`, `WritingExportBridge.tsx` e `WritingTagsBridge.tsx`;
- contratos de layout em `theme-escrevaral-ux-stabilization.css`;
- provas de release já publicadas em `preview-escrevaral-paper-home` (`release-1366.png`, `release-1440.png`, `release-1920.png`, `release-390.png`).

Esta passagem já encontra bloqueadores suficientes para impedir promoção a `main`. O sweep visual click-by-click abaixo é obrigatório antes do aceite final e deve ampliar a coleta de screenshots dos estados vivos, não apenas da tela-base.

## Regra de área nobre

Helena divide a composição em três níveis:

- **A — área sagrada:** manuscrito e contexto imediato de escrita;
- **B — área operacional:** comandos usados durante a escrita;
- **C — área administrativa:** metadados, configuração, exportação, organização e ferramentas secundárias.

**Regra de release:** um elemento de nível C não pode dominar visualmente ou invadir a área A. Densidade elevada só é aceitável quando o usuário a solicita deliberadamente.

## Severidade

- **P0:** quebra composição, tema ou tarefa principal; bloqueia release;
- **P1:** degrada sensivelmente UX ou qualidade percebida;
- **P2:** dívida de acabamento perceptível;
- **P3:** polimento fino.

Marcadores: `V` visual, `UX` interação, `IA` arquitetura da informação, `A11Y`, `R` responsividade, `ARCH` arquitetura de UI.

---

# Achados da passagem 1

## HEL-001 — Tags abre uma segunda casa visual

**Severidade:** P0 · V/UX

**Caminho:** análise direita → `+` em Tags → editor de marcadores.

**Observado:** o shell é papel claro e o painel aberto aparece como uma grande massa azul-marinho com laranja saturado. No print de 1335 px, o painel ocupa aproximadamente 360 px de uma shell de ~1303 px, cerca de **27,6% da largura útil**.

**Problema:** ferramenta secundária domina o manuscrito, muda a temperatura cromática da tela e parece produto administrativo enxertado sobre um editor editorial.

**Oportunidade do concorrente:** vender serenidade e coerência: “metadados sem tirar você do texto”.

**Aceite:** no tema claro, Tags deve usar a mesma família papel/tinta/azul técnico da shell; o painel precisa ser reconhecido como parte do Escrevaral mesmo sem o logo visível.

---

## HEL-002 — O rail contextual consome área sagrada demais

**Severidade:** P0 · V/UX

**Observado:** quando Tags abre, a coluna de escrita visível cai para cerca de 692 px enquanto o painel secundário assume 360 px. A geometria pode estar tecnicamente contida, mas a hierarquia perceptiva é invertida pela massa escura e pelo peso do painel.

**Problema:** “não cobrir o manuscrito” não é suficiente. A ferramenta administrativa ainda rouba protagonismo da tarefa principal.

**Aceite:** manuscrito continua sendo o primeiro centro ótico; rail contextual deve parecer leve, subordinado e temporário.

---

## HEL-003 — Topbar e formatbar não compartilham uma regência ótica convincente

**Severidade:** P0 · V

**Observado:** Documento, Modo, Busca e ações principais usam células rígidas, mas a barra imediatamente abaixo reorganiza eixos sem continuidade visual clara. O cluster `Estilo / Fonte / Tamanho` não parece derivar da mesma malha do cabeçalho.

**Problema:** o topo está “montado em faixas”, não composto como uma única superfície editorial.

**Aceite:** eixos verticais dominantes precisam atravessar topbar e formatbar; grupos devem parecer deliberadamente alinhados, não apenas caber na largura.

---

## HEL-004 — Cluster Estilo/Fonte/Tamanho está encavalado e pesado

**Severidade:** P0 · V/UX

**Observado:** três controles textuais, divisórias, `−/+` e a fileira de ícones abaixo disputam uma região pequena. As baselines e alturas não formam um grupo coeso; o conjunto parece uma toolbar técnica adaptada.

**Problema:** alta carga visual no ponto de entrada do manuscrito.

**Oportunidade do concorrente:** tratar formatação como ferramenta contextual e silenciosa, não como painel de controle permanente.

**Aceite:** uma grade clara de grupos, alturas consistentes, separadores só onde carregam significado e pelo menos um nível a menos de ruído permanente.

---

## HEL-005 — A biblioteca esquerda tem colisão hierárquica visível

**Severidade:** P0 · V/IA

**Observado:** `BIBLIOTECA LOCAL`, `DOCUMENTOS LOCAIS`, contagem de palavras e o segundo rótulo `DOCUMENTOS` ficam comprimidos no mesmo trecho. Na captura, o segundo `DOCUMENTOS` invade visualmente a área da contagem e parece duplicação/encavalamento.

**Problema:** o leitor não distingue com clareza “coleção atual” de “lista de documentos”.

**Aceite:** cada nível precisa de uma única função semântica e uma distância vertical consistente; nenhum label deve atravessar a linha ótica de outro.

---

## HEL-006 — Busca e atalho Ctrl+K estão apertados no limite da célula

**Severidade:** P1 · V/UX

**Observado:** campo, ícone e `CTRL + K` disputam largura reduzida entre Modo e a régua de ações. O atalho parece encaixado a posteriori e encosta demais na borda da célula.

**Aceite:** busca deve parecer uma ação única; atalho secundário não pode competir com o placeholder nem parecer badge desalinhado.

---

## HEL-007 — A régua de ações dá peso equivalente a coisas de importância diferente

**Severidade:** P1 · IA/V

**Itens:** Metas, Oficina, Pesquisa, Exportar, Config.

**Problema:** cinco módulos quase idênticos sugerem igual frequência e igual importância. Configuração e exportação ficam visualmente no mesmo patamar de Pesquisa e Oficina, criando ruído constante na área B.

**Aceite:** hierarquia de frequência/risco; ações administrativas devem recuar visualmente sem perder descobribilidade.

---

## HEL-008 — O produto muda rótulos e comportamento do shell depois do render

**Severidade:** P1 · ARCH/V

**Evidência de wiring:** `App.tsx` rende `Notas` desabilitado; `WritingToolsBridge.tsx` localiza esse botão, habilita-o, troca o texto para `Oficina`, injeta ARIA e intercepta o clique.

**Problema:** a UI publicada depende de mutação tardia de DOM para representar a própria navegação principal. Isso aumenta risco de first-paint inconsistente, regressões de layout e estados em que fonte, teste e tela deixam de contar a mesma história.

**Oportunidade do concorrente:** navegação declarativa e estável desde o primeiro frame.

**Aceite:** ações principais devem nascer com identidade e handler finais no componente proprietário; bridges não devem precisar renomear ou ressuscitar controles estruturais.

---

## HEL-009 — Configurações tem dupla responsabilidade no mesmo trigger

**Severidade:** P1 · ARCH/UX

**Evidência:** `App.tsx` usa o botão `Config.` para alternar o tema; `WritingConfigBridge.tsx` intercepta o mesmo clique para abrir um modal e depois dispara programaticamente o trigger original para trocar o tema.

**Problema:** o botão estrutural possui uma ação base e uma camada posterior que altera seu significado. Funciona, mas cria acoplamento desnecessário e risco de regressão de interação.

**Aceite:** Configurações deve possuir uma única ação declarativa; aparência é opção dentro dela, não comportamento oculto do trigger.

---

## HEL-010 — Exportar também depende de interceptação sobre uma ação base diferente

**Severidade:** P1 · ARCH/UX

**Evidência:** `App.tsx` chama exportação HTML diretamente; `WritingExportBridge.tsx` intercepta o clique antes da ação e transforma o botão em lançador de um painel com seis formatos.

**Problema:** sem a bridge, o significado do mesmo botão muda radicalmente. A superfície principal é uma composição de comportamentos sobrepostos.

**Aceite:** o botão Exportar deve abrir declarativamente o seletor de formatos; nenhum fallback funcional invisível deve disputar o mesmo clique.

---

## HEL-011 — Tags depende de uma cadeia DOM → mobile-tools → rail → tab → input

**Severidade:** P1 · ARCH/UX

**Evidência:** `WritingTagsBridge.tsx` encontra o `+` da análise pelo seletor estrutural, aciona `.mobile-tools`, espera o rail abrir, injeta `reference-tags-open`, seleciona Pulso e foca `#document-tags`.

**Problema:** uma ação simples de metadado depende de múltiplas projeções e seletores indiretos. É exatamente o tipo de arquitetura que permite a experiência funcional passar e o acabamento visual divergir entre estados.

**Aceite:** Tags deve ter um caminho explícito de estado/componentes, com o rail contextual recebendo `mode="tags"` ou contrato equivalente, sem coordenação por mutação de DOM.

---

## HEL-012 — Estado de Tags preenchido parece desabilitado/quebrado

**Severidade:** P1 · V/UX/A11Y

**Observado:** campo contém `poesia, memória, ensaio`, mas o botão `Salvar marcadores` possui contraste tão baixo que parece inativo. Textos auxiliares também perdem legibilidade dentro do painel escuro.

**Problema:** não fica claro se “não há mudanças para salvar”, se o controle está realmente desabilitado ou se há falha.

**Aceite:** estados `salvo`, `alterado`, `salvando` e `inválido` devem ser visualmente distintos sem depender só de opacidade baixa.

---

## HEL-013 — O vazio do painel de Tags tem peso estrutural sem conteúdo equivalente

**Severidade:** P1 · V

**Observado:** poucos controles ocupam o topo e sobra uma grande área escura vazia. O painel mantém a mesma massa visual de uma análise densa sem possuir densidade informacional correspondente.

**Aceite:** rail contextual deve adaptar densidade/altura interna ou, mantendo coluna fixa, reduzir dramaticamente massa cromática e ornamentação.

---

## HEL-014 — O caret/editor começa num eixo que não conversa claramente com a toolbar

**Severidade:** P1 · V

**Observado:** o início real da escrita aparece recuado do eixo estrutural esquerdo da workspace. O deslocamento pode ser margem editorial intencional, mas hoje não se conecta visualmente aos controles acima e parece sobra de layout.

**Aceite:** margem do manuscrito deve ser percebida como margem de página, não como desalinhamento acidental; toolbar e régua devem respeitar/explicar esse eixo.

---

## HEL-015 — Rodapé tem módulos sem baseline comum

**Severidade:** P1 · V

**Observado:** `SALVO LOCALMENTE`, meta diária, `FOCO / Pronto`, play, idioma, livro e tela cheia parecem módulos de alturas óticas diferentes. O bloco de idioma e os dois ícones finais dão sensação de encaixe residual.

**Aceite:** uma única baseline ótica, paddings consistentes, ícones com mesma caixa e módulos administrativos menos dominantes.

---

## HEL-016 — Foco/Pronto e o botão play parecem duas affordances distintas para uma única função

**Severidade:** P1 · UX/IA

**Observado:** texto de estado ocupa grande largura e o botão quadrado aparece separado, como se fossem duas ações diferentes.

**Aceite:** estado + ação devem formar um único componente compreensível, com indicação clara do que muda ao clicar.

---

## HEL-017 — Idioma ocupa espaço permanente apesar de não ser decisão frequente

**Severidade:** P2 · IA/V

**Observado:** `IDIOMA / Português (BR)` tem célula própria no rodapé. A própria Configuração também exibe o locale.

**Problema:** informação administrativa permanente concorre com status de escrita.

**Aceite:** manter locale acessível em Configurações; no footer, só permanecer se houver função operacional frequente comprovada.

---

## HEL-018 — Livro e tela cheia ficam visualmente órfãos no footer

**Severidade:** P2 · V/IA

**Observado:** dois ícones grandes em células finais, sem label persistente, parecem utilidades acrescentadas depois da composição principal.

**Aceite:** reunir utilidades secundárias ou incorporá-las a Configurações; se permanecerem, padronizar caixa, peso e relação com os módulos vizinhos.

---

## HEL-019 — O CSS reconhece a intenção correta, mas o resultado visual prova que contrato e composição ainda divergem

**Severidade:** P0 · ARCH/V

**Evidência:** `theme-escrevaral-ux-stabilization.css` documenta que ferramentas contextuais não devem competir com o manuscrito e especifica fundo `var(--paper)`, porém o estado de Tags fornecido ainda aparece dark e dominante.

**Problema:** o sistema tem intenção declarada, mas camadas de cascade/estado ainda conseguem produzir uma casa diferente. O QA deve julgar pixels/estado final, não a intenção do CSS.

**Aceite:** screenshot de cada entrada contextual no tema claro + assert visual mínimo + inspeção Helena.

---

## HEL-020 — A banca de release cobre geometria melhor do que coerência perceptiva

**Severidade:** P0 · QA

**Problema:** um rail pode estar perfeitamente à direita, sem overflow e sem overlay, e ainda assim parecer um software diferente. A captura do usuário mostrou exatamente esse tipo de falso verde.

**Aceite:** o release precisa conter screenshots obrigatórios dos estados vivos e checklist humano/adversarial de tema, hierarquia, densidade, alinhamento e área nobre.

---

# Sweep click-by-click obrigatório

Helena deve percorrer os fluxos abaixo em 1366×768 e 1440×900; os estados críticos também em 1920×1080, 1280×720 e 390×844.

## Shell / topo

- título do documento + editar;
- busca + `Ctrl/Cmd+K`;
- Metas → modal → alterar meta → iniciar/pausar/reiniciar temporizador → fechar;
- Oficina → cada aba e cada ferramenta interna;
- Pesquisa → vazio, analisando, resultado, ir ao trecho, ocultar/mostrar marcas;
- Exportar → todos os formatos e estados vazio/ocupado/erro/sucesso;
- Config. → tema, foco, tela cheia, Anatomia, fechar.

## Biblioteca

- abrir/recolher;
- novo documento;
- trocar entre documentos;
- título longo;
- lista longa com scroll;
- busca sem resultado;
- favorito/tags refletidos na organização quando aplicável.

## Editor

- Estilo;
- Fonte;
- Tamanho −/+;
- negrito, itálico, sublinhado;
- alinhamentos;
- listas;
- demais controles estruturais;
- seleção de texto;
- texto curto, longo e vazio;
- foco e retorno.

## Painel direito / metadados

- recolher análise;
- estados editoriais;
- favorito;
- Tags → vazio, preenchido, alterado, salvo, erro/limite;
- contagem e linguagem em textos curtos/longos.

## Rail contextual

- Pulso;
- Revisão;
- Palavras;
- Voz;
- Contexto;
- RimaLab;
- Ferramentas;
- Precision;
- Figuras;
- Prova de autoria;
- Backup/restauração quando exposto;
- fechar por `×`, overlay e `Escape` quando aplicável;
- mudar de documento com rail aberto;
- resize com rail aberto.

## Footer

- status local;
- meta diária;
- Foco/play;
- idioma;
- Anatomia/livro;
- tela cheia.

Para cada clique registrar:

1. o que Helena esperava;
2. o que abriu;
3. se mudou o grid;
4. se invadiu área A;
5. se manteve tema/tipografia;
6. se houve salto/encavalamento/clipping;
7. se o fechamento devolveu o contexto;
8. severidade;
9. “como um concorrente exploraria isso”.

---

# O que Helena copiaria

- identidade editorial própria e reconhecível;
- insistência em local-first/offline;
- integração entre escrita e análise linguística;
- estrutura de biblioteca + manuscrito + análise em uma única casa;
- transparência de que análises são hipóteses e não substituem automaticamente o texto.

# Onde Helena atacaria comercialmente

1. **serenidade:** menos chrome permanente e mais manuscrito;
2. **consistência:** toda ferramenta parece o mesmo produto desde o primeiro frame;
3. **arquitetura:** menos bridges que interceptam/mutam controles estruturais;
4. **hierarquia:** administração recua, escrita domina;
5. **acabamento:** grid, baselines, toolbar e footer sem “encaixes residuais”.

# Veredito Helena — passagem 1

**NÃO ENTREGAR A `main` AINDA.**

A base funcional é forte, mas o produto ainda oferece ao concorrente uma narrativa fácil: “mesmas capacidades, com menos ruído e mais consistência visual”. Há P0 visuais e de QA claramente demonstrados pela captura de Tags e pela divergência entre a intenção dos contratos CSS e a composição final.

## Ordem de correção recomendada

1. P0: rail contextual / Tags no tema claro e regra de área nobre;
2. P0: grid topbar + formatbar + entrada do manuscrito;
3. P0: colisão hierárquica da biblioteca esquerda;
4. P1: regência das ações principais e busca;
5. P1: footer/Foco/Idioma/utilidades;
6. P1: reduzir acoplamentos de navegação por bridges apenas onde isso for seguro nesta estabilização;
7. repetir Helena em todos os estados vivos;
8. somente depois fechar Playwright + build + fontes + PWA + preview + smoke no mesmo SHA.

## Regra de governança

Nenhuma correção visual autoriza alteração de engine linguística, corpus ou heurística. Qualquer novo commit invalida o checkpoint de release anterior e exige novo gate completo no mesmo HEAD.
