# v6-32 — leitura local por blocos (A02 parcial)

- **Base:** main `75d1e85a1146a83826ace3a23116ba15baf6fb96`, conferida em 28/09/2026, horário de Brasília. Rafael autorizou continuar; A01 ainda não entregue na main consultada. Comunicação detalhada concentrada no repositório por preferência do autor.
- **Objetivo:** dar ao coordenador um transporte local que limite bytes antes da leitura, sem impor formato lexical ao A2.
- **Implementação:** `src/storage/leitor-pacotes.js`, ES5/callbacks. Resolvedor injetado retorna arquivo e offset; valida faixa/tamanho, recorta, lê `ArrayBuffer` limitado. Uma leitura por instância, callback único, cancelamento, timeout e trava após aborto de término incerto. Sem fallback para leitura integral de arquivo maior.
- **Integração:** fábrica opcional adicionada à montagem e teste integrado com coordenador/persistência. Não há seletor, catálogo, parsing de manifesto, fonte lexical nova ou análise automática. Nenhuma dependência ou migração de banco.
- **Fontes técnicas:** fonte oficial W3C File API, seções de slice/leitura/abort, identificada em [Persistência de pacotes](../PERSISTENCIA-PACOTES.md). Nenhum estudo linguístico nesta entrega.
- **Verificação:** `tests/leitor-pacotes.cjs` cobre faixas, rejeição antes da alocação de leitura, APIs ausentes, cancelamento, timeout e integração com Blob do Node/FileReader controlado/IndexedDB simulado. `tests/controles-static.cjs`, `npm run build:check` e `git diff --check` também aprovados. CI será registrado ao publicar.
- **Limites:** descritor virtual de 1 GiB testa seleção de seis bytes, não memória real; reabertura de conexão simulada não é reabertura física offline. Faltam catálogo/manifesto aprovado, controles visíveis, A01, caminho de capacidade antiga e limpeza segura.
- **Estado:** implementado e verificado localmente; publicação aguardando confirmação. **Plano v3: 9/24 DONE, +0; A02 permanece TODO.**
- **Publicação:** aguardando push, CI e Pages.
- **Reversão:** commit normal e build regenerado; nenhum dado existente é migrado.
- **Próximo:** integrar manifesto/catálogo aprovado e controles explícitos de instalação/recuperação quando A01 fornecer dados, procedência e limites. Preservar percurso de escrita quando capacidades opcionais faltarem.
