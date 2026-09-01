# 08. Mini-PWAs: pomodoro, bloco, nota

Fonte: `/home/rafamass/projetos/pomodoro/`, `/home/rafamass/projetos/bloco/`, `/home/rafamass/projetos/nota/`. Pequenos PWAs da família (6 cores). Relevância: componentes leves/offline e padrões legado.

---

## Pomodoro (dedicado)

```
Feature: Timer pomodoro standalone
O que faz: presets de foco 25min / longo 55min; até 3 timers custom salvos em localStorage; animação do "tomate sendo comido" (10 mordidas com migalhas); beep de fim via audio data-URI base64; tela cheia/standalone.
Fonte: /home/rafamass/projetos/pomodoro/index.html + manifest.json
Reuso: REFERÊNCIA — componente standalone; o Encore integra 25/50 + trava (ver requisitos)
```

## Bloco (notas simples offline)

```
Feature: App de notas/texto offline
O que faz: editor de texto simples ("Escreva aqui...", título) com snapshots; 100% offline.
Fonte: /home/rafamass/projetos/bloco/
Reuso: REFERÊNCIA — base de nota simples/escrever + salvar
```

## Nota (publicação / blog)

```
Feature: Blog de publicação (Jekyll/Chirpy)
O que faz: site estático para publicar crônicas/ficção em markdown com temas coloridos (6 tons).
Fonte: /home/rafamass/projetos/nota/ (Jekyll + _posts)
Reuso: REFERÊNCIA — canal de publicar o conteúdo (não é app de escrita)
```

> Encore: estes três são secundários — servem como padrão de PWA instalável leve e de publicação. O pomodoro integrado (escrevaral/eskrev/Typew) cobre melhor o requisito.
