# Auditoria - gramatica visual de botoes

Data: 2026-05-25  
Escopo: interface principal atual (`index.html`, `app.js`, `archive-controller.js`, `academia-controller.js`, CSS modular).  
Fora de escopo: prototipos e ensaios em `dark-ensaio/`.

## Diagnostico curto

A hipotese procede: o Escrevaral ja tem bons nomes funcionais (`primary-button`, `secondary-button`, `danger-button`, `icon-button`, `tab`), mas a gramatica visual ainda mistura quatro coisas que a pessoa precisa distinguir rapido:

- acao disponivel;
- estado ativo/selecionado;
- entrada de dados;
- superficie informativa/clicavel.

O ponto mais critico e o uso de preenchimento forte com `var(--primary)` para papeis diferentes: CTA primario, filtro ativo e chip selecionado. Isso aparece em `archive-filter.is-active`, `decolonial-filter.is-active`, `craft-tab.is-active` e `primary-button`.

## Leitura cruzada com segunda auditoria

A segunda auditoria confirma o nucleo do diagnostico e acrescenta tres achados importantes:

- `icon-button` esta sobrecarregado: ferramenta, toggle, fechar, navegacao e acao destrutiva discreta usam a mesma gramatica visual.
- varios controles tem `aria-pressed`, mas o estado ligado nao aparece com uma regra visual global clara.
- `Verificar arquivo .esc` usa `span.secondary-button[role=button]`; a aparencia ate funciona, mas a semantica deve virar botao real ou um `label` com categoria propria de upload.

Prioridade combinada para primeira rodada futura:

1. Diferenciar filtros ativos de CTA primario.
2. Criar estado visual para toggles com `aria-pressed="true"`.
3. Dar tratamento de perigo ao botao iconico de apagar nota.
4. Criar `create-action` para `Nova nota`.
5. Corrigir `span role="button"` de upload/verificacao.

## Regras de decisao

| Pergunta visual | Categoria | Regra |
| --- | --- | --- |
| Vai executar algo agora? | `primary-action` / `secondary-action` / `danger-action` | Botao com verbo claro. Apenas uma acao primaria por painel. |
| Ja esta escolhido ou representa a tela atual? | `nav-tab` / `selected-filter` / `toggle-action` | Aparencia de estado, nao de chamada principal. Preferir linha, marca lateral, check/dot ou superficie contida. |
| Abre criacao de nota/manuscrito? | `create-action` | Classe exclusiva. Nao reutilizar em analise, exportacao, filtros, tags ou backup. |
| Recebe texto, busca ou ajuste? | `input-field` | Borda/superficie de campo, nunca preenchimento de CTA. |
| Apenas informa? | `info-card` / `status` | Sem cursor/hover de botao. Se clicar inteiro, precisa parecer card clicavel e ter foco/rotulo. |
| E destrutivo? | `danger-action` | Vermelho/sienna, texto explicito, distancia das acoes comuns. |

## Inventario por categoria

### `nav-tab`

| Elementos | Origem | Estado atual | Decisao |
| --- | --- | --- | --- |
| Topbar: Manuscrito, Biblioteca, Prova de autoria, Arquivo, Academia, Cronograma | `index.html:128-134` | Correto: linha inferior e texto ativo, sem cara de CTA. | Manter como padrao de navegacao principal. |
| Sidebar: Biblioteca, Prova de autoria, Arquivo, Academia | `index.html:195-212` | Visual de lista navegavel; bom, mas estado ativo precisa ser consistente com topbar. | `nav-tab` ou `nav-row`, com estado ativo discreto. |
| Academia: Espelho de Voz, RimaLab, Vocabulario, Biblioteca | `index.html:684-701`, `css/06-academy-tools.css:113-148` | Correto no conceito: aba ativa por linha inferior. | Manter como navegacao interna, nunca `secondary-button`. |

### `create-action`

| Elementos | Origem | Estado atual | Risco | Decisao |
| --- | --- | --- | --- | --- |
| `Nova nota` no Arquivo | `index.html:462-466` | Usa `primary-button`. | Parece igual a outras acoes primarias como `Analisar voz` e `Guardar copia da autoria`. | Migrar para `create-action create-button`. |
| `+` na sidebar de Manuscritos | `index.html:186-190` | Usa `icon-button sidebar-new-btn`. | Acao fundadora fica discreta demais e semelhante a ferramenta generica. | `create-action icon-create`, com tooltip e estado aberto. |
| Empty state `Criar primeira nota` | `archive-controller.js:54` e print `desk-arquivo.png` | Parece item de lista. | Criacao inicial compete pouco com o empty state. | Usar variante `create-action subtle`, nao `nav-row`. |
| Modal de criacao: categorias, folha em branco, linhas de template | `app.js:385-477`, `css/02-shell-navigation.css:971-1157` | Cards clicaveis de criacao. | Aceitavel dentro do fluxo, mas nao devem contaminar filtros/cards externos. | Escopar como `create-option`, subordinado a `create-action`. |

