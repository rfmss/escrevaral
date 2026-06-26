# Auditoria Privacidade/Rede - 2026-06-26

**URL:** https://escrevaral.com  |  **Semaforo:** AMARELO  |  **P0:** 0 **P1:** 1 **P2:** 11

Canario usado: `CANARY_ESCREVARAL_PRIV_20260618_NAO_ENVIAR`

## Resultado do canario

- Vazou em rede: `False`
- Presente em localStorage: `True`
- Requisicoes observadas: `89`
- Dominios externos: `escrevaral.goatcounter.com, fonts.googleapis.com, fonts.gstatic.com, gc.zgo.at, static.cloudflareinsights.com`

## P1

- **[Headers] CSP ausente**
  - Evidencia: https://escrevaral.com/ nao envia `content-security-policy`
  - Recomendacao: Se Cloudflare permitir, adicionar header de seguranca sem quebrar GitHub Pages.

## P2

- **[Headers] HSTS ausente**
  - Evidencia: https://escrevaral.com/ nao envia `strict-transport-security`
  - Recomendacao: Se Cloudflare permitir, adicionar header de seguranca sem quebrar GitHub Pages.

- **[Headers] Permissions-Policy ausente**
  - Evidencia: https://escrevaral.com/ nao envia `permissions-policy`
  - Recomendacao: Se Cloudflare permitir, adicionar header de seguranca sem quebrar GitHub Pages.

- **[Headers] Referrer-Policy ausente**
  - Evidencia: https://escrevaral.com/ nao envia `referrer-policy`
  - Recomendacao: Se Cloudflare permitir, adicionar header de seguranca sem quebrar GitHub Pages.

- **[Headers] X-Content-Type-Options ausente**
  - Evidencia: https://escrevaral.com/ nao envia `x-content-type-options`
  - Recomendacao: Se Cloudflare permitir, adicionar header de seguranca sem quebrar GitHub Pages.

- **[Navegacao] nao foi possivel acionar modulo durante auditoria**
  - Evidencia: biblioteca
  - Recomendacao: Conferir se seletor mudou.

- **[Navegacao] nao foi possivel acionar modulo durante auditoria**
  - Evidencia: autoria
  - Recomendacao: Conferir se seletor mudou.

- **[Navegacao] nao foi possivel acionar modulo durante auditoria**
  - Evidencia: arquivo
  - Recomendacao: Conferir se seletor mudou.

- **[Navegacao] nao foi possivel acionar modulo durante auditoria**
  - Evidencia: academia
  - Recomendacao: Conferir se seletor mudou.

- **[Navegacao] nao foi possivel acionar modulo durante auditoria**
  - Evidencia: cronograma
  - Recomendacao: Conferir se seletor mudou.

- **[Navegacao] nao foi possivel acionar modulo durante auditoria**
  - Evidencia: editor
  - Recomendacao: Conferir se seletor mudou.

- **[Rede] requisicoes externas nao-GET observadas**
  - Evidencia: POST https://escrevaral.goatcounter.com/count?p=%2F%23editor&t=Escrevaral%20%E2%80%94%20Manuscrito&s=1366&b=153&rnd=zzfe8; POST https://escrevaral.goatcounter.com/count?p=%2F%23autoria&t=Escrevaral%20%E2%80%94%20Prova%20de%20autoria&s=1366&b=153&rnd=xc5fm; POST https://escrevaral.goatcounter.com/count?p=%2F%23academia&t=Escrevaral%20%E2%80%94%20Ateli%C3%AA&s=1366&b=153&rnd=3kg4u; POST https://escrevaral.goatcounter.com/count?p=%2F%23cronograma&t=Escrevaral%20%E2%80%94%20Cronograma&s=1366&b=153&rnd=8mmo6; POST https://escrevaral.goatcounter.com/count?p=%2F%23editor&t=Escrevaral%20%E2%80%94%20Manuscrito&s=1366&b=153&rnd=141l9
  - Recomendacao: Verificar se analytics nao recebe conteudo do texto.

## Dominios externos observados

- `escrevaral.goatcounter.com`: 5 requisicoes
- `fonts.googleapis.com`: 1 requisicoes
- `fonts.gstatic.com`: 3 requisicoes
- `gc.zgo.at`: 1 requisicoes
- `static.cloudflareinsights.com`: 1 requisicoes

## Comando

```bash
python3 scripts/auditor-privacidade-rede.py
```

