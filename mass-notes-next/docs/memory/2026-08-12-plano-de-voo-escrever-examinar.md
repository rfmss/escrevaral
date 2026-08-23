# PLANO DE VOO — ESCREVARAL

## Do silêncio da escrita à oficina linguística

**Data:** 12 de agosto de 2026  
**Função:** plano operacional + memória de decisão + handoff  


## 1. Missão deste plano

Este documento é, ao mesmo tempo, plano de trabalho, memória de decisão e handoff para humanos e IAs. Ele nasce de uma mudança de direção deliberada: em vez de tentar aperfeiçoar de uma vez toda a interface do Escrevaral, vamos começar pela experiência mais importante — abrir o produto e escrever — e avançar tela por tela, devagar, com aprovação explícita da humana responsável pelo produto.

A referência que catalisou essa mudança é o iA Writer. O objetivo NÃO é copiá-lo. O que queremos absorver é a disciplina: o texto domina; o espaço vazio é protegido; ferramentas existem sem exigir presença permanente; escrever e examinar são estados mentais diferentes. O Escrevaral mantém sua própria identidade e sua própria ambição linguística: quando convocada, a oficina aparece com evidência, contexto, ambiguidade e instrumentos; quando o autor escreve, ela sabe desaparecer.

> **DECISÃO / REGRA:** Tese de produto: O Escrevaral deve desaparecer quando a pessoa escreve e se revelar como oficina quando ela decide examinar o que escreveu.

Este plano existe para impedir dois problemas recorrentes: começar muitas frentes antes de sentir a experiência principal e permitir que uma IA geradora de layout assuma decisões que pertencem ao produto. A partir daqui, cada tela é uma pequena missão com objetivo, limites, critério de aprovação e prova.



## 2. O que aprendemos com o iA Writer

- Minimalismo não é ausência de produto; é hierarquia radical. O texto é a interface primária.
- Espaço vazio é funcional. Não precisamos preencher cada região disponível com controles.
- A largura da coluna de escrita é uma decisão de ergonomia, não uma consequência do tamanho da janela.
- Tipografia de escrita e tipografia de publicação podem ser coisas diferentes.
- Ter Biblioteca/Acervo, análise, preview e outras ferramentas não implica deixá-las permanentemente abertas.
- Foco pode atuar dentro do manuscrito — sentença, parágrafo ou posição do cursor — e não apenas esconder barras.
- O site público deve explicar uma ideia por vez e demonstrá-la, em vez de despejar uma grade de funcionalidades.
> **DECISÃO / REGRA:** Regra de tradução: copiar a disciplina, não o desenho. O Escrevaral não será um “iA Writer brasileiro”.



## 3. Nova tese visual do Escrevaral


### 3.1 Dois estados mentais

**ESCREVER** — silêncio, tipografia, respiro, texto, cursor, poucas decisões visíveis.

**EXAMINAR** — Blueprint, instrumentos, evidência, contexto, registro, divergência, navegação e oficina.

O Blueprint deixa de ser uma pele obrigatória sobre toda a experiência. Ele passa a ser a linguagem estrutural da oficina: aparece quando o usuário abre Acervo, Palavras, Revisão, Contexto, Voz, RimaLab ou Anatomia. A superfície de escrita pode ser quase nua.


### 3.2 O que permanece inegociável

- O manuscrito é o objeto autoral. A interface é a oficina em torno dele.
- Nenhuma ferramenta linguística substitui texto automaticamente.
- Variação linguística não é erro por padrão.
- A interface distingue observação, evidência, interpretação, ambiguidade e limite.
- A IA nunca se apresenta como autora nem como conhecedora da intenção do escritor.
- Sem gamificação de escrita: streaks, metas diárias, placares e produtividade não entram por acidente.


## 4. Método de trabalho: uma tela de cada vez

A unidade de progresso deixa de ser “redesign do Escrevaral” e passa a ser “uma tela/estado aprovado e provado”. Para cada missão visual, seguimos sempre o mesmo ciclo:

