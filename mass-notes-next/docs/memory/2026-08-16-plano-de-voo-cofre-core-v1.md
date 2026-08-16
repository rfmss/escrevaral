# Plano de Voo — Cofre Core v1

- Criado em: 2026-08-16
- Branch: `feat/cofre-core-contract-v1`
- Base congelada: `5174f18c4cd66d4aad572d66abe8009907cc7240`
- Destino recomendado do primeiro PR: `experiment/mass-notes-tiptap`
- Estado: **proposta operacional para deliberação humana**
- Escopo desta versão: governança, contrato portátil e transplante-piloto de Morfologia Verbal
- Doutrina vinculante: `2026-08-16-doutrina-do-produto-escrevaral-cofre.md`

> **Eva Chara, entre em banca.**

## 1. Decisão em uma frase

Construir um núcleo linguístico local, explicável e serializável que receba texto e contexto, devolva leituras com evidência e incerteza e possa ser conectado a qualquer editor por adaptadores, sem depender de React, Tiptap, DOM, CSS, IndexedDB ou da aplicação Escrevaral.

O Cofre é o gerador. O editor é a festa. O adaptador é o cabo entre os dois.

Este plano obedece à Doutrina de Produto e Engenharia registrada nesta branch. O objetivo não é produzir uma demonstração convincente nem validar a identidade técnica da pessoa mantenedora. É formar um legado offline, modular e auditável para escritores brasileiros. Soluções agradáveis que criem dívida previsível devem ser contestadas e registradas antes de entrar no produto.

Este documento não autoriza uma migração geral, não abre Sintaxe de produção e não declara nenhuma caixa linguística concluída. A primeira autorização proposta é estreita:

1. registrar o contrato público v1;
2. criar o runtime e o registry mínimos;
3. transplantar somente a Morfologia Verbal já existente, sem inventar regra nova;
4. provar o mesmo resultado em Node, navegador, Web Worker e uma página HTML vazia;
5. voltar à sequência de uma caixa linguística por vez.

---

## 2. CLARO da abertura

### C — Cenário observado

O projeto já possui patrimônio linguístico relevante:

- engines legadas locais para léxico, sintaxe, pontuação, análise editorial, voz, RimaLab e contexto;
- uma engine morfológica moderna, tipada e majoritariamente pura;
- dados linguísticos próprios e versionados;
- contratos parciais de leitura;
- corpora de desenvolvimento e avaliação em algumas famílias;
- Biblioteca de Autoridade, rule cards, proveniência e método de banca;
- adaptadores funcionais para a aplicação Tiptap atual.

Entretanto, a maior parte das engines legadas ainda publica APIs globais, carrega dados por `fetch()` relativo e depende do navegador. O aplicativo consegue usá-las; outro editor não consegue incorporá-las de modo previsível sem reproduzir o mesmo ambiente.

### L — Limite e impacto

Sem uma fronteira estável:

- cada troca de editor repete integração, carregamento e normalização;
- `window`, DOM, Vite e caminhos relativos vazam para a lógica linguística;
- testes de interface mascaram a falta de testes contratuais do núcleo;
- dados, regras e versões não têm um protocolo uniforme;
- resultados antigos podem ser aplicados a uma revisão nova do texto;
- a migração simultânea de todas as engines seria grande demais para revisar e falsificar;
- livros protegidos podem ser confundidos com datasets ou copiados por conveniência.

### A — Arquitetura escolhida

Criar no mesmo repositório uma fronteira de pacote privada e independente, começando pelo contrato e por uma única engine-piloto. Adaptadores ficam fora do núcleo. Dados entram por um `DataProvider`. Toda resposta é serializável, versionada e vinculada à revisão analisada.

### R — Resultado reproduzível esperado

O mesmo fixture de Morfologia deve produzir resultado semanticamente idêntico:

1. em Node sem DOM;
2. em navegador, sem rede;
3. em Web Worker;
4. em HTML vanilla com `<textarea>`;
5. no adaptador Tiptap do Escrevaral.

### O — O que permanece aberto

- fechamento linguístico das sete caixas;
- banca humana independente por domínio;
- integridade e proveniência item a item dos grandes datasets;
- migração das engines legadas;
- decisão futura de publicação no npm ou separação em outro repositório;
- Sintaxe ampla, que permanece `not_authorized` até seu gate próprio.

---

## 3. Relação com a governança anterior

A memória `2026-08-09-meta-cofre-e-ordem-de-trabalho.md`, o mapa mestre e `mapa.json` mantêm o Cofre como `deferred`. Esta branch foi aberta para deliberar uma exceção limitada e reversível.

