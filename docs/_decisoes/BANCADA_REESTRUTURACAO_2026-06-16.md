# Bancada / Academia — auditoria de reestruturação

**Data:** 2026-06-16  
**Contexto:** auditoria de arquitetura de informação e escopo da aba `academia` / rótulo visível `Bancada`.

**Decisão de naming aplicada depois da auditoria:** o rótulo visível passou de `Bancada` para `Ateliê`, mantendo a rota interna `academia` para reduzir risco técnico.

---

## Diagnóstico

A área hoje mistura, no mesmo fluxo:

- guias de ofício e descoberta de formatos
- ferramentas que leem o manuscrito ativo
- oficinas especializadas como RimaLab
- consulta editorial e biblioteca embutida
- direitos autorais e trilha de publicação

Isso cria uma promessa difusa. O nome `Bancada` sugere ferramenta de trabalho. A tela real funciona como hub de aprendizado, revisão, consulta e mercado editorial ao mesmo tempo.

---

## Problema central

O problema principal não é visual. Os grids e cartões estão contidos e responsivos. O problema é semântico:

- o rótulo não antecipa o escopo
- a ordem privilegia descoberta antes de tarefa
- ferramentas contextuais ao manuscrito convivem com conteúdo independente dele
- tabs internas agrupam produtos com modelos mentais diferentes

Resultado: a pessoa entra sem saber se veio para revisar, aprender, treinar, consultar ou planejar publicação.

---

## Reorganização recomendada

### 1. Análise

Conteúdo:

- Espelho de Voz
- análise geral do manuscrito
- observador de vocabulário

Missão:

Ler o texto ativo e devolver sinais de revisão.

### 2. Oficinas

Conteúdo:

- RimaLab
- Treino

Missão:

Praticar forma, ritmo e experimentação.

### 3. Guias

Conteúdo:

- guia de ofícios
- leitura editorial
- biblioteca da escrita

Missão:

Ensinar estrutura, repertório e técnica.

### 4. Publicação e direitos

Conteúdo:

- mercado editorial
- objeto livro
- direitos do autor

Missão:

Preparar circulação, contrato, prova e objeto editorial.

---

## Ordem provisória, se a tela única permanecer

Se a arquitetura maior ainda não puder ser separada em múltiplas áreas, a ordem interna recomendada é:

1. `Continuar com o texto atual` + ferramentas contextuais ao manuscrito
2. `Ferramentas que leem seu texto`
3. `Oficinas`
4. `Guias e referências`
5. `Publicação e direitos`

Essa ordem troca uma página-vitrine por uma página de trabalho.

---

## Nome

`Bancada` era fraco para o escopo atual. Opções mais coerentes avaliadas:

- `Estúdio`
- `Oficina`
- `Ateliê` — escolhido

Se a divisão em áreas acontecer, o melhor caminho é nomear cada área pela tarefa, e não tentar manter um guarda-chuva amplo demais.

---

## Especialidades mobilizadas

- Product design / arquitetura de informação
- UX writing / estratégia de conteúdo
- Frontend
- Pesquisa UX
- Edição / processos editoriais
- Consultoria jurídica pontual para o eixo de direitos

---

## Decisão recomendada

Não expandir a `Bancada` como página única. A partir daqui, qualquer nova funcionalidade deve entrar já vinculada a um dos quatro eixos acima, para evitar que `academia` continue funcionando como depósito de tudo o que não cabe no editor.
