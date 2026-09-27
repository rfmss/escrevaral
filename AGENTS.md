# Continuidade do Escrevaral

Este arquivo orienta IAs que trabalham neste repositório. Instruções atuais do usuário prevalecem sobre este guia. Não substitua decisões explícitas por pressupostos.

## Leia antes de alterar

1. `docs/JORNADA-LINGUISTICA.md`: visão, etapas e critérios.
2. `docs/jornada/estado.json`: estado atual e fonte da página pública `/jornada/`.
3. `docs/jornada/CONTRATO-ANALISE.md`: manuscrito imutável e comportamento da cortina.
4. `docs/jornada/PASSAGEM-DE-TRABALHO.md`: registro obrigatório de uma entrega.
5. `ptbr/README.md` e documentos pertinentes à tarefa. Confira o código real e a HEAD remota; documentação histórica pode descrever uma versão anterior.

## Decisões do autor

- A base de trabalho é `rfmss/escrevaral`, branch `main`. Não crie outra branch por rotina quando a orientação vigente é trabalhar apenas na main.
- O editor pertence ao autor. Nenhuma lente, sugestão, análise, botão de resultado ou motor pode substituir, corrigir, completar ou apagar seu texto. Selecionar um trecho não é editar.
- O botão Escrevaral liga/desliga a área de análise. Essa interface está especificada na jornada; não a anuncie como implementada antes da integração real.
- Uma análise por vez, sempre por escolha explícita do escritor. Ligar apenas abre opções; não inicia varredura geral. Trocar de lente cancela a anterior; não executar fila de outras lentes nem reanálise automática durante a escrita. Receber resultados nunca autoriza modificar o editor.
- Desde v6-23, o painel publicado executa uma lente por escolha, sem triagem automática. A apresentação final do controle Escrevaral e a auditoria ampla de navegador permanecem pendentes.
- O usuário recebe trechos exatos, explicações e limites na mesma área. Qualquer sugestão de lente permanece opcional; acesso manual preservado.
- Não use o exemplo anotado em `/jornada/` como se fosse um detector geral. Não conclua subordinação pela presença de `que`.
- Não apresente uma leitura estilística como erro nem crie notas de qualidade, intenção ou complexidade sem fundamento e validação.

## Como executar uma etapa

Identifique o ID da etapa, a mudança esperada e a dependência ainda faltante. Separe referência lida, regra formulada, implementação, teste, integração e publicação. Não transforme esses estados em uma única marca de “feito”.

Os oito primeiros arquivos estão catalogados em `docs/jornada/fontes.json`, com hashes e intervalos realmente inspecionados; leitura integral ainda não concluída. Não confunda os dois manuais da Folha. Confira OCR, escopo editorial e época; traduções de ensaios sobre inglês não definem gramática PTBR.

Estude livros pelo procedimento em `docs/jornada/COMO-ESTUDAR.md`. Cite obra/edição/página realmente consultadas. Não invente conteúdo de anexos indisponíveis nem afirme treinamento permanente do modelo. O conhecimento durável está nos registros, corpus, regras e testes versionados.

Antes de editar, confira o estado de trabalho e preserve mudanças concorrentes. Prefira módulos e patches pequenos. Não reintroduza HTML antigo. Não altere recepção, cadernos, navegação, armazenamento, exportação ou PWA por conveniência de uma tarefa linguística.

Teste o risco real: posições no original, texto intacto, falsos positivos, negativos, ambiguidades, cancelamento, IME e troca de folha. Teste navegadores/dispositivos conforme o alcance prometido; emulação não certifica aparelho físico. Não reexecute suites alheias sem motivo concreto.

Antes de publicar, confirme a autorização vigente, a HEAD, o diff e as verificações pertinentes. Autorizações já dadas continuam válidas dentro de seu escopo; não peça repetidamente. Nunca force a atualização da main nem contorne permissões ou requisitos do repositório. Se houver concorrência, reaplique o lote sobre a nova base e valide o que mudou.

## Ao concluir

Atualize `docs/jornada/estado.json` se a capacidade ou etapa mudou, registre evidência e rode `python3 ferramentas/gerar-jornada.py`. O HTML e o mapa Markdown são gerados; altere a fonte, não suas cópias. Não marque uma etapa publicada até confirmar o commit e a publicação. Mantenha as lacunas visíveis. Use o modelo de passagem de trabalho e termine com uma próxima ação concreta.

O mapa é documentação de produto; sua publicação não publica automaticamente motores ou funcionalidades planejadas. Nenhum estudo exige enviar manuscritos ou livros a serviços externos. Dependências online ou modelos remotos exigem decisão específica e informação clara ao autor.

## Decisão de publicação — 26/09/2026

Rafael autorizou expressamente publicar os incrementos atuais na main para testá-los, seguir o próximo passo e concentrar a auditoria ampla em etapa posterior. A ausência de QA completo em navegador não bloqueia por si só esses pushes autorizados. Manter as verificações essenciais de integridade, registrar pendências e nunca apresentar publicação como aprovação da auditoria. Essa decisão atual prevalece sobre os gates históricos de navegador descritos nos relatórios anteriores.
