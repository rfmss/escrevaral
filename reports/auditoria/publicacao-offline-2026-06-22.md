# Auditoria Publicacao/Offline - 2026-06-22

**URL:** https://escrevaral.com  |  **Semaforo:** VERDE  |  **P0:** 0 **P1:** 0 **P2:** 5

Sitemap: 8 URLs.  
Recursos testados: 115.

## P2

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/: <a href='/cdn-cgi/l/email-protection#d7b8be97b2a4b4a5b2a1b6a5b6bbf9b4b8bae8a4a2b5bdb2b4a3ea98bef2e594f2e5e792a4b4a5b2a1b6a5b6bbf1b6baa7ecb5b8b3aeea98bef2e5e6f2e5e792a4b4a5b2a1b8f2e5e7a7b8a5a6a2b2f2e5e7'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#523d3b123721312037243320333e7c313d3f'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#610e08210412021304170013000d4f020e0c'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Offline] index depende de Google Fonts em primeira carga**
  - Evidencia: fonts.googleapis.com / fonts.gstatic.com
  - Recomendacao: Aceitavel com fallback, mas nao e 100% autocontido antes da primeira visita online.

- **[Offline] paginas do sitemap fora do cache inicial**
  - Evidencia: /vereda-titulo-do-livro.html, /vereda-primeiras-linhas.html, /vereda-revisao-manuscrito.html, /vereda-bloqueio-criativo.html, /anatomia-do-livro.html, /privacidade.html
  - Recomendacao: Decidir se trilhas editoriais tambem devem abrir offline apos instalacao.

## Comando

```bash
python3 scripts/auditor-publicacao.py
```

