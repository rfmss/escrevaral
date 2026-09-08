# Decisões da entrega mínima

## Fronteira da entrega

A Constituição foi copiada literalmente para `CONSTITUICAO.md`. A implementação nova vive em `astra/`; não carrega arquivos do produto herdado nem lê suas chaves de armazenamento. Isso permite construir do zero sem tornar manuscritos antigos inacessíveis. O README aponta para a entrada nova. A entrada antiga, seus arquivos e seu service worker não foram modificados.

A branch solicitada já existia: a tentativa de criação devolveu `Reference already exists`; a primeira revisão observada nela foi `816ca7ea2140f49b93a5bfaeabd0b898871760e5`. Não houve reset, force push, comparação com outras branches, merge ou publicação no domínio. Não se afirma ter criado novamente a branch nem ter verificado sua ascendência em main.

## Arquitetura

| Mundo | Arquivos | Responsabilidade |
| --- | --- | --- |
| Conhecimento | `conhecimento/base.js` | Fontes, quatro regras, duas listas de seis entradas e limites |
| Máquina | `maquina/cofre.js`, `maquina/acervo.js` | Orquestração, diagnósticos e armazenamento; sem DOM |
| Ponte e superfície | `superficie/ponte.js`, `superficie/mesa.css`, `index.html` | Eventos, seleção de trecho e apresentação; nenhuma regra linguística |
| Oficina de construção | `oficina/empacotar.js`, `testes/` | Empacotamento opcional e bancada; não usados em execução |

Constituição 3.6 e 3.11: `createVault(knowledge).analyze(lensId, text)` retorna `findings`, `limited`, `coverage` e a versão do conhecimento. Uma lente adicional implementa `{ id, analyze(text, cap) }` e entra por `register`; o contrato é validado antes de chegar à ponte. O cofre roda em um contexto JavaScript sem navegador.

## Diagnósticos e limites linguísticos

Constituição 3.7, 3.9 e 3.12: cada Finding contém `id`, `lens`, `feature`, `severity`, `confidence`, `message`, `start`, `end`, `snippet`, `reference` e `evidence`. A evidência separa observação, interpretação, ambiguidade, limite e fonte. Offsets usam unidades UTF-16, compatíveis com a seleção de textarea, sem normalizar ou alterar a entrada.

Ortografia: seis correspondências exatas de grafias a conferir; palavras desconhecidas não são tratadas como erros. Acentuação: seis candidatos limitados às oxítonas registradas. As duas lentes emitem avisos de confiança moderada, pois o contexto pode mudar a leitura. Pontuação: apenas vírgulas e pontos e vírgulas consecutivos, como informação. Confiança alta refere-se à presença dos sinais, nunca à intenção da escritora.

Maiúsculas ficam sem diagnóstico lexical, inclusive no início de frase. Aspas duplas pareadas, aspas tipográficas, crases de código, blocos de código, URLs e e-mails são protegidos por uma heurística pequena. Isso não equivale a um parser de marcação. Aspas simples ASCII não formam área protegida; apóstrofos internos pertencem ao token. Frases em outras línguas sem marcação podem provocar avisos: não há identificação de idioma.

Pares como `pode/pôde`, `esta/está`, `pais/país` e `por/pôr` são omitidos. Gerúndios, coloquialismos, repetições, pontuação expressiva, comprimentos de frase e invenções lexicais não são tratados como defeitos. Ausência de apontamentos informa somente o silêncio das regras disponíveis.

As fontes orientam conferência humana; não foram baixados dicionários, obras completas ou bases proprietárias. A lista lexical foi preparada artesanalmente e ainda exige revisão profissional item a item. Não houve calibração integral contra Bechara, Cunha & Cintra ou Nascentes, nem se afirma equivalência a um revisor completo.

