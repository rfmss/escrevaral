# Mass Notes integrado — escopo do MVP

## Objetivo

Validar que a experiência Mass Notes pode ser a nova interface do Escrevaral sem perder o diferencial das engines locais, a preservação de manuscritos e a disciplina offline-first.

O MVP não tenta expor todas as capacidades do repositório. Ele prova a arquitetura de integração e a qualidade do fluxo principal de escrita.

## Hipóteses

1. A nova interface comporta as engines sem virar um painel de análise.
2. O usuário consegue ignorar todas as ferramentas e apenas escrever.
3. Engines existentes funcionam por adaptadores, sem conhecer o novo DOM.
4. O acervo atual pode ser migrado sem alterar a fonte antiga.
5. O produto continua útil sem rede depois da instalação.
6. O editor continua utilizável em desktop, tablet, celular e pouca altura.

## Superfícies do produto

### Biblioteca

- novo documento;
- busca por título, texto, tag e pasta;
- recentes;
- favoritos;
- pastas de um nível;
- tags;
- lixeira;
- duplicação e restauração;
- indicação clara do documento ativo.

### Documento

- título independente;
- editor rich text;
- parágrafo, H1, H2, H3 e citação;
- negrito, itálico, sublinhado e tachado;
- listas, checklist e links;
- desfazer e refazer;
- limpar formatação;
- modo página e contínuo;
- salvamento automático;
- contagem de palavras e caracteres;
- modo foco com saída visível.

### Assistente do texto

Abas:

1. Estrutura;
2. Revisão;
3. Voz;
4. Palavras;
5. Rimas;
6. Autoria;
7. Propriedades.

As abas não executam análise pesada automaticamente ao abrir. O documento continua sendo a área prioritária.

## Engines do MVP

### Análise geral

Entrada: `plainText` do documento ativo.

Saída inicial:

- legibilidade;
- comprimento de frase;
- repetição próxima;
- clichês;
- redundâncias;
- voz passiva;
- palavras vagas;
- pontuação funcional.

Execução:

- métricas leves após pausa;
- varredura completa por ação explícita;
- resultado associado à revisão do documento.

### Espelho de Voz

Saída:

- gesto predominante;
- campos semânticos;
- ritmo;
- repetições;
- perfil de leitura;
- dois exercícios sugeridos.

A linguagem deve ser descritiva, não prescritiva.

### Palavras

Ativação por seleção de palavra ou busca explícita.

Saída:

- definição;
- classe provável;
- leituras alternativas;
- sinônimos;
- rimas;
- campo semântico quando disponível.

Nenhuma substituição automática.

### Rimas

Para prosa:

- padrões sonoros internos;
- orientação honesta quando não houver versos.

Para verso:

- escansão;
- métrica;
- esquema de rimas;
- pares de rima;
- busca de rimas exatas e toantes.

### Termos que pedem contexto

Integração do vocabulário decolonizador.

Cada resultado mostra:

- termo;
- ocorrências;
- categoria;
- por que observar;
- contexto;
- alternativas possíveis.

A interface não declara proibição universal e não altera o texto automaticamente.

### Autoria local

- captura somente eventos ocorridos no editor;
- não captura teclas literais;
- mantém sessões por documento;
- mostra situação resumida;
- permite exportar pacote de autoria;
- deixa claro que não constitui garantia jurídica.

### Paginação

- usa a engine existente;
- mantém modo contínuo;
- não persiste quebras automáticas;
- persiste quebras manuais;
- desativa página física no mobile.

### Exportação

MVP visível:

- TXT;
- Markdown;
- HTML;
- DOCX;
- EPUB;
- Obsidian;
- cópia de segurança JSON.

Cada formato informa honestamente quais elementos preserva.

## Recursos fora do primeiro MVP

- Ateliê completo;
- Planejamento;
- Academia e treinamento;
- temporizador;
- sons;
- máquina de escrever;
- badges;
- combos;
- Mesa Portátil;
- direitos autorais completos;
- publicação e mercado editorial;
- múltiplos tipos especializados de documento;
- colaboração;
- nuvem;
- inteligência artificial remota.

Esses recursos não são removidos. Apenas não participam do primeiro teste de shell.

## Fluxo de abertura

### Biblioteca nova

1. inicializar IndexedDB;
2. procurar migração concluída;
3. quando não concluída, procurar `vereda.manuscripts.v1`;
4. validar dados antigos;
5. oferecer importação local ou executá-la conforme decisão final de UX;
6. manter dados antigos intactos;
7. abrir o documento mais recente ou criar um vazio.

### Falha de armazenamento

1. manter sessão em memória;
2. nunca mostrar “Salvo”;
3. exibir aviso persistente;
4. oferecer nova tentativa;
5. permitir exportar documento e dados temporários.

## Contrato dos adaptadores

```js
{
  ok: true,
  documentId: "...",
  revision: 12,
  generatedAt: "...",
  data: {},
  warnings: []
}
```

Em falha:

```js
{
  ok: false,
  documentId: "...",
  revision: 12,
  generatedAt: "...",
  error: {
    code: "ENGINE_UNAVAILABLE",
    message: "A análise não está disponível agora."
  }
}
```

O erro técnico completo pode ir ao console em desenvolvimento, mas a interface usa linguagem compreensível.

## Desempenho

- nenhuma engine pesada em cada tecla;
- debounce mínimo para métricas leves;
- análise completa por ação;
- cache por `documentId + revision + engineVersion`;
- resultados obsoletos descartados;
- atualização de interface em lote;
- painel fechado não executa trabalho desnecessário.

## Responsividade

### Desktop largo

Biblioteca + documento + assistente.

### Notebook e tablet horizontal

Biblioteca + documento; assistente sobreposto quando solicitado.

### Até 820 px

Documento em largura total; biblioteca e assistente como drawers modais.

### 320 px

- toolbar rolável;
- alvos de toque adequados;
- apenas um drawer aberto;
- nenhuma página física;
- nenhuma análise cobrindo o editor;
- nenhuma rolagem horizontal da aplicação.

## Critérios de aprovação visual

- o produto parece editor de documentos, não dashboard;
- a biblioteca é familiar;
- a toolbar é reconhecível;
- o painel de engines é secundário;
- o modo claro e escuro estão completos;
- a pessoa sabe onde escrever sem onboarding obrigatório;
- a interface visível está em pt-BR.

## Critérios de aprovação técnica

- sem erros de sintaxe;
- sem erros no console nos fluxos normais;
- nenhuma chamada externa necessária para editar;
- IndexedDB funcional;
- migração preserva fonte antiga;
- pelo menos uma execução real de cada engine integrada;
- exportação funcional;
- pacote de autoria funcional;
- service worker instala e reabre sem rede;
- auditores de overflow, console, privacidade e versão passam;
- release candidate executado antes de qualquer proposta de incorporação.

## Evidência esperada ao final

- branch navegável;
- screenshots desktop e mobile;
- relatório curto de limitações;
- matriz de engines integradas;
- resultado dos auditores;
- comparação da branch com `main`;
- PR em rascunho somente após aprovação do mantenedor.
