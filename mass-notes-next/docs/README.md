# Memória operacional — Mass Notes Next

Esta pasta permite retomar o subprojeto sem depender do histórico de uma conversa.

## Estado resumido

- Gates 1 a 13 e Gate 10.5: concluídos;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- matriz consolidada atual: 124 cenários por navegador, 248 execuções verdes;
- evidência funcional histórica da tranche 3: 126 por navegador, 252 execuções;
- tranche decisória dos quatro P2: concluída;
- nota provisória: 88/100;
- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público e substituição integral: `NO-SHIP`;
- P0/P1 abertos: 0/0;
- quatro P2 com decisão explícita e bloqueios preservados onde indicado;
- Gate 14 suspenso até o veredito final;
- PR `#155` permanece em rascunho;
- `main`, aplicação pública e service worker permanecem intactos.

## Ordem de leitura

1. `M0_9_AUDITORIA_OPERACIONAL.md` — execução, decisões, achados, placar e evidências;
2. `M0_9_ERRATA_MATRIZ.md` — número autoritativo da matriz consolidada atual;
3. `logs/2026-07-29-m0-9-decisoes-p2.md` — decisões por objetivo e sequência posterior;
4. `audits/M0_9_AUDITORIA_GERAL.md` — relatório humano;
5. `audits/M0_9_AUDITORIA_GERAL.json` — estado estruturado;
6. `logs/2026-07-29-m0-9-auditoria-nao-funcional-tranche-3.md` — auditoria automatizada;
7. `PLAN.md` — objetivo e sequência aprovada;
8. `MEMORY.md` — decisões permanentes;
9. `CHANGELOG.md` — mudanças relevantes;
10. contratos globais em `../../docs/product/`.

## Regra de continuidade

Antes de cada sessão:

- conferir branch, PR e workflows;
- ler a memória operacional M0.9 e a errata da matriz;
- ler as decisões dos quatro P2;
- localizar a próxima fase incompleta;
- declarar a evidência que será produzida;
- não iniciar feature nova durante o diagnóstico.

Ao tomar decisão importante:

- registrar em `M0_9_AUDITORIA_OPERACIONAL.md` ou no log decisório correspondente;
- atualizar placar, paridade ou achados;
- atualizar `PLAN.md` e `MEMORY.md` quando permanente;
- registrar commit e evidência.

Ao encerrar:

- atualizar relatório humano e JSON;
- atualizar plano, memória e changelog;
- criar ou completar log e contrato global;
- atualizar o corpo do PR;
- repetir CI na cabeça documental exata;
- registrar SHA e workflows no PR sem criar commit posterior.

## Decisões vigentes dos P2

- PWA/offline próprio ausente: aceito apenas para beta fechada online; bloqueia lançamento público;
- `page-flip` externo da Anatomia: aceito apenas para beta online; deve ser local antes de lançamento/offline;
- Prova de Autoria ausente: não bloqueia beta, mas bloqueia substituição integral sem restauração ou aposentadoria formal;
- DOCX, RTF, ePub e Obsidian ZIP ausentes: não bloqueiam beta; DOCX é o primeiro candidato posterior, condicionado à evidência de uso.

## Limites da automação atual

A tranche 3 aprovou seis larguras, zoom CSS equivalente, movimento reduzido, rede, recuperação, sessão prolongada e corpus por engine. Isso não equivale a validação com zoom real, leitor de tela, tecnologia assistiva ou dispositivo físico; essas etapas devem continuar explicitamente pendentes até serem executadas de verdade.

Gate 14 permanece apenas proposto e suspenso. O próximo passo é validação humana mínima e encerramento explícito do M0.9; documentação é parte do produto.