- [ABL — busca no Vocabulário Ortográfico](https://www.academia.org.br/nossa-lingua/busca-no-vocabulario): referência de consulta lexical; o VOLP não está incorporado.
- [Acordo Ortográfico — Base VIII](https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/decreto/d6583.htm): referência para acentuação de oxítonas.
- Pontuação: convenção editorial local nas próprias regras; não atribuída ao Acordo Ortográfico.

## Atenção e autoria

Constituição 3.4, 3.5 e 3.8: a página abre na folha vazia, sem exemplo ocupando o manuscrito. Título opcional. “Examinar” revela a oficina; clicar numa lente dispara uma única execução. Digitar não dispara análise. Edições invalidam os resultados anteriores. “Voltar à escrita” ou Esc recolhe as ferramentas.

A mesa ocupa até 820 px, com 680 px reservados ao manuscrito e uma cronologia à direita. A referência visual fornecida orienta papel creme contínuo (#f4f1e1), texto de máquina, data abaixo do título e instrumentos sob a folha. Roteiro é o tema inicial; preferências explícitas por Folha são preservadas. A textura usa somente gradientes discretos, sem filtro SVG, fonte remota ou efeito de tinta que prejudique a leitura. O horário ativo recebe laranja queimado com contraste reforçado.

A cronologia abre folhas reais do acervo e o botão + cria uma folha. Ela mostra até 12 folhas recentes, além da atual quando necessário; o acervo completo continua disponível. Datas representam a última gravação, não prova de criação. Os metadados da cronologia ficam em memória durante a digitação para evitar reler todo o acervo a cada salvamento. Em telas de até 430 px, a cronologia passa para cima da folha para preservar a largura de escrita. São escolhas de ergonomia coerentes com a Constituição, não resultados de ensaios neurocientíficos nesta sessão. Não há alegação clínica ou garantia de acessibilidade validada.

“Manter minha escolha” suprime a combinação exata de regra e trecho nesta folha, inclusive outras ocorrências idênticas. “Rever escolhas mantidas” desfaz essa preferência. O manuscrito nunca é substituído pelo resultado.

O som é opt-in, não persiste entre aberturas e cessa ao ocultar a página. Usa pulsos sintetizados curtos, com notas diferentes para tecla, apagar e Enter. Não tenta detectar fones; essa decisão continua com a pessoa. Falhas de áudio não impedem a escrita.

## Preservação local

Constituição 3.3 e 3.11: cada gravação escreve primeiro sob uma chave nova e só depois remove a predecessora. Duas abas que partem da mesma folha preservam ambas as novas versões; a última preferência de abertura pode variar, mas o acervo mantém as duas. Se a remoção falhar ou houver interrupção depois da gravação, pode sobrar uma cópia extra.

Após um segundo sem digitação, o manuscrito é guardado. `pagehide`, troca de visibilidade e Ctrl/⌘+S tentam guardar imediatamente. Não há promessa de sobreviver ao encerramento abrupto antes da gravação. O status só afirma “guardado” depois de `setItem` concluir. Falhas de quota mantêm o texto na folha e impedem trocas que o perderiam; a exportação inclui o texto ainda não guardado. O navegador pode limpar seu armazenamento, principalmente em modo privado. A cópia externa `.json` é a via de recuperação.

Importação valida o conjunto inteiro antes de escrever; arquivos válidos entram como novas folhas. Se faltar espaço durante um conjunto válido, as folhas já importadas permanecem e a mensagem informa o total parcial. O conteúdo anterior não é substituído. A leitura assíncrona preserva também o que foi digitado enquanto o arquivo era aberto. Registros corrompidos não são apagados; a cópia integral é interrompida se houver folhas ilegíveis.

Não há histórico de cada tecla, carimbo de anterioridade ou Prova de autoria nesta entrega. Salvamento local não é prova jurídica, criptográfica ou cronológica. Esses módulos pertencem à expansão posterior.

## Sem internet e hardware

Constituição 3.2 e 3.11: `index.html` abre junto dos seus arquivos locais; `escrevaral.html` contém todos eles e abre sem instalação, build, servidor ou conexão onde o navegador permite executar HTML local. Node apenas recompõe a edição portátil durante manutenção; o arquivo pronto está versionado. `--check` detecta divergência entre a edição e as fontes.

Não foi incluído service worker, AppCache ou dependência em cache HTTP. Uma visita web à edição modular, sozinha, não garante reabertura sem internet. Guarde a edição portátil antes de desconectar. No iPad antigo, o aplicativo de arquivos/visualizador pode impedir JavaScript local; abertura e preservação real precisam ser verificadas no aparelho. ES5 aprovado é evidência de sintaxe, não certificação de iOS 9.

Nenhuma requisição de análise ou telemetria é implementada. Fontes e estilos não vêm de CDNs. A CSP bloqueia conexões, objetos e formulários; texto importado e evidências entram via `textContent`. A página de origem, extensões e o sistema do aparelho continuam fora do controle da aplicação.

Uma execução aceita até 200 mil caracteres e devolve no máximo 100 achados; informa o limite sem truncar o manuscrito. O trabalho é síncrono e limitado, com pequeno adiamento antes de iniciar para apresentar o estado. Falta medir latência e memória em hardware legado; não há números inventados de desempenho no iPad.

## Próximas adições

1. Validar abertura, digitação prolongada, importação/exportação e quota no iPad iOS 9.3.5. Medir a lente mais pesada em manuscrito representativo.
2. Revisão linguística profissional da base; corpus literário maior, autorizado e estratificado, com falso positivo e omissão por regra.
3. Expandir léxico e exceções somente com testes anotados. Depois acrescentar acentuação contextual e pontuação sintática, abstendo-se quando houver dúvida.
4. Acrescentar regência/concordância e observações de estilo em módulos independentes, preservando a separação entre escrever e examinar.
5. Projetar Prova de autoria com limites de relógio local e anterioridade declarados, sem confundir assinatura local com carimbo externo verificável.

Não são necessárias refatorações do cofre para trocar tema, tipografia ou superfície.
