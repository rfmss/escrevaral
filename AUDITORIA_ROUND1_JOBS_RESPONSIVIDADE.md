# Auditoria Round 1 - Guia, bordas e responsividade

Data: 2026-05-22  
Escopo: relatorio de auditoria, sem alteracao de codigo de produto.

## Persona de julgamento

Persona inspirada em Steve Jobs: obsessao por primeira impressao, reducao de ruido e coerencia entre promessa e gesto. A pergunta dela nao e "a funcao existe?", e sim: "a pessoa entende sem pensar e confia sem ser interrompida?"

Frase de julgamento:

> Nao faca a pessoa descobrir a interface. Faca a interface parecer inevitavel.

## Resumo executivo

```json
{
  "round": 1,
  "modo": "auditoria",
  "veredito": "os problemas parecem separados, mas a raiz e uma so: falta uma regua unica de momento e de margem",
  "prioridade": [
    "separar Guia de escrita de acompanhamento do guia",
    "criar contrato unico de respiro para telas internas",
    "tratar TV vertical como tablet em pe, nao como desktop pequeno nem celular grande"
  ],
  "nao_fazer": [
    "criar novo estado global pesado para o guia",
    "corrigir borda tela por tela",
    "somar breakpoints avulsos sem uma regra de responsividade"
  ]
}
```

## 1. Guia de escrita so abrir depois de texto

### Briga elegante

Codex: "Travar o guia ate haver texto e simples."

Persona Jobs: "Simples nao basta. Se o escritor escolheu um guia, ele precisa poder ver a promessa do guia antes de escrever. O que nao pode aparecer antes de texto e julgamento, nota, porcentagem ou aderencia."

Veredito: nao bloquear o **Guia de escrita** inteiro. Bloquear apenas o que depende do texto.

### Decisao recomendada

Separar mentalmente dois produtos:

```json
{
  "guia_de_escrita": {
    "pode_abrir_sem_texto": true,
    "funcao": "companhia de oficio, estrutura, ponto de partida",
    "estado_vazio": "mostra o guia escolhido sem avaliacao"
  },
  "acompanhamento_do_guia": {
    "pode_abrir_sem_texto": false,
    "funcao": "ler como o texto conversa com o guia",
    "estado_vazio": "aparece so depois de haver material"
  }
}
```

Se a decisao de produto for realmente impedir abertura antes do texto, a solucao economica e:

- guardar o bloqueio em `toggleTemplatePanel()`;
- nao criar novo controlador;
- nao criar novo estado persistido;
- usar `countWords(getActiveManuscript()?.text || writingArea.innerText)`;
- se estiver vazio, manter `state.template.open = false`;
- status humano: "Escreva uma frase para abrir o guia de escrita.";
- no botao, usar `aria-disabled="true"` e `title="Escreva uma frase para abrir o guia de escrita"` enquanto nao houver texto.

Mas o veredito de produto e outro: **guia pode existir desde o comeco; avaliacao nao.**

### Criterio de aceite

```json
{
  "manuscrito_vazio": "sem porcentagem, sem checklist, sem painel de aderencia",
  "guia_escolhido": "pode ser consultado sem invadir a folha",
  "primeira_frase": "depois de texto, o acompanhamento pode aparecer se o usuario pedir",
  "copy": "sem liberar, desbloquear, feature, template, precision ou inspector"
}
```

## 2. Textos colando nas bordas das telas

### Achado

As telas internas nao compartilham um contrato unico de margem. A classe `.view` da uma margem geral, mas varios modulos criam seus proprios grids, paineis e cards com minimos fixos. Em retrato grande e celular, cada tela passa a "encostar" de um jeito diferente.

### Causa raiz

```json
{
  "causa": "margem resolvida localmente por tela",
  "sintoma": "texto muito perto da borda em Biblioteca, Prova de autoria, Academia, Arquivo e Cronograma",
  "risco": "o site parece composto por modulos diferentes, nao por uma mesa unica",
  "arquivo_mais_provavel": "css/08-responsive.css",
  "arquivos_afetados": [
    "css/02-shell-navigation.css",
    "css/04-analysis-academy.css",
    "css/05-archive.css",
    "css/04-cronograma.css",
    "css/06-academy-tools.css"
  ]
}
```

### Solucao mais economica

Nao corrigir tela por tela. Criar uma regua de pagina:

```json
{
  "token": "--page-gutter",
  "desktop": "clamp(28px, 5vw, 72px)",
  "portrait_grande": "clamp(24px, 4vw, 44px)",
  "celular": "20px",
  "aplicacao": [
    ".view",
    ".archive-view",
    ".academy-view",
    ".certificate-paper",
    ".cronograma-wrap"
  ]
}
```

Depois, colapsar grids grandes por regra unica:

```json
{
  "ate_900px": [
    ".rimalab-tool",
    ".decolonial-tool",
    ".rights-lab",
    ".template-studio",
    ".archive-layout",
    ".split-paper"
  ],
  "ate_760px": [
    ".archive-controls",
    ".archive-strip-list",
    ".certificate-grid",
    ".proof-actions",
    ".version-panel",
    ".academy-paths",
    ".academy-book-anatomy"
  ],
  "ate_560px": [
    "tudo que ainda tiver duas colunas vira uma coluna"
  ]
}
```

