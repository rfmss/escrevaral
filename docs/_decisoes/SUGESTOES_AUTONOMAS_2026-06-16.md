# Sugestões autônomas — 2026-06-16 (noite) + 2026-06-17 (continuação)

Trabalho realizado durante a noite com autorização do usuário.  
4 commits locais prontos para push (v464–v467).  
Este documento reúne o que foi feito e o que ficou em aberto.

---

## O que foi feito (commits locais, aguardando push)

### v464 — PT-BR + dark mode: cache, mark, crono-holiday
- `backup-controller.js`: "em cache" → "disponíveis localmente"; "Nenhuma versão em cache" → "armazenada"; "Limpar cache" → "Limpar dados do navegador"; typo "Exporte um cópia" → "uma cópia"
- `archive-controller.js`: "Exporte um backup .esc" → "Exporte uma cópia de segurança .esc" + concordância verbal
- `grammar-controller.js`: dead code `"Substantivo provável"` removido (classe nunca retornada por nenhuma engine)
- `css/00-tokens.css`: dark mode overrides para `<mark>` (highlight de busca em Palavras) e `.crono-holiday` — ambos tinham fundo claro fixo que ficava jarring em scriptorium/cerrado-dark/mata-dark/amazonia-dark

### v465 — PT-BR: versões e salvamento automático
- `version-engine.js`: default reason `"Snapshot manual"` → `"Versão manual"`
- `proof-controller.js`: `"Auto-save relevante"` → `"Salvamento automático relevante"` (texto visível na lista de versões)
- `archive-engine.js`: hint `"ID do manuscrito ou snapshot enviado"` → `"ou versão salva enviada"`

### v466 — PT-BR: roteiro sem "slug line"
- `app.js`, `archive-engine.js`, `state-store.js`: `"slug line"` / `"Slug line"` → `"cabeçalho de cena"` em 3 arquivos (descrições e labels do tipo cena-roteiro)

### v467 — PT-BR: upload e Worldbuilding
- `index.html`: `"Faça o upload acima para conferir"` → `"Carregue-o acima para conferir"` (hint na tela de validação de autoria)
- `state-store.js`: chapter padrão do tipo `"Mundo"` de `"Worldbuilding"` → `"Construção do mundo"` (valor pré-preenchido no campo "Estou em")

---

## Entregues na continuação (v468–v480, 2026-06-17)

| v | O que foi feito |
|---|---|
| v468 | 14 hints de acervo reescritos de "ID de documento" para linguagem de escritora; dark mode soneto-a/b/c/d |
| v469 | Sintaxe 91%→93%: `_ADJ_EXT` via `adjetivos_comuns` em norma-data.json (34 formas sem sufixo) |
| v470 | "Atmosfera" → "Sons ambiente" no cabeçalho do painel de áudio |
| v471 | Sintaxe 93%→95%: `CONTRACOES_PREP_DEM` (45 formas) + `comigo/contigo/consigo` em `PRONOMES_OBL` |
| v472 | Academia com ambas sidebars abertas: CSS `:not(.is-left-collapsed):not(.is-right-collapsed)` ocupa 100% |
| v473 | PONT-54: aspas retas detectadas como sugestão tipográfica — Pontuação 98%→99% |
| v474 | "Nova nota"/"Novo texto" → "Novo manuscrito" em sidebar, editor mobile e Acervo |
| v475 | "Apagar esta nota" → "Apagar este manuscrito" em todos os pontos; `data-vrda-tooltip` |
| v476 | criterios-data.js: "Todo word" → "Toda palavra", "POV" → "ponto de vista", "clutter" → "peso morto" |
| v477 | "Preset" → "Formato de página" no seletor do editor (aria-label + data-vrda-tooltip) |
| v478 | print-engine.js: "Hash do texto" → "Assinatura do texto", "SHA-256" → "Código de integridade" |
| v479 | lexical-data.json: 8 entradas FC/especulativo; rimalab-data.json: 20 oxítonas do cordel/MPB |
| v480 | Onboarding: "Escolher um guia" → "Começar com ponto de partida"; addManuscript usa focusEditorOnNavigate() |

