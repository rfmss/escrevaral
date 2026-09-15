# Orientação, linguística e linhagem — v6.3

Solicitação de 15/09/2026, após o quadro do PR 175. Meta `20260915-scrvrl-orientacao-v6-3`.

## Interface e referência do AI Studio

- Início incorpora o interruptor frontal deliberado no AI Studio. A inclinação é sugerida por gradientes, bordas e troca de sombras; dispensa faces 3D, filtros e animação contínua. Alvo mínimo de 44 px.
- Menus redundantes do cabeçalho são retirados da apresentação; os caminhos permanecem no Início. Papel, filetes e sinais de registro seguem a mesma referência.
- Widgets recebem largura por função e altura pelo conteúdo, limitada à área útil entre as barras. Calculadora: 340 px no desktop; ocupa a largura disponível no celular. Calendário e ajustes têm medidas próprias. Conteúdo excedente rola dentro do painel.
- Capa ativa entreaberta em CSS 2D, páginas aparentes, borda e etiqueta ABERTO. O estado usa também `aria-pressed`, não depende apenas da cor.
- A janela identifica CADERNO ABERTO / SUAS FOLHAS e oferece retorno explícito à mesa. A lista redundante de outros cadernos sai de dentro do caderno ativo. O caminho superior distingue mesa, caderno e folha.

## Análise incremental

Ortografia e acentuação têm reuso por linha após a proteção global de citações, código e URLs. Linhas idênticas são comparadas exatamente. Os resultados voltam às posições UTF-16 originais e conservam a ordem do corpus antes do corte de 100 apontamentos. Cache limitado por volume e quantidade; a passagem anterior é preservada durante a nova leitura para evitar expulsão prematura.

As demais lentes mantêm análise integral: métricas globais, repetição, sintaxe e contexto não podem ser fragmentados sem mudar o significado. Alterar um parágrafo muito longo ainda exige reler aquela linha. O modo integral permanece disponível internamente para comparação; equivalência de resultados é o gate, não uma promessa de ganho fixo em milissegundos.

## Persistência

IndexedDB é opcional e inicializa ao examinar. Guarda corpus com versão e até 20 resultados derivados recentes. Erro, bloqueio ou tempo excedido devolvem o controle ao aplicativo. Não participa da gravação obrigatória do manuscrito.

Cada folha conserva até três análises recentes, com teto conjunto de 200 mil caracteres de texto analisado, lente, recorte, versão do corpus e resultado. Elas acompanham os pacotes existentes. O corpus também permanece no HTML portátil, portanto aparelhos sem IndexedDB continuam com acesso offline ao motor. O cache só é reutilizado após igualdade do texto, recorte e versão; não autoriza resultados antigos sobre texto alterado.

## Linhagem na colaboração

Histórico local por folha, autocontido no documento: até 20 versões / 400 mil caracteres no conjunto. Guarda alterações espaçadas em um minuto, mudanças de título, remoções expressivas e marcos manuais. Não duplica versão textual ao apenas guardar uma análise. Versões maiores que o limite não entram no histórico automático; o manuscrito permanece íntegro.

A consulta mostra sequência, título, data do aparelho, palavras, texto e trecho alterado. Restaurar cria uma nova gravação; o estado anterior entra no histórico conforme o limite. Falha de armazenamento mantém a gravação anterior. Pacotes, cópias importadas e lixeira preservam a linhagem dentro da folha.

É histórico local, sem relógio externo, identificação verificada do autor ou sincronização multiusuário. Não representa certificação de autoria nem anterioridade independente. Nenhum histórico anterior à implantação é inventado.

## Validação

Testes puros: equivalência incremental/integral, regiões protegidas, deslocamentos, limites, reuso, pacotes, falha de gravação e linhagem limitada. Verificações de navegador e capturas pelo PR antes da publicação. iPad iOS 9.3.5 físico, teclado virtual real e zoom real continuam testes distintos dos viewports e do WebKit atual.