### Criterio de aceite

```json
{
  "celular_390": "nenhum texto toca menos de 20px da borda",
  "tv_vertical_739": "nenhum modulo parece desktop espremido",
  "notebook_1366": "conteudo continua centralizado sem virar faixa estreita demais",
  "regressao": "editor nao perde a sensacao de folha"
}
```

## 3. Responsividade: TV, celular e notebook

### Medida objetiva por largura

```json
{
  "notebook": {
    "viewport": "1366x768",
    "comportamento_esperado": "desktop completo",
    "risco_atual": "espaco interno grande demais no editor vazio, mas aceitavel"
  },
  "tv_vertical": {
    "viewport_aproximado": "739x1360",
    "comportamento_esperado": "tablet vertical",
    "risco_atual": "topbar de desktop com conteudo de tablet; telas internas revelam bordas e grids apertados"
  },
  "celular_simulado": {
    "viewport": "390x844",
    "comportamento_esperado": "fluxo de uma coluna",
    "risco_atual": "ha regras para topbar/editor, mas muitas telas da Academia/Arquivo ainda dependem de grids grandes"
  }
}
```

### Limite do teste automatizado

O Chromium headless falhou no ambiente com erro de crashpad e nao gerou capturas. A auditoria se baseia em:

- prints da TV ja enviados;
- leitura dos breakpoints em `css/08-responsive.css`;
- leitura dos grids e minimos em `css/02-shell-navigation.css`, `css/04-analysis-academy.css`, `css/05-archive.css` e `css/04-cronograma.css`.

### Causa raiz responsiva

O site tem regras para celular pequeno e topbar, mas nao tem uma faixa explicita para **retrato grande**. A TV vertical cai num meio-termo: larga demais para regras de celular, estreita demais para grids de desktop.

### Solucao mais integrada

Criar uma camada de responsividade por papel:

```json
{
  "desktop": ">= 1024px landscape",
  "tablet_retrato": "700px a 900px em orientacao vertical",
  "celular": "<= 560px",
  "regra": "a tela decide por funcao e orientacao, nao so por largura"
}
```

Exemplo de criterio, sem inflar:

```css
@media (max-width: 900px), (orientation: portrait) and (max-width: 900px) {
  /* contratos de margem e grids de uma coluna */
}
```

## Round: placar de decisao

```json
{
  "problema_1": {
    "solucao_barata": "bloquear toggle do guia ate haver texto",
    "solucao_melhor": "guia sempre disponivel; acompanhamento so com texto",
    "vencedor": "solucao_melhor"
  },
  "problema_2": {
    "solucao_barata": "padding por tela",
    "solucao_melhor": "contrato global de respiro + colapso de grids por faixa",
    "vencedor": "solucao_melhor"
  },
  "problema_3": {
    "solucao_barata": "mais um breakpoint para celular",
    "solucao_melhor": "faixa tablet vertical / TV retrato",
    "vencedor": "solucao_melhor"
  }
}
```

## Recomendacao para Claude

Implementar nesta ordem, se a rodada virar codigo:

1. `css/08-responsive.css`: criar contrato de margem e faixa tablet vertical.
2. `css/04-analysis-academy.css`, `css/05-archive.css`, `css/04-cronograma.css`: aplicar colapso de grids sem mexer na arquitetura.
3. `app.js`: se o produto insistir em travar guia vazio, fazer o bloqueio so em `toggleTemplatePanel()`.
4. `editor-controller.js`: manter acompanhamento do guia sem render antes de texto suficiente.
5. Testar tres viewports: `1366x768`, `739x1360`, `390x844`.

Nao criar:

- novo motor;
- novo arquivo JS;
- novo estado persistido;
- nova camada de componentes;
- novo texto explicativo longo.

## Bonus: achados de harmonia

```json
[
  {
    "achado": "META_ENGINES_100.md ainda falava em revelacao progressiva",
    "impacto": "contradiz a decisao recente de tudo existir desde o comeco, cada coisa no lugar",
    "acao": "corrigir frase-guia"
  },
  {
    "achado": "CLAUDE.md ainda chama o projeto de Vereda em varios pontos",
    "impacto": "pode confundir sessoes futuras no repositorio Escrevaral",
    "acao": "decidir se docs internos continuam usando Vereda como nome historico ou se migram para Escrevaral"
  },
  {
    "achado": "RimaLab e alguns termos ainda soam tecnicos ou hibridos",
    "impacto": "fere o pilar de portugues brasileiro integral se aparecer como marca sem explicacao",
    "acao": "manter nome se for marca, mas explicar em portugues sempre"
  },
  {
    "achado": "TV vertical e um otimo proxy de tablet",
    "impacto": "mostra problemas que celular pequeno esconde e notebook perdoa",
    "acao": "adotar TV retrato como viewport oficial de aceite"
  },
  {
    "achado": "o editor esta mais maduro que as telas de apoio",
    "impacto": "a primeira impressao melhora, mas a segunda camada ainda parece menos lapidada",
    "acao": "proxima rodada deve ser harmonizacao das telas internas"
  }
]
```
