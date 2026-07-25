# Escrevaral — sistema de marca Argila

**Estado:** direção canônica para lançamento  
**Frase central:** **Escrevaral — antes que as palavras sequem.**

## 1. Essência

Escrevaral é uma oficina literária brasileira, local-first, feita para escrever, ler, organizar, revisar e proteger textos sem transformar a pessoa que escreve em usuária de um painel corporativo.

A marca deve transmitir:

- silêncio sem vazio acidental;
- confiança sem aparência bancária;
- calor sem decoração excessiva;
- precisão sem esterilidade;
- familiaridade editorial sem imitação do Word;
- inteligência espacial oriental sem fantasia orientalista;
- voz brasileira sem embalagem folclórica.

A interface deve parecer uma mesa que respeita o tempo da frase.

## 2. Tese visual

> Gesso, papel, grafite e barro organizados por espaço, tipografia e ritmo.

O Escrevaral não busca minimalismo como estilo. Busca concentração.

- O vazio é estrutura.
- O texto recebe mais contraste que os controles.
- Ações aparecem quando a tarefa pede.
- Bordas explicam; não decoram.
- Sombras indicam mudança de plano; não fazem cartões flutuar.
- A cor de barro identifica ação, origem e calor humano.

## 3. Inteligência espacial

A direção aprende com princípios de `ma` e `yeobaek`:

- pausas visuais entre grupos de tarefa;
- margens que protegem o texto;
- assimetria com função;
- poucos elementos simultaneamente dominantes;
- revelação gradual;
- densidades diferentes entre escrever, organizar e configurar.

Não usar kanji decorativo, selos falsos, lanternas, cerejeiras, pagodes, caligrafia inventada ou qualquer citação cultural sem função.

## 4. Voz brasileira

A identidade aparece em:

- português brasileiro natural;
- palavras como oficina, acervo, manuscrito, rascunho, margem, cópia e autoria;
- metáfora do varal usada com contenção;
- recursos brasileiros e decoloniais;
- linguagem humana, direta e sem tom institucional.

Evitar:

- jargão de SaaS;
- inglês desnecessário;
- promessas de produtividade agressiva;
- infantilização;
- linguagem de marketing de inteligência artificial.

## 5. Paleta material

### Cores canônicas

| Token | Uso | Valor inicial |
|---|---|---:|
| `--brand-plaster` | fundo principal | `#f5f2ec` |
| `--brand-paper` | folha e superfícies de leitura | `#fcfaf7` |
| `--brand-bone` | superfície secundária | `#ebe7df` |
| `--brand-linen` | separação suave | `#e2ddd4` |
| `--brand-fog` | linhas e estados discretos | `#d4cec5` |
| `--brand-ash` | texto secundário | `#817970` |
| `--brand-graphite` | texto funcional | `#4a433b` |
| `--brand-ink` | texto principal | `#1e1915` |
| `--brand-clay` | ação e identidade | `#9c5f44` |
| `--brand-clay-deep` | hover e ênfase | `#7a4a35` |
| `--brand-indigo` | informação técnica rara | `#5c6b78` |

### Regras

- Não usar branco puro como fundo dominante.
- Não usar preto puro no texto.
- Barro é a cor primária do tema claro.
- Verde, índigo e ocre são auxiliares sem competir com o barro.
- Contraste deve ser medido; “tom suave” não justifica texto ilegível.
- Estados de erro, sucesso e aviso não dependem apenas da cor.

## 6. Tipografia

Máximo de duas famílias principais:

- **Literata** ou serifada editorial equivalente: manuscrito, leitura e títulos editoriais;
- **Libre Franklin** ou sans humanista equivalente: navegação, campos, controles e metadados.

Fallbacks devem preservar acentos e legibilidade em português brasileiro.

### Medida e ritmo

- texto longo: aproximadamente 60–75 caracteres por linha;
- corpo de leitura: 18–20 px em tela ampla;
- `line-height`: 1.65–1.85 para prosa;
- metadados menores, mas nunca abaixo de legibilidade prática;
- títulos não ocupam a tela inteira;
- hierarquia nasce de escala, peso, medida e espaço — não de efeitos.

