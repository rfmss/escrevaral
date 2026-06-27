# Auditorias obvias e atalhos familiares

**Data:** 2026-06-27  
**Tipo:** briefing para Claude  
**Status:** orientar auditorias futuras, sem implementar tudo de uma vez

---

## Intencao

O Escrevaral nao pode parecer uma ferramenta bonita que esqueceu o basico.

Esta frente existe para encontrar o obvio antes que uma escritora encontre: perda de dados, ambiguidade de acao, exportacao errada, importacao assustadora, nota perdida, atalho esperado que nao funciona, impressao confusa, ou diferenca mal explicada entre copia, exportacao e prova de autoria.

Regra de trabalho:

> Auditar primeiro. Implementar em pilulas pequenas. Toda melhoria precisa reduzir risco de perda de confianca.

---

## Prioridade 1 - Entrada, importacao e sobrescrita

Auditar tudo que traz texto ou acervo para dentro:

- colar texto do Word, Google Docs, navegador e PDF
- trazer do celular por QR
- importar `.esc`
- restaurar copia de seguranca
- abrir acervo depois de recarregar a pagina

Perguntas obrigatorias:

- A pessoa entende se esta somando, substituindo ou sobrescrevendo?
- A confirmacao mostra o que entra e o que sera trocado?
- Existe caminho de arrependimento antes da perda?
- A linguagem diferencia "trazer texto" de "restaurar acervo"?

Evidencia esperada:

- relatorio com fluxos testados
- pontos onde a pessoa pode achar que perdeu algo
- recomendacao minima de copy ou confirmacao

---

## Prioridade 2 - Apagar, substituir e resetar

Auditar acoes destrutivas:

- excluir manuscrito
- excluir nota ligada
- reset geral
- importar backup por cima do acervo atual
- limpar dados do navegador
- esquecer arquivo de copia automatica

Perguntas obrigatorias:

- A acao destrutiva diz exatamente o que sera apagado?
- O botao final tem verbo irreversivel claro?
- O usuario precisa confirmar nome, quantidade ou consequencia?
- O Escrevaral evita susto sem virar burocracia?

Regra:

> Acao que pode destruir acervo precisa de confirmacao proporcional.

---

## Prioridade 3 - Manuscrito, projeto e notas ligadas

O app ja tem `parentId` e cria fichas/subnotas. Auditar se a pessoa percebe o que pertence a que.

Perguntas obrigatorias:

- Uma nota ligada aparece como parte de um projeto ou parece solta?
- Ao exportar, imprimir ou copiar, fica claro se notas ligadas vao junto?
- Existe diferenca visual suficiente entre manuscrito principal e ficha?
- A pessoa consegue voltar do filho para o pai?
- A busca deixa claro se achou texto principal ou nota de apoio?

Melhoria esperada:

- mapa de relacoes visivel o bastante
- exportacao com escopo: "so este texto", "texto e notas ligadas", "escolher itens"

---

## Prioridade 4 - Saida unificada

Auditar exportacao, impressao, copia e formatos como uma unica familia de "saida".

Hoje existem saidas separadas:

- TXT
- Markdown
- HTML
- Word/DOCX
- RTF
- ePub/KDP
- Obsidian Friendly
- impressao
- copia `.esc`
- acervo completo
- prova de autoria

Perguntas obrigatorias:

- A pessoa escolhe primeiro o que sai?
- A pessoa entende a diferenca entre backup completo e exportacao parcial?
- Antes de baixar/imprimir, aparece um resumo do escopo?
- A mesma selecao pode alimentar impressao, Markdown, Obsidian e TXT?

Direcao:

```text
Primeiro: o que vai sair.
Depois: para onde vai.
Por fim: confirmar.
```

Nao misturar:

- `.esc` = copia de seguranca/restauracao
- `.md`, `.txt`, `.docx`, `.rtf`, `.epub`, impressao = saida editorial ou portabilidade
- `.prova.esc` = evidencia de autoria

---

## Prioridade 5 - Prova de autoria, backup e exportacao

Auditar se a pessoa entende tres promessas diferentes:

- copia de seguranca guarda o acervo
- exportacao leva texto para outro lugar
- prova de autoria registra evidencia

Perguntas obrigatorias:

- A prova de autoria parece backup? Se sim, corrigir.
- O backup parece prova juridica? Se sim, corrigir.
- Exportar Word/Markdown parece proteger contra perda? Se sim, corrigir.
- A pessoa sabe o que anexar quando um editor pede prova?

