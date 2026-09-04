# 10. Requisitos do Escrevaral-Encore

Requisitos de produto consolidados (dos pedidos do autor + apanhado das features legadas). Especificação de **o que** o Encore faz — para as IAs construírem com a regra de retrocompatibilidade e baixa RAM.

---

## Pilha e compatibilidade

```
R0.1 Piso certificado: iPad MD531GP/A, iOS 9.3.5 (13G36). Android KitKat está adiado.
R0.2 ES5 puro, sem framework/bundler; uma oficina por vez entra na RAM.
R0.3 Baixa RAM: dados compactos, processing leve por lente.
R0.4 Offline total a partir do primeiro acesso: cache em disco não significa scripts residentes na RAM.
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

1. **Piso**: runtime ES5 offline, uma cápsula por oficina, regressão e gate no iPad.
2. **Carteira**: nota, autosave, cadeia de hashes, pacote `.scrvrl`, exportação e validação.
3. **Oficina**: amadurecer as engines PT-BR por evidência, sem carregar todas na abertura.
4. **Casa**: calendário, busca, modo leitura, foco, som e ferramentas de permanência.
5. **Anterioridade externa**: timestamp independente e verificador público, sem enviar o conteúdo.
6. **Entrega**: recuperação, migração, auditoria, acessibilidade e publicação.
