# Log — Gate 6.5: estabilização visual e de experiência

Data: 2026-07-28
Estado: concluído
Branch: `experiment/mass-notes-tiptap`
PR: `#155` (rascunho)

## Autorização

O mantenedor autorizou uma pausa de estabilização visual antes de qualquer decoration ProseMirror.

## Objetivo

Refinar a interface existente sem redesenhar o produto, preservando a identidade de oficina editorial brasileira e dando prioridade absoluta à leitura e à escrita.

## Fora do escopo

- decorations, sublinhados, highlights ou tooltips ancorados;
- alteração das engines ou das bases;
- mudança no schema Tiptap;
- aplicação automática de sugestões;
- service worker, Tauri, SQLite, DOCX ou paginação física;
- promoção para `main`.

## Diagnóstico inicial

1. O modo noite dependia de herança de `color` em muitos botões e painéis. A captura real mostrava textos quase invisíveis em abas, atalhos, páginas inativas e ações secundárias.
2. A toolbar usava `overflow-x: auto` no desktop. Em 1366 px, a última parte parecia cortada e exigia uma rolagem horizontal pouco evidente.
3. A interface mantinha três colunas até 820 px. Em 1024 px, biblioteca e rail comprimiam excessivamente o manuscrito.
4. Bordas, linhas de caderno, blueprint e caixas apareciam simultaneamente, reduzindo hierarquia.
5. Seleção, ação principal, estado ativo e futura análise linguística ainda não possuíam papéis cromáticos separados.
6. Ações secundárias do rail pareciam desabilitadas no modo noite.
7. Abreviações da toolbar não possuíam ajuda visual consistente.

## Direção aplicada

**Refinamento recomendado**, não redesign.

Preservado:

- papel, pautas e registro editorial;
- azul técnico, vermelho de impacto e laranja de seleção;
- biblioteca, página central e rail;
- marca Escrevaral e linguagem brasileira;
- todas as capacidades atuais.

Refinado:

- tokens explícitos de texto, superfície, controle, foco, seleção, ação e futura análise;
- contraste do modo noite;
- toolbar em grupos legíveis, sem caixas individuais e sem corte no desktop;
- estados ativo, hover, foco e desabilitado;
- largura dos rails e ponto de transição para drawers;
- densidade de linhas decorativas;
- legibilidade de conteúdo, blockquote, placeholder, metadados e ações;
- escala e respiro da marca;
- folga tipográfica do título no mobile.

## Implementação

### Camada visual reversível

Criados:

- `src/styles/design-stabilization.css`;
- `src/styles/design-stabilization-mobile.css`.

As duas folhas são carregadas depois dos estilos históricos. Nenhuma engine, schema, armazenamento ou comando editorial precisou ser alterado.

### Tokens semânticos

Foram separados:

- superfícies de canvas, painel e controle;
- texto primário, secundário e silencioso;
- borda normal e suave;
- ativo e texto sobre ativo;
- desabilitado;
- foco;
- seleção;
- ação principal;
- futura cor de análise.

Papel e noite possuem valores próprios.

### Toolbar

- grupos mantidos por função;
- `title` e nomes de grupo adicionados às abreviações;
- desktop usa quebra de linha, sem rolagem horizontal silenciosa;
- mobile preserva rolagem horizontal e alvos maiores;
- estados ativos usam fundo e texto próprios;
- desabilitados não dependem somente de opacidade.

### Responsividade

- rails estreitados sem cortar a marca;
- em até 1040 px, biblioteca e ferramentas viram drawers;
- o manuscrito ocupa a coluna principal inteira;
- acionadores permanecem montados para devolução de foco, porém ficam atrás do drawer aberto;
- título móvel ganhou padding e escala com folga para Chromium e Firefox.

### Tema

Transições cromáticas dos controles foram removidas. A troca papel/noite agora muda diretamente entre dois estados válidos de contraste, sem atravessar combinações intermediárias ilegíveis.

## Regressões adicionadas

Cinco cenários por navegador:

1. contraste do modo noite em tabs, documentos, ações, atalhos e manuscrito;
2. toolbar inteira em 1366 px, sem corte ou overflow silencioso;
3. prioridade do manuscrito e drawers em 1024 px;
4. ausência de overflow em 1440, 1366, 1280, 1024, 820, 430, 390 e 320 px, incluindo marca renderizada;
5. distinção entre estados ativo, inativo e desabilitado.

As capturas do gate incluem:

- desktop em papel;
- desktop em noite;
- drawer de biblioteca em 1024 px;
- mobile;
- painéis linguísticos dos gates anteriores.

## Incidentes e decisões

### Padding móvel sobrescrito

A regra de 1280 px era carregada depois da regra móvel histórica e mantinha padding de desktop em 390 px. O título ultrapassava a largura.

**Decisão:** corrigir a cascata com uma regra móvel explícita; o teste antigo permaneceu intacto.

### Métricas diferentes da fonte

Após a primeira correção, o Firefox ainda media overflow subpixel no título.

**Decisão:** reduzir discretamente o teto móvel e aumentar a folga, em vez de relaxar a asserção.

### Marca com pouco respiro

A marca aparecia inteira, mas perto demais da divisória. O primeiro auditor usava `scrollWidth` do bloco, que não representa com precisão a caixa do texto.

**Decisão:** medir o texto renderizado com `Range` e reduzir levemente a escala da marca para garantir respiro real nos dois motores.

### Captura antes do fim da transição do drawer

A primeira evidência de 1024 px foi capturada enquanto o drawer ainda se deslocava.

**Decisão:** aguardar a geometria final antes da captura e comprovar que o acionador possui z-index inferior ao drawer.

### Contraste transitório na troca de tema

O Firefox capturou o instante intermediário da transição de 180 ms, quando controles atravessavam uma combinação de baixo contraste.

**Decisão:** remover transições cromáticas dos controles. A troca de tema deve ser legível em todos os frames, não apenas ao terminar.

## Execuções

- `30325510063`: build verde; falha de título móvel; preview bloqueada;
- `30325904598`: Chromium verde; overflow subpixel do título no Firefox; preview bloqueada;
- `30326534842`: auditor inicial da marca inadequado; preview bloqueada;
- `30326856271`: medição renderizada revelou falta de respiro no Firefox; preview bloqueada;
- `30327062898`: contraste transitório na troca de tema; preview bloqueada;
- `30327303435`: build, Chromium, Firefox, 90 execuções, preview e artefato aprovados.

## Evidência final

- commit funcional: `2031f51349f8355b2a847eb49a9c540c55b27674`;
- workflow: `30327303435`;
- Chromium: 45/45;
- Firefox: 45/45;
- total: 90/90;
- falhas: zero;
- flakiness: zero;
- preview: publicada após gate verde;
- aplicação pública, `main`, service worker, engines e bases: intactos.

## Critérios de aprovação

- texto e controles essenciais legíveis no papel e no modo noite: aprovado;
- controles habilitados distinguíveis dos desabilitados: aprovado;
- toolbar inteira em 1366 px: aprovado;
- drawers em 1024 px: aprovado;
- seleção preservada sem dominar o manuscrito: aprovado;
- ausência de overflow horizontal nos breakpoints: aprovado;
- contratos acessíveis anteriores: aprovados novamente;
- Gates 1 a 6: aprovados novamente;
- preview somente após gate verde: aprovado.

## Decisão final

**Gate 6.5 aprovado para avaliação manual e continuidade experimental.**

A aprovação não autoriza decorations, marcações inline, substituição automática, merge ou publicação pública. O próximo trabalho é a auditoria manual do contrato de posições com textos reais antes de qualquer plugin de decorations.
