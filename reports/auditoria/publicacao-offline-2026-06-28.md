# Auditoria Publicacao/Offline - 2026-06-28

**URL:** https://escrevaral.com  |  **Semaforo:** VERDE  |  **P0:** 0 **P1:** 0 **P2:** 5

Sitemap: 8 URLs.  
Recursos testados: 116.

## P2

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/: <a href='/cdn-cgi/l/email-protection#1f70765f7a6c7c6d7a697e6d7e73317c7072206c6a7d757a7c6b2250763a2d5c3a2d2f5a6c7c6d7a697e6d7e73397e726f247d707b662250763a2d2e3a2d2f5a6c7c6d7a69703a2d2f6f706d6e6a7a3a2d2f'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#b4dbddf4d1c7d7c6d1c2d5c6d5d89ad7dbd9'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#503f39103523332235263122313c7e333f3d'>
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

