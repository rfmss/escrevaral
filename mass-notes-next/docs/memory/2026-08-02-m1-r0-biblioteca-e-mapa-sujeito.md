# M1-R0 — Biblioteca completa e primeiro mapa comparativo de sujeito

Data: 2026-08-02  
Estado: memória operacional ativa  
Branch: `experiment/mass-notes-tiptap`  
PR: `#155` — manter aberto e em rascunho  
Fronteira: pesquisa de fontes; nenhuma engine de Sintaxe autorizada

## CLARO

### Cenário

A Biblioteca de Autoridade inicial está disponível para consulta privada em nove obras. Os arquivos brutos não entram no repositório, nos artefatos ou na distribuição. A primeira pergunta de pesquisa é:

> Como distinguir sujeito expresso, sujeito recuperável ou oculto, sujeito indeterminado e oração sem sujeito sem depender apenas da forma isolada do verbo?

### Limites

- não criar ou ampliar engine nesta etapa;
- não converter livros em corpus;
- não copiar definições, exercícios ou exemplos em escala;
- não declarar consenso quando as fontes divergem;
- não elevar nota linguística;
- não abrir Gate 14;
- não tocar em `main`;
- não retomar os 66 conflitos lexicais durante a pausa M1-R0.

### Arquitetura

```text
Biblioteca de Autoridade privada
        ↓
registro bibliográfico e localização
        ↓
mapa de conceitos e divergências
        ↓
síntese original após fechar as fontes
        ↓
exemplos próprios
        ↓
corpus de desenvolvimento separado
        ↓
corpus de avaliação separado
        ↓
parecer Eva e decisão de implementar
```

### Resultado esperado desta memória

- registrar a chegada das nove obras;
- fixar as duas gramáticas centrais da primeira pergunta;
- produzir um primeiro mapa de convergências e divergências;
- desenhar vocabulário de produto ainda provisório;
- listar casos de pesquisa originais;
- definir o próximo passo sem abrir código de produção.

### Abertos

- leitura integral das seções sobre `se`, voz passiva e impessoalidade;
- contraste entre `ter` existencial, norma monitorada e uso brasileiro;
- escolha de corpus brasileiro licenciado;
- avaliação humana independente;
- decisão final sobre terminologia de interface.

---

## Biblioteca registrada

A lista machine-readable está em `docs/sources/source-registry.yaml`.

### Fontes centrais da primeira pergunta

1. Evanildo Bechara, *Lições de Português pela análise sintática*, 20a edição revista e ampliada, especialmente Lição II e Lição IV, §§ 1–4.
2. Celso Cunha e Lindley Cintra, *Nova gramática do português contemporâneo*, 7a edição, especialmente pp. 138–145.

### Fontes de apoio e fases posteriores

- Evanildo Bechara e Shahira Mahmud, *Novo dicionário de dúvidas da língua portuguesa*;
- Antenor Nascentes, *Dicionário de sinônimos*;
- Luiz Antonio Sacconi, *Não erre mais!*;
- Evanildo Bechara et al., *Compreender e interpretar os textos*;
- Cláudio Moreno, *Guia prático do português correto — pontuação*;
- Noah Lukeman, *A arte da pontuação*;
- Dad Squarisi e Paulo José Cunha, *1001 dicas de português*.

Nenhuma cópia bruta foi incorporada ao GitHub.

---

## Primeiro mapa conceitual

Este mapa registra entendimento provisório das duas gramáticas centrais. Ele não é ainda regra de produto.

### 1. Sujeito expresso

Há na oração um constituinte que pode ser relacionado ao predicado como sujeito. A ordem linear não basta para encontrá-lo: em português, o sujeito pode aparecer antes ou depois do verbo, e a inversão pode servir a informação, ritmo e estilo.

**Consequência computacional:** não assumir que o primeiro sintagma nominal é sempre sujeito e não confundir posição com função.

### 2. Sujeito recuperável ou oculto

Cunha e Cintra usam a expressão **sujeito oculto (determinado)** para o sujeito não materialmente expresso, mas identificável:

- pela desinência verbal;
- por um sujeito mencionado em outra oração do mesmo período;
- por um sujeito mencionado em período contíguo;
- em certos casos, pela desinência de outro verbo relacionado.

Bechara distingue oração sem sujeito de sujeito oculto e sua obra anterior sobre infinitivo pessoal já sustenta que pessoa verbal e contexto podem tornar um participante recuperável.

**Síntese provisória do Escrevaral:** ausência gráfica não equivale a indeterminação. Se houver evidência morfológica ou contextual suficiente para recuperar um referente, a leitura deve ser `recuperável`, nunca `indeterminado` por padrão.

