# A01 — revisão A1 e incorporação da primeira prova A2

- **Base:** main `ee79273522df4d056305e56981196bf1e6899f12`, produto v6-32; consulta ao PR #188 em 28/09/2026. Autorização vigente de Rafael para A1 integrar/publicar e continuar; detalhes concentrados no repo.
- **Lote revisado:** `1ae834fbd675e1bed27acd42ac930082791ce7a2`, 12 arquivos novos em `docs/recursos/` e `packages/experiments/lexical-index/`. Cópia byte a byte do commit após leitura e reprodução; sem merge automático do draft ou mudança na branch A2.
- **Entrega:** comparação de cinco candidatos, fontes e medições da A2; conversor/fixture própria, leitor Node e consulta ES5 isolada com ambiguidades, limites, versões e identidade preservadas. A1 registra aceite e decisões em [Revisão A01](../recursos/REVISAO-A1-A01-2026-09-28.md).
- **Integração:** prova disponível na main e wrapper `tests/a01-lexical.cjs` na suíte essencial; nenhum experimento, corpus ou dependência entra no bundle. Versão do produto permanece 6.32.0. Sem alteração de manuscritos, armazenamento ou interface.
- **Verificação local:** 22 casos e 222 consultas de referência reproduzidos no SHA da A2. `tests/a01-lexical.cjs`, `npm run build:check` (7 arquivos) e `git diff --check` aprovados; CI será registrado na publicação. Não repetido benchmark de servidor; medições continuam atribuídas à A2.
- **Estados:** estudo/implementação/teste da A2 revisados; incorporação isolada preparada por A1. A01 aceito no escopo da primeira prova; publicação aguardando confirmação. Não equivale a integração lexical no aplicativo.
- **Plano:** v3, **10/24 DONE, +1 (A01)** após confirmação da incorporação. Fundação 5/5; compatibilidade 4/4; acervo 1/3; motores 0/8; experiência 0/2; revisão 0/2. A02 permanece o próximo marco.
- **Limites:** índice da prova ainda integral e limitado; paginação anunciada pela A2 não consta do SHA aceito. Sem corpus externo aprovado, dicionário de definições, 1 GB demonstrado, geração real do rascunho ou consulta de pacote real após reabertura física offline.
- **Publicação:** aguardando push, CI e Pages. Publicar a prova/documentação não altera as capacidades do produto.
- **Reversão:** commit normal retirando apenas o lote e wrapper; nenhuma migração de dados.
- **Próximo:** A2 entrega paginação; A1 desenvolve a ponte ArrayBuffer/UTF-8 e tickets fixados para A02, depois catálogo/controles explícitos. Conferir também PR #188, não só main, antes de declarar ausência de entrega.

## Confirmação posterior — retomada A2, 28/09/2026

A publicação que estava pendente acima foi confirmada na main `494b0f1a8ee2566c9846097c2578904d7d206315`: [CI 36429627022](https://github.com/rfmss/escrevaral/actions/runs/36429627022) e [Pages 36429626226](https://github.com/rfmss/escrevaral/actions/runs/36429626226), ambos completed/success. O mapa foi regularizado para A01 DONE, 10/24, conforme o aceite já dado por A1. A transferência de coordenação e o lote seguinte constam da [passagem de retomada](RETOMADA-A2-2026-09-28.md).
