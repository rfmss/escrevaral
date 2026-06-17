# Auditoria — Acervo / superfícies duplicadas

**Data:** 2026-06-16  
**Área:** `Arquivo` / `Acervo`  
**Status:** auditoria encerrada por Codex; pronta para implementação por Claude

---

## Recado operacional

Claude: esta auditoria já terminou. O próximo passo recomendado está detalhado abaixo em formato de pílula de execução. Pode pegar sem depender de novo recado do usuário.

---

## Achado central

O `Arquivo` mostra o mesmo conjunto de documentos em superfícies demais antes de chegar ao grid canônico do acervo.

Hoje a página abre com:

- `Fixados`
- `Em andamento`
- `Recentes`
- grid principal do acervo
- painel lateral de detalhe

Trechos relevantes:

- [index.html](/home/rafamass/escrevaral/index.html:606)
- [index.html](/home/rafamass/escrevaral/index.html:611)
- [archive-controller.js](/home/rafamass/escrevaral/archive-controller.js:257)
- [css/05-archive.css](/home/rafamass/escrevaral/css/05-archive.css:364)

Na prática, a mesma nota pode aparecer:

- num strip de fixados
- num strip de andamento
- num strip de recentes
- no grid principal

Isso aumenta o custo de varredura e enfraquece a sensação de “lugar único onde meus arquivos moram”.

---

## Impacto

- o topo da página vira curadoria demais e arquivo de menos
- o grid principal perde o papel de fonte única de verdade
- a usuária gasta energia decidindo “qual versão da mesma lista usar”
- em telas menores, a rolagem até o acervo real fica mais longa do que precisa

---

## Melhoria recomendada

### Substituir os 3 strips por 1 strip de retomada

Proposta:

- remover a abertura simultânea de `Fixados`, `Em andamento` e `Recentes`
- criar um único bloco de topo: `Retomar agora`
- limitar esse bloco a no máximo 3 itens
- priorizar nesta ordem:
  1. documento aberto no editor e ainda não concluído
  2. fixados recentes
  3. atualizados recentemente

O restante continua no grid principal, que volta a ser a superfície canônica do acervo.

---

## Escopo conservador

Não precisa mudar o modelo de dados.

Basta:

- trocar a composição dos strips em `archive-controller.js`
- ajustar a marcação de topo em `index.html`
- simplificar os estilos dos strips em `css/05-archive.css`

---

## Critérios de aceite

- o topo do `Arquivo` mostra apenas um bloco resumido de retomada
- o grid principal continua exibindo o acervo completo filtrável
- nenhuma nota aparece duas ou três vezes acima do grid
- mobile chega mais rápido ao acervo real
- fixados continuam existindo como atributo, não como superfície separada

---

## Pílula pronta para Claude

### PIL-ARQ-01 — Unificar strips do Acervo

**Objetivo:** reduzir duplicação de superfícies no `Arquivo`

**Arquivos-alvo:**

- `index.html`
- `archive-controller.js`
- `css/05-archive.css`

**Passos sugeridos:**

1. substituir as três `<section>` de topo por uma única seção `retomar`
2. criar um renderer único em `archive-controller.js`
3. manter o grid principal intocado nesta rodada
4. verificar empty state e mobile

**Risco:** baixo a médio  
**Não mexer nesta pílula:** backup, exportação, painel lateral, filtros
