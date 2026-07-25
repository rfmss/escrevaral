# Escrevaral Argila — candidata estável de lançamento

Data: 25 de julho de 2026  
Base avaliada: `stabilize/release-candidate-argila`

## Veredito

A candidata atingiu os critérios definidos para estabilidade de lançamento:

- **P0 reproduzido:** 0
- **P1 reproduzido:** 0
- **Teste Master local:** verde
- **Auditoria visual local:** verde
- **Publicação/offline em produção:** verde
- **Privacidade/rede em produção:** verde
- **Pilares do produto:** verde
- **Integridade dos manuscritos:** verde
- **Engines e regressões:** verde
- **Foco, teclado, console e overflow:** verde

## Evidências centrais

### Conteúdo e privacidade

O texto-canário não apareceu em nenhuma requisição de rede e permaneceu no armazenamento local. As requisições externas observadas limitaram-se a fontes, métricas de visita e infraestrutura; o auditor não encontrou envio do conteúdo do manuscrito.

### Publicação e offline

As oito URLs do sitemap responderam, 128 recursos foram verificados e nenhum P0/P1 de publicação ou continuidade offline foi encontrado.

### Interface da candidata

As seis views reais e as páginas do sitemap foram verificadas em 390, 768 e 1366 px. Nenhum controle visível escapou lateralmente, nenhuma rolagem horizontal não intencional permaneceu e nenhum botão visível ficou sem nome acessível.

### Dados linguísticos

As quatro ambiguidades estáticas remanescentes são documentadas como P2. Elas envolvem palavras que podem funcionar como verbo ou adjetivo conforme o contexto. As guardas existentes e a regressão das engines permanecem verdes; não houve falha funcional reproduzida.

## Limitações P2 conhecidas

Estas limitações não bloqueiam o lançamento, mas permanecem registradas:

- a primeira carga ainda pode solicitar Google Fonts, com fallback local do sistema;
- páginas editoriais satélite não fazem parte do cache inicial completo da PWA;
- endereços de e-mail podem ser reescritos pela proteção da Cloudflare;
- a hospedagem ainda não fornece todos os cabeçalhos de hardening desejáveis, como CSP e HSTS;
- GoatCounter e a métrica da Cloudflare realizam requisições externas, sem conteúdo do manuscrito;
- quatro ambiguidades morfológicas permanecem como casos de expansão futura do corpus contextual.

## O que não foi alterado

- formato `.esc`;
- manuscritos ou esquema de armazenamento;
- engines literárias e linguísticas;
- prova de autoria;
- exportadores;
- rotas públicas;
- filosofia offline-first.

## Estado de lançamento

**Aprovado para merge e publicação.**

“100% estável”, neste documento, significa: todos os critérios de saída definidos e automatizados passaram, sem P0/P1 reproduzido. Não significa ausência metafísica de qualquer bug futuro; significa uma base verificável, protegida e pronta para receber pessoas reais.
