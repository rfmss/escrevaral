# M0.9 — Auditoria operacional viva

Atualizado em: 2026-07-29

## Função deste documento

Este arquivo é a memória operacional executável do milestone **M0.9 — Candidata Integrada do Escrevaral**.

Ele existe para que qualquer pessoa, IA ou plataforma consiga:

- retomar a auditoria sem depender de histórico de conversa;
- saber qual é a linha de base validada;
- executar as mesmas jornadas e critérios;
- registrar decisões importantes no momento em que forem tomadas;
- manter notas, severidades, evidências e veredito sincronizados;
- impedir que uma nova feature seja iniciada antes de uma visão integrada do produto.

Este documento deve ser atualizado sempre que houver:

- mudança de escopo;
- decisão de produto ou arquitetura;
- novo P0, P1 ou P2;
- alteração de severidade;
- correção aceita durante a auditoria;
- nova evidência de CI ou smoke público;
- mudança de nota ou veredito;
- decisão sobre beta, lançamento público ou substituição do produto antigo.

## Estado executivo

- branch: `experiment/mass-notes-tiptap`;
- PR: `#155`, aberto e em rascunho;
- preview: `preview-mass-notes-tiptap`;
- milestone: **M0.9 — Candidata Integrada do Escrevaral**;
- estado do milestone: **em execução**;
- último gate funcional: Gate 13 — importação auditável do `.esc` legado;
- matriz funcional anterior ao M0.9: 111 cenários por navegador, 222 execuções;
- veredito atual: **não emitido**;
- próxima ação obrigatória: fechar a linha de base documental do Gate 13 e executar a matriz transversal.

## Pergunta central

> O Mass Notes Next já pode ser usado de forma recorrente, segura, compreensível e prazerosa por uma pessoa que escreve em português brasileiro?

A auditoria deve responder separadamente:

1. está pronto para beta fechada?
2. está pronto para lançamento público?
3. está pronto para substituir o Escrevaral antigo?

## Regras imutáveis durante o milestone

1. Auditar antes de corrigir.
2. Não adicionar feature nova durante o diagnóstico.
3. Não editar `preview-mass-notes-tiptap` diretamente.
4. Não promover para `main`.
5. Manter o PR `#155` em rascunho.
6. Não enfraquecer testes para obter verde.
7. Diferenciar defeito real, contrato antigo de teste, instabilidade temporal, limitação conhecida e item fora do escopo.
8. Correção durante a auditoria só é permitida quando um P0 impede continuidade ou quando o defeito bloqueia a própria medição.
9. Toda correção deve ser mínima, documentada e seguida pela matriz completa.
10. Nenhum texto autoral pode sair em requisição de rede.
11. Não declarar engine integrada apenas pela existência de arquivo; exigir entrada real, saída observável e teste de borda.
12. O milestone só termina com evidência na cabeça exata, sem commit posterior.

## Linha de base obrigatória

Antes da auditoria transversal:

- conferir cabeça da branch e do PR;
- confirmar PR aberto, mesclável, não incorporado e em rascunho;
- conferir workflows associados à cabeça;
- ler README, índice operacional, PLAN, MEMORY, CHANGELOG, log mais recente e contratos globais;
- localizar inconsistências entre código, documentação, PR e CI;
- fechar formalmente o Gate 13 em changelog, log técnico, contrato global e corpo do PR;
- repetir CI na cabeça documental exata.

## Fases da auditoria

### Fase 1 — jornadas integradas

Cobrir primeira visita, criação, escrita, edição longa, troca entre páginas, organização, fechamento e retorno, autosave, recuperação e conflitos entre abas.

### Fase 2 — engines

Auditar Revisão, Sintaxe/Morfologia, Pontuação, Espelho de Voz, Termos que pedem contexto, RimaLab e Palavras/Léxico isoladamente e em combinação.

Corpora obrigatórios:

- prosa curta e longa;
- poema livre e regular;
- diálogo;
- listas, títulos e citações;
- regionalismos;
- acentos, emoji, travessões e aspas curvas;
- fragmentos repetidos;
- parágrafos vazios;
- texto ambíguo e insuficiente;
- documento com pelo menos 20 mil caracteres.

