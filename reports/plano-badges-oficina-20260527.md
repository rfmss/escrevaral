# Plano — Marcas do Ofício

**Data:** 2026-05-27  
**Status:** rascunho revisado após análise de quatro especialistas + pivô de conceito — nada implementado  
**Equipe:** Claude (coordenação) + ux-escritora + marca-campanha + guardiao-preservacao + arquiteto-vanilla  

---

## Pivô de conceito — 2026-05-27

O sistema não é mais uma progressão de símbolos genéricos brasileiros. Cada medalha representa **um autor ou autora de domínio público** da literatura brasileira e de língua portuguesa. O desenho é a moeda daquele escritor — olha e já sabe de quem é.

> *"Olhar para a marca e dizer: é de fulano."*

**Antes:** facão (500 palavras), cacau (5 notas), café (1ª exportação) — símbolos de cultura brasileira ligados a volume de uso  
**Agora:** cada medalha = um autor específico, com iconografia tirada do universo literário dele — personagens, objetos, região, imagem icônica

A coleção cresce com o uso da ferramenta. Cada nova ação ou marco desbloqueia um autor diferente. 30 medalhas = 30 escritores. A escritora que usa o Escrevaral profundamente vai colecionando a companhia dos maiores da língua.

**Estilo visual (referência na imagem gerada):** xilogravura circular, preto e branco, borda orgânica, traço de entalhe — como uma moeda literária antiga.

---

## O que mudou em relação ao rascunho inicial

O rascunho tratava marcas como um sistema de conquistas binário — 7 badges com condições de unlock, toast de notificação, exibição no Arquivo. A análise dos especialistas confirmou a premissa central do criador e **corrigiu o enquadramento**:

> *A medalha está no arquivo, não no navegador. O arquivo é a testemunha do processo — não o app.*

Isso muda tudo. O sistema não é gamificação; é **proveniência**. Como o Twitter mostrando "membro desde 2012", mas privado, local, e gravado no próprio material.

---

## Premissa central (validada pela equipe)

- A marca está **dentro do `.esc`** — quando a escritora exporta e importa de volta, a marca vem junto
- O arquivo carrega seu próprio tempo: criado em tal data, X palavras investidas, Y sessões de trabalho
- A marca não é anunciada — ela é descoberta quando a escritora abre o painel do arquivo
- A profissão de escritor tem poucos louros; este sistema cria um registro virtual e privado de ofício
- Metáfora certa (ux-escritora): **"o couro que escurece com o uso"**, não o troféu que aparece no palco

**Frase para a interface:** *"Este texto carrega o tempo que você investiu nele."*  
**Frase do sistema:** *"Estas marcas aparecem sozinhas, com o tempo — nenhuma precisa ser buscada."*

---

## Duas camadas distintas (decisão estrutural)

A equipe identificou que misturar as duas naturezas em um único sistema gera inconsistência de UX.

### Camada A — Marcas de ação
Binárias. Conquistadas quando algo concreto acontece pela primeira vez. Podem usar o toast discreto do `saveStatus` (3 segundos) para notificar — o mesmo canal do "Texto salvo". Permanecem visíveis no painel do Arquivo como registro.

### Camada B — Marca de tempo
Não é conquistada: existe desde o primeiro dia. Cresce silenciosamente com o tempo + uso. **Sem notificação de nenhum tipo** — a escritora encontra ao abrir o painel do arquivo, como encontra metadados. Exibe: "Este manuscrito existe há 1 ano e 3 meses. 42 mil palavras escritas."

---

## Os 30 autores — catálogo definitivo (spritesheet v1, 2026-05-27)

Spritesheet gerado, estilo definido: **xilogravura circular, preto e branco, borda orgânica, banner com nome na base**. Referência visual já existe — 30 medalhas prontas para teste de legibilidade.

**Equilíbrio deliberado:** 18 mulheres, 12 homens. A maioria das escritoras foi apagada da história literária — o sistema funciona também como resgate. A escritora que usa o Escrevaral pode não conhecer Firmina nem Nísia; ao coletar a medalha, encontra.

### As 18 escritoras (linhas 1–3 do spritesheet)

