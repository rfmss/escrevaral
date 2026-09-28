# v6-31 — coordenação de instalação (A02 parcial)

- **Base:** main `529fc95bf781e2758af4d01dc5c92e1be86cbe16`, conferida em 27/09/2026, horário de Brasília. Rafael autorizou seguir autonomamente; A01 ainda não entregue na main consultada.
- **Objetivo:** coordenar instalação por blocos sobre a persistência v6-30, com custo sequencial, progresso confirmado, cancelamento e retomada.
- **Implementação:** `src/storage/instalador-pacotes.js`, ES5 e callbacks. Recebe leitor injetado; retoma recibos, grava uma unidade por vez e só pede ativação ao concluir. Entrada e relatórios copiados, continuações cedem execução, callbacks duplicados/tardios ignorados. Falhas preservam versão ativa e staging retomável. Ativação é seção curta não cancelável; cancelamento anterior aguarda término da unidade em curso.
- **Integração:** fábrica adicionada à montagem; sem consumidor de interface, transporte de rede/arquivo, catálogo ou dados novos. Sem mudança no banco, cofre ou manuscritos. Nenhuma dependência nova.
- **Fontes:** contratos existentes e código v6-30; nenhuma pesquisa linguística ou incorporação de recurso externo nesta entrega. API/limites documentados em [Persistência de pacotes](../PERSISTENCIA-PACOTES.md).
- **Verificação:** `tests/instalador-pacotes.cjs` exercita sequência, progresso, interrupção/retomada, quota, hash, dependências e cancelamento com callbacks adversos sobre IndexedDB simulado. `tests/controles-static.cjs`, `npm run build:check` e `git diff --check` também aprovados localmente. CI será registrado ao publicar.
- **Limites:** sem comprovação de persistência física ou pacote real offline. Leitor deve impor limites antes da alocação e concluir após cancelamento; não há timeout genérico que finja interromper trabalho físico, orçamento global, limpeza segura ou alternativa de pacote para APIs antigas. UI, catálogo/transporte e A01 permanecem pendentes.
- **Estado:** implementação parcial; publicação aguardando confirmação. **Plano v3: 9/24 DONE, +0; A02 permanece TODO.**
- **Publicação:** aguardando push, CI e Pages.
- **Reversão:** commit normal e montagem regenerada; nenhuma migração de dados.
- **Próximo:** definir catálogo aprovado e transporte limitado em conjunto com A01; conectar instalação/recuperação explícitas à interface, com capacidade/espaço/erros apresentados. Não simular pacote disponível ao usuário enquanto a fonte não estiver pronta.
