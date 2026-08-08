export type ContextualLexicalDecision = 'classificado' | 'provavel' | 'ambiguo' | 'indeterminado'

export type ContextualLexicalOverride = {
  className: string
  decision: ContextualLexicalDecision
  functionName?: string
  field?: string
  note: string
  syntacticFunction?: string
}

const SUBJECT_PRONOUNS = new Set([
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas', 'você', 'vocês',
])

const DETERMINERS = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
  'aquele', 'aquela', 'aqueles', 'aquelas',
])

const DIRECT_OBJECT_MARKERS = new Set([
  ...DETERMINERS,
  'algo', 'aquilo', 'isso', 'isto', 'nada', 'tudo',
  'me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes',
])

const PASSIVE_AUXILIARIES = new Set([
  'sou', 'és', 'é', 'somos', 'sois', 'são',
  'fui', 'foi', 'fomos', 'foram',
  'era', 'éramos', 'eram', 'será', 'serão', 'seria', 'seriam',
  'seja', 'sejam', 'fosse', 'fossem', 'sido',
])

const PARTICIPLE_FORMS = new Map<string, string>([
  ['preso', 'prender'], ['presa', 'prender'], ['presos', 'prender'], ['presas', 'prender'],
  ['contido', 'conter'], ['contida', 'conter'], ['contidos', 'conter'], ['contidas', 'conter'],
  ['oculto', 'ocultar'], ['oculta', 'ocultar'], ['ocultos', 'ocultar'], ['ocultas', 'ocultar'],
])

const AMBIGUOUS_PRESENT_FORMS = new Map<string, string>([
  ['canto', 'cantar'],
  ['larga', 'largar'],
  ['estreita', 'estreitar'],
])

const POST_NOMINAL_ADJECTIVES = new Set([
  'larga', 'largo', 'largas', 'largos',
  'estreita', 'estreito', 'estreitas', 'estreitos',
])

const FIXED_EXPRESSIONS = new Map<string, ContextualLexicalOverride>([
  ['por enquanto', {
    className: 'Locução adverbial',
    decision: 'classificado',
    functionName: 'Valor temporal',
    field: 'tempo',
    note: 'A expressão inteira situa a ação no tempo; não é a soma isolada de “por” e “enquanto”.',
    syntacticFunction: 'Adjunto adverbial de tempo',
  }],
  ['enquanto isso', {
    className: 'Locução adverbial',
    decision: 'classificado',
    functionName: 'Conector temporal',
    field: 'tempo',
    note: 'A expressão inteira conecta acontecimentos simultâneos ou próximos no discurso.',
    syntacticFunction: 'Adjunto adverbial de tempo',
  }],
])

function normalizePreservingDiacritics(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .replace(/[^\p{L}\p{N}'’-]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function tokenize(value: string): string[] {
  return normalizePreservingDiacritics(value).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []
}

function findTokenSequence(tokens: string[], queryTokens: string[]): number {
  if (queryTokens.length === 0 || queryTokens.length > tokens.length) return -1
  for (let index = 0; index <= tokens.length - queryTokens.length; index += 1) {
    if (queryTokens.every((token, offset) => tokens[index + offset] === token)) return index
  }
  return -1
}

export function resolveContextualLexicalReading(query: string, context: string): ContextualLexicalOverride | null {
  const cleanQuery = normalizePreservingDiacritics(query)
  const contextTokens = tokenize(context)
  const queryTokens = tokenize(cleanQuery)
  const index = findTokenSequence(contextTokens, queryTokens)
  if (index < 0) return null

  const fixed = FIXED_EXPRESSIONS.get(cleanQuery)
  if (fixed) return fixed
  if (queryTokens.length !== 1) return null

  const token = queryTokens[0]
  const previous = contextTokens[index - 1] ?? ''
  const twoBefore = contextTokens[index - 2] ?? ''
  const next = contextTokens[index + 1] ?? ''

  // Acento é informação gramatical, não mero detalhe de busca.
  // “publica” é forma de publicar; “pública” permanece adjetivo na engine base.
  if (token === 'publica') {
    return {
      className: 'Verbo flexionado',
      decision: 'classificado',
      functionName: 'Forma do verbo publicar',
      note: 'Sem acento, “publica” é forma verbal. A forma adjetiva correspondente é “pública”.',
      syntacticFunction: 'Núcleo do predicado verbal',
    }
  }

  const participleLemma = PARTICIPLE_FORMS.get(token)
  if (participleLemma && PASSIVE_AUXILIARIES.has(previous)) {
    return {
      className: 'Verbo no particípio',
      decision: 'provavel',
      functionName: `Particípio do verbo ${participleLemma}`,
      note: `Depois do auxiliar “${previous}”, a leitura mais provável é uma construção de voz passiva.`,
      syntacticFunction: 'Núcleo verbal da voz passiva',
    }
  }

  const verbLemma = AMBIGUOUS_PRESENT_FORMS.get(token)
  if (verbLemma && SUBJECT_PRONOUNS.has(previous)) {
    return {
      className: 'Verbo flexionado',
      decision: 'provavel',
      functionName: `Forma do verbo ${verbLemma}`,
      note: `Depois do pronome sujeito “${previous}”, a leitura verbal é a mais provável neste contexto.`,
      syntacticFunction: 'Núcleo do predicado verbal',
    }
  }

  // “A estrada larga cortava” e “A menina larga a mochila” compartilham
  // o mesmo prefixo superficial. Um objeto explícito à direita impede que a
  // regra pós-nominal transforme o núcleo verbal em adjetivo.
  if (verbLemma && DETERMINERS.has(twoBefore) && previous && DIRECT_OBJECT_MARKERS.has(next)) {
    return {
      className: 'Verbo flexionado',
      decision: 'provavel',
      functionName: `Forma do verbo ${verbLemma}`,
      note: `Depois do sujeito nominal “${previous}”, a presença de “${next}” introduz provavelmente o complemento do verbo.`,
      syntacticFunction: 'Núcleo do predicado verbal',
    }
  }

  if (POST_NOMINAL_ADJECTIVES.has(token) && DETERMINERS.has(twoBefore) && previous) {
    return {
      className: 'Adjetivo',
      decision: 'provavel',
      functionName: 'Caracterização nominal',
      note: `Depois do nome “${previous}”, a palavra atua provavelmente como característica desse nome.`,
      syntacticFunction: 'Adjunto adnominal',
    }
  }

  return null
}
