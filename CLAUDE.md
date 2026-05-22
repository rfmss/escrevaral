# Vereda — instruções para Claude

Oficina literária offline para escritores brasileiros. JS vanilla + CSS puro + HTML único. Sem framework, sem IA de terceiros, sem envio de dados.

**Deploy:** push em `main` → rafa.pro.br/veredav3 (GitHub Pages automático)
**QA local:** `python3 -m http.server 8799` + Playwright headless
**Repositório:** github.com/rfmss/veredav3

---

## Leitura obrigatória ao abrir

Ler `META_ENGINES_100.md` no início de toda sessão. Antes de propor ou aplicar mudanças, identificar qual engine a tarefa aproxima de 100% e qual evidência concreta justifica o avanço.

Pergunta padrão: **qual engine vamos aproximar de 100% hoje, e por qual evidência?**

Relatório ativo de auditoria: `AUDITORIA_ROUND1_JOBS_RESPONSIVIDADE.md` para decisões sobre guia de escrita, bordas das telas internas e responsividade em notebook, celular e TV vertical.

---

## Pilar inegociável: português brasileiro integral

Todo texto visível do Vereda deve estar em português brasileiro. Não usar estrangeirismos na interface, mesmo quando parecerem comuns em produto digital.

Regra: benefício humano primeiro; mecanismo técnico só em detalhe, ajuda, documentação ou exportação técnica.

| Usar na interface | Não usar na interface |
|---|---|
| Cópia de segurança | backup |
| Salvamento automático / cópia automática | autosave |
| Sem internet | offline |
| Botão de ligar e desligar | toggle |
| Guia da forma / estrutura do texto | blueprint |
| Guia de escrita / ponto de partida | template |
| Olhar do texto / painel de leitura | inspector |
| Pistas do texto | precision |
| Situação | status |
| Janela | modal |
| Dica | tooltip |
| Baixar / trazer arquivo | download / upload |
| Assinatura do texto | hash |
| Dados do navegador | cache |

Critério de aceite: uma escritora brasileira deve entender a tela sem saber inglês técnico e sem aprender vocabulário de desenvolvimento.

---

## Pilar visual: metáforas alinhadas e silenciosas

O Vereda usa metáforas de escrita brasileiras: mesa, folha, acervo, guia, oficina, autoria, leitura e cuidado. Toda nova metáfora visual precisa nascer de uma função real da escrita, não de decoração.

Ler `MAPA_ICONES_METAFORAS.md` sempre que a tarefa tocar em ícone, botão, metáfora, logo, textura, favicon ou estado visual.

Regra: a metáfora deve orientar sem chamar mais atenção que o texto.

| Metáfora | Serve para | Não pode virar |
|---|---|---|
| Mesa | ambiente de escrita, fundo opcional, sensação de oficina | textura obrigatória, ornamento pesado, tema mais importante que a folha |
| Folha | espaço principal de escrita e leitura | cartão decorativo, moldura grossa, vitrine |
| Ferramenta | ação discreta e útil | botão barulhento, placa, selo, troféu |
| Guia | companhia de ofício | formulário, tutorial invasivo, texto dentro do editor |
| Acervo | guarda e organização | painel técnico, repositório frio |
| Prova de autoria | cuidado com o processo humano | juridiquês, painel pericial, linguagem de sistema |
| Foco | mesa limpa para escrever | painel de controles, régua de leitura, cronômetro dominante |
| Ler | revisão como leitor | editor com outro nome |

Critérios de aceite visual:

- Botões globais devem parecer ferramentas em repouso: pequenos, quietos, sem moldura pesada.
- Abas de navegação devem orientar lugar, não disputar atenção com o manuscrito.
- Um botão de metáfora, como "Fundo de mesa", precisa deixar claro o efeito e continuar secundário.
- Se uma metáfora exigir explicação longa para ser entendida, ela ainda não está madura.
- A interface deve parecer uma mesa preparada, não um painel de demonstração.

---

## Stack

| Camada | Arquivo(s) |
|--------|-----------|
| Entrada | `index.html` (único) |
| Orquestração | `app.js` |
| Estado global | `state-store.js` |  
| Estilos | `styles.css` → `@import css/*.css` |
| Service worker | `service-worker.js` |

**Engines de linguagem** (carregam antes do app.js, nesta ordem):
```
syntax-engine.js → punctuation-engine.js → analise-engine.js
lexical-engine.js, rimalab-engine.js, voice-engine.js
decolonial-engine.js, precision-engine.js, proof-engine.js
```

**Dados JSON:** `syntax-data.json`, `lexical-data.json`, `rimalab-data.json`, `analise-data.json`, `decolonial-data.json`, `criterios-data.js`, `templates-data.json`

---

## Convenções obrigatórias

**Versionamento de assets:** toda alteração em JS ou CSS exige bump da string `?v=` no `index.html` e do `ASSET_VERSION` no `service-worker.js`. Formato: `YYYYMMDD-slug`.

**Cache do SW:** quando mudar `ASSET_VERSION`, incrementar `CACHE_NAME` (vereda-offline-vN).

**Globals implícitos** (definidos em `state-store.js` ou `app.js`, usados por todos):
`state`, `shell`, `writingArea`, `escapeHtml`, `countWords`, `persistState`, `getActiveManuscript`

**Novos engines** são carregados via `<script defer>` no `index.html` antes do `app.js`. Sempre adicionar ao `CORE_ASSETS` do service worker.

---

## Vocabulário do produto (usar na interface)

| Usar | Não usar |
|------|----------|
| Nota | documento, item, post |
| Manuscrito | conteúdo, draft |
| Acervo | repositório, biblioteca genérica |
| Guia de escrita | template, modelo |
| Olhar do texto / análise local | motor, IA, processamento |
| Prova de autoria | certificado, prova jurídica |
| Formato | tipo |
| Apagar nota | deletar, remover |
| Cópia de segurança | backup |
| Salvamento automático | autosave |
| Sem internet | offline |

---

## O que não fazer

- Não criar arquivos `.md` de documentação sem pedido explícito
- Não adicionar comentários no código (só se o WHY for não-óbvio)
- Não refatorar além do escopo pedido
- Não criar abstrações para uso hipotético futuro
- Não oferecer alternativas ao final — executar e parar
- Não fazer push sem pedido explícito
- Não quebrar o estado do localStorage (estrutura em `state-store.js`)
- Não alterar `templates-data.json` sem pedido — tem 63 templates calibrados
