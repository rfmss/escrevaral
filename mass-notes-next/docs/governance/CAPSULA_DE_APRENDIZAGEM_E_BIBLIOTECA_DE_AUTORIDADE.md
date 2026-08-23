# Cápsula de aprendizagem e Biblioteca de Autoridade do Escrevaral

Criada em: 2026-08-02  
Estado: contrato estratégico ativo  
Escopo: livros, artigos, corpora, repositórios, sites, regras linguísticas, exemplos, testes, engines, explicações e pesquisa de produto  
Branch de origem: `experiment/mass-notes-tiptap`  
PR: `#155` — deve permanecer aberto e em rascunho durante esta fase

> **O Escrevaral é um jovem adulto sentado numa sala de aula. Cada material trazido oferece uma master class e explica tudo o que sabe. O Escrevaral ouve, compara, faz perguntas, fecha o livro, vai para o próprio escritório e constrói um entendimento e um material originais.**

Forma curta do pacto:

> **Estudei, fechei o livro e expliquei para mim mesmo o que aprendi.**

Esta cápsula existe para que qualquer pessoa ou agente de IA que retome o projeto entenda não apenas *o que* fazer com fontes externas, mas *como*, *por quê*, *para quem* e *até onde*.

---

## 1. Tese central

O Escrevaral não copia livros, dicionários, sites, corpora ou repositórios. Também não trata uma obra como uma autoridade absoluta nem transforma a redação de terceiros em banco de dados próprio.

O projeto usa fontes como professoras temporárias para produzir artefatos intelectuais originais e auditáveis:

- mapas de fenômenos;
- distinções conceituais;
- hipóteses computacionais delimitadas;
- explicações redigidas pelo Escrevaral;
- exemplos e contraexemplos próprios;
- corpora licenciados ou próprios;
- testes positivos, negativos e adversariais;
- registros de proveniência;
- decisões humanas documentadas.

A fonte ensina. O Escrevaral compreende, confronta, reformula e testa. **A fonte não vira o produto.**

---

## 2. O que “aprender” significa tecnicamente

Anexar um livro a uma sessão de pesquisa não treina permanentemente um modelo nem faz o conteúdo ser absorvido magicamente pelo produto.

Aprendizagem permanente, neste projeto, só existe quando o trabalho gera artefatos explícitos e versionados, tais como:

```text
fonte consultada
      ↓
ficha de leitura com páginas
      ↓
síntese original e limitada
      ↓
exemplos e negativos próprios
      ↓
hipótese computacional
      ↓
teste vermelho
      ↓
menor implementação
      ↓
banca humana e matriz integral
      ↓
regra explicável com proveniência
```

Sem esse percurso, houve leitura, mas não houve integração confiável.

---

## 3. Os livros são professores, não datasets

### 3.1 O que pode permanecer no repositório

- referência bibliográfica;
- edição, ano e ISBN quando disponíveis;
- classificação da fonte;
- capítulos e páginas consultados;
- paráfrase original do entendimento;
- divergências entre autores;
- limite e registro linguístico;
- exemplos criados para o projeto;
- regra ou hipótese criada pelo projeto;
- testes e métricas;
- licença ou condição de uso;
- decisão de integrar, usar como benchmark, manter como referência ou rejeitar.

### 3.2 O que não entra no repositório

- PDF, EPUB, TXT ou imagem integral de livro protegido;
- transcrição sistemática de capítulos;
- banco de dados reconstruído a partir de verbetes protegidos;
- sequência extensa de exemplos copiados;
- definições reproduzidas em massa;
- material cuja origem ou licença não possa ser explicada;
- arquivo temporário usado apenas para consulta privada.

### 3.3 Regra de redação

A redação final de uma explicação deve ser reconhecivelmente nossa. A pergunta de controle é:

> Depois de fechar todas as fontes, conseguimos explicar o fenômeno, seus limites e seus contraexemplos sem reproduzir a forma verbal de nenhuma delas?

