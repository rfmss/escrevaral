# Rota atual do produto — 25 de julho de 2026

## Norte

O Escrevaral deve ser a oficina literária brasileira de referência: uma mesa de escrita confiável, local, compreensível e silenciosa. O texto vem antes da interface; a pessoa que escreve vem antes da tecnologia.

Objetivos fixos:

- português brasileiro integral;
- escrita, leitura e organização local-first;
- funcionamento real sem internet depois do primeiro carregamento;
- proteção contra perda de manuscritos;
- nenhuma leitura externa do texto, conta obrigatória ou dependência de servidor;
- identidade de oficina brasileira, sem aparência de painel corporativo;
- acessibilidade por teclado e responsividade sem rolagem horizontal;
- mudanças pequenas, reversíveis e provadas por comportamento e captura.

## Estado verificado

### Concluído

- **Editor silencioso:** ferramentas editoriais aparecem sob demanda; escrita básica, copiar e baixar permanecem imediatos. Incorporado no commit `913a243`.
- **Mesa no celular:** destino persistente em `Mais` e em `Acervo > Cópias`; gravação confirmada antes da saída; aplicativo e Mesa Portátil recarregados com a rede desligada. Incorporado no commit `8c01b3f`.
- **Palavras:** título do módulo preservado, busca destravada depois de frase, estado inicial orientador e análise empilhada no celular. Incorporado no commit `c86e3de`.
- **Ateliê como hub:** a estrutura atual já possui as entradas `Revisar meu texto`, `Abrir um guia` e `Planejar publicação`. A recomendação antiga de criar essas três entradas está resolvida e não deve gerar novo redesenho amplo.
- **Navegação do onboarding:** já existem estados separados para primeira entrada e continuidade, além de isolamento por `inert`. Deve ser revalidada periodicamente, não reconstruída por lembrança de auditoria antiga.
- **Regressão técnica:** golden das engines, console, overflow mobile, foco, smoke e integridade de manuscritos estão cobertos por workflows ativos.

### Correção de entrega desta rota

Os arquivos alterados nas últimas fatias receberam o identificador global `20260725-palavras`, e o cache principal passou a `vereda-offline-v943`. Isso evita que navegador ou CDN mantenham `styles.css`, `ui-dialog.js` ou o controlador de Palavras em versões anteriores.

## O que a auditoria de 26 de junho não autoriza mais concluir

O relatório `reports/auditoria/produto-pilares-2026-06-26.md` continua útil como histórico, mas sua fila não deve ser executada automaticamente:

- `Mesa no celular` escondida: resolvido;
- Ateliê sem três entradas: resolvido;
- dois estados simultâneos no card principal: a correção existe e precisa de teste atual, não de nova implementação presumida;
- dock competindo com onboarding: a contenção por `inert` existe e precisa de teste atual;
- demais itens: devem ser reproduzidos no código e na interface atuais antes de qualquer edição.

## Próxima ordem de trabalho

### P1 — faixa de situação no celular

O código atual mantém um dock fixo de 60 px e também uma faixa de situação com contagem, meta, temporizador, salvamento e informações secundárias. Em telas pequenas, a regra existente apenas corta os textos. Antes de editar:

1. provar quais informações ficam visíveis, cobertas ou inalcançáveis em 320, 390 e 430 px;
2. preservar como essenciais a confirmação de salvamento e a contagem do texto;
3. garantir acesso a meta e temporizador sem criar uma segunda barra barulhenta;
4. remover do celular apenas o que for repetido ou institucional;
5. testar escrita longa, teclado virtual, banner de atualização e banner de cópia de segurança.

Nenhuma solução visual está pré-aprovada. O teste decide entre faixa mínima, integração à bandeja ou outra composição pequena.

### P1 — primeira entrada atual

Auditar 320, 390 e 1440 px com armazenamento vazio e com manuscrito existente:

- apenas um estado principal visível;
- foco preso ao diálogo;
- dock e restante do aplicativo fora da navegação por teclado;
- ação primária evidente;
- nenhum teclado virtual aberto sem intenção.

### P2 — páginas editoriais satélite

Reproduzir novamente o comportamento das abas em `vereda-biblioteca-escrita.html` no celular. A observação antiga sobre a aba `Sobre` não é prova atual. Só corrigir após captura e medição local de overflow.

### P2 — fluxos internos do Ateliê

Não redesenhar o hub. Validar cada entrada com e sem texto ativo:

- `Revisar` abre a ferramenta esperada;
- `Guias` leva ao guia sem soterrar ENEM e formas brasileiras;
- `Publicar` apresenta sequência compreensível sem parecer promessa comercial;
- voltar ao texto preserva manuscrito e posição de trabalho.

### P2 — infraestrutura pública

Headers de segurança, fontes externas e cache de páginas editoriais pertencem a uma trilha separada de Cloudflare/GitHub Pages. Não misturar essa infraestrutura com ajustes de UI.

## Fora de escopo até aparecer evidência nova

- autenticação, nuvem ou sincronização por conta;
- inteligência artificial externa lendo manuscritos;
- novas engines para aumentar contagem de recursos;
- redesenho geral da marca ou troca de metáforas já compreensíveis;
- refatoração ampla de `app.js` sem defeito reproduzido;
- reimplementação de itens já concluídos apenas porque aparecem em relatório antigo.

## Porta de qualidade para cada fatia

1. defeito ou oportunidade reproduzido no estado atual;
2. branch própria e escopo declarado;
3. nenhuma alteração em engine, dados ou persistência fora da necessidade demonstrada;
4. golden, console, overflow, foco e integridade aprovados;
5. recarga com rede desligada quando houver mudança em arquivos distribuídos pela PWA;
6. capturas em celular e desktop julgadas visualmente;
7. PR só sai de rascunho depois dos testes e da leitura das evidências;
8. merge pequeno e reversível.

Esta rota substitui filas antigas como guia operacional. Relatórios anteriores permanecem como memória e fonte de hipóteses, não como descrição automática do produto atual.
