# 10. Requisitos do Escrevaral-Encore

Requisitos de produto consolidados (dos pedidos do autor + apanhado das features legadas). Especificação de **o que** o Encore faz — para as IAs construírem com a regra de retrocompatibilidade e baixa RAM.

---

## Pilha e compatibilidade

```
R0.1 Democrático: roda em iPad 2012 (iOS 9) e Android 4 (KitKat / Chromium 30).
R0.2 ES5 puro, sem framework/bundler; um engine por vez (roletagem ao acionar análise).
R0.3 Baixa RAM: dados compactos, processing leve por lente.
R0.4 Offline total a partir do primeiro acesso (pré-carregar tudo no 1º uso).
R0.5 Future-proof: spec pura separada do código; unidades módulo recriáveis.
```

## Visual

```
R1.1 Organização estilo Standard Notes (lista/coleções + editor limpo).
R1.2 Look-and-feel "IA writing": minimalista, tipografia legível, modos claro/escuro.
R1.3 (Base estética: combinar vereda Material 3 + antigravity papel/noise + ateliê Folio Notes.)
```

## Transferência / instância ("celular é a carteira")

```
R2.1 Transferência mecânica via QR code.
R2.2 Quem, do celular, "suga" o projeto inteiro (a mesa de trabalho) com tudo que tem.
R2.3 O celular vira um ESPELHO assim que cuspir em outro computador.
R2.4 Offline-first; o celular carrega a instância (carteira).
(Fonte de lógica: qrStream do eskrev; sync desktop↔mobile.)
```

## Som

```
R3.1 Som de digitação de máquina de escrever, com toggle ON/OFF.
R3.2 Som ambiente: cafeteria, pink noise, frequências que estimulam e não dão sono
     (beta/gama; ver ativos em 03-antigravity e 09-ativo-reuso).
```

## Modo foco / escrita

```
R4.1 Modo leitura "jornal" para a pessoa ler — substrato visual fora do layout normal.
R4.2 Régua de leitura (neurociência) que ancora a atenção na linha.
R4.3 Aumentar/diminuir fonte.
R4.4 Play com 3 ritmos de passada do texto.
(Fonte: régua do vereda + reader do Typew/eskrev/escrevaral.)
```

## Pomodoro

```
R5.1 Pomodoro de 25 e 50 minutos.
R5.2 Quando ativo, TRAVA o site todo (bloqueia input).
R5.3 Contador com 6 minutos de intervalo (pausa) ao concluir.
(Fonte: pomo-lock do Typew — 50/6 com lock; + pomodoro escrevaral/eskrev.)
```

## Análise / features do núcleo (do apanhado da main)

```
R6.1 Análise gramatical PT-BR um engine por vez (lexical, sintaxe, pontuação, rima, voz, decolonial, precisão por gênero).
R6.2 Prova de autoria (cartório/Authoria): hash + rastro de escrita + verify.
R6.3 Exportação/importação (TXT, MD, HTML, EPUB, DOCX) sem dependências.
R6.4 Backups automáticos + restauração.
R6.5 Offline PWA instalável (Ícone/APK opcional).
R6.6 Link para as redes do criador (a definir depois).
```

## Extras relevantes (opcionais no core)
- Modos de escrita por gênero (Soneto, Roteiro, Teatro, Slam, ENEM).
- Coloração gramatical inline + tooltips.
- Templates/ofícios por gênero.
- Cronograma/planner.
- Conquistas/badges leves.

---

## Prioridade de construção sugerida ("ondas do rio rumo ao oceano")

1. **Represa**: contrato de engine ES5 + 1 engine piloto (morfologia verbal) + dados.
2. **Encanamento**: editor de escrita ES5 offline + typewriter sound.
3. **Nível do tanque**: demais engines linguísticas (um por vez) + modo leitura.
4. **Navegação**: pomodoro com trava + modo foco + som ambiente/frequências.
5. **Carteira**: QR sync/espelho mobile.
6. **Oceano**: autoria/cartório + exportação + publicação + redes.