Critico:

> Ninguem deve sair achando que tem uma copia completa quando baixou so um texto.

---

## Prioridade 6 - Primeiro uso e estados vazios

Auditar os primeiros minutos:

- abrir pela primeira vez
- aceitar termos
- criar primeiro texto
- escolher guia
- salvar sem perceber
- entender que funciona sem internet
- encontrar copia de seguranca

Estados vazios:

- sem texto
- sem nota
- sem analise
- sem backup
- sem permissao
- sem conexao
- sem resultado de busca

Perguntas obrigatorias:

- O vazio orienta a proxima acao?
- O texto tranquiliza sem explicar demais?
- O botao principal e obvio?
- A pessoa entende que nao precisa de conta?

---

## Prioridade 7 - Atalhos familiares de editor de texto

O Escrevaral deve respeitar atalhos que uma pessoa espera de Word, Google Docs, LibreOffice e editores comuns, quando o navegador permitir.

Objetivo:

> A pessoa nao deve sentir que precisa reaprender a escrever.

Auditar primeiro, implementar depois.

### Atalhos basicos esperados

- `Ctrl+B` - negrito
- `Ctrl+I` - italico
- `Ctrl+U` - sublinhado, se existir suporte visual coerente
- `Ctrl+Z` - desfazer
- `Ctrl+Y` ou `Ctrl+Shift+Z` - refazer
- `Ctrl+A` - selecionar texto
- `Ctrl+C` - copiar
- `Ctrl+X` - recortar
- `Ctrl+V` - colar
- `Ctrl+S` - guardar/copia rapida, sem abrir salvamento confuso do navegador
- `Ctrl+P` - imprimir o manuscrito, se houver texto ativo
- `Ctrl+F` - buscar no texto ou busca global, com cuidado para nao brigar com busca do navegador

### Atalhos editoriais uteis

- `Ctrl+K` - inserir/editar link, se houver suporte
- `Ctrl+Alt+1`, `Ctrl+Alt+2`, `Ctrl+Alt+3` - titulos, se o editor tiver blocos
- `Ctrl+Shift+7` - lista numerada, se houver suporte
- `Ctrl+Shift+8` - lista com marcadores, se houver suporte
- `Tab` e `Shift+Tab` - recuo, apenas se nao quebrar acessibilidade/foco

### Atalhos de produto possiveis

So implementar se forem descobertos, documentados e nao conflitarem:

- alternar foco
- abrir acervo
- abrir guia
- abrir prova de autoria
- exportar texto atual
- abrir painel de saida

Regra:

> Atalho de produto nao deve competir com atalho universal de escrita.

### Cuidados tecnicos

- Alguns atalhos pertencem ao navegador ou sistema operacional.
- Nao impedir comportamento padrao sem necessidade.
- Atalhos devem funcionar quando o foco esta no editor.
- Fora do editor, atalhos globais precisam ser poucos e previsiveis.
- Em mobile, nao depender de atalho para acao principal.
- Toda acao por atalho precisa ter botao visivel equivalente.

### Copy de ajuda minima

Nao criar tutorial grande. Se houver ajuda, preferir uma lista discreta:

```text
Atalhos conhecidos
Ctrl+B negrito
Ctrl+I italico
Ctrl+S guardar agora
Ctrl+P imprimir
```

Usar apenas se a interface ja tiver lugar natural para isso.

---

## Ordem recomendada de auditoria

1. Importacao e sobrescrita
2. Apagar/resetar/restaurar
3. Manuscrito e notas ligadas
4. Saida unificada
5. Prova de autoria versus backup versus exportacao
6. Primeiro uso e estados vazios
7. Atalhos familiares

Motivo:

Primeiro proteger confianca e dados. Depois melhorar fluidez.

---

## Formato do relatorio que Claude deve entregar

Para cada auditoria:

```text
Area auditada:
Fluxos testados:
Achados P1:
Achados P2:
Obvio que faltava:
Menor correcao segura:
Arquivos provaveis:
Risco se mexer:
Criterio de aceite:
```

Nao implementar junto com a auditoria, a menos que a tarefa peca explicitamente.

---

## Criterio geral de aceite

Uma escritora deve conseguir:

1. escrever sem reaprender o basico
2. saber onde o texto esta
3. saber o que vai sair antes de exportar ou imprimir
4. saber quando esta fazendo backup completo
5. entender quando uma acao pode apagar ou substituir algo
6. usar atalhos familiares sem surpresa

