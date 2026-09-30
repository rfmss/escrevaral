# Continuidade do Escrevaral

Este arquivo orienta IAs que trabalham neste repositório. Instruções atuais do usuário prevalecem sobre este guia. Não substitua decisões explícitas por pressupostos.

## Leia antes de alterar

1. `docs/PLANO-MESTRE.md`: ponto de entrada completo, decisões, sequência e procedimento para conferir evolução na main.
2. `docs/JORNADA-LINGUISTICA.md`: visão, etapas e critérios.
3. `docs/jornada/estado.json`: estado atual e fonte da página pública `/jornada/`.
4. `docs/jornada/CONTRATO-ANALISE.md`: manuscrito imutável e comportamento da cortina.
5. `docs/jornada/PASSAGEM-DE-TRABALHO.md`: registro obrigatório de uma entrega.
6. `ptbr/README.md` e documentos pertinentes à tarefa. Confira o código real e a HEAD remota; documentação histórica pode descrever uma versão anterior.

## Decisões do autor

- A base de trabalho é `rfmss/escrevaral`, branch `main`. Não crie outra branch por rotina quando a orientação vigente é trabalhar apenas na main.
- O editor pertence ao autor. Nenhuma lente, sugestão, análise, botão de resultado ou motor pode substituir, corrigir, completar ou apagar seu texto. Selecionar um trecho não é editar.
- O botão Escrevaral liga/desliga a área de análise. Essa interface está especificada na jornada; não a anuncie como implementada antes da integração real.
- Uma análise completa por vez, sempre por escolha explícita do escritor. A direção de 27/09/2026 permite preparação leve incremental nas pausas, ainda não implementada; consultar o contrato de pacotes. Ligar apenas abre opções; não inicia varredura geral. Trocar de lente cancela a anterior; não executar fila de outras lentes nem reanálise automática durante a escrita. Receber resultados nunca autoriza modificar o editor.
- Desde v6-23, o painel publicado executa uma lente por escolha, sem triagem automática. A apresentação final do controle Escrevaral permanece pendente. A preparação incremental agora planejada não está ativa; testes visuais não são requisito.
- O usuário recebe trechos exatos, explicações e limites na mesma área. Qualquer sugestão de lente permanece opcional; acesso manual preservado.
- Não use o exemplo anotado em `/jornada/` como se fosse um detector geral. Não conclua subordinação pela presença de `que`.
- Não apresente uma leitura estilística como erro nem crie notas de qualidade, intenção ou complexidade sem fundamento e validação.

## Como executar uma etapa

Identifique o ID da etapa, a mudança esperada e a dependência ainda faltante. Separe referência lida, regra formulada, implementação, teste, integração e publicação. Não transforme esses estados em uma única marca de “feito”.

Os oito primeiros arquivos estão catalogados em `docs/jornada/fontes.json`, com hashes e intervalos realmente inspecionados; leitura integral ainda não concluída. Não confunda os dois manuais da Folha. Confira OCR, escopo editorial e época; traduções de ensaios sobre inglês não definem gramática PTBR.

Estude livros pelo procedimento em `docs/jornada/COMO-ESTUDAR.md`. Cite obra/edição/página realmente consultadas. Não invente conteúdo de anexos indisponíveis nem afirme treinamento permanente do modelo. O conhecimento durável está nos registros, corpus, regras e testes versionados.

Antes de editar, confira o estado de trabalho e preserve mudanças concorrentes. Prefira módulos e patches pequenos. Não reintroduza HTML antigo. Não altere recepção, cadernos, navegação, armazenamento, exportação ou PWA por conveniência de uma tarefa linguística.

Teste o risco real: posições no original, texto intacto, falsos positivos, negativos, ambiguidades, cancelamento, IME e troca de folha. Não exigir nem executar por rotina teste visual ou em KitKat/iPad; a época orienta escolhas de código. Não reexecute suites alheias sem motivo concreto.

Antes de publicar, confirme a autorização vigente, a HEAD, o diff e as verificações pertinentes. Autorizações já dadas continuam válidas dentro de seu escopo; não peça repetidamente. Nunca force a atualização da main nem contorne permissões ou requisitos do repositório. Se houver concorrência, reaplique o lote sobre a nova base e valide o que mudou.

## Ao concluir

