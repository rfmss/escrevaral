# Escrevaral

Oficina de escrita feita no Brasil, para gente brasileira.

[Usar o Escrevaral](https://escrevaral.com)

Versão: `1.0.0-rc.1` — Argila, em estabilização final para o primeiro lançamento público estável.

Documentação: [arquitetura](ARCHITECTURE.md) · [lançamentos](docs/release/README.md) · [checklist](docs/release/LAUNCH_CHECKLIST.md) · [mudanças](CHANGELOG.md)

## Visão geral

O Escrevaral é uma aplicação de escrita que roda no navegador. Não exige conta, servidor próprio do produto ou envio de manuscritos para serviços externos.

A aplicação foi construída com HTML, CSS e JavaScript sem framework. O projeto prioriza:

- escrita e leitura em português brasileiro;
- preservação local dos manuscritos;
- funcionamento sem internet após a primeira visita;
- ausência de telemetria identificável;
- interfaces compreensíveis sem vocabulário técnico;
- compatibilidade com teclado, mouse e toque.

## Recursos principais

- Editor com modos de escrita, guias de ofício e folha paginada
- Espelho de Voz para ritmo, vocabulário e estilo
- RimaLab para métrica, rima e sonoridade
- Vocabulário Decolonizador para revisão crítica de termos
- Prova de Autoria com assinatura e marca temporal locais
- Cópia de segurança exportável
- Aplicação instalável e preparada para uso sem internet

## Arquitetura

```text
HTML único de entrada
├── CSS modular
├── controladores de interface
├── engines locais de linguagem
├── dados linguísticos versionados
├── armazenamento no navegador
└── service worker para funcionamento sem internet
```

Não há framework de interface, serviço de processamento remoto ou dependência externa necessária para editar e preservar um manuscrito.

## Executar localmente

Requer Python 3 para servir os arquivos por HTTP:

```bash
python3 -m http.server 8799
```

Depois, abra `http://localhost:8799`.

Service workers exigem `localhost` ou HTTPS. A aplicação não deve ser testada por `file://`.

## Verificação

O repositório mantém auditores automatizados para publicação, privacidade de rede, erros de console, responsividade, integridade de dados, fronteira pública, coerência de release e regressões das engines.

A candidata a lançamento é validada por GitHub Actions antes da incorporação em `main`. Os critérios de promoção estão em [docs/release/LAUNCH_CHECKLIST.md](docs/release/LAUNCH_CHECKLIST.md).

## Privacidade

Os manuscritos permanecem no navegador da pessoa usuária. O produto principal não envia o texto para inteligência artificial, servidor de análise ou nuvem de terceiros.

Consulte [privacidade.html](https://escrevaral.com/privacidade.html) para os limites e cuidados do armazenamento local.

## Relatar problemas e sugerir melhorias

Relatos reproduzíveis de erro e sugestões de produto são bem-vindos pelo rastreador de issues.

Este é um repositório de código-fonte público com licença proprietária. O envio de código, modificações ou obras derivadas depende de autorização prévia do titular. Consulte [CONTRIBUTING.md](CONTRIBUTING.md) e [LICENSE](LICENSE) antes de abrir uma contribuição técnica.

Questões de uso: [oi@escrevaral.com](mailto:oi@escrevaral.com)

Questões de segurança: consulte [SECURITY.md](SECURITY.md).

## Autoria

Criado e mantido por [Rafa Mass](https://rafa.pro.br).