1. Formular uma única pergunta de experiência. Ex.: “Eu quero escrever aqui por uma hora?”
2. Definir o que está dentro e fora do escopo.
3. Usar o Stitch apenas para explorar essa pergunta, sem delegar a ele a memória do produto.
4. Avaliar somente o alvo pedido. Regressões incidentais fora do escopo do mockup são ignoradas.
5. Quando a solução visual passa, congelar screenshot + notas + decisões.
6. Implementar a menor mudança possível no produto real, preservando Tiptap, persistência e engines existentes.
7. Testar técnica e visualmente.
8. A humana usa a tela real e aprova ou reprova pela sensação de uso.
9. Só então abrir a próxima tela.
> **DECISÃO / REGRA:** Importante: podemos ignorar regressões fora do alvo em mockups do Stitch. NUNCA ignoramos regressões no código real, nos testes ou na acessibilidade.



## 5. Como conversar com o Stitch

O Stitch passa a ser tratado como laboratório visual pontual. Ele não é a fonte da verdade, não mantém a arquitetura longitudinal e não decide escopo.


### 5.1 Fórmula de prompt

```text
WORK ONLY ON: [uma tela/estado]
PROBLEM TO SOLVE: [um problema observável]
PRESERVE: [o que já está aprovado]
CHANGE ONLY: [região/propriedade]
SUCCESS MUST VISIBLY SHOW: [critérios verificáveis]
OUT OF SCOPE: [o que ele não deve tocar]
OUTPUT: [uma tela, ou no máximo duas variantes se houver uma decisão real]
```


### 5.2 Regras aprendidas

- Quanto menor o alvo, melhor o Stitch responde.
- Avaliar o screenshot renderizado, não a intenção do HTML.
- Se o alvo passa, ele sai da negociação. Não pedir que a próxima rodada “melhore tudo”.
- Se o Stitch estraga algo fora do alvo, não reabrir a discussão; usar a referência aprovada anterior.
- HTML/CSS do Stitch é especificação visual e material de estudo — não código de produção.
- Não importar Google Fonts, Material Symbols, Tailwind CDN ou assets remotos para o produto.


## 6. Plano de voo — ordem das telas

A ordem abaixo é deliberada. Ela começa pelo lugar onde se escreve e só adiciona complexidade quando a experiência anterior está emocional e tecnicamente resolvida.

**FASE 0 — Preparar a pista**  
*Objetivo:* Inventariar o produto atual e congelar o que não pode quebrar.  
*Escopo:* Sem redesign. Registrar baseline, rotas, testes, persistência, editor Tiptap e ferramentas existentes.

**FASE 1 — A tela de escrever**  
*Objetivo:* Encontrar o “lugar onde eu quero escrever”.  
*Escopo:* Uma única tela: documento aberto, sem instrumentos invadindo. Experimentar largura de texto, posição vertical, título, cursor, fundo, tipografia e chrome mínimo.

**FASE 2 — Foco**  
*Objetivo:* Definir como o software sai do caminho durante a escrita.  
*Escopo:* Testar foco simples e, apenas se fizer sentido, sentença/parágrafo/typewriter. Nada de gamificação.

**FASE 3 — Convocar a oficina**  
*Objetivo:* Definir a transição entre escrever e examinar.  
*Escopo:* Como Acervo e Ferramentas aparecem? Painel, drawer, sheet, overlay? O manuscrito deve permanecer reconhecível e estável.

**FASE 4 — Acervo**  
*Objetivo:* Organizar sem transformar a escrita em gerenciador de arquivos.  
*Escopo:* Busca, documentos, estados, tags e favoritos. Acervo aparece quando pedido e pode desaparecer novamente.

**FASE 5 — Palavras**  
*Objetivo:* Abrir o primeiro instrumento linguístico sem criar um assistente de IA.  
*Escopo:* Definição, categoria quando suportada, polissemia, contexto, relações lexicais. Sem botão de substituir.

**FASE 6 — Revisão**  
*Objetivo:* Provar a gramática editorial da oficina.  
*Escopo:* Ocorrência → evidência → explicação → limite → voltar ao texto. Marcas discretas; não tratar toda variação como erro.

**FASE 7 — Contexto**  
*Objetivo:* Mostrar que o Escrevaral entende que sentido depende de contexto.  
*Escopo:* Registro, leituras possíveis, ambiguidade e confiança categórica — alta/moderada/baixa/insuficiente, sem falsa precisão percentual.

**FASE 8 — Voz**  
*Objetivo:* Ler padrões de estilo sem prescrever estilo.  
*Escopo:* Hipóteses, recorrências e evidências. Nunca um “score de boa escrita”.

**FASE 9 — RimaLab**  
*Objetivo:* Trazer som e verso para a mesma gramática de instrumentos.  
*Escopo:* Rima, ritmo, som, escansão, estruturas formais. Ferramenta convocada, não painel permanente.