Antes do primeiro código, a pessoa mantenedora deve escolher explicitamente uma destas decisões:

- `APROVAR_EXCECAO_LIMITADA`: contrato v1 + Morfologia-piloto, sem abrir novas famílias;
- `MANTER_DEFERRED`: conservar este plano como arquitetura futura e retomar M1-R0;
- `REVISAR_PLANO`: ajustar escopo, ordem ou contrato antes de qualquer implementação.

Se a exceção for aprovada, um ADR deve registrar:

1. qual decisão anterior é parcialmente substituída;
2. que a exceção termina no gate de transplante da Morfologia;
3. que não autoriza Sintaxe ampla, SDK público, novo aplicativo ou migração em massa;
4. que `main`, Gate 14 e o produto público permanecem protegidos;
5. que nenhuma nota linguística sobe por portabilidade.

Somente depois do ADR aprovado o mapa canônico pode mudar `vault-contracts` de `deferred` para `active`. Os demais itens do Cofre continuam `deferred` até seus gates.

---

## 4. Invariantes não negociáveis

### 4.1 Fronteira técnica

O núcleo do Cofre não pode importar ou acessar:

- React;
- Tiptap ou ProseMirror;
- DOM, `window` ou `document`;
- CSS ou componentes;
- IndexedDB, `localStorage` ou estado da aplicação;
- caminhos de arquivos da aplicação;
- rede, telemetria ou serviços remotos;
- APIs que alterem o manuscrito.

### 4.2 Fronteira linguística

- português brasileiro (`pt-BR`) é o único idioma e locale de produto;
- qualquer locale diferente de `pt-BR` é rejeitado explicitamente pelo contrato;
- inglês não entra em runtime, corpus, avaliação, mensagens ou promessa de produto;
- de projetos voltados ao inglês, somente código neutro em relação ao idioma pode ser considerado, após auditoria de licença e validação própria em `pt-BR`;
- norma, uso, descrição, hipótese computacional e orientação editorial são camadas separadas;
- falta de evidência produz `provável`, `ambíguo` ou `indeterminado`, nunca certeza decorativa;
- nenhuma regra crítica depende silenciosamente de uma única obra;
- toda regra nova exige positivo, negativo, caso limítrofe e limite declarado;
- teste verde prova comportamento, não verdade linguística;
- nenhuma engine substitui o texto automaticamente.

### 4.3 Fronteira autoral

- livros protegidos permanecem materiais privados de consulta;
- nenhum TXT, ZIP, PDF, EPUB, capítulo, verbete ou banco reconstruído entra no Git;
- exemplos, contraexemplos, mensagens e explicações finais são originais ou licenciados;
- referências bibliográficas não podem sugerir endosso de autores ou editoras;
- citação dá rastreabilidade, não substitui licença;
- Biblioteca de Autoridade e corpus permanecem separados.

### 4.4 Fronteira de manutenção

- HTML é casca e bootstrap, nunca depósito de lógica de produto;
- interface, adaptador, orquestração, engine, conhecimento e proveniência permanecem em módulos distintos;
- arquivos acima de 350 linhas não geradas exigem revisão explícita de divisão;
- arquivos acima de 600 linhas não geradas exigem justificativa arquitetural registrada ou separação;
- dependências cíclicas e imports de tecnologia hospedeira no núcleo são bloqueados;
- uma tela funcionando não conta como arquitetura validada;
- dívida técnica conhecida não pode ser escondida para produzir sensação de avanço.

---

## 5. Inventário inicial auditado

### 5.1 Prontidão aproximada

| Camada | Prontidão de planejamento |
|---|---:|
| Uso dentro do Escrevaral atual | 65–70% |
| Patrimônio linguístico, corpora e governança | 55–65% |
| Núcleo tecnicamente portátil | cerca de 45% |
| Distribuição universal/SDK | cerca de 10% |
| Primeiro Cofre mínimo utilizável | 35–40% |

Essas estimativas são de engenharia, não notas linguísticas. O mapa oficial continua marcando o Cofre como 0% porque a consolidação ainda não começou.

### 5.2 Código que pode ser portado primeiro

| Material | Destino | Condição |
|---|---|---|
| `src/engines/verbMorphology/*` | núcleo-piloto | remover imports `?raw` e injetar dados |
| `contextualLexicalResolver.ts` | engine lexical contextual futura | manter escopo pequeno e testes próprios |
| `verbFormationSupplement.ts` | conhecimento morfológico opcional | declarar cobertura e proveniência |
| tipos dos adapters atuais | inspiração para contratos | normalizar nomes e eliminar dependência de UI |
| fixtures verbais de desenvolvimento e avaliação | suíte do piloto | preservar separação e escopo verificado |