### Fase 3 — portabilidade e preservação

Auditar TXT, Markdown, HTML, cópia nativa e `.esc` legado, incluindo arquivos inválidos, versões futuras, duplicidade, Unicode, cancelamento, atomicidade e ausência de sobrescrita.

### Fase 4 — UIX e design

Auditar compreensão, hierarquia, densidade, linguagem, feedback, estados vazios, erros, previsibilidade, modo claro/noite, Anatomia e retorno ao editor.

Larguras mínimas: 320, 390, 768, 1024, 1280 e 1440 px.

### Fase 5 — acessibilidade

Auditar teclado, foco, Escape, retorno de foco, nomes acessíveis, tabs, regiões, status, alertas, contraste, zoom de 200%, movimento reduzido e independência de cor.

### Fase 6 — privacidade e rede

Observar requisições durante escrita, autosave, todas as engines, exportação, cópia e importação. Conteúdo autoral não pode sair da aplicação.

### Fase 7 — desempenho e resistência

Auditar documentos de 20 mil e 100 mil caracteres, biblioteca com 100 páginas, alternância rápida, engines repetidas, múltiplas abas, lote legado grande e uso prolongado.

### Fase 8 — release

Auditar branch, PR, isolamento da preview, hashes, cache, smoke público, coerência, Argila, `main`, service worker público e ausência de edição direta na branch publicada.

## Matriz transversal mínima

A suíte M0.9 deve incluir cenários que atravessem vários gates na mesma sessão:

1. primeira visita → escrita → metadados → autosave → recarga;
2. edição rica → Revisão → mudança editorial → preservação das marcas;
3. seleção lexical → troca de aba → retorno → seleção preservada;
4. documento longo → Voz → Contexto → RimaLab → ausência de mutação;
5. busca e filtros → página ativa fora do recorte → rascunho preservado;
6. conflito entre abas envolvendo manuscrito e metadados;
7. exportação depois de alteração ainda não persistida;
8. cópia nativa e restauração na mesma sessão;
9. importação `.esc` com prévia, cancelamento e confirmação;
10. mobile completo com drawers, foco, teclado e ausência de overflow;
11. interceptação de rede durante engines;
12. biblioteca extensa e documento de 100 mil caracteres.

## Regra de severidade

- **P0:** perda/corrupção de dados, exposição de manuscrito, aplicação inutilizável ou sobrescrita silenciosa.
- **P1:** fluxo principal quebrado, engine enganosa, acessibilidade bloqueadora ou falha recorrente sem alternativa segura.
- **P2:** defeito relevante com alternativa, inconsistência de UX ou paridade importante ausente.
- **P3:** acabamento, clareza ou melhoria não bloqueadora.

## Placar vivo

Use `—` enquanto não houver evidência suficiente.

| Área | Nota | Estado | Evidência principal |
|---|---:|---|---|
| Editor e preservação | — | não auditado transversalmente | — |
| Biblioteca | — | não auditado transversalmente | — |
| Engines | — | não auditado transversalmente | — |
| UIX | — | não auditado transversalmente | — |
| Acessibilidade | — | não auditado transversalmente | — |
| Responsividade | — | não auditado transversalmente | — |
| Importação e exportação | — | não auditado transversalmente | — |
| Privacidade | — | não auditado transversalmente | — |
| Desempenho | — | não auditado transversalmente | — |
| Release | — | não auditado transversalmente | — |
| **Geral** | **—** | **em execução** | — |

## Registro de decisões

Cada decisão permanente deve ser acrescentada sem apagar as anteriores.

| Data | ID | Decisão | Razão | Impacto |
|---|---|---|---|---|
| 2026-07-29 | M09-D001 | Executar M0.9 antes do Gate 14. | O produto atingiu massa crítica e precisa de visão integrada antes de nova feature. | Gate 14 fica suspenso até o veredito. |
| 2026-07-29 | M09-D002 | A auditoria é memória operacional viva. | Decisões e achados não podem depender da conversa. | Este arquivo passa a ser leitura obrigatória. |
| 2026-07-29 | M09-D003 | Preservar o PR como rascunho e `main` intacta. | O milestone mede prontidão, não autoriza promoção. | Nenhum merge ou release durante a auditoria. |
| 2026-07-29 | M09-D004 | Avaliar beta, lançamento e substituição separadamente. | Esses objetivos possuem riscos e exigências diferentes. | O veredito final terá três respostas independentes. |

