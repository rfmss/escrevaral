# SCRVRL OS — contrato do Estúdio e sequência aprovada

Decisão aprovada por Rafa em 12/09/2026: o OS acolhe, a Mesa escreve e o Estúdio organiza a obra; todos acessam o mesmo manuscrito. Este documento consolida o board aprovado e as adições subsequentes. A Constituição permanece inalterada.

## Mapa do produto

- Área de trabalho: projetos, arquivos e lembretes. Aplicativos no menu Início, sempre disponível, inclusive na escrita e no foco.
- Projetos: reúnem folhas, capítulos e cenas. Datas de criação não determinam a ordem narrativa.
- Mesa: único editor do texto original. Retoma seleção e rolagem; mantém a oficina sob demanda.
- Estúdio: Pesquisa (personagens, lugares, facções e documentos), Quadro (arcos e cronologia), Varal (as mesmas cenas em outra disposição), Manuscrito (leitura reunida) e Revisão (resultados das engines e notas do autor).
- Leitura e saída: abrir o original na Mesa para editar; impressão limpa; Anatomia do Livro como guia. Exportações editoriais avançadas exigem implementação real e validação própria.
- Acervo: busca, datas, lixeira, restauração e cópia completa. Autoria/custódia é subsistema futuro, não inferência a partir do histórico local.

O ZIP do Estúdio é referência de organização. React 19, dependências modernas, fotos remotas, métricas estáticas, julgamentos editoriais simulados e exportações por temporizador não entram no runtime. Tensão dramática, intenção e presença de personagens são informações fornecidas pelo autor. Miniaturas geométricas opcionais serão estáticas e terão semente persistente, sem envio de dados.

## Contratos e identidades

### Documento existente, preservado

`noteId` identifica a folha; `id` identifica o registro físico de uma gravação. `revision` cresce; `created` permanece fixo; `updated` é a gravação. `project` ainda é um rótulo de agrupamento, não um identificador estável de projeto.

Nesta etapa acrescentam-se dois campos opcionais e retrocompatíveis: `kind: "reminder"` para lembrete e `trashed: boolean` para lixeira. Registros antigos sem esses campos continuam válidos. Gravação usa chave nova antes de retirar a anterior; quota e concorrência preservam a antecessora. `list()` retorna folhas ativas, `list(true)` inclui lembretes e lixeira. Backup/importação carregam os campos novos; a importação continua aditiva e cria novas identidades, sem sobrescrever o original.

`purge(record)` exige uma gravação ainda existente, na lixeira, com a revisão esperada. A interface exige confirmação explícita, apresenta o título e foca Cancelar. A exclusão afeta essa cópia no aparelho; exportações antigas e versões em outras abas não são apagadas.

### Análise: contrato executável v1

`analysisContract.request(document, text, start?, end?)` captura o texto e seu recorte. `analyze(vault, lens, request)` devolve o resultado existente acrescido de `schema`, `version`, `source`, `engineVersion` e `dataVersions`.

`source` contém `documentId`, `recordId`, `revision`, `projectLabel`, `start`, `end` e `draft`. Posições são UTF-16 no original, inclusive as ocorrências múltiplas e limites de contexto. `current(request, document, text)` exige identidade, revisão e igualdade exata da captura; não é hash nem prova de autoria. A captura é transitória e não é gravada como uma segunda obra. Alteração do texto invalida a apresentação anterior.

### Projeto/Estúdio: contrato definido, migração ainda não ativada

- Projeto: ID independente do nome, título, ordem de IDs de documentos e versão do esquema.
- Cena: ID, projeto, referência ao documento original, resumo opcional, arcos, personagens, lugar e tensão anotada pelo autor.
- Ficha de pesquisa: ID, projeto, tipo, título, texto e vínculos explícitos com cenas/fichas.
- Quadro e Varal: projeções dos mesmos registros, nunca cópias editáveis separadas.
- Resultado derivado: referência ao documento/revisão e método. Agregados ignoram resultados desatualizados; não concatenam percentuais nem duplicam contagens de uma cena vista em duas áreas.
- Pacote futuro: versão do esquema, projetos, documentos, fichas, vínculos e ordem. Validar referências antes da gravação, remapear IDs na importação aditiva, preservar uma cópia anterior e recusar versões desconhecidas sem sobrescrever.

O `projectLabel` atual NÃO deve ser promovido silenciosamente a ID. A migração e a nova exportação são a próxima etapa de persistência, antes de ativar vínculos no Estúdio. `.scrvrl` continua pendente de um contrato de interoperabilidade; renomear JSON não constitui implementação completa.

