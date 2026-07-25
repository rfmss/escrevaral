# Rota de lançamento Argila — 25 de julho de 2026

## Decisão

O protótipo visual produzido no Canva passa a ser a referência canônica de atmosfera, proporção, cor, tipografia e ritmo do Escrevaral.

O código do Canva não será copiado para produção. O produto real preservará a arquitetura local-first, as engines, os formatos, a prova de autoria, o Acervo, a Mesa no celular e a recuperação de dados.

A fórmula de produto é:

> previsibilidade editorial de um processador de texto + calma espacial do protótipo + profundidade brasileira do Escrevaral.

## Condição de início

A estabilização estrutural está suficientemente madura para iniciar a migração visual:

- manuscritos protegidos;
- recuperação de armazenamento;
- integridade entre abas;
- funcionamento sem internet;
- foco por teclado;
- golden das engines;
- console e overflow cobertos;
- editor silencioso, Palavras, Mesa no celular e Acervo validados.

## Método

A migração será feita em uma branch de lançamento, por cortes verticais que possam ser julgados visualmente e revertidos individualmente.

Cada corte deve:

1. preservar engines, dados, persistência e formatos;
2. produzir captura em desktop e celular;
3. passar golden, integridade, console, overflow e foco;
4. atualizar versão global e cache quando distribuir CSS ou JavaScript;
5. terminar antes de abrir a etapa seguinte.

## Etapas

### A. Constituição visual e fundação

Entregas:

- documento de marca Argila;
- paleta canônica;
- tipografia canônica;
- escala de espaço;
- linguagem de borda, sombra, foco e movimento;
- remoção visual de aquarela, vidro e madeira do caminho principal;
- topbar e navegação na nova gramática.

Critério de saída:

- o aplicativo parece pertencer à mesma família visual do protótipo sem perder função;
- não há regressão em temas, teclado, mobile ou offline.

### B. Entrada e retomada

Entregas:

- primeira entrada silenciosa;
- slogan “Antes que as palavras sequem.”;
- ação principal evidente;
- retorno ao manuscrito recente;
- segurança local explicada sem parede de texto;
- nenhum estado simultâneo concorrente.

Critério de saída:

- nova pessoa entende o produto e começa a escrever sem explicação externa;
- pessoa recorrente volta ao texto em um gesto.

### C. Editor Word-like Escrevaral

Entregas:

- folha e medida editorial;
- toolbar previsível;
- título, foco, revisão e salvamento organizados;
- contagem e salvamento imediatos;
- meta e temporizador secundários;
- engines sob demanda;
- modo página/livro sem quebrar construção do arquivo.

Critério de saída:

- escrita recebe mais atenção que a interface;
- a pessoa reconhece padrões de editor sem confundir o Escrevaral com um clone do Word.

### D. Acervo editorial

Entregas:

- busca e filtros discretos;
- lista editorial;
- inspector da nota ativa;
- cópias e exportação em segundo nível;
- vazios orientadores;
- mobile sem sobreposição.

Critério de saída:

- localizar, abrir, organizar e exportar são compreensíveis sem aparência de dashboard.

### E. Oficina

Entregas:

- Palavras, Ateliê, Autoria e Plano sob uma hierarquia por tarefa;
- redução da competição na navegação principal;
- engines e guias preservados;
- caminhos de retorno ao manuscrito.

Critério de saída:

- profundidade não parece acúmulo de features;
- nenhuma função fica órfã.

### F. Fechamento e lançamento

Entregas:

- auditoria completa de rotas e estados;
- fontes e recursos críticos otimizados;
- revisão de textos e metadados públicos;
- documentação final de marca e manutenção;
- remoção de CSS transitório comprovadamente não utilizado;
- registro de limitações conhecidas;
- versão de lançamento.

Critério de saída:

- todas as rotas passam;
- zero regressão de manuscrito;
- funcionamento real offline;
- capturas coerentes em 390, 768 e 1440 px;
- teclado, foco, contraste e redução de movimento aprovados;
- produto pronto para ser apresentado sem pedir desculpas pelo visual.

## O que não fazer

- reescrever o aplicativo;
- substituir JavaScript vanilla por framework;
- copiar Tailwind, SDKs ou dados de demonstração do Canva;
- adicionar nuvem, conta ou IA externa;
- esconder recursos sem caminho equivalente;
- manter temas múltiplos como desculpa para não decidir um tema principal;
- usar neurociência como marketing sem evidência;
- abrir várias frentes visuais simultaneamente.

## Estado atual

- PR 96 foi encerrado sem merge: a faixa móvel comprimida foi rejeitada pelas evidências.
- A branch `refactor/brand-argila-launch` é a frente canônica da migração.
- Primeiro corte em execução: constituição visual, tokens, tipografia, topbar e navegação.