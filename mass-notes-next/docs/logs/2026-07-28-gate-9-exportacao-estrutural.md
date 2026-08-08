# Gate 9A — exportação estrutural mínima

Data operacional: 2026-07-28 (America/Sao_Paulo)

## Situação

**Concluído, publicado e verificado na preview isolada.**

- branch de fonte: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- cabeça funcional aprovada: `af032cf36a9e73e090594ddbf4cec7e29316924d`;
- workflow funcional: `30415258895` (`Mass Notes Tiptap`), verde;
- Chromium: 80 cenários aprovados;
- Firefox: 80 cenários aprovados;
- total: 160 execuções;
- build, publicação, renovação de cache e verificação pública aprovados;
- `main`, aplicação pública, service worker, engines e bases linguísticas permaneceram intactos.

Este gate não autoriza DOCX, RTF, ePub, Obsidian, exportação múltipla, cópia de segurança, restauração ou merge em `main`.

## Problema encerrado

O Next possuía apenas um exportador TXT artesanal dentro de `App.tsx`. Ele concatenava título e `plainText`, apagando a estrutura que o Tiptap já preservava.

O objetivo deste gate foi criar uma saída mínima, local e confiável sem trazer toda a complexidade do exportador legado para o primeiro corte.

## Arquitetura aprovada

### Serialização e entrega

Arquivo:

```text
mass-notes-next/src/export/documentExport.ts
```

Responsabilidades:

- declarar `ExportFormat` e `DocumentExport`;
- percorrer o JSON Tiptap;
- serializar TXT, Markdown e HTML;
- normalizar nome de arquivo;
- escapar conteúdo HTML;
- validar protocolos de links;
- criar `Blob`, URL temporária e disparar o download;
- revogar a URL depois do disparo.

A serialização é pura. A única parte com efeito de navegador é `downloadDocumentExport`.

### Interface

Arquivo:

```text
mass-notes-next/src/components/ExportPanel.tsx
```

Responsabilidades:

- apresentar os três formatos aprovados;
- explicar o uso local;
- informar honestamente o comportamento de página vazia;
- emitir somente o formato escolhido.

A interface não conhece regras de serialização.

### Estilo

Arquivo:

```text
mass-notes-next/src/styles/export-panel.css
```

Responsabilidades:

- organizar o painel dentro do rail existente;
- preservar leitura e hierarquia dos botões;
- impedir criação de CSS oportunista em `App.tsx`, `RightRail.tsx` ou temas.

### Orquestração

`App.tsx` mantém apenas um callback tipado:

```text
ExportFormat → downloadDocumentExport(documento, formato)
```

`RightRail.tsx` apenas abre a área de ferramentas e entrega a ação ao `ExportPanel`.

## Contrato dos formatos

### TXT

Preserva:

- título;
- situação e tags;
- texto de headings e parágrafos;
- citações com marcador legível;
- listas simples, numeradas e aninhadas;
- endereço de links em forma textual.

Não simula rich text que o formato não possui.

### Markdown

Preserva:

- frontmatter com título, situação e tags;
- headings;
- negrito, itálico, sublinhado em HTML inline e tachado;
- links;
- citações;
- listas simples, numeradas e aninhadas;
- Unicode e `hardBreak`.

### HTML

Preserva:

- documento autônomo em `pt-BR`;
- metadados e estilo local mínimo;
- headings, parágrafos e `hardBreak`;
- negrito, itálico, sublinhado e tachado;
- links permitidos;
- blockquotes e listas aninhadas;
- regras básicas de impressão.

Proteções:

- texto e atributos escapados;
- nenhum script autoral publicado;
- protocolos aceitos: `http`, `https`, `mailto`, `tel`;
- link rejeitado perde o vínculo, não o texto visível.

## Invariantes

Exportar não pode alterar:

- JSON Tiptap;
- HTML atual do editor;
- texto visível;
- título;
- seleção;
- histórico;
- revisão;
- estado de salvamento;
- quantidade de documentos;
- conflito entre abas;
- IndexedDB.

Página vazia continua exportável: título e metadados permanecem válidos.

## Cobertura

Suíte:

```text
mass-notes-next/tests/gate9-export.spec.ts
```

Sete cenários por navegador:

1. painel apresenta exatamente TXT, Markdown e HTML;
2. Markdown preserva estrutura e Unicode;
3. HTML é autônomo, semântico, escapado e seguro;
4. TXT mantém leitura portátil e hierarquia;
5. página vazia exporta título e metadados;
6. exportar não altera documento ou persistência;
7. painel móvel não cria overflow horizontal.

Corpus principal:

- título com acentos, barra, dois-pontos e `º`;
- heading com `&`;
- negrito, itálico, sublinhado e tachado;
- link com query string;
- blockquote;
- lista simples com lista numerada aninhada;
- emoji;
- acento combinante;
- tentativa de link `javascript:` e script incorporado.

## Incidente do lote

A primeira execução compilou normalmente e aprovou 158 testes. Dois cenários, um por navegador, falharam porque a asserção esperava:

```html
<em> azul</em>
```

O arquivo produzido continha corretamente:

```html
<strong>Casa</strong> <em>azul</em>
```

A correção ficou restrita ao teste. Nenhuma linha do exportador ou da interface foi alterada. A repetição completa terminou com 160/160 aprovações.

## Organização resultante

```text
src/
├── components/
│   └── ExportPanel.tsx
├── export/
│   └── documentExport.ts
└── styles/
    └── export-panel.css

tests/
└── gate9-export.spec.ts
```

Novos formatos devem entrar em `src/export/` e receber gate próprio. Não devem voltar para `App.tsx` nem ser implementados dentro do componente do rail.

## Próximo passo

Gate 9B proposto: cópia nativa e restauração segura.

Antes de implementar:

1. definir envelope versionado;
2. decidir política de colisão;
3. provar restauração não destrutiva;
4. separar compatibilidade `.esc` da persistência nativa;
5. manter DOCX, RTF e ePub fora deste corte.
