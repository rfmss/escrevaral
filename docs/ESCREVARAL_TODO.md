# Escrevaral — TODO acumulado de entrega

> Fonte de verdade operacional da branch `feat/escrevaral-paper-home`.
> Atualizar ao fechar ou abrir cada bloco. Não apagar histórico útil; mover itens concluídos para a seção correspondente.
>
> **Checkpoint técnico verde:** `ac18cc3015219e2beba4d763d5d227554427fa44` — workflow `32325175646` — 127/127, build, offline/PWA, preview e smoke público verdes no mesmo SHA.
> O checkpoint também incorpora a estabilização dos flakes de escrita do Gate 30 e de seleção lexical do Gate 10 sem alterar as engines correspondentes.
> Commits documentais posteriores não invalidam esse checkpoint enquanto não alterarem produto, testes ou workflow.

## P0 — bloqueadores de entrega

- [x] Centralizar o shell canônico no desktop sem alterar o contrato móvel.
- [x] Criar Gate 22 para 1366 / 1440 / 1920 px: margens simétricas e sem overflow horizontal.
- [x] Corrigir bancas fossilizadas que ainda exigiam `Notas` desabilitado, `MODO` estático, `SINCRONIZADO` e margem 12/20.
- [x] Executar o workflow consolidado no head técnico aprovado e obter build + Playwright verdes.
- [x] Confirmar que `preview-escrevaral-paper-home` foi publicada a partir do MESMO SHA aprovado.
- [x] Corrigir somente os testes/vermelhos reais encontrados pela banca consolidada.
- [x] Smoke de entrega reproduzível: Gate 31 cobre escrever → persistir/reabrir → revisar → consultar → exportar no mesmo documento.
- [x] Banca visual reproduzível: Gate 32 mede 1366, 1440, 1920 e 390 px e publica quatro PNGs de prova.
- [x] Passe final de proporção geométrica: Gate 22 + `reference-home.spec.ts` + Gate 32 cobrem centralização, três planos, alturas estruturais, largura útil e contenção móvel.
- [x] Congelar features durante o fechamento e aceitar apenas correções de entrega.

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
- [x] Validar Gate 25 de exportação avançada no mesmo head publicado.
- [ ] Exportação RTF da `main`: depende do contrato de página/escopo e deve ser transplantada em bloco próprio.
- [ ] Exportação de acervo como vault Obsidian `.zip`: depende de seleção/escopo da biblioteca e deve ser transplantada em bloco próprio.
- [x] Validar a tranche funcional inteira no workflow atual antes de declará-la verde.

## Paridade fina / microcomportamentos

- [x] Meta diária: restaurar celebração com confete ao cruzar a meta uma única vez.
- [x] Meta diária: respeitar `prefers-reduced-motion` sem perder o evento lógico de meta atingida.
- [x] Salvamento: trocar o rótulo enganoso `SINCRONIZADO` por `SALVO LOCALMENTE`.
- [x] Primeiro uso: restaurar aviso único “Texto salvo aqui, neste navegador. Sem internet, sem nuvem.”.
- [x] Validar Gates 23–24 no mesmo head publicado.
- [x] Pomodoro real da `main`: 25 min, iniciar/pausar/resetar, histórico local compatível, toast e celebração ao concluir.
- [x] Validar Gate 26 do temporizador no mesmo head publicado.
- [x] Modo Leitor real da `main`: slot `MODO` reativado, leitura limpa, estrutura Tiptap, autoscroll, 4 ritmos, 4 tamanhos, régua, Escape/foco e aviso para página vazia.
- [x] Validar Gate 27 do Leitor no mesmo head publicado.
- [x] Auditar player de sons ambiente da `main`: função real confirmada, mas as quatro faixas usam CDN remoto do Pixabay.
- [ ] Sons ambiente: só transplantar depois de obter arquivos locais com licença/proveniência; não usar URLs remotas na casa offline.
- [x] Prova de Autoria: restaurar feedback transitório “Sinais de autoria guardados aqui” no primeiro evento.
- [x] Prova de Autoria: restaurar indicador compacto de integridade após 50 palavras, usando o `ProofSummary.integrity` real no bloco ESTADO LOCAL.
- [x] Validar Gate 28 do indicador compacto de autoria no mesmo head publicado.
- [x] Auditar UX offline/PWA: Gate 29 cobre instalação/cache, recuperação, lembrete e registro de cópia sem duplicar `BackupPanel`.
- [x] Auditar atalhos e feedbacks transitórios reais: `Ctrl/Cmd+S`, `Ctrl/Cmd+N`, `Ctrl/Cmd+K`, `Alt+F` e `Escape`; undo/redo pertence ao Tiptap, não ao ring buffer legado de páginas.

## Calibração linguística

- [x] C0 — protocolo de calibração, hierarquia de fontes e matriz de cobertura.
- [x] C1 — pontuação estrutural: não separar vínculos sintáticos essenciais.
- [x] C2 — impessoalidade: haver/fazer; preservar `ter` existencial como questão de registro.
- [x] C3 — sinônimo como candidato contextual, com matiz/registro quando defensável.
- [x] C4 — mapa de coesão observável; não fingir score de coerência.
- [x] Procedência lexical: app nova desconectada do `js/data/synonym-data.js` derivado.
- [x] C5 — crase de alta confiança: impossibilidades objetivas.
- [x] Validar Gates 16–21 no mesmo head publicado.
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
- [x] Conferir centralização real após publicação do head técnico aprovado.
- [x] Revisar largura útil do manuscrito em 1366 e 1440 px.
- [x] Revisar excesso de largura/espaço vazio em 1920 px.
- [x] Revisar drawer/rail e manuscrito em 390 px: overflow, scroll, hierarquia e acesso à exportação.
- [x] Revisar alinhamentos de topbar, statusbar e divisórias verticais via geometria canônica.
- [x] Eliminar controles puramente cenográficos; `reference-source-integrity.spec.ts` impede reintrodução no DOM canônico.

## Arquitetura / manutenção

- [x] Montar matriz exata de duplicações antes de criar `text-utils.ts`: `countWords()` é equivalente entre `App.tsx` e `domain/document.ts`; normalização/tokenização das engines não é.
- [x] Só extrair utilitário quando implementação, contrato e Unicode forem equivalentes; decisão atual: não criar `text-utils.ts` genérico.
- [ ] Remover a duplicação local de `countWords()` de `App.tsx` usando `domain/document.ts`.
- [ ] Auditar/reduzir bridges restantes; primeiro débito comprovado: `WritingIntegrityBridge.tsx` usa polling de DOM a cada 250 ms e seletores estruturais frágeis.
- [x] Manter engines pesadas lazy; não fragmentar bundle apenas para silenciar warning do Vite.
- [x] Atualizar PR/handoff com o checkpoint verde e as pendências reais.

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