**FASE 10 — Anatomia**  
*Objetivo:* Transformar a oficina em outro cômodo do mesmo produto.  
*Escopo:* Entrada coerente, transição editorial e retorno simples ao manuscrito.

**FASE 11 — Mobile**  
*Objetivo:* Traduzir, não miniaturizar.  
*Escopo:* Manuscrito ocupa a tela; Acervo/Ferramentas viram drawers/sheets. Preservar tipografia, foco e contexto.

**FASE 12 — Site público**  
*Objetivo:* Fazer a apresentação dizer a verdade do produto.  
*Escopo:* Uma tese por seção, grande demonstração visual, pouco marketing genérico. O site nasce do produto já aprovado, não o contrário.



## 7. FASE 1 em detalhe — a primeira missão

> **DECISÃO / REGRA:** Pergunta de aprovação: “Eu abriria o Escrevaral agora e teria vontade de escrever aqui?”


### 7.1 O que vamos decidir

- Largura de coluna: testar uma medida confortável em vez de preencher a janela. 64/72/80 caracteres podem servir como referências experimentais, não como dogma.
- Posição vertical: texto no centro? levemente acima? typewriter? O olho precisa pousar naturalmente.
- Tipografia de escrita: escolher pela ergonomia de produção, não apenas por aparência de livro.
- Título: quando aparece, quanto pesa e quando pode desaparecer.
- Toolbar: talvez não exista em repouso; pode surgir por seleção, comando ou atalho.
- Estado de salvamento: discreto, automático e tranquilizador.
- Fundo: luz, contraste e temperatura suficientes para sessões longas.
- Cursor e seleção: claros, precisos, sem decoração gratuita.

### 7.2 O que NÃO entra ainda

- Acervo aberto.
- Painel de Palavras, Revisão, Contexto, Voz ou RimaLab.
- Blueprint ornamental.
- Anatomia.
- Landing page.
- Novas features de editor.

### 7.3 Gate de aprovação

- [ ] A humana diz explicitamente: “quero escrever aqui”.
- [ ] O manuscrito é a primeira coisa percebida.
- [ ] Nada compete com o texto sem necessidade.
- [ ] A largura e o ritmo tipográfico funcionam em 1440×900 e 1366×768.
- [ ] Autosave/persistência continuam claros e confiáveis.
- [ ] Não houve regressão funcional do editor existente.


## 8. Gates de aprovação para todas as telas

Uma tela só muda de estado “exploração” para “aprovada” quando passa por quatro gates:

**GATE A — SENSAÇÃO** — A humana sente que a tela pertence ao Escrevaral e quer usá-la.

**GATE B — HIERARQUIA** — O objeto principal da tela é inequívoco; não há software gritando sem motivo.

**GATE C — PRODUTO** — A tela respeita autoria, não-prescrição, terminologia e escopo já aprovados.

**GATE D — ENGENHARIA** — O produto real preserva testes, persistência, responsividade, acessibilidade e privacidade.

> **DECISÃO / REGRA:** Nenhum “ficou bonito” substitui os quatro gates.



## 9. Protocolo de implementação

Depois da aprovação visual, a implementação deve ser incremental. Não reconstruiremos um editor que já funciona.

1. Revalidar a cabeça da branch e a CI antes de tocar no código.
2. Abrir uma tranche com nome e objetivo visual únicos.
3. Mapear o mockup aprovado para componentes existentes: o que é só CSS, o que é reorganização e o que realmente exige componente novo.
4. Preservar Tiptap, contratos de posição, autosave, IndexedDB, conflitos, exportação, engines e testes.
5. Usar assets/fontes locais ou dependências explicitamente aprovadas; nada de CDN externo introduzido por conveniência.
6. Implementar o menor diff que materializa a tela aprovada.
7. Rodar testes focados e a matriz completa quando a tranche exigir.
8. Comparar visualmente em viewports-alvo.
9. Registrar decisão + evidência + screenshot.
10. Não abrir a próxima tela antes da aprovação da implementação real.


## 10. Relação com a arquitetura linguística

O redesign visual não reabre nem acelera artificialmente a maturidade linguística. A frente M1-R0 e a pré-banca sintética continuam regidas pelos seus próprios gates.

