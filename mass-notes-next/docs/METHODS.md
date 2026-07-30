# Métodos de trabalho — Mass Notes Next

Atualizado em: 2026-07-30

## Regra principal

Toda observação e melhoria deve ser estruturada e apresentada pelo método **CLARO**.

Fontes permanentes:

1. `../../docs/product/METODO_APRESENTACAO_MELHORIAS.md` — contrato do método;
2. `../../docs/product/TEMPLATE_APRESENTACAO_MELHORIA.md` — ficha copiável;
3. `logs/2026-07-30-observacao-01-paginacao-rolagem.md` — primeira aplicação oficial.

## Comportamento esperado em cada nova tarefa

Ao receber uma observação de produto:

1. sugerir o template CLARO;
2. separar comportamento atual e esperado;
3. pedir ou preservar evidência anterior quando existir;
4. classificar impacto sem confundir defeito, dívida e gosto;
5. escrever critérios de aceite antes da correção;
6. separar diagnóstico de implementação em problemas arquiteturais;
7. criar prova reproduzível;
8. apresentar antes/depois no mesmo contexto;
9. declarar limitações;
10. fornecer link e roteiro curto da preview.

## Métodos ativos

### CLARO — apresentação de melhorias

- **C:** cenário observado;
- **L:** limite e impacto;
- **A:** arquitetura ou ação escolhida;
- **R:** resultado reproduzível;
- **O:** o que permanece aberto.

### Baseline → teste vermelho → correção mínima → matriz verde

Usar para defeitos reproduzíveis:

1. preservar a baseline;
2. criar um teste que falhe pelo motivo correto;
3. bloquear publicação diante da falha;
4. aplicar a menor correção coerente;
5. repetir toda a matriz;
6. publicar apenas depois do smoke verde;
7. documentar tentativas intermediárias.

### Diagnóstico antes da implementação

Obrigatório quando a mudança puder afetar:

- estrutura do documento;
- persistência;
- seleção ou histórico do editor;
- engines;
- exportação;
- responsividade global;
- acessibilidade;
- release.

O diagnóstico deve mapear causa, alternativas, riscos, arquivos, critérios e reversão antes de escrever código.

## Apresentação padrão

Toda melhoria deve ter duas camadas:

1. **camada rápida para uso:** problema, esperado, status, antes/depois, critérios, limites, preview e roteiro;
2. **apêndice técnico:** causa, arquitetura, arquivos, testes, SHA, workflows, artefato e reversão.

Não apresentar uma lista de commits como se fosse uma demonstração de produto.

## Status permitidos

- em investigação;
- reproduzida;
- parcialmente corrigida;
- corrigida;
- pendente;
- não reproduzida.

## Limite permanente

O método melhora decisão e comunicação, mas não autoriza merge, promoção, Gate 14 ou lançamento público. O PR permanece em rascunho até autorização explícita.
