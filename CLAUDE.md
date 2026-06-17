# Escrevaral — instruções para Claude

Oficina literária offline para escritores brasileiros. JS vanilla + CSS puro + HTML único. Sem framework, sem IA de terceiros, sem envio de dados.

**Pasta oficial de trabalho:** `/home/rafamass/escrevaral/` — esta é a pasta oficial; ignorar `/home/rafamass/Veredav3/`
**Projeto atual:** Escrevaral. "Vereda" é legado/histórico e pode aparecer em nomes internos antigos.
**Deploy:** push em `main` → https://escrevaral.com (GitHub Pages + Cloudflare)
**QA local:** `python3 -m http.server 8799` + Playwright headless
**Repositório:** github.com/rfmss/escrevaral

**Stack de automação (URLs — consultar memória `reference-infra-n8n-hf.md`):**
- n8n: `rafamass-n8n.hf.space` (HF Space, mantido acordado pelo cron-job.org)
- Hugging Face: `huggingface.co/rafamass`
- Banco: Neon — projeto `falling-frog-41677820`
- Wake-up: `console.cron-job.org/dashboard` (conectado via GitHub)
- Analíticas: `escrevaral.goatcounter.com` (ver `docs/_decisoes/ANALITICAS_GOATCOUNTER.md`)

---

## Leitura obrigatória ao abrir

1. `META_ENGINES_100.md` — estado de maturidade das engines; identificar qual avançar hoje.
2. `docs/_campanhas/MARCA_CANAIS.md` — marca, autoria, canais sociais e proteção legal do criador.
3. `docs/_decisoes/DOMINIO_DNS_EMAIL.md` — domínio, Cloudflare, HTTPS, DNS e e-mail.
4. `docs/_campanhas/CAMPANHA.md` — posicionamento, taglines, voz do produto e roteiros de lançamento.

Pergunta padrão: **qual engine vamos aproximar de 100% hoje, e por qual evidência?**

Relatórios ativos de auditoria:

- `docs/_decisoes/AUDITORIA_ROUND1_JOBS_RESPONSIVIDADE.md` para decisões sobre guia de escrita, bordas das telas internas e responsividade em notebook, celular e TV vertical.
- `reports/auditoria/vereda-dark-audit-20260524.md` para o estado atual do tema escuro Vereda, contraste, responsividade mobile e decisão de manter `scriptorium` como identificador técnico legado.
- `reports/auditoria/hints-nativos-tooltip-clone-20260526.md` para a decisão de produto sobre não depender de dicas nativas do navegador (`title`) e migrar hints visuais para um clone próprio Alvorada/Vereda.

---

## Banca economica de agentes

Meta acima de tudo: economizar tokens para funcionar bem em cotas gratuitas e modelos leves, como Gemini Flash. A banca fica em `.claude/agents/`, mas so entra quando economiza erro ou retrabalho.

Regra: tarefa clara e baixo risco segue direto. Se o risco nao for obvio, chamar `banca-coordenadora`. Preferir 0 ou 1 agente; 2 so com dois riscos fortes; 3+ apenas em mudanca estrutural. Cada agente le apenas arquivos ligados ao risco e responde em ate 5 linhas.

Mapa rapido: preservacao -> `guardiao-preservacao`; UX/copy/mobile -> `ux-escritora`; JS/CSS/cache -> `arquiteto-vanilla`; QA -> `auditor-qa`; engines -> `curador-engines`; marca -> `marca-campanha`; direitos/autoria -> `publicacao-direitos`; decisao estrutural -> `codex-par`; pastas/nomenclatura/higiene -> `arquivista`; click depth / acao fora de contexto / recurso distante / fluxo com etapas demais -> `analista-fluxo`.

Formato: Tarefa / Risco / Agente necessario / Menor passo / Evidencia.

---

## Pilar inegociável: português brasileiro integral

