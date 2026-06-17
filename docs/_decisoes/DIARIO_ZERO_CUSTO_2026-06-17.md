# Diário do Escrevaral — operação zero-custo

Data: 2026-06-17
Responsável: Codex

## Decisão

O `diario.escrevaral` deve nascer como uma operação de baixo custo e baixa dependência humana:

- geração automática diária ou por push;
- rascunho garantido mesmo sem IA;
- enriquecimento por IA apenas quando houver cota gratuita ou token disponível;
- publicação em repositório público separado;
- linguagem editorial ancorada em fatos.

## O que já existia

O projeto já tinha:

- `.github/workflows/gera-diario.yml`
- `.github/diario-agente-prompt.md`

Mas o fluxo ainda tinha fragilidades para o cenário zero-custo:

1. dependia de `DIARY_TOKEN` para sair do lugar;
2. não rodava por agendamento;
3. o fallback mecânico existia, mas o pipeline ainda não era robusto sem repositório remoto do diário.

## O que foi ajustado agora

### Workflow

Arquivo:

- `.github/workflows/gera-diario.yml`

Melhorias:

1. adiciona `schedule` diário;
2. adiciona `workflow_dispatch`;
3. funciona mesmo sem `DIARY_TOKEN`;
4. quando não houver acesso ao repositório do diário, entrega o post como `artifact`;
5. mantém IA opcional via `HF_TOKEN`, com fallback mecânico obrigatório.

## Arquitetura recomendada

### Repositórios

#### 1. Repositório de produto

`escrevaral`

Responsável por:

- código do app;
- workflow de geração;
- prompt-base;
- política editorial;
- sinais de versão.

#### 2. Repositório público de publicação

`escrevaral-diario`

Responsável por:

- site estático do diário;
- posts em Markdown;
- domínio `diario.escrevaral.com`;
- RSS, layout e arquivos de publicação.

## Estrutura mínima do repositório de publicação

```text
escrevaral-diario/
  _posts/
  _layouts/
  assets/
  index.md
  about.md
  feed.xml
  _config.yml
```

## Estrutura mínima do lado do produto

```text
escrevaral/
  .github/
    workflows/
      gera-diario.yml
    diario-agente-prompt.md
    diario-revisao-politica.md
  docs/
    _decisoes/
      DIARIO_ZERO_CUSTO_2026-06-17.md
```

## Modos de operação

### Modo A — zero custo real

Infra:

- GitHub Actions
- GitHub Pages ou Cloudflare Pages

Geração:

- mecânica a partir de commits

Resultado:

- sempre sai um post;
- menos bonito, mas confiável;
- nenhuma dependência de API paga.

### Modo B — zero custo oportunista

Infra:

- igual ao modo A

Geração:

- tenta IA primeiro;
- se falhar, cai no modo mecânico.

Resultado:

- melhora de fluidez quando houver cota;
- nunca bloqueia a operação.

### Modo C — pago depois

Infra:

- igual ao modo A

Geração:

- OpenAI API ou outro provedor pago

Resultado:

- mais qualidade média;
- maior previsibilidade;
- não é pré-requisito para lançar o diário.

## Política de publicação

### Publicar direto

Aceitável quando:

- a versão está clara;
- os commits são legíveis;
- o texto ficou factual;
- não houve tema delicado.

### Abrir como rascunho

Melhor quando:

- commit está técnico demais;
- a versão mistura muita coisa;
- o texto depende de interpretação;
- há menção a IA, autoria, contrato, proteção ou segurança.

## Política entre agentes

Arquivo de referência:

- `.github/diario-revisao-politica.md`

Uso recomendado:

- diarista: gera;
- revisor factual: contém exageros;
- revisor de tom: mantém voz do Escrevaral;
- humano: aprova quando necessário.

## Segredos e custo

### Sem segredos obrigatórios

O fluxo mínimo deve funcionar sem:

- `HF_TOKEN`
- `DIARY_TOKEN`

Nesse caso:

- gera post mecânico;
- salva como `artifact`.

### Com segredos opcionais

#### `DIARY_TOKEN`

Permite:

- commitar no repositório `escrevaral-diario`.

#### `HF_TOKEN`

Permite:

- tentar um rascunho mais fluido.

Observação:

Para uma operação realmente estável, o zero-custo deve ser entendido como:

- publicação mecânica confiável;
- IA como camada opcional.

Não como:

- "usar IA boa infinitamente sem pagar".

## Próximos passos recomendados

1. Confirmar se `rfmss/escrevaral-diario` será o repositório público final.
2. Configurar `DIARY_TOKEN` só quando quiser push automático.
3. Definir se o diário publica direto ou por PR.
4. Escolher hospedagem:
   - GitHub Pages, mais simples;
   - Cloudflare Pages, melhor se o domínio já vive lá.
5. Criar o tema mínimo do site do diário.

## Autocrítica

Esta rodada resolve a espinha dorsal da operação, não a experiência inteira do diário.

Ainda faltam:

1. o repositório de publicação no workspace;
2. o layout do site do diário;
3. a lógica de PR em vez de push direto;
4. um filtro melhor para distinguir versão real de commit ruidoso.

Mesmo assim, a base já fica sólida:

- custo zero possível;
- geração contínua possível;
- operação honesta;
- dependência humana reduzida sem virar automatismo cego.
