# Clareza do Produto — acabamento final

Data: 2026-07-25
Branch: `stabilize/clarity-finish`
Versão candidata: `20260725-clarity-final-v1`
Cache offline: `vereda-offline-v953`

## Objetivo

Encerrar a fase Clareza do Produto sem abrir nova frente de redesign. O trabalho desta etapa corrige apenas falhas reproduzidas de acabamento, coerência e confiança.

## Escopo

- diálogos e contenção de foco;
- estados vazios;
- mensagens de erro, salvamento e recuperação;
- contraste e foco visível;
- consistência entre editor, Acervo e Oficina;
- documentação final da identidade Argila;
- auditoria candidata a lançamento;
- smoke test do site público após incorporação.

## Proteções

Não alterar sem falha reproduzida:

- engines;
- manuscritos e identificadores;
- localStorage e persistência;
- formatos `.esc`, `.pacote.esc` e `.ots`;
- exportação e recuperação;
- rotas;
- PWA e funcionamento offline;
- estrutura móvel já estabilizada.

## Critérios de saída

1. Nenhum P0 ou P1 reproduzido.
2. Nenhum erro de console ou overflow horizontal.
3. Foco por teclado inequívoco e sem armadilhas.
4. Diálogos com abertura, fechamento, Escape e retorno de foco previsíveis.
5. Estados vazios orientam uma ação principal sem transformar páginas em vitrines.
6. Mensagens de erro explicam o que ocorreu e preservam o trabalho.
7. Temas Alvorada e Scriptorium mantêm contraste e hierarquia.
8. Editor, Acervo, Oficina, Palavras, Autoria e Mesa móvel permanecem verdes.
9. Cache, versão global e pacote offline permanecem coerentes.
10. Deploy seguido de smoke test público aprovado.

## Evidências pré-merge

- Escape da confirmação usa o cancelamento já existente e preserva retorno de foco.
- Busca sem resultado oferece `Limpar busca` e restaura os documentos.
- O estado realmente vazio mantém a ação principal existente de criação.
- A auditoria final cobre 1280 px, 1440 px em Scriptorium e 390 px.
- A promoção da versão substituiu atomicamente todas as referências distribuídas.

## Regra de decisão

Correções devem ser pequenas, rastreáveis e reversíveis. Preferir reduzir ruído a adicionar componentes. Não esconder uma capacidade essencial para obter uma captura mais limpa.
