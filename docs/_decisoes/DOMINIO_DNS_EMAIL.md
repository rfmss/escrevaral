# Dominio, DNS, HTTPS e e-mail - Escrevaral

Data-base: 2026-05-24

Este documento e o caminho das pedras para qualquer pessoa ou IA que precise
entender como o dominio principal do Escrevaral esta publicado, protegido e
redirecionando para HTTPS.

## Contexto atual

Projeto atual:

```txt
Escrevaral
```

Pasta oficial de trabalho:

```txt
/home/rafamass/escrevaral/
```

Dominio canonico:

```txt
https://escrevaral.com/
```

Registrador:

```txt
Spaceship
```

DNS e proxy:

```txt
Cloudflare Free
```

Hospedagem:

```txt
GitHub Pages
```

Repositorio:

```txt
https://github.com/rfmss/escrevaral
```

Importante: "Vereda" aparece em arquivos antigos e em partes internas do codigo,
mas deve ser tratado como legado/historico. A marca e o projeto publico atual sao
Escrevaral.

## Estado final da configuracao

Em 2026-05-24, o dominio foi migrado para a Cloudflare para resolver o problema
de acesso quando a pessoa digitava apenas:

```txt
escrevaral.com
```

Antes da Cloudflare, o HTTPS direto funcionava:

```txt
https://escrevaral.com
```

Mas o acesso por HTTP podia travar:

```txt
http://escrevaral.com
```

A solucao adotada foi colocar a Cloudflare na frente do GitHub Pages e ligar
`Always Use HTTPS`.

## Spaceship

No Spaceship, o dominio `escrevaral.com` NAO gerencia mais os registros DNS.
Ele apenas aponta para os nameservers da Cloudflare.

Tela:

```txt
Domain Manager -> escrevaral.com -> Nameservers & DNS
```

Nameservers atuais:

```txt
damon.ns.cloudflare.com
raegan.ns.cloudflare.com
```

Nameservers antigos removidos:

```txt
launch1.spaceship.net
launch2.spaceship.net
```

Se alguma IA encontrar a mensagem do Spaceship dizendo que produtos de DNS/e-mail
podem parar, isso foi esperado. Os registros importantes foram importados para a
Cloudflare antes da troca.

## Cloudflare

Conta:

```txt
dash.cloudflare.com
```

Dominio:

```txt
escrevaral.com
```

Plano:

```txt
Free
```

Status esperado:

```txt
Your domain is now protected by Cloudflare
DNS Setup: Full
```

Verificacao em 2026-05-24:

```txt
1.1.1.1 -> damon.ns.cloudflare.com / raegan.ns.cloudflare.com
8.8.8.8 -> damon.ns.cloudflare.com / raegan.ns.cloudflare.com
```

Tambem foi confirmado que o HTTPS pela borda da Cloudflare responde com:

```txt
server: cloudflare
HTTP/2 200
```

Durante a propagacao, algum resolvedor local pode continuar pegando GitHub direto
por um tempo. Nesse caso, esperar cache/TTL e testar em aba anonima ou outra
rede.

## DNS na Cloudflare

Os registros do site devem ficar com proxy ligado, nuvem laranja.

### Dominio raiz

```txt
Tipo: A
Nome: @
Conteudo: 185.199.108.153
Proxy status: Proxied
TTL: Auto
```

```txt
Tipo: A
Nome: @
Conteudo: 185.199.109.153
Proxy status: Proxied
TTL: Auto
```

```txt
Tipo: A
Nome: @
Conteudo: 185.199.110.153
Proxy status: Proxied
TTL: Auto
```

```txt
Tipo: A
Nome: @
Conteudo: 185.199.111.153
Proxy status: Proxied
TTL: Auto
```

### Com www

```txt
Tipo: CNAME
Nome: www
Conteudo: rfmss.github.io
Proxy status: Proxied
TTL: Auto
```

O `www` aponta para `rfmss.github.io`, nao para `rfmss.github.io/escrevaral`,
porque CNAME aponta para host, nao para caminho de URL.

### IPv6 / AAAA

Nao havia registro `AAAA` problemático quando a migracao foi feita.

Nao adicionar `AAAA` por impulso. Se um dia for ativar IPv6 para GitHub Pages,
fazer como mudanca consciente e testar depois. A configuracao atual funciona sem
AAAA.

### E-mail

Os registros de e-mail importados da Spaceship devem ficar como:

```txt
Proxy status: DNS only
```

Preservar registros:

```txt
MX
TXT SPF
TXT DKIM
TXT DMARC
```

Nunca colocar MX/TXT de e-mail como `Proxied`. E-mail sempre fica `DNS only`.

Enderecos planejados/documentados:

