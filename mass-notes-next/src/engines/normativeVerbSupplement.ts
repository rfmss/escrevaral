export type NormativeVerbIssue = {
  id: string
  title: string
  detail: string
  severity: 'alta' | 'média' | 'baixa'
}

const PLURAL_QUANTIFIER = '(?:os|as|muitos|muitas|vários|várias|alguns|algumas|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|catorze|quinze|vinte|trinta|cem|mil)'
const PLURAL_NOUN = '[\\p{L}][\\p{L}-]{2,}s'
const TIME_UNIT = '(?:anos|meses|semanas|dias|horas|minutos|segundos)'
const TIME_AMOUNT = '(?:\\d+|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|quatorze|catorze|quinze|vinte|trinta|muitos|muitas|vários|várias)'

function issue(id: string, title: string, detail: string): NormativeVerbIssue {
  return { id, title, detail, severity: 'alta' }
}

function pluralHaverExistential(text: string): NormativeVerbIssue[] {
  const issues: NormativeVerbIssue[] = []
  const pattern = new RegExp(`\\b(houveram|haviam|haverão|haveriam)\\s+(${PLURAL_QUANTIFIER}\\s+)?(${PLURAL_NOUN})\\b`, 'giu')

  for (const match of text.matchAll(pattern)) {
    const after = text.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 28)
    // Evita a inversão rara de tempo composto: "haviam os autores chegado".
    if (/^\s+[\p{L}-]+(?:ado|ada|ados|adas|ido|ida|idos|idas|to|ta|tos|tas|so|sa|sos|sas|cho|cha|chos|chas)\b/iu.test(after)) continue

    const form = match[1].toLocaleLowerCase('pt-BR')
    const replacement = form === 'houveram'
      ? 'houve'
      : form === 'haviam'
        ? 'havia'
        : form === 'haverão'
          ? 'haverá'
          : 'haveria'

    issues.push(issue(
      `C2-HAVER-${match.index}`,
      'Haver existencial permanece no singular',
      `Em sentido de existir, “${match[1]}” é impessoal. Neste contexto, prefira “${replacement}”.`,
    ))
  }

  return issues
}

function pluralFazerElapsedTime(text: string): NormativeVerbIssue[] {
  const issues: NormativeVerbIssue[] = []
  const pattern = new RegExp(`(?:^|[.!?]\\s+|\\b(?:já|ainda|agora)\\s+)(fazem|faziam|farão|fariam)\\s+(${TIME_AMOUNT})\\s+(${TIME_UNIT})\\b`, 'gimu')

  for (const match of text.matchAll(pattern)) {
    const form = match[1].toLocaleLowerCase('pt-BR')
    const replacement = form === 'fazem'
      ? 'faz'
      : form === 'faziam'
        ? 'fazia'
        : form === 'farão'
          ? 'fará'
          : 'faria'

    issues.push(issue(
      `C2-FAZER-${match.index}`,
      'Fazer temporal permanece no singular',
      `Na indicação de tempo decorrido, “${match[1]}” é impessoal. Neste contexto, prefira “${replacement} ${match[2]} ${match[3]}”.`,
    ))
  }

  return issues
}

function singularExistirWithPluralSubject(text: string): NormativeVerbIssue[] {
  const issues: NormativeVerbIssue[] = []
  const pattern = new RegExp(`\\b(existe|existia|existirá|existiria)\\s+(${PLURAL_QUANTIFIER})\\s+(${PLURAL_NOUN})\\b`, 'giu')

  for (const match of text.matchAll(pattern)) {
    const form = match[1].toLocaleLowerCase('pt-BR')
    const replacement = form === 'existe'
      ? 'existem'
      : form === 'existia'
        ? 'existiam'
        : form === 'existirá'
          ? 'existirão'
          : 'existiriam'

    issues.push(issue(
      `C2-EXISTIR-${match.index}`,
      'Existir concorda com o sujeito',
      `Diferentemente de “haver” existencial, “existir” é pessoal. Com sujeito plural, prefira “${replacement}”.`,
    ))
  }

  return issues
}

function singularAuxiliaryWithExistir(text: string): NormativeVerbIssue[] {
  const issues: NormativeVerbIssue[] = []
  const pattern = new RegExp(`\\b(deve|deveria|pode|poderia)\\s+existir\\s+(${PLURAL_QUANTIFIER})\\s+(${PLURAL_NOUN})\\b`, 'giu')

  for (const match of text.matchAll(pattern)) {
    const form = match[1].toLocaleLowerCase('pt-BR')
    const replacement = form === 'deve'
      ? 'devem'
      : form === 'deveria'
        ? 'deveriam'
        : form === 'pode'
          ? 'podem'
          : 'poderiam'

    issues.push(issue(
      `C2-EXISTIR-AUX-${match.index}`,
      'O auxiliar concorda com o sujeito de existir',
      `Como “existir” tem sujeito, a locução acompanha o plural neste contexto: “${replacement} existir…”.`,
    ))
  }

  return issues
}

function pluralAuxiliaryWithHaver(text: string): NormativeVerbIssue[] {
  const issues: NormativeVerbIssue[] = []
  const pattern = new RegExp(`\\b(devem|deveriam|podem|poderiam)\\s+haver\\s+(${PLURAL_QUANTIFIER})\\s+(${PLURAL_NOUN})\\b`, 'giu')

  for (const match of text.matchAll(pattern)) {
    const form = match[1].toLocaleLowerCase('pt-BR')
    const replacement = form === 'devem'
      ? 'deve'
      : form === 'deveriam'
        ? 'deveria'
        : form === 'podem'
          ? 'pode'
          : 'poderia'

    issues.push(issue(
      `C2-HAVER-AUX-${match.index}`,
      'A impessoalidade de haver alcança o auxiliar',
      `Em sentido existencial, a locução é impessoal. Neste contexto, prefira “${replacement} haver…”.`,
    ))
  }

  return issues
}

export function analyzeNormativeVerbCalibration(text: string): NormativeVerbIssue[] {
  if (!text.trim()) return []
  return [
    ...pluralHaverExistential(text),
    ...pluralFazerElapsedTime(text),
    ...singularExistirWithPluralSubject(text),
    ...singularAuxiliaryWithExistir(text),
    ...pluralAuxiliaryWithHaver(text),
  ]
}
