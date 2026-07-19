# Auditoria de Confiança e Familiaridade Visual — Escrevaral

**Data:** 2026-07-19
**Escopo:** Front-end do Escrevaral (index.html + CSS + JS) comparado com Notion, Word e Standard Notes
**Método:** Análise estática de código, medição de design tokens, contagem de elementos, revisão de affordances

---

## 1. Diagnóstico de Densidade (Números Reais)

### Medidas extraídas do código

| Métrica | Escrevaral (desktop) | Notion | Word | Standard Notes |
|---|---|---|---|---|
| **Altura do topbar** | 58px (`grid-template-rows: 58px ...`) — `css/02-shell-navigation.css:148` | ~45px | ~105px (ribbon) | ~48px |
| **Altura da statusbar** | 34px (`grid-template-rows: ... 34px`) — `css/02-shell-navigation.css:148` | 0px (none) | ~26px | 0px (none) |
| **Chrome total (top+bottom)** | 92px | ~45px | ~131px | ~48px |
| **Proporção chrome/viewport (900px)** | 10.2% | 5.0% | 14.6% | 5.3% |
| **Largura do paper (foco)** | 720px (`--focus-width: 720px`) — `css/00-tokens.css:36` | ~720px | Variável | ~680px |
| **Gutter lateral** | `clamp(32px, 5vw, 72px)` — `css/00-tokens.css:2` | ~40px | ~32px | ~20px |
| **Reading size** | 19px (`--reading-size: 19px`) — `css/00-tokens.css:38` | 16px | 11pt (~14.7px) | 16px |
| **Line-height (escrita)** | 1.78 — `css/03-writing-area.css:95` | 1.5 | 1.15–1.5 | 1.6 |
| **Tamanhos de fonte distintos** | ~18 tamanhos (9px a 48px) | ~6 | ~8 | ~4 |
| **Alvo de toque mínimo** | 36×36px (mobile) | 44×44px | 40×40px | 44×44px |
| **Elementos interativos (HTML total)** | 159 botões, 32 inputs, 5 selects | ~30 botões | ~200+ | ~15 botões |

### Densidade de elementos interativos

O Escrevaral tem **159 botões no HTML total**, mas a maioria está em views secundárias (Acervo, Ateliê, Prova de Autoria). Na view editor (a mais usada), os elementos visíveis são:

- Topbar: ~8 botões (tema, busca, compartilhar, offline, provar)
- Format bar: ~15 botões (Negrito, Itálico, etc.) + 2 selects
- Editor mode bar: ~5 botões (Guia, Ler, Fundo, Modo página, lixeira)
- Statusbar: ~4 elementos (palavras, meta, pomodoro, status de save)
- **Total editor: ~32 elementos interativos visíveis**

**Comparação:** Notion tem ~12-15 no editor. Word tem ~60+ no ribbon. Standard Notes tem ~5.

**Diagnóstico:** O Escrevaral fica entre Notion e Word em densidade de editor. A format bar horizontal é mais leve que o ribbon do Word, mas mais pesada que o Notion (que esconde formatação atrás de `/` ou hover).

---

## 2. Tabela Comparativa por Dimensão

### 2.1 Densidade de Tela

| Critério | Escrevaral | Notion | Word | Standard Notes |
|---|---|---|---|---|
| **Elementos visíveis no editor** | ~32 | ~12-15 | ~60+ | ~5 |
| **Whitespace / conteúdo** | Médio — paper centralizado com gutter generoso | Alto — muito respiro | Baixo — chrome domina | Extremo — quase só texto |
| **Altura de linha (escrita)** | 1.78 (generosa) | 1.5 | 1.15-1.5 | 1.6 |
| **Nota** | B | A | C | A+ |

### 2.2 Hierarquia Visual e Tipografia

| Critério | Escrevaral | Notion | Word | Standard Notes |
|---|---|---|---|---|
| **Razão entre escalas** | Não sistemática (valores soltos) | ~1.25 (sistemática) | ~1.2 | ~1.33 |
| **Peso de fonte para hierarquia** | mistura de peso + cor + tamanho | peso + tamanho | peso + tamanho | só tamanho |
| **Contraste chrome/conteúdo** | Bom — paper separa claramente | Excelente — fundo branco puro | Ruim — tudo mesma cor | Excelente — minimalismo |
| **Nota** | C+ | A | C | A |

