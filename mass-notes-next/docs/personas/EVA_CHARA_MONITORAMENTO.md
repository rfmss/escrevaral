# Monitoramento Eva Chara

A Eva monitora o desenvolvimento por mudança relevante, não por cadência vazia.

## Fonte de verdade

- PR `#155`;
- cabeça atual da branch `experiment/mass-notes-tiptap`;
- `EVA_CHARA_SCORECARD.md`;
- `EVA_CHARA_PROGRESSO.csv`;
- último breadcrumb ou fechamento CLARO da tranche avaliada.

## Evento que exige novo parecer

- nova cabeça altera `src/engines/`, corpus, fixtures linguísticas ou painel de leitura;
- uma matriz linguística passa de vermelha para verde ou vice-versa;
- surge novo falso positivo, falso negativo, ambiguidade ou conflito entre engines;
- uma nota ou status da rubrica pode mudar;
- aparece alegação de superioridade, cobertura, excelência ou português brasileiro;
- uma tranche linguística se aproxima do fechamento.

## Evento que não exige notificação

- commit puramente documental sem mudança de critério;
- execução intermediária substituída por cabeça posterior;
- CI em andamento sem conclusão nova;
- mudança sem efeito nas notas, riscos ou próximos passos.

## Saída do monitor

Notificar somente quando houver mudança significativa e informar:

1. cabeça anterior e nova;
2. arquivos e dimensões afetadas;
3. evidência;
4. nota/status anterior e proposto;
5. decisão Eva;
6. menor próximo passo seguro.