| N | Nome completo | Objeto na medalha | Obra central | Domínio público |
|---|---|---|---|---|
| 1 | **Maria Firmina dos Reis** | Correntes partidas | *Úrsula* (1859) — 1.º romance abolicionista, 1.ª romancista negra | ✅ †1917 |
| 2 | **Nísia Floresta** | Sino | *Direito das Mulheres e Injustiça dos Homens* (1832) — 1.ª feminista brasileira | ✅ †1885 |
| 3 | **Júlia Lopes de Almeida** | Camélia | *A Falência* (1901) — Belle Époque carioca, escritora mais lida de seu tempo | ✅ †1934 |
| 4 | **Auta de Souza** | Lírio | *Horto* (1900) — mística, poesia do RN, morreu aos 24 anos | ✅ †1901 |
| 5 | **Emília Freitas** | Coroa | *A Rainha do Ignoto* (1899) — ficção científica utópica, rainhas amazônicas | ✅ †1908 |
| 6 | **Narcisa Amália** | Pena de escrever | *Nebulosas* (1872) — primeira mulher a publicar livro de poesia no Brasil | ✅ †1924 |
| 7 | **Francisca Júlia** | Esfinge | *Mármores* (1895) — Parnasianismo, "a esfinge" — recusou sentimentalismo | ✅ †1920 |
| 8 | **Adelina Lopes Vieira** | Boneca de pano | Contos e crônicas — escritora portuguesa de fins do século XIX | ✅ †c.1920 |
| 9 | **Ana de Castro Osório** | Chave | *Às Mulheres Portuguesas* (1905) — sufragismo, chave da emancipação | ✅ †1935 |
| 10 | **Florbela Espanca** | Rosa com espinhos | *Charneca em Flor* (1931) — a mais intensa das poetas portuguesas | ✅ †1930 |
| 11 | **Alice Moderno** | Máquina de escrever | Jornalista e escritora açoriana — pioneira no feminismo nos Açores | ✅ †1946 |
| 12 | **Maria Amália Vaz de Carvalho** | Lira | Poeta e ensaísta portuguesa — primeira mulher na Academia das Ciências | ✅ †1921 |
| 13 | **"Barandas"** (Maria Josefa Barreto P. Pinto) | Urna | Escritora política portuguesa do início do século XIX | ✅ †1862 |
| 14 | **Clotilde de Cerdà** ("Esmeralda Cervantes") | Lousa | Harpista e escritora catalã radicada no Brasil — educação e música | ✅ †1926 |
| 15 | **Peregrina de Sousa** | Vela | Poetisa brasileira de meados do século XIX | ✅ †1868 |
| 16 | **Maria Benedita Bormann** ("Délia") | Leque | *Duas Lágrimas* (1886) — Romantismo tardio, Rio de Janeiro | ✅ †1895 |
| 17 | **Guiomar Torrezão** | Máscara de teatro | Dramaturga e cronista portuguesa — "a mulher de letras" | ✅ †1898 |
| 18 | **Ana Amália Carneiro de Mendonça** | Tinteiro | Poetisa e tradutora brasileira do início do século XX | ✅ †1924 |

### Os 12 escritores (linhas 4–5 do spritesheet)

| N | Nome completo | Objeto na medalha | Obra central | Domínio público |
|---|---|---|---|---|
| 19 | **Machado de Assis** | Óculos redondos | *Dom Casmurro*, *Memórias Póstumas de Brás Cubas* | ✅ †1908 |
| 20 | **Monteiro Lobato** | Boneca de pano | *Sítio do Picapau Amarelo* — ⚠️ ver nota abaixo | ⚠️ †1948 |
| 21 | **Castro Alves** | Navio veleiro | *O Navio Negreiro* (1869) — o poeta dos escravos | ✅ †1871 |
| 22 | **José de Alencar** | Cocar indígena | *Iracema* (1865), *O Guarani* (1857) | ✅ †1877 |
| 23 | **Euclides da Cunha** | Cacto/mandacaru | *Os Sertões* (1902) — Canudos, a caatinga, a tragédia | ✅ †1909 |
| 24 | **Lima Barreto** | Jornal | *Triste Fim de Policarpo Quaresma* — subúrbio, ironia, jornalismo | ✅ †1922 |
| 25 | **Augusto dos Anjos** | Caveira | *Eu* (1912) — poesia da decomposição, morte, ciência | ✅ †1914 |
| 26 | **Raul Pompeia** | Lampião de querosene | *O Ateneu* (1888) — internato, memória, crueldade | ✅ †1895 |
| 27 | **João Simões Lopes Neto** | Cuia de chimarrão | *Contos Gauchescos* (1912) — pampa, tradição gaúcha | ✅ †1916 |
| 28 | **Gonçalves Dias** | Palma tropical | *Canção do Exílio* (1843), *I-Juca-Pirama* | ✅ †1864 |
| 29 | **Aluísio Azevedo** | Casarão de cortiço | *O Cortiço* (1890) — Naturalismo, vida coletiva urbana | ✅ †1913 |
| 30 | **Fernando Pessoa** | Baú fechado | Heterônimos guardados no famoso baú descoberto após a morte | ✅ †1935 |

