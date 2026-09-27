# Locuções verbais — incremento local

26/09/2026 · P05/P09/P10 · main remota conferida em `1d649c2ca3f47db7570bdf1b3c20f6e075705535`. Sem commit/push/publicação.

Estudo: `docs/jornada/ESTUDO-LOCUCOES-1.md`. Avaliação do material adicional do autor: `ptbr/auditoria/GEMINI-SET26.md`.

## Alterações

- `grupos-verbais.js`: formas explícitas de 19 lemas e quatro padrões de grupo verbal.
- `relacoes-sintaticas.js`: auxiliar e principal alimentam a análise de uma construção; preserva o predicado completo, complementos, vínculos e abstenções.
- `leitura-visual.js`: cartão da locução identifica os componentes. As explicações e a seleção continuam usando trechos literais.
- Ponte de seleção: desloca spans de componentes junto com achados, núcleo e oração.
- Sincronização: dois HTMLs idênticos; dados `sintaxe-2`, assets/cache `v6-22`. Formatos de manuscrito intactos, nenhuma dependência nova no produto.

## Verificação

`tests/ptbr-locucoes.cjs`: 65 casos mais verificações técnicas, aprovado. `tests/ptbr-sintaxe.cjs`: 78 casos aprovados, com uma expectativa atualizada pela nova cobertura. `tests/ptbr-contexto.cjs`: 63 casos aprovados. `tests/ptbr-visual.cjs`: painel real com DOM simulado, componentes, explicação, seleção de “estou lendo”, texto intacto e comportamento anterior aprovados. `tests/controles-static.cjs`: 45 scripts ES5, portátil e cache sincronizados.

O teste de navegador foi ampliado para selecionar a locução por teclado e conferir seus componentes. Ainda não executado neste ambiente: permanece a falha conhecida de inicialização do Chromium. Não repetir tentativas sem mudança de ambiente; não usar screenshots anteriores como evidência nova.

## Limites e continuidade

Sem avaliação linguística independente, passiva, cadeias de auxiliares, modais, sujeito elíptico ou análise geral de subordinação. Não deduz voz passiva de duas formas verbais; não cria sujeito substituto para desconhecidos. Silêncio da lente não significa erro.

Estudado/implementado/testado em simulação/integrado localmente: sim, no recorte documentado. Navegador/aparelhos/offline real/publicação: pendentes. Próxima ação de publicação: executar QA em navegador funcional. Próxima unidade linguística: antecedente e oração relativa.

Reversão: retirar o módulo de grupos e o ramo correspondente do parser, preservando o incremento sintático anterior; restaurar a expectativa documentada do caso promovido, regenerar HTMLs e alinhar cache. Não restaurar o HTML completo de um backup.