```txt
oi@escrevaral.com -> escrevaral@proton.me
rafamass@escrevaral.com -> rafamass@proton.me
```

`oi@escrevaral.com` e o endereco publico geral. E curto, humano e facil de
lembrar.

`rafamass@escrevaral.com` e o endereco pessoal/de dona do produto.

Alias de marca para etapa futura:

```txt
falatu@escrevaral.com
```

Outros aliases possiveis:

```txt
contato@escrevaral.com
cartas@escrevaral.com
oficina@escrevaral.com
autoria@escrevaral.com
ajuda@escrevaral.com
```

Uso sugerido:

```txt
oi@escrevaral.com
```

como endereco publico principal,

```txt
rafamass@escrevaral.com
```

como endereco de dona do produto, e

```txt
falatu@escrevaral.com
```

como possibilidade de marca para uma etapa futura.

Observacao importante: encaminhamento recebe mensagens. Para responder como
`oi@escrevaral.com` ou `rafamass@escrevaral.com`, e preciso configurar envio
autenticado com um provedor de e-mail, por exemplo Spacemail, Proton, Zoho,
Google Workspace ou outro provedor com SMTP.

Se o e-mail for alterado no Spaceship ou em outro provedor, a Cloudflare precisa
receber os novos registros `MX`, `TXT`, `SPF`, `DKIM` e `DMARC`. Depois da
migracao para Cloudflare, alterar DNS somente no painel da Cloudflare.

## SSL/TLS na Cloudflare

Tela:

```txt
SSL/TLS -> Overview
```

Modo recomendado:

```txt
Full (strict)
```

Motivo: o GitHub Pages ja emite certificado valido para `escrevaral.com`, entao a
Cloudflare pode validar o certificado da origem.

Evitar:

```txt
Flexible
```

`Flexible` criptografa do navegador ate a Cloudflare, mas nao necessariamente da
Cloudflare ate a origem. Para este projeto, nao e o modo certo.

## Edge Certificates

Tela:

```txt
SSL/TLS -> Edge Certificates
```

Configuracoes esperadas:

```txt
Always Use HTTPS: ligado
Automatic HTTPS Rewrites: ligado
TLS 1.3: ligado
Universal SSL: ativo
```

O que `Always Use HTTPS` resolve:

```txt
http://escrevaral.com -> https://escrevaral.com
```

O que testar depois:

```txt
escrevaral.com
http://escrevaral.com
https://escrevaral.com
www.escrevaral.com
```

Todos devem chegar ao site seguro.

## HSTS

Nao ativar HSTS agora.

HSTS e util, mas e rigido. Deixar para depois que o dominio estiver estavel por
alguns dias. Se ativado cedo demais e algo estiver errado, navegadores podem
continuar forcando HTTPS mesmo durante uma correcao.

## GitHub Pages

No repositorio:

```txt
rfmss/escrevaral -> Settings -> Pages
```

Confirmar:

```txt
Custom domain: escrevaral.com
Enforce HTTPS: ligado
```

No repositorio existe o arquivo:

```txt
CNAME
```

Conteudo esperado:

```txt
escrevaral.com
```

## Rotina se algo quebrar

1. Testar primeiro:

```txt
https://escrevaral.com
```

2. Testar redirecionamento:

```txt
http://escrevaral.com
```

3. Conferir nameservers no Spaceship:

```txt
damon.ns.cloudflare.com
raegan.ns.cloudflare.com
```

4. Conferir DNS na Cloudflare:

```txt
4 registros A para @ -> GitHub Pages -> Proxied
1 CNAME www -> rfmss.github.io -> Proxied
MX/TXT de e-mail -> DNS only
```

5. Conferir SSL/TLS:

```txt
SSL/TLS -> Overview -> Full (strict)
SSL/TLS -> Edge Certificates -> Always Use HTTPS ligado
```

6. Se a Cloudflare acabou de ser ativada, aguardar propagacao. Pode ser rapido,
mas pode levar algumas horas.

7. Testar em aba anonima ou em outra rede se o navegador estiver com cache.

## Comandos uteis para diagnostico

DNS raiz:

```bash
dig +short escrevaral.com A
```

Nameservers:

```bash
dig +short escrevaral.com NS
```

HTTPS:

```bash
curl -I https://escrevaral.com
```

HTTP e redirecionamento:

```bash
curl -I http://escrevaral.com
```

Certificado:

```bash
echo | openssl s_client -servername escrevaral.com -connect escrevaral.com:443 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

Resultado esperado: certificado valido para `escrevaral.com`, emitido pela
Cloudflare na borda ou pela Let's Encrypt/GitHub na origem, conforme o ponto do
teste.
