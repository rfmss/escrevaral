# Relações da oração — incremento local

26/09/2026 · P05/P09/P10 · main remota conferida em `1d649c2ca3f47db7570bdf1b3c20f6e075705535`.

## Resultado

A lente **Relações da oração** amplia a antiga apresentação de “Orações simples”. Mostra sujeito e seu núcleo, predicado e termos contidos, núcleo verbal ou verbo de ligação, objeto direto e circunstância. Conserva os casos delimitados de predicativo e destinatário de dar. Arcos só unem constituintes reconhecidos da mesma construção. Toda relação selecionada também aparece por escrito; selecionar ou localizar não altera o manuscrito.

O novo motor substitui a execução do recorte sintático anterior e acrescenta verificações de compatibilidade formal, ambiguidade e integridade das relações. Alguns casos antes aceitos passam a exigir abstenção: adjetivos após objeto, participial aberto, artigo incompatível, pronome/verbo incompatíveis. Ausência de análise não é diagnóstico de erro.

## Fontes, código e dados

- Estudo e confronto: `docs/jornada/ESTUDO-SINTAXE-1.md`.
- Critérios: `docs/jornada/regras-sintaxe-1.json`.
- Motor: `ptbr/relacoes-sintaticas.js`; exemplos próprios: `ptbr/corpus/sintaxe-1.json`.
- Apresentação: `ptbr/leitura-visual.js`, `ptbr/leitura-visual.css`, `ptbr/painel.js`.
- Ponte de seleção: desloca também spans de oração e núcleo; IDs de vínculo pertencem à resposta atual.
- `ptbr/ferramentas/sincronizar.cjs` incorpora os módulos, alinha os dois HTMLs e invalida o cache linguístico antigo. Assets/cache `v6-21`. Nenhum formato de manuscrito foi alterado.

As regras de linguagem usam sintaxe ES5, sem DOM no motor, rede, modelos remotos, novas dependências de produto ou mudança automática do texto. Fontes bibliográficas apoiam conceitos; as heurísticas são locais, não algoritmos atribuídos aos livros.

## Evidência

- `tests/ptbr-sintaxe.cjs`: 78 casos de desenvolvimento/regressão, mais checagens de UTF-16, NFD, seleção, nós repetidos, contenção, vínculos não órfãos, regiões protegidas e cortes. Passou.
- `tests/ptbr-visual.cjs`: relações do motor real na apresentação e no painel com DOM simulado; seleção de objeto, localização exata, manuscrito idêntico e descarte ao editar. Passou.
- `tests/ptbr-contexto.cjs`: 63 casos anteriores passaram. `tests/ptbr-lentes.cjs`: 29 casos anteriores passaram.
- `tests/controles-static.cjs`: 44 scripts ES5, versões e portátil sincronizados. `tests/linguistica-linhagem.cjs`: persistência e linhagem passaram.
- Motor isolado em Node deste ambiente, sete execuções por tamanho: mediana de aproximadamente 3,1 ms para entrada de 8.000 caracteres e 3,2 ms para 200.000, limitada ao recorte. Não mede renderização, avaliação preliminar do cofre, navegador ou aparelho antigo.

O limite de saída preserva construções inteiras, mesmo quando isso resulta em menos de 100 apontamentos. Os limites internos não significam que todo o aplicativo processe somente 8.000 caracteres: a avaliação preliminar do cofre e a escrita têm seus próprios custos.

## Lacunas e estados

Estudado: seções delimitadas de B09/B16. Implementado e integrado nos HTMLs locais: sim. Testado: lógica e DOM simulado. Avaliação linguística independente: não. Navegador, geometria dos arcos, temas, teclado, zoom, aparelhos e funcionamento offline deste incremento: pendentes.

O ambiente já falhou ao iniciar Chromium com `socket() failed: Operation not permitted`; não se repetiu a tentativa sem mudança de ambiente. `tests/ptbr-browser.cjs` contém os novos passos de sintaxe e capturas em 1366/390/320 para execução em navegador funcional. Nenhuma captura antiga foi apresentada como validação nova.

Não houve commit, push ou publicação. O trabalho anterior em main foi preservado. Próxima ação de publicação: executar o QA visual preparado, resolver eventuais falhas e conferir a base remota antes de publicar. Próxima unidade de estudo: locuções e fronteiras, conforme o registro de estudo.

Reversão delimitada: remover o despacho para `E.syntaxRelations`, o módulo de relações e o ramo visual de sintaxe, regenerando os HTMLs. Preservar a morfologia contextual, a apresentação anterior e a jornada; não restaurar um HTML antigo inteiro.