Atualize `docs/jornada/estado.json` se a capacidade ou etapa mudou, registre evidência e rode `python3 ferramentas/gerar-jornada.py`. O HTML e o mapa Markdown são gerados; altere a fonte, não suas cópias. Não marque uma etapa publicada até confirmar o commit e a publicação. Mantenha as lacunas visíveis. Use o modelo de passagem de trabalho e termine com uma próxima ação concreta.

O mapa é documentação de produto; sua publicação não publica automaticamente motores ou funcionalidades planejadas. Nenhum estudo exige enviar manuscritos ou livros a serviços externos. Dependências online ou modelos remotos exigem decisão específica e informação clara ao autor.

## Decisão de publicação — 26/09/2026

Rafael autorizou expressamente publicar os incrementos atuais na main para testá-los, seguir o próximo passo e concentrar a auditoria ampla em etapa posterior (decisão histórica; a exigência de aparelhos/visual foi retirada em 27/09/2026). A ausência de QA completo em navegador não bloqueia por si só esses pushes autorizados. Manter as verificações essenciais de integridade, registrar pendências e nunca apresentar publicação como aprovação da auditoria. Essa decisão atual prevalece sobre os gates históricos de navegador descritos nos relatórios anteriores.

## Arquitetura a partir de v6-25

- Não editar `index.html`, `escrevaral.html`, `service-worker.js` ou `assets/` manualmente. São distribuições geradas por `npm run build`; fontes e ordem em `src/`, `packages/`, `resources/`, `ptbr/` e `build/modules.json`.
- Leia `README.md`, `docs/ARQUITETURA.md` e `docs/CONECTORES.md`. O HTML único é exclusivamente a distribuição portátil.
- O cofre puro não pode depender de DOM, localStorage, cadernos ou rede. Adaptadores experimentais não entram automaticamente na montagem do site.
- Antes do push: `npm run build:check` e verificações essenciais pertinentes. O CI da main confere montagem, contratos e regressões. Teste visual ou em aparelhos não é gate de publicação, conforme decisão vigente.
- Referências externas precisam de commit, hashes, licença e cobertura. Não confundir snapshot ou teste de transporte com instalação, inferência ou validação de um modelo.

## Filosofia e progresso — decisão de 27/09/2026

Leia `docs/FILOSOFIA-E-COMPATIBILIDADE.md` e a árvore no Plano Mestre. Priorize o piso KitKat/iPad de 2012 antes de aumentar requisitos. Não prometa compatibilidade só porque o JavaScript passa em ES5; confira navegador, CSS, APIs, armazenamento e custo.

Mantenha `docs/jornada/plano-voo.json` com IDs, TODO/DONE, evidências e critério; regenere com `python3 ferramentas/gerar-plano-voo.py`. Cada entrega mostra árvore curta por ramo e a linha: `Plano vN: X/Y DONE | entrega +Z (IDs) | próximo ID | publicação: SHA/estado | limite: pendência`. Conte marcos, nunca porcentagem da língua ou do esforço. A avaliação ampla continua separada; não repetir testes sem risco concreto.

## Decisão vigente — referência de época, sem homologação (27/09/2026)

KitKat e iPad de 2012 orientam a economia de recursos e as escolhas conservadoras; **não são aparelhos a testar**. Rafael dispensou testes nesses dispositivos e teste visual antes da publicação. Não recriar essa exigência como pendência, gate ou pedido de autorização. Publicar incrementos aprovados com verificações essenciais de integridade e ajustar a experiência conforme o retorno do autor. Não declarar uma certificação de compatibilidade que não foi realizada. Esta decisão substitui instruções históricas sobre homologação de aparelhos e auditoria visual obrigatória.

## Coordenação ASTRA 1 / ASTRA 2 — 27/09/2026

Leia `docs/CONTRATO-PACOTES-LINGUISTICOS.md`. Rafael admite acervo grande em disco, inclusive próximo de 1 GB, sob limites independentes de memória, inicialização e trabalho. Preparação leve nas pausas passa a ser planejada, sem fila de lentes completas; suspender na digitação, IME, página oculta e análise desligada. Não ativar antes dos contratos e verificações. Prazo de calendário retirado; entregas delimitadas.