- Novo layout não autoriza Sintaxe de produção.
- Pré-banca sintética continua não sendo validação humana.
- Não elevar notas de confiabilidade por melhoria de UI.
- As interfaces linguísticas precisam tornar limites mais visíveis, não escondê-los.
- A distinção escrever/examinar pode, no futuro, melhorar a apresentação de evidência sem mudar o significado científico da evidência.


## 11. Estado técnico e fronteiras de governança

Último checkpoint técnico explicitamente verificado nesta conversa (não assumir que continua atual sem conferir o GitHub): branch `experiment/mass-notes-tiptap`, PR #155 aberto/draft e head `5174f18c4cd66d4aad572d66abe8009907cc7240`, com a matriz então verde. Um agente futuro deve revalidar esses dados antes de qualquer escrita.

- Não mesclar #155 nem promover para `main` sem autorização explícita.
- Gate 14 continua fora desta frente.
- Não editar manualmente a branch de preview; o workflow continua sendo o proprietário da publicação.
- Não iniciar monorepo, SDK, CLI, Tauri, sync/collaboração ou outras frentes adiadas por causa do redesign.
- O novo visual deve nascer sobre o produto existente, não criar um “Escrevaral 3” paralelo.


## 12. O que fazer com o material já gerado no Stitch

As telas anteriores do Stitch deixam de ser “a interface final” e passam a ser um arquivo de pesquisa visual. Podemos minerar boas peças, mas a nova direção iA-like será reaprovada desde a tela de escrita.

- Guardar como referências: silêncio do manuscrito, Acervo expansível, bottom sheet mobile, hierarquia Observação→Evidência→Leituras→Limite, contraste do Focus corrigido.
- Não herdar automaticamente: quatro colunas permanentes, Blueprint atrás da prosa, barras demais, porcentagens de confiança, gamificação, OPUS, “Sugerir alternativa”, features inventadas.
> **DECISÃO / REGRA:** Arquivo visual é repertório; aprovação de produto começa novamente pela FASE 1.



## 13. Registro de decisão por tela

Cada tela aprovada deve ganhar um pequeno registro canônico. O formato abaixo permite continuidade entre humanos e IAs:

```text
TELA / ESTADO:
OBJETIVO:
PERGUNTA DE SENSAÇÃO:
REFERÊNCIA APROVADA:
DECISÕES CONGELADAS:
HIPÓTESES AINDA ABERTAS:
FORA DE ESCOPO:
VIEWPORTS PROVADOS:
TESTES / EVIDÊNCIAS:
COMMIT / HEAD:
PRÓXIMO QUADRADO:
```



## 14. Handoff mínimo para qualquer IA que entrar no projeto

> **DECISÃO / REGRA:** Leia isto antes de sugerir uma tela nova.

- Objetivo atual: construir o Escrevaral tela por tela a partir da experiência de escrita, absorvendo a disciplina do iA Writer sem copiá-lo.
- A escrita deve ser silenciosa; a oficina aparece sob demanda.
- Não redesenhar tudo. Trabalhar somente na tela/estado explicitamente aberto.
- Stitch é laboratório visual; o Mapa Mestre e a documentação do repo são fonte de verdade.
- Regressões fora do escopo em mockups podem ser ignoradas. Regressões no produto real não.
- Não inventar feature para preencher layout.
- Não mudar engine, corpus ou governança linguística para satisfazer estética.
- Não avançar para a próxima tela sem aprovação humana explícita.
- Primeira missão: somente a tela de escrever.


## 15. Definição de “pronto” para esta nova fase

A fase visual estará madura quando todas as telas essenciais tiverem sido sentidas, congeladas e implementadas uma a uma — não quando tivermos um grande mockup completo.

- [ ] Tela de escrever aprovada e confortável para uso prolongado.
- [ ] Foco aprovado.
- [ ] Transição escrever → examinar aprovada.
- [ ] Acervo aprovado.
- [ ] Palavras, Revisão, Contexto, Voz e RimaLab usando uma gramática coerente de instrumentos.
- [ ] Anatomia integrada como outro cômodo da mesma oficina.
- [ ] Mobile traduzido a partir da arquitetura aprovada.
- [ ] Site público criado só então, contando a experiência real.
- [ ] Nenhuma regressão funcional/linguística introduzida pelo redesign.
> **DECISÃO / REGRA:** Próxima ação concreta: preparar o brief/prompt da FASE 1 — uma única tela de escrita — e não discutir nenhuma outra tela até ela ser aprovada.