Regra: `create-action` so deve abrir ou confirmar criacao de nota/manuscrito. Nao usar em Academia, exportacao, backup, filtros ou tags.

### `primary-action`

| Elementos | Origem | Estado atual | Decisao |
| --- | --- | --- | --- |
| `Analisar voz` | `index.html:710-718` | `primary-button`; correto para painel Espelho de Voz. | Manter como primaria contextual. |
| `Guardar copia da autoria` | `index.html:394-399` | `primary-button`; correto como primaria de Autoria. | Manter como primaria contextual. |
| `Abrir no editor` no detalhe do Arquivo | `index.html:546-549` | `primary-button`. | Correto quando ha nota selecionada; pode ser primaria do painel lateral. |
| `Quero comecar` nos guias | `app.js:999-1014`, `css/04-analysis-academy.css:1356-1369` | `template-primary`. | Correto como CTA dentro do card-guia, mas precisa obedecer tokens de `primary-action`, nao estilo paralelo. |
| Dialogo `OK` | `index.html:1406-1407` | `primary-button`. | Correto. |

Risco global: quando `create-action` continuar usando `primary-button`, a tela pode ter duas acoes com a mesma autoridade visual.

### `secondary-action`

| Elementos | Origem | Estado atual | Decisao |
| --- | --- | --- | --- |
| Autoria: `Nova sessao` | `index.html:383-389` | `secondary-button`. | Correto, mas icone/label devem continuar juntos. |
| Autoria: historico com icone sozinho | `index.html:383-385` | `secondary-button` icon-only, so `title`. | Ambiguo no print. Migrar para `icon-action` com tooltip persistente/acessivel ou label curto. |
| Autoria: `Carimbar na blockchain`, `Verificar arquivo .esc`, `Salvar versao` | `index.html:402-445` | `secondary-button`. | Correto. |
| Arquivo: `Guardar copia`, `Guardar copia do acervo`, `Trazer copia de volta`, `Exportar .rtf` | `index.html:579-642` | `secondary-button`. | Correto em categoria, mas precisam mesmo peso e agrupamento. |
| Arquivo: exports por nota `Exportar texto`, `Markdown`, `HTML` | `index.html:550-562` | `ghost-button`. | Correto como acao terciaria. |
| Academia: `Usar o texto em edicao`, RimaLab `Baixar TXT`, `Limpar`, `Enciclopedia` | `index.html:710-757` | `secondary-button`. | Correto. `Limpar` talvez receba variante cautelosa se apaga texto do RimaLab. |
| Guia: `Anterior`, `Proxima` | `index.html:856-865` | `secondary-button`. | Correto como navegacao local. |
| Guia: `Me conta mais primeiro` | `templates-data.json`, render em `app.js:999` | `template-secondary`. | Correto como secundaria textual, nao deve competir com CTA. |

### `selected-filter`

| Elementos | Origem | Estado atual | Risco | Decisao |
| --- | --- | --- | --- | --- |
| Arquivo: `Todos` e tipos de nota | `archive-controller.js:420-445`, `css/05-archive.css:290-329` | `.archive-filter.is-active` fica preenchido com `var(--primary)`. | Parece CTA principal, especialmente ao lado de busca e `Nova nota`. | Migrar para `selected-filter`: contorno/tonalidade/indicador, sem preenchimento forte. |
| Academia/Vocabulario: categorias do vocabulario | `academia-controller.js:336-344`, `css/04-analysis-academy.css:574-608` | `.decolonial-filter.is-active` usa mesmo preenchimento forte. | Filtro selecionado parece botao de acao. | Mesmo padrao `selected-filter`. |
| Academia/Guia: `Ficcao`, `Roteiro`, `Poesia` etc. | `app.js:962-972`, `css/04-analysis-academy.css:1137-1176` | `.craft-tab.is-active` preenchido forte. | Chips de filtro parecem CTA. | `selected-filter` por oficio, com cor de oficio mais contida. |
| Academia/Guia: guias especificos | `app.js:976-986`, `css/04-analysis-academy.css:1178-1196` | `template-tab.is-active` fica card claro com texto primary. | Melhor: comunica selecao sem CTA forte. | Usar como referencia para filtros selecionados. |

### `toggle-action`

