# Auditoria Publicacao/Offline - 2026-06-29

**URL:** https://escrevaral.com  |  **Semaforo:** VERDE  |  **P0:** 0 **P1:** 0 **P2:** 5

Sitemap: 8 URLs.  
Recursos testados: 116.

## P2

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/: <a href='/cdn-cgi/l/email-protection#234c4a634650405146554251424f0d404c4e1c505641494640571e6c4a0611600611136650405146554251424f05424e5318414c475a1e6c4a0611120611136650405146554c061113534c51525646061113'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#bcd3d5fcd9cfdfced9caddceddd092dfd3d1'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#93fcfad3f6e0f0e1f6e5f2e1f2ffbdf0fcfe'>
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

