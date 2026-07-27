# Gate de navegador — Mass Notes experimental

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

## Regra de continuidade

A branch não avança para novas features enquanto este gate não estiver verde. Falha real não pode ser convertida em aviso ou teste removido para produzir falso positivo.
