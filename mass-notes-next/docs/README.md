# Memória operacional — Mass Notes Next

Esta pasta permite retomar o subprojeto sem depender do histórico de uma conversa.

## Estado resumido

- Gates 1 a 13 e Gate 10.5: concluídos;
- milestone atual: **M0.9 — Candidata Integrada do Escrevaral**;
- três tranches automatizadas: 126 cenários por navegador, 252 execuções verdes;
- nota provisória: 88/100;
- beta fechada: `SHIP COM CONDIÇÕES` provisório;
- lançamento público e substituição integral: `NO-SHIP` provisório;
- P0/P1 abertos: 0/0;
- P2 abertos: 4;
- Gate 14 suspenso até o veredito final;
- PR `#155` permanece em rascunho;
- `main`, aplicação pública e service worker permanecem intactos.

## Ordem de leitura

1. `M0_9_AUDITORIA_OPERACIONAL.md` — execução, decisões, achados, placar e evidências;
2. `audits/M0_9_AUDITORIA_GERAL.md` — relatório humano;
3. `audits/M0_9_AUDITORIA_GERAL.json` — estado estruturado;
4. `logs/2026-07-29-m0-9-auditoria-nao-funcional-tranche-3.md` — lote mais recente;
5. `PLAN.md` — objetivo e sequência aprovada;
6. `MEMORY.md` — decisões permanentes;
7. `CHANGELOG.md` — mudanças relevantes;
8. contratos globais em `../../docs/product/`.

## Regra de continuidade

Antes de cada sessão:

- conferir branch, PR e workflows;
- ler a memória operacional M0.9;
- revisar P0/P1 e os quatro P2 pendentes de decisão;
- localizar a próxima fase incompleta;
- declarar a evidência que será produzida;
- não iniciar feature nova durante o diagnóstico.

Ao tomar decisão importante:

- registrar em `M0_9_AUDITORIA_OPERACIONAL.md`;
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

## Limites da automação atual

A tranche 3 aprovou seis larguras, zoom CSS equivalente, movimento reduzido, rede, recuperação, sessão prolongada e corpus por engine. Isso não equivale a validação com zoom real, leitor de tela, tecnologia assistiva ou dispositivo físico; essas etapas devem continuar explicitamente pendentes até serem executadas de verdade.

Gate 14 permanece apenas proposto e suspenso. Documentação é parte do produto; um lote sem memória e evidência final não está concluído.
