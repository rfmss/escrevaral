# Log — Gate 6.5: estabilização visual e de experiência

Data: 2026-07-28
Estado: em andamento
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

1. O modo noite depende de herança de `color` em muitos botões e painéis. A captura real mostra textos quase invisíveis em abas, atalhos, páginas inativas e ações secundárias.
2. A toolbar usa `overflow-x: auto` no desktop. Em 1366 px, a última parte parece cortada e o usuário precisa descobrir uma rolagem horizontal dentro do papel.
3. A interface mantém três colunas até 820 px. Em 1024 px, biblioteca e rail comprimem excessivamente o manuscrito.
4. Bordas, linhas de caderno, blueprint e caixas aparecem simultaneamente, reduzindo hierarquia.
5. Seleção, ação principal, estado ativo e futuro resultado linguístico ainda não possuem papéis cromáticos suficientemente separados.
6. Ações secundárias do rail parecem desabilitadas no modo noite.
7. Abreviações da toolbar não possuem ajuda visual consistente, embora tenham função acessível parcial.

## Direção aprovada

**Refinamento recomendado**, não redesign.

Preservar:

- papel, pautas e registro editorial;
- azul técnico, vermelho de impacto e laranja de seleção;
- biblioteca, página central e rail;
- marca Escrevaral e linguagem brasileira;
- todas as capacidades atuais.

Refinar:

- tokens explícitos de texto, superfície, controle, foco e seleção;
- contraste do modo noite;
- toolbar em grupos legíveis e sem corte no desktop;
- estados ativo, hover, foco e desabilitado;
- largura dos rails e ponto de transição para drawers;
- densidade de linhas decorativas;
- legibilidade de conteúdo, blockquote, placeholder e metadados.

## Plano em commits reversíveis

1. registrar auditoria, escopo e critérios;
2. introduzir tokens semânticos e corrigir contraste;
3. estabilizar toolbar e seus nomes acessíveis;
4. refinar layout responsivo e densidade visual;
5. adicionar regressões visuais e de interação;
6. executar Chromium e Firefox;
7. revisar capturas reais;
8. atualizar plano, memória, changelog e documentação global.

## Critérios de aprovação

- texto primário e controles essenciais claramente legíveis no papel e no modo noite;
- nenhum controle habilitado pode parecer desabilitado;
- toolbar inteira acessível em 1366 px sem corte silencioso;
- em 1024 px, rails devem operar como drawers para preservar a área de escrita;
- estados ativo, inativo, hover, foco e desabilitado devem ser distinguíveis;
- seleção deve continuar clara sem dominar o manuscrito;
- ausência de overflow horizontal em 1440, 1366, 1024, 820, 430, 390 e 320 px;
- navegação por teclado e contratos acessíveis anteriores preservados;
- Gates 1 a 6 novamente verdes em Chromium e Firefox;
- preview atualizada somente depois do gate verde.

## Registro de execução

A preencher.

## Decisão final

Pendente.
