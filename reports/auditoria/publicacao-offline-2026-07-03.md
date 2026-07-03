# Auditoria Publicacao/Offline - 2026-07-03

**URL:** https://escrevaral.com  |  **Semaforo:** VERDE  |  **P0:** 0 **P1:** 0 **P2:** 5

Sitemap: 8 URLs.  
Recursos testados: 116.

## P2

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/: <a href='/cdn-cgi/l/email-protection#b7d8def7d2c4d4c5d2c1d6c5d6db99d4d8da88c4c2d5ddd2d4c38af8de9285f4928587f2c4d4c5d2c1d6c5d6db91d6dac78cd5d8d3ce8af8de928586928587f2c4d4c5d2c1d8928587c7d8c5c6c2d2928587'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#37585e775244544552415645565b1954585a'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#600f09200513031205160112010c4e030f0d'>
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

