# Estabilização — fila de salvamento e conflitos entre abas

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado: **correção mínima aplicada e regressões específicas verdes; matriz oficial pendente**

## C — Cenário observado

A deduplicação lexical de `quica` passou em auditoria, build e testes próprios. Duas execuções integrais consecutivas falharam fora do léxico:

1. workflow `30723668283`: Firefox não recebeu o alerta esperado no cenário misto entre manuscrito e metadados;
2. workflow `30724005784`: o mesmo cenário voltou a falhar em Firefox e o teste de troca de documento entrou em `Conflito` na própria aba ao tentar salvar.

A segunda execução terminou em `352/354`:

- `gate7-review-decorations.spec.ts`: Chromium aguardava `Salvo`, mas a captura mostrou `Conflito` e o banner “Outra aba também alterou esta página” em um teste com uma única página;
- `m0-9-integrated.spec.ts`: Firefox terminou com título e favorito combinados e estado `Salvo`, sem produzir conflito entre as duas versões locais.

Evidência do artefato `8825821657`, digest `sha256:f35684e3523b981597e44c7a3f7f733cf6383927e02bdbb0f29d846df742b9ee`.

## L — Limite e impacto

O problema não pertence à engine lexical.

A leitura do código mostrou duas fronteiras distintas:

### Corrida da própria aba

`persistDraft()` não possuía trava ou fila. O autosave de 650 ms e `Ctrl+S` podiam iniciar duas gravações com a mesma revisão. Uma vencia; a outra recebia `DocumentConflictError` contra a gravação da própria aba e exibia um falso conflito externo.

Além disso, a conclusão de uma gravação substituía o draft por `saved` e limpava `dirty` sem verificar se houve nova edição durante a operação. Em uma gravação suficientemente lenta, uma edição posterior podia perder seu estado de pendência.

### Cenário misto não determinístico

O teste alterava primeiro o título e só depois abria a aba Pulso para alterar o favorito. Em execução lenta, o autosave do título podia terminar antes da alteração de metadado. Nesse caso não existiam duas versões concorrentes: a segunda aba recebia o título remoto limpo, alterava o favorito e salvava uma versão combinada. O teste esperava conflito, mas não criava a concorrência de forma determinística.

## A — Arquitetura aplicada

Cabeça funcional: `a90f7a11151b962d183f74e4ee32dbccacd1913f`.

A menor correção coerente foi aplicada:

1. chamadas de `persistDraft()` são serializadas por aba;
2. pedidos de salvamento durante uma gravação são coalescidos;
3. cada edição incrementa uma série de mutação local;
4. edição ocorrida durante gravação é rebaseada sobre a nova revisão e salva na sequência;
5. uma gravação antiga não limpa `dirty` de uma edição posterior;
6. `conflictRef` torna o bloqueio de novas gravações síncrono, sem esperar novo render React;
7. BroadcastChannel, IndexedDB, esquema e política de conflito foram preservados;
8. o cenário misto prepara a aba Pulso antes das duas mutações, tornando a concorrência determinística;
9. nova regressão dispara salvamentos sobrepostos e exige preservação da edição posterior após recarga.

Não foram usados:

- aumento de timeout;
- retry no Playwright;
- redução da matriz;
- alteração em engines linguísticas;
- mudança de esquema do IndexedDB;
- merge ou Gate 14.

## R — Resultado específico

Executor efêmero: `30724776606` — verde.

O harness executou seis contratos em Chromium e Firefox:

- fila de salvamento sem conflito contra a própria aba;
- preservação de edição posterior à primeira gravação;
- conflito misto real entre manuscrito e metadados;
- troca de documento sem transportar decorations ou navegação.

Resultado: **6/6**.

Também ficaram verdes no executor:

- aplicação exata do patch;
- TypeScript e build Vite do harness;
- remoção do workflow e do script temporários;
- commit atômico contendo apenas `App.tsx`, o ajuste do cenário misto e a regressão da fila.

Os workflows disparados pelo push do `GITHUB_TOKEN` aparecem como `action_required`, comportamento esperado do GitHub para impedir recursão automática. Este registro documental é o commit humano que reabre a validação oficial completa.

## O — O que permanece aberto

- build e matriz oficial da cabeça documental final;
- Argila, coerência, publicação, cache da preview e smoke público;
- o lote não cria sincronização ou colaboração;
- BroadcastChannel continua sendo apenas aviso entre abas do mesmo navegador;
- não há merge automático de conteúdo;
- conflitos reais continuam exigindo decisão autoral;
- o fechamento integrado da deduplicação lexical depende do verde oficial.

## Decisão

`PROSSEGUIR COM CONDIÇÕES`.

A correção funcional passou na banca específica. O fechamento e a publicação permanecem pausados até a matriz oficial integral da cabeça documental ficar verde.
