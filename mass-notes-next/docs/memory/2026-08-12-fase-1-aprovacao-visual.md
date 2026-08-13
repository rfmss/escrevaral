# FASE 1 — aprovação visual da tela de escrever

**Data:** 2026-08-12  
**Estado:** `visual_approved`  
**Gate humano:** aprovado explicitamente pela responsável pelo produto — **“Sim”** à pergunta “Você abriria essa tela e teria vontade de começar a escrever?”  
**Branch de referência antes deste registro:** `experiment/mass-notes-tiptap` @ `5096a2515c25f3398479893b4cc7247e92d70db4`

## Decisão

A exploração visual da **FASE 1 — tela de escrever** está encerrada.

Não voltar ao Stitch para “melhorar” esta tela por preferência estética. A referência aprovada deve agora ser **transplantada com o menor diff possível para o React/Tiptap real** e só volta a ser discutida se o uso da implementação revelar um problema concreto de ergonomia, acessibilidade ou comportamento.

A tese aprovada permanece:

> **ESCREVER = silêncio, tipografia, respiro, texto e cursor.**  
> **EXAMINAR = oficina, Blueprint, instrumentos, evidência e contexto.**

A pergunta humana que fechou o gate foi:

> **“Você abriria essa tela e teria vontade de começar a escrever?”**

Resposta: **Sim.**

## Referência congelada

Pacote Stitch da rodada aprovada: `stitch_escrevaral_writing_state (1).zip`.

Fingerprints locais observados no momento da aprovação:

- `screen.png`: SHA-256 `8f6e54349f7b2ce1f1dc03e5f2c2fa0977a20df1cddb468228dc147847fbcb9a`
- `code.html`: SHA-256 `df6d100611a81d40f7b11204853e963cea0a6bf9a85f24eab3647b930d174d26`
- `DESIGN.md`: SHA-256 `a00cd89ca3f8d8d6a5326e6fd4bd0256f0a8626b8d1bef05b7fd0171e9d648bf`

O screenshot gerado pelo Stitch saiu em `1600×1280`, apesar de o pedido ter sido `1440×900`. Por isso, **o screenshot é referência de composição, não prova de responsividade**. A implementação real deve ser validada em `1440×900` e `1366×768`.

## O que está aprovado visualmente

### 1. Superfície

- fundo quente/off-white muito discreto, próximo de `#fbf9f4`;
- sem folha falsa, card, sombra ou borda de papel;
- sem grid Blueprint sob a prosa;
- a viewport inteira funciona como ambiente de escrita.

### 2. Coluna do manuscrito

- largura deliberada, próxima de `720px` no protótipo;
- o monitor maior gera respiro, não linhas mais longas;
- texto cresce para baixo a partir de uma âncora estável;
- **não** centralizar verticalmente o bloco inteiro conforme o documento cresce.

Referência do protótipo:

```css
max-width: 720px;
margin-top: 30vh;
```

`30vh` é ponto de partida visual, não contrato rígido. A implementação deve preservar a sensação de âncora aproximadamente no primeiro terço da viewport e testar scroll/documentos longos.

### 3. Tipografia de escrita

A rodada aprovada usou **Source Serif 4** apenas como referência de sensação, em aproximadamente:

```text
19.5px / 33px
```

Decisão aprovada: o corpo deve parecer **texto sendo escrito**, não página final diagramada.

A fonte do Stitch **não está automaticamente autorizada como dependência de produção**. O produto não deve importar Google Fonts por CDN. Na implementação, usar fonte local/dependência já aprovada ou escolher equivalente local que preserve a métrica e a sensação.

### 4. Título

- pequeno;
- discreto;
- claramente subordinado à prosa;
- funciona como coordenada privada do documento, não como capa/editorial hero.

### 5. Chrome residual

A composição aprovada deixa quase tudo desaparecer.

Podem permanecer, em peso visual mínimo:

- marca/nome Escrevaral quase fantasmagórico;
- um affordance discreto para revelar o restante da oficina;
- estado de autosave (`Salvo`) quase silencioso.

Não colocar permanentemente nesta tela:

- Acervo;
- RightRail;
- tabs de Palavras/Revisão/Contexto/Voz/RimaLab;
- métricas;
- contagem de palavras;
- outline;
- toolbar de formatação;
- cards;
- Blueprint técnico.

### 6. Cursor e seleção

A ideia visual do cursor em teal, próximo de `#006972`, foi aprovada como acento ativo restrito.

O cursor falso do HTML Stitch **não deve ser copiado**. Tiptap/ProseMirror deve manter cursor/seleção reais e acessíveis; a decisão aprovada é apenas a linguagem visual do acento.

### 7. Autosave

- sem botão grande `SALVAR`;
- estado legível quando procurado e quase invisível durante a escrita;
- comportamento real existente de autosave/recovery/conflito permanece inalterado.

## Limites da aprovação

Este gate aprova **a direção visual da tela de escrita**, não:

- o HTML/CSS gerado pelo Stitch;
- Tailwind CDN;
- Google Fonts remotas;
- Material Symbols remotos;
- o cursor artificial do protótipo;
- o tamanho de screenshot retornado pelo Stitch;
- uma reconstrução do editor;
- nova arquitetura de navegação;
- Foco;
- Acervo;
- ferramentas linguísticas;
- mobile.

## Contratos técnicos que a implementação não pode quebrar

Preservar integralmente:

- Tiptap/ProseMirror e JSON autoral;
- contrato de posições;
- IndexedDB;
- autosave e recovery;
- conflito entre abas sem sobrescrita silenciosa;
- invalidação correta das leituras quando o manuscrito muda;
- importação/exportação;
- drawers e funcionalidades existentes, ainda que ocultos no repouso;
- acessibilidade;
- Chromium + Firefox;
- preview apenas via workflow.

## Próxima ação autorizada

**Implementar a FASE 1 no produto real.**

Ordem:

```text
mapear App/Library/RightRail/MassNotesEditor/CSS atual
        ↓
identificar o menor conjunto de mudanças de composição e CSS
        ↓
materializar o estado de repouso aprovado
        ↓
validar 1440×900 e 1366×768
        ↓
rodar testes focados + matriz integral
        ↓
uso humano da preview real
        ↓
fechar FASE 1 somente se a sensação sobreviver à implementação
```

Não abrir a FASE 2 — Foco — antes da aprovação humana da **implementação real**.
