# Gate 3 — Espelho de Voz no Mass Notes Tiptap

## Situação

**Aprovado para avaliação manual e continuidade experimental em 2026-07-27.**

- branch: `experiment/mass-notes-tiptap`;
- pull request: `#155` (rascunho);
- commit funcional validado: `0ce407aa609e144d23ae0e97df9d1592c5df7f42`;
- workflow funcional: `30314881409`;
- preview: branch `preview-mass-notes-tiptap`;
- aplicação pública, `main`, service worker, engine e bases: não alterados.

Esta aprovação não autoriza merge, lançamento, mudança da arquitetura oficial ou inclusão da entrada experimental no cache público.

## Objetivo aprovado

Integrar `voice-engine.js` à nova shell por um adaptador tipado, preservando a engine original e apresentando sua leitura como hipótese editorial local.

## Superfície

A aba **Voz** apresenta:

- confiança da leitura;
- gesto predominante;
- descrição;
- variedade e densidade lexical;
- média de palavras por frase;
- forças percebidas;
- pontos para observar;
- exercícios;
- ecos literários;
- leitores possíveis;
- ressalva metodológica.

Não há decorations dentro do editor, substituição automática ou alteração do manuscrito.

## Matriz final

Além dos dez cenários dos Gates 1 e 2, o Gate 3 acrescentou cinco cenários:

1. documento vazio não produz falso diagnóstico;
2. corpus curto é identificado como baixa confiança;
3. corpus médio produz leitura normalizada e evidência visual;
4. edição invalida resultado anterior;
5. exceção controlada da engine não quebra o editor.

A matriz completa executou 15 cenários em Chromium e Firefox, totalizando 30 execuções de navegador.

## Incidente encontrado

Na primeira execução, o Firefox revelou que o resultado desaparecia depois do autosave. A causa era a invalidação baseada em `document.revision`: salvar o mesmo conteúdo avançava a revisão e era interpretado como mudança semântica.

Decisão consolidada:

> Uma leitura linguística é identificada pelo documento e pelo conteúdo analisado. O autosave do mesmo conteúdo não invalida o resultado.

A leitura continua sendo descartada quando o documento ou `plainText` muda.

## Contratos preservados

- `voice-engine.js` permanece intacta;
- carregamento acontece por adaptador;
- resposta legada é normalizada defensivamente;
- a engine não conhece React, Tiptap ou DOM;
- execução ocorre por ação explícita;
- nenhum texto é enviado para serviço externo;
- corpus curto recebe aviso de baixa estabilidade;
- voz, público e ecos são hipóteses, não diagnóstico.

## Evidências

- TypeScript/Vite: aprovado;
- Chromium: aprovado;
- Firefox: aprovado;
- falha controlada: aprovada;
- atualização da preview condicionada ao gate: aprovada;
- log detalhado: `mass-notes-next/docs/logs/2026-07-27-gate-3-espelho-de-voz.md`;
- memória operacional: `mass-notes-next/docs/`.

## Limites

Ainda não estão aprovados:

- calibração editorial com um corpus amplo de textos reais;
- leitores de tela reais;
- teclado virtual real;
- decorations inline;
- service worker e abertura offline em nova sessão;
- promoção para a aplicação pública.

## Próxima decisão

O mantenedor deve experimentar o Espelho de Voz na preview com textos reais. P0/P1 interrompem o avanço. Sem bloqueadores e mediante autorização explícita, o próximo gate proposto é o vocabulário decolonizador apresentado como **Termos que pedem contexto**, sem acusação e sem substituição automática.