| Elementos | Origem | Estado atual | Decisao |
| --- | --- | --- | --- |
| Topbar: fundo de mesa, tema, foco, audio | `index.html:145-171` | `icon-button` com `aria-pressed` em alguns. | Padronizar estado ligado/desligado visualmente; hoje depende muito do tooltip. |
| Editor: ver pagina, colorir classes gramaticais, regua | `index.html:303-314`, `index.html:1085-1093` | Mistura `editor-view-btn`, `fmt-btn`, `focus-pill`. | Unificar como `toggle-action`, com estado ligado diferente de hover. |
| Vocabulario: `Observar meu manuscrito nesta revisao` | `index.html:798-804` | Label-card com checkbox. | Conceito correto, mas visual deve dizer "liga/desliga", nao card comum. |
| Details: backup, copia automatica, export menu | `index.html:571-597`, `archive-controller.js:278-287` | `summary` clicavel. | Tratar como disclosure, nao botao secundario. |

Regra adicional: qualquer `[aria-pressed="true"]` precisa de estado visual proprio. O estado ligado nao deve ser confundido com hover nem com aba ativa.

### `input-field`

| Elementos | Origem | Estado atual | Decisao |
| --- | --- | --- | --- |
| Busca global/topbar | `index.html:144-155`, `css/02-shell-navigation.css:184-220` | Campo arredondado, ok. | Manter, com contraste menor que CTA/filtro. |
| Arquivo: `Buscar no acervo`, ordenar | `index.html:471-485`, `css/05-archive.css:247-280` | Campo e select tipo pill. | Campo ok; sort parece campo/controle, nao CTA. |
| Academia: busca vocabulario, busca guia, direitos | `index.html:814-845`, `index.html:907-910`, CSS em `04-analysis-academy.css` | Campos com borda/superficie. | Manter como `input-field`. |
| Textareas Espelho/RimaLab | `index.html:721-764` | Campo grande claro. | Correto. |
| Metadados do Arquivo | `index.html:510-544` | Formulario. | Correto. |

### `info-card` / `status`

| Elementos | Origem | Estado atual | Risco | Decisao |
| --- | --- | --- | --- | --- |
| Arquivo empty state | `index.html:497-500` e print | Card com borda e icone. | Se nao clicavel, nao deve ter hover/cursor. | `info-card empty-state`; CTA separado se houver criacao. |
| Autoria: cards de sinais/toques/cadencia | print e `index.html:360-373` | Cards informativos. | Podem parecer paineis clicaveis se recebem sombra/hover. | `info-card metric-card`, sem cursor. |
| Autoria: bloco de aviso | `index.html:426-432` | Informativo. | Correto se sem hover. | `status-note`. |
| RimaLab dashboard | `index.html:766-786` | Articles informativos. | Correto, mas evitar estilo de botao. | `info-card metric-card`. |
| `proof-chip` topbar | `index.html:139-142`, `css/03-editor-toolbar.css:376-409` | Status clicavel. | Mistura status + navegacao; pode ser ok se explicitado como indicador navegavel. | Categoria hibrida: `status-link`, nao CTA. |

### `info-card clicavel`

| Elementos | Origem | Estado atual | Decisao |
| --- | --- | --- | --- |
| Cards de manuscrito no Arquivo | `archive-controller.js:250-289`, CSS em `04-analysis-academy.css:1533+` | `article role=button tabindex=0`; correto ser card clicavel. | Manter, mas separar acoes internas (`Abrir`, duplicar, exportar) para nao competir com clique do card inteiro. |
| Leitura editorial | `index.html:870-894`, `css/06-academy-tools.css:226-260` | Anchors como cards. | Correto: card inteiro e clicavel. |
| Welcome cards | `index.html:1111-1134`, CSS `02-shell-navigation.css:698-779` | Cards-botao. | Correto no onboarding, mas nao virar padrao para info-card. |

### `danger-action`

| Elementos | Origem | Estado atual | Decisao |
| --- | --- | --- | --- |
| `Apagar tudo` | `index.html:645-654`, `css/05-archive.css:60-108` | `danger-button` em zona separada. | Correto. |
| `Apagar tudo mesmo assim` no modal | `archive-controller.js:153-158` | `danger-button`. | Correto. |
| Apagar nota ativa / remover cronograma / limpar RimaLab | `index.html:251`, `cronograma-controller.js:257-261`, `index.html:750-752` | Varia entre icon/secondary. | Acoes destrutivas menores precisam variante `danger-action subtle` ou confirmacao clara. |

Achado especifico: `editor-delete-btn` hoje herda a neutralidade de `.icon-button`. Mesmo sendo uma acao pequena, precisa sinal de perigo no hover/foco e talvez no `title`/tooltip.

