# 04. Typew

Fonte: `/home/rafamass/projetos/Typew/` (app standalone vanilla, sem framework, offline). É a referência de **typewriter sound + imersão + pomodoro lock** para o Encore.

---

## Core de valor

```
Feature: Som de teclado em audio pool (keyclick)
O que faz: 3 sons (type/back/Enter) pré-carregados em pool de instâncias (5 type, 2 back, 1 enter) p/ latência zero; volume por pool; ignora repeat/meta/ctrl/alt; toggle global de mudo.
Formato/dados: typewriter.wav, backspace.wav, Enter.wav.
Fonte: keyclick.js
Reuso: SIM — núcleo do "som de digitação com toggle on/off" do Encore
```

```
Feature: Pomodoro com trava de tela (pomo-lock)
O que faz: timer 50min de trabalho + 6min de pausa; durante a pausa BLOQUEIA todo input do site; mostra frase de neurociência e um desafio (adivinhar autor de citação).
Fonte: pomo-lock.js + sons (pausartrabalho.mp3, voltartrabalho.mp3, Fimdopomodoro.wav, tvOn/off)
Reuso: SIM — núcleo do requisito "pomodoro 25 e 50 + trava o site + 6min de intervalo"
```

```
Feature: Modo foco (ghost-page)
O que faz: editor fullscreen com blur de fundo, borda SVG animada em gradiente âmbar, sem distrações.
Fonte: app.js + base-master.css
Reuso: REFERÊNCIA (o Encore tem modo foco próprio)
```

```
Feature: Modo leitor (ereader/reader)
O que faz: leitor tipográfico com 2 modos (paginado por colunas / scroll contínuo), 3 temas (claro, sépia, escuro), 3 fontes (Literata, Merriweather, Lato), ajuste de zoom e brilho, atalhos; detector de idioma PT/EN/FR/ES (também integrado via reader.js).
Fonte: ereader.html, reader.js
Reuso: REFERÊNCIA (o Encore usa régua de neurociência do vereda + este como base de leitor)
```

```
Feature: Estatísticas de escrita (stats)
O que faz: conta palavras, chars, sentenças e tempo de leitura (utilidade limpa via regex).
Fonte: utils.js (getStats)
Reuso: SIM
```

```
Feature: Busca textual
O que faz: busca simples via window.find; busca avançada com TreeWalker + highlight (não-conectada).
Fonte: app.js (linhas 178-186), search.js
Reuso: REFERÊNCIA
```

```
Feature: Capítulos + versionamento
O que faz: inserir/listar/navegar capítulos; salvar/restaurar até 20 versões; título do documento.
Fonte: app.js
Reuso: SIM (liked com version-engine do escrevaral)
```

```
Feature: Comandos inline (tools)
O que faz: overlay de comandos (--h, --p, --f, --save, --clear, --w Wikipedia lookup, --d dicionário).
Fonte: tools.js
Reuso: REFERÊNCIA (perspectiva de extensões)
```

---

## Visual / Sons / Ativos

```
Estética: sci-fi retro-terminal / âmbar sobre preto (#ff8a1e #080503), glow, scanlines CRT, cursor customizado; moldura de tela por 8 sprites PNG (cima/meio/baixo E/M/D). Fontes: Courier New + Lora/Merriweather/VT323.
Fonte: base-master.css, portal-intro.css, images/
Reuso: REFERÊNCIA de "idioma visual" alternativo (não o default do Encore)
```

```
Sons (mais reutilizáveis): typewriter.wav, backspace.wav, Enter.wav (teclado); tvOn.mp3/off1/off2 (transições); pausartrabalho/voltartrabalho (pomodoro); music.mp3 (ambiente); sounds/mech-keyboard-*.wav, Fimdopomodoro.wav, CryingThereminLoop*.mp3, TimeSurveillance*.mp3.
Fonte: raiz + sounds/
Reuso: ATIVO — selecionar melhores; re-comprimir p/ legado
```

> Compat: Typew é vanilla e leve, mas usa CSS moderno (backdrop-blur, gradients) e audio — deve ser simplificado p/ iPad 2012/KitKat (o Encore já planeja cores/tipografia mais simples).
