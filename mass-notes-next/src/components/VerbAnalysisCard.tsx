import type { VerbAnalysis, VerbCandidate } from '../engines/verbMorphology/types'

type Props = {
  analysis: VerbAnalysis
}

function capitalize(value: string): string {
  return value ? `${value[0].toLocaleUpperCase('pt-BR')}${value.slice(1)}` : value
}

function tenseLabel(candidate: VerbCandidate): string {
  if (!candidate.tense) return capitalize(candidate.formType)
  if (candidate.mood === 'indicativo' && [
    'presente',
    'pretérito perfeito',
    'pretérito imperfeito',
    'pretérito mais-que-perfeito',
    'futuro do presente',
    'futuro do pretérito',
  ].includes(candidate.tense)) {
    return `${capitalize(candidate.tense)} do indicativo`
  }
  return capitalize(candidate.tense)
}

function personLabel(candidate: VerbCandidate): string {
  if (!candidate.person || !candidate.number) return 'Não se aplica ou não foi determinada'
  return `${candidate.person}ª pessoa do ${candidate.number}`
}

function voiceLabel(candidate: VerbCandidate): string {
  return capitalize(candidate.voice)
}

function candidateLabel(candidate: VerbCandidate): string {
  const pieces = [candidate.lemma, tenseLabel(candidate)]
  if (candidate.person && candidate.number) pieces.push(personLabel(candidate))
  if (candidate.voice !== 'ativa') pieces.push(`voz ${candidate.voice}`)
  return pieces.join(' · ')
}

export function VerbAnalysisCard({ analysis }: Props) {
  const primary = analysis.primary
  return (
    <section className="verb-formation" data-verb-analysis aria-labelledby="verb-analysis-title">
      <div className="verb-formation-heading">
        <span>Leitura verbal</span>
        <h3 id="verb-analysis-title">{tenseLabel(primary)}</h3>
        <strong>{analysis.placement ? capitalize(analysis.placement) : capitalize(primary.formType)}</strong>
      </div>

      <p className="lexical-decision">{capitalize(analysis.decision)}</p>
      {analysis.inputNote && <p className="verb-formation-note">{analysis.inputNote}</p>}
      {analysis.contextNote && <p className="verb-formation-note">{analysis.contextNote}</p>}

      <div className="verb-formation-section">
        <h4>Classificação</h4>
        <dl>
          <div><dt>Lema</dt><dd>{primary.lemma}</dd></div>
          <div><dt>Forma normativa</dt><dd>{analysis.canonicalForm}</dd></div>
          <div><dt>Tipo</dt><dd>{capitalize(primary.formType)}</dd></div>
          {primary.mood && <div><dt>Modo</dt><dd>{capitalize(primary.mood)}</dd></div>}
          <div><dt>Pessoa e número</dt><dd>{personLabel(primary)}</dd></div>
          <div><dt>Voz</dt><dd>{voiceLabel(primary)}</dd></div>
          {primary.aspect && <div><dt>Aspecto</dt><dd>{capitalize(primary.aspect)}</dd></div>}
        </dl>
      </div>

      {analysis.decomposition.length > 1 && (
        <div className="verb-formation-section">
          <h4>Entendendo a forma</h4>
          <p data-verb-decomposition>{analysis.decomposition.join(' + ')}</p>
        </div>
      )}

      {analysis.clitics.length > 0 && (
        <div className="verb-formation-section">
          <h4>Pronome e colocação</h4>
          <dl>
            {analysis.clitics.map((clitic, index) => (
              <div key={`${clitic.surface}:${index}`}>
                <dt>{clitic.surface}</dt>
                <dd>{clitic.functionName}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {analysis.orthographicNotes.length > 0 && (
        <div className="verb-formation-section">
          <h4>Ajuste ortográfico</h4>
          <ul>{analysis.orthographicNotes.map((note) => <li key={note}>{note}</li>)}</ul>
        </div>
      )}

      {analysis.equivalents.length > 0 && (
        <div className="verb-formation-section">
          <h4>Equivale a</h4>
          <ul>{analysis.equivalents.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}

      {analysis.alternatives.length > 0 && (
        <div className="verb-formation-section verb-alternatives">
          <h4>Outras análises possíveis</h4>
          <ul>{analysis.alternatives.map((candidate, index) => (
            <li key={`${candidate.lemma}:${candidate.tense}:${candidate.person}:${candidate.number}:${index}`}>
              {candidateLabel(candidate)}
            </li>
          ))}</ul>
        </div>
      )}

      {analysis.evidence.length > 0 && (
        <div className="verb-formation-section verb-evidence">
          <h4>Por que esta leitura</h4>
          <ul>{analysis.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </section>
  )
}
