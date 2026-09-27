# Manual dos conectores

## Evolução planejada — pacotes e preparação incremental

A [proposta v0 de contrato de pacotes](CONTRATO-PACOTES-LINGUISTICOS.md) delimita ASTRA 1/2, leitor de blocos injetado, consultas canceláveis, identidade/versões e primeira prova lexical. Ainda não é API implementada. O cofre abaixo permanece síncrono; I/O assíncrono fica em uma fronteira separada. Preparação nas pausas foi autorizada como direção, preservando análise completa explícita e acesso a todas as lentes.

## Usar o cofre em outro projeto

Gerar e copiar o arquivo único descrito em [packages/cofre/README.md](../packages/cofre/README.md). O pacote contém código e dados necessários às lentes atuais; não copiar index, editor, cadernos ou localStorage. Manter a versão do pacote e `knowledgeVersion` junto dos resultados persistidos. O teste `tests/cofre-portabilidade.cjs` demonstra esse transporte.

## Ligar ao editor do Escrevaral

A integração existente é `src/editor/contrato-analise.js`:

1. Capturar a folha e a revisão com `E.analysisContract.request(doc, text, start, end)`. O recorte usa offsets UTF-16 e a string original completa.
2. Examinar apenas a lente escolhida com `E.analysisContract.analyze(vault, lensId, request)`.
3. Antes de apresentar ou reutilizar o resultado, conferir `E.analysisContract.current(request, doc, text)`.
4. Invalidar resultados em edição, composição IME ou troca de folha. A interface atual trata essas transições; um hospedeiro novo precisa implementá-las.
5. Mostrar trechos literais, explicações, limites e fonte. Localizar ou copiar é permitido; aplicar mudanças ao manuscrito não é.

A análise acrescenta `schema: scrvrl.analysis-result`, `version: 1`, origem, versão do motor e versões dos dados. Desloca ocorrências, apoios e componentes do recorte para posições no original. Não reutilizar resultados de outra revisão só porque trechos coincidem.

## Adicionar uma lente síncrona

Registrar um `id` único e um `analyze(text, limit)` no cofre. A função retorna achados com todos os campos exigidos pelo registro, preservando o texto original. Usar exemplos próprios, positivos, negativos, ambiguidade e abstenção. Definir política/limite explicitamente antes de integrar a lente ao catálogo da interface.

Não importar referências a `document`, localStorage, editor ou rede na camada pura. A função não deve corrigir nem normalizar a string recebida. Pode usar uma cópia normalizada internamente somente com mapeamento comprovado de volta aos offsets originais.

## Integrar outro motor

Não basta envolver uma API num botão. A ficha de cada conector precisa registrar:

| Item | Exigência |
| --- | --- |
| Origem | Repositório, commit, arquivos, hashes e atualização deliberada |
| Variedade | Evidência de dados/modelo brasileiros; runtime multilíngue não equivale a modelo exclusivamente PT-BR |
| Licença | Código, pesos e dados separadamente; preservar atribuição |
| Entrada | Texto original, tokenização, codificação e escopo; documentar contrações e Unicode |
| Saída | Esquema versionado, offsets UTF-16, texto literal, cobertura e abstenções |
| Execução | Ambiente, memória, tamanho, latência, interrupção e erros recuperáveis |
| Privacidade | Nenhum envio de manuscrito ou modelo remoto ativado silenciosamente |
| Interface | Uma escolha, uma análise; revisão conferida antes de exibir; nunca alterar o manuscrito |

Um motor assíncrono deverá receber um identificador de solicitação e uma cópia imutável de origem/revisão, além de sinal de cancelamento. O consumidor deve ignorar respostas canceladas ou antigas mesmo quando o motor não conseguir interromper o cálculo. Esse protocolo assíncrono ainda não está integrado ao cofre síncrono.

## Portparser: fronteira já preparada

`packages/connectors/portparser/import-conllu.cjs` recebe **texto original e saída CoNLL-U pronta**, ambos locais. Produz `scrvrl.ud-evaluation` v1 com tokens, cabeças UD e posições literais. Não chama Python, não baixa pesos e não instala uma lente.

O adaptador é deliberadamente restrito: exige dez colunas, IDs sequenciais, cabeça válida, raiz única e ausência de ciclos; alinha tokens na sequência exata. Contrações com multiword tokens, nós vazios, tokens divergentes e cobertura incompleta produzem `sem-cobertura`. Não há busca aproximada de palavras nem conversão automática de UD para análise sintática tradicional.

A próxima etapa precisa resolver alinhamento de contrações e distinguir rótulos computacionais da terminologia de Bechara/Cunha e Cintra antes de qualquer integração de produto.
