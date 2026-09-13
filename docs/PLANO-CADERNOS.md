# Cadernos no Encore

Base conferida: `main`, commit `8bbe3f4c10a253a22a1c316a2b4829824c20fd17`.
Branch de implementação: `feat/encore-cadernos`.
Referência conceitual: `DECISOES-CADERNOS.md` e a deliberação aprovada na conversa de 13/09/2026.

## Plano executado

- [x] Conferir o aplicativo atual e seus dados: HTML único, arquivo de documentos por registro, projetos agrupados por nome, calendário e preferências gerais separados.
- [x] Criar registro de cadernos com identidade estável, capa, nome, dados próprios e posição de retomada.
- [x] Associar projetos antigos sem reescrever os documentos; acolher folhas sem projeto em Avulsos. Lembretes sem projeto continuam na mesa geral.
- [x] Colocar capas na mesa. Duplo clique na área vazia e atalhos de criação acessíveis pelo botão da mesa e menu Início usam o mesmo formulário de nomeação.
- [x] Retirar a criação de projetos de dentro do arquivo. Abrir a capa seleciona o projeto; minimizar fecha o caderno e mantém a escrita guardada.
- [x] Integrar seleção, nova folha, renomeação, busca, calendário, lixeira e retorno ao editor existente.
- [x] Exportar um caderno e exportar tudo; importar pacotes novos e cópias antigas.
- [x] Validar dados, navegação e telas; manter as duas entradas HTML iguais e atualizar a versão do cache.

## Decisões de implementação

O registro `escrevaral.astra.notebooks.v1` contém os cadernos. Os documentos recebem `projectId`; `project` continua como nome legível para compatibilidade. Aliases ligam os registros antigos ao caderno sem alterar texto, revisão, datas ou provas existentes. Renomear altera a identidade visual, mantendo o vínculo.

As capas usam botões, CSS simples, cores sólidas e gradientes. A disposição quebra em linhas conforme a largura da mesa. Um único editor é reutilizado. Os scripts da página mantêm sintaxe ES5, sem novas dependências do produto. O service worker moderno existente conserva seu papel opcional nos navegadores que o suportam.

O calendário aberto com caderno ativo grava em `data.planner` daquele caderno; aberto na mesa, usa o calendário geral anterior. Lembretes recebem o vínculo do caderno quando criados nele. Ferramentas gerais, como aparência e Pomodoro, permanecem no ambiente e entram na exportação completa.

## Pacote e integridade

O arquivo `.scrvrl` é JSON UTF-8 versionado (`escrevaral-cadernos`, versão 1). Contém inventário, cadernos, documentos e, na exportação completa, dados gerais. Exportar copia e não remove nada. São incluídos registros na lixeira e campos adicionais existentes, inclusive metadados de autoria. Não se fabricam certificados ou registros que não existam na versão atual.

Importar valida tudo antes de gravar. Identidade ou nome já existente gera um caderno com sufixo de cópia; os registros locais permanecem. As identidades novas mantêm referência à origem quando precisam ser remapeadas. O texto, as datas, revisões e os campos de autoria são preservados.

Uma importação completa informa que também restaura as preferências e o calendário geral. Depois dela, a interface recarrega para usar esses valores. A navegação recomeça na mesa. Pacotes de até 50 MB são aceitos, sujeitos ao espaço de armazenamento disponível no navegador.

A gravação usa um registro temporário de recuperação: em falha, desfaz as escritas do pacote; após encerramento abrupto, recupera o estado anterior na inicialização. O limite de espaço pode impedir a importação, mas não autoriza apagar conteúdo anterior.

## Verificação

- `node tests/cadernos.cjs`: sintaxe, migração, identidade, caderno vazio, exportação, ida e volta, campos de autoria, colisões, pacote inválido, falha em cada etapa de gravação, recuperação e lixeira.
- `NODE_PATH=... CHROMIUM_PATH=... node tests/cadernos-browser.cjs`: usa Playwright disponível no ambiente de desenvolvimento, fora do aplicativo. Verifica duplo clique, teclado, criação, escrita, isolamento da busca, renomeação, calendário, exportação individual/completa, importação individual/completa, colisões, lixeira, migração antiga, recarga, falha de gravação, tela de 375 px com toque e recarga offline.
- Análise dos 28 scripts inline com parser ES5.
- Inspeção visual da mesa, do caderno aberto e da tela estreita.

Limite da verificação: Chromium não substitui teste no iPad físico com iOS 9.3.5. A versão final deve ser experimentada nesse aparelho para confirmar teclado, compartilhamento do pacote e limites reais de memória/armazenamento. Nenhuma dependência moderna foi acrescentada ao aplicativo para esta mudança.

## Entrega

Implementação e verificação concluídas. Rafa autorizou explicitamente enviar `feat/encore-cadernos` ao repositório público `rfmss/escrevaral` e abrir o PR. A entrega ocorre por essa branch; este registro não afirma integração à main ou publicação em produção.