## Sete famílias, quinze lentes nesta etapa

1. Fonética/métrica: rima gráfica e escansão estimada existentes. Pronúncia revisada e rimas toantes ainda pendentes.
2. Estilo: expressões, repetição próxima e formas em -mente. A nova lente consulta 50 grafias explícitas; não classifica todo sufixo, nem recomenda cortes. Base declarada artesanal, com revisão independente pendente.
3. Ritmo: medidas de extensão existentes e nova proporção de palavras em linhas iniciadas por travessão. Linhas com regiões protegidas são excluídas inteiras. A métrica informa numerador, denominador, linhas e exclusões. O restante não é declarado narração; não estima tensão ou qualidade.
4. Léxico: família reservada para consulta por sentido/registro; não há nova lente de sinônimos ativa nesta etapa.
5. Convenções: ortografia, acentuação e pontuação.
6. Morfossintaxe: classes, orações simples, crase e concordância delimitadas.
7. Contextos: observações decoloniais.

As sete famílias organizam o desenvolvimento; não obrigam sete novas telas nem substituem os quatro grupos visuais atuais. Cada análise segue pedido explícito, uma lente por vez, teto de 200 mil unidades UTF-16 e 100 achados. O cofre mantém seu contrato e continua sem regras de DOM. Consulta de livro inteiro em lotes, com cancelamento e agregação por revisão, permanece pendente.

## Orientação, sessão e cópia

- Caminho clicável acima de todas as áreas. O item atual tem contraste próprio. Início e tarefas ficam abaixo; ambos permanecem no modo foco por pedido posterior explícito de Rafa. Impressão oculta todo o sistema.
- Menu Início contém apps; desktop contém arquivos/projetos e lembretes. Lembretes usam a mesma infraestrutura de gravação e backup, com texto puro.
- Sessão v1: área, documento, seleção, rolagem, painel, buscas, data navegada e estado da janela. Grava após pausa e eventos de saída; sem garantia do intervalo anterior à gravação, sem escrita durante composição de acentos. Som não reinicia automaticamente. Estado inválido cai no gabinete sem alterar o acervo.
- Seleção concluída copia para memória interna e diz “Copiado no Escrevaral”. Recortar, colar internamente e analisar trecho preservam posições no original. Copiar para outro app é ação separada, com `execCommand` quando disponível e alternativa de cópia nativa. Nenhuma promessa de cópia externa quando o navegador recusou.
- A restrição de colagem externa é opcional em Ajustes e impede o evento paste; a cópia interna tem comando próprio. Não pretende identificar origem humana ou detectar IA. Importação explícita de arquivo permanece disponível.
- Sublinhado persistente, formatação inline, quarentena com proveniência e prova de autoria NÃO estão implementados. Exigem modelo próprio de anotações e evidências; não simular.

## Critérios do documento recebidos com adaptação

Referências: Estúdio Literário ZIP; Documento de Arquitetura e Decisões de Design(1)(2).docx; arquivos e-ink index/script/styles/README. O documento pede cópia interna, não garante acesso automático ao clipboard do sistema. Falas sobre certificação de humanidade, custo zero, compatibilidade universal ou transferência Wi-Fi/Bluetooth automática são intenções, não propriedades comprovadas. O layout de referência tem largura mínima de 1120px e fontes remotas; aproveitamos a direção visual, não essas dependências. Cópia externa restrita é opção explícita, preservando uso corrente e controle do autor.

## Próximas entregas, sem reabrir aprovação

1. Publicar esta fundação: orientação, Início, lembretes, lixeira, retomada, seleção/cópia e duas lentes novas com contrato de origem.
2. Persistir projetos com IDs e migrar com backup integral; estender o contrato às fichas/cenas.
3. Conectar um projeto real ao Varal → Mesa → Revisão, sem duplicar texto.
4. Expandir Pesquisa/Quadro/Leitura; amadurecer léxico, fonética e contexto com corpus revisado.
5. Validar no iPad a preservação, composição de acentos, seleção e custo dos módulos. Bateria de lógica não atesta aparência ou execução física.

Prova de autoria, EPUB/DOCX/PDF gráfico, máquina antiga e cursores mágicos permanecem em etapas posteriores. Nada nesta lista exige nova aprovação para o escopo já autorizado; apenas evidência suficiente antes de declarar pronto.
