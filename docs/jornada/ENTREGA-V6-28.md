# v6-28 — acesso offline e recuperação (C03)

- **Base:** main `69051b81f69739d16cdb049039c10812a6978daf`; entrega C02 com CI 36318088428 e Pages 36318079279 aprovados. Rafael pediu continuar com “s”.
- **Objetivo:** tornar explícitos site/cache opcional e mesa portátil, sem exigir APIs modernas no caminho do arquivo único.
- **Implementação:** build identifica site/portátil; o módulo ES5 de acesso offline não registra worker no arquivo, mesmo quando servido por HTTP. No site, verifica capacidades antes de registrar, informa preparação e só anuncia prontidão após ativação. Falhas síncronas, rejeição e instalação descartada apontam para o arquivo portátil.
- **Acesso/recuperação:** instruções estáticas nos Ajustes, link comum além do download, passos para exportar o acervo e trazê-lo de volta; distinção explícita entre arquivo do editor e cópia dos textos. As origens podem ter acervos separados. Nenhuma transferência ou alteração automática de manuscrito.
- **Fontes:** código de montagem, módulo offline, template do worker e ações de exportação/importação existentes. Sem nova regra ou fonte linguística.
- **Verificação local:** `tests/offline-access.cjs`, `tests/offline-cache.cjs`, `tests/controles-static.cjs`, `npm run build:check` e `git diff --check` aprovados. Casos: sem APIs, arquivo local, portátil HTTP, falha síncrona/rejeição, instalação descartada, ativação pendente/concluída e recursos essenciais incorporados. Sem teste visual ou em dispositivos.
- **Estados:** implementado, integrado e verificado em 6.28.0; publicação a confirmar. C03 ainda TODO até essa confirmação.
- **Limites:** abertura local depende do navegador; cache pode ser removido. Revisão de APIs de salvar/importar/exportar/selecionar pertence a C04. Nenhuma ampliação de cobertura dos motores. Worker moderno permanece opcional e isolado.
- **Publicação:** aguardando push, CI e Pages.
- **Reversão:** commit normal e regeneração da distribuição; formatos e chaves de armazenamento não mudaram.
- **Próximo:** C04, verificar alternativas de salvar/importar/exportar/selecionar preservando texto e pacotes.
