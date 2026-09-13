# Escrevaral — memória operacional

Atualizado em 12/09/2026. Este é o mapa do estado atual, não um segundo histórico do projeto.

## Propósito e forma de trabalhar

Uma mesa de escrita e instrumentos linguísticos locais, exclusivos para o português brasileiro. O manuscrito fica no aparelho. A tecnologia deve atravessar gerações de hardware sem exigir da pessoa uma máquina recente para escrever.

Rafa Mass dirige produto e criação. O agente atua como parceiro de engenharia e direção técnica: investiga alternativas, recomenda, executa o escopo autorizado e procura os próprios erros. A experiência percebida e o custo real orientam a solução; quantidade de código, novidade da tecnologia e quantidade de testes não são metas.

## Ordem de leitura e autoridade

1. Instruções atuais do usuário e `AGENTS.md`: escopo e operação da sessão.
2. [Constituição](astra/CONSTITUICAO.md): princípios de produto, autoria e arquitetura; preservada literalmente.
3. [Filosofia de trabalho](astra/FILOSOFIA-DE-TRABALHO.md): colaboração, critérios técnicos e técnicas de percepção.
4. [Maturação linguística](astra/MATURACAO.md): comparação de branches, lentes, acionamento e evidências atuais.
5. [Handoff](astra/HANDOFF.md): continuidade e pendências. [Decisões](astra/DECISOES.md) e [Fase 2](astra/FASE2.md) guardam o histórico, identificado como tal.

Não exigir de Rafa que repita o contexto já registrado. Ler só o que muda a decisão em curso. Documentos antigos não anulam pedidos atuais; fatos de implementação e execução devem ser conferidos no código e nos registros.

## Onde está o produto

| Item | Estado |
| --- | --- |
| Repositório | `rfmss/escrevaral` |
| Branch de trabalho | `astra/escrevaral-master` |
| Entrada portátil | `astra/escrevaral.html` |
| Entrada modular | `astra/index.html` |
| Revisão online | https://escrevaral-review.rafamass975189.chatgpt.site |
| Fontes do Site de revisão nesta sessão | Cópia estática separada; o código canônico permanece nesta branch |
| Legado | Raiz antiga, `mass-notes-next/` e outras branches são material de referência; não constituem o runtime ativo |
| Última entrega de engines | `d0d5b16cafa41be42435689ef53f599fbf072e41`, antes desta atualização documental |

## Arquitetura e restrições

| Camada | Responsabilidade |
| --- | --- |
| `astra/conhecimento/` | Regras, listas, paradigmas, fontes e critérios declarativos |
| `astra/maquina/` | Algoritmos puros, contrato de Findings, triagem, orquestração e serviços locais |
| `astra/superficie/` | DOM, interação e apresentação; sem decisões linguísticas |
| `astra/oficina/` e `astra/testes/` | Construção, comparação, medições e regressões; não entram na execução do produto |

HTML/CSS/JavaScript clássico ES5; recursos locais; análise sem servidor, telemetria ou modelo. Uma lente por pedido, até 200 mil unidades UTF-16 e 100 achados, com limite declarado. O cofre não reescreve o manuscrito. Não introduzir framework, dependência pesada, APIs modernas obrigatórias ou etapa de build para a pessoa usar o arquivo pronto.

Não usar como requisito do runtime: módulos/imports modernos, `async/await`, `Promise`, `Map`, `Set`, propriedades Unicode/lookbehind em regex, `normalize`, `includes`, `at`, `Object.assign`, APIs recentes de arquivos ou Worker obrigatório. Recursos adicionais dependem de detecção real e alternativa compatível. Esta lista é uma política de base conservadora, não uma afirmação de que toda API citada falta em todos os dispositivos.

## Aparelhos e o que está comprovado

| Ambiente | Papel | Evidência |
| --- | --- | --- |
| iPad mini de 2012, MD531GP/A, iOS 9.3.5 | Alvo legado prioritário | Versão atual ainda sem validação física de abertura, edição, análise e preservação |
| Android KitKat | Alvo legado secundário | Sem validação física desta versão |
| Navegadores atuais | Também devem funcionar | Compatibilidade pretendida; a bateria de lógica não substitui verificação visual e interação |
| V8/Linux da oficina | Testes e medições locais | 486 verificações aprovadas, sintaxe ES5, equivalência portátil e cenários com rede/APIs modernas bloqueadas |