---

### ⚠️ Risco Monteiro Lobato (#20)

As **obras** de Lobato são domínio público desde 2018. Mas os **personagens** — Emília, Narizinho, Pedrinho, Visconde de Sabugosa — são ativamente protegidos por **marca registrada** gerida pela família/herdeiros. O desenho da boneca de pano no spritesheet é suficientemente genérico para ser defensável, mas antes de publicar é preciso verificar se a INPI tem registros de marca sobre "Emília" ou "Sítio do Picapau Amarelo" como personagens gráficos.

**Alternativa mais segura:** trocar o objeto icônico de Lobato para a cobra-coral (símbolo da campanha pelo petróleo "O Petróleo é Nosso"), o mapa do Brasil com um ponto no Vale do Paraíba, ou a árvore de jabuticaba — elementos ligados à obra e à vida sem conotação de personagem protegido.

---

### Escolhas particularmente acertadas (para constar no debate com Codex)

- **Firmina com correntes partidas** — *Úrsula* (1859) é o primeiro romance abolicionista do Brasil e foi esquecido por um século. A medalha mais fácil de desbloquear (primeira nota) carrega o nome mais apagado da lista. Isso é uma declaração.
- **Emília [Freitas] com coroa** — *A Rainha do Ignoto* (1899) é ficção científica utópica com protagonistas femininas. Quase ninguém sabe que existe. A coroa é o símbolo perfeito e não remete à Emília do Lobato.
- **Pessoa com baú** — o famoso baú onde Pessoa guardou 25.000 documentos, heterônimos e poemas, descoberto após a morte. A escolha mais densa de sentido de toda a série.
- **Simões com chimarrão** — único símbolo regional do Sul na coleção. Simões Lopes Neto é o maior escritor gaúcho e quase ausente dos cânones nacionais.
- **Florbela com rosa de espinhos** — sintetiza toda a obra dela em um objeto: beleza e dor, o amor que fere.

---

## Arquitetura técnica

### O que precisa ser criado

**`badges-data.js`** — catálogo estático das 15 marcas (id, nome, ícone, descrição, condição em pseudocódigo)

**`badges-engine.js`** — motor de checagem, conquista, notificação e renderização:
```js
function checkBadge(id, conditionFn)  // verifica e chama earnBadge se condição verdadeira
function earnBadge(id)                // registra, persiste, notifica via saveStatus (3s)
function renderBadgesPanel(el)        // renderiza painel no Arquivo
function checkBadgesRetroactively()   // roda no import — concede marcas merecidas pelo estado restaurado
```

### Armazenamento — decisão crítica do arquiteto-vanilla

**Não** misturar `badges` no payload principal (`STORAGE_KEY = "vereda.manuscripts.v1"`). Usar chave separada:

```js
const BADGES_STORAGE_KEY = "vereda.badges.v1";
```

Isso isola o dado, facilita debug e não polui o payload de manuscritos com risco de quota do localStorage.

### Inclusão no `.esc` — correção crítica do guardião

O `.esc` atual **não inclui badges** — eles se perderiam em qualquer export/import. Correção cirúrgica em dois pontos:

**`backup-engine.js` — `createBackup()`:**
```js
{
  activeId: state.activeId,
  manuscripts: state.manuscripts,
  badges: VeredaBadges.getState() || { earned: [], earnedAt: {} },  // linha nova
  // ...demais campos
}
```

**`backup-engine.js` — `restoreBackup()`:**
```js
badges: data.badges || { earned: [], earnedAt: {} },
```

### Campo `createdAt` por manuscrito

