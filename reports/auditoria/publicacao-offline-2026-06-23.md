# Auditoria Publicacao/Offline - 2026-06-23

**URL:** https://escrevaral.com  |  **Semaforo:** VERDE  |  **P0:** 0 **P1:** 0 **P2:** 5

Sitemap: 8 URLs.  
Recursos testados: 115.

## P2

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/: <a href='/cdn-cgi/l/email-protection#47282e072234243522312635262b6924282a783432252d2224337a082e6275046275770234243522312635262b61262a377c2528233e7a082e62757662757702342435223128627577372835363222627577'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#157a7c55706676677063746774793b767a78'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#76191f361305150413001704171a5815191b'>
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

