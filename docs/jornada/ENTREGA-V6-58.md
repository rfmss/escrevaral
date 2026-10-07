<!-- Gerado por ferramentas/gerar-entrega.py; editar docs/jornada/entregas/v6-58.json -->
# Palavras reservadas perto da edição

v6.58: janela junto ao cursor reserva até24 palavras reconhecidas, preserva classes possíveis e permite consultar/selecionar ocorrências exatas a pedido. Pausa700ms e limite total400 visitas preservados.

Base: `01eafaf6a7c769e2b64055572131c6e36a9a2f30`. Coordenação solo; data 07/10/2026.

## Mudança de produto

Preserva cinco tarefas do painel. Entender uma frase oferece Ver palavras reconhecidas após a pausa. Reserva mostra classes possíveis, não diagnósticos, e mantém ocorrências repetidas separadas. Ver no texto seleciona a posição original; Consultar palavra abre a consulta existente com fontes e limites. Só renderiza a lista quando solicitada. Corrige também o anúncio da preparação para aria-live, deixando role=status exclusivo do andamento do exame.

## Fronteiras e classificação

Janela começa no máximo1000 unidades antes do cursor e recebe até2001 unidades. Ignora palavras cortadas em qualquer borda e formas maiores que64. Chave canônica separada do trecho literal, offsetsUTF-16 originais. Com contexto anterior desconhecido, não executa triagem de frase: apenas consulta formas, inclusive citadas, sem classificação contextual. Que sozinho não prova relativa. Reserva vinculada à folha e instância ativa; edição/IME/fechamento descartam; ação confere trecho literal.

## Orçamento

700ms, um timer e uma entrada de cache; 200 tokens para sinais e200 para consulta lexical, total máximo400. Até24 ocorrências com classes deduplicadas das até32 leituras por forma da fonte já existente. Sem coleção de snapshots, persistência, varredura encadeada ou nova dependência. Cofre/dados/CSS preservados. Limites de entradas/trabalho não medem RAM total nem certificam dispositivo antigo. A03 não concluída; próximo filtro sobre a reserva, contexto geral separado. A busca lexical inicia até256 unidades antes do cursor dentro da janela e retém as24 mais próximas entre as visitadas, ordenadas por posição; não percorre o livro para localizar a edição.

## Verificações e publicação

Preparação: relógio700ms, reinício, cancelamento/ocultação/IME, identidade e teto. Reserva: dados reais, homógrafos/repetidas, fronteiras cortadas, emoji/NFD, citações, contexto anterior desconhecido, limite24/400, seleção literal sem alteração e botão antigo invalidado. Painel, léxico/flexões e ES5 aprovados; build reproduzível. CI/Pages por commit. Chromium real: preparação sem exame completo, abertura da reserva, retorno por seleção, análise contextual e consulta preservados, sem erros. Controle denso com mais de24 candidatas confirma prioridade da palavra no cursor.

CI e publicação: consultar as execuções vinculadas ao commit desta entrega; sem segundo commit apenas para confirmar deploy. [Execuções da main](https://github.com/rfmss/escrevaral/actions?query=branch%3Amain). O sucesso deve ser conferido no commit correspondente; CI e Pages são estados separados.

## Próxima ação

A03-filtro: oferecer filtro por classes possíveis nas ocorrências reservadas, com contagens locais e acesso a todas; distinguir classes do léxico, hipóteses contextuais e regiões não verificadas. Não elevar teto ou converter que em relativa.

Plano v4: 12/25 DONE | entrega +0 marcos (nenhum) | próximo A03 | publicação: Actions por commit | limite: Reserva lexical de uma janela, sem gramática geral ou classificação contextual automática. Cobertura limitada ao acervo; RAM total de dispositivos não medida.
