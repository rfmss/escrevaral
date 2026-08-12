# Escrevaral — Mapa Mestre do Projeto

Atualizado em: 2026-08-12  
Estado: **memória canônica de orientação e handoff**  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — aberto e em rascunho

## Leia isto primeiro

Este documento existe para que uma pessoa, equipe ou IA consiga abrir o projeto em outro ambiente e entender imediatamente:

- o que é o Escrevaral;
- qual é a meta arquitetural;
- o que já está concluído;
- qual trabalho está aberto;
- o que está deliberadamente pausado;
- o que não deve ser iniciado ainda;
- como reconhecer o próximo passo seguro.

A página humana navegável está em:

- `docs/project-map/index.html`

A fonte machine-readable do checklist está em:

- `docs/project-map/mapa.json`

A direção visual atual e o protocolo de trabalho tela a tela estão em:

- `docs/memory/2026-08-12-plano-de-voo-escrever-examinar.md`
- `docs/memory/2026-08-12-fase-0-pista-visual.md`

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

### Nova tese de experiência

A partir da decisão de 2026-08-12, a experiência visual passa a obedecer a uma distinção explícita:

```text
ESCREVER  → silêncio, tipografia, respiro, texto, cursor, quase nenhum software visível
EXAMINAR  → oficina, Blueprint, instrumentos, evidência, contexto, ambiguidade e navegação
```

> **O Escrevaral deve desaparecer quando a pessoa escreve e se revelar como oficina quando ela decide examinar o que escreveu.**

O iA Writer é referência de disciplina e ergonomia, não modelo a ser copiado. Copiar a disciplina, não o desenho.

---

## 2. Meta Cofre

A meta arquitetural de longo prazo continua sendo o **Cofre**:

> um núcleo linguístico do Escrevaral capaz de sobreviver à troca completa de interface, editor, framework ou aplicação hospedeira.

Mas o Cofre **não é a próxima implementação**.

A ordem estrutural de longo prazo permanece:

```text
terminar as caixas linguísticas
        ↓
provar cada caixa
        ↓
consolidar as caixas no Cofre
        ↓
transplantar o Cofre para a casca final escolhida
```

Regra de processo:

> **Primeiro terminamos uma coisa; depois começamos outra.**

### Exceção estratégica atual, deliberada e documentada

Em 2026-08-12 foi aprovada uma pausa limpa de M1-R0 para resolver antes uma pergunta de produto fundamental: **qual é o lugar onde a pessoa realmente quer escrever?**

Isso NÃO autoriza:

- construir o Cofre;
- criar novo aplicativo;
- trocar Tiptap;
- escolher stack final;
- recomeçar o produto;
- declarar a casca atual como casca definitiva.

Autoriza apenas refinar **a aplicação atual**, uma tela/estado por vez, começando pelo estado de repouso da escrita. O trabalho linguístico já produzido permanece congelado, auditável e retomável.

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

Esses percentuais servem apenas para orientação. A rubrica Eva e a evidência por fenômeno continuam sendo as referências de maturidade linguística. Infraestrutura, redesign e consenso sintético não elevam, por si só, nenhuma nota linguística ou humana.

---

## 5. Frente ativa — FASE 1 / tela de escrever

A única frente ativa agora é:

> **Encontrar o estado de repouso em que a pessoa abre o Escrevaral e quer permanecer escrevendo.**

A unidade de progresso não é mais “redesign do Escrevaral”. É **uma tela/estado aprovado e provado**.

### FASE 0 concluída

Foi inventariada a pista técnica que não pode quebrar:

- React existente;
- editor Tiptap/ProseMirror;
- documento autoral estruturado;
- persistência IndexedDB;
- autosave;
- recovery local;
- conflito entre abas sem sobrescrita silenciosa;
- contrato de posições do editor;
- revisão e decorations;
- importação/exportação;
- Acervo e RightRail já existentes;
- mobile com drawers transitórios;
- Foco e tema já existentes;
- Anatomia dentro da mesma experiência.

