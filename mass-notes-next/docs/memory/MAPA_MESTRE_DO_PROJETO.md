# Escrevaral — Mapa Mestre do Projeto

Atualizado em: 2026-08-09  
Estado: **memória canônica de orientação e handoff**  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho

## Leia isto primeiro

Este documento existe para que uma pessoa, equipe ou IA consiga abrir o projeto em outro ambiente e entender imediatamente:

- o que é o Escrevaral;
- qual é a meta arquitetural;
- o que já está concluído;
- qual trabalho está aberto;
- o que não deve ser iniciado ainda;
- como reconhecer o próximo passo seguro.

A página humana navegável está em:

- `docs/project-map/index.html`

A fonte machine-readable do checklist está em:

- `docs/project-map/mapa.json`

**O JSON é a fonte oficial do estado do checklist.** Os ticks feitos na página HTML são apenas acompanhamento local do navegador e não equivalem a conclusão oficial de engenharia ou validação linguística.

---

## 1. O que é o Escrevaral

O Escrevaral é uma oficina de escrita brasileira cujo núcleo linguístico deve funcionar como guardião, explicador e ferramenta de trabalho para quem escreve, sem transformar a língua em policiamento gramatical e sem substituir automaticamente a decisão autoral.

Princípios permanentes:

- português brasileiro como alvo primário;
- explicar antes de prescrever;
- separar norma, uso, hipótese computacional e orientação editorial;
- representar ambiguidade e indeterminação honestamente;
- nenhuma engine altera o manuscrito automaticamente;
- livros são professores temporários, não datasets;
- toda regra importante precisa de fonte, escopo, positivos, negativos e proveniência;
- teste verde prova comportamento reproduzível, não verdade linguística;
- banca humana é necessária quando a distinção linguística depende de julgamento humano.

---

## 2. Meta Cofre

A meta arquitetural de longo prazo é o **Cofre**:

> um núcleo linguístico do Escrevaral capaz de sobreviver à troca completa de interface, editor, framework ou aplicação hospedeira.

Mas o Cofre **não é a próxima implementação**.

A ordem aprovada é:

```text
terminar a caixa linguística já aberta
        ↓
fechar as demais caixas, uma por vez
        ↓
provar cada caixa
        ↓
consolidar as caixas no Cofre
        ↓
transplantar o Cofre para a casca de produto escolhida
```

Regra de processo:

> **Primeiro terminamos uma coisa; depois começamos outra.**

Não abrir agora monorepo, SDK, CLI, serviço, novo aplicativo ou grande refatoração do Cofre.

---

## 3. As caixas que irão para o Cofre

O mapa mestre organiza o núcleo em sete caixas linguísticas:

1. **Morfologia** — flexão verbal, formas nominais, clíticos, locuções, irregulares e famílias correlatas.
2. **Sintaxe e estrutura oracional** — sujeito, concordância, regência, relações entre orações, elipse e anáfora.
3. **Léxico, sentido e polissemia** — definições próprias, sinonímia editorial, polissemia, aliases, locuções e contexto lexical.
4. **Variação, registro, norma e contexto** — formalidade, oralidade, variação, frequência, tradição normativa e possibilidade expressiva.
5. **Pontuação e revisão** — pontuação, observações normativas, localização da evidência, explicação e confiança.
6. **Voz, estilo e oficina** — métricas, ritmo, padrões e hipóteses estilísticas sem converter gosto em regra.
7. **Som, verso e RimaLab** — escansão, rimas, esquemas e padrões sonoros.

A camada transversal de ciência e confiabilidade acompanha todas elas: CLARO, Eva, corpus, proveniência, avaliação separada, CI e banca humana.

---

## 4. Estado geral atual

Leitura de planejamento, não métrica científica:

| Área | Estado aproximado |
|---|---:|
| Fundação técnica | ~95% |
| Caixa A — Morfologia | ~68% |
| Caixa B — Sintaxe | ~23% |
| Caixa C — Léxico/polissemia | ~53% |
| Caixa D — Variação/norma/contexto | ~43% |
| Caixa E — Pontuação/revisão | ~48% |
| Caixa F — Voz/oficina | ~40% |
| Caixa G — Som/RimaLab | ~42% |
| Ciência/confiabilidade | ~70% |
| Cofre | 0% deliberadamente |

Esses percentuais servem apenas para orientação. A rubrica Eva e a evidência por fenômeno continuam sendo as referências de maturidade linguística.

---

## 5. Frente ativa — único próximo trabalho

