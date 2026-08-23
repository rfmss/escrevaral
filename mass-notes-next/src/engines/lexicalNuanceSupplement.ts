export type LexicalSynonymNuance = {
  candidate: string
  register?: 'comum' | 'literário' | 'erudito'
  focus: string
  note: string
}

type NuanceEntry = Omit<LexicalSynonymNuance, 'candidate'>

type NuanceMap = Record<string, Record<string, NuanceEntry>>

// Calibração lexical C3.
// As notas abaixo são paráfrases operacionais próprias do Escrevaral, não
// transcrições das obras de referência. Só são exibidas se o candidato já
// existir no vocabulário/sinonímia carregado pela aplicação.
const NUANCES: NuanceMap = {
  esquecer: {
    olvidar: {
      register: 'literário',
      focus: 'registro',
      note: 'Mantém o núcleo de perda da memória, mas desloca a frase para um registro marcadamente literário.',
    },
  },
  escuro: {
    obscuro: {
      register: 'erudito',
      focus: 'concreto × figurado',
      note: 'Pode indicar falta de claridade, mas é especialmente produtivo em usos figurados ligados a ideias, sentidos ou passagens pouco claras.',
    },
  },
  sozinho: {
    só: {
      register: 'comum',
      focus: 'carga afetiva',
      note: 'Expressa ausência de companhia com menos carga afetiva; “sozinho” pode acentuar isolamento, tristeza ou compaixão.',
    },
  },
  falar: {
    dizer: {
      register: 'comum',
      focus: 'ato de fala × conteúdo dito',
      note: 'É candidato mais específico quando o foco está no conteúdo afirmado ou declarado; “falar” também nomeia o ato de se exprimir, uma língua ou um assunto.',
    },
  },
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

export function readLexicalSynonymNuances(word: string, synonyms: string[]): LexicalSynonymNuance[] {
  const group = NUANCES[normalize(word)]
  if (!group || synonyms.length === 0) return []

  const byNormalizedCandidate = new Map(
    synonyms.map((candidate) => [normalize(candidate), candidate] as const),
  )

  return Object.entries(group).flatMap(([candidateKey, nuance]) => {
    const candidate = byNormalizedCandidate.get(normalize(candidateKey))
    return candidate ? [{ candidate, ...nuance }] : []
  })
}