### 3. Sujeito indeterminado

As duas gramáticas convergem no núcleo conceitual:

- há um participante humano ou agente pressuposto;
- ele não é identificado porque é desconhecido, irrelevante ou deliberadamente omitido;
- a não identificação pode ser uma escolha comunicativa, não uma falta de conhecimento.

Cunha e Cintra destacam dois padrões:

- verbo na terceira pessoa do plural sem sujeito recuperável;
- verbo na terceira pessoa do singular com `se` em construção impessoal.

Bechara também inclui terceira pessoa singular ou plural, forma infinita sem referência determinada e construções com `se` equivalentes a `alguém` ou `a gente`.

**Consequência computacional:** a terceira pessoa do plural é apenas indício. Antes de classificar, é obrigatório procurar um sujeito expresso ou recuperável no contexto. O mesmo vale para `se`: é preciso distinguir indeterminação de passiva pronominal e de outros valores do pronome.

### 4. Oração sem sujeito

As duas gramáticas convergem em separar este caso do sujeito indeterminado:

- no indeterminado, existe participante não identificado;
- na oração sem sujeito, o processo não é atribuído a participante algum.

Casos centrais compartilhados:

- fenômenos meteorológicos ou naturais em uso literal;
- `haver` com sentido de existir;
- `haver` e `fazer` em expressões de tempo decorrido;
- outras construções impessoais que exigem análise lexical e contextual.

Bechara prefere **oração sem sujeito** e considera **sujeito inexistente** uma denominação menos adequada. Cunha e Cintra usam as duas formulações no capítulo.

**Consequência computacional:** a saída de produto deve descrever a oração, não inventar um sujeito vazio. A interface pode dizer `oração sem sujeito` e explicar a impessoalidade.

---

## Convergências já suficientemente fortes

1. Ausência de sujeito escrito não determina uma única classe.
2. Recuperabilidade depende de flexão e contexto discursivo.
3. Indeterminação pressupõe participante, mas bloqueia sua identificação.
4. Oração sem sujeito não pressupõe participante oculto.
5. Forma verbal isolada é insuficiente.
6. `se` exige análise sintática, não busca lexical simples.
7. Verbos meteorológicos podem deixar de ser impessoais em uso figurado e receber sujeito.
8. O contexto pode atravessar orações e períodos contíguos.

---

## Divergências e fronteiras que devem permanecer abertas

### Terminologia

- Cunha e Cintra: `sujeito oculto (determinado)`;
- proposta provisória de produto: `sujeito recuperável`;
- Bechara: rejeita confundir oração sem sujeito com sujeito oculto ou indeterminado;
- `sujeito inexistente` aparece na tradição, mas Bechara o considera menos adequado.

A interface não precisa reproduzir toda nomenclatura escolar. Ela precisa explicar o fenômeno sem apagar a tradição. A ficha final deve manter os rótulos das fontes e justificar o rótulo de produto.

### Cobertura da indeterminação

Bechara apresenta uma cobertura mais ampla, incluindo forma infinita sem referência determinada. Cunha e Cintra, na seção consultada, concentram os processos em terceira pessoa do plural e terceira pessoa do singular com `se`.

Não escolher silenciosamente uma definição. A futura regra deve ser dividida em famílias observáveis.

### `ter` existencial no português brasileiro

Cunha e Cintra documentam `ter` impessoal como corrente na linguagem coloquial brasileira e presente em escritores modernos. O sumário de Bechara anuncia uma seção normativa sobre o emprego de `ter` por `haver`.

Ainda não foi feita a leitura comparativa integral dessas passagens. Até isso acontecer, `ter` existencial deve ser marcado como fronteira de variação e registro, não como erro automático nem como equivalência universal.

### Verbos meteorológicos figurados

Um verbo meteorológico pode ser impessoal em uso literal e pessoal em uso figurado. Logo, listas de verbos impessoais não podem produzir classificação automática sem analisar sentido e estrutura.

---

## Vocabulário provisório de produto

Estes rótulos são hipóteses e ainda não estão autorizados para a interface:

| ID interno | Rótulo explicativo | Condição mínima |
|---|---|---|
| `subject_explicit` | sujeito expresso | constituinte sujeito identificável na oração |
| `subject_recoverable` | sujeito recuperável | referente identificado por flexão ou contexto |
| `subject_indeterminate` | sujeito indeterminado | participante pressuposto, mas não identificável |
| `subjectless_clause` | oração sem sujeito | processo não atribuído a participante |
| `subject_ambiguous` | leitura ambígua | evidência insuficiente ou análises concorrentes |
| `not_applicable` | não se aplica | fragmento sem estrutura suficiente para a pergunta |