### Excecoes contextuais aceitaveis

| Elementos | Situacao | Decisao |
| --- | --- | --- |
| `.fmt-btn` | Ferramentas de formatacao do editor. | Pode continuar como categoria propria, desde que toggles tenham estado ativo claro. |
| `.reader-pill` | Controles do modo leitura. | Aceitavel como sistema local do overlay. |
| `.focus-pill` | Controle do modo foco. | Aceitavel, mas deve obedecer a regra de toggle ligado/desligado. |
| `.install-button` | CTA de instalacao. | Deve ser avaliado como `primary-action` de conversao quando visivel; hoje nao entra na matriz das telas principais por estar condicional. |

## Matriz por tela

### Arquivo

| Elemento | Categoria proposta | Situacao atual | Inconsistencia | Decisao |
| --- | --- | --- | --- | --- |
| `Nova nota` | `create-action` | `primary-button` | Acao fundadora indistinta de CTA comum. | Classe exclusiva `create-button`; estado aberto conectado ao modal. |
| `Todos` / filtros | `selected-filter` | Pill preenchido igual a primary | Filtro ativo parece comando principal. | Estado ativo por contorno, check/dot ou faixa; sem preenchimento `primary`. |
| `Buscar no acervo` | `input-field` | Correto | Deve continuar diferente dos filtros. | Manter campo com borda e icone, sem hover de botao. |
| Ordenacao | `input-field` / `select-control` | Pill semelhante ao campo | Ok, mas nao deve parecer filtro selecionado. | Manter neutro. |
| Cards de nota | `info-card clicavel` | Card inteiro clicavel com botoes internos | Potencial conflito de clique. | Reforcar hierarquia: card seleciona; botoes internos executam. |
| Empty state | `info-card` | Card informativo | Pode parecer clicavel se houver hover/borda forte. | Sem cursor; CTA separado. |
| `Guardar copia`, `Trazer copia`, `Exportar .rtf` | `secondary-action` | `secondary-button` | Bom, mas agrupamento visual deve ser unico. | Um padrao de linha de acoes secundarias. |
| `Configurar` backup automatico | `secondary-action` pequena / disclosure CTA | Texto dentro de `summary` | Pode competir como CTA solto. | Transformar em pequena acao de disclosure ou tag neutra. |
| `Apagar tudo` | `danger-action` | Correto | Nenhuma critica estrutural. | Manter isolado. |

### Autoria

| Elemento | Categoria proposta | Situacao atual | Inconsistencia | Decisao |
| --- | --- | --- | --- | --- |
| `Guardar copia da autoria` | `primary-action` | `primary-button` | Correto. | Primaria contextual da tela. |
| `Nova sessao` | `secondary-action` | `secondary-button` | Correto, mas no print compete pouco com icon-only anterior. | Manter secundaria; talvez menor se ficar na barra de sessao. |
| Botao de historico/reset acima de `Nova sessao` | `icon-action` | Icon-only com title | Ambiguo. | Tooltip/label claro; se for historico, icone `history` + texto em telas largas. |
| `Carimbar na blockchain` | `secondary-action` | `secondary-button` desabilitavel | Correto. | Manter. |
| `Verificar arquivo .esc` | `secondary-action` | `span.secondary-button` dentro de label | Visual ok, semantica irregular. | Preferir label com classe propria `file-action` ou botao que aciona input. |
| `Salvar versao` | `secondary-action` | `secondary-button` | Correto. | Manter. |
| Cards de metricas | `info-card` | Card informativo | Nao deve parecer clicavel. | Sem hover/cursor. |
| Avisos/blocos de escopo | `status-note` | Informativo | Correto se visual nao competir. | Manter. |

### Academia

| Elemento | Categoria proposta | Situacao atual | Inconsistencia | Decisao |
| --- | --- | --- | --- | --- |
| Abas Espelho/RimaLab/Vocabulario/Biblioteca | `nav-tab` interno | Label + radio hidden | Correto visualmente. | Manter linha inferior, sem preenchimento CTA. |
| `Analisar voz` | `primary-action` | `primary-button` | Correto. | Primaria contextual do painel. |
| `Usar texto em edicao` | `secondary-action` | `secondary-button` | Correto. | Manter. |
| RimaLab acoes | `secondary-action` | `secondary-button` | `Limpar` pode ser destrutivo. | `Limpar` como `danger-action subtle` ou confirmacao. |
| Chips `Ficcao`, `Roteiro`, `Poesia` | `selected-filter` | `.craft-tab.is-active` preenchido igual CTA | Filtro parece botao principal. | Migrar para estado selecionado contido. |
| Busca de guia/vocabulario | `input-field` | Correto | Deve ficar neutra. | Manter. |
| `Quero comecar` | `primary-action` contextual | `template-primary` | Correto, mas classe paralela. | Mapear tokens para `primary-action`. |
| `Me conta mais primeiro` | `secondary-action textual` | `template-secondary` | Correto. | Manter discreto. |
| Leitura editorial cards | `info-card clicavel` | Anchors-card | Correto. | Manter card inteiro clicavel. |