A tranche ativa é **M1-R0 / primeira fronteira sintática**:

> terceira pessoa do plural sem sujeito expresso: distinguir **sujeito recuperável pelo contexto** de **sujeito indeterminado**.

Já foi concluído:

- Biblioteca de Autoridade;
- mapa conceitual;
- exemplos e negativos próprios;
- desenvolvimento sintético;
- avaliação sintética separada e lacrada;
- triagem de corpora;
- Porttinari `train` e `dev` autenticados;
- `test` mantido lacrado;
- minerador CoNLL-U local e não decisório;
- reconstrução de continuidade por documento + ordinal;
- pool de 67 candidatos intersentenciais com predecessor documental comprovado;
- protocolo cego;
- pacotes A e B preparados.

### O próximo quadrado

```text
☐ Anotador A — 16 julgamentos
☐ Anotador B — 16 julgamentos
☐ acordo bruto
☐ Cohen's kappa
☐ matriz de confusão
☐ preservar e estudar desacordos
☐ nova banca Eva
☐ decidir se cabe o primeiro teste vermelho da Sintaxe
```

**Não escrever engine sintática antes dessa sequência.**

Sintaxe de produção permanece `not_authorized`.

---

## 6. Como usar a página HTML

A página `docs/project-map/index.html` lê `mapa.json` e oferece:

- navegação por caixa;
- busca;
- filtros por concluído, em andamento, ticável e deliberadamente depois;
- progresso oficial;
- ticks locais persistidos em `localStorage`;
- exportação e importação dos ticks locais;
- impressão;
- geração de um texto curto de handoff.

### Regra importante sobre ticks

Um item marcado manualmente no navegador significa apenas:

> “eu acompanhei ou considero este item feito no meu fluxo local”.

Não significa:

- que a branch foi atualizada;
- que houve teste;
- que Eva aprovou;
- que a evidência linguística existe;
- que uma nota pode subir.

Para oficializar um tick, atualizar `docs/project-map/mapa.json` junto da evidência correspondente.

---

## 7. O que NÃO abrir agora

Itens classificados como `deferred` existem para evitar dispersão. Não são backlog autorizado para execução imediata.

Especialmente:

- Cofre/SDK/monorepo;
- nova casca final;
- nova troca de editor por preferência visual;
- Tauri/SQLite;
- sync/colaboração;
- PWA/offline;
- Prova de Autoria;
- formatos adicionais de exportação;
- Ateliê/Prática/Leituras;
- Gate 14;
- promoção para `main`.

Quando o núcleo linguístico estiver suficientemente maduro, essas decisões serão reabertas por tranche própria.

---

## 8. Handoff mínimo para qualquer IA ou equipe

Se este projeto for movido, copiado ou retomado em outro ambiente, a primeira mensagem operacional deve ser:

> **O Escrevaral está construindo, uma por vez, caixas auditáveis da linguagem computacional do português brasileiro. O destino é consolidá-las num Cofre independente de interface. Não construa o Cofre agora. Continue a tranche linguística aberta. A frente atual é o piloto humano cego da primeira Sintaxe, distinguindo sujeito recuperável pelo contexto de sujeito indeterminado. Leia `AGENTS.md`, `docs/project-map/mapa.json`, este mapa mestre e a memória da Meta Cofre antes de alterar qualquer engine.**

Arquivos mínimos de retomada:

1. `AGENTS.md`;
2. `docs/project-map/mapa.json`;
3. `docs/project-map/index.html`;
4. `docs/memory/MAPA_MESTRE_DO_PROJETO.md`;
5. `docs/memory/2026-08-09-meta-cofre-e-ordem-de-trabalho.md`;
6. `docs/governance/CAPSULA_DE_APRENDIZAGEM_E_BIBLIOTECA_DE_AUTORIDADE.md`;
7. `docs/METHODS.md`;
8. `docs/personas/EVA_CHARA_SCORECARD.md`;
9. memória/log da tranche linguística aberta.

---

## 9. Governança preservada

- branch de trabalho: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto e em rascunho;
- `main`: não alterar nesta fase;
- Gate 14: suspenso;
- corpus privado: não versionar;
- fontes protegidas: não incorporar;
- nenhuma saída linguística: aplicar automaticamente ao manuscrito;
- nenhuma nota: subir apenas por volume de código, testes ou corpus;
- uma caixa por vez.

Este documento e `mapa.json` formam a **memória própria do mapa geral do Escrevaral**.