Todo texto visível do Escrevaral deve estar em português brasileiro. Não usar estrangeirismos na interface, mesmo quando parecerem comuns em produto digital.

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

## Pilar de mobilidade: teclado físico sem atrito

O Escrevaral deve poder ser usado em qualquer lugar, inclusive em tablet ou celular com teclado físico conectado. Esse cenário é parte natural da oficina portátil, não um caso secundário.

Regra de produto:

- Ao abrir ou navegar por manuscritos em dispositivo touch, não forçar foco em campo editável quando a intenção pode ser apenas ler.
- Se houver sinal de teclado físico, o editor pode receber foco automaticamente como no desktop.
- Não prometer detecção perfeita de teclado físico: navegador e sistema operacional variam. Tratar como melhoria progressiva e silenciosa.
- Não criar painel ou configuração visível enquanto a experiência puder ser resolvida por comportamento discreto.
- Focos necessários para substituição, formatação e comandos de edição podem ser mantidos.

Critério de aceite: em celular/tablet sem teclado físico, abrir um manuscrito não deve empurrar o teclado virtual sem necessidade; com teclado físico, a escrita deve continuar fluida e sem passos extras.

---

## Pilar de responsividade: sem rolagem horizontal em editores

Rolagem horizontal em telas de escrita é proibida. O editor precisa preservar a borda direita em celular, tablet e desktop; texto, toolbar, guia de escrita, modo página e editores especializados devem quebrar, empilhar ou encolher antes de empurrar a viewport.

Regra de produto:

- `body`, `content-stage`, `.editor-split`, `.editor-paper`, `.writing-area`, `.specialized-editor` e `.paged-editor` não podem produzir rolagem horizontal em mobile.
- Exceção permitida: menus, trilhos e listas horizontais claramente intencionais, com gesto local e sem deslocar a página inteira.
- No mobile, painéis auxiliares como Guia de escrita devem empilhar ou virar folha/painel; nunca podem dividir a tela a ponto de esmagar a folha.
- Toda auditoria mobile deve medir `scrollWidth > clientWidth`, não só olhar screenshot.

Critério de aceite: em 320px, 390px e 430px, a página inteira deve manter `document.scrollingElement.scrollWidth <= document.scrollingElement.clientWidth`; qualquer overflow permitido precisa estar contido no próprio menu.

---

## Pilar visual: metáforas alinhadas e silenciosas

O Escrevaral usa metáforas de escrita brasileiras: mesa, folha, acervo, guia, oficina, autoria, leitura e cuidado. Toda nova metáfora visual precisa nascer de uma função real da escrita, não de decoração.

Ler `docs/_decisoes/MAPA_ICONES_METAFORAS.md` sempre que a tarefa tocar em ícone, botão, metáfora, logo, textura, favicon ou estado visual.

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
| Anatomia do livro | `anatomia-do-livro.html` — visualizador interativo do livro físico (capa, miolo, pré-texto, texto, pós-texto). Embeddado na Academia, seção Objeto Livro. Arquivo standalone com CSS/JS próprios. Não altera `index.html`. |

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

---

## Compact Instructions

Ao compactar, preservar obrigatoriamente:

1. **Pasta oficial:** `/home/rafamass/escrevaral/` — ignorar `/home/rafamass/Veredav3/`
2. **Versionamento:** toda edição JS/CSS exige bump de `?v=YYYYMMDD-slug` em `index.html` (71 ocorrências) + `ASSET_VERSION` + `CACHE_NAME` em `service-worker.js`
3. **Pilares inegociáveis:** português brasileiro integral; sem rolagem horizontal; metáforas silenciosas; localStorage intacto
4. **Vocabulário:** Manuscrito não Texto; Acervo não repositório; Guia de escrita não template
5. **Autorização corrente:** push em `main` autorizado; ciclo autônomo ativo até limite de tokens
6. **Próximo foco:** estado das pílulas em `docs/_decisoes/AGENCIA_CONTINUIDADE_2026-06-16.md`
