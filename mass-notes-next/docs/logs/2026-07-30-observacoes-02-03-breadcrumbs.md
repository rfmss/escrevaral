# OBS-02/03 — Breadcrumbs de implementação e estabilização

Data: 2026-07-30  
PR: `#155`, rascunho  
Branch: `experiment/mass-notes-tiptap`

Este registro é aditivo. Ele não apaga tentativas rejeitadas nem antecipa o veredito final.

## B0 — Base protegida

- base anterior: `30dc77ea63afdb3731732d7469c040997c58de72`;
- matriz anterior: 324/324;
- preview, cache, smoke, Argila e coerência verdes;
- nenhum trabalho iniciado antes da abertura CLARO em `2026-07-30-observacoes-02-03-densidade-e-leitura-verbal.md`.

## B1 — Primeira candidata integrada

Cabeça: `ef21a4ec8957f52f3159581f1d0ffba15f49757f`  
Mass Notes: `30548850145`  
Job: `90892027111`

Entregas presentes nessa candidata:

- toolbar visualmente compactada, sem remoção de ações;
- nomes acessíveis históricos preservados;
- painel da sessão com palavras, meta, foco e salvamento;
- meta em `localStorage`, fora do JSON autoral;
- timer local de 25 minutos;
- suplemento verbal curado para `varre-lo-ei`/`varrê-lo-ei`;
- contato do desenvolvedor, contato da marca e canais verificados;
- sete cenários novos por navegador.

Resultado:

- auditoria lexical, TypeScript e build: aprovados;
- Argila e coerência: aprovadas;
- matriz: 338 execuções iniciadas, 272 aprovadas e 66 falhas;
- publicação, cache e smoke: bloqueados corretamente.

### Causa ampla das falhas

A contagem de palavras usava o elemento HTML `<output>`. Esse elemento expõe papel ARIA implícito de `status`. Como vários gates históricos consultam o status ativo das engines com `getByRole('status')`, a contagem passou a ser um segundo status global e tornou os seletores ambíguos.

Classificação: **regressão de contrato acessível introduzida pela nova interface**, não falha das engines.

Correção:

- `<output>` substituído por `<span data-writing-word-count>`;
- a contagem continua visível e atualizada;
- deixa de anunciar cada tecla como mensagem de status global;
- nenhum teste histórico foi reescrito para contornar o problema.

Commit: `09c2ebc3006a3b219bbb2ec6cb1ed73fe181998c`.

### Fronteiras adicionais da banca

1. A prova de uma linha arredondava posições verticais e interpretava uma diferença subpixel como segunda linha.
2. A comparação literal de `innerText` não considerava os espaçadores visuais inseridos pela paginação entre blocos.
3. Uma regra móvel legada escondia genericamente o segundo e o terceiro `.reg-field`, atingindo Meta e Foco.
4. O seletor `Iniciar foco` também encontrava `Reiniciar foco` por correspondência parcial.

Correções sem redução de critério:

- medir dispersão vertical dos controles, com tolerância de 2 px;
- normalizar espaços somente na preparação do corpus longo;
- alinhar os grupos da toolbar ao centro;
- reexibir explicitamente os campos do dashboard no breakpoint móvel;
- exigir nomes exatos nos botões do timer.

Commits:

- `a3ea8f349153c9bb658154fe2ed319beacdeaa7d`;
- `e333cae40baaab295a0bcc6110c816b67d19af82`.

## B2 — Segunda candidata

Cabeça após as correções acima: será validada pela mesma matriz completa.  
Status: **em execução; nenhuma promoção autorizada**.

## Guardrails mantidos

- nenhuma alteração em `lexical-engine.js` ou bases linguísticas;
- nenhuma preferência de interface no JSON do manuscrito;
- nenhuma rede adicionada ao timer, meta ou contagem;
- nenhuma ação da toolbar removida;
- nenhum retry, aumento global de timeout ou exclusão de teste;
- PR continua rascunho;
- `main` e Gate 14 permanecem intocados.