### 5.3 Engines legadas aproveitáveis após refatoração

| Engine | Valor | Dívida principal |
|---|---|---|
| `lexical-engine.js` | léxico, locuções, classes e contexto | IIFE global, `fetch`, estado interno e arquivo grande |
| `syntax-engine.js` | funções, concordância e padrões oracionais | IIFE global, dois datasets e dependência opcional global |
| `punctuation-engine.js` | regras localizadas de pontuação | global e precedência com Sintaxe |
| `analise-engine.js` | métricas e alertas editoriais | global e composição implícita com outras engines |
| `voice-engine.js` | voz narrativa, ritmo e campos semânticos | global e dependência editorial opcional |
| `rimalab-engine.js` | métrica, rima e leitura sonora | dataset carregado por caminho relativo |
| `decolonial-engine.js` | contexto, marcação e perguntas editoriais | dataset relativo e necessidade de forte cautela contextual |
| `precision-engine.js` | heurísticas de gênero/ofício | dependência conceitual de templates do produto |

Sintaxe de produção não entra nessa fila até ser autorizada pelo processo linguístico. O código existente pode ser inventariado e encapsulado para testes, mas não promovido como teoria validada.

### 5.4 O que fica fora do Cofre linguístico

- arquivo, documento e versionamento;
- importação e exportação;
- backup, filesystem e persistência;
- paginação e impressão;
- prova de autoria e direitos;
- templates de produto;
- modo máquina de escrever e badges;
- codec `.esc`/VRDA;
- componentes, temas, layout e navegação.

Essas capacidades podem consumir resultados do Cofre ou formar pacotes próprios. Não pertencem ao núcleo linguístico.

### 5.5 Cópia externa de referência

A pasta histórica com 23 engines e seis JSON é útil como backup forense e mapa de capacidades, não como base canônica:

- 20 dos 29 arquivos de código/dados são idênticos aos da base desta branch;
- oito arquivos divergem da branch atual;
- `import-engine.js` existe apenas na cópia histórica;
- o README da cópia anuncia portabilidade que o código ainda não possui;
- há descrições incorretas de capacidades, como TTS para `voice`, revisão para `proof`, PDF no exportador e realidade virtual para `vrda`;
- copiar a pasta inteira reintroduziria versões antigas e capacidades de produto no núcleo linguístico.

Regra: comparar, entender e preservar decisões úteis; portar sempre da versão canônica escolhida no Git.

---

## 6. Arquitetura-alvo mínima

Na primeira etapa, o Cofre permanece no mesmo repositório e privado. Não criar outro repositório nem publicar pacote antes da prova de transplante.

Estrutura proposta:

```text
cofre/
├── package.json                 pacote privado durante M0
├── src/
│   ├── contracts/              tipos públicos e schemas
│   ├── registry/               descoberta e compatibilidade
│   ├── runtime/                orquestração, cancelamento e cache
│   ├── engines/                algoritmos sem ambiente hospedeiro
│   └── data-provider/          carregamento injetado e verificável
├── knowledge/pt-BR/            dados próprios/licenciados e manifestos
├── provenance/                 rule cards, fontes, escopos e divergências
├── evaluation/                 fixtures, conjuntos lacrados e métricas
├── governance/                 gates, pareceres e limites
├── migrations/                 contratos entre versões
├── integrations/
│   ├── vanilla/                textarea/contenteditable
│   ├── tiptap/                 somente adaptador
│   └── react/                  somente conveniência de UI
├── worker/                     protocolo assíncrono opcional
├── examples/                   provas mínimas, sem produto novo
└── tests/                      unidade, contrato, transplante e privacidade
```

`integrations/` nunca pode ser importado por `src/`. A dependência só aponta de fora para dentro.

### 6.1 Fluxo de dependência

```text
editor / aplicação / layout
          ↓ snapshot + revisão
       adaptador
          ↓ contrato serializável
         COFRE
          ↓ resultado versionado
       adaptador
          ↓ mapeamento de posições
editor decide como apresentar
```

### 6.2 Contrato público v1 proposto

