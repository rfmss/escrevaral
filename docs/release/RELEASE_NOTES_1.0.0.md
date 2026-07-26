# Escrevaral 1.0.0 — Argila

O primeiro lançamento público estável do Escrevaral consolida uma oficina de escrita brasileira que funciona no navegador, não exige conta e preserva manuscritos localmente.

## Para quem escreve

- editor com guias de ofício e folha paginada;
- organização local de manuscritos;
- Espelho de Voz para ritmo, vocabulário e estilo;
- RimaLab e ferramentas linguísticas em português brasileiro;
- Prova de Autoria local;
- exportação e cópia de segurança;
- instalação como aplicativo e recarga offline após a primeira visita.

## Privacidade e continuidade

O texto do manuscrito permanece no navegador. Os testes de lançamento não observaram envio do conteúdo para serviços externos.

A atualização da PWA também foi exercitada automaticamente: caches antigos do Escrevaral são removidos, caches não relacionados são preservados e a interface essencial recarrega sem rede.

## Qualidade da base

A versão foi fechada com:

- zero P0 e zero P1 reproduzidos;
- Teste Master verde;
- auditorias de publicação, privacidade, teclado, foco, console e responsividade verdes;
- fronteira entre produto, documentação e material operacional protegida por CI;
- versão, changelog e documentação de lançamento verificados automaticamente;
- nenhum PR ou issue bloqueadora aberta na baseline.

## Limitações conhecidas

- Google Fonts pode ser solicitado na primeira carga, com fallback do sistema;
- páginas editoriais satélite não integram todo o cache inicial da PWA;
- Cloudflare pode reescrever endereços de e-mail;
- a hospedagem não oferece todos os cabeçalhos de hardening desejáveis;
- métricas de visita realizam requisições externas sem conteúdo do manuscrito;
- quatro ambiguidades morfológicas permanecem registradas como casos P2.

Essas limitações não impediram os fluxos essenciais de escrita, salvamento, recuperação, exportação ou uso offline definidos para esta versão.

## Integridade dos dados

A versão 1.0.0 preserva:

- o formato `.esc`;
- o esquema de armazenamento local;
- as rotas públicas;
- o escopo do service worker;
- a filosofia offline-first;
- o funcionamento sem conta.

Criado e mantido por Rafa Mass.
