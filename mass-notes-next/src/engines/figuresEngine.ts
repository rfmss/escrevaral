import analysisSource from '../../../analise-engine.js?raw'

export type FigureConfidence = 'forte' | 'provável' | 'possível'
export type FigureScale = 'micro' | 'frase' | 'sequência'
export type FigureType =
  | 'pleonasmo'
  | 'anafora'
  | 'epifora'
  | 'paralelismo'
  | 'polissindeto'
  | 'assindeto'
  | 'aliteracao'
  | 'antitese'
  | 'personificacao'
  | 'oximoro'

export type FigureFinding = {
  id: string
  type: FigureType
  label: string
  confidence: FigureConfidence
  scale: FigureScale
  fragment: string
  textRange: { from: number; to: number }
  evidence: string
  effect: string
}

export type FigureReading = {
  findings: FigureFinding[]
  counts: {
    total: number
    forte: number
    provavel: number
    possivel: number
  }
  byType: Array<{ type: FigureType; label: string; count: number }>
  coverage: string[]
}

type Unit = {
  text: string
  from: number
  to: number
}

type LegacyAnalysisApi = {
  analisar?: (text: string, options?: Record<string, unknown>) => unknown
}

type LegacyAnalysisWindow = Window & {
  VeredaAnalise?: LegacyAnalysisApi
}

const LABELS: Record<FigureType, string> = {
  pleonasmo: 'Pleonasmo / redundância',
  anafora: 'Anáfora',
  epifora: 'Epífora',
  paralelismo: 'Paralelismo sintático',
  polissindeto: 'Polissíndeto',
  assindeto: 'Enumeração assindética',
  aliteracao: 'Aliteração',
  antitese: 'Antítese',
  personificacao: 'Personificação possível',
  oximoro: 'Oxímoro possível',
}

const COVERAGE = [
  'pleonasmo',
  'anáfora',
  'epífora',
  'paralelismo',
  'polissíndeto',
  'assíndeto',
  'aliteração',
  'antítese',
  'personificação',
  'oxímoro',
]

const FALLBACK_PLEONASMS = [
  'subir para cima',
  'descer para baixo',
  'entrar para dentro',
  'sair para fora',
  'voltar de volta',
  'repetir de novo',
  'resultado final',
  'acabamento final',
  'certeza absoluta',
  'elo de ligação',
  'encarar de frente',
  'há anos atrás',
  'prever antecipadamente',
  'planejar antecipadamente',
  'gritar em voz alta',
  'sussurrar em voz baixa',
  'consenso geral',
  'fato real',
  'surpresa inesperada',
  'panorama geral',
] as const

const STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'ela', 'ele', 'em', 'entre',
  'era', 'essa', 'esse', 'esta', 'este', 'foi', 'mais', 'mas', 'na', 'nas', 'nem', 'no', 'nos', 'o', 'os',
  'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por', 'que', 'se', 'sem', 'ser', 'seu', 'sua', 'um', 'uma',
])

const GENERIC_EDGE_WORDS = new Set([
  'a', 'as', 'o', 'os', 'um', 'uma', 'e', 'mas', 'ou', 'de', 'do', 'da', 'em', 'no', 'na', 'por', 'para', 'que',
])

const DETERMINERS = new Set(['a', 'as', 'o', 'os', 'um', 'uma', 'uns', 'umas', 'este', 'esta', 'esse', 'essa', 'aquele', 'aquela'])
const PRONOUNS = new Set(['eu', 'tu', 'ele', 'ela', 'nos', 'nós', 'vos', 'vós', 'eles', 'elas', 'me', 'te', 'se', 'lhe', 'lhes', 'quem'])
const PREPOSITIONS = new Set(['a', 'ante', 'apos', 'após', 'ate', 'até', 'com', 'contra', 'de', 'desde', 'em', 'entre', 'para', 'per', 'perante', 'por', 'sem', 'sob', 'sobre'])
const CONJUNCTIONS = new Set(['e', 'nem', 'ou', 'mas', 'porque', 'pois', 'quando', 'enquanto', 'embora', 'se', 'como'])
const VERB_FORMS = new Set(['e', 'é', 'era', 'foi', 'sao', 'são', 'esta', 'está', 'estao', 'estão', 'tem', 'têm', 'teve', 'ha', 'há', 'havia', 'vai', 'vao', 'vão', 'vem'])

