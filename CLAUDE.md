# Escrevaral — instruções de manutenção

Este arquivo contém apenas regras estáveis para agentes de código. Campanhas, estado de sessão, personas, infraestrutura administrativa e relatórios datados não são instruções permanentes do repositório.

## Fonte de verdade

- Repositório: `rfmss/escrevaral`.
- Linha de referência: `origin/main`.
- Uma cópia local divergente não deve ser incorporada sem comparação explícita com o remoto.
- Produto atual: Escrevaral.
- `Vereda` é nome legado e pode permanecer em identificadores cuja renomeação ainda exige compatibilidade.

Antes de alterar arquitetura, ler `ARCHITECTURE.md` e a decisão correspondente em `docs/_decisoes/`.

## Contrato do produto

O Escrevaral é uma oficina de escrita em HTML, CSS e JavaScript vanilla.

Regras inegociáveis:

- manuscritos permanecem no dispositivo por padrão;
- editar, abrir, preservar e exportar textos não dependem de conta ou servidor de aplicação;
- o produto continua útil sem internet depois da instalação;
- texto de manuscrito não é enviado implicitamente a serviços externos;
- a interface visível usa português brasileiro;
- nenhuma mudança pode apagar, invalidar ou tornar inacessível o estado local existente.

## Limites de escopo

- Não refatorar além do problema demonstrado.
- Não adicionar framework, bundler ou dependência para resolver preferência estética.
- Não criar abstração para uso hipotético.
- Não misturar movimentação de arquivos com alteração comportamental.
- Não alterar dados linguísticos calibrados sem evidência e auditoria específica.
- Não publicar, fazer merge ou alterar `main` sem pedido explícito do mantenedor.
- Não registrar credenciais, caminhos locais de segredo, URLs administrativas ou identificadores privados em issues ou documentação pública.

## Organização atual

A arquitetura vigente está documentada em `ARCHITECTURE.md`.

Convenções principais:

- `*-engine.js`: lógica de domínio, análise, transformação ou exportação;
- `*-controller.js`: coordenação do DOM e interação;
- `*-data.js` e `*-data.json`: índices e bases de dados;
- `*-mode.js`: modos de comportamento do editor;
- `service-worker.js`: infraestrutura offline e escopo raiz;
- `scripts/`: auditores, manutenção e preparação de release;
- `reports/`: histórico existente; novos relatórios gerados devem preferir artefatos do GitHub Actions.

A migração para `js/core`, `js/controllers`, `js/data`, `js/engines` e `js/modes` é incremental. Atualizar todos os consumidores de caminho antes de concluir qualquer movimento.

## Versionamento de distribuição

Toda alteração distribuída em JavaScript ou CSS exige:

1. nova versão global `?v=YYYYMMDD-slug` no `index.html`;
2. o mesmo valor em `ASSET_VERSION` no `service-worker.js`;
3. incremento de `CACHE_NAME`;
4. atualização de `CORE_ASSETS` para arquivos adicionados ou movidos;
5. atualização de carregadores dinâmicos com versão fixada;
6. execução do auditor de coerência de versões.

Um arquivo movido conta como alteração distribuída mesmo quando seu conteúdo não muda.

`service-worker.js` permanece na raiz para preservar seu escopo padrão.

## Preservação de dados

- Não renomear chaves de armazenamento sem migração compatível.
- Não limpar localStorage como solução de desenvolvimento.
- Importações inválidas não podem destruir o acervo existente.
- Em conflito entre abas, preservar versões quando não houver reconciliação segura.
- Manter exportação e cópia externa como saída do armazenamento do navegador.

## Interface

Todo texto visível deve ser compreensível em português brasileiro sem exigir vocabulário de desenvolvimento.

Preferir:

- cópia de segurança;
- salvamento automático;
- sem internet;
- guia de escrita;
- situação;
- janela;
- dica;
- baixar ou trazer arquivo;
- assinatura do texto.

Evitar estrangeirismos técnicos na interface quando houver expressão brasileira clara.

Regras de interação:

- não produzir rolagem horizontal da página em superfícies de escrita;
- medir `scrollWidth > clientWidth` em 320, 390 e 430 pixels;
- preservar foco visível para teclado;
- não abrir teclado virtual em dispositivo touch sem intenção clara de escrita;
- manter a folha como elemento principal quando painéis auxiliares estiverem abertos;
- usar metáforas de oficina apenas quando orientarem uma função real.

## Verificação mínima

Escolher os testes pelo risco da mudança.

Mudança documental:

- conferir links, caminhos, contradições e estado atual do repositório.

Mudança em JavaScript ou CSS:

- validar sintaxe;
- iniciar servidor local em `localhost:8799`;
- executar auditores relacionados;
- executar coerência de versões;
- executar a candidata a lançamento antes de considerar incorporação.

Mudança estrutural:

- inventariar consumidores antes do movimento;
- atualizar HTML, service worker, carregamentos dinâmicos, scripts, workflows e documentação ativa;
- provar resposta HTTP dos novos caminhos;
- verificar console, armazenamento, funcionamento sem internet e telas afetadas;
- manter o pull request em rascunho até o gate consolidado ficar verde.

## Documentação

- `README.md`: recepção pública do produto.
- `ARCHITECTURE.md`: sistema técnico atual.
- `docs/README.md`: mapa da documentação.
- `docs/_decisoes/`: decisões duráveis e critérios de reabertura.
- `CHANGELOG.md`: histórico orientado a versões quando incorporado.
- `SECURITY.md`, `SUPPORT.md` e `CONTRIBUTING.md`: governança pública quando incorporados.

Arquivos datados são evidência histórica, não instrução atual. Não criar uma nova fotografia da estrutura quando a mudança pode ser registrada em `ARCHITECTURE.md` e no Git.

## Conduta de implementação

- Trabalhar em branch isolada.
- Produzir commits descritivos.
- Manter cada pull request com um único propósito verificável.
- Registrar riscos e evidências no corpo do pull request.
- Interromper diante de barreira real; não converter falha de teste em falso verde.
- Remover gatilhos, marcadores e workflows temporários antes de concluir a branch.
