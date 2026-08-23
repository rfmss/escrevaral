# OBS-02/03 — Breadcrumbs de implementação e estabilização

Data: 2026-07-30  
PR: `#155`, rascunho  
Branch: `experiment/mass-notes-tiptap`

Este registro é aditivo. Ele não apaga tentativas rejeitadas nem antecipa resultado sem evidência.

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

## B2 — Segunda candidata: sticky ainda preso ao papel

Cabeça: `36a3eec735fed79b5a8fc2d3a66784b92dbb92c9`  
Mass Notes: `30550279004`  
Job: `90896886767`

Resultado:

- 335/338 aprovados;
- toolbar compacta, dashboard, suplemento verbal, contatos e móvel: aprovados;
- sticky falhou em Chromium e Firefox;
- uma espera antiga de persistência Gate 9 falhou no Firefox;
- publicação bloqueada.

Diagnóstico:

- `pagination.css` redefinia `.editor-toolbar { position: relative }` depois da folha-base;
- restabelecer apenas `top` não tornava a barra sticky;
- o problema era de produto, não da assertion.

## B3 — Terceira candidata: limite cross-browser da folha paginada

Cabeça: `92703d5b7246a45dca57cbd775b829fea44dd236`  
Mass Notes: `30551169909`  
Job: `90899912289`

Mudança:

- `position: sticky !important` foi restabelecido depois da paginação.

Resultado:

- 335/338 aprovados;
- Chromium manteve a toolbar cerca de 33 px abaixo da borda útil;
- Firefox continuou levando a toolbar com o papel por milhares de pixels;
- Gate 9 voltou a falhar, dessa vez em outro formato;
- publicação bloqueada.

Evidência visual:

- Chromium mostrou a barra ainda limitada pelo padding interno do papel;
- Firefox mostrou a barra totalmente ausente depois da rolagem.

Decisão de segurança:

- rejeitar offsets específicos por navegador;
- retirar a toolbar da fronteira paginada quando ela cruza o topo;
- preservar uma única instância React de controles e um único Tiptap.

## B4 — Quarta candidata: dock correto, listener cedo demais

Cabeça: `593e492e76cefbc90e27c39dc032f0b681d30bc2`  
Mass Notes: `30552972415`  
Job: `90906172522`

Arquitetura introduzida:

- `EditorToolbarDock` mantém a toolbar inline enquanto ela está visível;
- ao cruzar o topo, a mesma instância é renderizada por portal num dock fixo;
- a largura e posição são limitadas ao conteúdo do manuscrito;
- o slot original preserva o fluxo e evita saltos;
- drawers permanecem acima do dock.

Resultado:

- 335/338 aprovados;
- o listener não foi registrado porque procurava `.editor-viewport` antes de a ponte dinâmica adicionar essa classe;
- Gate 9 falhou pela terceira vez, agora no terceiro formato;
- publicação bloqueada.

Correção:

- o dock passou a usar `.editor-shell`, nome estrutural presente no primeiro render;
- `.editor-viewport` permanece como contrato acessível posterior;
- a transição do portal ocorre no mesmo evento de scroll.

## B5 — Persistência Gate 9 estabilizada sem tolerância maior

A repetição em Markdown, HTML e TXT mostrou que a falha não era específica de formato.

Causa do teste:

- o helper aceitava qualquer `Salvo` já visível antes da colagem;
- podia enviar `Ctrl+S` antes de o novo rascunho atingir `draftRef`;
- depois aguardava no IndexedDB um conteúdo que o atalho prematuro não havia salvado.

Correção:

- primeiro comprovar que o conteúdo chegou ao IndexedDB ou que a interface entrou em `Alterado/Salvando`;
- somente então enviar `Ctrl+S`;
- manter os mesmos limites de 20 s e 12 s;
- nenhum retry, timeout maior ou assertion removida.

Commit: `f7c2db1b0bd2add3203ccd5df9fd40098148bed5`.

## B6 — Cabeça funcional aprovada

Cabeça: `f7c2db1b0bd2add3203ccd5df9fd40098148bed5`  
Mass Notes: `30554065748`  
Job: `90909962104`

Resultado:

- auditoria lexical: aprovada;
- TypeScript e build: aprovados;
- **338/338** execuções Playwright aprovadas — 169 por navegador;
- publicação da preview: aprovada;
- renovação de cache: aprovada;
- smoke público: aprovado;
- Argila `30554065055`: aprovada;
- coerência `30554064983`: aprovada.

Artefato:

- `mass-notes-tiptap-30554065748`;
- ID `8764292452`;
- digest `sha256:ba26efe9860fcf0d055b9e9f875f5c017967f858bc0c7a6048fff7ba7c6e9718`.

Evidência visual no artefato:

- `test-results/mass-notes-next-desktop.png` — topo operacional e toolbar compacta;
- `test-results/mass-notes-next-mobile.png` — dashboard em duas linhas, sem overflow global;
- `test-results/obs01-after-1440x560-chromium.png` — dock colado sob o cabeçalho durante escrita longa.

## Guardrails mantidos

- nenhuma alteração em `lexical-engine.js` ou bases linguísticas;
- nenhuma preferência de interface no JSON do manuscrito;
- nenhuma rede adicionada ao timer, meta ou contagem;
- nenhuma ação da toolbar removida;
- nenhum retry, aumento global de timeout ou exclusão de teste;
- uma única instância Tiptap e uma única toolbar;
- PR continua rascunho;
- `main` e Gate 14 permanecem intocados.