A data “2012” é uma referência de recursos, não uma certificação de versão. Compare APIs com o navegador efetivo e mantenha fallback. Não há meta numérica universal de RAM, bateria ou milissegundos aprovada; registre medidas reais e o ambiente, sem inventar orçamento.

Uma visita ao link não garante reabertura sem internet. O HTML portátil reúne os recursos, mas o visualizador de arquivos do dispositivo pode limitar JavaScript. Armazenamento local também pode ser limpo pelo navegador; mantenha exportação e cópia de segurança acessíveis.

## Estado funcional

SCRVRL OS abre numa área de trabalho com projetos/folhas e lembretes. Aplicativos ficam no menu Início; barra de tarefas e caminho clicável permanecem visíveis em todas as áreas, inclusive no foco. Há lixeira, restauração e exclusão definitiva com confirmação. Sessão reabre área, documento, seleção e rolagem no último estado gravado; busca global e retomada preservadas; abrir uma folha revela o editor existente. Projetos são agrupamentos por nome guardados nas próprias folhas, preservados nas cópias JSON e importações. Editor local com título e hora fixa de criação, navegação mês → dia → notas, busca por título e texto, importação aditiva e exportação. Superfície sage/nanquim no claro e grafite no escuro; Arial nos comandos, Oswald estática local nos títulos/réguas, Noto Serif no manuscrito e Courier Prime como opção local de escrita, destaque opcional por parágrafo, modo foco completo e linha ativa a 42% da altura útil. Impressão da folha em A4 limpa, separada do campo de edição; textura estática de papel e marcação reta das notas. Máquina antiga adiada, controle recolhido nesta rodada (código anterior preservado): máquina recortada em carimbo estático (PNG transparente de 12.938 bytes), folha ampliada, haste dirigida à posição de escrita e retorno ao inserir nova linha. Cursores personalizados adiados por pedido de Rafa.

Quinze lentes em quatro categorias visuais e sete famílias de desenvolvimento: Convenções, Gramática, Escolhas de escrita e Poesia. Crase, concordância de haver/existir/fazer, repetição próxima e ritmo foram acrescentados; a nova etapa inclui 50 formas em -mente e proporção de palavras em linhas com travessão; infinitivos ganharam contexto delimitado. Há 884 formas verbais exatas, 65 lemas para o recorte contextual, 1.447 expressões e 18 observações decoloniais. Contagem de entradas não significa cobertura integral ou revisão linguística independente.

O arquivo portátil após a rodada de papel, foco e impressão tem 704.984 bytes (entrega anterior de engines: 456.821). A bancada não representa tempo de WebKit, memória do iPad nem taxa geral de acerto linguístico. Medições e limites estão em `astra/MATURACAO.md`.

## Identidade compartilhada — 12/09/2026

A camada `superficie/identidade.css` aplica a linguagem Focus/Switch ao conjunto: papel técnico sage, tinta nítida, faces de cartão, títulos Oswald, filetes, seleção e foco de teclado consistentes. Textura estática de fibras apenas no desktop; sem filtro de ruído, 3D, timer adicional nem fonte remota. Contrato de hierarquia e integração futura na Filosofia. Anotação sem alça; lixeira como ícone acessível no cartão e ícone + texto em Início.

## Mesa editorial conectada — 12/09/2026

Anexo `escrevaral-eink.tar(1).gz` adaptado à base existente: título e data no cabeçalho; folhas à esquerda por projeto ou data; mesmo textarea ao centro; contagem descritiva e acesso explícito às lentes à direita. Fonte/tamanho (16–30 px), parágrafo, foco, baixar, imprimir, projeto e lixeira ligados aos controles existentes. Laterais recolhíveis em telas estreitas; teclado reduz o cabeçalho. Início fecha ao clicar/tocar fora ou navegar com foco para fora. Comandos de formatação rica, metas, contadores fictícios, versões e avaliações demonstrativas não entraram. Sem novas fontes, redes ou dependências. `maquina/contagem.js` faz contagem literal separada do DOM, atualizada ao guardar ou pedir; não dispara lentes. Testes simulados cobrem seleção, troca de projeto, busca global, tamanho e fechamento do menu; aparência em navegador e aparelho físico ainda pendentes.

## Fundação do Estúdio — 12/09/2026

[ESTUDIO.md](astra/ESTUDIO.md) consolida o desenho aprovado, contratos, checklist e divergências do protótipo/documento. Análises carregam identidade/revisão da folha, recorte, versões e posições no original. Projetos ainda se agrupam por nome; IDs estáveis e a migração das fichas/cenas estão especificados, não ativos. O Estúdio completo ainda não foi conectado.

