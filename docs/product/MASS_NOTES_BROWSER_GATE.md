# Gate de navegador — Mass Notes experimental

## Situação

**Aprovado em 2026-07-27 no Chromium headless.**

- workflow: `Experimento Mass Notes`, execução 17;
- commit validado: `a2065f763dada3a17db053365de5972c29cad4f5`;
- 52 verificações aprovadas;
- 7 de 7 capacidades locais carregadas;
- zero falhas funcionais;
- zero erros de console;
- zero exceções de página;
- zero chamadas externas;
- zero overflow horizontal nos sete breakpoints.

O resultado aprova o scaffold para o próximo lote experimental. Não aprova promoção para `main`, integração ao service worker nem publicação.

## Objetivo

Validar a shell experimental em navegador real antes da inclusão de novas funcionalidades ou da integração ao service worker.

## Riscos cobertos

- persistência IndexedDB após recarregamento;
- alteração enquanto outra gravação está em andamento;
- snapshot emergencial em saída de página;
- migração preservativa de `vereda.manuscripts.v1`;
- colagem de HTML ativo e URL `javascript:`;
- formatação rich text;
- Tab saindo do editor;
- foco contido em drawers;
- retorno de foco ao acionador;
- saída do modo foco por Escape;
- descarte de análise pertencente a outro documento ou revisão;
- execução real de Revisão, Espelho de Voz e RimaLab;
- exportação TXT;
- ausência de chamadas externas;
- ausência de overflow horizontal em 1440, 1366, 1024, 820, 430, 390 e 320 px.

## Evidências

O workflow `.github/workflows/mass-notes-experiment.yml` executa:

1. auditoria estrutural;
2. validação sintática;
3. Chromium via Playwright;
4. geração de relatório JSON;
5. capturas desktop e mobile;
6. upload dos artefatos por 14 dias.

O artefato da execução aprovada contém:

- `mass-notes-mvp-artifacts/resultado.json`;
- `mass-notes-browser-artifacts/resultado.json`;
- `mass-notes-browser-artifacts/desktop.png`;
- `mass-notes-browser-artifacts/mobile.png`;
- `mass-notes-browser-artifacts/http-server.log`.

## Correções exigidas pelo gate

O ciclo de navegador encontrou e levou à correção de:

1. Tab preso no editor;
2. perda possível de edição concorrente com gravação em andamento;
3. falta de snapshot emergencial antes do IndexedDB concluir;
4. resultado de engine atravessando documento ou revisão;
5. HTML ativo entrando no DOM durante colagem;
6. foco sem contenção completa nos drawers;
7. contraste incorreto do botão principal no tema escuro;
8. placeholder incompatível com o parágrafo estrutural vazio;
9. título ausente na impressão;
10. paginação existente inacessível pelo adaptador devido ao binding lexical;
11. controles móveis cortados por largura interna maior que a viewport.

## Regra de continuidade

A branch pode avançar para o próximo lote de features experimentais, mas continua rascunho e não é candidata a incorporação direta.

A falha do gate global de versões permanece esperada enquanto os novos arquivos não forem promovidos à distribuição principal. A proteção global não deve ser enfraquecida nem a versão pública deve ser incrementada apenas para acomodar a bancada experimental.