## Tabela de migracao CSS

| Classe/estado atual | Categoria nova | Acao sugerida |
| --- | --- | --- |
| `.tab`, `.tab.is-active` | `nav-tab` | Manter; virar referencia de navegacao ativa. |
| `.nav-row` | `nav-tab` lateral | Adicionar estado ativo consistente e nao-CTA. |
| `.primary-button` | `primary-action` | Reservar para acao principal contextual, nao criacao. |
| `.secondary-button` | `secondary-action` | Manter como acao util; criar variantes `compact`, `textual`, `subtle-danger`. |
| `.ghost-button` | `icon/text tertiary-action` | Manter para exportacoes pequenas e ferramentas discretas. |
| `.icon-button` | `icon-action` ou `toggle-action` | Separar visual de ferramenta momentanea vs liga/desliga. |
| `.icon-button[aria-pressed="true"]` | `toggle-action active` | Adicionar estado visual global de ligado. |
| `.icon-button.editor-delete-btn` | `danger-action subtle` | Hover/foco com cor de perigo, sem virar CTA destrutivo grande. |
| `.danger-button` | `danger-action` | Manter; ampliar para variante sutil. |
| `.archive-filter(.is-active)` | `selected-filter` | Remover preenchimento primary do ativo; usar indicador de selecao. |
| `.decolonial-filter(.is-active)` | `selected-filter` | Mesmo tratamento dos filtros do Arquivo. |
| `.craft-tab(.is-active)` | `selected-filter` | Mesmo tratamento; permitir cor de oficio como acento, nao fundo CTA. |
| `.template-tab(.is-active)` | `selected-filter` / `nav-tab local` | Usar como referencia boa: ativo sem parecer CTA principal. |
| `.template-primary` | `primary-action` | Consolidar tokens com `.primary-button`. |
| `.template-secondary` | `secondary-action textual` | Consolidar tokens com variante textual. |
| `.create-cat-card`, `.create-tpl-row`, `.create-tpl-free` | `create-option` | Escopar dentro de `.create-flow`, sem uso fora do modal. |
| `.primary-button[data-action="open-create-note"]` | `create-action` | Trocar para `.create-button`. |
| `.icon-button.sidebar-new-btn` | `create-action icon-create` | Trocar para variante exclusiva de criacao. |
| `span.secondary-button[role="button"]` | `secondary-action` upload | Trocar por botao real ou padrao semantico de `label.file-action`. |
| `.archive-search`, `.decolonial-search`, `.template-search`, `.rights-search` | `input-field` | Manter neutro; nao compartilhar estilo de filtro/CTA. |
| `.project-card[role="button"]`, `.leitura-editorial-card` | `clickable-card` | Manter hover/foco apenas quando card inteiro clica. |
| Cards metricos/empty/status | `info-card` / `status-note` | Sem cursor/hover de botao. |

## Ordem recomendada para implementacao futura

1. Criar tokens semanticos: `primary-action`, `secondary-action`, `selected-filter`, `create-action`, `input-field`, `info-card`, `danger-action`.
2. Migrar primeiro filtros (`archive-filter`, `decolonial-filter`, `craft-tab`), porque eles causam a maior confusao com CTA.
3. Criar `create-button` e aplicar somente nos gatilhos de `Nova nota`.
4. Separar `icon-action` de `toggle-action`, adicionando estado ligado visivel para toggles.
5. Revisar cards: garantir `cursor: pointer` e hover apenas em cards realmente clicaveis.
6. Unificar `template-primary`/`template-secondary` com o sistema semantico, preservando o contexto do guia.

## Criterio de aceite operacional

Em uma leitura de 3 segundos:

- `Nova nota` deve ser reconhecida como criacao, nao como filtro nem acao secundaria.
- Aba/tela/filtro ativo deve parecer estado ja escolhido, nao botao para executar.
- Busca e texto devem parecer campos.
- Cards informativos devem parecer leitura; cards clicaveis devem ter affordance propria.
- Cada painel deve ter no maximo uma acao primaria comum.
- Acoes destrutivas devem ser reconheciveis antes do clique.
