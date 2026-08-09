# Memória estratégica — Meta Cofre e ordem de trabalho

Criada em: 2026-08-09  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — deve permanecer aberto e em rascunho  
Natureza: decisão de produto, arquitetura futura e ordem de execução  
Estado: **ativa**

> **Eva Chara, entre em banca.**

## 1. Decisão central

O projeto passa a registrar explicitamente uma meta arquitetural de longo prazo:

> **COFRE — um núcleo linguístico do Escrevaral capaz de sobreviver à troca completa de interface, editor, framework ou aplicação hospedeira.**

O Cofre não é a próxima implementação.

A ordem aprovada é:

```text
1. terminar a caixa linguística que já está aberta
2. fechar as demais caixas linguísticas, uma por vez
3. provar cada caixa
4. somente depois consolidar as caixas no Cofre
5. então transplantar o Cofre para a casca de produto escolhida
```

Regra de processo:

> **Primeiro terminamos uma coisa; depois começamos outra.**

Não iniciar agora uma grande refatoração para separar pacotes, monorepo, SDK, CLI, serviço ou novo aplicativo. Isso criaria uma segunda obra antes de terminar a primeira.

---

## 2. O que significa “terminar a linguagem computacional do português brasileiro” neste projeto

A expressão é uma meta de produto, não uma alegação de que seja possível esgotar toda a língua portuguesa brasileira.

No Escrevaral, uma “caixa linguística terminada” significa um domínio delimitado que:

1. possui contrato explícito de entrada e saída;
2. declara o fenômeno e o escopo que realmente cobre;
3. distingue norma, uso, hipótese computacional e orientação editorial;
4. possui fontes e proveniência registradas;
5. possui exemplos próprios ou licenciados;
6. possui casos positivos, negativos e ambíguos;
7. mantém desenvolvimento separado de avaliação;
8. mede falsos positivos e falsos negativos quando aplicável;
9. prefere `ambíguo` ou `indeterminado` quando faltar evidência;
10. não altera o manuscrito automaticamente;
11. possui banca humana quando a decisão linguística exigir;
12. consegue ser explicada sem depender da redação de uma fonte externa;
13. não recebe estado `verified` além do escopo realmente provado.

Portanto, “terminar” significa **fechar os contratos linguísticos prometidos pelo produto com evidência suficiente**, e não declarar cobertura universal do português brasileiro.

---

## 3. As caixinhas que futuramente irão para o Cofre

A taxonomia abaixo é de destino. Ela não autoriza abrir todas as frentes simultaneamente.

### Caixa A — Morfologia

Inclui progressivamente:

- flexão verbal;
- formas nominais;
- infinitivo pessoal;
- paradigmas regulares;
- irregulares;
- clíticos;
- locuções e construções compostas;
- homógrafos e diacríticos;
- defectivos;
- particípios duplos;
- demais fenômenos morfológicos que forem explicitamente aprovados.

Estado atual: existe núcleo próprio e tipado; apenas parte das famílias possui proveniência e avaliação suficientes.

### Caixa B — Sintaxe e estrutura oracional

Inclui progressivamente:

- sujeito expresso;
- sujeito recuperável;
- sujeito indeterminado;
- oração sem sujeito;
- concordância;
- regência;
- relações entre orações;
- coordenação e subordinação;
- elipse e anáfora;
- demais fronteiras sintáticas que forem abertas por tranche própria.

Estado atual: **não autorizada como engine ampla**. A primeira família está em pesquisa e validação humana.

### Caixa C — Léxico, sentido e polissemia

Inclui:

- definições originais do produto;
- sinonímia editorial;
- polissemia;
- aliases e variantes tratados explicitamente;
- locuções;
- contexto lexical;
- integridade e proveniência por verbete/regra.

Estado atual: grande massa herdada disponível, mas integridade editorial ainda incompleta e conflitos permanecem abertos.

### Caixa D — Variação, registro, norma e contexto

Inclui:

- português brasileiro como alvo primário;
- registro;
- formalidade;
- oralidade;
- variação regional e geracional quando houver evidência;
- distinção entre frequência, prestígio, tradição normativa e possibilidade expressiva;
- termos que pedem contexto.

Estado atual: há base e experiência herdadas, mas ainda falta estratificação suficiente.