Não existe hoje. Precisa ser adicionado ao `addManuscript()` e ao `VeredaArchive.createManuscript()`:

| Cenário | `createdAt` |
|---|---|
| Nota criada do zero | `new Date().toISOString()` no momento de `addManuscript()` — nunca sobrescrever |
| Nota importada via `.esc` | Respeitar o `createdAt` do arquivo; se ausente (arquivo antigo), usar `updatedAt` com flag `createdAtEstimated: true` |
| Nota duplicada | `Date.now()` — é um objeto novo, sem herdar proveniência do original |

### Fórmula de progressão (se usar níveis no futuro)

Para a Camada B (marca de tempo que evolui):
```js
const level = Math.floor(Math.log2(totalWords / 500 + 1));
// gera ~15 níveis entre 0 e 32.000 palavras
// progressão desacelera naturalmente — sem plateau súbito
```

Bônus aditivo opcional: `+1` se o arquivo tem mais de 30 dias; `+1` se tem mais de 20 sessões salvas (`state.meta.sessionCount`). Para o MVP, as 15 marcas binárias são mais robustas e auditáveis.

### Pontos de gatilho em `app.js`

| Gatilho | Marca verificada |
|---|---|
| `addManuscript()` | `folha-em-branco`, `cacau-colhido`, `couro-do-sertao` |
| `persistState()` em input (debounced) | `primeiro-traco`, `facao-na-mao`, `mao-na-enxada`, `cipo-trancado`, `caule-de-buriti`, `velho-do-oficio` |
| `setView("autoria")` com nota ativa | `parede-de-adobe` |
| `useActiveManuscriptForRimaLab()` | `verso-falado` |
| `exportCurrentManuscript()` / `exportArchiveManuscript()` | `grao-de-cafe`, `velho-do-oficio` |
| `cronoHandleAction("crono-add-task")` com save | `linha-de-corte` |
| `checkBadgesRetroactively()` no import | todas |

### Manipulação do `.esc`

O `.esc` já tem assinatura VRDA (`VeredaVrda.createEnvelope` / `parseEnvelope`). Editar manualmente o JSON invalida a assinatura — o import é recusado ou sinalizado como "assinatura inválida". As marcas não têm valor externo (sem ranking, sem social), então falsificar uma é auto-engano de baixo impacto. **Não criar sistema de verificação separado para badges** — a assinatura existente é suficiente.

---

## UX — o que fazer e o que não fazer

### ✅ Fazer
- Exibir a "marca de tempo" como linha de metadados no painel do arquivo: `"Criado em março de 2024 · 1 ano e 2 meses · 12.340 palavras"`
- Marcas de ação: chips discretos no final do Arquivo, abaixo das listas e antes de Cópias de segurança
- Toast via `saveStatus` por 3 segundos ao conquistar marca de ação (ex: `"✦ Grão de café — primeiro manuscrito exportado"`)
- Marcas não conquistadas: exibidas mas apagadas (opacidade reduzida), sem indicador de "progresso" ou "faltam X palavras"

### ❌ Não fazer
- Barra de progresso para a próxima marca
- Animação de "desbloqueio" ou ícone que pulsa
- Número de pontos ou tier nomeado (Iniciante, Aprendiz, Mestre)
- Qualquer coisa que apareça durante a escrita
- Toast para a marca de tempo (só para marcas de ação)
- Comparação entre manuscritos
- Pop-up, modal ou notificação persistente

---

## Onde vivem as marcas na interface

```
[ Arquivo ]
  ├── Notas e manuscritos (lista existente)
  │    └── Cada nota: linha discreta "Criado em [data] · [idade]" ← Camada B, inline
  ├── Organizar (grid existente)
  ├── [ Marcas do ofício ]  ← nova seção, Camada A
  │    └── Chips: conquistadas (cor do tema) + não conquistadas (apagadas)
  └── Cópias de segurança (existente)
```

**Exportação HTML** — a "assinatura da trajetória" no rodapé do documento exportado é uma possibilidade interessante para fase 2. Cria acoplamento entre formato de exportação e sistema interno; aguardar validação da premissa antes de implementar.

---

## Shape do estado

