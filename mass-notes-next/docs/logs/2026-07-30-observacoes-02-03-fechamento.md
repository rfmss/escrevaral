# OBS-02/03 — Fechamento CLARO: densidade operacional e leitura verbal

Data: 2026-07-30  
Status: **corrigidas no escopo aprovado, com limites declarados**  
PR: `#155`, aberto e em rascunho  
Branch: `experiment/mass-notes-tiptap`

## Resumo para apresentação

**Antes:** a toolbar ocupava duas linhas, a faixa superior priorizava metadados técnicos estáticos, a leitura de `varre-lo-ei` era rasa e a assinatura principal mostrava detalhes de fundação pouco úteis durante a escrita.

**Depois:** a toolbar ocupa uma linha e acompanha a rolagem; o topo mostra palavras, meta, foco e salvamento; a leitura explica futuro do presente, mesóclise e grafia normativa; a marca oferece contato do dev, contato institucional, código e canais essenciais.

**Veredito:** melhoria funcional e editorial aprovada em Chromium e Firefox, sem alteração do JSON autoral, das bases linguísticas ou das cinco engines.

## C — Cenário observado

As capturas fornecidas pela pessoa mostraram:

1. toolbar alta, quebrada em duas linhas;
2. cartão lexical incapaz de responder qual é o tempo verbal de `varre-lo-ei`;
3. faixa superior ocupada por `Caderno`, `Fundação` e `Página`, com baixa utilidade imediata;
4. assinatura `MOTOR TIPTAP // FUNDAÇÃO 01` exposta na interface principal;
5. toolbar desaparecendo quando o manuscrito era rolado.

A auditoria inicial foi registrada em:

- `2026-07-30-observacoes-02-03-densidade-e-leitura-verbal.md`.

O histórico de tentativas, falhas e decisões está em:

- `2026-07-30-observacoes-02-03-breadcrumbs.md`.

## L — Limite e impacto

### Toolbar

- consumia altura útil do papel;
- aumentava a distância entre intenção e formatação;
- desaparecia durante escrita longa;
- a implementação sticky dentro da folha paginada variava entre Chromium e Firefox.

### Leitura lexical

- classificava a forma como verbo flexionado;
- não informava tempo verbal, colocação pronominal, formação nem equivalência cotidiana;
- podia deixar a impressão incorreta de que `varre-lo-ei` era a grafia normativa.

### Faixa superior

- utilizava quatro células nobres para informações majoritariamente estáticas;
- não mostrava progresso, meta nem sessão de foco;
- não ajudava a pessoa a decidir o próximo gesto de escrita.

### Identidade

- misturava documentação técnica e interface autoral;
- não oferecia contato direto com o desenvolvedor ou a marca.

## A — Arquitetura e ação escolhidas

### 1. Toolbar compacta

- todas as ações foram preservadas;
- rótulos visuais foram condensados;
- nomes acessíveis históricos foram mantidos;
- os controles ocupam uma linha em `1366×768` e `1440×560`;
- em larguras menores existe overflow horizontal local e acessível, nunca overflow global.

### 2. Dock cross-browser

A tentativa de usar `position: sticky` dentro de `.paper` foi rejeitada após prova real:

- Chromium respeitava o padding do papel e deixava uma faixa vazia;
- Firefox levava a toolbar junto com o documento.

A solução final usa `EditorToolbarDock`:

- a toolbar permanece inline na posição original enquanto visível;
- ao cruzar o topo do `.editor-shell`, a mesma instância React passa para um portal fixo;
- o dock mede o slot e o viewport para preservar largura e alinhamento;
- o slot original mantém a altura do fluxo, evitando salto;
- a janela não rola;
- drawers móveis permanecem acima do dock;
- ao voltar ao início, a toolbar retorna ao ponto original.

Não existem duas toolbars, dois editores ou cópia de estado.

### 3. Painel operacional da sessão

A faixa superior passou a apresentar:

- contagem viva de palavras;
- meta editável de palavras;
- progresso da meta;
- timer de foco de 25 minutos, com iniciar, pausar e reiniciar;
- estado de salvamento `Última tinta`.

Contratos de privacidade e autoria:

- palavras são calculadas a partir do snapshot vivo do Tiptap;
- meta fica no `localStorage` do navegador;
- timer existe somente na sessão;
- nenhum desses dados entra no JSON autoral;
- nenhuma chamada de rede foi adicionada.

### 4. Suplemento verbal curado

Para `varre-lo-ei` e `varrê-lo-ei`, o painel informa:

- **futuro do presente do indicativo**;
- **mesóclise**;
- futuro sem pronome: `varrerei`;
- decomposição didática: `varrer + o + ei`;
- forma normativa: `varrê-lo-ei`;
- ajuste ortográfico com perda do `-r`, transformação de `o` em `-lo` e acento;
- equivalências: `eu o varrerei` e `eu vou varrê-lo`.

A consulta sem acento continua aceita e recebe nota normativa. O manuscrito não é substituído.

O suplemento é separado da engine legada e não altera bases linguísticas.

### 5. Contato e canais

A assinatura técnica foi retirada da área principal. Entraram canais verificados na documentação da marca:

- dev: `rafamass@proton.me`;
- Escrevaral: `oi@escrevaral.com`;
- código: `rfmss/escrevaral`;
- Instagram: `@escrevaral`;
- X: `@rafamass`.

Detalhes de fundação permanecem no GitHub.

## R — Resultado reproduzível

### Banca dedicada

Arquivo:

- `tests/m1-density-lexical.spec.ts`.

Sete cenários por navegador:

1. toolbar em uma linha em `1366×768`;
2. toolbar em uma linha em `1440×560`;
3. dock acompanha rolagem sem mover a janela;
4. topo mostra palavras, meta, foco e salvamento;
5. dashboard cabe em `390×640` sem overflow global;
6. `varre-lo-ei` recebe explicação verbal completa;
7. contato e canais essenciais substituem a assinatura técnica.

### Não regressões relevantes

A matriz também preservou:

- paginação e rolagem isolada;
- seleção, `Ctrl+A`, undo e redo;
- exportações TXT, Markdown e HTML;
- Revisão, Voz, Contexto, RimaLab e Palavras;
- navegação por teclado;
- drawer móvel e lateral direita;
- temas papel e noite;
- persistência, recuperação e conflito entre abas.

### Cabeça funcional aprovada

`f7c2db1b0bd2add3203ccd5df9fd40098148bed5`

- Mass Notes `30554065748`;
- job `90909962104`;
- **338/338** execuções aprovadas — 169 por navegador;
- publicação, cache e smoke público aprovados;
- Argila `30554065055` aprovada;
- coerência `30554064983` aprovada;
- artefato `mass-notes-tiptap-30554065748`;
- artifact ID `8764292452`;
- digest `sha256:ba26efe9860fcf0d055b9e9f875f5c017967f858bc0c7a6048fff7ba7c6e9718`.

### Evidência visual revisada

No artefato aprovado:

- `mass-notes-next-desktop.png`: topo operacional e toolbar em uma linha;
- `mass-notes-next-mobile.png`: dashboard em duas linhas e papel sem overflow global;
- `obs01-after-1440x560-chromium.png`: toolbar colada sob o cabeçalho durante rolagem profunda.

A revisão visual confirmou:

- hierarquia superior mais útil;
- ganho de altura no manuscrito;
- alinhamento da toolbar com o conteúdo do papel;
- contatos discretos, sem transformar a biblioteca em área promocional;
- nenhuma sobreposição entre dock, laterais e cabeçalho.

## O — O que permanece aberto

### Suplemento verbal

- é curado para a forma aprovada;
- não promete analisar automaticamente toda mesóclise do português;
- uma generalização futura exige corpus, regras e banca editorial próprios.

### Meta e foco

- a meta é local ao navegador e não sincroniza entre dispositivos;
- o timer não possui histórico, ciclos longos, notificações ou estatísticas;
- não é um sistema completo de produtividade.

### Toolbar

- em telas estreitas, a linha pode ser percorrida horizontalmente;
- um menu adaptativo só será considerado se QA humano provar dificuldade real;
- o dock usa portal fixo limitado ao viewport porque sticky dentro da folha não foi confiável entre motores.

### Contatos

- a interface mostra um recorte essencial;
- a lista integral de redes e políticas permanece na documentação institucional.

### Próximos passos sem bifurcação

1. QA humano guiado pelo template CLARO na preview publicada;
2. observar compreensão dos novos símbolos da toolbar;
3. avaliar se a meta padrão de 1.000 palavras é adequada;
4. somente depois decidir uma tranche geral de áreas nobres;
5. retomar integridade lexical E2 e banca humana E3 sem abandonar os registros atuais.

## Promoção

Esta intervenção não autoriza:

- merge;
- promoção para `main`;
- Gate 14;
- substituição do produto público;
- declaração de paridade integral com Word.
