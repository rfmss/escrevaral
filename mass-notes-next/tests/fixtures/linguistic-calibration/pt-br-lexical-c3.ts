export type LexicalNuanceCalibrationCase = {
  id: string
  query: string
  candidate: string
  expected: RegExp
  note: string
}

export const lexicalNuanceCalibrationC3: LexicalNuanceCalibrationCase[] = [
  {
    id: 'C3-ESQUECER-01',
    query: 'esquecer',
    candidate: 'olvidar',
    expected: /literário|registro/i,
    note: 'Alternativa próxima pode mudar marcadamente o registro.',
  },
  {
    id: 'C3-ESCURO-01',
    query: 'escuro',
    candidate: 'obscuro',
    expected: /figurado|ideias|sentidos/i,
    note: 'Sinônimo próximo pode especializar-se em uso figurado.',
  },
  {
    id: 'C3-SOZINHO-01',
    query: 'sozinho',
    candidate: 'só',
    expected: /carga afetiva|isolamento|tristeza/i,
    note: 'Alternativas podem diferir na carga afetiva mesmo quando compartilham o núcleo semântico.',
  },
  {
    id: 'C3-FALAR-01',
    query: 'falar',
    candidate: 'dizer',
    expected: /conteúdo|afirmado|declarado/i,
    note: 'A escolha entre verbos próximos depende do foco semântico da frase.',
  },
]
