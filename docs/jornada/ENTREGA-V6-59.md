<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-59.json -->
# Filtro por classes possíveis na reserva

v6.59: reserva filtrável por classes possíveis, contagens locais e retorno a todas as ocorrências. Homógrafos preservados; filtro sem novas consultas, análises ou aumento dos tetos.

Base: `8521fef6f51f48ba620379c9f8f3da03d507797d`. Coordenação solo; data 07/10/2026.

## Experiência

Em Entender uma frase → Ver palavras reconhecidas, seletor com rótulo claro, Todas as ocorrências e classes presentes com contagens. Uma palavra ambígua aparece em cada classe possível; cartões mantêm alternativas. Mensagem explica que as contagens são da reserva e não se somam como categorias exclusivas. Estado anuncia quantas ocorrências ficaram visíveis; teclado e foco do seletor preservados.

## Custo e autoria

Filtro calcula opções/contagens uma vez ao abrir e só muda hidden dos até24 cartões. Não chama motor, léxico, temporizador ou persistência; não recria cartões, não altera snippets/offsets nem editor. Ao invalidar a reserva, handlers antigos não selecionam texto. Mantidos700ms,2000caracteres/400visitas, um cache e24ocorrências. Sem novas dependências, dados ou alteração de cofre.

## Continuidade

A03 permanece TODO com progresso delimitado. Filtro lexical concluído, contextualização geral pendente. Próximo liga o pedido explícito de exame ao trecho reservado com fronteiras e offsets corretos; não aumentar orçamentos para encobrir ausência de contexto. Plano permanece12/25 marcos, sem porcentagem de esforço.

## Verificações e publicação

Testes dirigidos: categorias presentes, contagens por ocorrência, canto simultaneamente substantivo/verbo, repetidas distintas, retorno a Todas, mesmos nós, zero lentes novas, seleção original e invalidação de botão antigo. Preparação/reserva real e painel passaram; ES5 e build reproduzível. Cenário do navegador atualizado para os filtros; regressão completa e publicação conferidas por commit.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-contexto: delimitar e conectar pedido explícito de classes em contexto ao trecho reservado, com identidade, fronteiras protegidas e offsets originais. Evitar examinar outra região da folha sem indicação; manter abstenções e limites existentes.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: Filtro de possibilidades lexicais de uma reserva limitada; não classifica contexto nem representa cobertura da folha.
