# Clareza do Produto — Oficina e Autoria desktop

Data: 25 de julho de 2026

## Objetivo

Transformar Ateliê e Autoria em jornadas domináveis no primeiro contato, sem remover, substituir ou simplificar destrutivamente nenhuma engine.

## Princípio

A ferramenta aparece quando o texto pede. A pessoa não precisa ler a oficina inteira para começar uma tarefa.

## Ateliê

Hierarquia proposta:

1. propósito: escolher o que o texto precisa agora;
2. três tarefas: revisar, abrir guia, planejar publicação;
3. bancada de ferramentas do texto ativo;
4. uma ferramenta ativa por vez;
5. acervos e materiais complementares sob demanda.

No desktop, a bancada terá navegação lateral e painel principal. Espelho de Voz, RimaLab, Vocabulário, Leituras e Treino continuam íntegros.

## Autoria

Jornada proposta:

1. **Registrar o processo** — impressão digital, métricas, sessão e assinatura;
2. **Guardar ou enviar** — exportação da prova e encaminhamento ao editor;
3. **Carimbar no tempo** — OpenTimestamps como etapa opcional que exige internet;
4. **Verificar autoria** — leitura de arquivo `.esc` recebida de outra pessoa;
5. **Entender e preservar** — privacidade, timeline e versões em apoio progressivo.

A primeira etapa permanece aberta. Etapas opcionais ficam recolhidas, mas nomeadas e acessíveis por teclado.

## Proteções

Não alterar:

- `proof-engine.js` ou `proof-controller.js`;
- dados de ritmo e sessões;
- formatos `.esc`, `.pacote.esc` ou `.ots`;
- exportação, envio, carimbo ou verificação;
- engines do Ateliê;
- IDs, `data-action`, inputs e contratos existentes;
- manuscritos, localStorage, rotas ou PWA.

## Critérios visuais

- uma tarefa principal reconhecível em até cinco segundos;
- no máximo um painel detalhado do Ateliê visível por vez;
- Autoria não deve parecer um mural contínuo;
- textos explicativos subordinados às ações;
- poucas caixas e bordas;
- largura editorial e espaço ativo;
- foco inequívoco sem contornos duplicados;
- Scriptorium com papel legível e contraste mínimo de 4,5:1.

## Critérios de merge

- capturas em 1280, 1366 e 1440 px, temas Alvorada e Scriptorium;
- percurso completo por teclado;
- ações das engines continuam funcionais;
- mobile preservado abaixo de 821 px;
- zero erro de console e overflow;
- integridade, Palavras, Mesa, editor, Acervo, Oficina e PWA verdes.

## Primeira auditoria

A primeira execução detectou que os nós de Autoria eram movidos antes da verificação da largura. A montagem foi corrigida para acontecer somente a partir de 821 px. O auditor também passou a selecionar explicitamente o resumo externo de cada etapa, sem confundi-lo com detalhes internos do conteúdo.
