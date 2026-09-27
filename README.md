# Escrevaral

Editor local para escrever e examinar textos em português brasileiro. As lentes explicam ocorrências e seus limites; nunca modificam o manuscrito. Cadernos, autoria e exportações permanecem no dispositivo.

**Site:** https://escrevaral.com · **Plano e pendências:** [Jornada](docs/JORNADA-LINGUISTICA.md)

**Vai continuar o projeto? Leia primeiro o [Plano mestre e guia de retomada](docs/PLANO-MESTRE.md).** Ele reúne decisões, estado dos motores, sequência de trabalho e como conferir a evolução real na main.

**Filosofia e progresso:** [engenharia para aparelhos antigos](docs/FILOSOFIA-E-COMPATIBILIDADE.md) · [árvore TODO/DONE](docs/PLANO-MESTRE.md#árvore-de-execução--plano-v2). A época KitKat/iPad 2012 é referência de engenharia, sem exigência de teste nesses aparelhos.

## Desenvolver

Node.js 22 ou superior. As dependências npm são ferramentas de desenvolvimento; o aplicativo não carrega bibliotecas de CDN.

```sh
npm ci --ignore-scripts
npm run build
npm start
```

Abra `http://127.0.0.1:8080`. Edite as fontes e execute novamente a montagem para atualizar a distribuição. Não há observador automático de arquivos.

```sh
npm run build:check  # fontes e distribuição conferem, sem regravar
npm test            # integridade, corpus de regressão, contratos e cache simulado
npm run cofre:example
```

Ferramentas opcionais de navegador, fora do fluxo obrigatório de entrega: `npx playwright install chromium` e `npm run test:browser`. O workflow **Controles e responsividade** também pode ser disparado manualmente. Regressão local não equivale a certificação linguística nem a teste em aparelho físico.

## Onde trabalhar

| Caminho | Responsabilidade |
| --- | --- |
| `src/index.template.html` | Estrutura HTML da interface, sem motores ou dados inline |
| `src/app/`, `src/editor/` | Inicialização, integração com o editor e contrato de revisão |
| `src/ui/`, `src/storage/` | Interface, estilos e persistência local |
| `packages/cofre/` | Núcleo linguístico reutilizável e exemplo independente |
| `resources/pt-BR/local/` | Inventários linguísticos locais extraídos da aplicação |
| `ptbr/` | Módulos PT-BR existentes, corpus, estudos e histórico; caminhos preservados |
| `packages/connectors/portparser/` | Avaliação isolada, adaptador CoNLL-U e snapshot atribuído do projeto externo |
| `build/`, `scripts/` | Manifestos, versão, montagem determinística e comandos |
| `tests/`, `docs/` | Verificações e documentação de manutenção |

## Distribuições

`npm run build` gera três saídas das mesmas fontes:

- **Site:** `dist/site/`, com CSS e JavaScript externos, nomes por hash e service worker.
- **Portátil:** `escrevaral.html`, arquivo único para abrir sem instalação. É uma distribuição gerada, não o código-fonte de desenvolvimento.
- **Cofre:** `packages/cofre/dist/cofre.cjs`, copiável para outro projeto, sem DOM ou armazenamento.

A publicação atual do GitHub Pages usa a raiz da `main`. Por isso `index.html`, `escrevaral.html`, `service-worker.js` e `assets/` gerados também são versionados. Não os edite manualmente. `dist/` e `node_modules/` não entram no Git.

## Manutenção

Leia [Arquitetura](docs/ARQUITETURA.md), [Conectores](docs/CONECTORES.md), [Cofre](packages/cofre/README.md) e [avaliação do Portparser](packages/connectors/portparser/README.md). Os avisos de terceiros estão em [THIRD_PARTY.md](THIRD_PARTY.md).

A reorganização v6-25 separa montagem, aplicação e cofre. O controlador legado do editor e partes da cascata CSS ainda precisam de decomposição gradual. O modelo Portparser não está instalado nem integrado ao site. As pendências técnicas e linguísticas continuam explícitas na Jornada.
