# Log — Gate 3: Espelho de Voz

Data: 2026-07-27
Estado: em andamento
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

## Hipóteses

1. A API pública da engine é `window.VeredaVoice.analyze(text, contexto?)`.
2. A engine devolve contagens, métricas, confiança, leitura da voz, forças, pontos cegos, público e exercícios.
3. Textos com menos de 200 palavras devem ser apresentados como hipótese de baixa confiança.
4. O painel pode validar a arquitetura sem decorations inline.

## Riscos

- assumir campos fixos demais da resposta legada;
- exibir diagnóstico forte para corpus curto;
- deixar resultado antigo atravessar edição ou troca de documento;
- misturar estado da Revisão com estado da Voz;
- tornar o rail apertado em mobile;
- quebrar Firefox por carregamento de script clássico.

## Plano técnico

1. criar `src/engines/voiceAdapter.ts`;
2. carregar `voice-engine.js` por importação raw;
3. normalizar retorno em contrato TypeScript do produto;
4. adicionar aba `voz` ao rail;
5. executar somente por ação explícita;
6. limpar resultado quando documento/revisão/texto mudar;
7. testar vazio, corpus curto, resultado normal, falha e obsolescência;
8. executar Chromium e Firefox;
9. atualizar preview somente após gate verde;
10. completar este log com commits, workflows e limitações.

## Evidência prévia

A engine original expõe `analyze` e `analyzeComplete` em `window.VeredaVoice`. A leitura retorna uma ressalva explícita de que voz, público e ecos são hipóteses heurísticas, não diagnóstico definitivo.

## Registro de execução

A preencher durante o lote.

## Decisão final

Pendente.