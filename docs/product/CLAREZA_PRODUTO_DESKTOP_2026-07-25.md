# Clareza do Produto — desktop first

Data: 2026-07-25
Branch: `clarity/desktop-shell-editor`

## Tese

O Escrevaral já é robusto por dentro, mas a apresentação ainda revela o crescimento por acumulação. A fase de Clareza do Produto não remove profundidade: organiza a profundidade para que a pessoa domine a interface antes de precisar estudá-la.

O resultado deve unir:

- previsibilidade de um processador de texto;
- calma espacial e material da direção Argila;
- engines brasileiras, locais e autorais;
- continuidade de manuscritos, formatos, exportadores e PWA.

## Contrato de navegação

A leitura primária deve ser imediata:

1. **Escrever** — criar e continuar o manuscrito;
2. **Acervo** — encontrar, organizar e exportar textos;
3. **Oficina** — acessar Palavras, Ateliê, Autoria e Plano.

Utilidades globais não competem com esses destinos.

## Mapa de densidade atual

### Shell

- marca, navegação e oito utilidades disputam a mesma faixa;
- utilidades possuem pesos semelhantes apesar de frequências diferentes;
- controles laterais parecem elementos soltos.

### Editor

- controles de contexto, formatação, título e folha aparecem como quatro faixas desconectadas;
- título vem depois da barra de ferramentas;
- bordas de foco se somam às bordas dos campos e criam contornos múltiplos;
- a folha recebe espaço, mas não uma hierarquia estável;
- comandos editoriais avançados ainda parecem próximos demais dos gestos básicos.

### Acervo

- cabeçalho, busca, filtros, retomada, lista e inspector aparecem quase simultaneamente;
- a seleção ativa e o próximo gesto poderiam ser mais inequívocos.

### Oficina e Autoria

- o conteúdo é valioso, mas aparece como mural contínuo;
- explicações, ações e evidências competem pelo mesmo peso.

## Hierarquia proposta

### Sempre visível

- Escrever, Acervo e Oficina;
- título do manuscrito;
- Negrito, Itálico e tipo de bloco;
- estado de salvamento e contagem;
- acesso a Mais;
- acesso ao guia quando há contexto.

### Contextual ou secundário

- alinhamentos;
- formato de página;
- classes gramaticais;
- quebra, impressão e exportações;
- som, compartilhamento, tema e tela cheia;
- explicações longas de autoria e publicação.

Nenhuma função fica órfã; muda apenas o peso e o momento de aparição.

## Blocos de execução

### Bloco 1 — shell e editor desktop

- compactar utilidades globais sem removê-las;
- transformar o cabeçalho do manuscrito em uma sequência estável;
- aproximar título, contexto e toolbar;
- reduzir bordas durante a digitação;
- manter foco por teclado inequívoco;
- limitar a largura de leitura;
- preservar modos fluxo, página e livro.

### Bloco 2 — Acervo desktop

- ordenar cabeçalho, busca, filtros, retomada, lista e inspector;
- reduzir repetição entre lista e inspector;
- deixar seleção e ação primária inequívocas.

### Bloco 3 — Oficina e Autoria

- consolidar uma gramática comum;
- transformar páginas longas em jornadas;
- aproximar ferramentas do manuscrito ativo.

### Bloco 4 — acabamento e candidata

- diálogos, estados vazios e erros;
- contraste, foco, tipografia e espaçamento;
- regressão, offline, privacidade e documentação.

## Proteções

Não alterar sem falha reproduzida:

- engines;
- esquema de `localStorage`;
- formatos `.esc`;
- exportadores;
- rotas públicas;
- sincronização entre abas;
- recuperação e backup;
- service worker além da versão de distribuição.

## Aprovação do Bloco 1

Critérios exigidos:

- a folha é protagonista em 1280, 1366 e 1440 px;
- título, ferramentas e texto formam uma sequência legível;
- não há borda dupla ou tripla na digitação por ponteiro;
- foco por teclado permanece claramente visível;
- engines e ações existentes permanecem acessíveis;
- console, overflow, integridade, entrada, Palavras, Oficina e Mesa móvel permanecem verdes;
- capturas e relatórios são preservados.

### Veredito

Aprovado em 25 de julho de 2026.

A rodada final passou em dez frentes independentes:

- coerência de versões;
- integridade de dados;
- entrada Argila;
- navegação Oficina;
- situação do editor;
- Palavras;
- Mesa no celular;
- foco e regressão;
- candidata consolidada;
- auditoria específica da Clareza desktop.

Cenários visuais aprovados:

- 1280 × 800;
- 1366 × 900;
- 1440 × 900;
- 1440 × 900 no Scriptorium.

O menu Ambiente preserva compartilhamento, tema, foco e tela cheia; a abertura por teclado leva o foco à primeira opção e `Escape` o devolve ao gatilho.

O Scriptorium mantém ambiente escuro, folha clara e tinta grafite. O contraste computado de título e manuscrito sobre o papel é **12,89:1**.

Nenhuma engine, chave de armazenamento, estrutura de manuscrito, formato `.esc`, exportador ou rota foi alterado.

## Norte do Bloco 2

O Acervo desktop deve ser lido nesta ordem:

1. identidade e ação de criar;
2. busca e ordenação;
3. filtros secundários;
4. retomada imediata;
5. lista ou grade principal;
6. inspector da seleção ativa;
7. backup e exportações sob demanda.

A intervenção não removerá filtros, inspector, exportadores ou dados. Ela reduzirá competição visual, repetição e truncamento.
