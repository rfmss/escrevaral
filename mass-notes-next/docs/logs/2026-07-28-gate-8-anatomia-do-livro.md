# Gate 8 — Anatomia do Livro integrada ao Mass Notes

Data operacional: 2026-07-28 (America/Sao_Paulo)

## Situação

**Concluído e publicado na preview isolada.**

- branch de fonte: `experiment/mass-notes-tiptap`;
- PR: `#155`, rascunho;
- commit funcional final: `d7d079e9d8970f9cf6380bb11f7bf39520bdb96c`;
- workflow final observado: `30409965734` (`Mass Notes Tiptap`), verde;
- Chromium: 73 cenários aprovados;
- Firefox: 73 cenários aprovados;
- total: 146 execuções;
- build, publicação, renovação de cache e verificação pública aprovados;
- `main` e a aplicação pública permaneceram intactas.

Este gate não autoriza merge em `main`, reconstrução da página nem edição manual da branch pública de preview.

## Arquitetura aprovada

### Fonte preservada

O arquivo recebido do usuário permanece em:

```text
anatomia-original.html
```

Ele contém a experiência original completa e as duas imagens PNG incorporadas como Data URI. Não deve ser substituído por versões parecidas, por artefatos de outro PR ou por wrappers intermediários.

### Runtime leve

A CI gera:

```text
mass-notes-next/public/anatomia-do-livro.html
```

O gerador oficial é:

```text
scripts/build-anatomia-runtime.py
```

O script:

1. lê `anatomia-original.html`;
2. extrai exatamente duas imagens PNG incorporadas;
3. converte os assets para WebP;
4. substitui as Data URIs por caminhos locais;
5. aplica a correção do modo embutido;
6. protege o menu contra eventos tardios do StPageFlip;
7. valida marcadores obrigatórios e dependências proibidas;
8. limita o HTML gerado a menos de 500 KB.

Assets gerados:

```text
mass-notes-next/public/assets/anatomia/anatomia-asset-1.webp
mass-notes-next/public/assets/anatomia/anatomia-asset-2.webp
```

O runtime publicado não pode conter:

- `data:image/png;base64`;
- `atob(`;
- referência a `anatomia-original.html`;
- loader ou wrapper intermediário.

### Integração com o editor

A Anatomia abre dentro de um iframe, enquanto o editor Tiptap permanece montado. O retorno à mesa de escrita preserva o título e o estado do documento.

O modo embutido adiciona `is-embedded` ao elemento raiz e corrige a grade para que:

- o cabeçalho interno fique oculto;
- o título não seja cortado;
- a hero mantenha sua altura;
- o layout comece abaixo da hero;
- o índice role dentro do painel;
- o palco não invada o topo.

### Estado do menu

O StPageFlip pode emitir um evento `flip` depois que a interface já voltou do miolo para uma seção exterior.

O handler deve ignorar esse evento quando:

```text
o palco não está em uses-pageflip
ou
selectedInteriorIndex é null
```

Esse guard impede que um evento obsoleto reative “Falsa folha de rosto” depois do clique em “Capa”. Ele não deve ser removido sem uma regressão equivalente.

## Workflow oficial

A única fonte de publicação da preview é:

```text
.github/workflows/mass-notes-tiptap.yml
```

Fluxo:

```text
branch experimental
→ gerar runtime
→ build
→ Chromium e Firefox
→ publicar dist
→ renovar cache
→ verificar endereço público
```

A branch `preview-mass-notes-tiptap` é produto de build. Correções definitivas nunca devem ser feitas diretamente nela.

## Cobertura do gate

A suíte `mass-notes-next/tests/gate8-anatomy-transition.spec.ts` cobre:

- fundo Blueprint restrito ao canvas;
- abertura por Ferramentas;
- editor mantido montado;
- título e geometria do iframe;
- capa 3D e entrada no miolo;
- retorno miolo → Capa sem regressão tardia;
- runtime direto e leve;
- movimento reduzido;
- viewport móvel sem overflow horizontal;
- Chromium e Firefox.

## Limpeza deste lote

O workflow `.github/workflows/fix-anatomia-preview.yml` era uma ferramenta temporária de depuração. Ele fazia checkout da branch pública e tentava escrever nela diretamente, além de depender de um script que não pertence à arquitetura final.

Esse workflow deve ser removido. A publicação permanece exclusivamente sob `Mass Notes Tiptap`.

## Próximo passo

Não reconstruir a Anatomia.

Antes de iniciar outro gate funcional:

1. manter este gate como referência de páginas especiais integradas;
2. revisar o PR #155 e a memória viva do projeto;
3. decidir explicitamente entre ampliar a Prensa de Entrada ou voltar às frentes funcionais do Mass Notes;
4. preservar Chromium como caminho avançado e Firefox como fallback funcional;
5. continuar exigindo build, dois navegadores, publicação e verificação pública antes de declarar conclusão.
