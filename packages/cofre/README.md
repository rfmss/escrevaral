# Cofre linguístico

API de transporte **1.0.0**, variedade alvo `pt-BR`. A versão dos dados aparece em `knowledgeVersion`. Nenhum pacote npm externo é necessário em execução.

Na raiz do repositório, rode `npm run build`. Copie `packages/cofre/dist/cofre.cjs` para qualquer projeto Node.js:

```js
const Cofre = require('./cofre.cjs');
const vault = Cofre.create({ incremental: false });
const text = 'A menina leu a carta.';
const result = vault.analyze('sintaxe', text);
for (const f of result.findings) {
  console.log(text.slice(f.start, f.end), f.message);
}
```

No navegador, carregue o bundle como script externo (pode ser renomeado para `.js`, servido com MIME JavaScript). A API aparece em `EscrCofre`; não cria `window.Escr`. `createRuntime()` expõe a instância interna para a ponte de compatibilidade do Escrevaral, sem garantia de estabilidade desses campos internos.

## Contrato público

- `create(options)` cria um cofre independente, com todas as lentes locais registradas. `incremental: false` desliga o reuso interno; a ausência dessa opção preserva o padrão atual.
- `vault.analyze(lensId, text)` executa uma lente de forma síncrona. Não modifica o texto, não faz requisições nem grava dados.
- `vault.register({id, analyze})` instala uma lente local síncrona. O identificador deve ser único; `analyze(text, limit)` retorna um array de achados válidos. Um registro externo não passa a ter política de recorte automaticamente.
- `vault.maxLength` informa o limite geral de 200.000 unidades UTF-16. Cada lente pode examinar um recorte menor; consultar `assessment`, `coverage` e `coverageInfo`.

IDs atualmente disponíveis devem ser consultados nas políticas de `resources/pt-BR/local/estudio.js` e no catálogo registrado pelos módulos de `ptbr/`; exemplos estáveis usados pelo projeto: `ortografia`, `expressoes`, `repeticao`, `morfologia`, `sintaxe`, `relativas`. ID inexistente, texto inválido ou diagnóstico fora do contrato gera exceção.

Os resultados incluem `lens`, `knowledgeVersion`, `findings`, `status`, `limited`, `assessment` e `coverage`; alguns campos de cobertura/processamento dependem da lente. `findings` tem no máximo 100 ocorrências. Não interpretar array vazio como aprovação do texto.

Cada achado informa `id`, `lens`, `feature`, `severity`, `confidence`, `message`, `start`, `end`, `snippet` e `evidence`. O registro verifica inteiros, limites, trecho literal e explicação com fonte. `start` é inclusivo, `end` exclusivo, ambos em **UTF-16**, sem normalização do original. Referências, relações e componentes opcionais pertencem ao contrato específico da lente.

O cofre não gerencia cancelamento de tarefas síncronas nem identidade/revisão de documentos. O hospedeiro deve descartar resultados antigos. Para trabalho pesado, planejar Worker/processo e cancelamento no conector; não prometer interrupção de uma chamada síncrona. Veja [manual dos conectores](../../docs/CONECTORES.md).

## Evolução proposta

Consulta a pacotes particionados e preparação nas pausas são trabalho futuro, descrito em [contrato de pacotes v0](../../docs/CONTRATO-PACOTES-LINGUISTICOS.md). Não alteram a API síncrona 1.0.0 acima. A primeira prova usa leitor de blocos injetado em área experimental, sem integrar dados ou dependências à produção.

## Consulta lexical incorporada — v6-33

A ponte interna `createRuntime().lookupLexeme('banco')` consulta o recorte OWN-PT de 179 lemas sem rede. Retorna `found` com sentidos/fonte/versão, `uncovered` para forma fora do recorte e `invalid` para entrada inadequada. Até 64 unidades UTF-16 de entrada e 24 sentidos apresentados; ausência não indica erro. Não oferece flexões nem escolhe classe/sentido no contexto. É uma função distinta de `vault.analyze()` e mantém a condição de API interna do runtime. Dados incorporados: 135.240 bytes; só o registro solicitado passa por JSON.parse. [Fonte, licença, limites e entrega](../../docs/jornada/ENTREGA-V6-33.md).

## Flexões e lemas — v6-34

A consulta interna `lookupLexeme` combina sentidos OWN-PT e leituras PortiLexicon-UD. `morphology` contém lemas, classes UD e traços; `missingSenseLemmas` explicita lemas sem sentidos no recorte. `senses` identifica o lema associado. `lookupMorphology(chaveCanônica)` retorna apenas leituras exatas e `describeMorphology` as apresenta em português. São APIs internas; não mudam `vault.analyze`. Limites: 32 leituras (máximo real 11), oito lemas consultados, 24 sentidos apresentados. Versões das duas fontes acompanham a resposta. [Fonte, licença, evidência e limites](../../docs/jornada/ENTREGA-V6-34.md). A restrição “sem flexões” da seção v6-33 é histórica.
