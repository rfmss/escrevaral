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
6. limpar resultado quando documento ou conteúdo mudar;
7. testar vazio, corpus curto, resultado normal, falha e obsolescência;
8. executar Chromium e Firefox;
9. atualizar preview somente após gate verde;
10. completar este log com commits, workflows e limitações.

## Evidência prévia

A engine original expõe `analyze` e `analyzeComplete` em `window.VeredaVoice`. A leitura retorna uma ressalva explícita de que voz, público e ecos são hipóteses heurísticas, não diagnóstico definitivo.

## Implementação inicial

- adaptador defensivo criado em `src/engines/voiceAdapter.ts`;
- aba `voz` adicionada ao rail;
- interface apresenta confiança, gesto, métricas, forças, pontos cegos, exercícios, ecos, público e disclaimer;
- teste criado para vazio, baixa confiança e invalidação após edição;
- workflow passou a observar `voice-engine.js`.

## Tentativa 1

- commit testado: `63489f1bf316643d377b14fa97adbb34fbbc7eea`;
- workflow: `30314492067`;
- build TypeScript/Vite: aprovado;
- Chromium: aprovado;
- Firefox: uma falha;
- preview: corretamente bloqueada.

### Falha reproduzida

No Firefox, a leitura aparecia e sumia durante as asserções. O autosave concluía após 650 ms, incrementava `document.revision` e acionava a invalidação da Voz, apesar de o conteúdo continuar idêntico.

Chromium ocultou o defeito por executar as asserções antes do autosave. O Firefox, mais lento, tornou a condição visível.

### Decisão

Revisão persistida não significa mudança semântica. O resultado será invalidado somente quando `document.id` ou `plainText` mudar. A revisão continua importante para persistência, mas não faz parte da identidade do snapshot linguístico quando o texto é igual.

### Correção

- removida `document.revision` da dependência de invalidação;
- token de análise continua descartando qualquer resultado depois de edição ou troca de documento;
- correção registrada no commit `0670c6a25f6f11bfc387b3d1fdd7f4263b55f530`.

## Próxima execução

Repetir build e todos os cenários em Chromium e Firefox. Preview permanece bloqueada até gate verde.

## Decisão final

Pendente.