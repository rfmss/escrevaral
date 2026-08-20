type RawIssue = Record<string, unknown>

type SyntaxTerm = {
  text?: string
  funcao?: string | null
}

type SyntaxPeriod = {
  termos?: SyntaxTerm[]
}

export type StructuralSyntaxEngine = {
  analisarPeriodo?: (text: string) => SyntaxPeriod
}

type LocatedTerm = SyntaxTerm & {
  start: number
  end: number
}

function locateTerms(sentence: string, terms: SyntaxTerm[]): LocatedTerm[] {
  let cursor = 0
  const located: LocatedTerm[] = []

  for (const term of terms) {
    const token = String(term.text ?? '')
    if (!token) continue
    const start = sentence.indexOf(token, cursor)
    if (start < 0) continue
    const end = start + token.length
    located.push({ ...term, start, end })
    cursor = end
  }

  return located
}

function isSubject(term: LocatedTerm | undefined): boolean {
  return Boolean(term?.funcao?.includes('Sujeito'))
}

function isPredicateVerb(term: LocatedTerm | undefined): boolean {
  const funcao = term?.funcao ?? ''
  return funcao === 'Núcleo do predicado' || funcao === 'Verbo de ligação'
}

function isIntegratedComplement(term: LocatedTerm | undefined): boolean {
  const funcao = term?.funcao ?? ''
  return funcao.startsWith('Objeto ') || funcao.startsWith('Predicativo ')
}

function isTransparentDeterminer(term: LocatedTerm | undefined): boolean {
  return term?.funcao === 'Artigo / contração'
}

function complementAfterComma(terms: LocatedTerm[], commaIndex: number): LocatedTerm | undefined {
  const first = terms[commaIndex + 1]
  if (!isTransparentDeterminer(first)) return first

  let index = commaIndex + 1
  while (index < terms.length && isTransparentDeterminer(terms[index])) index += 1
  return terms[index]
}

function directSubjectBeforeComma(terms: LocatedTerm[], commaIndex: number): LocatedTerm | undefined {
  for (let index = commaIndex - 1; index >= 0; index -= 1) {
    const term = terms[index]
    if (term.text === ',') return undefined
    if (isPredicateVerb(term)) return undefined
    if (isSubject(term)) return term
  }
  return undefined
}

function punctuationIssue(
  ruleId: 'PONT-SYNT-03' | 'PONT-SYNT-04',
  sentence: string,
  sentenceOffset: number,
  left: LocatedTerm,
  right: LocatedTerm,
): RawIssue {
  const from = sentenceOffset + left.start
  const fragment = sentence.slice(left.start, right.end)
  const subjectVerb = ruleId === 'PONT-SYNT-03'

  return {
    ruleId,
    categoria: subjectVerb
      ? 'vírgula proibida — sujeito/verbo'
      : 'vírgula proibida — verbo/complemento',
    fonte: 'calibração pt-BR C1 — sintaxe estrutural',
    criterio: subjectVerb
      ? 'Não se usa vírgula para separar diretamente o sujeito do verbo.'
      : 'Não se usa vírgula para separar diretamente o verbo de complemento ou predicativo integrado.',
    exemplo: 'A pesquisadora publicou o relatório.',
    acao: subjectVerb
      ? 'Remova a vírgula entre o sujeito e o verbo.'
      : 'Remova a vírgula entre o verbo e o complemento ou predicativo.',
    fragment,
    pos: from,
    severity: 'alta',
    calibrationClass: 'norma_consolidada',
  }
}

function replaceOverlappingLegacyIssue(issues: unknown[], preciseIssue: RawIssue): void {
  const preciseFrom = Number(preciseIssue.pos)
  const preciseFragment = String(preciseIssue.fragment ?? '')
  if (!Number.isInteger(preciseFrom) || !preciseFragment) return
  const preciseTo = preciseFrom + preciseFragment.length

  for (let index = issues.length - 1; index >= 0; index -= 1) {
    const candidate = issues[index]
    if (!candidate || typeof candidate !== 'object') continue
    const raw = candidate as RawIssue
    if (raw.ruleId !== 'PONT-01') continue
    const candidateFrom = Number(raw.pos)
    const candidateFragment = String(raw.fragment ?? '')
    if (!Number.isInteger(candidateFrom) || !candidateFragment) continue
    const candidateTo = candidateFrom + candidateFragment.length
    if (candidateFrom < preciseTo && candidateTo > preciseFrom) issues.splice(index, 1)
  }
}

function sentenceSlices(text: string): Array<{ sentence: string; offset: number }> {
  const slices: Array<{ sentence: string; offset: number }> = []
  let cursor = 0

  for (const sentence of text.split(/[.!?]+\s+/).filter(Boolean)) {
    const offset = text.indexOf(sentence, cursor)
    if (offset < 0) continue
    slices.push({ sentence, offset })
    cursor = offset + sentence.length
  }

  return slices
}

export function calibrateStructuralPunctuation(
  text: string,
  currentIssues: unknown[],
  syntaxEngine?: StructuralSyntaxEngine,
): unknown[] {
  if (!syntaxEngine?.analisarPeriodo) return currentIssues

  const issues: unknown[] = [...currentIssues]

  for (const { sentence, offset } of sentenceSlices(text)) {
    let period: SyntaxPeriod
    try {
      period = syntaxEngine.analisarPeriodo(sentence)
    } catch {
      continue
    }

    const terms = locateTerms(sentence, period.termos ?? [])
    for (let index = 1; index < terms.length - 1; index += 1) {
      const comma = terms[index]
      if (comma.text !== ',') continue

      const left = terms[index - 1]
      const immediateRight = terms[index + 1]
      const subject = directSubjectBeforeComma(terms, index)

      if (subject && isPredicateVerb(immediateRight)) {
        const preciseIssue = punctuationIssue('PONT-SYNT-03', sentence, offset, subject, immediateRight)
        replaceOverlappingLegacyIssue(issues, preciseIssue)
        issues.push(preciseIssue)
        continue
      }

      const complement = complementAfterComma(terms, index)
      if (isPredicateVerb(left) && isIntegratedComplement(complement)) {
        issues.push(punctuationIssue('PONT-SYNT-04', sentence, offset, left, complement!))
      }
    }
  }

  return issues
}