Se a resposta for não, a síntese ainda não está pronta.

---

## 4. Biblioteca de Autoridade não é corpus

Essas duas coisas nunca devem ser misturadas.

### Biblioteca de Autoridade

Conjunto de obras usadas para entender conceitos, controvérsias, nomenclaturas e tradições.

Exemplos:

- gramáticas;
- dicionários de dúvidas;
- monografias de sintaxe;
- dicionários de sinônimos;
- manuais de pontuação;
- livros de escrita e estilo.

### Corpus

Conjunto de ocorrências linguísticas usado para observar uso, construir exemplos de avaliação e medir comportamento.

Um livro de gramática não prova sozinho a frequência de uma construção. Um corpus não decide sozinho se uma forma é recomendada em um registro formal. O Escrevaral deve separar:

```text
tradição e norma
uso observado
hipótese computacional
orientação editorial
```

Uma resposta pode combinar essas camadas, mas deve nomeá-las.

---

## 5. Classificação das fontes

Toda fonte recebe pelo menos um tipo primário.

| Tipo | Pergunta que responde | Risco principal |
|---|---|---|
| normativa | O que uma tradição recomenda em determinado registro? | transformar recomendação em verdade universal |
| descritiva | Como a língua é estruturada e usada? | ignorar contexto histórico ou corpus |
| lexicográfica | Que sentidos, relações e nuances são registrados? | copiar redações ou achatar polissemia |
| corpus | Onde, quando e por quem uma forma aparece? | confundir frequência com correção |
| estilística/ofício | Que efeitos uma escolha pode produzir? | converter preferência em regra |
| didática | Que dúvidas são frequentes e como podem ser explicadas? | simplificação excessiva |
| computacional | Que método, recurso ou modelo já resolve parte do problema? | importar viés e erro como autoridade |
| pesquisa de produto | Quem usa, em que contexto e com qual necessidade? | transformar amostra em estereótipo |

Uma fonte pode ter mais de um tipo, mas o papel usado em cada decisão deve ser explícito.

---

## 6. Hierarquia prática de evidência

Não existe uma fila universal de autores “mais verdadeiros”. Existe adequação entre pergunta e evidência.

Para cada fenômeno, perguntar:

1. A questão é ortográfica, normativa, descritiva, lexical, sintática, discursiva ou estilística?
2. A obra fala de português brasileiro, português europeu ou língua portuguesa sem separar variantes?
3. A afirmação vale para escrita formal, fala, literatura, jornalismo, ambiente escolar ou uso geral?
4. Há divergência entre fontes?
5. Há corpus que confirme ou complique a descrição?
6. A engine tem informação suficiente para decidir ou deve responder `provável`, `ambíguo` ou `indeterminado`?

Nenhuma regra crítica deve depender de uma única fonte quando uma segunda referência independente puder ser consultada.

---

## 7. Ciclo de vida de uma obra recebida

### Estado 1 — `received-private`

O arquivo existe apenas como material privado de pesquisa. Não entra no GitHub nem em artefatos de CI.

Registrar:

- título;
- autor;
- edição e ano, quando identificáveis;
- formato;
- procedência declarada;
- aviso de direitos;
- finalidade de consulta.

### Estado 2 — `mapped`

Ler capa, créditos, sumário, prefácios metodológicos e índice. Não ler linearmente centenas de páginas sem pergunta definida.

Produzir um mapa de capítulos úteis por domínio:

- morfologia;
- sintaxe;
- pontuação;
- léxico;
- semântica;
- coesão e coerência;
- estilo e oficina.

### Estado 3 — `consulted`

Consultar apenas os trechos necessários para uma pergunta delimitada. Registrar páginas e termos usados pela obra.

### Estado 4 — `triangulated`

Confrontar com:

- pelo menos outra fonte adequada;
- corpus licenciado ou exemplos próprios;
- casos negativos;
- variantes e registros relevantes.

