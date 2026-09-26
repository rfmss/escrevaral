# Lentes de português — etapa 1

Base: `rfmss/escrevaral`, `main`, `9d167407962300d82393dee3262c3dbb32cc994f`.
As mudanças desta entrega estão locais. Não foram enviadas ao GitHub nem publicadas.

## Decisão de escopo

1. Estabilizar e comprovar as lentes que já existem na main.
2. Decidir posteriormente sobre o pacote PTBR completo, após revisão de licença, dados, compatibilidade e custo.

O catálogo da base já contém 1.447 expressões. Esta etapa acrescenta apenas a entrada editorial `de vez em quando`; não importa os inventários do pacote recebido. Não há novo motor de sinônimos ou morfologia.

## Regras observáveis

| Lente | Critério | Limites |
| --- | --- | --- |
| Expressões | Palavras contíguas do catálogo; vence a correspondência mais longa | Espaço, tabulação e espaço inseparável são aceitos. Pontuação, quebras de linha e regiões protegidas interrompem. Máximo de 16 palavras por expressão. |
| Repetição adjacente | Duas palavras iguais, de pelo menos duas letras | Sem números; apenas espaço/tabulação entre elas. Inclui palavras funcionais, como `muito muito`. |
| Retorno X que X | Mesma palavra antes e depois de `que` | X tem pelo menos quatro letras e não pertence à lista de palavras funcionais. Não admite pontuação. Não é análise sintática. |
| Repetição próxima | Três ocorrências da mesma palavra numa janela de 40 tokens | Pelo menos quatro letras, sem números ou palavras funcionais. Citações e parágrafos interrompem a janela. |

A normalização ignora maiúsculas e compõe acentos equivalentes; não remove acentos nem reúne flexões. As posições são índices UTF-16 no texto original, inclusive com acentos decompostos. Um apontamento por palavra a cada 40 tokens evita repetir avisos sobre a mesma sequência. Repetição intencional também pode ser observada: confiança alta significa contagem confirmada, não erro de escrita.

As lentes compartilham `regras-locais.js` com a triagem. `expressoes.js` e `repeticao.js` produzem apontamentos com evidência, fonte e limites; não alteram o manuscrito.

## Triagem, custo e autoria

- Pausa de 700 ms; composição IME suspende a triagem. Digitar não executa lentes completas.
- O texto é cortado **antes** da proteção e tokenização: no máximo 8.000 unidades UTF-16. O exame de sinais visita no máximo 1.600 tokens; proteção/tokenização e contagem ainda podem percorrer todo o recorte de 8.000 caracteres. A contagem inclui palavras citadas, embora elas não gerem sinais.
- Rimas usam índice de terminações, sem comparar todos os pares de linhas. A triagem não cria Findings nem mantém histórico de textos.
- A interface identifica contagem parcial. A roleta é uma sugestão conservadora: pode omitir sinais além do recorte. As lentes individuais continuam acessíveis.
- O botão Análise executa as lentes sinalizadas em série, sob comando. Aceita até 200 mil caracteres e apresenta até 100 apontamentos por lente. Esse limite **não comprova** que qualquer lente completa será rápida em dispositivo antigo.
- Edição, composição ou troca de folha invalida a fila e os resultados. A identidade usa `noteId`, preservado quando uma gravação cria nova revisão.
- `Manter minha escolha` utiliza o armazenamento e a chave de decisão existentes. O fluxo individual e o painel consultam as mesmas escolhas. Uma falha ao guardar não deve ocultar a observação.
- Aspas/código sem fechamento também são protegidos até o fim aplicável; isso impede que um corte da triagem transforme conteúdo citado em sinal.

## Fontes e sincronização

`node ptbr/ferramentas/sincronizar.cjs` atualiza somente os blocos linguísticos e as pontes pontuais do HTML existente, replica o HTML portátil e alinha as versões do cache. Não use uma cópia antiga do HTML para integrar esta entrega.

Os pontos compartilhados são: versão do corpus, proteção de trechos, expressão, repetição, inclusão dos módulos, ponte das escolhas/identidade, invalidação ao carregar folha, painel e versão de assets/cache. O patch precisa de revisão antes da integração; nada aqui autoriza publicação.

## Verificação reproduzível

Dependências exclusivas de QA: Node, `acorn@8.15.0`, `playwright@1.55.0` e navegadores/dependências do Playwright. O produto não depende desses pacotes.

```sh
node ptbr/teste-triagem.js
node ptbr/teste-painel.js
node tests/ptbr-lentes.cjs
node tests/controles-static.cjs
node tests/linguistica-linhagem.cjs
node tests/ptbr-browser.cjs
BROWSER_ENGINE=webkit node tests/ptbr-browser.cjs
# Gate PWA separado (falha conhecida também na base):
PTBR_PWA_WEBKIT=1 BROWSER_ENGINE=webkit node tests/ptbr-browser.cjs
node tests/primeiro-acesso-browser.cjs
node tests/orientacao-browser.cjs
```

- `auditoria/base-9d16740.json`: casos executados na base antes da correção.
- `auditoria/matriz-lentes.json`: positivos, negativos e posições nas lentes reais.
- `auditoria/pacote.json`: hashes, suites, falha deliberada do executor, análise ES5 e cobertura do pacote externo.
- `auditoria/verificacao.md`: resultados, estados e lacunas desta entrega.

## Pacote recebido: avaliação separada

```sh
node ptbr/ferramentas/auditar-pacote.cjs /caminho/PTBR > auditoria.json
```

O auditor não modifica o pacote. Executa os motores em subprocessos; aplica em memória uma correção do acumulador de falhas e injeta uma falha para verificar o código de saída. O retorno 1 do auditor significa bloqueio para integração, mesmo que as suites originais imprimam sucesso.

Os sete hashes conferem. O executor original retorna sucesso mesmo com uma falha injetada no corpus; o acumulador corrigido retorna 1. Acorn em ES5 rejeita `classes-morfologia.js`. O motor do pacote não cobre `de vez em quando` e junta indevidamente `No final. Das contas`. Hashes comprovam integridade, não licença nem qualidade linguística.

A etapa 2 precisa revisar a licença e origem de cada inventário, os efeitos sobre protótipos globais, APIs além de ES5, a qualidade das leituras morfológicas, carga sob demanda, HTML portátil e aparelhos antigos. Sinônimos e morfologia permanecem adiados.
