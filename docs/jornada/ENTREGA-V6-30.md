# v6-30 — base transacional dos pacotes (A02 parcial)

- **Base:** main `a0625aedba34640ac00f45f8de1f0e378b2cdb26`. Rafael autorizou execução autônoma do próximo passo. Não havia entrega A01 na main consultada.
- **Objetivo delimitado:** preparar persistência por versão/bloco independentemente do formato lexical, preservando versão ativa diante de falhas e permitindo retomada.
- **Implementação:** módulo ES5 opcional, sem inicialização automática. Instalação incompleta, recibos/bytes transacionais, ativação atômica, versões/dependências fixadas, consulta pontual com hash, descarte de staging e tickets contra respostas de instalação antiga. Cancelamento e uma operação em curso por instância.
- **Integração:** fábrica incluída na montagem do app, ainda sem consumidor de produto. Não há instalador visível, downloads automáticos, pacote real, novo motor ou preparação nas pausas. Cofre e versão de conhecimento preservados.
- **Fontes técnicas:** W3C IndexedDB 2015 e documentação oficial fakeIndexedDB; referências e limites em [Persistência de pacotes](../PERSISTENCIA-PACOTES.md). Sem pesquisa linguística nova.
- **Verificação local:** `tests/pacotes.cjs`, `tests/controles-static.cjs`, `npm run build:check` e `git diff --check` aprovados. Dependência de teste `fake-indexeddb@6.2.5`, Apache-2.0, apenas desenvolvimento.
- **Limites:** simulador em memória não prova persistência física; faltam A01, instalador, orçamento global, limpeza segura e alternativa de pacotes para capacidades antigas. Sem IndexedDB/hash, falha recuperável; o núcleo de escrita não depende do módulo.
- **Estado:** implementado/verificado localmente e incluído na montagem 6.30.0; publicação aguardando confirmação. **A02 permanece TODO; plano v3: 9/24 DONE, +0 marcos.** Há avanço de implementação, sem antecipar o critério completo.
- **Publicação:** aguardando push, CI e Pages.
- **Reversão:** commit normal e build regenerado. O banco novo é isolado e só abre por chamada explícita; nenhuma migração do armazenamento de manuscritos.
- **Próximo:** integrar o envelope à prova A01 quando entregue e preparar fluxo explícito de instalação/recuperação, mantendo o recurso opcional. Não duplicar pesquisa/motores de A2.