### Estado 5 — `synthesized`

Fechar as fontes e escrever uma explicação própria. Separar claramente:

- consenso encontrado;
- divergência;
- inferência nossa;
- hipótese computacional;
- limite ainda não resolvido.

### Estado 6 — `tested`

Criar positivos, negativos e adversariais. O teste deve falhar pelo motivo certo antes da implementação.

### Estado 7 — `validated`

Submeter a:

- parecer Eva Chara;
- testes nos navegadores contratados;
- avaliação separada do corpus de desenvolvimento;
- banca humana quando a afirmação for linguística e relevante;
- matriz integral.

### Estado 8 — `discarded-private-copy`

O projeto conserva apenas metadados, páginas, sínteses, exemplos, testes e decisões originais. A cópia privada temporária não é incorporada ao repositório e pode ser descartada do ambiente de trabalho ao fim da tranche.

Esse estado não significa apagar a referência bibliográfica. Significa retirar o binário bruto do caminho de distribuição.

---

## 8. Ficha obrigatória por regra

Modelo mínimo:

```yaml
id: sujeito-indeterminado-se
fenomeno: sujeito_indeterminado
pergunta: "Quando uma construção com se permite leitura de sujeito indeterminado?"
escopo:
  variante: pt-BR
  registro: escrita monitorada
  generos: [prosa, ensaio, jornalismo]
fontes:
  - obra: "Lições de Português pela análise sintática"
    autor: "Evanildo Bechara"
    edicao: "20ª edição"
    paginas: ["a preencher"]
    papel: normativa_descritiva
  - obra: "Nova gramática do português contemporâneo"
    autores: ["Celso Cunha", "Lindley Cintra"]
    edicao: "a confirmar"
    paginas: ["a preencher"]
    papel: referencia_comparativa
consenso: "a escrever depois da consulta"
divergencias: []
indicios_observaveis: []
contraexemplos: []
exemplos_proprios: []
corpus:
  desenvolvimento: null
  avaliacao: null
implementacao:
  estado: hipotese
  arquivo: null
confianca: baixa
limites: []
revisao_humana: pendente
```

Uma ficha incompleta pode existir como hipótese, mas não pode sustentar `verified`.

---

## 9. Protocolo de divergência

Quando duas fontes discordarem, não escolher silenciosamente uma vencedora.

Registrar:

1. formulação de cada posição;
2. edição e contexto histórico;
3. variante e registro contemplados;
4. exemplos usados;
5. evidência de corpus disponível;
6. consequência para quem escreve;
7. decisão de produto.

Decisões possíveis:

- apresentar as duas leituras;
- adotar uma recomendação para um registro específico;
- classificar como uso em mudança;
- responder como ambíguo;
- não implementar até haver evidência suficiente.

O Escrevaral deve ser guardião da memória da divergência, não fabricante de consensos falsos.

---

## 10. Ética de autoria e direitos

### Contrato permanente

- não copiar redação protegida em escala;
- não redistribuir obras anexadas;
- não converter livros comerciais em base de dados;
- não publicar PDFs, EPUBs ou TXTs no repositório;
- evitar exemplos copiados quando exemplos próprios forem possíveis;
- usar citações breves apenas quando indispensáveis e sempre com referência;
- registrar página e edição sem transformar a referência em reprodução;
- verificar separadamente licença de código, modelos, corpora, dicionários e pesos;
- tratar arquivos de procedência incerta como material privado temporário, nunca como ativo distribuível;
- consultar orientação jurídica antes de incorporar em produto comercial uma base cuja licença não seja inequívoca.

Possuir uma edição impressa ou ter acesso legítimo para leitura não equivale a possuir direitos de reprodução ou redistribuição.

### Sites e coleta automatizada

Antes de qualquer scraping:

1. preferir API ou download oficial;
2. verificar licença e termos de uso;
3. verificar `robots.txt`, sem tratá-lo como licença autoral;
4. não contornar autenticação, paywall, CAPTCHA ou bloqueio;
5. coletar o mínimo necessário;
6. usar limite de requisições e identificação adequada;
7. registrar URL, data, versão e finalidade;
8. separar texto bruto de derivados;
9. prever remoção;
10. não incorporar conteúdo protegido só porque está publicamente acessível.

---

## 11. A metáfora da geleira e do rio

A Biblioteca de Autoridade é parte da geleira. Ela guarda conhecimento acumulado, mas o volume de gelo não garante água limpa no rio.

A água só chega ao produto quando atravessa:

```text
leitura
→ compreensão
→ síntese original
→ corpus
→ regra limitada
→ teste
→ explicação
→ validação
→ distribuição
```

Copiar um livro para dentro do projeto seria transportar um bloco de gelo e chamá-lo de rio. Nosso trabalho é compreender o degelo, construir canais e preservar a qualidade da água.

---

## 12. Persona primária de produto: a leitora-escritora de travessia

### 12.1 Estatuto

Esta persona é uma **hipótese estratégica primária**, não uma afirmação de que todas as pessoas que leem ou escrevem são iguais. Deve orientar prioridades e testes de produto, sem excluir outras identidades, gêneros, idades, regiões ou tradições literárias.

### 12.2 Núcleo da persona

Mulher brasileira, aproximadamente entre 18 e 39 anos, leitora frequente ou aspiracional e escritora em formação ou prática contínua. Tem afinidade especial com:

- romance;
- fantasia;
- romantasia;
- ficção jovem e adulta;
- narrativas centradas em personagens;
- mundos ficcionais, relações, conflito emocional e voz.

Ela pode estar escrevendo o primeiro romance, revisando um projeto longo, publicando de forma independente, participando de comunidades de leitura ou simplesmente procurando uma oficina privada para desenvolver o próprio texto.

As condições acima são hipóteses para pesquisa com usuárias reais. Não são licença para estereotipar nem para “feminilizar” superficialmente o produto.

### 12.3 Evidência de contexto

A 6ª edição da pesquisa *Retratos da Leitura no Brasil* (2024) informa que, entre os leitores brasileiros, 54% são mulheres e a idade média é 37 anos. A mesma pesquisa aponta o gosto pela leitura, a distração e o conhecimento como motivações importantes; 55% dos leitores dizem que a falta de tempo impediu ler mais, e a casa é o principal lugar de leitura. Na faixa de 18 a 39 anos, redes sociais e recomendações digitais têm peso maior do que na população geral.

Fontes públicas:

- Instituto Pró-Livro / Fundação Itaú — `Retratos da Leitura no Brasil, 6ª edição (2024)`: https://www.fundacaoitau.org.br/observatorio/biblioteca/retratos-da-leitura-no-brasil-6-edicao
- Instituto Pró-Livro — resultados e materiais: https://www.prolivro.org.br/pesquisas-retratos-da-leitura/as-pesquisas-2/

Como sinal de mercado, e não como censo nacional, o balanço da Bienal Internacional do Livro de São Paulo de 2024 registrou, no relato da Rocco, força de romantasia, ficção coreana e romances de esportes, com ênfase em ficção para público jovem, especialmente feminino. A editora informou que 90% de seus títulos mais vendidos na feira eram escritos por autoras.

Fonte pública:

- Câmara Brasileira do Livro — balanço da Bienal 2024: https://cbl.org.br/2024/09/27a-bienal-internacional-do-livro-de-sao-paulo-recebe-722-mil-visitantes-e-se-consagra-como-a-maior-edicao-dos-ultimos-10-anos/

Esses dados sustentam a escolha de investigar essa persona; não demonstram sozinhos o perfil de escritoras brasileiras. Pesquisa própria continua obrigatória.

### 12.4 Necessidades de produto

A leitora-escritora de travessia precisa de uma oficina que:

- trate seu projeto com seriedade intelectual;
- preserve voz, intenção, registro e estranheza deliberada;
- explique antes de recomendar;
- nunca substitua o manuscrito silenciosamente;
- funcione como espaço privado e confiável;
- aguente manuscritos longos e retomadas interrompidas;
- ajude sem produzir vergonha gramatical;
- distinga erro, variante, escolha estilística e hipótese;
- torne visíveis continuidade, personagens, relações, mundo e ritmo sem reduzir ficção a fórmula;
- seja útil mesmo em sessões curtas;
- permita aprender com a análise, não apenas aceitar uma correção.

### 12.5 Tom e experiência

O Escrevaral não deve:

- infantilizar mulheres;
- usar “feminino” como sinônimo de rosa, delicado ou simplificado;
- pressupor romance heterossexual;
- tratar fantasia como gênero menor;
- impor norma escolar sobre voz de personagem;
- confundir acolhimento com ausência de rigor;
- transformar escrita em competição de produtividade.

Deve transmitir:

- rigor sem humilhação;
- calor editorial sem invasão;
- privacidade;
- permanência;
- materialidade de oficina;
- explicação clara;
- respeito a autoras, personagens e mundos ficcionais.

### 12.6 Consequências para pesquisa futura

Sem abrir novas engines automaticamente, a persona sugere investigar:

- continuidade de personagens e nomes;
- ponto de vista e focalização;
- diálogo e voz individual;
- cronologia e causalidade;
- relações e arcos emocionais;
- vocabulário de mundo ficcional;
- repetição intencional versus acidental;
- ritmo de cena;
- coerência referencial em manuscritos longos.

Cada item é hipótese de produto. Nenhum entra no roadmap sem entrevistas, corpus adequado e CLARO próprio.

---

## 13. Biblioteca inicial registrada

Os binários abaixo foram oferecidos apenas para pesquisa privada. **Não estão autorizados a entrar no repositório.** O status registra disponibilidade e prioridade, não conclusão de leitura.

| Obra | Autor(es) | Papel previsto | Estado |
|---|---|---|---|
| *Lições de Português pela análise sintática* | Evanildo Bechara | base principal para Sintaxe v1 | `received-private` / sumário mapeado |
| *Novo dicionário de dúvidas da língua portuguesa* | Evanildo Bechara; colaboração de Shahira Mahmud | tradição, mudança, norma e dúvida | `received-private` / prefácio mapeado |
| *Dicionário de sinônimos* | Antenor Nascentes | nuance lexical, sinonímia e contexto | `received-private` / introdução mapeada |
| *Não erre mais!* | Luiz Antonio Sacconi | dúvidas normativas e didática; fonte secundária | `received-private` / apresentação mapeada |
| *Compreender e interpretar os textos* | Evanildo Bechara | coesão, coerência, figuras e semântica | `received-private` / sumário mapeado |
| *1001 Dicas de Português* | Dad Squarisi; Paulo José Cunha | dúvidas frequentes; fonte secundária | `received-private` / metadados a confirmar |
| *Guia prático do português correto — pontuação* | Cláudio Moreno | pontuação normativa e prática | `received-private` / metadados a confirmar |
| *Nova gramática do português contemporâneo* | Celso Cunha; Lindley Cintra | referência gramatical ampla e comparativa | pendente de envio |
| *A arte da pontuação* | Noah Lukeman | ofício, ritmo e efeito literário | pendente de envio |

Avisos de direitos encontrados nas edições anexadas proíbem apropriação e armazenamento integral em bancos de dados ou processos similares. Isso reforça a política de consulta temporária, síntese original e não incorporação dos binários.

---

## 14. Primeira tranche aprovada: M1-R0 — Biblioteca de Autoridade

Durante esta tranche:

