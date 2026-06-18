# Auditoria Publicacao/Offline - 2026-06-18

**URL:** https://escrevaral.com  |  **Semaforo:** AMARELO  |  **P0:** 0 **P1:** 1 **P2:** 5

Sitemap: 8 URLs.
Recursos testados: 116.

## P1

- **[Recurso interno] referencia interna quebrada**
  - Evidencia: https://escrevaral.com/anatomia-do-livro.html: <meta content='https://escrevaral.com/og-anatomia-do-livro.png'> -> 404 HTTP Error 404: Not Found
  - Recomendacao: Corrigir caminho ou remover referencia.

## P2

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/: <a href='/cdn-cgi/l/email-protection#7d12143d180e1e0f180b1c0f1c11531e1210420e081f17181e09403214584f3e584f4d380e1e0f180b1c0f1c115b1c100d461f121904403214584f4c584f4d380e1e0f180b12584f4d0d120f0c0818584f4d'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#37585e775244544552415645565b1954585a'>
  - Recomendacao: Nao e 404 do produto com JS ativo, mas e dependencia de reescrita da Cloudflare para email clicavel.

- **[Links] email protegido pela Cloudflare no HTML bruto**
  - Evidencia: https://escrevaral.com/privacidade.html: <a href='/cdn-cgi/l/email-protection#a5cacce5c0d6c6d7c0d3c4d7c4c98bc6cac8'>
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
