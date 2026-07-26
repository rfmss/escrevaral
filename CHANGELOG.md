# Registro de mudanças

Este arquivo registra mudanças públicas relevantes do Escrevaral a partir da versão 1.0.

O histórico técnico anterior permanece disponível nos commits e pull requests do repositório. Ele não será reproduzido retroativamente aqui.

## Não lançado

Nenhuma mudança pública registrada após a versão 1.0.0.

## [1.0.0] - 2026-07-26

Primeiro lançamento público estável, codinome Argila.

### Adicionado

- aplicação de escrita local-first para português brasileiro;
- editor com guias, folha paginada e modos de escrita;
- Espelho de Voz, RimaLab e ferramentas linguísticas locais;
- Prova de Autoria e cópia de segurança exportável;
- instalação como PWA e continuidade offline após a primeira visita;
- baseline pública de versão em `VERSION`;
- fonte única de lançamento em `docs/release/`;
- políticas públicas de segurança, suporte, contribuição e propriedade;
- auditores permanentes de release, fronteira pública e atualização da PWA.

### Alterado

- documentação técnica consolidada em `ARCHITECTURE.md`;
- controladores de baixo acoplamento organizados em `js/controllers/`;
- índices linguísticos organizados em `js/data/`;
- automações de auditoria passaram a consolidar incidentes em vez de criar ruído repetitivo;
- apresentação do repositório passou a distinguir versão pública de versão técnica do cache.

### Corrigido

- riscos críticos de perda silenciosa de manuscrito, conflito entre abas e restauração de estado foram estabilizados e protegidos por testes;
- caminhos de assets, cache offline e carregadores dinâmicos foram alinhados após movimentos estruturais;
- atualização da PWA passou a ter teste automático de remoção de caches antigos e recarga offline;
- rastreador público foi limpo de resultados verdes, duplicatas e lembretes internos.

### Removido

- 374 relatórios históricos e regeneráveis da árvore principal;
- mais de 150 mil linhas de saídas repetitivas preservadas de forma mais adequada como artefatos temporários de CI;
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