```ts
type TextSnapshot = {
  documentId?: string
  revision: string
  locale: 'pt-BR'
  text: string
  textHash: string
  offsetUnit: 'utf16-code-unit'
}

type EngineManifest = {
  engineId: string
  engineVersion: string
  contractVersion: '1'
  knowledgeVersion: string
  capabilities: string[]
  locale: 'pt-BR'
  maturity: 'experimental' | 'limited' | 'verified-limited'
}

type Finding = {
  findingId: string
  engineId: string
  ruleId: string
  kind: 'observation' | 'question' | 'warning'
  decision: 'determined' | 'probable' | 'ambiguous' | 'indeterminate'
  confidence: number | null
  range?: { start: number; end: number; unit: 'utf16-code-unit' }
  excerptHash?: string
  message: string
  explanation: string
  evidence: string[]
  limitations: string[]
  alternatives: unknown[]
  provenance: {
    ruleVersion: string
    knowledgeVersion: string
    sourceIds: string[]
  }
}

type EngineResult = {
  contractVersion: '1'
  requestId: string
  revision: string
  textHash: string
  engine: EngineManifest
  findings: Finding[]
  metrics: Record<string, number>
  warnings: string[]
  elapsedMs: number
}

interface LanguageEngine {
  readonly manifest: EngineManifest
  analyze(snapshot: TextSnapshot, context: EngineContext): Promise<EngineResult>
}
```

Regras do contrato:

- API assíncrona desde o início, mesmo para algoritmos síncronos;
- somente objetos serializáveis atravessam a fronteira;
- offsets são definidos em unidades UTF-16 do snapshot recebido;
- adaptadores convertem offsets do editor para offsets do snapshot e vice-versa;
- `revision`, `textHash` e `excerptHash` bloqueiam resultados obsoletos;
- mensagens ao usuário não contêm HTML executável;
- `sourceIds` apontam para metadados, nunca para conteúdo bruto;
- substituições sugeridas, se algum dia existirem, são dados opcionais e jamais ações automáticas.

### 6.3 DataProvider

Nenhuma engine chama `fetch()` diretamente.

```ts
interface DataProvider {
  getJson<T>(assetId: string, expectedHash: string): Promise<T>
  has(assetId: string): Promise<boolean>
}
```

Implementações possíveis:

- memória, para testes;
- filesystem, para Node;
- assets empacotados, para navegador;
- cache local controlado pelo host.

Rede não é implementação padrão. Se um host remoto existir no futuro, será responsabilidade explícita da aplicação, com consentimento e política própria.

---

## 7. Protocolo de aprendizagem com as obras

### 7.1 Inventário recebido

Foram auditadas nove obras privadas, cerca de 6,83 MB e 1,03 milhão de palavras delimitadas por espaço. Todas já possuem identidade correspondente em `docs/sources/source-registry.yaml`.

O arquivo `partes.zip` contém apenas 18 fragmentos derivados de seis dessas obras. Não acrescenta uma fonte independente, possui cabeçalhos e normalizações próprias e não deve ser contado como corpus, evidência adicional ou versão canônica.

Nenhum arquivo bruto será copiado, indexado, empacotado ou enviado ao GitHub/CI.

### 7.2 Papel de cada obra

| Fonte | Papel principal | Caixas informadas | Limite essencial |
|---|---|---|---|
| Bechara, *Lições de Português pela análise sintática* | referência sintática principal | Sintaxe, concordância, regência, voz e pontuação sintática | tradição normativa não equivale sozinha a uso observado |
| Cunha e Cintra, *Nova gramática do português contemporâneo* | gramática comparativa ampla | Morfologia, Sintaxe, Variação, Discurso, Pontuação e Versificação | português pluricêntrico exige marcação de variante e época |
| Bechara, *Novo dicionário de dúvidas* | consulta localizada de uso e tradição | Morfologia, Regência, Concordância, Ortografia e Variação | não reconstruir verbetes nem usar como fonte única |
| Nascentes, *Dicionário de sinônimos* | nuance lexical e método de distinção | Léxico, sentido e polissemia | não converter grupos ou definições em dataset |
| Sacconi, *Não erre mais!* | fonte normativa/didática secundária | Variação, Norma e catálogo de dúvidas | tom prescritivo exige triangulação |
| Bechara et al., *Compreender e interpretar os textos* | semântica textual e discurso | Coesão, Coerência, Polissemia e Tipologia | questões e gabaritos não entram em corpus |
| Moreno, *Guia prático — pontuação* | pontuação brasileira e processamento | Pontuação e Revisão | conferir localização/paginação e triangular regras críticas |
| Lukeman, *A arte da pontuação* | ofício, ritmo e efeito literário | Voz, Oficina, Ritmo e Pontuação estilística | não é autoridade normativa de pt-BR; OCR é ruidoso |
| Squarisi e Cunha, *1001 dicas de português* | dúvidas frequentes e pedagogia | Norma, Uso, Ortografia e UX explicativa | fonte secundária, nunca autoridade exclusiva |

