# M0.9 — auditoria integrada, tranche 2

Data: 2026-07-29

## Objetivo

Ampliar a auditoria transversal para os riscos de maior impacto ainda não cobertos na primeira tranche:

- conflito real envolvendo manuscrito e metadados;
- exportação do rascunho atual antes da persistência convergir;
- cópia nativa, restauração e importação legada na mesma sessão.

## Matriz

A suíte `tests/m0-9-integrated.spec.ts` passou de cinco para oito cenários por navegador.

Matriz total:

- 119 cenários por navegador;
- 238 execuções;
- Chromium e Firefox.

## Cenário 6 — conflito misto real

Duas páginas abriram o mesmo documento.

- uma página alterou o título, representando mutação de manuscrito;
- a outra marcou o documento como favorito, representando mutação editorial;
- a gravação remota abriu conflito explícito;
- a mensagem informou que nenhuma versão seria apagada silenciosamente;
- a versão local foi guardada como cópia;
- o IndexedDB manteve o documento remoto e a cópia local favorita.

Contrato comprovado:

- nenhuma sobrescrita silenciosa;
- nenhuma versão perdida;
- metadados locais preservados na cópia;
- identidade nova para a cópia.

### Observação de preferência compartilhada

A chave de documento ativo em `localStorage` é compartilhada entre abas. Ao guardar um conflito como cópia, essa chave passa a apontar para a cópia. Portanto, recarregar outra aba pode abrir a cópia, embora a aba ainda aberta continue mostrando sua versão atual e os dois registros permaneçam preservados.

Classificação:

- P3 de previsibilidade entre abas;
- não é perda de dados;
- não viola o contrato atual;
- deve ser reavaliado antes de prometer sessões independentes por aba.

## Cenário 7 — exportação do rascunho atual

O documento foi salvo em uma versão anterior. Em seguida:

- título e texto foram alterados;
- o estado permaneceu `Alterado|Salvando`;
- Markdown foi exportado antes da convergência do autosave;
- o arquivo baixado continha o título e texto atuais;
- a persistência convergiu depois para `Salvo`.

Contrato comprovado:

- exportação usa o estado React/Tiptap atual;
- não depende de reler uma cópia antiga do IndexedDB;
- conteúdo recém-editado não é omitido do arquivo.

## Cenário 8 — portabilidade combinada

Na mesma sessão:

1. a biblioteca atual foi exportada como cópia nativa;
2. o mesmo envelope foi restaurado como novas cópias;
3. a página ativa permaneceu aberta;
4. um `.esc` legado válido foi selecionado e pré-visualizado;
5. o primeiro plano foi cancelado sem escrita;
6. o arquivo foi selecionado novamente e confirmado;
7. o documento legado recebeu UUID novo, sufixo `— importado` e `legacySourceId` preservado;
8. nenhum documento existente foi substituído.

Contrato comprovado:

- cópia nativa e importação legada coexistem sem misturar parsers;
- cancelar continua sem efeito;
- restauração e importação não trocam a página ativa;
- contagem da biblioteca é previsível;
- origem legada permanece auditável.

## Incidentes de estabilização

### Exportação

Uma execução documental anterior falhou porque `seedStructuredDocument` fazia um `Ctrl+S` preliminar redundante antes de colar o conteúdo rico que realmente seria exportado.

Decisão:

- remover o salvamento preliminar;
- depois do paste, observar qualquer estado válido `Alterado|Salvando|Salvo`;
- exigir convergência final exata para `Salvo`;
- produto não alterado.

### Conflito

A primeira execução da tranche 2 ficou em 236/238 porque o teste recarregava a primeira aba e exigia que ela reabrisse a versão remota. A preferência ativa compartilhada já apontava para a cópia criada pela segunda aba.

Decisão:

- testar o contrato crítico de preservação dos dois registros;
- não inventar independência persistida de seleção por aba;
- registrar a preferência compartilhada como P3;
- produto não alterado.

### RimaLab

Uma repetição ficou em 237/238: o cenário de falha simulada acionava a primeira leitura enquanto a atualização do documento ainda podia estar em trânsito no Firefox.

Decisão:

- estabilizar o documento antes da primeira leitura nesse cenário;
- manter separado o contrato testado: a exceção simulada não quebra editor ou outras ferramentas;
- produto não alterado.

## Evidência funcional final da tranche

Cabeça: `2a4333337a04b73a6c034b8fd35bc582994a114b`.

- Mass Notes `30467582850`: build, Chromium, Firefox, 238/238, publicação, cache e smoke público verdes;
- Argila `30467583011`: verde;
- coerência `30467584508`: verde;
- artefato: `mass-notes-tiptap-30467582850`.

## Achados após a tranche

P0: nenhum.

P1: nenhum.

P2 permanecem:

- M09-F001 — ausência de PWA/offline próprio;
- M09-F002 — Prova de Autoria ausente;
- M09-F003 — paridade de exportação avançada incompleta.

P3:

- M09-F004 — preferências da biblioteca não persistem;
- M09-F005 — preferência de documento ativo é compartilhada entre abas.

## Efeito no placar provisório

Evidências adicionais justificam:

- editor e preservação: 92 → 94;
- importação e exportação: 83 → 88;
- geral: 85 → 87.

As notas de UIX, acessibilidade, privacidade completa, desempenho medido e release não sobem sem as fases correspondentes.

## Veredito provisório

- beta fechada: `SHIP COM CONDIÇÕES`, com confiança maior;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`.

O milestone continua aberto para auditoria manual, corpus ampliado, tecnologias assistivas/dispositivos reais, rede completa, desempenho medido e decisões explícitas sobre P2.