Seleção copia para memória interna; recortar, colar internamente e analisar trecho são ações reais. Cópia para aplicativos externos é separada e tem alternativa nativa. Restrição de colagem externa é opção em Ajustes; não certifica origem humana. Backup inclui lembretes e lixeira. Sublinhado persistente, .scrvrl, formatos editoriais avançados e prova de autoria continuam pendentes.

## Retomada e atualização

- Conferir estado local/remoto e o escopo pedido. Preservar o que já foi feito.
- Resolver a menor decisão que destrava a experiência; comparar alternativas somente quando o custo ou a arquitetura justificarem.
- Implementar uma etapa concreta; testar o risco dessa etapa e os gates aplicáveis; parar a verificação quando houver evidência suficiente.
- Registrar escolha, custo, alternativa descartada, evidência e limitação no documento correspondente.
- Encerrar com um resultado utilizável e pendências precisas. O próximo agente deve distinguir concluído, medido, inferido e não testado.

Continuam pendentes: medição física; revisão linguística/bibliográfica independente; cobertura gramatical ampla e clíticos; Prova de autoria. Não converter essas pendências em promessa de implementação sem um próximo pedido definido.

## Utilitários e Seus textos — 12/09/2026

Janela “Seus textos” abre ampliada na primeira sessão, usa a área disponível entre menus e barra de tarefas, e conserva o tamanho escolhido nas sessões seguintes. Minimizar e duplo clique no cabeçalho recolhem para a tarefa; botões do cabeçalho não disparam esse gesto. Cada folha da lista tem lixeira discreta, independente do botão de abrir, com recuperação no Acervo.

Início recebeu os ícones ausentes e Pomodoro, Calculadora e Calendário. Pomodoro opcional 50/6 minutos (ajustáveis), pausa/retomada, estado local, um temporizador apenas enquanto ativo e visível; confere prazo absoluto ao retornar de suspensão. Ao fim da escrita, guarda antes de abrir Focus; aguarda composição e falha de gravação mantém o texto à vista. Focus adapta as plaquetas, ficha literária e papel do anexo em 2D, com fontes locais. Voltar ao texto, encerrar a pausa ou recomeçar pelo primeiro nome do autor são ações reais; não há punição por trocar de aba, segundo editor ou promessa de alarme com o navegador fechado.

Calendário adaptado do cronograma da main: mês/ano, dias, folhas reais, tarefas/notas locais, conclusão e remoção, datas e fases lunares identificadas como estimativas. Corrigida a mistura de DD-MM/MM-DD das datas fixas do legado. Chave vrda-planner e formato preservados; cópia JSON própria com importação aditiva. Armazenamento de escrevaral.com não é acessível automaticamente pelo domínio de revisão. Calculadora sem eval, com operações básicas, parênteses, vírgula decimal e porcentagem simples.

Verificação: 495 casos de lógica/DOM simulado passaram, incluindo término do Pomodoro, composição, suspensão, seleção, persistência do calendário e exclusão da nota correta; ES5 e equivalência portátil. Sem teste de renderização ou aparelho físico nesta rodada.


## QA de hierarquia e tecla Início — 13/09/2026

Início recebeu tecla frontal 2D com deslocamento de 3 px conforme aria-expanded, sem perspectiva, filtros ou temporizador. Menu agrupado em Escrever, Instrumentos e Acervo e sistema, mantendo os onze aplicativos. Clique no título de grupo conserva o menu; ação e Escape fecham.

Nova folha destacada junto ao título em telas largas; intervalos menores no retomar/lista, Ajustes, Acervo, Examinar e contagem. Contornos distinguem ações, lentes têm cabeçalhos próprios e margens compatíveis sem depender de flex-gap. Painéis do Gabinete em até 600 px deixam de usar margem negativa de centralização; barra de rolagem do inspetor voltou a aparecer. Preservado o espaço do manuscrito.

QA: 496 verificações funcionais/DOM simulado, ES5 e equivalência portátil aprovadas; IDs e relações ARIA conferidos. Comparações de seis pares de cores sólidas: textos acima de 4,5:1, bordas selecionadas acima de 3:1. Isso não certifica todo estado/composição. Inspeção das capturas fornecidas e CSS; sem renderização de navegador: a prévia supervisionada desta sessão não suporta este projeto estático. iPad físico e percepção final ainda pendentes. Não alterar arquitetura para contornar a limitação de QA.
