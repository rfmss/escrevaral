# Escrevaral — memória operacional

Atualizado em 10/09/2026. Este é o mapa do estado atual, não um segundo histórico do projeto.

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
| V8/Linux da oficina | Testes e medições locais | 459 verificações aprovadas, sintaxe ES5, equivalência portátil e cenários com rede/APIs modernas bloqueadas |

A data “2012” é uma referência de recursos, não uma certificação de versão. Compare APIs com o navegador efetivo e mantenha fallback. Não há meta numérica universal de RAM, bateria ou milissegundos aprovada; registre medidas reais e o ambiente, sem inventar orçamento.

Uma visita ao link não garante reabertura sem internet. O HTML portátil reúne os recursos, mas o visualizador de arquivos do dispositivo pode limitar JavaScript. Armazenamento local também pode ser limpo pelo navegador; mantenha exportação e cópia de segurança acessíveis.

## Estado funcional

Editor local com título e hora fixa de criação, navegação mês → dia → notas, busca por título e texto, importação aditiva e exportação. Superfície gesso/grafite em claro/escuro, fonte local de escrita, destaque opcional por parágrafo, modo foco completo e linha ativa a 42% da altura útil. Impressão da folha em A4 limpa, separada do campo de edição; textura estática de papel e marcação reta das notas. Modo opcional Máquina antiga: máquina recortada em carimbo estático (PNG transparente de 12.938 bytes), folha ampliada, haste dirigida à posição de escrita e retorno ao inserir nova linha. Cursores personalizados adiados por pedido de Rafa.

Treze lentes em quatro categorias: Convenções, Gramática, Escolhas de escrita e Poesia. Crase, concordância de haver/existir/fazer, repetição próxima e ritmo foram acrescentados; infinitivos ganharam contexto delimitado. Há 884 formas verbais exatas, 65 lemas para o recorte contextual, 1.447 expressões e 18 observações decoloniais. Contagem de entradas não significa cobertura integral ou revisão linguística independente.

O arquivo portátil após a rodada de papel, foco e impressão tem 490.130 bytes (entrega anterior de engines: 456.821). A bancada não representa tempo de WebKit, memória do iPad nem taxa geral de acerto linguístico. Medições e limites estão em `astra/MATURACAO.md`.

## Retomada e atualização

- Conferir estado local/remoto e o escopo pedido. Preservar o que já foi feito.
- Resolver a menor decisão que destrava a experiência; comparar alternativas somente quando o custo ou a arquitetura justificarem.
- Implementar uma etapa concreta; testar o risco dessa etapa e os gates aplicáveis; parar a verificação quando houver evidência suficiente.
- Registrar escolha, custo, alternativa descartada, evidência e limitação no documento correspondente.
- Encerrar com um resultado utilizável e pendências precisas. O próximo agente deve distinguir concluído, medido, inferido e não testado.

Continuam pendentes: medição física; revisão linguística/bibliográfica independente; cobertura gramatical ampla e clíticos; Prova de autoria. Não converter essas pendências em promessa de implementação sem um próximo pedido definido.