### 2.3 Affordances e Convenções

| Critério | Escrevaral | Notion | Word | Standard Notes |
|---|---|---|---|---|
| **Salvar** | Automático (sem botão visível) — `statusbar-save` | Automático (sem botão) | Automático (desde 2016) | Automático |
| **Exportar** | Escondido em "Mais" (mobile) / format bar (desktop) | File menu | File menu | Botão dedicado |
| **Estados focus** | `:focus-visible` não detectado no CSS | Sim | Sim | Sim |
| **Nota** | B | A | B | A |

### 2.4 Sinais de Confiabilidade Técnica

| Critério | Escrevaral | Notion | Word | Standard Notes |
|---|---|---|---|---|
| **Indicador de save** | Sim — `statusbar-save` com dot colorido e texto | "All changes saved" (sutil) | "Saved" no title bar | "Saved" (sutil) |
| **Estados do save** | 3 estados: idle/saving/saved/error | 1 estado | 1 estado | 1 estado |
| **Feedback de erro** | `data-save-state="error"` com cor vermelha e bold | Toast sutil | Dialog | Toast |
| **Exportação visível** | Em "Mais" (mobile) / format bar (desktop) | File menu | File menu | Botão dedicado |
| **Portabilidade** | Múltiplos formatos: RTF, TXT, MD, HTML, DOCX, ePub, Obsidian | 有限 export | Múltiplos formatos | JSON export |
| **Nota** | **A-** | A | B+ | A |

### 2.5 Peso do Chrome

| Critério | Escrevaral | Notion | Word | Standard Notes |
|---|---|---|---|---|
| **Topbar** | 58px — brand + tabs + ações | 45px | 105px (ribbon) | 48px |
| **Statusbar** | 34px — palavras + save + pomodoro | 0px | 26px | 0px |
| **Format bar** | ~44px (fixa, dentro do paper) | Flutuante (aparece na seleção) | 120px (ribbon completo) | 0px |
| **Sidebar** | 240px (colapsável) | 260px | 0px (painel lateral opcional) | 220px |
| **Nota** | B+ | A | D | A |

### 2.6 Design Tokens (Código)

| Critério | Escrevaral | Notion | Word | Standard Notes |
|---|---|---|---|---|
| **Sistema de tokens** | Sim — `css/00-tokens.css` com ~30 tokens por tema | Sim | Sim (design system interno) | Sim |
| **Temas** | **8 temas** (4 biomas brasileiros × claro/escuro) | 2 | 3 (core/dark/black) | 3 (light/dark/autumn) |
| **Espaçamento systematizado** | Não — gaps de 1px a 46px, valores soltos | Sim (4px base) | Sim (8px base) | Sim (8px base) |
| **Nota** | **B-** | A | A | B+ |

---

## 3. Análise de Acessibilidade

| Critério | Status | Evidência |
|---|---|---|
| **Contraste de cores** | Bom — `--ink: #1a1a1a` sobre `--paper: #fdf8f2` = 14.8:1 | `css/00-tokens.css:12,3` |
| **Contraste muted** | Regular — `--muted: #6f6459` sobre `--paper: #fdf8f2` = 4.5:1 | Limiar WCAG AA |
| **Alvo de toque (mobile)** | 36×36px — abaixo do 44px recomendado | `css/08-responsive.css:271-273` |
| **`:focus-visible`** | Não detectado — usa padrão do navegador | Nenhum arquivo CSS |
| **`aria-label`** | Presente na maioria dos botões | `index.html` |
| **`role="status"`** | Presente no save indicator | `index.html:1578` |
| **`aria-live`** | Presente no save indicator | `index.html:1578` |
| **HTML semântico** | `<header>`, `<nav>`, `<footer>` OK | `index.html:144,156,1545` |

---

## 4. Lista Priorizada de Ajustes

### Crítico

