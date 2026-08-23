# Gate 9B — cópia nativa e restauração não destrutiva

Data: 2026-07-28

## Objetivo

Fechar a saída completa dos dados do Mass Notes Next com um formato nativo versionado e uma restauração que nunca apaga nem substitui a biblioteca existente.

## Escopo entregue

- envelope `escrevaral.mass-notes-next.backup`, versão `1`;
- arquivo local `*.esc.json` com todos os documentos da biblioteca;
- inclusão do rascunho ativo mesmo antes do próximo autosave;
- preservação de JSON Tiptap, texto derivado, título, estado, tags, favorito, datas e revisão de origem;
- validação integral antes de qualquer escrita;
- rejeição de JSON inválido, schema desconhecido, versão futura, envelope vazio, documento incompleto e IDs duplicados;
- restauração transacional por `add`, sempre com novos UUIDs;
- títulos restaurados recebem o sufixo `— restaurado`;
- revisão local reinicia em zero e datas locais identificam a nova cópia;
- nenhuma engine, base linguística, documento existente ou branch de preview é alterada.

## Organização

```text
src/backup/nativeBackup.ts
src/components/BackupPanel.tsx
src/storage/documentRepository.ts
src/components/ExportPanel.tsx
tests/gate9b-native-backup.spec.ts
```

O envelope e a validação vivem em `src/backup/`. O IndexedDB conhece somente a operação de restauração de documentos já validados. A interface não replica regras de schema.

## Política de segurança

1. todo o arquivo é lido e validado antes da transação;
2. um erro em qualquer documento rejeita o envelope inteiro;
3. a restauração usa IDs novos, sem `put` sobre identidades importadas;
4. a biblioteca existente permanece disponível durante e depois do fluxo;
5. a página ativa não é trocada automaticamente;
6. a atualização da lista usa o mesmo `BroadcastChannel` já adotado para sincronização entre abas.

## Testes

Foram adicionados seis cenários por navegador:

- criação do envelope com toda a biblioteca e rascunho ativo;
- restauração de múltiplos documentos sem substituição;
- preservação de estrutura Tiptap e metadados;
- rejeição atômica de documento corrompido;
- rejeição de versão futura e IDs duplicados;
- uso no drawer móvel sem overflow.

A primeira execução terminou com 171 aprovações e uma falha temporal antiga do Gate 7 no Firefox. Os seis cenários do Gate 9B estavam verdes. A repetição integral do job concluiu com 172/172 execuções aprovadas.

## Evidência

- workflow: `30417329783`, segunda tentativa;
- matriz: 86 cenários por navegador, 172 execuções;
- build, Chromium, Firefox, publicação, renovação de cache e verificação pública: aprovados.

## Limitações honestas

- o leitor do `.esc` legado ainda não foi ligado ao novo envelope;
- não há criptografia ou senha no arquivo;
- não há seleção parcial de documentos;
- não há merge entre uma cópia e um documento existente;
- DOCX, RTF, ePub, Obsidian ZIP e sincronização continuam fora do gate.

## Próximo passo lógico

Com escrita, análise, exportação e preservação fechadas, o próximo gate de produto recomendado é Palavras/Léxico. Ele deve entrar por adaptador tipado e usar seleção explícita do editor, sem misturar sua implementação com backup ou exportação.
