# Fila operacional — nova casa do Escrevaral

- Registrada em: 2026-08-16
- Branch: `feat/escrevaral-paper-home`
- Base: `experiment/mass-notes-tiptap`
- Regra: **nenhuma superfície pode parecer funcional sem ter destino real**.

## Objetivo desta fila

Manter o trabalho da nova casa ordenado sem transformar lacunas do mockup em funcionalidades inventadas. Cada item deve estar em um destes estados:

- **RESOLVER AGORA** — já existe domínio/infraestrutura real e falta apenas expor corretamente na casa;
- **FILA PRONTA** — existe base suficiente, mas merece tranche própria e teste de aceitação;
- **BLOQUEADO POR MODELO** — o produto ainda não possui a entidade, persistência ou engine necessária;
- **DÍVIDA TÉCNICA** — não muda o domínio autoral, mas precisa ser fechada antes de considerar a casa estabilizada.

## Tranche atual — passada de integridade

### Resolvido agora

1. **Modo**
   - `Escrita` é o único modo real atual.
   - O controle deixa de sugerir um menu inexistente e passa a ser estático.

2. **Projeto atual**
   - Não existe entidade `Project` no domínio atual.
   - O texto fictício `ROMANCE DE FICÇÃO` e o botão morto de abrir projeto deixam de representar capacidade inexistente.
   - A superfície passa a se assumir como **Biblioteca local / Documentos locais**, usando somente a contagem real agregada dos documentos.

3. **Pesquisa lateral**
   - As pastas e contagens fictícias de Personagens/Locações/Referências/Inspiração/Lixeira são removidas da experiência efetiva.
   - A área lateral passa a apontar somente para a **revisão local real**, já exposta pelo botão Pesquisa.

4. **Caixa rápida**
   - Não existe domínio de notas/attachments/drop persistente.
   - A dropzone cenográfica deixa de ser exibida até existir uma implementação real.

5. **Distribuição**
   - Os percentuais `18 / 41 / 41` não provinham de engine nem de estado documental.
   - A seção fica oculta até haver classificador aprovado para diálogo/descrição/narração.

6. **Tags vazias**
   - Os marcadores de exemplo `mistério / retorno / cidade / passado / segredos` não são dados do documento.
   - Documento sem tags passa a mostrar estado vazio honesto.
   - Tags reais continuam vindo de `draft.tags` e os chips passam a abrir o editor real de tags.

7. **Versões**
   - `revision` é contador técnico de concorrência/autosave; não é histórico de versões recuperável.
   - A casa deixa de chamar esse contador de versão semântica e passa a exibir **Estado local / rev. N**.
   - `Ver todas` fica indisponível até existir histórico persistido.

8. **Foco**
   - Não existe cronômetro de 60 minutos.
   - O rodapé deixa de mostrar `60 min` e passa a refletir somente o estado real `Pronto / Ativo`.

9. **Idioma**
   - O produto é `Português (BR)` por doutrina atual.
   - O seletor cenográfico fica removido; o locale continua visível como estado estático.

10. **Fonte e tamanho**
    - O editor ainda não possui contrato de persistência para família/tamanho tipográfico por trecho/documento.
    - Os controles visuais deixam de aceitar clique até essa capacidade existir.
    - Negrito, itálico, sublinhado e listas continuam reais e ativos.

11. **Recolher análise**
    - Esse controle pode ser resolvido sem domínio novo.
    - Passa a recolher/expandir de fato o rail de análise e ceder largura ao manuscrito.

## FILA PRONTA — próxima ordem lógica

### A1 — Estado editorial canônico

**Base já existente:** `DocumentStatus`, `favorite`, `DocumentMetadataEditor`, autosave e conflito.

Objetivo:
- expor `Rascunho / Em corte / Pronto` na casa canônica;
- expor favorito sem abrir o rail legado;
- preservar uma única fonte: `draft.status` e `draft.favorite`.

Aceitação:
- alteração imediata na casa;
- autosave real;
- reload preserva;
- conflito entre abas continua protegido.

### A2 — Espelho de Voz na análise canônica

**Base já existente:** `src/engines/voiceAdapter.ts`, leitura local, métricas e confiança.

Objetivo:
- oferecer ação explícita de leitura, nunca análise automática a cada tecla;
- preencher somente campos realmente suportados pela leitura;
- manter disclaimer e confiança;
- não converter hipótese heurística em diagnóstico autoral.

