# Domínio, DNS e e-mail — Escrevaral

Data: 2026-05-23

## Contexto

Domínio principal do projeto:

```txt
escrevaral.com
```

Registrador:

```txt
Spaceship
```

Repositório publicado:

```txt
https://github.com/rfmss/escrevaral
```

Domínio canônico do site:

```txt
https://escrevaral.com/
```

## Situação no GitHub

Já foi enviado para o GitHub:

1. `CNAME` com `escrevaral.com`.
2. `index.html` com `canonical`, `og:url` e JSON-LD apontando para `https://escrevaral.com`.
3. `robots.txt` apontando para `https://escrevaral.com/sitemap.xml`.
4. `sitemap.xml` com URLs em `https://escrevaral.com`.

Commit de referência:

```txt
b379100 seo: domínio escrevaral.com — CNAME, canonical, JSON-LD, sitemap, manifest
```

## Tela certa no Spaceship

A tela correta é:

```txt
Domain Manager → escrevaral.com → Nameservers & DNS
```

Na captura, o domínio está usando:

```txt
launch1.spaceship.net
launch2.spaceship.net
```

Isso é bom: como os nameservers estão no Spaceship, os registros podem ser gerenciados no próprio painel.

Próximo clique:

```txt
Advanced DNS
```

## DNS para GitHub Pages

No `Advanced DNS`, conferir ou criar os registros abaixo.

### Domínio raiz

```txt
Tipo: A
Host: @
Valor: 185.199.108.153
```

```txt
Tipo: A
Host: @
Valor: 185.199.109.153
```

```txt
Tipo: A
Host: @
Valor: 185.199.110.153
```

```txt
Tipo: A
Host: @
Valor: 185.199.111.153
```

### IPv6

```txt
Tipo: AAAA
Host: @
Valor: 2606:50c0:8000::153
```

```txt
Tipo: AAAA
Host: @
Valor: 2606:50c0:8001::153
```

```txt
Tipo: AAAA
Host: @
Valor: 2606:50c0:8002::153
```

```txt
Tipo: AAAA
Host: @
Valor: 2606:50c0:8003::153
```

### Com www

```txt
Tipo: CNAME
Host: www
Valor: rfmss.github.io
```

## HTTPS

Depois que o DNS propagar:

```txt
GitHub → rfmss/escrevaral → Settings → Pages → Enforce HTTPS
```

Ativar `Enforce HTTPS` quando o certificado aparecer como disponível.

## E-mail do Escrevaral

Endereço mínimo necessário:

```txt
contato@escrevaral.com
```

Mas o Escrevaral pode ter aliases mais vivos, todos encaminhando para a mesma caixa real.

Sugestão de aliases:

```txt
contato@escrevaral.com
```

Uso: endereço público principal.

```txt
cartas@escrevaral.com
```

Uso: contato mais literário, bom para rodapé, Mastodon, comunidade e respostas humanas.

```txt
oficina@escrevaral.com
```

Uso: conversas sobre escrita, testes, leitores, colaboração e produto.

```txt
autoria@escrevaral.com
```

Uso: dúvidas sobre Prova de Autoria.

```txt
ajuda@escrevaral.com
```

Uso: suporte simples.

```txt
oi@escrevaral.com
```

Uso: contato curto e simpático, se quisermos algo bem leve.

Recomendação de tom:

```txt
cartas@escrevaral.com
```

como endereço com alma de marca, e

```txt
contato@escrevaral.com
```

como endereço institucional.

## Como criar o e-mail no Spaceship sem contratar caixa postal

Se o objetivo for apenas receber mensagens em outro e-mail já existente, usar:

```txt
Domain Manager → escrevaral.com → Email Forwarding
```

Configuração recomendada:

```txt
Forwarded from: contato@escrevaral.com
Forwarded to: caixa real do projeto
```

Também criar:

```txt
Forwarded from: cartas@escrevaral.com
Forwarded to: caixa real do projeto
```

```txt
Forwarded from: oficina@escrevaral.com
Forwarded to: caixa real do projeto
```

```txt
Forwarded from: autoria@escrevaral.com
Forwarded to: caixa real do projeto
```

Observação importante:

Encaminhamento recebe mensagens. Para responder como `contato@escrevaral.com`, é preciso uma caixa com envio autenticado, por exemplo Spacemail, Proton, Zoho, Google Workspace ou outro provedor com SMTP.

## Se escolher Spacemail

Se o domínio continuar com nameservers do Spaceship, o próprio Spaceship costuma adicionar os registros necessários automaticamente ao ativar o Spacemail.

Se for preciso configurar manualmente, os registros base são:

```txt
Tipo: MX
Host: @
Prioridade: 0
Valor: mx1.spacemail.com
```

```txt
Tipo: MX
Host: @
Prioridade: 0
Valor: mx2.spacemail.com
```

```txt
Tipo: TXT
Host: @
Valor: v=spf1 include:spf.spacemail.com ~all
```

```txt
Tipo: TXT
Host: spacemail._domainkey
Valor: copiar o valor único gerado pelo Spaceship
```

```txt
Tipo: TXT
Host: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:contato@escrevaral.com
```

## Decisão recomendada agora

Para começar leve:

1. Site no GitHub Pages com `escrevaral.com`.
2. `contato@escrevaral.com` via Email Forwarding.
3. `cartas@escrevaral.com` como alias poético público.
4. Deixar Spacemail para depois, quando for importante responder diretamente pelo domínio.

## Checklist de verificação

Depois de configurar:

```txt
https://escrevaral.com
```

deve abrir o site.

```txt
https://www.escrevaral.com
```

deve redirecionar ou resolver para o mesmo site.

```txt
contato@escrevaral.com
```

deve encaminhar para a caixa real.

```txt
cartas@escrevaral.com
```

deve encaminhar para a caixa real.

## Fontes consultadas

GitHub Pages, domínio personalizado:

```txt
https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
```

Spaceship, encaminhamento de e-mail:

```txt
https://www.spaceship.com/knowledgebase/domain-email-forwarding/
```

Spaceship, registros do Spacemail:

```txt
https://www.spaceship.com/en-GB/knowledgebase/spacemail-dns-records-third-party-domain
```