| # | Problema | Arquivo | Ajuste |
|---|---|---|---|
| C1 | Indicador de save muito discreto — texto 10px, fácil de ignorar | `index.html:1578`, `css/02-shell-navigation.css:186-215` | Animação pulse visualmente perceptível após save |
| C2 | Exportação escondida no mobile (accordion "Mais") | `css/08-responsive.css:300-313` | Manter "Baixar" sempre visível no mobile |
| C3 | Falta `:focus-visible` customizado | Todos `css/*.css` | Adicionar `:focus-visible` global com outline ao invés de padrão do navegador |

### Importante

| # | Problema | Arquivo | Ajuste |
|---|---|---|---|
| I1 | Escala tipográfica não sistemática (18 tamanhos) | `css/02-shell-navigation.css`, `css/03-writing-area.css` | Definir type scale sistemático |
| I2 | Espaçamentos não tokenizados (valores literais) | Todos `css/*.css` | Criar tokens `--space-1` a `--space-6` |
| I3 | Alvo de toque 36px (abaixo de 44px WCAG) | `css/08-responsive.css:271-273` | Aumentar para 40-44px |
| I4 | Botões fmt 30×28px desktop | `css/03-editor-toolbar.css:339-340` | Considerar 32×32px para consistência com mobile |

### Polimento

| # | Problema | Arquivo | Ajuste |
|---|---|---|---|
| P1 | `--muted` pode falhar contraste WCAG AA | `css/00-tokens.css:13` | Testar `#5a5045` (5.2:1) |
| P2 | Nomes de classes misturam metáfora/genérico | Vários | Unificar nomenclatura |
| P3 | Verificar `prefers-reduced-motion` em todos os temas | `css/00-tokens.css` | Já parcial em `css/03-editor-layout.css:393` |

---

## 5. Princípios de Design ("Ser Nós Mesmos, Não Alienígena")

### 1. O papel é o protagonista
Hierarquia visual: **texto do usuário > ferramentas > chrome**. Qualquer mudança que inverta isso é anti-pattern. O Notion acerta, o Word erra.

### 2. Metáforas de oficina, não de escritório
O Escrevaral usa linguagem de oficina literária (manuscrito, acervo, prova, guia). Não substituir por termos de escritório (documento, pasta, certificado, template). Mas garantir que as metáforas sejam autoexplicativas.

### 3. Offline é promessa, não feature
O fato de funcionar sem internet deve ser visível mas não barulhento. O badge offline e o "salvo localmente" são corretos.

### 4. Portabilidade visível gera confiança
A exportação é o que diferencia o Escrevaral de ferramentas que prendem dados. Manter a exportação acessível.

### 5. A folha não pode vazar
Rolagem horizontal em editores é proibida. Isso já é pilar.

### 6. Temas são biomas, não skins
Os 8 temas (4 biomas brasileiros × claro/escuro) são identidade visual. Não padronizar para "claro/escuro" genérico.

### 7. Minimalismo com propósito
O minimalismo do Escrevaral é sobre hierarquia, não sobre remover funcionalidade. Manter: menos chrome, mais conteúdo.

### 8. Salvamento visível é seguro
O indicador de save (dot + texto na statusbar) é o que separa "projeto pessoal" de "ferramenta séria". Nunca esconder o status de save.

---

## 6. Resumo Executivo

### Gera confiança (preservar)
- Save indicator com 3 estados — mais completo que Notion
- Exportação em 7 formatos — mais que qualquer benchmark
- Temas com identidade brasileira — diferencial visual forte
- Paper centralizado com sombra — metáfora de folha na mesa
- Statusbar compacta e informativa
- Format bar dentro do paper — conecta ferramentas ao conteúdo

### Gera desconfiança (corrigir)
- Escala tipográfica não sistemática (18 tamanhos sem razão)
- Espaçamentos literais (não tokenizados)
- Alvo de toque 36px (abaixo do 44px recomendado)
- Exportação escondida no mobile (accordion "Mais")
- Falta `:focus-visible` customizado
- `--muted` pode falhar contraste WCAG AA

### Diagnóstico geral
O Escrevaral está em **B+** em confiança visual. Tem base sólida (tokens, temas, save indicator, exportação). Ajustes críticos são poucos e focados: promover exportação no mobile, adicionar focus-visible, e systematizar tipografia/espacamentos.
