# Plano de execução — Dicionário PT-BR offline (núcleo universal)

*Documento para o executor (ChatGPT/Codex). Itens marcados **\[VERIFICAR\]** não foram confirmados: confira na fonte antes de usar. Nunca invente licença, número ou fonte.*

## 1. Missão

Construir um dicionário de português do Brasil, 100% offline, para uma oficina literária. Ele será baixado inteiro no primeiro acesso e deve rodar em aparelhos antigos (Android 4.4 KitKat, iPad 2 de 2012, computadores de 2012). A escolha é estratégica: **não avançar a tecnologia**. O dicionário é um núcleo universal e estável, e qualquer "capinha" (interface) futura, inclusive com IA, é só uma casca por cima dele.

A IA participa **só na construção**. Depois que o site estiver pronto, nenhum acesso a IA, rede ou servidor é necessário.

## 2. Decisões já travadas (não rediscutir)

1. O dicionário responde: **a palavra existe** (ortografia) e **o que significa** (definições e sinônimos).
2. Cada verbete tem: **definição + classe gramatical + exemplo de uso**.
3. Consulta por **palavra exata**, **busca sem acento** (cafe = café) e sugestão **"você quis dizer…"**.
4. Norma ortográfica: **Acordo Ortográfico de 1990**. Grafias antigas ficam guardadas só como entrada de correção.
5. **Todas as formas flexionadas listadas** (plural, feminino, conjugações). Sem flexão por regra em tempo de execução.
6. Vocabulário: **padrão + regionalismos e gírias, sempre marcados**.
7. **Sem teto de tamanho** de download. O limite real é a memória ao abrir cada arquivo no aparelho mais fraco.
8. Dados montados a partir de **várias fontes combinadas**, com a origem de cada dado registrada.
9. Construção **em camadas aditivas**: cada camada é um conjunto de arquivos independente. O núcleo funciona só com as primeiras camadas.

## 3. Baseline técnica (alvo mais fraco)

Verificado:

- Android 4.4 usa WebView baseada em **Chromium 30**, que **não é atualizada** (4.4.3 → Chromium 33). Fontes: firt.dev/android-4.4 e a palestra de Niels Leenheer (PhoneGap Day EU 2015).
- A WebView do KitKat tem recursos que o Chrome de celular tem e ela não, e o suporte a IndexedDB aparece como ponto de atenção na análise de Firtman. Trate **IndexedDB como opcional**.
- O iPad 2 para em **iOS 9.3.5** (Wi-Fi) ou **9.3.6** (celular).

Regras de código de execução (runtime):

- **ES5 puro.** Sem `let/const`, arrow functions, classes, template strings, módulos, `Promise`, `fetch`, `Map/Set`, `String.prototype.normalize`, `Array.from`. **\[VERIFICAR\]** cada um no emulador antes de assumir que existe.
- **Sem service worker.** O primeiro download tem de funcionar só com arquivos estáticos. Para cache offline, testar *AppCache* e/ou instruir salvar a página. **\[VERIFICAR\]** em Android 4.4 e iOS 9.3.5.
- Carregar dados por **tag `<script>`** (arquivos `.js` que chamam `D.f(...)`), não por XHR, porque XHR em `file://` é bloqueado em muitos navegadores. Manter também um modo XHR opcional.
- Nenhum arquivo de dados acima de \~300 KB descomprimido. **\[VERIFICAR\]** limite real com teste de memória no aparelho/emulador mais fraco.
- Normalização de acentos por **tabela própria** (mapa caractere a caractere), nunca por `normalize()`.
- Ordenação por **comparação de códigos** da chave normalizada. Nunca `localeCompare`.

## 4. Arquitetura em camadas

Unidade de armazenamento: arquivos UTF-8 (NFC), linhas separadas por `\n`, campos por `|`, fragmentados pelos **2 primeiros caracteres da chave normalizada** (ex.: `ca`, `ma`). Se um fragmento passar do limite de tamanho, subdivide por 3 caracteres (`cas`, `cat`) e registra no `manifest`.