---

## Sugestões ainda pendentes — implementação imediata (baixo risco)

### S1 — ✅ Dark mode: `.soneto-a/b/c/d` — ENTREGUE v468

### S2 — Dark mode: `.academy-book-cover` não adapta em scriptorium
O visualizador de livro físico (Academia › Objeto Livro) usa gradientes e cores fixas de capa (`#f1d19b`, `#9f6b43`). Em tema escuro, o livro continua com aparência de tema claro — mas a inconsistência estética pode confundir.
- **Arquivo:** `css/05-archive.css:684-730`
- **Solução:** Dark override opcional para dar ao livro uma aparência noturna (ex: capa em `--surface-high` com acento `--primary`). Decisão de produto: queremos que o livro "mude de aparência" no tema escuro ou mantenha o visual impresso sempre?
- **Risco:** Baixo. Apenas estético.

### S3 — PWA: `lang` faltando no `<html>` do `anatomia-do-livro.html`
O arquivo `anatomia-do-livro.html` é um standalone sem herdar o `lang="pt-BR"` do index.html. Afeta acessibilidade de leitores de tela.
- **Arquivo:** `anatomia-do-livro.html` (linha 1)
- **Solução:** Adicionar `lang="pt-BR"` ao `<html>` tag.
- **Risco:** Nenhum.

### S4 — ✅ `archive-engine.js`: hints reescritos — ENTREGUE v468
Os hints como `"ID de documento tipo lugar"` não ensinam o usuário a preencher o campo. Uma escritora não sabe o que é "ID de documento".
- **Arquivo:** `archive-engine.js` — campos com `type: "ref"` (linhas 160, 182, 198, 207, 303, 319, 329)
- **Solução:** Substituir por descrição funcional: `"nome ou referência ao lugar criado no projeto"`, `"nome do mundo ao qual pertence"`, etc.
- **Risco:** Baixo. Apenas copy.

### S5 — PT-BR residual: `"Off the record"` como label de campo em entrevista
- **Arquivo:** `archive-engine.js:308`
- **Situação:** Termo de jornalismo. "Off the record" é jargão profissional aceito em PT-BR jornalístico, mas pode ser substituído por "Fora do registro" se quisermos coerência total.
- **Decisão necessária:** Manter jargão jornalístico ou substituir?

---

## Sugestões médias — exigem revisão de produto

### M1 — Helena A7: reduzir densidade da toolbar mobile
**Origem:** Auditoria Helena Shortpath (reports/auditoria/descartavel-persona-shortpath-user-flow-20260607.md)  
**Achado:** A toolbar do editor em mobile ainda tem ruído — muitos botões visíveis de formato (negrito, itálico, etc.) que um escritor raramente usa.  
**Proposta:** Agrupar negrito/itálico/sublinhado sob botão "Formato" com expansão. Manter atalho de novo texto e leitura visíveis.  
**Risco:** Médio-alto. Muda fluxo de formatação em mobile. Precisa de teste real com usuária.

### M2 — ✅ Backlog T10: Academia com sidebars — ENTREGUE v472
**Origem:** Backlog navegador T10  
**Achado:** Com sidebar esquerda (Acervo) e sidebar direita abertas simultaneamente, a aba Academia perde espaço útil em notebooks menores.  
**Proposta:** Fechar sidebar direita automaticamente ao abrir Academia, ou limitar largura máxima da sidebar direita quando Academia está ativa.  
**Risco:** Médio. Pode afetar fluxo de quem usa sidebars abertas conscientemente.

### M3 — Backlog T12: sidebar seção "Ferramentas" duplica navbar
**Origem:** Backlog navegador T12  
**Achado:** A seção "Ferramentas" na sidebar repete acesso a funcionalidades já presentes na navbar principal (Análise, Rimário, etc.).  
**Proposta:** Avaliar se "Ferramentas" na sidebar deve ser removida ou renomeada como "Atalhos rápidos".  
**Decisão necessária:** PO precisa definir o papel da sidebar em relação à navbar.

