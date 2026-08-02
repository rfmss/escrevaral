# Estabilização — fila de salvamento e conflitos entre abas

Data: 2026-08-01  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho  
Estado de entrada: **banca vermelha reproduzida; correção mínima autorizada pela evidência**

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

`persistDraft()` não possui trava ou fila. O autosave de 650 ms e `Ctrl+S` podem iniciar duas gravações com a mesma revisão. Uma vence; a outra recebe `DocumentConflictError` contra a gravação da própria aba e exibe um falso conflito externo.

Além disso, a conclusão de uma gravação substitui o draft por `saved` e limpa `dirty` sem verificar se houve nova edição durante a operação. Em uma gravação suficientemente lenta, uma edição posterior pode perder seu estado de pendência.

### Cenário misto não determinístico

O teste altera primeiro o título e só depois abre a aba Pulso para alterar o favorito. Em execução lenta, o autosave do título pode terminar antes da alteração de metadado. Nesse caso não existem duas versões concorrentes: a segunda aba recebe o título remoto limpa, altera o favorito e salva uma versão combinada. O teste espera conflito, mas não criou a concorrência de forma determinística.

## A — Arquitetura escolhida

Aplicar a menor correção coerente:

1. serializar chamadas de `persistDraft()` por aba;
2. coalescer pedidos de salvamento que chegam enquanto uma gravação está ativa;
3. registrar uma série de mutação local;
4. se houver edição durante a gravação, rebasear a revisão do draft mais recente e executar nova gravação antes de resolver a promessa;
5. nunca limpar `dirty` de uma edição posterior;
6. manter BroadcastChannel, IndexedDB, revisões e política de conflito existentes;
7. tornar o teste misto realmente concorrente, preparando a aba Pulso antes das duas mutações;
8. adicionar regressão que dispara dois `Ctrl+S` síncronos e proíbe conflito contra a própria aba.

Não fazer:

- aumentar timeout;
- adicionar retry ao Playwright;
- reduzir a matriz;
- tocar em engines linguísticas;
- alterar esquema do IndexedDB;
- fazer merge ou executar Gate 14.

## R — Resultado exigido

O lote só fecha se:

- dois pedidos simultâneos de `Ctrl+S` terminarem em `Salvo`, sem banner de conflito;
- edição feita durante gravação permanecer pendente e for salva na sequência;
- conflito real entre abas continuar preservando as duas versões;
- o cenário misto produzir conflito de forma determinística;
- os testes anteriormente vermelhos passarem em Chromium e Firefox;
- matriz integral, build, Argila e coerência ficarem verdes;
- preview só for publicada após o verde integral.

## O — O que permanece aberto

- o lote não cria sincronização ou colaboração;
- BroadcastChannel continua sendo apenas aviso entre abas do mesmo navegador;
- não há merge automático de conteúdo;
- conflitos reais continuam exigindo decisão autoral;
- a deduplicação lexical continua aguardando fechamento integrado depois desta estabilização.

## Decisão

`PROSSEGUIR COM CONDIÇÕES`.

A correção deve ficar restrita à fila de salvamento, às referências de conflito e aos testes que reproduzem as duas corridas. Nenhuma outra refatoração de `App.tsx` está autorizada.
