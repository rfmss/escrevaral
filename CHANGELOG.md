# Registro de mudanças

Este arquivo registra mudanças públicas relevantes do Escrevaral a partir da preparação para a versão 1.0.

O histórico técnico anterior permanece disponível nos commits e pull requests do repositório. Ele não será reproduzido retroativamente aqui.

## Não lançado

- promoção da candidata para `1.0.0`, condicionada ao checklist de lançamento e ao último gate verde.

## [1.0.0-rc.1] - 2026-07-26

### Adicionado

- baseline pública de versão em `VERSION`;
- fonte única de lançamento em `docs/release/`;
- checklist binário para promoção à versão 1.0.0;
- políticas públicas de segurança, suporte, contribuição e propriedade;
- auditor permanente da fronteira entre produto, documentação e material operacional.

### Alterado

- documentação técnica consolidada em `ARCHITECTURE.md`;
- controladores de baixo acoplamento organizados em `js/controllers/`;
- índices linguísticos organizados em `js/data/`;
- automações de auditoria passaram a consolidar incidentes em vez de criar ruído repetitivo;
- apresentação do repositório passou a distinguir versão pública de versão técnica do cache.

### Corrigido

- riscos críticos de perda silenciosa de manuscrito, conflito entre abas e restauração de estado foram estabilizados e protegidos por testes;
- caminhos de assets, cache offline e carregadores dinâmicos foram alinhados após movimentos estruturais;
- rastreador público foi limpo de resultados verdes, duplicatas e lembretes internos.

### Removido

- 374 relatórios históricos e regeneráveis da árvore principal;
- mais de 150 mil linhas de saídas repetitivas que já são preservadas como artefatos temporários de CI;
- planos e pull requests obsoletos que não representavam mais a arquitetura atual.

### Limitações conhecidas

- Google Fonts pode ser solicitado na primeira carga, com fallback do sistema;
- páginas editoriais satélite não integram todo o cache inicial da PWA;
- Cloudflare pode reescrever endereços de e-mail;
- a hospedagem não oferece todos os cabeçalhos de hardening desejáveis;
- métricas de visita realizam requisições externas sem conteúdo do manuscrito;
- quatro ambiguidades morfológicas permanecem registradas como P2.

## Convenção

Cada versão publicada registra apenas mudanças relevantes para quem usa, mantém ou audita o produto, agrupadas quando aplicável em:

- adicionado;
- alterado;
- corrigido;
- segurança;
- removido;
- limitações conhecidas.
