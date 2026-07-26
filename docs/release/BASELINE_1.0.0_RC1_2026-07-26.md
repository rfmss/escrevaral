# Baseline 1.0.0-rc.1 — Argila

Data: 26 de julho de 2026  
Ponto de partida da baseline: `dba5ce5d8e4b844efe921a46a048617dd0d3c02a`

## Objetivo

Congelar uma base verificável para o primeiro lançamento público estável do Escrevaral. A partir desta baseline, só entram correções bloqueadoras, ajustes de documentação de lançamento e mudanças estritamente necessárias à promoção para `1.0.0`.

## Estado da base

- PRs abertos: 0;
- issues abertas: 0;
- P0 reproduzido: 0;
- P1 reproduzido: 0;
- candidata de lançamento: verde;
- auditoria de fronteira pública: verde;
- integridade de manuscritos e persistência: protegida por testes;
- publicação, privacidade, teclado, foco, console e overflow: cobertos por auditores;
- relatórios gerados: removidos da árvore e preservados como artefatos temporários;
- documentação de arquitetura, segurança, suporte e contribuição: presente.

## Contratos congelados

A promoção não pode alterar sem uma decisão explícita:

- formato `.esc`;
- esquema de armazenamento local;
- comportamento de recuperação e conflito entre abas;
- rotas públicas;
- domínio `escrevaral.com`;
- escopo do service worker na raiz;
- funcionamento sem conta;
- ausência de envio do manuscrito para serviços externos;
- identidade pública Escrevaral e idioma pt-BR.

## Limitações conhecidas não bloqueadoras

- Google Fonts pode ser solicitado na primeira carga, com fallback do sistema;
- páginas editoriais satélite não integram todo o cache inicial;
- Cloudflare pode reescrever endereços de e-mail;
- a hospedagem não oferece todos os cabeçalhos de hardening desejáveis;
- GoatCounter e métricas da Cloudflare realizam requisições sem conteúdo do manuscrito;
- quatro ambiguidades morfológicas permanecem documentadas como P2.

## Critério de interrupção

A candidata volta para desenvolvimento somente quando houver:

- perda ou corrupção reproduzível de manuscrito;
- quebra de abertura, edição, salvamento, exportação ou restauração;
- regressão de teclado, foco ou toque que bloqueie uso;
- falha de instalação ou atualização da PWA;
- recurso obrigatório quebrado no cache offline;
- vazamento de conteúdo do manuscrito para a rede;
- falha de segurança com impacto real;
- P0 ou P1 produzido pelos auditores.

Problemas cosméticos, renomeações internas e reorganizações sem impacto direto ficam para depois de `1.0.0`.
