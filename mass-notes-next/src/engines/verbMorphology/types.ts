export type VerbMood = 'indicativo' | 'subjuntivo' | 'imperativo'

export type VerbTense =
  | 'presente'
  | 'pretérito perfeito'
  | 'pretérito imperfeito'
  | 'pretérito mais-que-perfeito'
  | 'futuro do presente'
  | 'futuro do pretérito'
  | 'presente do subjuntivo'
  | 'pretérito imperfeito do subjuntivo'
  | 'futuro do subjuntivo'
  | 'imperativo afirmativo'
  | 'imperativo negativo'
  | 'infinitivo pessoal'
  | 'pretérito perfeito composto'
  | 'pretérito mais-que-perfeito composto'
  | 'futuro do presente composto'
  | 'futuro do pretérito composto'
  | 'presente progressivo'
  | 'pretérito imperfeito progressivo'
  | 'futuro perifrástico'
  | 'construção passiva'

export type VerbFormType =
  | 'finita'
  | 'infinitivo'
  | 'infinitivo pessoal'
  | 'gerúndio'
  | 'particípio'
  | 'locução verbal'

export type VerbPerson = 1 | 2 | 3
export type VerbNumber = 'singular' | 'plural'
export type VerbPlacement = 'próclise' | 'ênclise' | 'mesóclise'
export type VerbVoice = 'ativa' | 'passiva' | 'reflexiva' | 'indeterminada'
export type VerbDecision = 'classificado' | 'provável' | 'ambíguo' | 'indeterminado'
export type VerbSource = 'regular' | 'irregular' | 'locução'

export type VerbClitic = {
  surface: string
  base: string
  functionName: string
  gender?: 'masculino' | 'feminino'
  number?: VerbNumber
}

export type VerbCandidate = {
  lemma: string
  formType: VerbFormType
  mood?: VerbMood
  tense?: VerbTense
  person?: VerbPerson
  number?: VerbNumber
  voice: VerbVoice
  source: VerbSource
  auxiliary?: string
  mainVerb?: string
  aspect?: string
  label: string
}

export type VerbSelectionContext = {
  text: string
  before?: string
  after?: string
  fullText?: string
}

export type VerbAnalysis = {
  surface: string
  canonicalForm: string
  primary: VerbCandidate
  alternatives: VerbCandidate[]
  lemmaCandidates: string[]
  clitics: VerbClitic[]
  placement?: VerbPlacement
  decomposition: string[]
  orthographicNotes: string[]
  equivalents: string[]
  decision: VerbDecision
  evidence: string[]
  contextNote?: string
  inputNote?: string
}
