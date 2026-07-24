# Changelog

Mudanças relevantes do Escrevaral serão registradas neste arquivo. O formato segue, de maneira simplificada, o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto adota [Versionamento Semântico](https://semver.org/lang/pt-BR/). Ainda não existe uma release numerada.

## Não publicado

### Adicionado

- fluxo de recuperação para estado local ilegível, com download da cópia bruta antes de recomeçar;
- snapshot de segurança antes da restauração completa de um acervo;
- auditoria visual/WCAG automatizada com Chromium, Firefox, temas e múltiplas larguras;
- workflow dedicado para preservar relatórios e screenshots da auditoria visual;
- documentação de contribuição e visão geral ampliada do projeto.
- licença MIT para código e documentação técnica, com escopo separado para marca e materiais criativos;
- política de segurança e canal privado para relatos sensíveis;
- política de versionamento e critérios para a primeira release planejada.

### Alterado

- instalação offline tolera falhas isoladas em recursos opcionais;
- atualização da aplicação confirma a gravação antes de recarregar;
- diálogos restauram foco, contêm a navegação por teclado e fecham com `Escape`;
- campos de autoria passaram a usar rótulos visíveis e associados;
- comunicação sobre armazenamento local e preferências ficou mais precisa.

### Segurança e conservação

- persistência é bloqueada quando o estado principal não pode ser interpretado, evitando sobrescrita silenciosa;
- conflitos concorrentes preservam versões em vez de aplicar apenas “última gravação vence”.

## Histórico anterior

O histórico detalhado anterior a este changelog permanece disponível nos [commits do repositório](https://github.com/rfmss/escrevaral/commits). Entradas retroativas não foram inventadas: futuras versões serão documentadas a partir do estado verificável do projeto.