A FASE 1 NÃO deve redesenhar ou reimplementar esses contratos. Ela decide apenas a experiência visual da escrita em repouso.

### Pergunta de aprovação

> **Eu abriria o Escrevaral agora e teria vontade de escrever aqui?**

### O que será decidido agora

Somente:

- largura da coluna de escrita;
- posição vertical do manuscrito;
- tipografia de escrita;
- título e seu peso;
- fundo e contraste;
- cursor/seleção;
- chrome mínimo;
- estado discreto de autosave;
- necessidade ou ausência de toolbar em repouso.

### Fora da frente atual

Não abrir ainda:

- Acervo como redesign;
- Palavras;
- Revisão;
- Contexto;
- Voz;
- RimaLab;
- Anatomia;
- mobile;
- site público;
- nova navegação global;
- nova arquitetura de dados;
- nova engine;
- nova aplicação/stack.

### Método com Stitch

Stitch é laboratório visual pontual, não fonte da verdade nem memória arquitetural.

Regra:

```text
uma tela
        ↓
um problema observável
        ↓
preservar o que já passou
        ↓
avaliar apenas o alvo
        ↓
congelar a solução aprovada
```

Regressões incidentais fora do alvo podem ser ignoradas em mockups do Stitch. **Nunca** podem ser ignoradas no código real, testes, acessibilidade, persistência ou privacidade.

### Gate da FASE 1

```text
☐ a humana diz explicitamente “quero escrever aqui”
☐ o manuscrito é a primeira coisa percebida
☐ nada compete com o texto sem necessidade
☐ largura/ritmo funcionam em 1440×900 e 1366×768
☐ autosave continua compreensível e tranquilizador
☐ nenhuma feature nova foi inventada para compensar composição fraca
☐ a implementação real preserva Tiptap, persistência, contratos e CI
```

Somente depois abre a FASE 2 — Foco.

---

## 6. M1-R0 — pausa limpa e ponto exato de retomada

A primeira fronteira sintática continua sendo:

> terceira pessoa do plural sem sujeito expresso: distinguir **sujeito recuperável pelo contexto** de **sujeito indeterminado**.

Ela **não foi cancelada, concluída ou reclassificada**. Está pausada de forma limpa por decisão explícita de produto.

### Já concluído antes da pausa

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
- contrato da pré-banca sintética;
- três perfis sintéticos;
- harness model-agnostic;
- três famílias locais candidatas e rotações balanceadas;
- seletor determinístico privado de 16 casos;
- montador reproduzível Porttinari `train + dev` com continuidade cross-split;
- auditorias que impedem confusão entre sintético, gold e validação humana.

### Ponto de retomada

```text
obter/verificar localmente os arquivos train + dev fixados
        ↓
montar o pool observado e reproduzir os agregados registrados
        ↓
selecionar pacote privado 12 + 4
        ↓
verificar hardware e modelos Ollama
        ↓
smoke de 4 casos
        ↓
pré-banca sintética completa
        ↓
acordo / kappa / confusão / desacordos
        ↓
Eva
```

Depois, e somente quando madura:

```text
banca humana independente
        ↓
comunidade de anotação
        ↓
verified somente com a evidência humana pertinente
```

Sintaxe de produção permanece `not_authorized`.

A função da automação continua sendo reduzir desperdício de atenção humana e expor fragilidades cedo; **não é baixar a régua final**.

---

## 7. Ordem visual aprovada

A ordem do Plano de Voo é deliberada:

1. FASE 0 — preparar a pista — **concluída**;
2. FASE 1 — tela de escrever — **ativa**;
3. FASE 2 — Foco;
4. FASE 3 — convocar a oficina;
5. FASE 4 — Acervo;
6. FASE 5 — Palavras;
7. FASE 6 — Revisão;
8. FASE 7 — Contexto;
9. FASE 8 — Voz;
10. FASE 9 — RimaLab;
11. FASE 10 — Anatomia;
12. FASE 11 — mobile;
13. FASE 12 — site público.