const ANTITHESIS_PAIRS = [
  ['vida', 'morte'],
  ['amor', 'odio'],
  ['luz', 'sombra'],
  ['dia', 'noite'],
  ['verdade', 'mentira'],
  ['presenca', 'ausencia'],
  ['liberdade', 'prisao'],
  ['calor', 'frio'],
  ['claro', 'escuro'],
  ['perto', 'longe'],
  ['antes', 'depois'],
  ['dentro', 'fora'],
  ['inicio', 'fim'],
  ['subir', 'descer'],
  ['rir', 'chorar'],
] as const

const INANIMATE_NOUNS = new Set([
  'cidade', 'casa', 'chuva', 'estrada', 'fogo', 'lua', 'mar', 'memoria', 'noite', 'rio', 'rua', 'silencio', 'sol',
  'sombra', 'tempo', 'terra', 'vento', 'janela', 'porta', 'parede', 'livro', 'palavra', 'saudade', 'medo',
])

const HUMAN_VERB_STEMS = [
  'abrac', 'acord', 'cant', 'cham', 'chor', 'convers', 'danc', 'dorm', 'escut', 'esper', 'fal', 'grit', 'ment',
  'olh', 'ri', 'rindo', 'sorr', 'sussurr', 'caminh', 'lembr', 'esquec', 'recus', 'ped',
] as const

const OXYMORON_PAIRS = [
  ['silencio', 'ensurdecedor'],
  ['grito', 'mudo'],
  ['presenca', 'ausente'],
  ['fogo', 'frio'],
  ['doce', 'amargo'],
  ['luz', 'escura'],
  ['calma', 'furiosa'],
  ['ordem', 'caotica'],
] as const

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('pt-BR')
}

