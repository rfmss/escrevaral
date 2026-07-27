import { useEffect, useRef, useState } from 'react'
import type { EscrevaralDocument } from '../domain/document'
import { detectContextTerms, type ContextTerm } from '../engines/decolonialAdapter'

type Props = {
  document: EscrevaralDocument
}

function occurrenceLabel(count: number): string {
  return `${count} ${count === 1 ? 'ocorrência' : 'ocorrências'}`
}

export function ContextPanel({ document }: Props) {
  const [terms, setTerms] = useState<ContextTerm[]>([])
  const [message, setMessage] = useState('Aguardando uma leitura contextual.')
  const [analyzing, setAnalyzing] = useState(false)
  const tokenRef = useRef(0)

  useEffect(() => {
    tokenRef.current += 1
    setTerms([])
    setAnalyzing(false)
    setMessage('O texto mudou. Examine o contexto novamente quando quiser.')
  }, [document.id, document.plainText])

  const run = async () => {
    const token = ++tokenRef.current
    setAnalyzing(true)
    setMessage('Examinando termos e contextos localmente…')

    try {
      const result = await detectContextTerms(document.plainText)
      if (token !== tokenRef.current) return
      setTerms(result)
      setMessage(
        !document.plainText.trim()
          ? 'A página está vazia. Escreva um pouco antes de examinar o contexto.'
          : result.length
            ? `${result.length} ${result.length === 1 ? 'termo pede' : 'termos pedem'} uma leitura de contexto.`
            : 'Nenhum termo da base contextual apareceu neste recorte.',
      )
    } catch (error) {
      console.error('[Escrevaral] Leitura contextual não concluída.', error)
      if (token !== tokenRef.current) return
      setTerms([])
      setMessage('A leitura contextual não pôde ser concluída agora. O editor continua disponível.')
    } finally {
      if (token === tokenRef.current) setAnalyzing(false)
    }
  }

  return (
    <section className="context-panel">
      <p className="panel-intro">
        Esta leitura aponta expressões que podem pedir atenção histórica, social ou narrativa. Ela não acusa, proíbe nem troca palavras.
      </p>
      <button className="action primary" type="button" onClick={() => { void run() }} disabled={analyzing}>
        {analyzing ? 'Examinando o contexto…' : 'Examinar termos no texto'}
      </button>
      <p className="context-message" role="status">{message}</p>

      <div className="context-list">
        {terms.map((entry) => (
          <article className="context-card" key={entry.id}>
            <div className="context-card-head">
              <div>
                <span className="context-kicker">Termo encontrado</span>
                <h2>{entry.term}</h2>
              </div>
              <span className="context-count">{occurrenceLabel(entry.count)}</span>
            </div>

            <div className="context-category">{entry.categoryLabel}</div>

            {entry.reason && (
              <section className="context-section">
                <h3>Por que observar</h3>
                <p>{entry.reason}</p>
              </section>
            )}

            {entry.context && (
              <section className="context-section context-note">
                <h3>Leitura de contexto</h3>
                <p>{entry.context}</p>
              </section>
            )}

            {entry.alternatives.length > 0 && (
              <section className="context-section">
                <h3>Alternativas possíveis</h3>
                <div className="context-alternatives">
                  {entry.alternatives.map((alternative) => (
                    <span className="context-chip" key={alternative}>{alternative}</span>
                  ))}
                </div>
              </section>
            )}
          </article>
        ))}
      </div>

      <p className="context-disclaimer">
        Considere narrador, personagem, época, citação e intenção crítica. A decisão final é de quem escreve; nenhuma alternativa é aplicada automaticamente.
      </p>
    </section>
  )
}