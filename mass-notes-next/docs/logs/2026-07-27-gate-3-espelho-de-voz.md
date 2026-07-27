# Log — Gate 3: Espelho de Voz

Data: 2026-07-27
Estado: aprovado para continuidade experimental
Branch: `experiment/mass-notes-tiptap`
PR: `#155` (rascunho)

## Escopo confirmado

Integrar `voice-engine.js` ao Mass Notes Next por um adaptador tipado e uma aba própria no rail.

Não alterar:

- engine original;
- bases linguísticas;
- `main`;
- aplicação pública;
- service worker;
- editor Tiptap;
- schema do documento.

## Hipóteses validadas

1. A API pública da engine é `window.VeredaVoice.analyze(text, contexto?)`.
2. A engine devolve contagens, métricas, confiança, leitura da voz, forças, pontos cegos, público e exercícios.
3. Textos com menos de 200 palavras são apresentados como hipótese de baixa confiança.
4. O painel valida a arquitetura sem decorations inline.

## Implementação

- adaptador defensivo em `src/engines/voiceAdapter.ts`;
- carregamento raw de `voice-engine.js`;
- contrato TypeScript independente da resposta legada;
- aba `voz` no rail;
- execução apenas por ação explícita;
- confiança, gesto, métricas, forças, pontos cegos, exercícios, ecos, público e disclaimer;
- resultado apagado quando documento ou conteúdo muda;
- exceção da engine isolada do editor;
- estilos editoriais próprios, sem aparência clínica.

## Tentativa 1 — falha útil

- commit testado: `63489f1bf316643d377b14fa97adbb34fbbc7eea`;
- workflow: `30314492067`;
- build TypeScript/Vite: aprovado;
- Chromium: aprovado;
- Firefox: uma falha;
- preview: corretamente bloqueada.

### Falha reproduzida

No Firefox, a leitura aparecia e sumia durante as asserções. O autosave concluía após 650 ms, incrementava `document.revision` e acionava a invalidação da Voz, apesar de o conteúdo continuar idêntico.

Chromium ocultou o defeito por executar as asserções antes do autosave. O Firefox, mais lento, tornou a condição temporal visível.

### Decisão arquitetural

Revisão persistida não significa mudança semântica. Um resultado linguístico é identificado pelo documento e pelo conteúdo analisado. A revisão continua importante para persistência, mas não invalida uma leitura quando `plainText` permanece igual.

### Correção

- removida `document.revision` da dependência de invalidação;
- token de análise continua descartando resultado depois de edição ou troca de documento;
- correção-base: `0670c6a25f6f11bfc387b3d1fdd7f4263b55f530`.

## Tentativa 2 — núcleo verde

- workflow: `30314730130`;
- Chromium: aprovado;
- Firefox: aprovado;
- preview: publicada;
- cenário temporal do autosave: aprovado.

## Matriz final

A matriz foi ampliada antes da aprovação final:

1. documento vazio sem falso diagnóstico;
2. corpus curto com confiança baixa e ressalva;
3. corpus médio com leitura normalizada e métricas;
4. alteração do conteúdo invalida leitura antiga;
5. falha controlada da engine não quebra editor.

Somados aos dez cenários anteriores da fundação e do Gate 2, foram executados 15 cenários por navegador, totalizando 30 execuções em Chromium e Firefox.

## Execução final

- commit funcional: `0ce407aa609e144d23ae0e97df9d1592c5df7f42`;
- workflow: `30314881409`;
- dependências: aprovadas;
- TypeScript/Vite: aprovado;
- Chromium: aprovado;
- Firefox: aprovado;
- publicação da preview: aprovada;
- artefato: `mass-notes-tiptap-30314881409`;
- captura do Espelho de Voz gerada por navegador.

## Limites honestos

Ainda não foram testados:

- leitores de tela reais;
- teclado virtual real;
- corpus literário amplo para calibrar a utilidade editorial dos resultados;
- decorations inline;
- funcionamento offline em nova sessão.

## Decisão final

**Gate 3 aprovado para avaliação manual e continuidade experimental.**

O próximo gate não começa automaticamente. O mantenedor deve experimentar a linguagem e a utilidade do Espelho de Voz na preview. P0/P1 interrompem a sequência. Sem bloqueadores, o próximo lote proposto é o vocabulário decolonizador apresentado como “Termos que pedem contexto”.