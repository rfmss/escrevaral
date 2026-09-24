# Protocolo de publicação e revisão ASTRA

**Projeto:** Escrevaral (rfmss/escrevaral). **Aplicação:** entregas integradas à `main` a partir de 24/09/2026.

1. Antes de publicar, conferir a HEAD real da `main`, revisar o diff do lote e executar as verificações pertinentes. Não declarar homologação em aparelhos físicos antigos quando só houver emulação.
2. Em cada PR e na mensagem do commit de integração, registrar **"Revisão solicitada: ASTRA"**, o link do PR e a versão/commit entregue. **Solicitar não equivale a obter aprovação**.
3. Solicitar ao ASTRA revisão crítica da alteração publicada ou pronta para publicação: riscos de regressão no editor, no painel PTBR, na composição de acentos/IME, no cache offline, na versão portátil, no armazenamento e na exportação. Pedir que documente achados reproduzíveis, gravidade, passos e arquivos/linhas afetados.
4. Não atribuir ao ASTRA uma revisão que ele não executou e não presumir que um comentário no GitHub chega a outro chat. Quando o ASTRA não tiver uma identidade GitHub configurada, registrar o pedido no PR e compartilhar seu link com o usuário para encaminhamento ao chat do ASTRA.
5. Corrigir achados confirmados em PR próprio, sem sobrescrever `main`, preservar cadernos e textos e repetir os testes de integração. Alterações ao `ptbr/*` continuam com o ASTRA; a integração de alterações sobre HTML compartilhado exige conferir o diff mais recente.

A autorização para publicação não elimina esses controles; pedir revisão posterior não substitui os testes anteriores.
