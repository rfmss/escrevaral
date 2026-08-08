# OBS-02/03 — Densidade operacional, áreas nobres e leitura verbal

Data: 2026-07-30

Método: **CLARO**

Status inicial: **intervenção aprovada; implementação em andamento**

PR: `#155`, aberto e em rascunho  
Branch: `experiment/mass-notes-tiptap`  
Base funcional anterior: `30dc77ea63afdb3731732d7469c040997c58de72` — 324/324, preview/cache/smoke, Argila e coerência verdes.

## C — Cenário observado

A pessoa avaliou a preview no navegador e indicou cinco pontos usando o ponteiro do mouse nas capturas:

1. a toolbar ocupa duas linhas e altura excessiva dentro do papel;
2. a leitura de `varre-lo-ei` classifica a forma, mas não explica tempo verbal, mesóclise, formação e equivalência de uso;
3. a faixa superior usa área nobre com informações internas de baixo valor operacional (`Caderno` e `Fundação`);
4. a assinatura `MOTOR TIPTAP // FUNDAÇÃO 01` pertence à documentação técnica, não à superfície principal de escrita;
5. a toolbar deve permanecer disponível durante a rolagem interna do manuscrito, sem cobrir o texto.

## Auditoria curta da implementação atual

### Toolbar

- o componente já usa `position: sticky`;
- `design-stabilization.css` aplica `flex-wrap: wrap`, causando a segunda linha;
- o conjunto cabe em uma linha no viewport desktop observado quando os rótulos longos são condensados e existe overflow horizontal seguro em larguras menores;
- o proprietário de rolagem é `.editor-viewport`, portanto o sticky pode permanecer local ao manuscrito.

### Leitura lexical

- `LexicalPanel` renderiza uma estrutura tipada `LexicalReading`;
- o adaptador pode anexar um suplemento editorial curado sem alterar `lexical-engine.js`, as bases ou a classificação existente;
- a forma normativa a apresentar é `varrê-lo-ei`;
- a consulta digitada como `varre-lo-ei` deve continuar aceita e receber uma nota ortográfica, sem substituir o manuscrito.

### Faixa superior

- quatro células são ocupadas por `Caderno`, `Fundação`, `Página` e `Última tinta`;
- `Caderno` e `Fundação` são informações institucionais/técnicas estáticas;
- a área pode entregar contagem de palavras, meta de escrita e sessão de foco, mantendo o estado de salvamento;
- metas e timer são preferências de sessão/interface e não devem entrar no JSON autoral.

### Identidade e contato

- a documentação da marca confirma `oi@escrevaral.com`, GitHub `rfmss/escrevaral`, Escrevaral `@escrevaral`, Rafa Mass `@rafamass` no X e `@rafa.pro.br` no Bluesky;
- a superfície principal deve exibir um conjunto pequeno e verificável, sem transformar o editor em página promocional;
- detalhes de fundação permanecem nos documentos do GitHub.

## L — Limite e impacto

- severidade: **P1 de ergonomia e densidade para escrita longa**;
- perda de dados: não observada;
- risco autoral: baixo se preferências permanecerem fora do documento;
- risco de layout: médio, pois toolbar, paginação e sticky dividem a mesma superfície;
- risco editorial: médio, pois explicações morfológicas incorretas degradam confiança;
- risco de escopo: alto se pomodoro, metas, redes e redesign forem implementados como features desconectadas.

## A — Arquitetura aprovada

A intervenção seguirá uma única trilha:

1. registrar baseline e critérios;
2. compactar a toolbar em uma linha no desktop, mantendo overflow horizontal acessível em larguras menores;
3. preservar sticky dentro de `.editor-viewport` e criar prova de que não encobre a seleção;
4. adicionar suplemento verbal tipado e curado para `varre-lo-ei`/`varrê-lo-ei`;
5. substituir a faixa técnica por um painel operacional compacto com palavras, meta, foco e salvamento;
6. substituir a assinatura técnica da marca por contato e canais essenciais;
7. executar QA em Chromium e Firefox, quatro viewports, tema papel/noite e navegação por teclado;
8. registrar evidências, limitações, cabeça, workflows, artefato e digest.

## Guardrails — braço esticado

- não alterar `lexical-engine.js` ou bases linguísticas nesta intervenção;
- não persistir meta, timer ou elementos visuais no JSON do manuscrito;
- não criar dependência de rede;
- não mover a rolagem para `window`;
- não remover controles da toolbar; condensar rótulos e permitir acesso por teclado/scroll horizontal;
- não publicar se qualquer teste herdado falhar;
- se a toolbar não couber de forma legível, pausar antes de criar menus complexos;
- se o suplemento verbal exigir generalização morfológica não comprovada, manter cobertura curada e declarar o limite;
- manter PR em rascunho; não promover para `main`; não executar Gate 14.

## R — Critérios antes da implementação

- toolbar com uma única linha no desktop observado (`1366×768` e `1440×560`);
- altura da toolbar menor que a baseline e controles ainda alcançáveis;
- sticky permanece dentro do viewport após rolagem;
- nenhum overflow horizontal global;
- `varre-lo-ei` e `varrê-lo-ei` retornam futuro do presente do indicativo, mesóclise, decomposição e equivalências;
- nenhuma substituição automática no manuscrito;
- faixa superior mostra informação operacional viva;
- meta editável e timer de foco funcionam sem mutar o documento;
- contatos abrem em links explícitos e seguros;
- toda a matriz herdada continua verde.

## O — Limites assumidos

- o suplemento verbal começa curado para a forma aprovada; não promete analisar toda mesóclise do português;
- a meta é uma preferência local do navegador, não sincronizada entre dispositivos;
- o timer é uma ferramenta de sessão, não um sistema de produtividade completo;
- redes exibidas serão um recorte essencial, não a lista integral de canais;
- menus adaptativos avançados da toolbar ficam fora desta tranche se uma linha com overflow seguro resolver a fronteira.

## Breadcrumbs

### B0 — abertura

- cabeça anterior confirmada: `30dc77e`;
- auditoria de DOM, CSS, adaptador lexical e canais concluída;
- nenhuma alteração de produto feita antes deste registro.
