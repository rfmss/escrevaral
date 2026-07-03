# Auditoria Privacidade/Rede - 2026-06-30

**URL:** https://escrevaral.com  |  **Semaforo:** AMARELO  |  **P0:** 0 **P1:** 1 **P2:** 5

Canario usado: `CANARY_ESCREVARAL_PRIV_20260618_NAO_ENVIAR`

## Resultado do canario

- Vazou em rede: `False`
- Presente em localStorage: `True`
- Requisicoes observadas: `92`
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

- **[Rede] requisicoes externas nao-GET observadas**
  - Evidencia: POST https://escrevaral.goatcounter.com/count?p=%2F%23editor&t=Escrevaral%20%E2%80%94%20Manuscrito&s=1366&b=153&rnd=9rfif; POST https://escrevaral.goatcounter.com/count?p=%2F%23biblioteca&t=Escrevaral%20%E2%80%94%20Biblioteca&s=1366&b=153&rnd=l9cn6; POST https://escrevaral.goatcounter.com/count?p=%2F%23autoria&t=Escrevaral%20%E2%80%94%20Prova%20de%20autoria&s=1366&b=153&rnd=bic1n; POST https://escrevaral.goatcounter.com/count?p=%2F%23arquivo&t=Escrevaral%20%E2%80%94%20Arquivo&s=1366&b=153&rnd=3oz1n; POST https://escrevaral.goatcounter.com/count?p=%2F%23academia&t=Escrevaral%20%E2%80%94%20Ateli%C3%AA&s=1366&b=153&rnd=rcgal; POST https://escrevaral.goatcounter.com/count?p=%2F%23cronograma&t=Escrevaral%20%E2%80%94%20Cronograma&s=1366&b=153&rnd=zchjc; POST https://escrevaral.goatcounter.com/count?p=%2F%23editor&t=Escrevaral%20%E2%80%94%20Manuscrito&s=1366&b=153&rnd=n0m4b
  - Recomendacao: Verificar se analytics nao recebe conteudo do texto.

## Dominios externos observados

- `escrevaral.goatcounter.com`: 7 requisicoes
- `fonts.googleapis.com`: 1 requisicoes
- `fonts.gstatic.com`: 3 requisicoes
- `gc.zgo.at`: 1 requisicoes
- `static.cloudflareinsights.com`: 1 requisicoes

## Comando

```bash
python3 scripts/auditor-privacidade-rede.py
```

