# Encore — cadernos como projetos e carteiras

Data: 13 de setembro de 2026.
Estado: conceito confirmado por Rafa Mass; registro da deliberação. Implementação ainda não iniciada nem autorizada por este registro.

## Decisões confirmadas

O caderno é a representação visual de um projeto na mesa existente do Encore. É uma ilusão de objeto: abrir a capa revela a interface atual do site, com suas ferramentas e funcionamento. O trabalho é ajustar entradas, vínculos e retorno à mesa, preservando o ambiente pronto.

- Os cadernos ficam na área livre da mesa mostrada no segundo anexo, não numa nova barra lateral.
- Dois cliques na área vazia iniciam a criação de um caderno. A pessoa informa o nome, que passa a ser o nome do projeto.
- A área atual de criação de projetos, mostrada no primeiro anexo, é retirada. Criar o caderno já cria o projeto.
- Caderno e projeto são a mesma entidade, com identidade estável e nome único compartilhado entre capa e interface. Renomear a capa renomeia o projeto.
- Abrir o caderno seleciona o projeto e apresenta a área de trabalho existente com seu conteúdo.
- Minimizar recolhe a área de trabalho e devolve à mesa com o caderno fechado. O conteúdo permanece salvo; reabrir retoma o trabalho.
- Nova folha e outros conteúdos criados dentro do projeto pertencem àquele caderno.
- Projetos existentes ganham representação de caderno, preservando textos e identidades.
- O HTML gemini-code-1789332812307.html é referência para aparência e interação dos cadernos. Seu editor, paginação e armazenamento próprios não substituem automaticamente os do Encore.

## Exportação e importação

O caderno é a unidade completa de transporte e preservação do projeto: capa, nome, folhas, organização, anotações, materiais e registros de autoria existentes que pertençam a ele.

| Ação | Alcance |
| --- | --- |
| Exportar este caderno | Um projeto completo com todo o seu conteúdo e vínculos internos. |
| Exportar tudo | Todos os cadernos e os dados gerais do ambiente. |
| Importar um caderno | Recolocar o projeto na mesa, com seu conteúdo, pronto para continuar. |
| Exportar um texto | Gerar uma saída para leitura ou publicação; não equivale ao pacote completo do projeto. |

Exportar cria uma cópia e mantém o original na mesa. A regra é: tudo que for criado dentro de um projeto acompanha sua exportação. O pacote transporta dados e materiais do trabalho; não pressupõe copiar uma instalação inteira do aplicativo para cada caderno.

## Cuidados a resolver no encaixe técnico

Os itens abaixo são recomendações para a implementação, não novas decisões atribuídas ao usuário.

1. Conferir a versão efetiva do Encore e seu modelo de dados antes de editar. Este registro não verifica a branch atual nem confirma promoção a main.
2. Mapear o pertencimento de cada tipo de dado: conteúdo do projeto versus preferências gerais e lembretes da mesa. Evitar exportações que deixem materiais vinculados para trás. Conteúdo antigo sem projeto precisa de uma regra explícita de acolhimento; sugestão: caderno “Avulsos”.
3. Manter o duplo clique aprovado e oferecer acesso equivalente no menu Início para toque e teclado. O atalho chama a mesma criação de caderno; não recria o formulário antigo como fluxo paralelo.
4. Distinguir minimizar/fechar a janela de excluir o projeto. Exclusão deve seguir a lixeira recuperável do sistema, sem herdar o descarte definitivo por arraste do protótipo.
5. Definir colisões na importação: reconhecer a identidade do projeto, nunca sobrescrever silenciosamente e distinguir cópia de atualização. Preservar os registros originais de autoria sem inventar eventos ou datas na importação.
6. Definir um pacote versionado, com inventário do conteúdo, reutilizando o exportador existente quando possível. Conferir o pacote antes de incorporar seus dados; uma falha não deve deixar importação parcial nem danificar conteúdo existente.
7. Salvar a folha ativa antes de minimizar ou trocar de caderno; se a gravação falhar, manter o trabalho recuperável e comunicar a falha.
8. Revisar os caminhos de menus, busca, “Seus textos”, nova folha e título da janela para que o projeto ativo seja inequívoco. O alcance global de “Todos os textos” deve ficar explícito se essa visão for mantida.
9. Priorizar o iPad antigo: capas leves, um editor compartilhado, somente o conteúdo necessário carregado. Aparência por CSS simples e efeitos breves; nenhum motor 3D ou dependência nova por causa da metáfora.

## Sequência proposta

1. Conferir o código e mapear projetos, conteúdos e exportação atuais.
2. Integrar capas à mesa, criação/nomeação, abertura e minimização; preservar projetos antigos.
3. Ajustar os caminhos e a associação de todo conteúdo ao caderno.
4. Implementar ou adaptar exportação individual, exportação completa e importação.
5. Validar um ciclo real: criar, escrever, minimizar, reabrir, exportar e importar; conferir integridade do conteúdo e comportamento no dispositivo antigo.

## Limite de escopo

A finalidade é integrar a metáfora do caderno ao Encore pronto. A estrutura visual interna não será redesenhada por este conceito. Mudanças adicionais de produto devem ser apresentadas separadamente. Este documento registra as decisões e recomendações; não inicia alterações no site nem publicação.
