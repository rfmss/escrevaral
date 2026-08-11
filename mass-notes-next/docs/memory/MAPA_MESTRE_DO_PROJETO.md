# Escrevaral — Mapa Mestre do Projeto

Atualizado em: 2026-08-11  
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
- pré-banca sintética pode amadurecer protocolo, mas não equivale a banca humana;
- banca humana continua necessária quando o estado pretendido exige julgamento humano independente.

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

A camada transversal de ciência e confiabilidade acompanha todas elas: CLARO, Eva, corpus, proveniência, avaliação separada, CI, pré-banca sintética quando útil e banca humana na maturidade pertinente.

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

Esses percentuais servem apenas para orientação. A rubrica Eva e a evidência por fenômeno continuam sendo as referências de maturidade linguística. A criação de infraestrutura sintética não eleva, por si só, nenhuma nota linguística ou humana.

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
- pacotes A e B preparados privadamente;
- contrato da pré-banca sintética;
- três perfis sintéticos de julgamento;
- harness model-agnostic com Ollama local por padrão e endpoint remoto somente por opt-in;
- auditoria que impede vazamento estrutural e impede que saída sintética seja tratada como gold humano.

### O próximo quadrado

```text
☐ recuperar ou regenerar deterministicamente o pacote privado de 16 casos
☐ eleger uma baseline local após auditoria de licença, privacidade e competência pt-BR
☐ executar a pré-banca sintética cega
☐ medir consenso sintético e acordo bruto por pares
☐ calcular Cohen's kappa sintético por pares
☐ construir matrizes de confusão sintéticas
☐ preservar baixa confiança e todos os desacordos
☐ refinar o protocolo sem abrir a avaliação lacrada
☐ nova banca Eva
☐ decidir se cabe o primeiro teste vermelho experimental da Sintaxe
```

Depois, somente quando o protocolo estiver suficientemente maduro:

```text
□ banca humana independente
□ acordo/kappa humano
□ comunidade de anotação em ferramenta apropriada
□ verified somente com a evidência humana pertinente
```

**Não marcar os quadrados humanos como concluídos com respostas de IA.**

**Não escrever engine sintática antes da pré-banca e da nova decisão Eva.**

Sintaxe de produção permanece `not_authorized`.

### Sequência de maturidade aprovada

```text
pool observado
        ↓
pré-banca sintética cega
        ↓
consenso / discordância / baixa confiança sintéticos
        ↓
refino do protocolo
        ↓
banca Eva
        ↓
implementação experimental + avaliação separada, se autorizada
        ↓
banca humana independente quando madura
        ↓
comunidade quando protocolo e interface estiverem estáveis
        ↓
verified somente com evidência humana pertinente
```

A função da automação é reduzir desperdício de atenção humana e expor fragilidades cedo; **não é baixar a régua final**.

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
- que uma nota pode subir;
- que uma pré-banca sintética virou validação humana.

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
- promoção para `main`;
- infraestrutura comunitária de anotação antes de o protocolo estar maduro.

Label Studio ou ferramenta equivalente é uma opção futura para a fase comunitária, não uma dependência a ser implantada agora.

---

## 8. Handoff mínimo para qualquer IA ou equipe

Se este projeto for movido, copiado ou retomado em outro ambiente, a primeira mensagem operacional deve ser:

> **O Escrevaral está construindo, uma por vez, caixas auditáveis da linguagem computacional do português brasileiro. O destino é consolidá-las num Cofre independente de interface. Não construa o Cofre agora. Continue a tranche linguística aberta. A frente atual é a pré-banca sintética cega da primeira Sintaxe, distinguindo sujeito recuperável pelo contexto de sujeito indeterminado. A saída sintética não é gold nem validação humana; ela serve para amadurecer o protocolo antes da banca humana independente. Leia `AGENTS.md`, `docs/project-map/mapa.json`, este mapa mestre e `docs/memory/2026-08-11-m1-r0-prebanca-sintetica.md` antes de alterar qualquer engine.**

Arquivos mínimos de retomada:

1. `AGENTS.md`;
2. `docs/project-map/mapa.json`;
3. `docs/project-map/index.html`;
4. `docs/memory/MAPA_MESTRE_DO_PROJETO.md`;
5. `docs/memory/2026-08-11-m1-r0-prebanca-sintetica.md`;
6. `docs/memory/2026-08-09-meta-cofre-e-ordem-de-trabalho.md`;
7. `docs/governance/CAPSULA_DE_APRENDIZAGEM_E_BIBLIOTECA_DE_AUTORIDADE.md`;
8. `docs/METHODS.md`;
9. `docs/personas/EVA_CHARA_SCORECARD.md`;
10. memória/log da tranche linguística aberta.

---

## 9. Governança preservada

- branch de trabalho: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto e em rascunho;
- `main`: não alterar nesta fase;
- Gate 14: suspenso;
- corpus privado: não versionar;
- fontes protegidas: não incorporar;
- nenhuma saída linguística: aplicar automaticamente ao manuscrito;
- nenhum consenso sintético: declarar como consenso humano;
- nenhuma nota humana: subir por resultado de LLM;
- nenhuma nota: subir apenas por volume de código, testes ou corpus;
- uma caixa por vez.

Este documento e `mapa.json` formam a **memória própria do mapa geral do Escrevaral**.
