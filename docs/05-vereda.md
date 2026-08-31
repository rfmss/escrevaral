# 05. Vereda

Fonte: `/home/rafamass/projetos/vereda/` (protótipo ancestral da linhagem; HTML/Tailwind estático). Origem visual/design e conceitos de leitura/autoria que o Encore herda.

> São mockups de UI (sem JS de dados) — servem como **referência de design e conceito**, não código executável.

---

## Core de valor

```
Feature: Régua de leitura por neurociência (reader/reader-dark)
O que faz: régua central fixa (janela transparente ~120px com blur nas margens) que limita o campo de visão para ancorar a atenção na linha atual; barra Play/Velocidade/Ajustes. É exatamente o requisito "modo leitura com estudo de neurociência".
Formato: overlay CSS (h-[120px] janela + blur).
Fonte: reader.html, reader-dark.html (linhas ~137-144 e ~91-98)
Reuso: SIM — núcleo do "modo leitura" do Encore (régua + fontes + play + 3 ritmos)
```

```
Feature: Tipografia de leitura calma
O que faz: corpo de leitura 20px/34px, coluna limitada a 720px, margem de foco 64px. Fontes: Newsreader (serif) + Manrope (sans UI).
Fonte: index.html (tailwind.config) + writing-workspace-en.html
Reuso: REFERÊNCIA de parâmetros de leitura
```

```
Feature: Cartório Digital / Prova de Autoria Humana (PoHW)
O que faz: registro de autoria com upload de manuscrito (.txt) + prova de eventos (.proof.json), selo de "autoria humana" via SHA-256 e conceito "Proof of Human Work / Tribunal de Autoria".
Fonte: cartorio-digital.html
Reuso: CONCEITO — Encore integra com proof-engine (escrevaral) + Authoria (eskrev)
```

```
Feature: Editor com integridade humana (editor-pohw)
O que faz: toolbar de formatação, indicador "Monitoramento Ativo / Integridade 98%", botão "Certificar Obra"; cursor de escrita animado.
Fonte: editor-pohw.html
Reuso: CONCEITO de feedback de integridade
```

```
Feature: Análise linguística visual (analise / analise-linguistica)
O que faz: cores por classe gramatical no próprio texto (verbo/substantivo/adjetivo), painel de Inspeção Lexical + Academia Gramatical, barras de Densidade do Trecho (42/28/18%), e grafo de Relação de Dependência (sujeito/objeto do verbo).
Fonte: analise.html, analise-linguistica.html
Reuso: REFERÊNCIA de visualização de análise
```

```
Feature: Dashboard de foco / santuário do escritor
O que faz: temporizador, sessões por período (alvorada/meio-dia/coruja), conselhos de neurociência.
Fonte: santuario-escritor.html
Reuso: REFERÊNCIA (pomodoro/time de foco)
```

```
Feature: Organização / trilha / persona / templates (secundário)
O que faz: agenda anual com timeline de tarefas (organize-se.html); trilha de lançamento editorial com mídias (trilha-lancamento.html); mapeamento de leitor persona (persona-literaria.html); biblioteca de templates por gênero (templates.html); ensaio visual do livro (anatomia-objeto-livro.html).
Fonte: organize-se.html, trilha-lancamento.html, persona-literaria.html, templates.html, anatomia-objeto-livro.html
Reuso: REFERÊNCIA de conteúdo/rotina
```

---

## Design system (o que o Encore herda de estética)

```
Paleta (Material 3): fundo creme #fcf9f8; primária verde-sertão #17362d/#2E4D43; secundária terracota #99462a; terciária marrom #482824; dark em verdes esmeralda; headers bege #F2EFE9.
Tipografia: Newsreader serif itálico (títulos) + Manrope (UI, labels uppercase tracking-widest).
Layout: cantos arredondados pequenos, sombras sutis, blur/backdrop, ícones Material Symbols.
Fonte: cada página (tailwind.config) EX.: index.html linhas 12-100
Reuso: REFERÊNCIA — base de design do Encore (combinar com "Standard Notes + IA writing").
```

> Compat: usa CDN (Tailwind/Google Fonts) — para o Encore, vendorizar/compilar local e simplificar CSS p/ legado.