### 7.3 Estado de uma fonte

```text
received-private
      ↓ metadados, edição, direitos
mapped
      ↓ capítulos úteis por pergunta
consulted
      ↓ localizadores e notas factuais
triangulated
      ↓ segunda fonte + corpus/exemplos próprios
synthesized
      ↓ fontes fechadas + redação original
tested
      ↓ positivos, negativos e adversariais próprios
validated
      ↓ Eva + avaliação separada + banca pertinente
discarded-private-copy
```

### 7.4 Método clean-room em duas passagens

**Passagem de pesquisa**

1. formular uma pergunta linguística pequena;
2. mapear capítulos e páginas relevantes;
3. registrar posição de cada fonte em formulação factual curta;
4. registrar variante, registro, época e divergências;
5. fechar os arquivos privados;
6. redigir uma síntese original e uma hipótese limitada.

**Passagem de engenharia**

1. trabalhar somente a partir da rule card aprovada;
2. criar exemplos, negativos e pares adversariais do zero;
3. construir teste vermelho;
4. implementar o menor detector coerente;
5. medir falso positivo, falso negativo e ambiguidade;
6. revisar similaridade e proveniência;
7. publicar apenas metadados, síntese, testes e decisão próprios.

Idealmente, a segunda passagem é revisada por pessoa ou sessão diferente da que consultou a obra.

### 7.5 Credibilidade sem falsa autoridade

A interface pode mostrar, por `ruleId`:

- bibliografia consultada;
- edição e localização;
- tipo da fonte;
- escopo da regra;
- divergências relevantes;
- versão da regra e do conhecimento;
- data da última revisão.

Não deve mostrar:

- trechos longos;
- exemplos copiados;
- verbetes reconstruídos;
- “aprovado por” um autor, editora, ABL ou instituição;
- uma lista de livros como substituta de evidência;
- uma recomendação única quando as fontes divergem.

### 7.6 Evidência que ainda falta

As nove obras fortalecem teoria, tradição, nomenclatura, exceções e pedagogia. Elas não fecham sozinhas:

- frequência e distribuição no português brasileiro atual;
- variação regional, social, geracional e de oralidade;
- representatividade por gênero textual;
- corpus de ficção e diálogo;
- pronúncia brasileira para RimaLab;
- validação humana independente;
- licença para criar grandes bases lexicais derivadas.

Cada caixa exigirá corpora próprios, abertos, licenciados ou consentidos, separados entre desenvolvimento e avaliação.

---

## 8. Ordem de voo

### FASE 0 — Deliberação e autorização estreita

Objetivo: retirar apenas o contrato e o piloto do estado `deferred`.

Entregáveis:

- este Plano de Voo;
- breadcrumb CLARO/Eva;
- ADR com decisão humana;
- atualização mínima do mapa canônico, se aprovada;
- lista explícita de não objetivos e reversão.

Gate F0:

```text
☐ decisão humana registrada
☐ alvo do PR confirmado como experiment/mass-notes-tiptap
☐ main e Gate 14 protegidos
☐ Sintaxe ampla continua not_authorized
☐ nenhuma obra bruta foi adicionada
☐ nenhuma nota Eva foi elevada
```

### FASE 1 — Contrato e esqueleto sem regra nova

Objetivo: criar fronteira compilável antes de migrar lógica.

Entregáveis:

- `TextSnapshot`, `Finding`, `EngineResult` e `EngineManifest`;
- schemas JSON correspondentes;
- registry de engines;
- `DataProvider` em memória;
- erros tipados e vocabulário uniforme de decisão;
- testes de serialização e compatibilidade;
- verificador de imports proibidos.

Gate F1:

```text
☐ zero React/Tiptap/DOM/IndexedDB no núcleo
☐ zero fetch direto em engine
☐ entrada e saída JSON serializáveis
☐ offsets e revisão documentados
☐ SemVer do contrato definido
☐ Node executa a suíte sem polyfill de navegador
```

### FASE 2 — Morfologia Verbal como piloto

Objetivo: provar a arquitetura com a caixa tecnicamente mais madura.

Escopo permitido:

- transportar comportamento já existente;
- injetar léxicos/dados;
- preservar resultados e limites atuais;
- manter infinitivo pessoal como `verified-limited` somente no escopo existente;
- manter outras famílias `partial` ou `pending`.

Fora de escopo:

- nova teoria morfológica;
- expansão de paradigmas;
- correção silenciosa de lacunas;
- aumento de nota;
- alteração automática do texto.

Gate F2:

