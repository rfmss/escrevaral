# Contrato de produto — M0.9 Candidata Integrada do Escrevaral

Data: 2026-07-29

Estado: em execução — duas tranches automatizadas concluídas

## Objetivo

Medir o Mass Notes Next como produto integrado antes de qualquer nova feature ou promoção.

## Perguntas de saída

O milestone emite respostas independentes para:

1. beta fechada;
2. lançamento público;
3. substituição do Escrevaral antigo.

## Regras

- auditar antes de corrigir;
- suspender novas features;
- manter PR em rascunho;
- manter `main` e aplicação pública intactas;
- não editar branch de preview;
- não enfraquecer teste para obter verde;
- corrigir somente P0 ou impedimento da medição;
- documentar decisão, achado e evidência quando mudam;
- repetir matriz completa após correção;
- nenhum texto autoral pode sair em requisição de rede;
- registrar SHA documental exato no PR após CI, sem commit autorreferente.

## Memória operacional

- executável: `mass-notes-next/docs/M0_9_AUDITORIA_OPERACIONAL.md`;
- relatório humano: `mass-notes-next/docs/audits/M0_9_AUDITORIA_GERAL.md`;
- relatório estruturado: `mass-notes-next/docs/audits/M0_9_AUDITORIA_GERAL.json`.

## Áreas obrigatórias

- editor e preservação;
- biblioteca;
- engines;
- UIX;
- acessibilidade;
- responsividade;
- importação e exportação;
- privacidade;
- desempenho;
- release;
- paridade com produto antigo.

## Severidade

- P0: perda/corrupção, exposição autoral, inutilização ou sobrescrita silenciosa;
- P1: fluxo principal quebrado, engine enganosa ou acessibilidade bloqueadora;
- P2: defeito relevante, inconsistência importante ou lacuna de paridade;
- P3: acabamento e melhoria não bloqueadora.

## Cobertura automatizada aprovada

Cabeça funcional da tranche 2: `2a4333337a04b73a6c034b8fd35bc582994a114b`.

Matriz:

- 119 cenários por navegador;
- 238 execuções;
- Chromium e Firefox.

Jornadas:

- escrita, metadados, autosave e recarga;
- cinco superfícies de engines em sequência sem mutação;
- sentinela autoral ausente de URL/corpo de requisição;
- filtros sem mutar revisão ou descartar página ativa;
- drawer em 320 e 390 px;
- 100 páginas e documento acima de 100 mil caracteres;
- conflito misto entre manuscrito e metadados preservando as duas versões;
- exportação do rascunho atual antes do autosave convergir;
- cópia nativa, restauração e `.esc` legado na mesma sessão.

Evidências:

- Mass Notes `30467582850`: 238/238, publicação, cache e smoke público;
- Argila `30467583011`: verde;
- coerência `30467584508`: verde;
- artefato `mass-notes-tiptap-30467582850`.

## Contratos transversais aprovados

### Conflito

- revisão remota mais nova abre conflito explícito;
- nenhuma versão é apagada silenciosamente;
- versão local pode virar cópia com UUID novo;
- documento remoto e cópia local permanecem no IndexedDB;
- metadados locais são preservados na cópia.

A preferência de documento ativo é compartilhada entre abas. Isso não é perda de dados, mas deve permanecer documentado até eventual gate próprio.

### Exportação

- usa o estado React/Tiptap atual;
- não depende de releitura do IndexedDB;
- inclui título e conteúdo ainda em `Alterado|Salvando`;
- não impede convergência posterior do autosave.

### Portabilidade combinada

- cópia nativa e importação legada mantêm parsers próprios;
- restauração cria novas cópias;
- prévia legada pode ser cancelada sem escrita;
- confirmação legada usa transação única;
- página ativa permanece aberta;
- nenhum documento existente é substituído;
- `legacySourceId` permanece auditável.

## Achados provisórios

P0: nenhum.

P1: nenhum.

P2:

- aplicação nova sem PWA/offline próprio;
- Prova de Autoria ausente;
- paridade de exportação incompleta.

P3:

- preferências da biblioteca não persistem;
- documento ativo é preferência compartilhada entre abas.

## Veredito provisório

- beta fechada: `SHIP COM CONDIÇÕES`;
- lançamento público: `NO-SHIP`;
- substituição integral: `NO-SHIP`.

Nota provisória: 87/100.

## Limite do veredito

As tranches automatizadas não encerram o milestone. Ainda são obrigatórios:

- auditoria heurística manual nas larguras definidas;
- zoom 200%, movimento reduzido, leitores de tela e dispositivos reais;
- observação integral de rede;
- recuperação emergencial integrada;
- sessão prolongada e medição de latência/memória;
- corpus ampliado por engine;
- decisões explícitas para P2;
- veredito final;
- CI na cabeça documental final sem commit posterior.

## Critério final

O M0.9 só encerra sem P0 aberto, com todo P1 decidido, matriz integral verde, preview pública válida, documentação sincronizada, veredito registrado e PR ainda em rascunho e não incorporado.
