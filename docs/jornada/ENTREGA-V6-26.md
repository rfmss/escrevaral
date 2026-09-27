# v6-26 — filosofia consolidada e relógio discreto

Base: main `49fd0b816dee8b03f13273a7ba9da8acce83b3ac`. Autorização: Rafael pediu incorporar o anexo ao Plano Mestre, marcar TODO/DONE, mostrar árvore curta e executar o próximo passo lógico.

- **F05:** diretrizes do DOCX conciliadas com decisões posteriores, referência identificada por hash, árvore de 21 marcos com critérios/evidências e formato padrão. Os quatro marcos F01–F04 representam a base já entregue; não são avanço deste lote.
- **C01:** relógio troca repouso → meia troca (70 ms) → destino, sem transforms 3D, keyframes ou interpolação. Um callback atrasado não sobrescreve a troca mais recente. Preferência de movimento reduzido, aba oculta e relógio fechado recebem troca direta. Contagem de tempo e persistência não foram alteradas.
- **Mudanças:** módulo UI ES5 separado, integração no manifesto e utilitários, CSS sem abas animadas, versão da distribuição 6.26.0. Versão do conhecimento linguístico preservada. Assets anteriores conservados para a transição.
- **Verificação local concluída:** `tests/relogio-discreto.cjs`, `tests/controles-static.cjs`, `tests/offline-cache.cjs` e `npm run build:check`. CI essencial concluído com sucesso: 18 scripts. Nenhuma nova validação visual ou em hardware antigo é presumida.
- **Escopo:** não altera Grid/gap, worker, clipboard, formato de pacote, texto ou motores. Essas frentes possuem caixas próprias; C01 não é certificação do projeto em iPad/KitKat.
- **Avanço:** plano v1, 6/21 marcos DONE; entrega +2 (F05, C01). Contagem de entregas, não de esforço nem cobertura linguística.
- **Próximo:** C02 — layout do painel pelo piso antigo.
- **Publicação:** main `e7742bdaa91027ca43de2a2aed979d5da5b04bfe`, árvore `e5ed3e29b11a04c6ce88b460c87820b5ce760443`; [CI](https://github.com/rfmss/escrevaral/actions/runs/36317124967) e [deploy](https://github.com/rfmss/escrevaral/actions/runs/36317124442) concluídos com sucesso. Confirmação pela API do GitHub; não é inspeção visual do domínio.
- **Reversão:** commit normal do lote, com distribuição regenerada; nenhuma migração do armazenamento.
