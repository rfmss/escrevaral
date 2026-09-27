# Unidade estudada: locuções e fronteiras

26/09/2026 · P01/P05. Continuação de `ESTUDO-SINTAXE-1.md`.

## Leitura delimitada

- B09, Cunha/Cintra, 7ª ed., 2ª impressão, 2017: páginas impressas 408–411 (PDF 441–444), 625–626 (PDF 657–658); p. 135 (PDF 168) já examinada na unidade anterior. Texto extraído conferido; imagens PDF 443–444 inspecionadas nesta unidade.
- B16, Bechara, *Lições*: páginas PDF 318, 322, 340–343 e 346. Imagens de 340–342 inspecionadas. Preservada a divergência de edição do arquivo catalogado; páginas digitais não convertidas em páginas impressas.
- Nenhum livro completo incorporado ao repositório; leitura integral não declarada.

## Síntese e confronto

Uma locução reúne auxiliar e principal. A forma flexionada pode expressar pessoa, número, tempo e modo; a forma nominal participa da organização do grupo. Portanto, contar formas verbais não equivale a contar orações. Uma oração reduzida pode conter uma locução, e uma forma nominal pode ter função adjetiva ou substantiva.

Cunha/Cintra apresentam ter/haver com particípio, estar com gerúndio ou a + infinitivo e ir com infinitivo, entre outros empregos. Alertam que o inventário de auxiliares varia conforme os critérios adotados. Bechara também mostra que juntar dois verbos não basta: análise e intenção contextual podem distinguir locução de uma oração completiva. O programa não infere a intenção do escritor.

O incremento escolhe quatro padrões explícitos: **estar + gerúndio**, **estar + a + infinitivo**, **ter/haver + particípio**, **ir + infinitivo**. São hipóteses sob a abordagem tradicional, dentro de uma construção inteira reconhecida. Modalidade, passiva, cadeias maiores e reduções não são generalizadas.

## Operacionalização

`ptbr/grupos-verbais.js` contém 19 lemas e suas formas nominais explicitamente registradas. Não há geração por terminação de palavra desconhecida. Os paradigmas finitos vêm do inventário existente; o auxiliar precisa ser compatível com o sujeito explícito. O principal determina quais padrões de complementação são testados na construção.

O grupo tem um span exato e componentes com spans próprios: auxiliar, principal e preposição, quando presente. Todos são deslocados conjuntamente ao analisar uma seleção. Os vínculos existentes se referem ao grupo verbal completo; o predicado conserva o auxiliar. O contador informa construções reconhecidas, sem anunciar uma contagem exaustiva de orações do documento.

Exemplos próprios: “Eu estou lendo o livro.”, “A menina tinha escrito a carta.”, “Nós vamos ler o poema.”, “Ela estava a escrever a carta.”. Cada um recebe um grupo verbal e uma construção neste recorte.

Abstenções: “Eu quero ler o livro.”, “Ela foi vista.”, “Eu estou sendo visto.”, “Eu tenho a carta escrita.”, “Nós estamos lerem o livro.” e palavras inventadas. “Eu tenho partido.” também fica sem decisão: partido pode designar uma organização, e não apenas funcionar como particípio. Abster não significa apontar erro.

## Relação com o pacote Gemini

O caso “Eu estou lendo o livro.” revelou voz passiva indevida e perda do auxiliar no predicado do protótipo. Ele passou a integrar a regressão local. Não se importou a heurística do pacote. Avaliação completa: `ptbr/auditoria/GEMINI-SET26.md`.

## Avaliação e estado

65 casos próprios em `ptbr/corpus/locucoes-1.json`, além de seleção UTF-16/NFD e cortes; todos passaram. Uma abstenção do corpus anterior foi intencionalmente promovida a leitura (“Eu estou lendo o livro.”), com registro da mudança. Os 78 casos de sintaxe continuam passando.

Revisão pelo assistente implementador; não independente nem cega. Não há precisão/recall de generalização declarados. Implementado e integrado nos HTMLs locais; apresentação e painel verificados com DOM simulado. Navegador e publicação pendentes.

Próxima unidade: estudar os critérios de antecedente e oração relativa, preparando casos positivos e negativos para “que”; não transformar presença do conectivo em detecção de subordinação. A validação visual atual continua requisito de publicação.
