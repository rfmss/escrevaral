export type EngineSuperiorityCase = {
  id: string
  text: string
  query: string
  expectedClass: RegExp
  rationale: string
  source: 'bancada-legada' | 'superioridade-contextual'
}

/**
 * Corpus v1 — fronteiras morfossintáticas em português brasileiro.
 *
 * Os casos legados vêm da bancada gramatical de 2026-06-27. Os casos de
 * superioridade contextual acrescentam pares mínimos que uma consulta de
 * dicionário sem contexto não consegue resolver.
 */
export const ENGINE_SUPERIORITY_CASES: EngineSuperiorityCase[] = [
  {
    id: 'enquanto-oracao',
    text: 'Enquanto ela lia, eu escrevia perto da janela.',
    query: 'enquanto',
    expectedClass: /conjunção/i,
    rationale: 'Introduz oração temporal com verbo expresso.',
    source: 'bancada-legada',
  },
  {
    id: 'por-enquanto',
    text: 'Por enquanto, ficamos aqui em silêncio.',
    query: 'por enquanto',
    expectedClass: /advérbio|locução adverbial/i,
    rationale: 'A expressão inteira funciona como locução adverbial temporal.',
    source: 'bancada-legada',
  },
  {
    id: 'enquanto-isso',
    text: 'Enquanto isso, a chuva parou no quintal.',
    query: 'enquanto isso',
    expectedClass: /advérbio|locução adverbial/i,
    rationale: 'A expressão inteira funciona como conector adverbial.',
    source: 'bancada-legada',
  },
  {
    id: 'publica-verbo',
    text: 'A editora publica o romance no segundo semestre.',
    query: 'publica',
    expectedClass: /verbo/i,
    rationale: 'Forma verbal de publicar; o diacrítico não pode ser descartado na decisão.',
    source: 'bancada-legada',
  },
  {
    id: 'publica-adjetivo',
    text: 'A praça pública estava vazia depois da chuva.',
    query: 'pública',
    expectedClass: /adjetivo/i,
    rationale: 'Adjetivo com diacrítico distintivo.',
    source: 'bancada-legada',
  },
  {
    id: 'seria-verbo',
    text: 'Ela seria mais firme se conhecesse o acordo.',
    query: 'seria',
    expectedClass: /verbo|auxiliar/i,
    rationale: 'Forma verbal de ser em locução condicional.',
    source: 'bancada-legada',
  },
  {
    id: 'seria-adjetivo',
    text: 'A leitura séria do manuscrito ajudou a autora.',
    query: 'séria',
    expectedClass: /adjetivo/i,
    rationale: 'Adjetivo com diacrítico distintivo.',
    source: 'bancada-legada',
  },
  {
    id: 'preso-participio',
    text: 'O suspeito foi preso ontem pela manhã.',
    query: 'preso',
    expectedClass: /verbo|particípio/i,
    rationale: 'Particípio em voz passiva após auxiliar.',
    source: 'bancada-legada',
  },
  {
    id: 'preso-adjetivo',
    text: 'O menino ficou preso no elevador antigo.',
    query: 'preso',
    expectedClass: /adjetivo/i,
    rationale: 'Predicativo de estado após verbo de ligação.',
    source: 'bancada-legada',
  },
  {
    id: 'presos-substantivo',
    text: 'Os presos aguardavam notícias no corredor.',
    query: 'presos',
    expectedClass: /substantivo/i,
    rationale: 'Particípio substantivado após determinante.',
    source: 'bancada-legada',
  },
  {
    id: 'larga-adjetivo',
    text: 'A estrada larga cortava o vale inteiro.',
    query: 'larga',
    expectedClass: /adjetivo/i,
    rationale: 'Modifica o substantivo estrada.',
    source: 'bancada-legada',
  },
  {
    id: 'larga-verbo',
    text: 'Ela larga tudo quando se cansa do trabalho.',
    query: 'larga',
    expectedClass: /verbo/i,
    rationale: 'Núcleo verbal com sujeito expresso.',
    source: 'bancada-legada',
  },
  {
    id: 'canto-verbo',
    text: 'Eu canto baixinho quando a casa adormece.',
    query: 'canto',
    expectedClass: /verbo/i,
    rationale: 'Primeira pessoa do verbo cantar.',
    source: 'superioridade-contextual',
  },
  {
    id: 'canto-substantivo',
    text: 'O canto do quarto guardava uma cadeira antiga.',
    query: 'canto',
    expectedClass: /substantivo/i,
    rationale: 'Nome antecedido por determinante.',
    source: 'superioridade-contextual',
  },
]
