# Mapa de Icones e Metaforas - Escrevaral

Este arquivo e a fonte de verdade para os icones, desenhos e metaforas visuais do site.

Regra principal: icone nao e enfeite. Icone e pista silenciosa de acao, estado ou lugar. Se um novo icone entrar no codigo, ele precisa aparecer aqui tambem.

## Principios

- Todo texto visivel, `title`, `aria-label`, dica e estado precisa estar em portugues brasileiro.
- Nomes tecnicos de biblioteca podem ficar em ingles no codigo, como `material-symbols-outlined`, porque nao aparecem para o usuario.
- A mesma metafora deve usar sempre a mesma familia visual.
- Metaforas do Escrevaral devem ser quietas, duraveis e ligadas ao trabalho de escrever.
- Evitar icone barulhento para acao secundaria. Se a acao e secundaria, o icone tambem deve parecer secundario.
- Nao criar nova metafora quando uma existente resolve.

## Familias de icones

### 1. Icones desenhados do Escrevaral

Fonte: `css/wood-icons.css` + `icons/wood/escrevaral_wood_spritesheet.png`

Uso preferencial: botoes centrais da interface, acervo, editor, guia, autoria e acoes repetidas.

| Classe | Metafora | Uso correto |
|---|---|---|
| `ico-menu` | painel / navegacao | abrir navegacao ou menu principal |
| `ico-search` | busca | buscar no acervo, nos guias e nas ferramentas |
| `ico-add` | criar | nova nota, nova tarefa, novo bloco |
| `ico-download` | baixar | baixar arquivo, exportar texto |
| `ico-upload-file` | enviar arquivo | importar arquivo local |
| `ico-file-save` | guardar no computador | salvar copia local ou arquivo escolhido |
| `ico-print` | imprimir | impressao tecnica do documento |
| `ico-delete` | apagar | apagar nota, fala, tarefa ou item |
| `ico-auto-stories` | biblioteca viva | biblioteca, guia, texto em leitura |
| `ico-menu-book` | ler | modo leitura, livro aberto, consulta textual |
| `ico-edit-note` | escrever | editor, nota aberta, escrita ativa |
| `ico-article` | documento | pagina, texto simples, arquivo de escrita |
| `ico-fingerprint` | autoria | processo autoral, identidade de escrita |
| `ico-inventory-2` | acervo | arquivo, colecao, organizacao de notas |
| `ico-school` | academia | aprendizado de oficio, estudo, pratica |
| `ico-psychology` | voz | Espelho de Voz, leitura critica local |
| `ico-graphic-eq` | som / ritmo | RimaLab, ritmo, escansao, voz oral |
| `ico-language` | vocabulario | vocabulario, linguagem, termos |
| `ico-library-books` | repertorio | biblioteca de escrita, criterios, livros |
| `ico-verified` | confirmado | autoria validada, criterio cumprido |
| `ico-cloud-done` | funciona sem internet | salvo/local/sem nuvem, quando a copy explicar |
| `ico-shield-locked` | protecao | cuidado com acervo, reset, autoria, seguranca |
| `ico-calendar-month` | calendario | cronograma, escolha de data |
| `ico-timer` | tempo | temporizador de escrita |
| `ico-format-bold` | negrito | formatacao do texto |
| `ico-format-italic` | italico | formatacao do texto |
| `ico-format-align-left` | alinhar esquerda | alinhamento de paragrafo |
| `ico-format-align-center` | centralizar | alinhamento de paragrafo |
| `ico-format-color-text` | classes gramaticais | colorir texto por classe |
| `ico-insert-page-break` | quebra de pagina | inserir quebra tecnica |
| `ico-left-panel-open` | abrir painel | abrir acervo ou analise lateral |
| `ico-right-panel-close` | fechar painel | ocultar painel lateral ou guia |

Nota: esta familia deve ser a preferida quando o icone aparece muito perto da folha. Ela conversa melhor com a metafora de mesa, papel e oficio.

### 2. Material Symbols

Fonte: Google Material Symbols em `index.html`.

Uso preferencial: estados tecnicos, ferramentas ainda sem desenho proprio, templates dinamicos e areas menos centrais.

Nomes de Material Symbols usados hoje:

`account_balance`, `account_circle`, `add_circle`, `alternate_email`, `analytics`, `arrow_back`, `arrow_forward`, `article`, `assignment`, `auto_fix_high`, `auto_stories`, `bolt`, `book_4`, `campaign`, `check_circle`, `checklist`, `chevron_left`, `chevron_right`, `chrome_reader_mode`, `circle`, `close`, `cloud_done`, `cloud_off`, `cloud_sync`, `cloudy_snowing`, `coffee`, `comedy_mask`, `compare_arrows`, `compress`, `content_copy`, `contract`, `dark_mode`, `delete_sweep`, `dictionary`, `diversity_3`, `edit`, `edit_note`, `edit_square`, `equalizer`, `expand_more`, `fact_check`, `favorite`, `fingerprint`, `flag`, `folder`, `folder_open`, `format_align_justify`, `format_align_left`, `format_align_right`, `format_list_numbered`, `format_quote`, `format_shapes`, `format_size`, `gavel`, `graphic_eq`, `headphones`, `history_edu`, `info`, `inventory_2`, `keyboard_double_arrow_left`, `keyboard_double_arrow_right`, `label`, `language`, `library_books`, `link`, `local_fire_department`, `local_library`, `markdown`, `mark_email_read`, `meeting_room`, `menu_book`, `merge`, `mic`, `more_horiz`, `movie`, `music_note`, `newspaper`, `offline_bolt`, `open_in_new`, `outbox`, `palette`, `pause`, `person_edit`, `phone_iphone`, `pin`, `play_circle`, `policy`, `power`, `psychology`, `public`, `push_pin`, `radio_button_unchecked`, `rate_review`, `reviews`, `rocket_launch`, `route`, `save`, `schema`, `school`, `science`, `search`, `sentiment_excited`, `shield_locked`, `smart_display`, `sort`, `speed`, `sports_esports`, `start`, `storefront`, `subject`, `swap_horiz`, `sync_problem`, `table_bar`, `task_alt`, `text_fields`, `theaters`, `timer`, `touch_app`, `verified`, `videocam`, `view_comfy`, `view_day`, `view_in_ar`, `view_sidebar`, `volume_down`, `volume_up`, `waves`, `width`, `workspaces`.

### 3. Arquivos de marca, navegador e aplicativo

| Arquivo | Papel |
|---|---|
| `icons/escrevaral-logo.png` | marca principal no topo e imagem social |
| `icons/Logo.svg` | marca vetorial herdada, usada pelo service worker |
| `icons/Logo-tab.svg` | marca de aba herdada, usada pelo service worker |
| `icons/vereda-icon.svg` | icone herdado em paginas editoriais |
| `icons/escrevaral-logo-ink-dark.svg` | marca de tinta escura em `--brand-mark-image` para temas claros |
| `icons/escrevaral-logo-ink-light.svg` | marca de tinta clara em `--brand-mark-image` para temas escuros |
| `icons/vereda-maskable.svg` | icone instalavel herdado |
| `favicon_io/tab-favicon-16x16.png` | icone de aba pequeno |
| `favicon_io/tab-favicon-32x32.png` | icone de aba medio |
| `favicon_io/tab-favicon-48x48.png` | icone de aba grande |
| `favicon_io/tab-favicon-180x180.png` | icone Apple touch |
| `favicon_io/android-chrome-192x192.png` | icone de aplicativo instalado |
| `favicon_io/android-chrome-512x512.png` | icone de aplicativo instalado em alta resolucao |
| `favicon_io/favicon.ico` | favicon legado |
| `favicon_io/site.webmanifest` | manifesto herdado de icones |

Observacao: ha arquivos com nome `vereda-*` por heranca tecnica. Isso nao e copy visivel. Renomear esses arquivos exige trocar referencias em CSS, paginas editoriais e service worker na mesma rodada.

### 4. Ativos de textura e ambiente

| Arquivo | Metafora | Uso correto |
|---|---|---|
| `icons/wood/escrevaral_wood_spritesheet.png` | icones amadeirados | fonte visual dos `ew-icon` |
| `icons/wood/escrevaral_wood_spritesheet.json` | mapa da folha de icones | referencia tecnica da spritesheet |
| Fundo de mesa | mesa de escrita | opcional, discreto, acionado pelo usuario |

O fundo de mesa nunca deve competir com a folha. Ele e ambiente, nao protagonista.

### 5. Simbolos sem fonte

| Simbolo | Uso | Cuidado |
|---|---|---|
| `●` | lua nova no cronograma | usar apenas dentro do mapa lunar |
| `◐` | lua crescente | usar apenas dentro do mapa lunar |
| `○` | lua cheia | usar apenas dentro do mapa lunar |
| `◑` | lua minguante | usar apenas dentro do mapa lunar |

## Mapa de metaforas

### Escrevaral

Metafora central de marca: lugar onde textos ficam pendurados, visiveis, arejados, em trabalho.