Uma fase visual não abre enquanto a anterior não tiver aprovação humana explícita no produto real.

---

## 8. O que NÃO abrir agora

Especialmente:

- Cofre/SDK/monorepo;
- nova aplicação paralela;
- troca de Tiptap/editor por preferência visual;
- stack/casca final pós-Cofre;
- Tauri/SQLite;
- sync/colaboração;
- nova expansão PWA/offline;
- Prova de Autoria;
- formatos adicionais de exportação;
- Ateliê/Prática/Leituras;
- infraestrutura comunitária de anotação;
- Gate 14;
- promoção para `main`;
- qualquer FASE visual posterior à FASE 1 antes de sua aprovação.

O refinamento incremental da **casca atual** está autorizado somente conforme o Plano de Voo. Isso não equivale a construir a casca definitiva.

---

## 9. Handoff mínimo para qualquer IA ou equipe

Se este projeto for retomado em outro ambiente, a primeira mensagem operacional deve ser:

> **O Escrevaral está em uma pausa estratégica limpa da frente M1-R0 para resolver a experiência básica de escrita. A frente atual é a FASE 1: uma única tela de escrever silenciosa. O objetivo é fazer o software desaparecer durante ESCREVER e revelar a oficina durante EXAMINAR. Não redesenhe o produto inteiro, não abra outra tela, não troque Tiptap e não altere a maturidade linguística. Leia `AGENTS.md`, `docs/project-map/mapa.json`, este mapa mestre, `docs/memory/2026-08-12-plano-de-voo-escrever-examinar.md` e `docs/memory/2026-08-12-fase-0-pista-visual.md` antes de tocar em UI. M1-R0 permanece congelada e retomável; Sintaxe de produção segue not_authorized.**

Arquivos mínimos de retomada:

1. `AGENTS.md`;
2. `docs/project-map/mapa.json`;
3. `docs/project-map/index.html`;
4. `docs/memory/MAPA_MESTRE_DO_PROJETO.md`;
5. `docs/memory/2026-08-12-plano-de-voo-escrever-examinar.md`;
6. `docs/memory/2026-08-12-fase-0-pista-visual.md`;
7. `docs/memory/2026-08-11-m1-r0-prebanca-sintetica.md`;
8. `docs/memory/2026-08-11-m1-r0-modelos-sinteticos-v2.md`;
9. `docs/memory/2026-08-11-m1-r0-selecao-piloto-sintetico-v1.md`;
10. `docs/memory/2026-08-11-m1-r0-montagem-observada-train-dev-v1.md`;
11. `docs/governance/CAPSULA_DE_APRENDIZAGEM_E_BIBLIOTECA_DE_AUTORIDADE.md`;
12. `docs/METHODS.md`;
13. `docs/personas/EVA_CHARA_SCORECARD.md`.

---

## 10. Governança preservada

- branch de trabalho: `experiment/mass-notes-tiptap`;
- PR `#155`: aberto e em rascunho;
- `main`: não alterar nesta fase;
- Gate 14: suspenso;
- branch `preview-mass-notes-tiptap`: propriedade do workflow;
- corpus privado: não versionar;
- fontes protegidas: não incorporar;
- nenhuma saída linguística: aplicar automaticamente ao manuscrito;
- nenhum consenso sintético: declarar como consenso humano;
- nenhuma nota humana: subir por resultado de LLM;
- nenhuma nota: subir apenas por volume de código, testes, corpus ou qualidade visual;
- uma frente ativa por vez;
- uma tela visual por vez;
- nenhuma regressão real pode ser ignorada só porque o mockup parecia bom.

Este documento e `mapa.json` formam a **memória própria do mapa geral do Escrevaral**. Para a frente visual atual, o Plano de Voo é leitura obrigatória adicional.