ASTRA 1 integra/publica e cuida de produto, C04, instalação/persistência/offline, interface e contratos de produção. ASTRA 2 trabalha a primeira prova em `packages/experiments/lexical-index/` e comparação em `docs/recursos/`, sem alterar manifestos, bundles ou main. Mudanças em arquivos existentes do cofre/motores exigem delimitação entre as frentes. Este arranjo substitui a decisão anterior de concentrar todas as tarefas no assistente principal; não cria autorização para outros agentes publicarem na main.

Em 28/09/2026 A1 revisou a primeira prova da A2 no PR #188, SHA `1ae834f`, para incorporação isolada. Leia `docs/recursos/REVISAO-A1-A01-2026-09-28.md` e consulte o head/estado do PR #188 (`a2/a01-lexical-index-20260928`) antes de dizer que a A2 não entregou. A main contém apenas lotes já integrados; a paginação segue com A2. Não integrar automaticamente versões posteriores do draft nem adicionar o experimento ao bundle sem revisão.

## Comunicação econômica — 28/09/2026

Rafael pediu concentrar os detalhes nos documentos do repositório e reduzir muito a conversa. Manter plano, árvore, delta, decisões, evidências e pendências completos no repo. No chat, retornar poucas linhas com entrega/publicação e próximo passo; não repetir tabela ou plano inteiro por rotina. “Continue”, “segue” e “limite voltou” mantêm a execução autônoma dentro da autorização vigente. Atualizações de andamento devem ser curtas e necessárias.

## Coordenação vigente — transferência para A2, 28/09/2026

Rafael transferiu a continuidade do projeto para esta frente: “vou passar a bola pra vc, consegue retomar o projeto?”. A2 assume coordenação, integração e publicação na main dentro do plano aprovado, sem depender de resposta do A1. Esta decisão substitui a exclusividade de integração do A1 e a restrição anterior de A2 a dois diretórios. Não autoriza trabalho concorrente irrestrito: qualquer retorno de A1 deve começar por conferir a main e a [passagem de retomada](docs/jornada/RETOMADA-A2-2026-09-28.md), antes de editar os mesmos arquivos.

A transferência preserva as decisões de produto, o cofre síncrono, os limites de recursos, o manuscrito imutável e as verificações essenciais. Não implica ativar experimentos no aplicativo. A02 é o próximo marco; A03 e novas integrações linguísticas dependem dos contratos e evidências anteriores.

## Prioridade vigente — motores no editor, 29/09/2026

Rafael aprovou acelerar por entregas completas pequenas de linguagem, com verificações essenciais e avaliação ampla ao final. M01 passa à frente da instalação sofisticada A02; a frase histórica “novas integrações dependem de A02” deixa de bloquear recortes pequenos incorporados. M01a/v6-33: consulta lexical real OWN-PT no editor, fonte/licença e lacunas explícitas. Continuar por flexões/lemas e cobertura útil; não voltar à infraestrutura automaticamente. Manter autoria, custos limitados e análise explícita. Atualizar o plano a cada entrega, sem declarar M01 inteiro concluído por um recorte.

Em 30/09, v6-34/M01-flexoes-1 integrou 3.009 formas PortiLexicon à consulta lexical, com lemas/traços e homógrafos preservados. Fonte e decisão de licença em `docs/jornada/ENTREGA-V6-34.md`. Não repetir a integração das flexões: próximo M02, candidatos do léxico para a lente contextual existente, com abstenção. M01 geral continua parcial.

V6-35/M02-candidatos-1 liga o inventário real à lente Classes de palavras; `lexicalReadings()` ampliada é própria dessa lente, e `readings()` legada continua usada por sintaxe/relativas. Não propagar candidatos para essas lentes sem tarefa delimitada. Próximo M02: grupo nominal curto artigo + nome + adjetivo. Alterações de expectativas CTX-022/047 estão justificadas em `docs/jornada/ENTREGA-V6-35.md`.

V6-36/M02-nominal-1 acrescenta PTBR-CTX-006: artigo/nome/adjetivo nas duas ordens, traços explícitos e abstenção se ambas forem possíveis. Ausência de gênero no ADJ é declarada, não prova concordância. Próximo M02-complemento-1: delimitar complemento curto com de/do/da. Leia ENTREGA-V6-36 e estado.json para publicação; não repetir o recorte nominal.
