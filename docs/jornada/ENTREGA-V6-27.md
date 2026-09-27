# v6-27 — painel com composição simples (C02)

- **Base:** main `046235c8a496d5104e1f3373191aec66f3fe91f9`, conferida pela API do GitHub em 27/09/2026.
- **Autorização:** execução e publicação autônomas ao receber “s”; referência de época, sem exigir testes visuais ou em aparelhos.
- **Objetivo:** remover Grid, Flexbox e gap da composição do painel de leitura, mantendo controles, seleção e vínculos.
- **Implementação:** colunas em tabela CSS com largura definida e empilhamento abaixo de 760 px; palavras e grupos em inline-block, com margens explícitas e rolagem horizontal. Etiquetas e explicações usam blocos e quebra de palavra tradicional. Estilos básicos inseridos pelo painel também foram simplificados.
- **Preservação:** mesmas classes, botões, ordem do DOM, atributos ARIA, callbacks e pontos relativos usados pelo SVG. A lógica dos motores, o texto, o armazenamento e o formato dos pacotes não mudaram. Cofre e versão do conhecimento mantidos.
- **Fontes:** código local do painel, renderizador, estilos e contrato de análise; nenhuma nova regra linguística ou leitura bibliográfica neste lote.
- **Verificação:** após regenerar a distribuição, `node tests/ptbr-visual.cjs` (DOM simulado: seleção, apoios, spans, cancelamento e manuscrito), `node tests/controles-static.cjs` (ES5, montagem e hashes), `npm run build:check` e `git diff --check` passaram. A primeira tentativa do teste de painel detectou a distribuição ainda não regenerada; passou após o build. Não foi executado teste visual ou em aparelhos.
- **Estados:** código implementado, verificado e integrado à montagem 6.27.0; publicação e conclusão do marco aguardam confirmação remota.
- **Limites:** verificações de DOM não medem geometria renderizada. Ajustes de aparência seguem o retorno do autor; isso não constitui gate nem homologação de dispositivos. Nenhum avanço de cobertura linguística é atribuído a este lote.
- **Publicação:** aguardando push, CI e GitHub Pages.
- **Reversão:** commit normal de reversão e distribuição regenerada; nenhuma migração de dados.
- **Próximo:** C03 — caminhos de acesso e recuperação offline sem depender de APIs posteriores à referência tecnológica.
