# Gate 7 — marcações somente de leitura da Revisão

## Situação

**Aprovado para avaliação manual e continuidade experimental em 2026-07-28.**

- branch: `experiment/mass-notes-tiptap`;
- pull request: `#155` (rascunho);
- cabeça funcional validada: `5e7017ddefc634018daf6071ff8b04a3afe5f9cc`;
- workflow final: `30367072054`;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública, `main` e service worker: intactos.

A aprovação encerra o gate técnico e autoriza avaliação manual na preview. Não autoriza merge, publicação, aplicação automática de sugestões nem expansão das marcações para outras engines.

## Objetivo

Provar uma primeira projeção linguística inline sobre Tiptap/ProseMirror sem transformar a análise em edição automática e sem reabrir a infraestrutura artesanal de rich text.

A Revisão foi escolhida como única engine inicial porque já devolve parte das observações com fragmento e posição verificáveis.

## Contrato aprovado

Uma observação só pode virar marcação quando:

1. pertence ao documento atual;
2. foi calculada sobre a assinatura estrutural atual;
3. possui posição inteira e range não vazio;
4. o fragmento devolvido pela engine coincide exatamente com o texto derivado naquele range;
5. o contrato converte o range textual em posições válidas do ProseMirror.

Quando qualquer verificação falha, a observação pode permanecer como leitura geral, mas não recebe marca inline nem navegação falsa.

## Implementação

- extensão ProseMirror isolada em `src/editor/reviewDecorations.ts`;
- `DecorationSet` mantido fora do documento autoral;
- classes e metadados somente de apresentação;
- `pointer-events: none` nas marcas;
- adaptador da Revisão preservado, sem alteração da engine original;
- cartões localizados separados das observações gerais;
- botão “Ir ao trecho” seleciona e revela o range exato;
- controle “Ocultar marcas / Mostrar marcas” altera apenas a apresentação;
- qualquer transação que muda o documento limpa as projections;
- troca de documento, restauração ou nova leitura substituem o conjunto anterior.

## Integridade comprovada

- nenhuma marca entra no JSON Tiptap;
- nenhuma marca entra no HTML persistido;
- texto e `contentSignature` permanecem idênticos antes e depois da leitura;
- não há botão de aplicar, substituir ou corrigir automaticamente;
- editar o manuscrito invalida imediatamente leitura e ranges antigos;
- trocar de documento não transporta marca ou navegação;
- posição ou fragmento não verificável nunca produz decoration;
- ocultar marcas preserva cartões, leitura e conteúdo;
- restaurar marcas não recalcula nem edita o texto.

## Casos editoriais cobertos

- pontuação localizada em português brasileiro;
- emoji antes do range;
- emoji com modificador e ZWJ;
- `hardBreak` dentro do mesmo bloco;
- ocorrências repetidas do mesmo fragmento;
- decorations sobrepostas;
- documento alterado depois da análise;
- troca de documento;
- resposta defensiva da engine com posição inválida;
- viewport móvel de 390 px.

### Decorations sobrepostas

Ranges linguísticos podem se sobrepor. O ProseMirror pode dividir ou fundir atributos DOM ao renderizar decorations inline sobrepostas. Por isso, a forma do DOM não é usada como contrato de produto.

O gate valida o comportamento observável:

- existem dois cartões para duas ocorrências;
- existem dois comandos de navegação;
- cada comando seleciona o fragmento correto no bloco correspondente;
- o manuscrito permanece íntegro.

## Linguagem visual e acessibilidade

- análise usa `--ui-analysis`, não a cor de seleção;
- severidades alteram intensidade sem criar semântica de correção automática;
- marcas não capturam mouse ou toque;
- cartões fornecem texto, regra, fragmento e ação explícita;
- ocultação possui estado `aria-pressed`;
- o controle fica no painel contextual de Revisão;
- mobile preserva largura, alvos de toque e navegação.

Leitor de tela real ainda não foi auditado e permanece limitação conhecida. O gate cobre semântica automatizada e operação por teclado, mas não declara conformidade além da evidência disponível.

## Confiabilidade da preview

A tela branca observada na avaliação revelou risco de HTML em cache apontar para assets antigos removidos após force-push.

Foram adotadas as seguintes proteções:

- nomes estáveis `assets/index.js` e `assets/index.css`;
- fallback HTML visível durante o carregamento;
- mensagem de falha quando o bundle não monta a aplicação;
- limpeza best-effort do cache da raw.githack após publicar;
- smoke test do endereço público, verificando HTML, JavaScript e CSS antes de encerrar o workflow.

A preview continua experimental e isolada, mas a CI agora falha quando o endereço público não entrega um conjunto coerente de assets.

## Matriz final

Workflow `30367072054`:

- instalação reproduzível com `npm ci`: aprovada;
- TypeScript + Vite: aprovados;
- Chromium: 67 cenários aprovados;
- Firefox: 67 cenários aprovados;
- total: 134 execuções;
- falhas: 0;
- flakiness: 0;
- publicação da preview: aprovada;
- limpeza de cache: aprovada;
- smoke test público: aprovado;
- artefato Playwright: preservado por 14 dias.

## Incidentes do gate

1. O primeiro teste aceitava apenas “trecho localizado” e falhou diante do plural correto “trechos localizados”. O teste foi corrigido; o produto estava certo.
2. Um teste tentou contar duas ocorrências por atributos DOM de decorations sobrepostas. O contrato foi corrigido para validar dois cartões e duas navegações reais.
3. O primeiro controle de visibilidade usou `document.body` dentro de um componente cujo prop também se chamava `document`. TypeScript detectou a colisão e a referência passou a ser `window.document.body`.
4. Duas implementações concorrentes criaram controles duplicados. O controle da toolbar foi removido e ficou apenas o controle contextual do painel.
5. O cenário de visibilidade apareceu temporariamente em duas suítes. A duplicata foi removida e a regressão ficou em arquivo dedicado.

## Próximo passo

Avaliação manual na preview:

1. confirmar carregamento sem tela branca;
2. testar um texto real em português brasileiro;
3. conferir marcas e cartões;
4. navegar por ocorrências simples, repetidas e próximas;
5. ocultar e restaurar marcas;
6. editar o texto e verificar invalidação;
7. conferir papel/noite e desktop/mobile;
8. registrar falhas P0/P1.

Nenhum Gate 8 começa automaticamente. Qualquer ampliação exige decisão explícita depois da avaliação manual.