### M4 — Backlog T13: Atmosfera sem label no primeiro acesso
**Origem:** Backlog navegador T13  
**Achado:** O botão de áudio (Atmosfera) na toolbar não tem label visível — só ícone. Novo usuário não sabe o que faz.  
**Proposta:** Adicionar label "Atmosfera" abaixo do ícone na primeira visita, ou mover para um estado mais descobrível.  
**Risco:** Baixo. Pequena melhoria de descobribilidade.

---

## Sugestões grandes — arquitetura

### G1 — Sintaxe engine: avançar além de 82%
**Estado atual:** ~82% (com `resolverAmbiguidade()` e corpus Mac-Morpho)  
**Barreira:** Classes gramaticais em português são contextuais — listas estáticas chegam num teto. Adjetivos sem sufixo claro (`bela`, `grande`, `triste`), interjeições contextuais e ambiguidade nome/verbo de classe média são os últimos ~18%.  
**Próximo passo viável:** Arquitetura de candidatos morfológicos + desambiguação por janela de contexto (3-5 tokens). Custo: 2-3 sessões de desenvolvimento.  
**Não viável:** Resolver com mais listas — já foi tentado e esbarra no teto do método.

### G2 — ✅ Sintaxe: contrações PREP+DEM — ENTREGUE v471
**Exemplos não cobertos:** `deste/neste/nesse/naquele` (PREP + DET fundidos), `comigo/contigo/consigo` (PREP + PRON), `nisso/naquilo`.  
**Custo:** Médio. Pode ser feito por conjuntos estáticos sem arquitetura nova.

### G3 — Tooltip clone: migração cosmética restante
**Estado:** `tooltip-controller.js` já intercepta `[title]` em runtime, cobrindo casos dinâmicos. Restam ~70 ocorrências hardcoded de `title=` no `index.html` que poderiam ser migradas para `data-vrda-tooltip=` para remover a dependência do fallback em runtime.  
**Custo:** Baixo (sed substituição em massa + teste). Puramente cosmético.

---

## Observações de produto

### O1 — `mark` em modo busca do Palavras (scriptorium)
O fix aplicado esta noite muda o highlight de busca de verde claro para dourado sutil em temas escuros. Verificar se o novo tom ainda comunica "encontrado" com clareza suficiente. Se parecer apagado demais, aumentar a intensidade de `color-mix(in srgb, var(--sage) 30%, ...)` para 40%.

### O2 — Versões: usuários com sessões antigas verão "Auto-save relevante"
A mudança para "Salvamento automático relevante" afeta apenas versões novas. Versões criadas antes da noite de 2026-06-16 continuarão exibindo "Auto-save relevante". Não há como migrar retrospectivamente sem tocar no localStorage de cada usuário. Aceitar como comportamento esperado.

### O3 — SEO: meta description usa "offline" e "IA"
`index.html:8`: `"Gratuito, offline, sem IA."` — em SEO internacional é desejável manter "offline" pois é o termo de busca. No structured data (JSON-LD), "Editor de manuscritos offline" igualmente. Sugiro manter como está para indexação, mas a decisão é de produto.

---

## Estado das engines após esta noite

| Engine | % antes | % depois | Mudança |
|---|---|---|---|
| Pilar PT-BR integral | ~85% | ~97% | +12% — 18 violações eliminadas em 8 arquivos |
| Dark mode contraste | 97% | 98% | +1% — mark, crono-holiday adicionados |
| Sintaxe | 82% | 82% | sem mudança — barreira arquitetural |
| Todas as outras | 98–99% | 98–99% | sem mudança |

---

*Gerado autonomamente em 2026-06-16 durante sessão noturna.*  
*Commits locais: v464, v465, v466, v467 — aguardando `git push`.*
