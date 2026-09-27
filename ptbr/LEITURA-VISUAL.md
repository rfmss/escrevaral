# Leitura anotada com a identidade do Escrevaral

26/09/2026 · P09/P10 · Base remota conferida: `1d649c2ca3f47db7570bdf1b3c20f6e075705535`, main.

Referência: imagem e `editor_mockup.html` enviados pelo autor. Adaptação autorizada à roupa existente: papel verde, fontes locais, bordas pontilhadas e etiquetas discretas. A referência é visual; suas análises e números fixos não foram importados como resultados do motor.

## Implementação local

- Cortina ampliada com leitura à esquerda e explicação selecionada à direita. CSS empilha as áreas em telas estreitas; trechos longos têm rolagem própria.
- Classes de palavras apresenta cada ocorrência com etiqueta e estado. Possibilidades lexicais têm borda tracejada e rótulo explícito; desconhecidas mostram “sem leitura”.
- Selecionar palavra mostra sua evidência, ambiguidade, fonte e limites. Arcos pontilhados ligam somente os apoios emitidos pelo motor para aquela hipótese. Não afirmam dependências sintáticas completas.
- Outras lentes apresentam seus próprios trechos selecionáveis. Nenhum motor adicional é acionado para preencher o visual.
- Texto de leitura é construído com `textContent`, sem HTML do manuscrito. Posições são validadas antes da apresentação.
- As escolhas persistidas são respeitadas. Localizar apenas seleciona o original. Edição, IME, fechamento e troca de lente descartam a visualização e seus callbacks/listeners.
- O botão de entrada continua Examinar. Uma lente por escolha. Cache portátil sincronizado em `v6-20`; formatos de manuscrito preservados.

## Verificação

`tests/ptbr-visual.cjs`: motor real com DOM simulado; ocorrências repetidas, leitura correta por posição, arcos só com apoios, desconhecimento sem arcos, invalidação, descarte de listeners, spans inválidos e conteúdo literal. Passou.

`ptbr/teste-painel.js`, agora carregando a apresentação: passou. `tests/ptbr-contexto.cjs`: 63 regressões passaram. `tests/controles-static.cjs`: 43 scripts ES5, portátil e versões de cache passaram.

`tests/ptbr-browser.cjs` inclui seleção visual, arcos e capturas em 1366/390/320. A tentativa de iniciar Chromium voltou a falhar em `socket() failed: Operation not permitted`, antes da abertura do aplicativo. Geometria, contraste efetivo, foco em navegador, aparelhos e offline real permanecem sem validação deste incremento. Não há captura nova certificada.

Estudado: referência visual e contrato. Implementado/integrado localmente: sim. Testado: motor, DOM simulado, sintaxe e sincronização. Validado visualmente em navegador: não. Commit/publicação: não realizados.

Próxima ação: executar o QA preparado em navegador funcional e conferir temas claro/escuro, zoom, teclado, arcos e offline antes de publicar. Reversão: retirar somente o patch visual e regenerar os HTMLs, preservando o motor contextual e as alterações anteriores da jornada.