function words(value: string): string[] {
  return normalize(value).match(/\p{L}+(?:['’-]\p{L}+)?/gu) ?? []
}

function compactFragment(text: string, from: number, to: number): string {
  const clean = text.slice(from, to).replace(/\s+/g, ' ').trim()
  return clean.length > 240 ? `${clean.slice(0, 237).trimEnd()}…` : clean
}

function trimUnit(raw: string, absoluteFrom: number): Unit | null {
  const first = raw.search(/\S/u)
  if (first < 0) return null
  let last = raw.length
  while (last > first && /\s/u.test(raw[last - 1] ?? '')) last -= 1
  return {
    text: raw.slice(first, last),
    from: absoluteFrom + first,
    to: absoluteFrom + last,
  }
}

function collectLines(text: string): Unit[] {
  const result: Unit[] = []
  for (const match of text.matchAll(/[^\n]+/g)) {
    const unit = trimUnit(match[0], match.index ?? 0)
    if (unit && words(unit.text).length > 0) result.push(unit)
  }
  return result
}

function collectSentences(text: string): Unit[] {
  const result: Unit[] = []
  const pattern = /[^.!?\n]+(?:[.!?]+(?=\s|$)|$)/g
  for (const match of text.matchAll(pattern)) {
    const unit = trimUnit(match[0], match.index ?? 0)
    if (unit && words(unit.text).length > 0) result.push(unit)
  }
  return result
}

function makeFinding(
  type: FigureType,
  confidence: FigureConfidence,
  scale: FigureScale,
  text: string,
  from: number,
  to: number,
  evidence: string,
  effect: string,
): FigureFinding {
  return {
    id: `${type}-${from}-${to}`,
    type,
    label: LABELS[type],
    confidence,
    scale,
    fragment: compactFragment(text, from, to),
    textRange: { from, to },
    evidence,
    effect,
  }
}

function ensureLegacyAnalysis(): LegacyAnalysisApi | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null
  const target = window as LegacyAnalysisWindow
  if (target.VeredaAnalise?.analisar) return target.VeredaAnalise

  if (!document.querySelector('script[data-escrevaral-engine="analise-engine.js"]')) {
    const script = document.createElement('script')
    script.dataset.escrevaralEngine = 'analise-engine.js'
    script.textContent = `${analysisSource}\n//# sourceURL=analise-engine.js`
    document.head.append(script)
  }

  return target.VeredaAnalise ?? null
}

function readLegacyPleonasmPhrases(text: string): string[] {
  const phrases = new Set<string>()
  try {
    const result = ensureLegacyAnalysis()?.analisar?.(text)
    if (result && typeof result === 'object') {
      const economia = (result as Record<string, unknown>).economia
      const redundancia = economia && typeof economia === 'object'
        ? (economia as Record<string, unknown>).redundancia
        : null
      const lista = redundancia && typeof redundancia === 'object'
        ? (redundancia as Record<string, unknown>).lista
        : null
      if (Array.isArray(lista)) {
        lista.forEach((item) => {
          if (typeof item === 'string' && item.trim()) phrases.add(item.trim())
        })
      }
    }
  } catch (error) {
    console.warn('[Escrevaral] O repertório amplo de pleonasmos não pôde ser consultado.', error)
  }

  const lower = normalize(text)
  FALLBACK_PLEONASMS.forEach((phrase) => {
    if (lower.includes(normalize(phrase))) phrases.add(phrase)
  })
  return [...phrases]
}

function detectPleonasms(text: string): FigureFinding[] {
  const normalizedText = normalize(text)
  const results: FigureFinding[] = []
  for (const phrase of readLegacyPleonasmPhrases(text)) {
    const needle = normalize(phrase)
    if (!needle) continue
    let offset = 0
    while (offset < normalizedText.length) {
      const index = normalizedText.indexOf(needle, offset)
      if (index < 0) break
      results.push(makeFinding(
        'pleonasmo',
        'forte',
        'micro',
        text,
        index,
        index + phrase.length,
        `A expressão “${text.slice(index, index + phrase.length)}” coincide com um padrão redundante do repertório local.`,
        'Em literatura, a repetição de sentido pode ser vício ou reforço deliberado. A leitura aponta a construção; não manda removê-la.',
      ))
      offset = index + Math.max(1, needle.length)
    }
  }
  return results
}

function startsWithTokens(unit: Unit, key: string[]): boolean {
  const tokens = words(unit.text)
  return key.every((token, index) => tokens[index] === token)
}

function endsWithTokens(unit: Unit, key: string[]): boolean {
  const tokens = words(unit.text)
  if (tokens.length < key.length) return false
  const offset = tokens.length - key.length
  return key.every((token, index) => tokens[offset + index] === token)
}

function validEdgeKey(key: string[]): boolean {
  if (!key.length) return false
  if (key.length === 1 && GENERIC_EDGE_WORDS.has(key[0] ?? '')) return false
  return key.join('').length >= 2
}

function repeatedEdgeFindings(text: string, units: Unit[], type: 'anafora' | 'epifora'): FigureFinding[] {
  const findings: FigureFinding[] = []
  let index = 0
  while (index < units.length - 1) {
    const current = words(units[index]?.text ?? '')
    const next = words(units[index + 1]?.text ?? '')
    let key: string[] = []

    for (let size = Math.min(4, current.length, next.length); size >= 1; size -= 1) {
      const candidate = type === 'anafora' ? current.slice(0, size) : current.slice(-size)
      const matches = type === 'anafora'
        ? startsWithTokens(units[index + 1]!, candidate)
        : endsWithTokens(units[index + 1]!, candidate)
      if (matches && validEdgeKey(candidate)) {
        key = candidate
        break
      }
    }

    if (!key.length) {
      index += 1
      continue
    }

    let end = index + 1
    while (end + 1 < units.length) {
      const matches = type === 'anafora'
        ? startsWithTokens(units[end + 1]!, key)
        : endsWithTokens(units[end + 1]!, key)
      if (!matches) break
      end += 1
    }

    const repeated = key.join(' ')
    findings.push(makeFinding(
      type,
      'forte',
      'sequência',
      text,
      units[index]!.from,
      units[end]!.to,
      `${type === 'anafora' ? 'A abertura' : 'O fechamento'} “${repeated}” retorna em ${end - index + 1} unidades consecutivas.`,
      type === 'anafora'
        ? 'A retomada no início cria martelo, continuidade e expectativa rítmica.'
        : 'A retomada no fim cria eco, fechamento e insistência sonora ou semântica.',
    ))
    index = end + 1
  }
  return findings
}

function tokenClass(token: string): string {
  if (DETERMINERS.has(token)) return 'DET'
  if (PRONOUNS.has(token)) return 'PRO'
  if (PREPOSITIONS.has(token)) return 'PREP'
  if (CONJUNCTIONS.has(token)) return 'CONJ'
  if (VERB_FORMS.has(token) || (token.length >= 4 && /(ar|er|ir|ava|avam|iam|ando|endo|indo|ado|ido|aram|eram|iram|asse|esse|isse|aria|eria|iria)$/u.test(token))) return 'V'
  if (token.endsWith('mente')) return 'ADV'
  return 'X'
}

function structureSignature(unit: Unit): { signature: string; size: number } | null {
  const tokens = words(unit.text)
  if (tokens.length < 4) return null
  const slice = tokens.slice(0, Math.min(8, tokens.length))
  return { signature: slice.map(tokenClass).join('-'), size: tokens.length }
}

function detectParallelism(text: string, units: Unit[]): FigureFinding[] {
  const findings: FigureFinding[] = []
  let index = 0
  while (index < units.length - 1) {
    const base = structureSignature(units[index]!)
    const next = structureSignature(units[index + 1]!)
    if (!base || !next || base.signature !== next.signature || Math.abs(base.size - next.size) > 2) {
      index += 1
      continue
    }

    let end = index + 1
    while (end + 1 < units.length) {
      const candidate = structureSignature(units[end + 1]!)
      if (!candidate || candidate.signature !== base.signature || Math.abs(candidate.size - base.size) > 2) break
      end += 1
    }

    findings.push(makeFinding(
      'paralelismo',
      'provável',
      'sequência',
      text,
      units[index]!.from,
      units[end]!.to,
      `A mesma armação sintática aproximada (${base.signature}) reaparece em ${end - index + 1} unidades próximas.`,
      'Estruturas paralelas podem organizar argumento, cena ou cadência. Vale observar se a repetição sustenta o efeito desejado.',
    ))
    index = end + 1
  }
  return findings
}

function detectPolysyndeton(text: string, sentences: Unit[]): FigureFinding[] {
  const findings: FigureFinding[] = []
  for (const sentence of sentences) {
    const tokens = words(sentence.text)
    const counts = new Map<string, number>()
    tokens.forEach((token) => {
      if (['e', 'nem', 'ou'].includes(token)) counts.set(token, (counts.get(token) ?? 0) + 1)
    })
    const strongest = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    if (!strongest || strongest[1] < 3) continue
    findings.push(makeFinding(
      'polissindeto',
      'forte',
      'frase',
      text,
      sentence.from,
      sentence.to,
      `A conjunção “${strongest[0]}” aparece ${strongest[1]} vezes na mesma unidade.`,
      'A repetição de conjunções pode alongar a respiração, acumular ações ou dar solenidade e insistência.',
    ))
  }
  return findings
}

function detectAsyndeton(text: string, sentences: Unit[]): FigureFinding[] {
  const findings: FigureFinding[] = []
  for (const sentence of sentences) {
    const commaCount = (sentence.text.match(/,/g) ?? []).length
    const semicolonCount = (sentence.text.match(/;/g) ?? []).length
    if (commaCount + semicolonCount < 3) continue
    const conjunctionCount = words(sentence.text).filter((token) => ['e', 'nem', 'ou', 'mas'].includes(token)).length
    if (conjunctionCount > 1) continue
    const parts = sentence.text.split(/[,;]/).map((part) => part.trim()).filter(Boolean)
    if (parts.length < 4) continue
    findings.push(makeFinding(
      'assindeto',
      'provável',
      'frase',
      text,
      sentence.from,
      sentence.to,
      `A unidade encadeia ${parts.length} segmentos por vírgulas/ponto e vírgula, com pouca ou nenhuma conjunção.`,
      'A enumeração sem conectores pode acelerar o texto, comprimir imagens ou produzir sensação de acúmulo.',
    ))
  }
  return findings
}

function detectAlliteration(text: string, units: Unit[]): FigureFinding[] {
  const findings: FigureFinding[] = []
  for (const unit of units) {
    const content = words(unit.text).filter((token) => token.length >= 3 && !STOPWORDS.has(token))
    if (content.length < 5) continue
    const groups = new Map<string, string[]>()
    for (const token of content) {
      const initial = token[0] ?? ''
      if (!initial || /[aeiou]/u.test(initial)) continue
      const bucket = groups.get(initial) ?? []
      bucket.push(token)
      groups.set(initial, bucket)
    }
    const strongest = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)[0]
    if (!strongest) continue
    const distinct = new Set(strongest[1])
    const hits = strongest[1].length
    if (distinct.size < 3 || hits < 4 || hits / content.length < 0.4) continue
    findings.push(makeFinding(
      'aliteracao',
      'provável',
      'frase',
      text,
      unit.from,
      unit.to,
      `Há ${hits} palavras relevantes iniciadas por “${strongest[0]}” nesta unidade (${[...distinct].slice(0, 5).join(', ')}).`,
      'A recorrência consonantal pode criar textura sonora, velocidade, atrito ou unidade de voz.',
    ))
  }
  return findings
}

function detectAntithesis(text: string, sentences: Unit[]): FigureFinding[] {
  const findings: FigureFinding[] = []
  for (const sentence of sentences) {
    const tokens = new Set(words(sentence.text))
    for (const [left, right] of ANTITHESIS_PAIRS) {
      if (!tokens.has(left) || !tokens.has(right)) continue
      findings.push(makeFinding(
        'antitese',
        'provável',
        'frase',
        text,
        sentence.from,
        sentence.to,
        `Os polos “${left}” e “${right}” aparecem na mesma unidade.`,
        'A aproximação de contrários pode estruturar conflito, contraste, virada ou ambivalência.',
      ))
      break
    }
  }
  return findings
}

function detectPersonification(text: string, sentences: Unit[]): FigureFinding[] {
  const findings: FigureFinding[] = []
  for (const sentence of sentences) {
    const tokens = words(sentence.text)
    let nounIndex = -1
    let noun = ''
    for (let index = 0; index < tokens.length; index += 1) {
      if (INANIMATE_NOUNS.has(tokens[index] ?? '')) {
        nounIndex = index
        noun = tokens[index] ?? ''
        break
      }
    }
    if (nounIndex < 0) continue

    let verb = ''
    for (let index = nounIndex + 1; index < Math.min(tokens.length, nounIndex + 8); index += 1) {
      const token = tokens[index] ?? ''
      if (HUMAN_VERB_STEMS.some((stem) => token.startsWith(stem))) {
        verb = token
        break
      }
    }
    if (!verb) continue

    findings.push(makeFinding(
      'personificacao',
      'possível',
      'frase',
      text,
      sentence.from,
      sentence.to,
      `Um referente não humano (“${noun}”) aparece ligado a uma ação tipicamente humana (“${verb}”).`,
      'Pode haver personificação, mas a engine não conhece a intenção nem o referente completo. Leia como hipótese, não como classificação fechada.',
    ))
  }
  return findings
}

function detectOxymoron(text: string, sentences: Unit[]): FigureFinding[] {
  const findings: FigureFinding[] = []
  for (const sentence of sentences) {
    const tokens = words(sentence.text)
    for (const [left, right] of OXYMORON_PAIRS) {
      const leftIndex = tokens.indexOf(left)
      const rightIndex = tokens.indexOf(right)
      if (leftIndex < 0 || rightIndex < 0 || Math.abs(leftIndex - rightIndex) > 3) continue
      findings.push(makeFinding(
        'oximoro',
        'possível',
        'micro',
        text,
        sentence.from,
        sentence.to,
        `Termos semanticamente tensionados (“${left}” / “${right}”) aparecem muito próximos.`,
        'A proximidade pode condensar uma contradição expressiva; também pode ser apenas contraste contextual.',
      ))
      break
    }
  }
  return findings
}

function deduplicate(findings: FigureFinding[]): FigureFinding[] {
  const exact = new Map<string, FigureFinding>()
  for (const finding of findings) {
    const key = `${finding.type}:${finding.textRange.from}:${finding.textRange.to}`
    if (!exact.has(key)) exact.set(key, finding)
  }

  const sorted = [...exact.values()].sort((a, b) => {
    if (a.textRange.from !== b.textRange.from) return a.textRange.from - b.textRange.from
    if (a.textRange.to !== b.textRange.to) return a.textRange.to - b.textRange.to
    return a.type.localeCompare(b.type, 'pt-BR')
  })

  const result: FigureFinding[] = []
  for (const finding of sorted) {
    const previous = result.at(-1)
    if (
      previous
      && previous.type === finding.type
      && finding.textRange.from >= previous.textRange.from
      && finding.textRange.to <= previous.textRange.to
    ) continue
    result.push(finding)
  }
  return result.slice(0, 120)
}

export function analyzeFigures(text: string): FigureReading {
  const clean = text.trim()
  if (!clean) {
    return {
      findings: [],
      counts: { total: 0, forte: 0, provavel: 0, possivel: 0 },
      byType: [],
      coverage: [...COVERAGE],
    }
  }

  const sentences = collectSentences(text)
  const lines = collectLines(text)
  const shortLines = lines.length >= 3 && lines.filter((line) => words(line.text).length <= 18).length / lines.length >= 0.6
  const sequenceSets = shortLines ? [sentences, lines] : [sentences]

  const findings = deduplicate([
    ...detectPleonasms(text),
    ...sequenceSets.flatMap((units) => repeatedEdgeFindings(text, units, 'anafora')),
    ...sequenceSets.flatMap((units) => repeatedEdgeFindings(text, units, 'epifora')),
    ...sequenceSets.flatMap((units) => detectParallelism(text, units)),
    ...detectPolysyndeton(text, sentences),
    ...detectAsyndeton(text, sentences),
    ...detectAlliteration(text, shortLines ? lines : sentences),
    ...detectAntithesis(text, sentences),
    ...detectPersonification(text, sentences),
    ...detectOxymoron(text, sentences),
  ])

  const countByType = new Map<FigureType, number>()
  findings.forEach((finding) => countByType.set(finding.type, (countByType.get(finding.type) ?? 0) + 1))
  const byType = [...countByType.entries()]
    .map(([type, count]) => ({ type, label: LABELS[type], count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'))

  return {
    findings,
    counts: {
      total: findings.length,
      forte: findings.filter((finding) => finding.confidence === 'forte').length,
      provavel: findings.filter((finding) => finding.confidence === 'provável').length,
      possivel: findings.filter((finding) => finding.confidence === 'possível').length,
    },
    byType,
    coverage: [...COVERAGE],
  }
}