Envoltório de cada arquivo `.js` (ES5):

```js
D.f("ca", "cafe|café|c.s1|s\ncafeina|cafeína|cafeina.s1|s\n...");
```

O texto vai numa **única string** quebrada em linhas, não num array, para poupar memória.

### Camada 0 — Contrato do formato (congelar cedo)

- Documento `SPEC.md` com: codificação, envoltório, separadores, escape (`|`, `\`, quebra de linha), códigos de classe, versão do formato.
- `manifest.js`: lista de fragmentos por camada, contagens e checksums.
- **Congelar na Fase 0.** Mudanças depois só por versão nova e retrocompatível. Este é o contrato que o futuro herda.

Códigos de classe (as 10 classes gramaticais): `a` artigo, `s` substantivo, `j` adjetivo, `n` numeral, `p` pronome, `v` verbo, `d` advérbio, `r` preposição, `c` conjunção, `i` interjeição.

### Camada 1 — Formas (a palavra existe?)

Arquivos `f/<prefixo>.js`. Linha: `chave|forma|lid|cl`.

- `chave`: forma sem acento e minúscula (ordenação e busca).
- `forma`: grafia vigente pelo Acordo de 1990, com acentos.
- `lid`: identificador estável do lema (ver Camada 3). Pode ficar vazio até a Camada 3.
- `cl`: código de classe, pode ficar vazio até a Camada 3.
- Uma linha por forma flexionada. Homógrafos (mesma forma, lemas diferentes) geram linhas separadas.

### Camada 2 — Busca sem acento e correção

Arquivos `x/<prefixo>.js`.

- Linha `k`: `chave|forma1,forma2` quando mais de uma grafia acentuada compartilha a mesma chave (ex.: `pais` → `país,pais`).
- Linha `o` (grafia antiga): `antiga|vigente` (ex.: `ideia`/`idéia` → `ideia`; `vôo` → `voo`).
- Sugestão "você quis dizer": 1) chave idêntica; 2) mapa de grafia antiga; 3) distância de edição ≤ 1 (≤ 2 para palavras longas) **dentro do fragmento e dos fragmentos vizinhos**; 4) máximo de 5 sugestões, ordenadas por frequência quando houver (Camada 3+).

### Camada 3 — Lemas e classes

Arquivos `l/<prefixo>.js`. Linha: `lid|lema|cl|info`.

- `lid` = `<chave do lema>.<cl><n>` onde `n` desambigua homógrafos (`manga.s1`, `manga.s2`).
- `info`: gênero e número para substantivos, regência básica para verbos (curto).
- Preenche `lid` e `cl` da Camada 1.
- Fontes de partida e licenças: ver seção 5.

### Camada 4 — Definições

Arquivos `d/<prefixo>.js`. Linha: `lid|n|marcas|definição`, uma linha por sentido.

- `marcas` (códigos curtos, lista fechada em `SPEC.md`): registro (`pop`, `gir`, `chu`, `for`, `lit`), região (`NE`, `S`, `SE`, `N`, `CO`, `reg`), época (`arc`), área técnica.
- Definição em português, curta, sem circularidade ingênua (não definir A por B e B por A).
- Cada linha leva `fonte` (código da fonte) e `rev` (`h` humano, `a` gerado por IA, `v` verificado). Pode ir em arquivo paralelo `d/<prefixo>.meta.js` para não pesar no runtime.

### Camada 5 — Exemplos de uso

Arquivos `e/<prefixo>.js`. Linha: `lid|n|exemplo`.

- Frases **originais**, escritas na construção. Não copiar de livros ou sites com direitos.
- Cada exemplo deve conter a forma ou o lema, em contexto natural, até \~140 caracteres, sem pessoas reais nem conteúdo ofensivo (exceto verbete marcado `chu`/`gir`, com tom neutro).

### Camada 6 — Sinônimos

Arquivos `s/<prefixo>.js`. Linha: `lid|n|sin1,sin2,...` presos ao **sentido**, não à palavra.

- Só sinônimos que existam como lema na Camada 3. Validar.
- Relação **não é automaticamente simétrica**. Gerar a inversa só se passar na revisão.

## 5. Fontes e licenças

Regra: **abrir o arquivo de licença de cada fonte e registrar em `SOURCES.md`** (nome, URL, versão/data, licença, o que foi usado). Fonte sem licença clara **não entra**.

Candidatas:

| Fonte | Uso | Estado da verificação |
| --- | --- | --- |
| Dicionário Aberto (dicionario-aberto.net) | Definições-semente e lista de lemas | **Domínio público** (LREC 2010). Base é o Cândido de Figueiredo de 1913: grafia pré-acordo, português europeu, arcaísmos. Filtrar e normalizar. XML de \~30 MB. |
| Wikcionário via kaikki.org | Formas flexionadas, classes, marcas de grafia superada | Dados derivados do **dump do Wiktionary em inglês** (glosas em inglês). Há categorias de "forma superada em 1911/1943". **\[VERIFICAR\]** licença (esperada CC BY-SA) e se existe extração do Wikcionário em português. |
| Wikcionário em português (pt.wiktionary.org) | Definições em português do Brasil | **\[VERIFICAR\]** licença e termos de reutilização. Se for compartilha-igual, decidir com o dono do projeto. |
| Hunspell pt\_BR / dicionários do LibreOffice | Lista de formas ortográficas | **\[VERIFICAR\]** licença exata e se segue o Acordo de 1990. |
| OpenWordnet-PT, TeP | Sinônimos | **\[VERIFICAR\]** licença e cobertura. |
| VOLP / ABL | Conferência oficial de ortografia | **\[VERIFICAR\]** termos de uso. Provavelmente só consulta pontual, não redistribuição. |

Se a única opção para um dado for fonte com compartilha-igual, **pare e pergunte ao dono** antes de misturar: isso pode obrigar o dicionário todo a adotar a mesma licença.

## 6. Filtro do Acordo Ortográfico de 1990

Aplicar como **regras**, depois conferir contra uma fonte oficial **\[VERIFICAR\]**. Principais mudanças a cobrir: remoção do trema (`freqüência` → `frequência`); fim do acento em ditongos abertos `ei/oi` de paroxítonas (`idéia` → `ideia`); fim do acento em `êem/ôo` (`vôo` → `voo`, `crêem` → `creem`); fim do acento diferencial em `pára`/`pêlo` etc. (`para`, `pelo`); mudanças de hífen (`anti-social` → `antissocial`, `co-herdeiro` → `coerdeiro`); consoantes mudas em variantes (`acto` → `ato`, `óptimo` → `ótimo`). Há exceções e casos de variante aceita. Todo caso duvidoso vai para `revisar.csv` e **não entra** até decisão humana.

## 7. Estrutura do repositório

```
dict-ptbr/
  SPEC.md            contrato do formato (Camada 0)
  SOURCES.md         fontes, versões, licenças
  CHANGELOG.md
  data-src/          bruto baixado (não vai para dist)
  build/             scripts de montagem (podem ser modernos)
  dist/              saída final, só texto e .js ES5
    manifest.js
    f/ x/ l/ d/ e/ s/
  runtime/           dict.js (ES5), lookup, sugestão
  demo/              index.html minimalista que roda em KitKat
  tests/             testes automáticos + lista de aparelhos
  review/            amostras para revisão humana, revisar.csv
```

O script de build é determinístico: mesma entrada, mesma saída. A saída em `dist/` é o produto.

## 8. Fases e critérios de aceite

**Fase 0 — Contrato.** `SPEC.md` completo, `manifest` definido, runtime esqueleto que carrega um fragmento fake em Android 4.4 e iOS 9.3.5. *Aceite: lookup de uma palavra de teste funcionando nos dois alvos.*

**Fase 1 — Formas.** Baixar fontes, registrar licenças, montar a lista de formas com Acordo de 1990. *Aceite: contagem por prefixo, sem duplicatas, ordenação correta, `revisar.csv` com os casos duvidosos, amostra de 300 formas revisada por humano.*

**Fase 2 — Busca sem acento e correção.** Índice, mapa de grafias antigas e sugestão. *Aceite: `cafe` → `café`; `idéia` → `ideia`; entradas com erro de uma letra sugerem a forma certa em conjunto de teste de 200 casos.*

**Fase 3 — Lemas e classes.** Ligar formas a `lid` e `cl`. *Aceite: toda forma tem lema; as 10 classes presentes; homógrafos tratados.*

**Fase 4 — Definições**, em lotes por frequência de uso (palavras mais comuns primeiro). Cada lote: gerar, validar com script, revisar amostra de 5%. *Aceite do lote: 0 erros de formato, 0 definições circulares detectadas pelo script, marcas de registro e região presentes quando aplicável.*

**Fase 5 — Exemplos.** Mesma rotina de lotes. *Aceite: o exemplo contém a palavra ou uma forma dela, tamanho dentro do limite, sem repetição entre sentidos.*

**Fase 6 — Sinônimos.** *Aceite: todo sinônimo existe como lema; sem auto-referência.*

**Fase 7 — Teste de aparelho e empacotamento.** Rodar `demo/` em: Android 4.4 (emulador e, se possível, aparelho real), iOS 9.3.5 (iPad 2 real ou simulador de iOS 9), um computador de 2012. Medir memória ao abrir o maior fragmento. *Aceite: busca em menos de 1 s em cada alvo, nenhum travamento ao abrir fragmentos, lista de aparelhos testados em `tests/DEVICES.md`.*

## 9. Regras para dados gerados por IA

1. Marcar todo dado gerado com `rev=a`. Só vira `v` depois de revisão.
2. Nunca inventar etimologia, data ou autor. Fora do escopo.
3. Definir pelo uso corrente no Brasil. Marcar regionalismo e gíria. Na dúvida, **omitir o sentido** em vez de chutar.
4. Palavra rara ou ambígua que a IA não conhece bem vai para `revisar.csv`, não para o dicionário.
5. Lotes de \~200 verbetes, com esquema JSON fixo na entrada e na saída, validado por script antes de entrar.
6. Registrar a cada lote: modelo usado, data, prompt, taxa de rejeição.

## 10. Riscos e como tratar

- **Licença compartilha-igual** contaminando o conjunto: tratar na seção 5, antes de misturar.
- **Memória no KitKat** estourando por arquivo grande: limite de tamanho por fragmento e teste real na Fase 7.
- **Qualidade das definições geradas**: lotes, amostragem e marca `rev`.
- **Cobertura de gírias e regionalismos**: ponto fraco de fontes formais. Priorizar o Wikcionário em português e revisão humana de uma lista curta.
- **Mudança de formato tarde demais**: o contrato da Camada 0 congela cedo.

## 11. Parâmetros a definir com o dono do projeto (defaults entre colchetes)

1. Nome do projeto e do prefixo de arquivos \[`dict-ptbr`\].
2. Alvo de volume inicial \[todas as formas da Camada 1; definições para os \~20 mil lemas mais frequentes primeiro\].
3. Fonte de **frequência** para priorizar lotes \[**VERIFICAR** corpus aberto de frequência do português\].
4. Política de licença do dicionário final \[decidir antes da Fase 1\].

## 12. Instrução de partida para o executor

> Você é o executor deste plano. Siga as fases em ordem. Antes de cada fase, releia as seções 2, 3 e 9. Não pule a verificação das fontes e licenças. Comece pela **Fase 0**: gere `SPEC.md`, o `manifest` e o runtime ES5 esqueleto, e relate o resultado do teste em Android 4.4 e iOS 9.3.5 antes de avançar. Se algo no plano conflitar com a realidade dos dados ou dos aparelhos, **pare e relate**, não improvise.
