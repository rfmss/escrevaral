# Relatório de Auditoria — Lucas
**Sessão:** v359 · **Data:** 2026-05-30  
**Perfil:** 21 anos, estudante de letras, escreve poesia e contos curtos  
**Dispositivo:** Android 13, Chrome, 390×730px (altura real com barra do navegador)  
**Modo:** touch habilitado, has_touch=True, 14 telas auditadas  

---

## Resumo executivo

Lucas passou pelo fluxo completo sem travar em nenhum ponto crítico. O produto funciona no mobile. Mas há três problemas específicos de tela pequena que surgem só nesta resolução — nenhum deles foi capturado pelo Auditor UX no headless 390×844.

O mais grave: **o painel de guia empilha sobre o editor no mobile** — quando o guia abre, ele ocupa metade da tela e cobre a barra de toolbar, deixando o editor visível mas inacessível sem rolar. Para um escritor que vai entre guia e texto o tempo todo, isso é atrito alto.

Os outros dois são menores mas acumulam: a **barra de meta (Acervo)** está cortada no card de manuscrito, e a **barra de ações do Espelho de Voz** transborda para fora da tela em 390px.

---

## Achados por severidade

### ALTA

---

**L1 · Guia + editor empilhados no mobile — toolbar inacessível**

Quando o guia é aberto no mobile (13_guia.png), o layout exibe o painel de guia em cima e o editor abaixo. O editor fica visível mas a barra "Ocultar guia / Ler" e toda a toolbar de formatação ficam na faixa central da tela — parcialmente visíveis, mas o guia ocupa todo o espaço útil acima.

O efeito real: o usuário vê o guia e o título do manuscrito, mas para escrever precisa rolar para baixo da tela. Não há indicação visual de que o editor continua abaixo.

**Heurística:** #6 Reconhecimento em vez de recordação / #8 Estética e design minimalista  
**Impacto:** Lucas abre o guia esperando escrever ao lado — encontra uma tela partida onde não sabe onde clicar para escrever.  
**Proposta mínima:** no mobile, quando o guia estiver aberto, ocultar completamente o painel de guia e mostrar apenas um indicador no topo do editor (ex: badge "Guia: Conto" com botão de fechar). O guia vira uma folha que desliza de baixo, não um painel lateral empilhado.

---

### MÉDIA

---

**L2 · Espelho de Voz: barra de ações transborda em 390px**

Na tela 09_espelho_com_texto.png, a barra de ações abaixo da textarea exibe: "lido aqui · nada sai do navegador | Baixar TXT | Análise do manuscrito | C res..." — o último item está cortado. A barra não quebra linha e não tem scroll horizontal localizado.

**Heurística:** #8 Estética / #4 Consistência  
**Impacto:** Lucas não descobre "Copiar resultado" sem rolar. Em texto de poesia curta isso importa — ele quer copiar o resultado para compartilhar.  
**Proposta mínima:** no mobile, `.voice-meta` em duas linhas ou `flex-wrap: wrap` com os botões de ação em linha separada da legenda.

---

**L3 · Bandeja "Mais" — Biblioteca e Plano fora da nav principal do phone**

Na tela 11_bandeja.png, a bandeja exibe: Biblioteca, Plano, Cópia de segurança, Tema, Impressão. Lucas chega na Biblioteca por aqui — um passo a mais versus o dock. Para um usuário que consulta a Biblioteca frequentemente enquanto escreve, esse custo acumula.

Não é um bug — é uma decisão de produto deliberada (dock de 4 itens + Mais). Mas o Auditor UX havia marcado como M4 pendente de validação real. Confirmado: no phone real, Biblioteca fica na bandeja.

**Heurística:** #7 Flexibilidade e eficiência  
**Impacto:** baixo para usuário casual; alto para usuário que usa a Biblioteca como ferramenta de escrita ativa.  
**Nota de produto:** avaliar se "Biblioteca" merece subir para o dock principal trocando um dos quatro itens atuais — ou se "Plano" (Cronograma) é mais urgente no dock do que "Autoria".

---

### BAIXA

---

**L4 · Chip "Autoria 95%" sem entrada na welcome modal**

Na tela 03_escrevendo.png, o chip aparece com "Autoria 95%" assim que Lucas digita. O rótulo "Autoria" está funcionando (fix v359). Mas o valor 95% numa sessão de 10 palavras parece inconsistente — pode confundir: "meu texto está 95% pronto?" ou "minha autoria está 95% verificada?".

O número é integridade do processo (ritmo humano de digitação detectado), não completude do texto. O rótulo certo é "Autoria" mas o número isolado ainda cria dúvida.  
**Proposta mínima:** nenhuma urgente — observar se usuários reais clicam no chip para entender. Beatriz não clicou. Lucas não clicou (no script). Dado a acompanhar.

---

**L5 · Card de manuscrito cortado no Acervo**

Na tela 06_acervo.png, o card do manuscrito exibe o título mas o rodapé "Criado hoje / palavras" está fora da viewport. Não é overflow — é que o card tem altura mínima maior que o espaço disponível com banner + chip + header. Apenas rolar resolve.

**Impacto:** mínimo. Lucas viu o manuscrito e clicou sem problema.

---

## O que funcionou bem para Lucas

| Tela | Observação |
|---|---|
| Welcome modal | Perfeita no mobile. Hierarquia e toque sem ambiguidade. |
| Escrita | Texto aparece, salvamento confirmado, chip de autoria visível. |
| Negrito | B tocável no mobile sem precisar zoom. |
| Toolbar editorial expandida | QUEBRA · COPIAR · BAIXAR · IMPRIMIR legíveis. (fix v359) |
| Acervo | Filtros funcionam no toque. "Continue de onde parou" funciona. |
| Prova de autoria | Métricas legíveis. Frase de contexto presente. |
| Bandeja | Organização clara. Nomes em português sem ambiguidade. |
| Cronograma | Linha do tempo legível no mobile. Manuscrito registrado automaticamente. |
| Academia → template studio | Busca + categorias funcionam no toque. "Poesia 5" visível na primeira tela. |
| Guia → Escolher guia | Botão funcionou, navegou para Academia corretamente. |

---

## Tabela de prioridade

| Código | Achado | Severidade | Esforço |
|---|---|---|---|
| L1 | Guia + editor empilhados — toolbar inacessível | Alta | Médio |
| L2 | Espelho de Voz: barra de ações cortada | Média | Pequeno |
| L3 | Biblioteca na bandeja — avaliar promoção | Média (decisão PO) | — |
| L4 | Chip 95% — significado do número | Baixa | Observar |
| L5 | Card acervo cortado | Baixa | Mínimo |

---

## Confirmações de fixes anteriores

- ✅ A2 (tooltip sem toque): **não reproduziu** no Playwright com has_touch=True. Confirmar em dispositivo físico ainda pendente, mas sem evidência nova de bug.
- ✅ M1 (banner fecha na digitação): comportamento correto — banner estava presente antes de digitar, some após o texto.
- ✅ M2 (chip com rótulo "Autoria"): visível e legível no mobile.
- ✅ A1 (toolbar com rótulos): CLASSES, QUEBRA, COPIAR, BAIXAR, IMPRIMIR — todos legíveis em 390px.

---

*Relatório entregue ao PO em 2026-05-30. Próxima sessão recomendada: Fernanda (ENEM) ou re-teste de L1 após fix do guia mobile.*