```text
☐ paridade documentada com fixtures atuais
☐ desenvolvimento separado da avaliação
☐ 24/24 do infinitivo pessoal preservado no escopo contratado
☐ famílias parciais continuam rotuladas como parciais
☐ nenhum import ?raw no núcleo
☐ nenhuma regressão da aplicação consumidora
```

### FASE 3 — Prova de transplante

Objetivo: demonstrar que o Cofre sobrevive sem a aplicação.

Ambientes obrigatórios:

- Node;
- navegador sem rede;
- Web Worker;
- página HTML vanilla com `<textarea>`;
- Escrevaral/Tiptap por adaptador.

Gate F3:

```text
☐ mesmos fixtures e leituras semânticas nos cinco ambientes
☐ cancelamento descarta respostas antigas
☐ revisão/hash impede marcação obsoleta
☐ worker falha de modo recuperável
☐ bundle não contém React/Tiptap
☐ execução offline comprovada
☐ exemplo vanilla não virou novo produto
```

Ao fechar F3, congelar Contrato v1 e decidir se o Cofre continua no mesmo repositório. Não publicar no npm automaticamente.

### FASE 4 — Retomar uma caixa linguística por vez

Ordem recomendada de aprendizagem e fechamento:

1. **Sintaxe — fronteira M1-R0 já aberta**: concluir pré-banca, Eva e gate humano; somente depois considerar engine experimental.
2. **Morfologia restante**: paradigmas, irregulares, clíticos, compostos, homógrafos, defectivos e particípios duplos.
3. **Pontuação e Revisão**: separar regra normativa, clareza de processamento e efeito estilístico.
4. **Léxico e polissemia**: resolver conflitos; construir conhecimento próprio/licenciado sem reconstruir dicionários.
5. **Variação, registro, norma e contexto**: estratificar corpus e evitar polícia gramatical.
6. **Voz, estilo e oficina**: medir observação sem transformar gosto em norma.
7. **Som, verso e RimaLab**: validar escansão, rima, pronúncia, prosa e verso.

Uma caixa só entra no Cofre quando possui contrato, rule cards, dados permitidos, avaliação separada, limites e gate humano pertinente.

### FASE 5 — Migração técnica por engine

Para cada engine autorizada:

```text
inventário de API e dados
        ↓
caracterização de comportamento atual
        ↓
testes de paridade
        ↓
extração de algoritmo puro
        ↓
injeção de conhecimento
        ↓
normalização para Contrato v1
        ↓
teste de transplante
        ↓
adaptador do Escrevaral
        ↓
PR curto e reversível
```

Não migrar duas engines num mesmo PR, salvo dependência mínima demonstrada e aprovada.

### FASE 6 — Cofre v1 lacrado

Critérios mínimos:

- todas as caixas prometidas têm versão e maturidade explícitas;
- contratos e migrations estão testados;
- nenhum material bruto protegido está no histórico ou artefato;
- proveniência cobre 100% das regras distribuídas;
- corpora distribuídos têm licença compatível;
- resultados são explicáveis e serializáveis;
- transplante integral passou em ambiente vazio;
- banca humana pertinente foi documentada;
- nenhuma engine aplica texto automaticamente;
- parecer Eva e decisão humana autorizam o rótulo `Cofre v1`.

---

## 9. Gate padrão de uma regra linguística

| Gate | Evidência exigida | Estado máximo permitido |
|---|---|---|
| R0 — pergunta | fenômeno, valor para quem escreve e não objetivos | `hypothesis` |
| R1 — fontes | duas fontes quando possível, localizadores e direitos | `source_mapped` |
| R2 — síntese | texto original, consenso, divergências e terminologia | `synthesized` |
| R3 — corpus | desenvolvimento, avaliação, positivos, negativos e adversariais | `corpus_evaluation` |
| R4 — teste vermelho | falha pelo motivo correto | `authorized_experimental` |
| R5 — implementação | menor detector, incerteza visível e zero autoaplicação | `implemented_experimental` |
| R6 — avaliação | precisão, recall, FP/FN, matriz integral e falhas conhecidas | `validated_limited` |
| R7 — humano/Eva | revisão independente pertinente e parecer registrado | `verified_limited` |
| R8 — transplante | contrato, ambiente vazio e adaptador consumidor | distribuível no Cofre |

Nenhum gate superior pode ser compensado por volume de dados, quantidade de testes ou qualidade visual.

---

## 10. CI e auditores obrigatórios

### Contrato e portabilidade

