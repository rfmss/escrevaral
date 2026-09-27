# Léxico e padrões de construção — 27/09/2026

## Entrega P03–P05

O inventário de 68 formas nominais, oito artigos e quatro nomes próprios saiu de `relacoes-sintaticas.js` para `lexico-sintatico.js`. O mesmo módulo registra 21 padrões de uso verbal em quatro estruturas: objeto direto, predicativo, objeto direto + destinatário introduzido por a, e construção sem complemento. Nenhuma palavra nova foi acrescentada à cobertura.

Cada consulta nominal devolve candidatos com gênero, número e origem; cada consulta verbal devolve padrões com identificação própria. As consultas retornam cópias para evitar alteração acidental do inventário. O analisador filtra as leituras pela construção inteira e continua abstendo-se quando não pode decidir. Cada achado sintático registra `valencyFrame`, com o uso que sustentou aquela leitura.

Isso prepara a ampliação de regências e a distinção das funções do relativo. Ainda não é um dicionário geral de valências: os verbos podem ter usos que este recorte não representa. A morfologia contextual, as formas de auxiliares e as tabelas históricas de outras lentes continuam nos módulos anteriores; não alegamos centralização de todo o léxico.

## Fundamento e limites

A base conceitual continua sendo a unidade já registrada em `docs/jornada/ESTUDO-SINTAXE-1.md`: Cunha/Cintra, 7ª edição, 2ª impressão, 2017, pp. 136–140, 145–152 e 154. Foi relida nesta etapa a seção VI, item 8, de Bechara, *Lições de Português pela Análise Sintática*, página 103 do PDF recebido (a paginação do arquivo não deve ser confundida com a impressa).

A classificação depende do emprego na frase. Portanto, um registro significa “este uso é reconhecido neste recorte”, nunca “este verbo só admite esta regência”. O inventário é uma organização dos dados locais de v6-23, não uma transcrição dos livros. Os critérios computacionais são nossos e não algoritmos atribuídos aos autores.

Exemplos próprios para o próximo estudo: “A menina canta” / “A menina canta o poema”; “O livro que a menina leu caiu” / “A menina que leu o livro saiu”. O segundo uso de cantar e as relativas com objeto permanecem fora deste incremento; estes exemplos são questões de estudo, não resultados aprovados.

## Verificação e publicação

Passaram os 78 casos de sintaxe, 65 de locuções e 84 de relativas já existentes, incluindo posições, recortes e abstenções. A verificação estática confirmou 47 scripts ES5, HTML portátil idêntico e versões de assets/cache sincronizadas. A integridade do novo inventário e a identificação do padrão empregado foram verificadas na suíte de sintaxe.

Versão preparada: `20260927-scrvrl-regencia-v6-24`. Não houve alteração de armazenamento do manuscrito nem nova chamada de rede no produto. A auditoria ampla de navegador, acessibilidade, offline e avaliação linguística independente permanece pendente, conforme a autorização de Rafael para publicar incrementos e testar em paralelo. O registro de publicação fica em `docs/jornada/estado.json` e no histórico da main.

Reversão: reverter o commit desta separação, mantendo os dados de documentos; não usar force push. Próxima ação: estudar contrastes entre que-sujeito, que-objeto e sujeito posposto antes de ampliar P06.