```js
// Em vereda.badges.v1 (localStorage separado)
{
  earned: ["folha-em-branco", "grao-de-cafe"],
  earnedAt: {
    "folha-em-branco": "2024-03-10T14:22:00Z",
    "grao-de-cafe":    "2024-08-01T09:15:00Z"
  },
  importedAt: {
    "parede-de-adobe": "2026-01-15T11:00:00Z"   // marca retroativa no import
  }
}

// Em cada manuscrito (state.manuscripts[n])
{
  // ...campos existentes
  createdAt: "2024-03-10T14:20:00Z",           // novo campo
  createdAtEstimated: false,                    // true se veio de arquivo sem createdAt original
}
```

---

## A marca como impressão digital única — caminho NFT

*Discussão acrescentada em 2026-05-27.*

A questão levantada: mesmo que todas as marcas de "Grão de Café" tenham o mesmo desenho, **cada uma pode ter uma assinatura criptográfica única** — ligada àquele arquivo, àquela data, àquela trajetória. O valor não está na imagem; está no código que só pôde ser gerado por aquela combinação específica.

Isso é o espírito de um NFT: o que é único não é a arte — é o **token ID**. O mesmo macaco do Bored Ape pode ser copiado por qualquer pessoa. O que ninguém pode copiar é o registro que diz que aquele token pertence àquela carteira. O equivalente aqui: a marca da escritora carrega uma impressão digital que prova que ela foi gerada por aquele arquivo específico, naquela data, com aquela autoria.

### Três caminhos possíveis

| | Caminho 1 — Impressão digital local | Caminho 2 — OpenTimestamps | Caminho 3 — NFT real |
|---|---|---|---|
| Funciona offline | ✅ | ⚠️ adiável | ❌ |
| Sem conta / sem carteira | ✅ | ✅ | ❌ |
| Verificável por terceiros | ❌ | ✅ (Bitcoin) | ✅ |
| Âncora pública permanente | ❌ | ✅ | ✅ |
| Transferível / negociável | ❌ | ❌ | ✅ |
| Gratuito | ✅ | ✅ | ❌ |
| Alinhado com a filosofia offline-first | ✅ | ✅ | ❌ |

#### Caminho 1 — Impressão digital criptográfica (sem blockchain)

No momento da conquista, gerar um fingerprint usando a Web Crypto API (nativa no navegador, sem dependência):

```js
fingerprint = HMAC-SHA256(
  manuscript.createdAt +
  manuscript.id +
  badge.id +
  SHA256(manuscript.text)   // hash do texto no momento da conquista
)
```

O resultado é um código curto gravado no `.esc`: `VRDA-GCF-7K2M-9XQP`

O que garante: ninguém pode forjar a marca sem falsificar o arquivo inteiro (o que invalida a assinatura VRDA existente). O código é matematicamente único para aquela combinação. Viaja com o arquivo para sempre.

O que não garante: verificação por terceiros sem o arquivo original — é uma prova interna, não pública.

**Este caminho é o MVP natural** — a infraestrutura VRDA já existe no produto.

#### Caminho 2 — OpenTimestamps (blockchain gratuita, sem carteira)

O produto já menciona OpenTimestamps no contexto da Prova de Autoria (`publicacao-direitos`). Para marcas raras (Velho do Ofício, Couro do Sertão), quando houver conexão:

1. Gerar o fingerprint (Caminho 1)
2. Enviar o hash para `opentimestamps.org` (gratuito, sem conta)
3. Receber um arquivo `.ots` que fica dentro do `.esc`

A escritora teria: *"Minha marca Velho do Ofício foi ancorada no bloco #893.402 do Bitcoin em 27 de maio de 2026."*

Prova pública, verificável por qualquer pessoa, para sempre. Não cria ativo negociável — é prova de existência no tempo.

#### Caminho 3 — NFT real (Ethereum, Solana)

A marca seria mintada como token ERC-721 ou equivalente. Token ID único no ledger público, transferível, vendável.

Conflita com o produto: requer carteira cripto, gas fees, conexão no momento do mint, infraestrutura de terceiros. Fora do escopo do Escrevaral como produto offline-first.

### Frase para a interface

> *"Esta marca tem uma impressão digital única. Ela foi criada com este texto, nesta data, e não pode ser transferida para outro arquivo."*

### Decisão recomendada