- typecheck e build do pacote;
- validação dos schemas de entrada e saída;
- testes de compatibilidade entre versões;
- scanner de imports proibidos;
- execução Node sem DOM;
- execução em browser e worker;
- teste sem rede;
- teste de determinismo para a mesma versão de dados.

### Conhecimento e proveniência

- schema de rule card;
- todo `ruleId` distribuído possui card;
- todo `sourceId` existe no registry;
- hashes dos knowledge packs conferem;
- licenças e condições de distribuição não estão vazias;
- datasets não contêm material bruto da Biblioteca de Autoridade;
- exemplos declaram origem própria/licenciada;
- desenvolvimento e avaliação não se sobrepõem.

### Segurança autoral e privacidade

- scanner bloqueia extensões e nomes de materiais privados;
- comparação de similaridade sinaliza redações ou exemplos suspeitos para revisão humana;
- artefatos e source maps não incluem arquivos privados;
- logs não registram manuscritos;
- nenhum teste exige enviar texto a endpoint remoto;
- opt-in remoto, se algum dia existir, fica fora do padrão e fora do núcleo.

### Qualidade linguística

- positivos, negativos, limítrofes e adversariais;
- métricas por engine e família;
- falso positivo e falso negativo publicados;
- ambiguidades preservadas;
- regressão integral do consumidor;
- parecer Eva quando a maturidade ou cobertura puder mudar.

---

## 11. Versionamento

Versionar separadamente:

- `contractVersion`: compatibilidade estrutural da API;
- `engineVersion`: algoritmo;
- `knowledgeVersion`: dados e rule cards;
- `evaluationVersion`: corpus e métricas;
- `adapterVersion`: integração do host.

Regras:

- mudança incompatível no contrato exige major;
- mudança de regra ou dataset muda `knowledgeVersion`;
- uma engine não recebe versão nova apenas por mudança de UI;
- resultados registram todas as versões usadas;
- migrations transformam contratos, não reescrevem conclusões linguísticas;
- um knowledge pack pode ser removido se sua licença ou proveniência deixar de ser válida.

---

## 12. Estratégia de branches e PRs

### Branch atual

`feat/cofre-core-contract-v1`

Escopo permitido do primeiro PR:

1. plano e ADR;
2. contratos e schemas;
3. registry e DataProvider mínimos;
4. Morfologia-piloto;
5. testes de transplante;
6. adaptadores mínimos vanilla e Tiptap.

Escopo proibido:

- redesign;
- nova aplicação;
- migração das demais engines;
- mudança linguística não ligada à paridade do piloto;
- livros ou ZIPs;
- promoção para `main`;
- lançamento público.

### PRs seguintes

Usar branches curtas, uma engine ou uma tranche por vez:

```text
feat/cofre-morphology-<familia>
feat/cofre-punctuation-<tranche>
feat/cofre-lexical-<tranche>
feat/cofre-voice-<tranche>
feat/cofre-rimalab-<tranche>
research/cofre-syntax-<fronteira>
```

Cada PR deve informar:

- contrato afetado;
- regras e knowledge packs afetados;
- fontes e direitos;
- baseline e métricas;
- falsos positivos, falsos negativos e ambiguidades;
- ambientes de transplante;
- reversão;
- o que continua não autorizado.

---

## 13. Registro de riscos

| Risco | Impacto | Mitigação | Gate |
|---|---|---|---|
| copiar ou reconstruir obras | jurídico, ético e arquitetural | clean-room, scanner, exemplos próprios e revisão humana | CI/proveniência |
| usar bibliografia como selo de autoridade | credibilidade falsa | papel da fonte, divergência e ausência de endosso visíveis | rule card/UI |
| refatoração em massa | regressão e revisão impossível | uma engine por PR, paridade antes da extração | PR |
| contrato baseado em Tiptap | perda de portabilidade | snapshot de texto e offsets definidos pelo Cofre | F1/F3 |
| resultados obsoletos | marcações na revisão errada | revision, hash, excerptHash e cancelamento | F1/F3 |
| grandes datasets bloquearem o editor | latência e travamento | lazy load, worker, cache por versão e orçamento | F3 |
| falsear certeza linguística | dano autoral | vocabulário de incerteza e limites obrigatórios | R2–R7 |
| confundir teste com validação | alegação excessiva | avaliação separada e banca humana | R6/R7 |
| misturar Biblioteca e corpus | viés e direitos | registries separados e auditor de overlap | R1/R3 |
| dispersar em todas as caixas | nunca fechar uma tranche | uma caixa por vez e WIP = 1 | governança |
| referência histórica regredir código | comportamento antigo | Git canônico + testes de caracterização | F2/F5 |
| fonte ou licença perder validade | knowledge pack indevido | versionamento, remoção e rastreabilidade por ruleId | release |