## Registro de achados

Não registrar suposição como achado. Todo item precisa de reprodução ou evidência.

| ID | Severidade | Área | Estado | Resumo | Evidência | Decisão |
|---|---|---|---|---|---|---|
| — | — | — | nenhum achado registrado | — | — | — |

Estados permitidos: `aberto`, `mitigado`, `aceito`, `corrigido`, `não reproduzido`, `fora do escopo`.

## Registro de evidências

| Data | Cabeça | Evidência | Resultado |
|---|---|---|---|
| 2026-07-29 | `323e8a1e131a3692932e960e9285570df49a1460` | Gate 13 funcional, 222/222, preview, Argila e coerência | verde funcional; documentação ainda precisava fechamento |

## Paridade com o Escrevaral antigo

A classificação deve usar uma destas categorias:

- preservada integralmente;
- preservada parcialmente;
- presente apenas como capacidade interna;
- ausente;
- deliberadamente excluída;
- exige novo gate.

| Área antiga | Estado no produto novo | Evidência | Lacuna |
|---|---|---|---|
| Análise Geral | em auditoria | adaptador de Revisão | medir cobertura real |
| Sintaxe/Morfologia | em auditoria | carregada pela Revisão e Palavras | medir superfície e bordas |
| Pontuação | em auditoria | Revisão inline | medir posições e repetição |
| Espelho de Voz | em auditoria | adapter dedicado | medir textos curtos/longos |
| RimaLab | em auditoria | adapter dedicado | medir prosa/verso |
| Léxico | em auditoria | Palavras/Léxico | medir verbetes e contexto |
| Sinônimos | em auditoria | base legada disponível | confirmar exposição atual |
| Decolonial | em auditoria | Termos que pedem contexto | medir linguagem e ocorrências |
| Exportação | parcial conhecida | TXT/MD/HTML | faltam DOCX/RTF/ePub/Obsidian |
| Prova de Autoria | ausente conhecida | nenhuma superfície atual | exige decisão de milestone posterior |
| PWA/offline | ausente na aplicação nova | sem service worker próprio | lacuna de lançamento, não do editor |

## Entregáveis finais

- `docs/audits/M0_9_AUDITORIA_GERAL.md`;
- `docs/audits/M0_9_AUDITORIA_GERAL.json`;
- suíte transversal Playwright;
- log técnico datado;
- contrato global em `docs/product/`;
- README, PLAN, MEMORY e CHANGELOG atualizados;
- corpo do PR atualizado;
- cabeça final validada sem commit posterior.

## Critério de encerramento

O milestone só encerra quando:

- Gate 13 estiver documentalmente fechado;
- não houver P0 aberto;
- todo P1 possuir decisão explícita;
- matriz completa estiver verde em Chromium e Firefox;
- workflows globais estiverem verdes;
- preview pública responder;
- notas e veredito estiverem registrados;
- a documentação apontar para a cabeça exata validada;
- não houver commit posterior à evidência;
- PR continuar em rascunho e não incorporado.

## Protocolo de atualização

Ao iniciar uma sessão:

1. ler este documento;
2. conferir PR, cabeça e workflows;
3. localizar a próxima fase incompleta;
4. revisar P0/P1 abertos;
5. declarar qual evidência será produzida.

Ao tomar uma decisão:

1. acrescentar linha em `Registro de decisões`;
2. atualizar placar ou paridade quando aplicável;
3. atualizar PLAN/MEMORY se a decisão for permanente;
4. registrar commit e evidência.

Ao encerrar uma sessão:

1. registrar o que foi realmente executado;
2. não marcar como concluído o que ficou apenas planejado;
3. atualizar a próxima ação obrigatória;
4. manter limitações e incertezas explícitas.