- **MVP:** Caminho 1 — fingerprint `HMAC-SHA256` gravado no `.esc` junto com cada marca
- **Fase 2:** Caminho 2 opcional — âncora Bitcoin para marcas raras, quando houver conexão
- **Fora do escopo:** Caminho 3

### Shape atualizado com fingerprint

```js
// vereda.badges.v1
{
  earned: ["folha-em-branco", "grao-de-cafe"],
  earnedAt: {
    "folha-em-branco": "2024-03-10T14:22:00Z"
  },
  fingerprints: {
    "folha-em-branco": "VRDA-FEB-3K7M-2XQP",   // HMAC-SHA256 truncado, base58
    "grao-de-cafe":    "VRDA-GCF-7K2M-9XQP"
  },
  timestamps: {
    "grao-de-cafe": { ots: "<base64 do arquivo .ots>", block: 893402 }  // Caminho 2, opcional
  }
}
```

---

## Perguntas abertas para o debate com o Codex

1. **Catálogo dos 30:** a seleção prioriza reconhecimento e domínio público. Faltam nomes? Algum deve sair? Critério de desempate: o objeto icônico precisa ser imediatamente reconhecível sem legenda.

2. **Domínio público rigoroso:** todos os 30 autores listados têm obras em domínio público no Brasil (Lei 9.610/98, 70 anos após a morte, falecidos até 1955). Verificar caso a caso antes de implementar — especialmente Gil Vicente (data de morte incerta, obra claramente em DP) e Monteiro Lobato (1948 → DP desde 2018, mas personagens como Emília podem ter proteção de marca registrada separada pela família).

3. **Exibir medalhas não conquistadas:** mostrar todas as 30 apagadas cria uma lista de tarefas inconsciente. Mostrar só as conquistadas mantém a descoberta. Qual o equilíbrio certo?

4. **O desenho:** o spritesheet foi gerado por IA com estilo de xilogravura circular. Esse é o direcionamento visual — mas os 30 desenhos finais precisam ser consistentes entre si. Quem os gera? IA com prompt controlado (Midjourney/DALL-E)? Ilustradora contratada? Isso tem custo e tempo.

5. **Marcas retroativas no import:** ao importar um arquivo antigo, `checkBadgesRetroactively()` concede medalhas que o estado justifica. A escritora ganha "Machado de Assis" porque já tinha uma nota — mas ela não estava presente no momento em que isso foi possível. Isso é honesto?

6. **Fingerprint: HMAC ou derivação da chave VRDA existente?** Faz sentido derivar o fingerprint da medalha da mesma identidade do arquivo VRDA, ou manter independentes?

7. **OpenTimestamps para medalhas raras:** o Caminho 2 (âncora no Bitcoin) quebra o princípio de "sem envio de dados"? O hash é opaco, mas o timing do request revela que a escritora atingiu um marco. Isso importa?

8. **A Camada B na exportação HTML:** o rodapé do `.html` exportado poderia ter `"Acompanhado por Graciliano Ramos desde março de 2024"`. O arquivo leva a medalha para fora do app. Vale o acoplamento?

---

## Menor passo viável

1. Adicionar `createdAt` ao `createManuscript()` (uma linha)
2. Criar `vereda.badges.v1` no localStorage com shape mínimo
3. Implementar só `folha-em-branco` — do gatilho ao chip no Arquivo
4. Incluir `badges` no `.esc` (duas linhas em backup-engine.js)
5. Exibir `createdAt` formatado no painel do arquivo como linha de metadados

Se ninguém perceber ou comentar em 2 semanas de uso, não expandimos.

---

## Arquivos que precisam ser tocados na implementação

| Arquivo | Mudança |
|---|---|
| `badges-data.js` | criar — catálogo estático |
| `badges-engine.js` | criar — motor |
| `state-store.js` | `createdAt` no shape de manuscrito |
| `backup-engine.js` | incluir `badges` no `createBackup()` e `restoreBackup()` |
| `backup-controller.js` | `_executeImport` — spread com default para `badges` |
| `app.js` | gatilhos + render do painel |
| `index.html` | `<script defer>` para os dois novos arquivos + bump de versão |
| `service-worker.js` | adicionar ao `CORE_ASSETS` + bump de versão |
| CSS | `.badges-section`, `.badge-chip` (earned / unearned) |

---

*Plano revisado pós-análise de equipe — aguarda revisão do Codex antes de qualquer linha de código.*
