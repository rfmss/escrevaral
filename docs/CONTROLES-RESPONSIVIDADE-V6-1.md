# Controles e responsividade — v6.1

Base: main 0dde2e981d4911d3f943ad26086363b5d57e0441.
Meta: 20260914-scrvrl-controles-v6-1.
Escopo aprovado: Início, confirmações com identidade Escrevaral e revisão de responsividade, incluindo pausa encerrada.

## Alterações

- Início: tecla sálvia no claro e carvão no escuro, superfície iluminada, lateral e deslocamento curto ao pressionar. Regras específicas substituem o acabamento antigo que prevalecia na cascata. Sem biblioteca, WebGL ou cena 3D.
- Confirmação única do aplicativo: título, marca, mensagem e ações explícitas em português. Aplicada a mover caderno, importar, descartar formulário, excluir ficha e excluir definitivamente uma folha. Cancela com Escape; foco inicial em Cancelar; Tab circula nas ações e o foco retorna ao contexto anterior. As operações só ocorrem depois da confirmação.
- As cinco chamadas nativas de confirmação foram convertidas em continuações ES5. Não se sobrescreve window.confirm com uma função assíncrona: isso mudaria o significado dos retornos e poderia executar ações antes da escolha.
- Exceções controladas pelo navegador: impressão, escolha de arquivos e proteção contra fechar a aba quando há escrita não guardada. Não são superfícies que o CSS do site possa vestir.
- Painéis usam a altura visível descontando as barras reais. Pausa encerrada recebe relógio menor e formulário com quebra de linha; reabrir retorna ao topo. Janelas baixas mantêm rolagem interna e acesso aos controles. Barras de rolagem dos painéis deixam de ser invisíveis.
- Rodapé: limites para nomes e tarefas longas em telas estreitas.
- A cópia baixável escrevaral.html ainda estava na v5. Agora corresponde ao index.html completo; a mesma interface acompanha o arquivo offline. Nenhuma migração de dados nova.
- Service worker recebe versão/cache v6.1.

## Validação e limites

Validação concluída no [GitHub Actions, execução 34908613318](https://github.com/rfmss/escrevaral/actions/runs/34908613318), sobre o código do commit `7c78faa5`. Todos os passos passaram:

Testes executados:
- análise ES5 com Acorn, igualdade do HTML portátil e versão do cache;
- fluxos existentes de cadernos/universo, atualizados para clicar nas confirmações reais;
- cancelar/confirmar, foco, teclado/toque, importação com quota e estado pronto do Pomodoro;
- dimensões 1366×650, 820×600, 390×844, 320×568, 667×375, 683×325 e 320×260;
- claro/escuro, mensagens longas, geometria dos painéis e colisões no rodapé;
- execução Chromium e WebKit, com capturas em artefato do GitHub Actions.

As capturas reais do Chromium foram inspecionadas: Início, confirmação clara, confirmação escura em 390×844 e pausa encerrada em 1366×650 e 320×568. Relógio visível, ações acessíveis e mensagens longas com quebra de linha. Em janelas baixas o conteúdo usa rolagem, sem exigir que relógio e formulário caibam simultaneamente. A execução revelou e corrigiu também o atalho da pausa ativa que era escondido no rodapé móvel. O Chromium local falhou ao iniciar; os testes de navegador foram executados com sucesso no GitHub Actions. Viewports pequenos não comprovam teclado virtual real nem zoom do navegador; WebKit atual não comprova Safari no iPad de 2012. Essas verificações continuam pendentes e não se declara responsividade universal.

## Continuidade

A auditoria v6 anterior registrava a etapa anterior à autorização de publicação; depois foi autorizada e publicada pelo PR 173. Este documento registra a correção posterior, solicitada a partir dos prints do usuário. Entrega pelo PR 174. A revisão das contribuições do AI Studio está em `REVISAO-AI-STUDIO-2026-09-14.md`.
