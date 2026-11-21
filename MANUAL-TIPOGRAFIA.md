# Manual de Tipografia, Escala e Linguagem · Escrevaral

Este manual define o sistema tipográfico soberano do Escrevaral para garantir leitura confortável (15 a 75 anos), contraste AAA sobre o **Papel digital E-Ink Sálvia (`#c4cfc2`)** e coerência visual em todas as telas.

---

## 1. Regra das 3 Fontes (máximo no projeto)

| Papel | Token CSS | Família | Onde usar | Onde **NÃO** usar |
| --- | --- | --- | --- | --- |
| **Interface (UI)** | `--esc-font-ui` | `Arial, Helvetica, sans-serif` | Menus, barra lateral, botões, abas, chips, filtros, etiquetas de classe/sintaxe, contadores, cartões do *Examinar*, explicações de *Por dentro do texto*, *Academia* e *Ajustes*. | Corpo do manuscrito literário. |
| **Leitura e Texto Literário** | `--esc-font-serif` | `'Noto Serif', Georgia, 'Times New Roman', serif` | Manuscrito no editor, palavras do texto do autor nas pílulas/trechos analisados, citações literárias, *Modo Leitor*, títulos de obra e impressão A4. | Botões de ação, filtros, barras de navegação e etiquetas pequenas. |
| **Máquina de Escrever** *(exclusiva)* | `--esc-font-mono` | `'Courier Prime', 'Courier New', monospace` | **Exclusivamente** no editor quando o autor ativa o modo *Máquina de escrever* (`body[data-letter="maquina"]` / `data-machine="true"`), e em hashes técnicos SHA-256 no *Cartório*. | **Proibida** em botões, rótulos, cabeçalhos, filtros, steppers, pílulas ou explicações da Oficina. |

---

## 2. Escala Tipográfica (6 degraus)

| Degrau | Token CSS | Tamanho | Altura de linha | Uso canônico |
| --- | --- | --- | --- | --- |
| **XS** | `--esc-text-xs` | `11px` | `1.25` | Etiquetas de classe/função nas pílulas, selos discretos, micro-badges. |
| **SM** | `--esc-text-sm` | `12.5px` | `1.45` | Chips de filtro, botões secundários, ajuda curta, metadados, rodapés. |
| **BASE** | `--esc-text-base` | `14px` | `1.55` | Texto padrão da interface, cartões do *Examinar*, explicações em *Por dentro do texto*. |
| **MD** | `--esc-text-md` | `16px` | `1.35` | Palavras do texto do autor nas pílulas anotadas (`--esc-font-serif`) e título da seleção lateral. |
| **LG** | `--esc-text-lg` | `20px` | `1.3` | Subtítulos de seção e cabeçalhos de painel. |
| **XL** | `--esc-text-xl` | `26px` | `1.22` | Título principal do manuscrito (`--esc-font-serif`). |

---

## 3. Pilares de Contraste e Hierarquia

1. **Contraste mínimo AA/AAA sobre `#c4cfc2`**: texto principal em `#151d15` (contraste > 11:1) e texto de apoio em `#2c3a2c` (contraste > 7.5:1). Nunca usar cinza lavado ou opacidade abaixo de `0.45` em texto legível.
2. **Seleção sem inversão brutal**: pílulas de palavra/sintaxe selecionadas preservam seu fundo claro legível e destacam-se por borda firme (`2px solid #1e3325`) e halo suave — nunca por blocos pretos sobre texto colorido.
3. **Alinhamento em grade**: os cartões da abertura do *Examinar* organizam-se em grade equilibrada de 2 colunas (1 coluna no mobile), com altura compacta e tipografia única (`--esc-font-ui`).

---

## 4. Linguagem Humana (neutralização para o público geral)

Termos internos do motor de análise **ficam nos bastidores** (ou recolhidos em *Detalhes técnicos* para quem desejar auditar). Para quem escreve:

- Nunca exibir `· LÉXICO`, `AMBÍGUA`, `SEM LEITURA`, `determinante (UD)` ou `"deste incremento"` na camada visível.
- Quando uma palavra tem uma classe definida: exibir apenas a classe limpa (`Verbo`, `Pronome`, `Substantivo`, `Adjetivo`…).
- Quando uma palavra pode assumir mais de uma classe: etiqueta **`Ver contexto`** e explicação direta — *"Pode ser pronome, conjunção ou advérbio — verifique o contexto da frase."*
- Quando uma palavra não consta no acervo local: etiqueta **`Fora do acervo`** e orientação neutra — *"Palavra fora do acervo local — verifique pelo contexto da frase."*