### Caixa E — Pontuação e revisão

Inclui:

- pontuação;
- observações normativas;
- relações sintáticas necessárias à explicação;
- localização exata da evidência no texto;
- explicação e grau de confiança.

Estado atual: o produto novo ainda encapsula parte importante das engines legadas por adaptadores.

### Caixa F — Voz, estilo e oficina

Inclui leituras que ajudam a pessoa autora a observar o próprio texto sem transformar preferência estilística em norma:

- métricas de voz;
- ritmo e extensão;
- padrões recorrentes;
- forças e pontos cegos como hipóteses;
- exercícios e perguntas de oficina;
- explicação do limite heurístico.

Estado atual: existe engine útil, porém ainda fortemente herdada e dependente de validação humana E3.

### Caixa G — Som, verso e RimaLab

Inclui:

- escansão;
- rimas;
- esquemas;
- padrões sonoros;
- tratamento separado de verso e prosa;
- limitações de dicção e intenção.

Estado atual: funcional, mas ainda com núcleo herdado e sem veredito humano de superioridade.

A existência desta lista não altera a regra: **uma caixa por vez, respeitando a tranche ativa e a maior lacuna linguística relevante.**

---

## 4. O Cofre futuro

Quando as caixas estiverem maduras o suficiente, o Cofre deverá guardar mais do que algoritmos.

Estrutura conceitual:

```text
ESCREVARAL LINGUISTIC VAULT
│
├── engines/       regras, analisadores e resolvers
├── knowledge/     léxicos, paradigmas e conhecimento próprio
├── contracts/     entradas, saídas, tipos e versões
├── provenance/    fontes, licenças, escopos e divergências
├── evaluation/    desenvolvimento, avaliação e métricas
├── governance/    Eva, estados, limites e critérios
└── migrations/    compatibilidade entre versões do próprio Cofre
```

Contrato arquitetural futuro desejado:

```text
aplicação / editor / layout
            ↓
        adaptador
            ↓
          COFRE
            ↓
 resposta linguística serializável
```

O Cofre não deve depender de:

- React;
- Tiptap/ProseMirror;
- DOM;
- CSS;
- IndexedDB;
- desenho da página;
- posição de botões;
- logo;
- tema visual;
- aplicação hospedeira específica.

O aplicativo pode depender do Cofre. O Cofre não pode depender do aplicativo.

---

## 5. A interface é uma casca substituível

A busca por um layout definitivo pode continuar como pesquisa do mantenedor, mas **não deve desviar a prioridade linguística ativa**.

Quando uma casca ideal para o Escrevaral for escolhida no futuro, a intenção é poder:

```text
casca nova
   +
Cofre linguístico comprovado
   =
novo Escrevaral
```

Isso significa que trabalho linguístico, corpus, proveniência e avaliação não deverão ser refeito apenas porque a interface mudou.

Durante a construção das caixas, mudanças visuais devem ser tratadas como manutenção ou decisão independente, não como requisito para concluir a linguagem computacional.

---

## 6. O que NÃO fazer agora

Até a conclusão da tranche linguística ativa:

- não abrir projeto paralelo de Cofre;
- não mover todas as engines para outro repositório;
- não transformar o projeto em monorepo por antecipação;
- não criar SDK apenas para provar portabilidade;
- não trocar novamente o editor por preferência visual;
- não redesenhar o produto inteiro;
- não abrir simultaneamente várias novas famílias linguísticas;
- não chamar massa herdada de conhecimento validado só porque já funciona;
- não elevar notas por arquitetura futura ou intenção de transplante.

A meta Cofre orienta **como pensamos os limites das caixas**, mas não muda a ordem de execução atual.

---

## 7. Próximo passo lógico — continuar exatamente a tranche aberta

A tranche ativa já chegou à fronteira correta para a primeira caixa de Sintaxe.

O Porttinari `train + dev`, na revisão fixada, forneceu um pool observado de 67 candidatos sem sujeito direto com predecessor documental exato. O protocolo já determinou que a próxima etapa segura é um piloto humano cego antes de qualquer engine sintática.

Portanto, o próximo passo lógico é:

```text
piloto humano intersentencial
        ↓
Anotador A — 16 julgamentos
Anotador B — 16 julgamentos
        ↓
acordo bruto
Cohen's kappa
matriz de confusão
        ↓
preservar desacordos
        ↓
parecer Eva
        ↓
decidir se a distinção é computacionalmente estável
        ↓
SE SIM:
primeiro teste vermelho da Sintaxe mínima
        ↓
menor implementação
        ↓
matriz integral

SE NÃO:
revisar categorias/instruções/evidência
sem escrever engine prematuramente
```

Esta é a continuidade da mesma obra, não uma frente nova.

---

## 8. Critério de conclusão da primeira caixa sintática

A primeira caixa não precisa “resolver Sintaxe”. Ela precisa fechar com segurança uma única fronteira delimitada.

Primeira fronteira:

> **terceira pessoa do plural sem sujeito expresso: sujeito recuperável pelo contexto versus sujeito indeterminado.**

Ela só poderá avançar para implementação se:

- dois humanos julgarem independentemente o piloto;
- o acordo for medido e interpretado, não apenas contado;
- desacordos forem preservados;
- a regra não converter ausência de `nsubj` em verdade linguística;
- casos ambíguos continuarem representáveis;
- positivos e negativos forem definidos antes da correção;
- avaliação reservada permanecer separada;
- Eva autorizar o primeiro teste vermelho;
- nenhuma saída alterar automaticamente o manuscrito.

Fechar esta fronteira será o primeiro tijolo sério da futura **Caixa B — Sintaxe**.

---

## 9. Ordem estratégica após a fronteira atual

Não decidir antecipadamente toda a fila. Ao fechar cada tranche, Eva e a evidência escolhem o próximo maior risco.

A ordem de preferência atual é:

1. concluir o piloto humano já preparado;
2. decidir e, se autorizado, implementar a primeira fronteira sintática mínima;
3. fechar e avaliar essa fronteira antes de abrir outra;
4. escolher a próxima caixa/família pela lacuna crítica real, não por facilidade ou novidade;
5. repetir o ciclo até que o núcleo linguístico prometido pelo produto esteja suficientemente maduro;
6. **somente então** executar o programa arquitetural Cofre.

O Cofre é um gate posterior de consolidação e transplante, não um atalho para fugir das lacunas linguísticas atuais.

---

## 10. Formulação curta para futuras IAs

Se uma IA retomar o projeto e perguntar “qual é a prioridade?”, responder:

> **A prioridade não é redesenhar o Escrevaral nem construir o Cofre agora. A prioridade é terminar, uma por vez, as caixas da linguagem computacional brasileira que irão para o Cofre. Continue a tranche linguística aberta. Só depois que o núcleo estiver maduro, separe-o da aplicação e transplante-o para a casca de produto escolhida.**

Se perguntar “qual é a tranche aberta?”, responder:

> **M1-R0 / primeira fronteira sintática: terceira pessoa do plural com sujeito recuperável pelo contexto versus sujeito indeterminado. O próximo passo é concluir o piloto humano cego de dois anotadores e medir concordância antes de escrever qualquer engine de Sintaxe.**

---

## 11. Parecer Eva desta decisão

### Dimensões tocadas

- Concepção linguística: sem alteração de nota;
- Sintaxe e estrutura oracional: sem alteração de nota;
- Engenharia e auditabilidade: sem alteração de nota;
- Validação humana e acadêmica: sem alteração de nota.

### Acerto

A meta Cofre reduz dependência futura de tecnologia de interface sem transformar arquitetura em substituto de validação linguística.

### Risco principal

Usar a ideia do Cofre como motivo para iniciar uma grande refatoração agora e abandonar a fronteira linguística já preparada.

### Decisão

`PROSSEGUIR COM CONDIÇÕES`.

Condição única e central:

> **continuar o piloto sintático já aberto; nenhuma implementação do Cofre antes de fechar as caixas que ele deverá guardar.**

---

## 12. Limites preservados

- `main` permanece intacta;
- PR `#155` permanece em rascunho;
- Gate 14 permanece suspenso;
- Sintaxe de produção permanece `not_authorized` até nova banca;
- nenhuma nota linguística sobe por esta decisão;
- nenhum corpus privado é versionado;
- nenhuma fonte protegida é incorporada;
- nenhuma alteração automática do manuscrito é autorizada;
- esta memória documenta prioridade e destino, não inaugura uma nova implementação.