- não abrir Sintaxe em produção;
- não continuar a consolidação automática dos 66 conflitos lexicais;
- não importar livros para o GitHub;
- não elevar notas linguísticas;
- não executar Gate 14;
- não tocar em `main`;
- não declarar aprendizado antes de produzir fichas e testes.

### Primeiro fenômeno

Mapear em conjunto:

- sujeito expresso;
- sujeito recuperável ou oculto;
- sujeito indeterminado;
- oração sem sujeito;
- relação entre forma verbal e estrutura oracional.

### Fontes iniciais

1. *Lições de Português pela análise sintática*;
2. *Novo dicionário de dúvidas da língua portuguesa*, quando pertinente;
3. *Nova gramática do português contemporâneo*, assim que disponível;
4. corpus brasileiro licenciado ou exemplos próprios;
5. Sacconi apenas como apoio didático e contraste, não como autoridade exclusiva.

### Entregáveis antes de escrever engine

- mapa conceitual com páginas;
- nomenclaturas convergentes e divergentes;
- ficha de regra;
- exemplos próprios;
- negativos adversariais;
- limites por registro;
- proposta de representação `determinado`, `provável`, `ambíguo` ou `indeterminado`;
- parecer Eva;
- decisão explícita de implementar ou continuar pesquisando.

---

## 15. Instruções obrigatórias para qualquer IA futura

Ao retomar trabalho baseado em fontes:

1. leia este documento antes de consultar ou modificar corpus, regra, engine, explicação ou persona;
2. leia `AGENTS.md`, `docs/METHODS.md` e a documentação de Eva Chara;
3. não presuma conteúdo de uma obra que não esteja acessível;
4. use a obra anexada como base quando a tarefa pedir estudo dela;
5. não complete lacunas silenciosamente com conhecimento geral;
6. se usar web ou conhecimento externo, separe-o do que veio da obra;
7. registre página, edição e papel da fonte;
8. nunca copie o binário para o repositório;
9. produza síntese e exemplos próprios;
10. preserve divergências;
11. crie positivos e negativos;
12. mantenha corpus de desenvolvimento e avaliação separados;
13. não transforme teste verde em verdade linguística;
14. não altere o manuscrito da pessoa;
15. não trate a persona primária como totalidade do público;
16. atualize esta cápsula quando o processo mudar, sem apagar decisões anteriores.

Chamada obrigatória:

> **Eva Chara, entre em banca.**

---

## 16. Critérios de aceite para uma integração derivada de livro

Uma integração só pode ser fechada quando:

- a pergunta linguística está delimitada;
- as páginas consultadas estão registradas;
- pelo menos duas evidências independentes foram consideradas quando possível;
- a síntese é original;
- exemplos e negativos são próprios ou licenciados;
- norma, uso e estilo estão separados;
- a hipótese computacional declara limites;
- a interface explica incerteza;
- a engine não substitui texto automaticamente;
- a licença dos recursos efetivamente distribuídos é compatível;
- a matriz integral está verde;
- uma revisão humana foi registrada quando necessária;
- o material bruto não foi incorporado à distribuição.

---

## 17. Parecer Eva — abertura da cápsula

- dimensões: fundamentação e proveniência; variação, registro e norma; autoria e contexto; validação humana;
- ganho: o projeto passa a ter contrato explícito para aprender sem copiar e para transformar leitura em evidência versionada;
- limite: nenhuma obra foi ainda convertida em regra validada por esta cápsula;
- risco principal: confundir grande quantidade de fontes com qualidade ou consenso;
- nota: nenhuma nota sobe nesta etapa;
- decisão: `PROSSEGUIR COM CONDIÇÕES`;
- condição: executar M1-R0 em uma pergunta pequena, com páginas, síntese própria, negativos e banca antes de qualquer nova engine.

---

## 18. Frase de guarda

Quando houver dúvida sobre o que fazer com uma fonte, voltar a esta imagem:

> **O professor termina a master class. O Escrevaral fecha o livro. Só então entra no escritório para criar.**
