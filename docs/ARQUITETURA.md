# Arquitetura da primeira Mesa

## Fronteiras que já existem

`index.html` contém estrutura semântica e referências locais. `src/app/iniciar.js` cria e conecta as peças. Não tem lógica de gravação, eventos de edição ou desenho.

`src/editor/documento.js` define o registro mínimo. `sessao.js` mantém um rascunho, sua base persistida e estado de edição/IME. `coordenador.js` agenda a gravação e liga comandos da Mesa à sessão: é exclusivo do fluxo de escrita. Não receberá cadernos, ferramentas, análise, efeitos ou navegação geral.

`src/storage/rascunho.js` lê, valida, grava e lista recuperações através de um objeto de armazenamento injetado. Só `src/plataforma/navegador.js` busca a API localStorage do navegador. Nenhuma camada de interface acessa essa API.

`src/interface/mesa.js` mantém referências ao DOM, apresenta estados e converte eventos em comandos. `src/transferencia/exportar.js` solicita download ou devolve a necessidade de cópia manual. Não existe clipboard silencioso ou rede nesta entrega.

Cada fonte é uma única fábrica, sem autoexecução. `modules.json` define a ordem e as dependências. A montagem encapsula todas as instâncias em um único escopo privado. Motores futuros entrarão por uma porta de análise, sem acesso ao repositório ou campo editável.

## Contratos concretos

Documento: `{schema:1, title:string, text:string, revision:inteiro, updated:timestamp}`. O corpo do texto não é normalizado. O título não faz parte do corpo exportado. Ainda não é o formato final `.scrvrl`.

Repositório: `read()` informa registro, representação esperada e falha; `save(record, expected)` grava cópia de sessão antes de disputar a folha atual, verifica conflito e confirma a leitura de volta; `recoveries()` oferece revisão anterior e sessões divergentes. JSON ilegível é preservado; não é substituído automaticamente por folha vazia.

Sessão: `change`, `save`, `snapshot`, `restore`, `compose`. Snapshot é uma cópia com texto literal; exportação não exige uma gravação bem-sucedida. Restaurar troca o rascunho por ação explícita. Uma origem ilegível permite resgatar outra cópia para exportação, mas continua bloqueando overwrite da origem.

Salvamento: pausa de 900 ms e prazo de 3 s durante edição contínua, suspenso durante composição IME. Blur, ocultação e saída solicitam gravação como complemento; não são o mecanismo principal. Em conflito, a base esperada não é atualizada silenciosamente. O texto divergente permanece em cópia própria quando o armazenamento permite.

## Custos e limites

Não existem animações, loops contínuos, motores nem métricas linguísticas nesta fatia. O marcador de escrita muda em tempo constante. Serialização e escrita de um documento são síncronas no adaptador inicial; grandes manuscritos exigem medição e avaliação de outro adaptador no R02 antes da migração real.

O núcleo usa ES5. O CSS usa blocos, posicionamento e media queries; `calc()` participa do dimensionamento do campo. Não foram homologados aparelhos antigos, viewport com teclado virtual ou leitores de tela. Falta de APIs de download usa cópia selecionável. `file:` pode negar persistência; o texto continua editável/exportável.

LocalStorage não oferece compare-and-swap transacional entre abas. Conferência da base e eventos detectam conflitos usuais; a cópia por sessão reduz o risco na corrida entre gravações. Não há garantia de exclusão mútua. Recuperações podem crescer com o número de sessões e atingir quota; não há limpeza destrutiva automática. Antes de acervos reais, definir retenção explícita e avaliar transação no adaptador principal.

## Expansão sem um novo monólito

O próximo fluxo nasce como módulo próprio. A aplicação não expõe `window.Escr`. O coordenador da Mesa não vira orquestrador de toda a oficina. Contratos mudam junto das verificações de fronteira. Não criar uma infraestrutura de plugins para receber o primeiro motor; usar um adaptador concreto.

Os diretórios previstos para acervo, estudo e cofre só serão criados com código real. Os fontes antigos ficam no vault; a nova árvore não carrega sua cascata, bundles ou experimentos. Não copiar textos privados do autor como fixtures.
