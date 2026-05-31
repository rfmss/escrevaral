# Analíticas — GoatCounter

Data: 2026-05-23

## Decisão

Usar GoatCounter como analítica leve e respeitosa para o Escrevaral.

Motivo:

1. Não é Google Analytics.
2. É simples.
3. Não exige rastreamento agressivo.
4. Combina com a promessa de privacidade do Escrevaral.

## Cadastro

Tela:

```txt
https://www.goatcounter.com/signup
```

Campos recomendados:

```txt
Account name: escrevaral
```

Esse nome cria o painel:

```txt
https://escrevaral.goatcounter.com
```

```txt
Site domain: escrevaral.com
```

Sem `https://` e sem `/` no final.

```txt
Email address: escrevaral@proton.me
```

Senha:

```txt
senha forte, guardada fora do repositório
```

Verificação humana:

```txt
9
```

Se `escrevaral` já estiver indisponível como nome de conta, alternativas:

```txt
escrevaralapp
escrevaraloficial
escrevaralbr
```

Nesse caso, o código do script precisa usar o nome escolhido.

## Código para inserir no site

Se a conta for `escrevaral`, inserir antes de `</head>` ou antes de `</body>`:

```html
<script data-goatcounter="https://escrevaral.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

Versão com respeito explícito ao sinal de não rastrear:

```html
<script>
  window.goatcounter = {
    no_onload: navigator.doNotTrack === "1"
  };
</script>
<script data-goatcounter="https://escrevaral.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

Recomendação do Escrevaral:

Usar a versão com `doNotTrack`, mesmo que o GoatCounter não exija. É coerente com a promessa do produto.

## Status de integração

Status em 2026-05-23:

```txt
Integrado no index.html principal.
```

Implementação usada:

```html
<script>
  (() => {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

    window.goatcounter = window.goatcounter || {};
    window.goatcounter.no_onload = true;

    const goatcounter = document.createElement("script");
    goatcounter.dataset.goatcounter = "https://escrevaral.goatcounter.com/count";
    goatcounter.async = true;
    goatcounter.src = "https://gc.zgo.at/count.js";
    goatcounter.addEventListener("load", () => {
      window.dispatchEvent(new Event("escrevaral:analytics-ready"));
    });
    document.body.appendChild(goatcounter);
  })();
</script>
```

Observação:

Se o navegador sinalizar "não rastrear", o script externo nem é carregado.

Atualização em 2026-05-25:

Como o Escrevaral é uma aplicação de tela única com rotas em hash (`#editor`, `#cronograma`, `#academia`), o rastreamento passou a ser manual:

```txt
window.goatcounter.no_onload = true
```

O `app.js` chama `window.goatcounter.count()` quando a rota muda, registrando caminhos como:

```txt
/#editor
/#cronograma
/#autoria
```

Também foi removida a busca direta por contador público em `/counter//_.json`. Esse endpoint exige configuração específica no painel do GoatCounter e não é necessário para analítica; o painel do GoatCounter é a fonte de verdade.

## Onde colocar no projeto

Arquivo principal:

```txt
index.html
```

Lugar recomendado:

```txt
fim do <head>, depois dos metadados e antes do fechamento </head>
```

Não colocar nas páginas experimentais até decidirmos se elas entram no site público.

## Verificação

Depois de publicar:

1. Abrir `https://escrevaral.com`.
2. Abrir `https://escrevaral.goatcounter.com`.
3. Esperar cerca de 10 segundos.
4. Ver se aparece uma visita.

Se não aparecer:

1. Desativar bloqueador de anúncios só para teste.
2. Conferir se o domínio do script é o mesmo nome da conta.
3. Conferir se o site publicado contém o script.
4. Conferir console do navegador.

## Domínio próprio para estatísticas

Opcional para depois:

```txt
stats.escrevaral.com
```

DNS:

```txt
Tipo: CNAME
Host: stats
Valor: escrevaral.goatcounter.com
```

Depois configurar esse domínio dentro do GoatCounter.

Observação:

Isso é apenas domínio bonito para o painel/contagem. Não impede bloqueadores de reconhecerem GoatCounter.

## Fontes

GoatCounter — primeiros passos:

```txt
https://www.goatcounter.com/help/start
```

GoatCounter — múltiplos domínios:

```txt
https://www.goatcounter.com/help/domains
```

GoatCounter — domínio próprio:

```txt
https://www.goatcounter.com/help/faq
```
