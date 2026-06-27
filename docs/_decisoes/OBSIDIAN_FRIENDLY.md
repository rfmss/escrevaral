# Escrevaral amigo do Obsidian

**Data:** 2026-06-27  
**Tipo:** decisão de produto  
**Status:** proposta aprovada para guiar implementação futura

---

## Decisão

O Escrevaral deve tratar o Obsidian como uma casa natural para a memória longa da escritora, sem depender dele para funcionar.

Essa amizade deve existir como compatibilidade de formato, não como plugin. O caminho certo é uma exportação especializada, em Markdown limpo, que possa virar um vault do Obsidian imediatamente.

O produto continua sendo offline-first, privado e sem conta. A integração com Obsidian deve respeitar essa promessa.

---

## Formulação curta

O Escrevaral escreve, cuida e organiza o manuscrito.  
O Obsidian guarda a rede de pensamento em volta dele.

---

## Escopo

Criar uma opção de exportação:

**Exportar para Obsidian**

Essa exportação deve gerar uma pasta ou `.zip` com estrutura de vault, sem exigir plugin, login, sincronização ou internet.

Estrutura sugerida:

```text
escrevaral-obsidian/
  README.md
  manuscritos/
    titulo-do-manuscrito.md
  notas/
    diario-de-escrita.md
    personagens.md
    cenas.md
    referencias.md
  autoria/
    prova-de-autoria.md
  dados/
    metadados.json
```

Os arquivos `.md` devem abrir bem em qualquer editor Markdown. O ganho no Obsidian vem de links, propriedades e organização, não de dependência técnica.

---

## Formato dos manuscritos

Cada manuscrito exportado deve ter frontmatter simples:

```md
---
origem: escrevaral
tipo: manuscrito
titulo: "Titulo do manuscrito"
data_exportacao: 2026-06-27
palavras: 0
tags: [escrevaral, manuscrito]
---
```

Depois do frontmatter, entra o texto da pessoa, sem comentários técnicos e sem marcações que prendam o arquivo ao Escrevaral.

---

## Links e compatibilidade

Para o material exportado ao Obsidian, aceitar wikilinks quando eles forem úteis:

```md
[[personagens]]
[[cenas]]
[[diario-de-escrita]]
```

Para a documentação interna do repositório, preferir links Markdown relativos:

```md
[Manual de Continuidade](../MANUAL_DE_CONTINUIDADE.md)
```

Regra: o repo precisa continuar legível no GitHub e por agentes; o vault exportado pode ser mais Obsidian.

---

## O que não fazer agora

- Não criar plugin do Obsidian no primeiro ciclo.
- Não exigir que a pessoa tenha Obsidian instalado.
- Não enviar texto para serviço externo.
- Não criar sincronização automática.
- Não misturar notas pessoais da usuária com arquivos internos do Escrevaral.
- Não exportar `.obsidian/` por padrão.

---

## Fora de escopo

Plugin do Obsidian fica fora de escopo.

Motivo:

- aumenta manutenção
- exige conhecer APIs e ciclo de publicação do Obsidian
- cria expectativa de suporte técnico
- desvia energia do valor principal do Escrevaral
- pode assustar uma pessoa que só quer exportar e guardar bem

A melhor amizade é o formato certo.

---

## Critério de aceite

Uma pessoa deve conseguir:

1. exportar do Escrevaral
2. abrir a pasta no Obsidian como vault
3. ler o manuscrito e as notas sem instalar plugin
4. mover a pasta para outro computador ou distro
5. continuar dona dos arquivos

---

## Implementado em v859 (2026-06-27)

**Primeiro passo:** exportação de manuscrito individual como `.md` com frontmatter amigável ao Obsidian.

- Botão "Obsidian" na seção Exportar do Acervo
- Float explicativo em 3 passos: "Como levar para o Obsidian?"
- Frontmatter: `title`, `criado`, `tipo`, `situacao`, `autor`, `palavras`, `tags`, `fonte: "Escrevaral"`
- Wikilinks nas tags: `[[tag]]`
- Arquivo nomeado `escrevaral/[slug].md`

---

## Próximos passos — Saída Unificada (decisão do codex, 2026-06-27)

O codex propõe criar uma **camada única de pacote de saída** que cubra todos os formatos:

**Estrutura do pacote:**
```js
const pacote = {
  escopo: "texto-com-notas-ligadas",
  itens: [
    { tipo: "manuscrito", id: "m1", titulo: "Meu romance", conteudo: "..." },
    { tipo: "nota", id: "n1", titulo: "Personagens", conteudo: "..." },
    { tipo: "autoria", id: "a1", titulo: "Prova de autoria", conteudo: "..." }
  ],
  metadados: { origem: "escrevaral", data: "2026-06-27" }
};
```

**Fluxo de 3 passos:**
1. **Seleção:** Só este texto / Este texto com notas ligadas / Projeto inteiro / Acervo / Escolher itens
2. **Destino:** .txt / .md / Obsidian / Imprimir-PDF / Cópia de segurança / Levar para outro dispositivo
3. **Revisão:** Prévia do que vai sair antes de confirmar

**Regra de produto:** nenhuma exportação pode incluir material que a pessoa não viu ou não confirmou.

Para a primeira expansão, dois botões simples:
```
Exportar só este texto
Exportar este texto com notas ligadas
```
Com link discreto: "Escolher itens..."