Icones relacionados: `icons/escrevaral-logo.png`, marca no topo, favicons.

Regra: a marca pode ter personalidade. A interface em volta deve ser mais quieta que a marca.

### Mesa

Metafora de ambiente de trabalho.

Icones relacionados: `table_bar`, fundo de madeira, `icons/wood/*`.

Regra: a mesa aparece quando o usuario pede. Ela nao deve alterar leitura, contraste ou impressao.

### Folha

Metafora do produto principal: escrever.

Icones relacionados: nenhum icone precisa disputar com a folha. Quando necessario: `ico-edit-note`, `ico-article`, `edit_note`, `article`.

Regra: a folha e o centro. Barras, guias e paineis existem para servir a folha.

### Ferramenta

Metafora da barra de formatacao.

Icones relacionados: `ico-format-bold`, `ico-format-italic`, `ico-format-align-left`, `ico-format-align-center`, `format_align_right`, `format_align_justify`, `ico-format-color-text`, `ico-insert-page-break`, `more_horiz`.

Regra: ferramenta muito usada deve ser reconhecivel sem texto longo. Ferramenta rara pode ficar agrupada.

### Guia

Metafora de companhia de oficio, nao formulario.

Icones relacionados: `ico-auto-stories`, `ico-menu-book`, `view_sidebar`, `swap_horiz`, `auto_stories`, `menu_book`.

Regra: guia orienta quando aberto, mas nao escreve dentro da folha.

### Acervo

Metafora de arquivo pessoal do escritor.

Icones relacionados: `ico-inventory-2`, `inventory_2`, `folder_open`, `folder`, `push_pin`, `content_copy`, `sort`.

Regra: acervo guarda e organiza. Nao deve parecer armazenamento remoto.

### Autoria

Metafora de cuidado, rastro e integridade do processo.

Icones relacionados: `ico-fingerprint`, `fingerprint`, `ico-shield-locked`, `shield_locked`, `ico-verified`, `verified`, `check_circle`, `radio_button_unchecked`, `policy`, `gavel`.

Regra: falar como protecao emocional e prova local. Evitar juridiquês na primeira camada.

### Biblioteca

Metafora de repertorio e criterio.

Icones relacionados: `ico-library-books`, `library_books`, `local_library`, `auto_stories`, `menu_book`, `dictionary`.

Regra: biblioteca e consulta, nao vitrine tecnica.

### Academia

Metafora de bancada de oficio.

Icones relacionados: `ico-school`, `school`, `ico-psychology`, `psychology`, `ico-graphic-eq`, `graphic_eq`, `ico-language`, `language`.

Regra: a Academia deve parecer ferramenta de melhora real, nao aba decorativa.

### Espelho de Voz

Metafora de leitura critica local.

Icones relacionados: `ico-psychology`, `psychology`, `analytics`, `checklist`, `format_shapes`.

Regra: o espelho devolve padroes, nao sentencia qualidade.

### RimaLab

Metafora de ouvido, ritmo e verso.

Icones relacionados: `ico-graphic-eq`, `graphic_eq`, `equalizer`, `music_note`, `mic`.

Regra: se o nome continuar `RimaLab`, a explicacao visivel deve estar em portugues brasileiro e sem estrangeirismo desnecessario.

### Vocabulario

Metafora de escolha de palavra.

Icones relacionados: `ico-language`, `language`, `dictionary`, `label`, `palette`, `account_circle`, `sentiment_excited`.

Regra: vocabulario deve soar como ajuda de escrita, nao painel de linguistica.

### Cronograma

Metafora de ritmo, tempo e compromisso.

Icones relacionados: `ico-calendar-month`, `calendar_month`, `timer`, `flag`, `chevron_left`, `chevron_right`, `keyboard_double_arrow_left`, `keyboard_double_arrow_right`, simbolos lunares.

Regra: cronograma organiza ritmo de escrita, nao produtividade agressiva.

### Leitura

Metafora de trocar de postura: sair de autor e entrar como leitor.

Icones relacionados: `ico-menu-book`, `menu_book`, `play_circle`, `speed`, `view_day`, `text_fields`, `fullscreen_exit`.

Regra: modo leitura deve parecer outro substrato, mais calmo, sem ferramentas de edicao competindo.

### Foco

Metafora de silencio operacional.

Icones relacionados: `ico-edit-note`, `edit_note`, `fullscreen_exit`, `timer`.

Regra: foco reduz ruido, mas nao deve esconder o caminho de saida.

### Sons ambiente

Metafora de atmosfera opcional.

