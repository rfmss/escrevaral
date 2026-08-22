export type CraseCalibrationIssue = {
  id: string
  title: string
  detail: string
  severity: 'alta' | 'média' | 'baixa'
}

function issue(id: string, title: string, detail: string): CraseCalibrationIssue {
  return { id, title, detail, severity: 'alta' }
}

export function analyzeCraseCalibration(text: string): CraseCalibrationIssue[] {
  const issues: CraseCalibrationIssue[] = []

  for (const match of text.matchAll(/(?<!\p{L})à\s+partir\s+de(?!\p{L})/giu)) {
    issues.push(issue(
      `C5-CRASE-PARTIR-${match.index}`,
      'Não há crase em “a partir de”',
      '“Partir” é verbo e não admite artigo feminino. Use “a partir de”, sem acento grave.',
    ))
  }

  const singularPronouns = /(?<!\p{L})à\s+(ela|ele|você|mim|ti|nós|vós)(?!\p{L})/giu
  for (const match of text.matchAll(singularPronouns)) {
    issues.push(issue(
      `C5-CRASE-PRONOME-${match.index}`,
      'Pronome pessoal não recebe crase neste contexto',
      `Use “a ${match[1]}”, sem acento grave: diante de pronome pessoal não há artigo feminino para formar crase.`,
    ))
  }

  const pluralPronouns = /(?<!\p{L})às\s+(elas|eles|vocês)(?!\p{L})/giu
  for (const match of text.matchAll(pluralPronouns)) {
    issues.push(issue(
      `C5-CRASE-PRONOME-${match.index}`,
      'Pronome pessoal não recebe crase neste contexto',
      `Use “a ${match[1]}”, sem acento grave: diante de pronome pessoal não há artigo feminino para formar crase.`,
    ))
  }

  return issues
}