## 7. Espaçamento

Escala-base recomendada:

`4, 8, 12, 16, 24, 32, 48, 72, 96, 144`

- 4–12: relações internas;
- 16–32: componentes;
- 48–72: seções;
- 96–144: pausas editoriais e entradas.

O espaço deve indicar relação. Não preencher a tela apenas porque existe área livre.

## 8. Componentes

### Navegação

- silenciosa;
- um único sistema principal;
- estado atual por cor de texto e linha de barro;
- sem cápsulas em todas as opções;
- recursos avançados agrupados por tarefa, não por tecnologia.

### Botões

- ação principal: barro sólido, raio pequeno, sem brilho;
- ação secundária: texto/grafite e borda discreta;
- ação terciária: texto ou ícone sem moldura constante;
- sombras apenas quando o controle muda de plano.

### Listas e acervo

- lista editorial por padrão;
- cartões apenas quando há agrupamento funcional real;
- metadados discretos;
- seleção percebida sem grandes blocos coloridos.

### Editor

- previsibilidade de processador de texto;
- folha clara, medida confortável e barra confiável;
- ferramentas básicas imediatas;
- engines e configurações por revelação progressiva;
- salvamento compreensível e não ansioso;
- modo foco reduz interface sem esconder segurança.

## 9. Movimento

- 120–220 ms para estados simples;
- movimentos maiores somente para explicar mudança de contexto;
- sem parallax, elasticidade, brilho, cursor cenográfico ou rolagem sequestrada;
- respeitar `prefers-reduced-motion`;
- animação nunca atrasa escrita, leitura ou recuperação.

## 10. Neuroergonomia e ciência

A marca usa ciência para reduzir atrito, não para fabricar neuromitos.

Princípios aceitos:

- reduzir carga cognitiva extrínseca;
- manter localização e hierarquia previsíveis;
- limitar competição atencional;
- preservar continuidade da tarefa;
- dar feedback claro de salvamento e recuperação;
- usar comprimento de linha e entrelinha confortáveis;
- evitar movimento irrelevante;
- manter contraste suficiente sem agressividade luminosa;
- permitir autonomia e controle.

Não afirmar que uma cor “ativa criatividade”, que um layout “libera dopamina” ou que uma interface “otimiza o cérebro” sem evidência específica.

## 11. Arquitetura de produto de lançamento

Nível principal recomendado:

1. **Início** — entrada e retomada;
2. **Escrever** — editor e modos;
3. **Acervo** — organização, cópias e exportação;
4. **Oficina** — Palavras, Ateliê, Autoria, Plano, guias e revisão;
5. **Sobre** — propósito, privacidade e funcionamento local.

A migração pode ser gradual. Nenhuma função deve desaparecer antes de existir caminho equivalente testado.

## 12. Critério de qualidade

Antes de aprovar uma tela:

- o texto recebe mais atenção que a interface?
- o vazio organiza ou apenas sobra?
- a pessoa entende o próximo gesto?
- há menos competição visual?
- a navegação permanece previsível?
- a tela continua brasileira e literária?
- a solução funciona com teclado e toque?
- o manuscrito permanece protegido?
- a interface continuaria crível sem efeitos?

## 13. Prompt-base para outras IAs

> Aplique o sistema de marca Argila do Escrevaral: gesso, papel, grafite e barro; tipografia editorial; vazio ativo; hierarquia por espaço; pouca borda; sombras como luz; interação silenciosa; português brasileiro; acessibilidade; neuroergonomia sem neuromitos; preservação integral de conteúdo e função. Não transforme o produto em SaaS, dashboard, chatbot, landing page de startup ou fantasia orientalista. O resultado deve ser brasileiro na voz e disciplinado no uso do espaço.

## 14. Regra de expansão para novos produtos RafaMass

Novos produtos podem herdar:

- paleta material;
- escala espacial;
- linguagem de movimento;
- princípios de clareza e autonomia;
- tipografia e estados de interação.

Não devem copiar automaticamente:

- metáfora do varal;
- vocabulário literário;
- estrutura de navegação;
- componentes específicos de manuscrito.

A família deve compartilhar uma ética visual, não parecer uma coleção de clones.