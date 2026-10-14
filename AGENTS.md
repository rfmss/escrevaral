# Continuidade da reconstrução

Leia `docs/ESTADO.md`, `docs/ARQUITETURA.md` e a última entrada de `docs/DIARIO.md` antes de alterar código.

- Frente atual: branch `reconstrucao` de `rfmss/escrevaral`. `main` continua em produção. Não substituir produção por esta primeira fatia.
- Fonte preservada: `vaultOUT26`, SHA `53c4afe5090f3bcdc3a5fac9bd920c4783a2acae`. Não editar o vault. Reaproveitar capacidades justificadas, nunca copiar o controlador ou a cascata CSS antiga.
- JavaScript do navegador escrito em ES5; CSS conservador, sem framework, CDN ou rede do manuscrito. Ferramentas de desenvolvimento ficam fora do navegador.
- Index é entrada declarativa. Bootstrap só compõe. Estado privado, dependências explícitas. Motores não conhecem DOM ou armazenamento; interface não acessa localStorage.
- Escrita, dados e recuperação têm prioridade sobre efeitos. Manuscrito nunca é alterado por análise. Não prometer perda zero, compatibilidade universal ou autoria humana comprovada por hash.
- Trabalho solo. Os nomes da equipe conceitual são papéis de revisão, não agentes ou profissionais que realmente participaram.
- Aceitar risco barato: aparência, rótulo, proporção. Verificar risco caro: perda de texto, overwrite, migração e seleção errada. Nada de auditoria completa a cada lote.
- Executar `npm test` e `npm run build` para alterações desta fundação. Não instalar navegador ou ampliar baterias por rotina; registrar limites reais.
- Atualizar estado, continuidade e diário na mesma entrega. Registrar decisão, evidência, risco aceito e próxima tarefa específica. Não marcar publicado por existir commit local.
- O formato rico ainda está aberto. A primeira fatia é texto simples. Não resolver essa decisão por introdução silenciosa de contenteditable.
- Não criar pastas vazias, abstrações genéricas ou código de funcionalidades futuras. Não editar `dist/` ou `assets/mesa.js`: são gerados.

O usuário autorizou iniciar e dar push nesta frente, com verificações dirigidas e avaliação ampla no fim. Mudança do domínio de produção continua fora deste lote.
