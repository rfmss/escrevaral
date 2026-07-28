# Gate 6.9 — auditoria editorial do contrato de posições

Status: em andamento.

## Objetivo

Auditar o contrato aprovado no Gate 6 com corpora originais e realistas em português brasileiro antes de autorizar qualquer decoration ProseMirror.

## Escopo autorizado

- prosa urbana;
- diálogo com travessões e aspas;
- ensaio com citação e lista aninhada;
- poesia com estrofes e blocos vazios;
- cordel;
- canção com `hardBreak`;
- Unicode brasileiro: acentos precompostos, combinantes e emoji;
- documento extenso;
- round-trip offset UTF-16 ↔ posição ProseMirror;
- afinidade em fronteiras;
- pureza de HTML, seleção e histórico;
- Chromium e Firefox.

## Fora do escopo

- decorations;
- sublinhados;
- highlights;
- tooltips;
- navegação issue → trecho;
- substituição automática;
- alteração de engines ou manuscrito.

## Critérios de parada

1. trecho recuperado difere do esperado;
2. o texto derivado diverge da estrutura renderizada;
3. Chromium e Firefox divergem;
4. consulta altera HTML, seleção, histórico ou documento;
5. offset deixa de ser explicitamente UTF-16;
6. estrutura válida precisa ser descartada para o teste passar.

## Evidências previstas

- relatório JSON por navegador com corpus, trecho, offsets, posições, round-trip e assinatura;
- matriz Playwright completa;
- log de incidentes e decisões;
- atualização de plano, memória e documentação global somente após gate verde.
