# M0.9 — Auditoria não funcional, tranche 3

Data: 2026-07-29

## Objetivo

Ampliar a auditoria integrada sem iniciar feature nova, cobrindo responsividade transversal, zoom equivalente, movimento reduzido, rede, recuperação emergencial, sessão prolongada e corpus separado por engine.

## Escopo automatizado

A suíte `tests/m0-9-nonfunctional.spec.ts` adiciona sete cenários por navegador:

1. seis larguras: 320, 390, 768, 1024, 1280 e 1440 px;
2. layout CSS equivalente a uma janela 1280×900 em zoom de 200%;
3. preferência `prefers-reduced-motion: reduce` e navegação editorial curta;
4. observação de toda requisição durante escrita, cinco engines e Anatomia;
5. retomada pelo envelope de recuperação emergencial;
6. doze ciclos consecutivos de edição e salvamento, com DOM, heap e latência observados;
7. corpus separado para Revisão, Espelho de Voz, Contexto, RimaLab e Palavras/Léxico.

A matriz passou de 119 para 126 cenários por navegador, totalizando 252 execuções.

## Resultados aprovados

### Responsividade e UIX

- nenhuma das seis larguras criou overflow horizontal bloqueador;
- título, papel e editor permaneceram dentro do viewport;
- em larguras móveis, Arquivo e Ferramentas permaneceram visíveis, separados e abríveis;
- em larguras maiores, sidebar e rail permaneceram presentes;
- screenshots foram produzidos para cada largura e navegador.

### Zoom equivalente e movimento reduzido

- o layout de 640×450 CSS, equivalente a 1280×900 em 200%, manteve título, editor e drawers alcançáveis;
- a preferência de movimento reduzido foi reconhecida pelos dois navegadores;
- a transição para a Anatomia ficou em até 300 ms e a ida/volta não prendeu a cortina.

Limite: viewport CSS equivalente não substitui validação manual com zoom real do navegador, leitor de tela ou dispositivo físico.

### Rede e privacidade

- a frase sentinela autoral não apareceu em URL nem corpo de requisição;
- nenhuma origem externa inesperada foi observada;
- foi observada uma requisição GET conhecida para:
  - `https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js`;
- a requisição não continha texto autoral.

Decisão: registrar `M09-F006` como P2. A dependência externa da Anatomia reforça o bloqueio de PWA/offline e lançamento público; deve ser vendorizada ou removida do caminho crítico antes de uma promessa offline. Não bloqueia por si só uma beta fechada explicitamente online.

### Recuperação emergencial

- um rascunho mais novo no envelope emergencial retomou o mesmo documento;
- título e texto recuperados reapareceram;
- o documento convergiu para `Salvo`;
- a revisão avançou;
- nenhuma página duplicada foi criada;
- o envelope temporário foi limpo após persistência.

### Sessão prolongada

Após doze ciclos consecutivos:

- nenhuma exceção de página foi observada;
- a quantidade de documentos permaneceu estável;
- o DOM permaneceu em 179 nós no início e no fim;
- Chromium: p95 de salvamento observado em 192 ms, heap 16.100.000 bytes no início e no fim;
- Firefox: p95 de salvamento observado em 90 ms; a API de heap não estava disponível;
- o teste usa limites defensivos de 8 s, 120 nós adicionais e 64 MiB de crescimento quando a medição existe.

Esses números são evidência de regressão em CI, não orçamento universal de desempenho nem benchmark de dispositivo real.

### Corpus por engine

- Revisão recebeu paste estruturado e localizou `PONT-49` pelo contrato UTF-16 real;
- Espelho de Voz gerou leitura para corpus próprio;
- Contexto encontrou termos em corpus próprio;
- RimaLab produziu leitura sonora própria;
- Palavras/Léxico consultou `melancolia`;
- o snapshot semântico do editor permaneceu idêntico antes e depois de cada engine.

## Estabilizações de medição

As execuções intermediárias foram bloqueadas e diagnosticadas antes da repetição completa:

1. o drawer real se chama `Arquivo de documentos`, não `Arquivo de páginas`;
2. a auditoria de rede revelou a dependência externa real do `unpkg`, registrada como achado em vez de ser ocultada;
3. o overlay de movimento reduzido é transitório e passou a ter duração capturada por observador instalado antes do clique;
4. `innerText` do Chromium inclui linhas visuais que não pertencem ao snapshot semântico; o corpus passou a usar paste estruturado e o contrato ProseMirror real;
5. nenhuma alteração funcional de produto foi feita para obter verde.

## Evidência funcional final

Cabeça: `305d0727ddfaee11f3e7680d0f9168023e9a4284`.

- Mass Notes Tiptap `30478738806`: build, Chromium, Firefox, 252/252, publicação, cache e smoke público verdes;
- Candidata a lançamento Argila `30478738678`: verde;
- Coerência de versões `30478738607`: verde;
- artefato: `mass-notes-tiptap-30478738806`.

## Estado após a tranche

- P0 abertos: 0;
- P1 abertos: 0;
- novo P2: dependência externa da Anatomia;
- nota geral provisória recomendada: 88/100;
- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`;
- M0.9 continua aberto para validação manual real e fechamento documental exato;
- Gate 14 permanece suspenso;
- PR #155 permanece em rascunho;
- `main` e aplicação pública permanecem intactos.