Icones relacionados: `headphones`, `volume_down`, `volume_up`, `cloudy_snowing`, `local_fire_department`, `coffee`, `waves`, `equalizer`.

Regra: som ambiente nunca e requisito. Sempre secundario, sempre fechavel.

### Publicacao

Metafora de trilha ate o leitor.

Icones relacionados: `route`, `storefront`, `book_4`, `view_in_ar`, `outbox`, `mark_email_read`, `campaign`.

Regra: publicacao e caminho editorial, nao painel de marketing.

### Direitos do autor

Metafora de orientacao e cuidado legal.

Icones relacionados: `gavel`, `policy`, `contract`, `account_balance`, `fact_check`.

Regra: sempre deixar claro quando e orientacao editorial e quando exige fonte oficial ou profissional habilitado.

### Tipos de oficio e templates

Icones usados em guias de criacao:

`movie`, `format_quote`, `newspaper`, `workspaces`, `storefront`, `book_4`, `gavel`, `subject`, `alternate_email`, `rocket_launch`, `dark_mode`, `diversity_3`, `favorite`, `theaters`, `videocam`, `comedy_mask`, `sports_esports`, `format_list_numbered`, `phone_iphone`, `history_edu`, `reviews`, `edit_square`, `smart_display`, `person_edit`, `view_comfy`, `science`, `assignment`, `schema`, `start`, `task_alt`, `public`, `link`, `rate_review`, `compare_arrows`, `chrome_reader_mode`, `meeting_room`.

Regra: template pode usar icone mais especifico, mas o modal de criacao nao deve virar carnaval visual. Preferir iconografia consistente por oficio:

- ficcao: livro, historia, personagem, mundo;
- roteiro: tela, cena, teatro, jogo;
- poesia: aspas, som, microfone, musica;
- nao ficcao: artigo, jornal, pesquisa, argumento;
- projeto editorial: livro, pagina, contrato, envio.

## Icones a revisar antes de escalar o visual

| Icone | Risco | Decisao sugerida |
|---|---|---|
| `cloud_sync` | pode parecer nuvem, quando a promessa e local | trocar por `ico-file-save` ou copy muito clara |
| `offline_bolt` | raio sugere energia/velocidade, nao necessariamente sem internet | usar com parcimonia |
| `rocket_launch` | pode ficar infantil ou barulhento | reservar para ficcao cientifica ou lancamento, nao para produtividade |
| `bolt` | energia/rapidez, tende a virar promessa vazia | evitar em acoes de escrita calma |
| `dark_mode` | usado como modo escuro e tambem pode aparecer em terror | nao repetir a mesma metafora em sentidos conflitantes na mesma tela |
| `analytics` | parece painel tecnico | trocar por metafora de leitura quando houver icone proprio |
| `workspaces` | abstrato | validar se comunica projeto/oficio para escritor brasileiro |
| `view_in_ar` | tecnico e pouco literario | usar so em anatomia/objeto livro se a tela explicar |
| `sync_problem` | tecnico e frio | trocar copy e icone para algo mais humano quando visivel |

## Checklist para novo icone

Antes de adicionar um icone:

1. Ele representa acao, estado ou lugar?
2. Ja existe metafora equivalente neste arquivo?
3. O mesmo significado ja usa outro icone?
4. O icone aparece perto da folha? Se sim, preferir `ew-icon`.
5. O texto visivel esta em portugues brasileiro?
6. O icone continua legivel em celular, tela vertical e modo escuro?
7. O icone continua discreto quando a pessoa esta escrevendo?
8. O novo nome foi anotado neste arquivo?

## Onde atualizar no codigo

- `index.html`: icones principais, botoes, topbar, editor, modulos e overlays.
- `css/wood-icons.css`: folha de sprites `ew-icon`.
- `templates-data.json`: icones dos guias e tipos de oficio.
- `archive-controller.js`: icones de acervo, nota vinculada, fixar, duplicar, apagar.
- `editor-controller.js`: icones de aderencia ao guia e analise.
- `grammar-controller.js`: icones de classes gramaticais.
- `cronograma-controller.js`: icones de calendario, tarefas e fases da lua.
- `proof-controller.js`: icones de autoria, checklist e sons ambiente.
- `academia-controller.js`: icones de ferramentas da Academia.
- `service-worker.js` e `manifest.webmanifest`: icones cacheados e instalaveis.

## Regra de manutencao

Quando o Claude ou o Codex mexerem em icone, desenho, favicon, sprite, simbolo ou metafora visual, este arquivo precisa ser atualizado na mesma mudanca.