Camada independente de confiança:

- `determinado`;
- `provável`;
- `ambíguo`;
- `indeterminado`;
- `não se aplica`.

A classe linguística e o grau de confiança não devem ser fundidos numa única etiqueta.

---

## Exemplos originais de pesquisa

Estes exemplos foram criados para o projeto. Não constituem ainda corpus de desenvolvimento nem avaliação.

### Candidatos positivos

1. `Fechamos as janelas antes da chuva.`  
   Hipótese: sujeito recuperável `nós` pela desinência.

2. `Lia apagou a vela. Depois abriu a porta.`  
   Hipótese: sujeito recuperável `Lia` pelo período contíguo.

3. `Bateram à porta durante a madrugada.`  
   Hipótese: sujeito indeterminado, desde que o contexto anterior não ofereça referente plural.

4. `Precisa-se de leitoras-beta.`  
   Hipótese: sujeito indeterminado; a preposição bloqueia leitura passiva simples.

5. `Choveu sobre as torres durante três dias.`  
   Hipótese: oração sem sujeito em uso meteorológico literal.

6. `Havia três mapas sobre a mesa.`  
   Hipótese: oração sem sujeito na norma monitorada com `haver` existencial.

### Controles negativos e adversariais

7. `As torres amanheceram cobertas de névoa.`  
   Não classificar `amanheceram` como impessoal: há sujeito expresso e uso predicativo.

8. `Os guardas bateram à porta durante a madrugada.`  
   Não classificar como sujeito indeterminado: há sujeito expresso.

9. `Os guardas chegaram tarde. Bateram à porta durante a madrugada.`  
   Não classificar automaticamente como indeterminado: o contexto oferece referente plural recuperável.

10. `Vendiam-se grimórios na feira.`  
    Caso adversarial: distinguir passiva pronominal de índice de indeterminação.

11. `Tinha três luas no céu daquela história.`  
    Caso de variação brasileira: não marcar automaticamente como erro antes de política de registro e corpus.

12. `É melhor sairmos antes da tempestade.`  
    Sujeito recuperável no infinitivo pessoal; deve dialogar com a família E2-V já validada sem duplicar sua engine.

---

## Informações mínimas que a futura análise exigirá

Uma regra segura não pode funcionar apenas com regex. Ela precisará, em diferentes níveis:

- flexão de pessoa e número;
- fronteiras de oração;
- sintagmas nominais candidatos;
- contexto anterior e posterior;
- valência e regência verbal;
- presença e função de preposição;
- papel de `se`;
- concordância entre verbo e candidato nominal;
- sentido literal ou figurado de verbos meteorológicos;
- distinção entre forma finita e infinitiva;
- marcação de variante e registro.

Isso não obriga uma única engine pesada. O desenho pode combinar regras locais, recurso morfológico externo em modo sombra e parser usado como benchmark.

---

## Parecer Eva — abertura do mapa

- dimensões: fundamentação e proveniência; variação e registro; autoria; explicabilidade;
- evidência: duas gramáticas centrais consultadas em seções específicas e nove obras registradas;
- acerto: a pergunta foi dividida por fenômeno, evitando a falsa equivalência entre sujeito ausente e sujeito indeterminado;
- risco: transformar terminologia escolar em classes rígidas antes de corpus brasileiro e casos literários;
- falsos positivos prioritários: terceira pessoa plural com referente anterior; `se` passivo; verbo meteorológico com sujeito;
- falso negativo prioritário: sujeito recuperável através de período contíguo;
- ausência: corpus licenciado, avaliação separada e revisão humana independente;
- nota: nenhuma nota sobe;
- decisão: `PROSSEGUIR COM CONDIÇÕES`;
- condição: fechar a leitura comparativa de `se`, impessoalidade, `ter` existencial e locuções antes de escrever teste de engine.

---

## Próximo passo autorizado

1. consultar nas duas gramáticas as seções completas sobre `se`, passiva pronominal e concordância;
2. consultar as passagens completas sobre `ter` existencial e registrar a divergência de registro;
3. fazer consultas pontuais no *Novo dicionário de dúvidas* para `haver`, `ter` e construções com `se`;
4. preencher a primeira ficha baseada em `docs/sources/rule-card.schema.yaml`;
5. separar exemplos de pesquisa, corpus de desenvolvimento e avaliação;
6. pesquisar corpus brasileiro aberto e compatível;
7. convocar nova banca Eva;
8. decidir entre implementar uma primeira família pequena ou continuar pesquisando.

Nenhuma engine foi aberta por este documento.
