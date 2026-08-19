# Escrevaral — TODO acumulado de entrega

> Fonte de verdade operacional da branch `feat/escrevaral-paper-home`.
> Atualizar ao fechar ou abrir cada bloco. Não apagar histórico útil; mover itens concluídos para a seção correspondente.

## P0 — bloqueadores de entrega

- [x] Centralizar o shell canônico no desktop sem alterar o contrato móvel.
- [x] Criar Gate 22 para 1366 / 1440 / 1920 px: margens simétricas e sem overflow horizontal.
- [ ] Executar o workflow consolidado no head atual e obter build + Playwright verdes.
- [ ] Confirmar que `preview-escrevaral-paper-home` foi publicada a partir do MESMO SHA aprovado.
- [ ] Corrigir somente os testes/vermelhos reais encontrados pela banca consolidada.
- [ ] Smoke manual: escrever → autosave → fechar/reabrir → revisar → consultar ferramentas → exportar.
- [ ] Banca visual final em 1366, 1440, 1920 e 390 px.
- [ ] Passe final de proporção: left rail / manuscrito / analysis panel, ritmo vertical, densidade e simetria de paddings.
- [ ] Congelar features antes do release e aceitar apenas correções de entrega.

## Transplante funcional

- [x] Voice: contexto editorial + Temperatura/Campos.
- [x] RimaLab: som/classe + buscador + referência métrica + exportação.
- [x] Revisão: `analyzeDeep()` + `syntaxEngine` inicializada.
- [x] Contexto: detecção + vocabulário + alternativas + exportação.
- [x] Léxico: contexto + sinônimos + matiz; sem substituição automática.
- [x] Precision: guia/template persistente, separada da Revisão.
- [x] Proof/Autoria: cadência + sessões + hash em armazenamento isolado.
- [x] Oficina: entrada desktop real para o rail completo.
- [x] Exportação do documento ativo: DOCX offline, via motor legado carregado lazy.
- [x] Exportação do documento ativo: EPUB 3 offline, via motor legado carregado lazy.
- [x] Exportação do documento ativo: Markdown preparado para Obsidian.
- [ ] Validar Gate 25 de exportação avançada no mesmo head publicado.
- [ ] Exportação RTF da `main`: depende do contrato de página/escopo e deve ser transplantada em bloco próprio.
- [ ] Exportação de acervo como vault Obsidian `.zip`: depende de seleção/escopo da biblioteca e deve ser transplantada em bloco próprio.
- [ ] Validar a tranche funcional inteira no workflow atual antes de declará-la verde.

## Paridade fina / microcomportamentos

- [x] Meta diária: restaurar celebração com confete ao cruzar a meta uma única vez.
- [x] Meta diária: respeitar `prefers-reduced-motion` sem perder o evento lógico de meta atingida.
- [x] Salvamento: trocar o rótulo enganoso `SINCRONIZADO` por `SALVO LOCALMENTE`.
- [x] Primeiro uso: restaurar aviso único “Texto salvo aqui, neste navegador. Sem internet, sem nuvem.”.
- [ ] Validar Gates 23–24 no mesmo head publicado.
- [x] Pomodoro real da `main`: 25 min, iniciar/pausar/resetar, histórico local compatível, toast e celebração ao concluir.
- [ ] Validar Gate 26 do temporizador no mesmo head publicado.
- [x] Modo Leitor real da `main`: slot `MODO` reativado, leitura limpa, estrutura Tiptap, autoscroll, 4 ritmos, 4 tamanhos, régua, Escape/foco e aviso para página vazia.
- [ ] Validar Gate 27 do Leitor no mesmo head publicado.
- [ ] Auditar player de sons ambiente da `main` e restaurar apenas se o domínio continuar válido no produto novo.
- [ ] Auditar chip/feedback compacto da Prova de Autoria na topbar e marcos de escrita.
- [ ] Auditar UX offline/PWA: atualização disponível, recuperação e nudges de cópia de segurança sem duplicar `BackupPanel`.
- [ ] Auditar atalhos e feedbacks transitórios da `main` que tenham função real, não decoração.

## Calibração linguística

- [x] C0 — protocolo de calibração, hierarquia de fontes e matriz de cobertura.
- [x] C1 — pontuação estrutural: não separar vínculos sintáticos essenciais.
- [x] C2 — impessoalidade: haver/fazer; preservar `ter` existencial como questão de registro.
- [x] C3 — sinônimo como candidato contextual, com matiz/registro quando defensável.
- [x] C4 — mapa de coesão observável; não fingir score de coerência.
- [x] Procedência lexical: app nova desconectada do `js/data/synonym-data.js` derivado.
- [x] C5 — crase de alta confiança: impossibilidades objetivas.
- [ ] Validar Gates 16–21 no mesmo head publicado.
- [ ] C6 — regência/valência de alta confiança, somente após C0–C5 verdes.
- [ ] Expandir `curatedSynonymCorpus.ts` por compreensão das referências, sem transcrever verbetes.
- [ ] Ampliar corpus de contraexemplos para reduzir falsos positivos de sintaxe/pontuação.
- [ ] Cobertura de gêneros/templates: falta bibliografia específica antes de ampliar regras.
- [ ] Versificação/métrica: falta bibliografia específica antes de ampliar RimaLab por fonte.
- [ ] Manter norma consolidada, variação aceita e efeito estilístico como classes distintas.

## Visual / responsividade

- [x] Sete abas da Oficina em uma única faixa, sem linha órfã.
- [x] Corrigir assimetria do shell (`12px` à esquerda / `20px` à direita).
- [x] Exportação com seis formatos: altura limitada ao viewport e scroll interno, inclusive mobile.
- [ ] Conferir centralização real após publicação do head atual.
- [ ] Revisar largura útil do manuscrito em 1366 e 1440 px.
- [ ] Revisar excesso de largura/espaço vazio em 1920 px.
- [ ] Revisar drawer/rail em 390 px: overflow, scroll e hierarquia.
- [ ] Revisar alinhamentos de topbar, statusbar e divisórias verticais.
- [ ] Eliminar controles que ainda sejam puramente cenográficos.

## Arquitetura / manutenção

- [ ] Montar matriz exata de duplicações antes de criar `text-utils.ts` (`countWords`, segmentação, normalização etc.).
- [ ] Só extrair utilitário quando implementação, contrato e Unicode forem equivalentes.
- [ ] Auditar bridges restantes depois da paridade funcional e dos gates verdes.
- [ ] Manter engines pesadas lazy; não fragmentar bundle apenas para silenciar warning do Vite.
- [ ] Atualizar PR/handoff sempre que um bloco mudar de estado.

## Deliberadamente adiados — não bloqueiam esta entrega

- Projetos.
- Biblioteca documental de pesquisa.
- Histórico recuperável de versões.
- Distribuição narrativa.
- Controles tipográficos estruturais.
- Seletor de idioma sem contrato real.
- Integrações de rede opcionais para Prova de Autoria.

## Regra operacional

1. Corrigir P0 antes de adicionar nova feature; auditoria e registro de perdas podem continuar em paralelo.
2. Um bloco só vira `[x]` quando implementação e banca correspondente estão coerentes.
3. Código escrito sem CI/preview do mesmo SHA continua pendente de validação.
4. Cada relatório de andamento deve trazer o resumo deste TODO acumulado.
5. Paridade significa preservar capacidade real, não reproduzir layout ou ornamento da `main`.
