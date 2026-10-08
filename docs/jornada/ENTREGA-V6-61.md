<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-61.json -->
# Conferência retomável de proteções antes do contexto

v6.61 / A03-fronteiras: o exame explícito alcança linhas depois das primeiras 8.000 unidades. As proteções anteriores são conferidas em fatias de até2.000 unidades, com progresso, cancelamento e estado limitado; só depois executa a lente no contexto escolhido.

Base: `82fa01b4b5edaaa4f732cb0d969775e2d4986fdd`. Coordenação solo; data 08/10/2026.

## Mudança percebida

O escritor usa o mesmo Examinar este contexto. Para linhas depois da posição8.000, o painel mostra o avanço real da conferência de proteções anteriores e mantém Cancelar análise disponível. Só quando a origem da linha está comprovada chama Classes de palavras, uma vez, naquele contexto. Se a linha começar dentro de citação/código, continua sem decisão contextual. Não interpreta o início da folha como substituto do trecho solicitado.

## Estado limitado e gramática única

O adaptador createBoundaryScan mantém apenas posição, marcador de fechamento e motivo de abstenção, ligados ao pedido/folha/revisão já existentes. Cada passo lê até2.000 unidades e termina em LF real; o próximo passo conserva a proteção multilinha aberta. O padrão de proteção foi extraído para protectionPattern no cofre e é o mesmo usado por protectedText, sem mudança de alternativas ou regras; evita duplicar a gramática entre camadas. Um sentinela temporário após a fatia evita que o fim artificial seja aceito pelo operador $ como fechamento de aspas/código inline. URLs, email, inline, aspas curvas e cercas seguem a precedência existente. A string temporária da fatia/sentinela é montada uma vez por passo.

## Execução e custo

Não há varredura do prefixo nas pausas, fila de lentes ou novo cache. A prova distante acontece somente no comando explícito e percorre até a linha solicitada, em passos canceláveis, dentro do teto total200mil já adotado para exame. A preparação mantém700ms,2000 unidades,400 visitas e24 ocorrências. O trecho entregue ao motor continua limitado à mesma linha dentro da reserva; os caracteres anteriores servem apenas para estado de proteção. O cofre permanece puro e síncrono; temporizadores ficam no painel. Cancelar/voltar/editar/IME/ocultar/trocar folha descarta o progresso e impede o uso de callbacks antigos. Tamanhos são limites de algoritmo, não medição de RAM total nem promessa de latência.

## Abstenções ainda necessárias

Uma linha anterior maior que a fatia, sem LF dentro dela, interrompe a prova: não se aumenta o teto nem se presume proteção fechada. Fronteiras somente CR na entrada distante permanecem não cobertas; LF e CRLF são aceitos. A linha alvo continua inteira entre limites reais, dentro da janela reservada. Sem provas suficientes, o painel explica a limitação e preserva possibilidades lexicais/seleção original. O teto100 da lente não foi alterado. O estado não é reutilizado entre novos pedidos: evita conservar índices invalidados por edição.

## Direção e publicação

Rafa autorizou continuar o plano e publicar enquanto testa, concentrando avaliação ampla no final. Decisão registrada em AGENTS; CI existente e cobertura não foram removidos. A v6.60 foi enviada via conexão GitHub porque o Git local não tem credencial de escrita: árvore remota idêntica à local; apenas o SHA de commit mudou para82fa01b4. CI e Pages dessa base foram confirmados. Este lote segue o mesmo transporte atômico, com verificação da HEAD e atualização sem force. Não há mudanças em cadernos, armazenamento, exportação ou layout; reversão por revert do commit.

## Verificações e publicação

Revisão do diff e montagem reproduzível com npm run build:check. Por decisão do autor de08/10, não foi executada nova bateria local: os casos dirigidos foram acrescentados ao teste existente tests/preparacao-contexto.cjs e seguem no CI automático, com a regressão já configurada. Cobertura acrescentada: região após14mil unidades, citação e código herdados, delimitadores dentro de URL/email/inline, aspas inline sem fechamento, passos<=2000 e cancelamento entre passos. Não afirmar sucesso do CI desta versão antes de consultar seu commit. Base v6.60 confirmada: CI37860432810 e Pages37860431769, ambos success no SHA82fa01b4b5edaaa4f732cb0d969775e2d4986fdd.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-linhas-longas: permitir que a conferência explícita atravesse linhas anteriores maiores que a fatia, conservando delimitadores partidos e limites de memória/trabalho. Não ampliar a janela contextual nem antecipar análise por pausa. Depois, tratar ocorrência além do teto100 de resultados sem mudar silenciosamente o alvo.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: A03 continua TODO (12/25). A linha alvo ainda deve caber na reserva. A prova distante exige fronteira LF/CRLF e para diante de linha anterior sem LF que ultrapasse2.000 unidades. Limite200mil de posição e100 resultados preservados. Sem medição de RAM/latência; avaliação ampla ao final.
