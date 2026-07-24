# Escrevaral

[![Integridade dos dados](https://github.com/rfmss/escrevaral/actions/workflows/integridade-dados.yml/badge.svg)](https://github.com/rfmss/escrevaral/actions/workflows/integridade-dados.yml)
[![Auditoria visual e WCAG](https://github.com/rfmss/escrevaral/actions/workflows/auditoria-visual-wcag.yml/badge.svg)](https://github.com/rfmss/escrevaral/actions/workflows/auditoria-visual-wcag.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-6f351b.svg)](LICENSE)
[![Site](https://img.shields.io/badge/site-escrevaral.com-6f351b)](https://escrevaral.com)

**Uma oficina literária brasileira, gratuita e offline-first.**

O Escrevaral reúne editor, acervo e ferramentas de apoio à escrita em uma aplicação que roda no navegador. Os manuscritos permanecem no dispositivo da pessoa — sem conta e sem armazenamento em nuvem.

**[Abrir o Escrevaral](https://escrevaral.com)**

> O projeto é criado de forma independente por [RafaMass](https://rafa.pro.br). Está em evolução ativa, com atenção especial à preservação dos textos, à legibilidade e ao uso em dispositivos modestos.

## Status do projeto

**Em desenvolvimento ativo.** O fluxo principal de escrita, organização, exportação, backup e uso offline está implementado. Ainda existem áreas em estabilização, principalmente testes de navegador, acessibilidade, recuperação de dados e comportamento entre versões do service worker.

A primeira versão pública planejada é **`v0.1.0 — Base pública do Escrevaral`**. Ela será publicada somente depois que os critérios técnicos descritos na [política de versionamento](docs/VERSIONING.md) forem verificados.

O Escrevaral pode ser usado hoje, mas manuscritos importantes não devem depender de uma única cópia no navegador. Exporte cópias `.esc` regularmente e mantenha ao menos uma delas fora do dispositivo em uso.

### O que já é verificado

- integridade do estado local e conflitos entre abas;
- compatibilidade entre versão publicada e arquivos offline;
- corpus de regressão para parte das análises linguísticas;
- auditores de overflow mobile, console, privacidade de rede e navegação;
- matriz visual/WCAG automatizada em Chromium e Firefox no GitHub Actions.

Os workflows automatizados ajudam a encontrar regressões, mas não substituem revisão humana, testes com leitores de tela ou uma garantia formal de conformidade WCAG.

## Funcionalidades

### Escrita e organização

- editor de manuscritos com título, formatação e modos de visualização;
- acervo local para criar, renomear, organizar e retomar textos;
- guias e modelos para gêneros, formatos e exercícios de escrita;
- planejamento de metas e sessões;
- versões locais e tratamento de edições concorrentes entre abas.

### Ferramentas de autoria

- **Espelho de Voz** para observar ritmo, vocabulário e características do texto;
- **RimaLab** para apoiar a leitura de métrica e rimas;
- consulta lexical, sinônimos e análise sintática;
- **Vocabulário Decolonizador** para revisão crítica de termos;
- prova de autoria baseada em dados locais e exportação verificável.

As análises são recursos de apoio. Elas não substituem leitura crítica, revisão profissional ou decisão autoral.

### Conservação e transporte

- salvamento automático no armazenamento local do navegador;
- exportação de manuscritos em formatos editoriais disponíveis na interface;
- cópia completa do acervo em arquivo `.esc`;
- restauração com validação e snapshot do estado anterior;
- cópia automática em arquivo quando o navegador oferece File System Access;
- transporte entre dispositivos por arquivo e pela Mesa Portátil;
- instalação como PWA e funcionamento offline após a preparação dos recursos.

## Privacidade e dados

O conteúdo dos manuscritos é processado no navegador. Não existe conta nem servidor de armazenamento de textos. O projeto usa serviços externos pontuais — por exemplo, fontes, analytics de acesso, mídias opcionais e carimbo de hash — descritos na [Política de Privacidade](https://escrevaral.com/privacidade.html).

Armazenamento local não é sinônimo de backup: limpar os dados do site, remover o perfil do navegador ou perder o dispositivo pode eliminar a cópia local.

## Tecnologias usadas

| Área | Tecnologia |
|---|---|
| Interface | HTML5, CSS3 e JavaScript vanilla |
| Aplicação offline | Web App Manifest, Service Worker e Cache API |
| Persistência | `localStorage`, IndexedDB para permissões de arquivo e File System Access quando disponível |
| Exportação | APIs nativas do navegador e geração local de arquivos |
| Testes de lógica | Node.js e `assert` nativo |
| Testes de navegador | Python e Playwright |
| Automação | GitHub Actions |

Não há framework de interface, etapa de build ou backend obrigatório.

## Como rodar localmente

### Requisitos

- Python 3 **ou** qualquer servidor HTTP estático;
- navegador moderno com JavaScript habilitado.

### Execução

```bash
git clone https://github.com/rfmss/escrevaral.git
cd escrevaral
python3 -m http.server 8799
```

Abra [http://localhost:8799](http://localhost:8799).

Não abra o `index.html` diretamente por `file://`: service workers e algumas APIs de navegador exigem `localhost` ou HTTPS.

### Verificações sem navegador

```bash
node scripts/testar-integridade-dados.js
bash scripts/check-version-bump.sh
```

### Auditoria visual e WCAG

```bash
python3 -m pip install playwright
python3 -m playwright install chromium firefox
python3 scripts/auditor-visual-wcag.py --browser all
```

O auditor gera relatório e screenshots em `reports/auditoria/visual-wcag/`. Resultados automáticos precisam de validação humana antes de serem tratados como conformidade ou defeito confirmado.

## Estrutura do projeto

```text
escrevaral/
├── index.html                 # estrutura principal da aplicação
├── app.js                     # coordenação da interface e dos fluxos centrais
├── state-store.js             # estado persistente e proteção de gravação
├── *-engine.js                # regras de domínio e processamento
├── *-controller.js            # integração entre interface, estado e engines
├── css/                       # tokens, layout, componentes e responsividade
├── icons/, fonts/, sounds/    # recursos visuais e sonoros locais
├── pegar/                     # Mesa Portátil e transporte entre dispositivos
├── scripts/                   # testes, auditores e ferramentas de manutenção
├── reports/                   # relatórios gerados pelas auditorias
├── docs/                      # decisões, campanhas e documentação interna
├── personas/                  # referências de produto e revisão
├── service-worker.js          # instalação, cache e funcionamento offline
└── manifest.webmanifest       # metadados da PWA
```

Uma descrição mais detalhada está em [`docs/repo-structure-20260625.md`](docs/repo-structure-20260625.md).

## Roadmap

O roadmap é público, organizado por fases e sem datas rígidas:

### Fase 1 — Estabilidade e preservação de textos

- [ ] consolidar testes E2E de escrita, salvamento, backup e restauração;
- [ ] ampliar testes de cache antigo, atualização do service worker e uso offline;
- [ ] verificar migrações e compatibilidade dos dados locais.

### Fase 2 — Experiência visual e navegação

- [ ] revisar layout e navegação nas larguras prioritárias;
- [ ] resolver quebras antes de adicionar novos componentes.

### Fase 3 — Acessibilidade e testes

- [ ] validar a matriz visual/WCAG com revisão humana e tecnologias assistivas;
- [ ] tornar dependências de teste reproduzíveis em ambiente local.

### Fase 4 — Ferramentas literárias

- [ ] expandir o corpus revisado das ferramentas linguísticas;
- [ ] documentar limites e falsos positivos das análises.

### Fase 5 — Modularização e manutenção

- [ ] reduzir responsabilidades concentradas em arquivos centrais sem reescrever a aplicação;
- [ ] manter versionamento, changelog e publicação alinhados.

Itens do roadmap são intenção de trabalho, não promessa de prazo.

## Aprendizados

O Escrevaral também é um projeto de estudo aplicado. Entre os aprendizados já incorporados estão:

- modelar uma ferramenta offline-first exige tratar perda, corrupção e migração de dados como fluxos de produto;
- “salvo localmente” precisa ser explicado com honestidade — armazenamento do navegador não é nuvem nem backup;
- JavaScript vanilla reduz a infraestrutura, mas aumenta a importância de limites claros entre estado, controllers e engines;
- ferramentas linguísticas precisam de corpus, casos ambíguos e revisão humana, não apenas listas maiores;
- acessibilidade envolve comportamento real de foco, teclado, reflow e leitores de tela, não somente atributos ARIA;
- automação só é confiável quando diferencia falha do produto, falha do ambiente e indício que requer validação.

## Limitações conhecidas

- os manuscritos ficam vinculados ao navegador e ao dispositivo até serem exportados;
- modo privado, limpeza de dados e limites de armazenamento podem afetar a persistência;
- File System Access não está disponível com o mesmo suporte em todos os navegadores;
- recursos externos opcionais não funcionam sem conexão;
- algumas análises linguísticas podem produzir falsos positivos ou não reconhecer usos literários deliberados;
- a suíte visual depende de Playwright e de navegadores instalados;
- auditoria automática não comprova conformidade WCAG 2.2 AA;
- a licença MIT cobre o código, mas não transfere direitos sobre marca e materiais criativos.

## Próximos passos

1. fechar os cenários críticos de conservação de manuscritos com testes de navegador;
2. revisar os resultados da auditoria visual em Chromium e Firefox;
3. registrar bugs reproduzíveis como issues pequenas e verificáveis;
4. manter changelog e documentação sincronizados com o comportamento publicado;
5. cumprir os critérios da primeira release sem apresentar documentação pronta como estabilidade do produto.

## Contribuindo

Relatos de uso, correções pequenas e testes são bem-vindos. Antes de abrir um pull request, leia o [`CONTRIBUTING.md`](CONTRIBUTING.md).

Ao relatar um problema, informe navegador, versão, sistema operacional, passos para reproduzir e se havia uma cópia de segurança. **Nunca publique um manuscrito real, arquivo `.esc` ou prova de autoria em uma issue.**

O código aceita contribuições sob a licença MIT. Mudanças grandes de produto devem ser discutidas previamente em uma issue para preservar o propósito e a coerência do Escrevaral.

## Changelog, segurança e licença

- Mudanças relevantes: [`CHANGELOG.md`](CHANGELOG.md)
- Versionamento e releases: [`docs/VERSIONING.md`](docs/VERSIONING.md)
- Segurança e relato privado: [`SECURITY.md`](SECURITY.md)
- Código-fonte e documentação técnica: [Licença MIT](LICENSE)
- Marca, identidade e materiais criativos: [`NOTICE.md`](NOTICE.md)

## Autoria

Criado por **[RafaMass](https://rafa.pro.br)**, criador independente brasileiro desenvolvendo aplicativos, jogos e ferramentas digitais com estudo, método e atenção ao acabamento.

Contato: **oi@escrevaral.com**