---

## 14. Orçamentos de qualidade do piloto

Antes de F3, definir e medir:

- tempo de inicialização do core;
- tamanho do bundle sem knowledge packs opcionais;
- tempo de análise em textos curtos, médios e longos;
- memória máxima no worker;
- cancelamento ao receber nova revisão;
- cobertura de branches das regras do piloto;
- paridade de resultados entre ambientes;
- zero acesso de rede;
- zero dependência de DOM no núcleo.

Os números-limite devem ser definidos a partir da baseline medida, não inventados antecipadamente.

---

## 15. Definição de pronto do primeiro PR

O primeiro PR só pode sair de rascunho quando:

- a exceção limitada foi aprovada por humano;
- o mapa e a memória não se contradizem;
- contrato v1 e não objetivos estão documentados;
- Morfologia roda nos cinco ambientes contratados;
- a aplicação atual mantém sua matriz integral;
- nenhum comportamento linguístico mudou sem rule card;
- nenhuma obra bruta entrou no Git, CI ou artefato;
- proveniência e maturidade do piloto permanecem honestas;
- rollback para `5174f18` está documentado;
- parecer Eva final recomenda prosseguir.

---

## 16. Deliberações recomendadas

### D1 — Começar agora?

Recomendação: **sim, com exceção limitada**. Construir contrato e provar Morfologia agora reduz dependência do editor sem abrir simultaneamente novas caixas. Parar obrigatoriamente após F3 para reavaliar.

### D2 — Novo repositório?

Recomendação: **não agora**. Primeiro provar isolamento dentro do repositório atual. Separar prematuramente aumenta sincronização, versionamento e CI sem provar valor.

### D3 — Publicar no npm?

Recomendação: **não no M0**. Manter `private: true` até contrato, licença, provenance e transplante estarem estáveis.

### D4 — Usar todos os livros de uma vez?

Recomendação: **não**. Consultar por pergunta delimitada, uma caixa por vez. Quantidade de leitura não equivale a conhecimento integrado.

### D5 — Mostrar referências na ferramenta?

Recomendação: **sim, por regra e com contexto**. Mostrar bibliografia, edição, papel e escopo; nunca trecho extenso, endosso ou lista decorativa de autoridades.

### D6 — Qual engine primeiro?

Recomendação: **Morfologia Verbal**, porque já possui TypeScript, contrato parcial, corpus separado e uma família `verified-limited`. Sintaxe continua em pesquisa.

---

## 17. Próximos passos, se aprovado

```text
☐ aprovar D1–D6 ou registrar ajustes
☐ criar ADR da exceção limitada
☐ atualizar somente vault-contracts no mapa canônico
☐ criar cofre/package.json com private: true
☐ escrever schemas e testes antes da implementação
☐ medir baseline do piloto morfológico atual
☐ transplantar sem ampliar regras
☐ executar prova Node/browser/worker/vanilla/Tiptap
☐ convocar Eva no fechamento F3
☐ decidir continuar, revisar ou voltar ao estado deferred
```

---

## 18. Parecer Eva preliminar desta abertura

### Dimensões tocadas

- Engenharia e auditabilidade: arquitetura proposta, sem mudança de nota;
- Fundamentação e proveniência: processo reforçado, sem mudança de nota;
- Morfologia verbal: candidata a piloto, sem mudança de cobertura;
- Sintaxe e estrutura oracional: permanece inalterada e não autorizada;
- Validação humana e acadêmica: nenhuma evidência nova.

### Acertos

- separa núcleo e casca;
- limita a primeira migração;
- transforma referência em proveniência, não em cópia;
- exige transplante real e não apenas afirmação de portabilidade;
- preserva incerteza e decisão autoral.

### Riscos

- usar a branch como autorização implícita para migrar tudo;
- confundir nove livros com cobertura da língua;
- congelar dados com proveniência incompleta;
- declarar portabilidade antes da prova em ambiente vazio.

### Decisão preliminar

`PROSSEGUIR COM CONDIÇÕES`.

Condições:

1. aprovação humana explícita da exceção limitada;
2. ADR antes de código;
3. Morfologia como único piloto;
4. nenhum livro bruto no repositório;
5. parada obrigatória e nova deliberação após F3;
6. nenhuma nota ou alegação linguística elevada por arquitetura.

---

## 19. Frase de guarda

> **A obra ensina. O Escrevaral fecha a obra, escreve sua própria compreensão, prova seus limites e só então permite que a regra entre no Cofre.**