Aceitação:
- texto vazio não inventa resultado;
- texto vivo do Tiptap é usado;
- nenhuma chamada de rede;
- troca de documento invalida leitura anterior.

### A3 — Busca/biblioteca canônica com query real

**Base já existente:** `library/libraryQuery.ts` com busca, status, favoritos, tags e ordenação.

Objetivo:
- parar de manter uma segunda filtragem simplificada na casca;
- reutilizar `queryLibraryDocuments` e `collectLibraryTags` onde fizer sentido;
- evitar divergência entre biblioteca real e rail canônico.

Aceitação:
- busca por título, texto, tag e status coerente;
- ordenação determinística pt-BR;
- nenhuma duplicação de regra de normalização.

## BLOQUEADO POR MODELO — não implementar cenograficamente

### B1 — Notas / Caixa rápida

Falta:
- entidade de nota;
- relação nota ↔ documento/projeto;
- persistência;
- política para texto, imagem e arquivo;
- recuperação/conflito/exportação.

Até isso existir, **Notas não deve fingir ser um caderno paralelo**.

### B2 — Projetos

Falta:
- entidade `Project`;
- membership documento ↔ projeto;
- nome, metadados, criação/seleção;
- migração dos documentos atuais.

Até isso existir, a casa trabalha como biblioteca local de documentos.

### B3 — Biblioteca de pesquisa documental

Falta:
- entidades para personagem, locação, referência, inspiração e anexos;
- persistência e busca;
- relação com documentos/projetos;
- importação/remoção.

A revisão linguística local **não deve ser confundida** com essa futura biblioteca de pesquisa.

### B4 — Histórico real de versões

Estado atual:
- IndexedDB guarda apenas o documento corrente;
- `saveDocument` sobrescreve o registro e incrementa `revision`;
- o live snapshot é memória transitória, não arquivo histórico.

Para `Ver todas` existir corretamente será necessário, no mínimo:
- schema IndexedDB v2 ou store separado de snapshots;
- política de captura/compactação/retenção;
- restauração sem destruir a versão atual;
- tratamento de conflito e migração;
- testes de espaço e recuperação.

### B5 — Distribuição narrativa

Falta engine aprovada para classificar diálogo / descrição / narração. Não usar regex simples como verdade editorial.

### B6 — Fonte, tamanho, alinhamento e task list completos

Falta definir:
- extensões Tiptap correspondentes;
- atributos serializáveis no JSON;
- comportamento de paste/import/export;
- compatibilidade com documentos existentes.

Alinhamentos e lista de tarefas permanecem explicitamente desabilitados até essa tranche.

### B7 — Seletor de modo

Hoje existe um único modo real: Escrita. Um seletor só deve voltar quando houver pelo menos dois modos com contrato claro.

### B8 — Seletor de idioma

Locale de produto atual: `pt-BR`. Internacionalização da interface/engines é decisão separada e não deve nascer de uma seta visual.

## DÍVIDA TÉCNICA

### T1 — Tipografia e promessa offline — prioridade alta

`theme-escrevaral-reference.css` ainda importa Google Fonts em runtime. Isso conflita com a promessa de funcionamento offline.

Próxima decisão necessária:
- empacotar fontes com licença adequada no produto; **ou**
- aprovar stack local equivalente e aceitar a diferença visual.

Não encerrar estabilização offline sem resolver esse ponto.

### T2 — Bundle principal

O build atual avisa que o chunk JS principal ultrapassa 500 kB. Não é regressão funcional da casa, mas deve entrar em rodada própria de code splitting quando a superfície estiver estável.

### T3 — Bridges de transição

A nova casa usa bridges para conectar o DOM canônico à fundação existente. Isso é aceitável durante estabilização, mas depois dos circuitos consolidados deve haver auditoria para promover integrações estáveis ao React proprietário do shell e reduzir manipulação transitória de DOM.

## Frentes explicitamente fora desta fila

- **Cofre**: arquitetura linguística separada; não misturar com esta branch.
- **Poda de branches**: dívida registrada e deferida; não executar como efeito colateral.

## Regra de passagem entre itens

Um item só sai da fila quando:

1. há destino de domínio real;
2. não cria segunda fonte de dados;
3. há teste Playwright do comportamento visível;
4. build TypeScript/Vite passa;
5. contratos de Tiptap, autosave, recuperação e conflito continuam verdes;
6. preview pública e smoke fecham verdes;
7. esta memória e o PR são atualizados com head/run comprovados.
