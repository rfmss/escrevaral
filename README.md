# Escrevaral

Oficina literária gratuita para escritoras e escritores brasileiros.

→ **[escrevaral.com](https://escrevaral.com)** · aplicativo Android em **[escrevaral.com/app](https://escrevaral.com/app)**

---

## O que é

Editor de texto completo que roda inteiramente no navegador, sem servidor, sem conta, sem custo. O manuscrito nunca sai do dispositivo de quem escreve.

- **Editor** com modos de escrita, guias de ofício e folha paginada (ENEM/vestibular)
- **Análise gramatical** — sistema especialista de português brasileiro construído regra a regra, com todas as 10 classes de palavras e função sintática
- **Espelho de Voz** — análise de ritmo, vocabulário e estilo da escrita
- **RimaLab** — métrica e rima para verso e poesia
- **Vocabulário Decolonizador** — revisão crítica de termos
- **Prova de Autoria** — registro do ritmo humano de escrita, com assinatura do texto e carimbo de anterioridade
- **Cópia de segurança automática** — tudo salvo no dispositivo, exportável a qualquer momento
- **Funciona sem internet** — PWA com service worker; também distribuído como APK Android assinado

## Stack

```
HTML · CSS · JS vanilla
sem framework · sem dependência externa · sem envio de dados
```

## Qualidade auditável

Nada aqui é caixa preta. A análise de linguagem é calibrada contra a tradição gramatical brasileira (Bechara, Cunha & Cintra, Nascentes) e verificada por baterias públicas neste repositório:

- **Bancada gramatical** — mais de 1.900 frases críticas com resultado esperado, em [`scripts/bench-gramatica/`](scripts/bench-gramatica/)
- **Corpus de controle literário** — Clarice Lispector, Machado de Assis e Guimarães Rosa como teste de falso positivo
- **Casos dourados de regressão** — [`scripts/golden/`](scripts/golden/)
- **Auditoria noturna automatizada** — overflow mobile, erros de console e integridade dos dados linguísticos, com relatórios versionados em [`reports/`](reports/)

## Rodar localmente

```bash
python3 -m http.server 8799
# abre http://localhost:8799
```

Service workers exigem `localhost` ou HTTPS — não abre via `file://`.

## Estrutura

O site é servido pelo GitHub Pages a partir da raiz — por isso os módulos (`*-engine.js`, `*-controller.js`, `*-data.json`) ficam no nível superior, carregados em ordem explícita pelo `index.html`. Decisões de arquitetura e produto estão documentadas em [`docs/_decisoes/`](docs/_decisoes/).

## Contribuir

Issues abertas. Toda sugestão é bem-vinda.

Se você escreve, ensina ou estuda: use, teste e conta o que faltou → **oi@escrevaral.com**

## Direitos

© 2026 Rafael Massena. "Escrevaral" é neologismo e marca do criador. O código-fonte está público para leitura, estudo e auditoria — a trilha de commits é parte da prova de anterioridade do projeto. Uso, cópia ou redistribuição do código, do nome ou dos dados linguísticos exigem autorização expressa.

Criado por [Rafa Mass](https://rafa.pro.br)
