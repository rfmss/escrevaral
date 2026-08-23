import { useEffect, useState } from 'react'
import type { EscrevaralDocument } from '../domain/document'
import { analyzeFigures, type FigureReading } from '../engines/figuresEngine'

type Props = {
  document: EscrevaralDocument
}

function confidenceLabel(value: 'forte' | 'provável' | 'possível'): string {
  if (value === 'forte') return 'sinal forte'
  if (value === 'provável') return 'provável'
  return 'hipótese'
}

export function FiguresPanel({ document }: Props) {
  const [reading, setReading] = useState<FigureReading | null>(null)
  const [message, setMessage] = useState('Aguardando o mapa retórico.')
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    setReading(null)
    setAnalyzing(false)
    setMessage('O texto mudou. Faça um novo mapa quando quiser.')
  }, [document.id, document.plainText])

  const run = () => {
    setAnalyzing(true)
    try {
      const result = analyzeFigures(document.plainText)
      setReading(result)
      if (!document.plainText.trim()) {
        setMessage('A página está vazia. Escreva um pouco antes de mapear as figuras.')
      } else if (!result.findings.length) {
        setMessage('Nenhum dos padrões formais cobertos apareceu com sinal suficiente nesta página.')
      } else {
        setMessage(`${result.findings.length} ${result.findings.length === 1 ? 'ocorrência mapeada' : 'ocorrências mapeadas'} em ${result.byType.length} ${result.byType.length === 1 ? 'família retórica' : 'famílias retóricas'}.`)
      }
    } catch (error) {
      console.error('[Escrevaral] Mapa de figuras não concluído.', error)
      setReading(null)
      setMessage('O mapa retórico não pôde concluir a leitura agora.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <section className="figures-panel" aria-label="Figuras de linguagem">
      <p className="panel-intro">
        Procura recorrências retóricas do detalhe à sequência: repetição, paralelismo, som e contraste. O texto não é corrigido nem reescrito.
      </p>
      <button className="action primary" type="button" onClick={run} disabled={analyzing}>
        {analyzing ? 'Mapeando figuras…' : 'Mapear figuras de linguagem'}
      </button>
      <p className="figures-message" aria-live="polite">{message}</p>

      {reading && reading.findings.length > 0 && (
        <div className="figures-reading">
          <div className="voice-metrics" aria-label="Resumo das figuras de linguagem">
            <div><strong>{reading.counts.total}</strong><span>ocorrências</span></div>
            <div><strong>{reading.counts.forte}</strong><span>sinais fortes</span></div>
            <div><strong>{reading.counts.provavel + reading.counts.possivel}</strong><span>hipóteses</span></div>
          </div>

          <section className="voice-section" aria-labelledby="figures-map-title">
            <h3 id="figures-map-title">Mapa desta página</h3>
            <div className="chip-row" aria-label="Contagem por figura">
              {reading.byType.map((item) => (
                <span className="chip active" key={item.type}>{item.label} · {item.count}</span>
              ))}
            </div>
          </section>

          <section className="review-located" aria-labelledby="figures-found-title">
            <h3 id="figures-found-title">Trechos encontrados</h3>
            <div className="review-located-list">
              {reading.findings.map((finding) => (
                <article className="review-located-card severity-baixa" key={finding.id}>
                  <span className="review-source">{finding.scale} · {confidenceLabel(finding.confidence)}</span>
                  <strong>{finding.label}</strong>
                  <blockquote>{finding.fragment}</blockquote>
                  <p>{finding.evidence}</p>
                  <p><strong>Efeito possível:</strong> {finding.effect}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      <p className="figures-disclaimer">
        A engine afirma apenas padrões formais de alta evidência. Personificação e oxímoro entram como hipótese. Metáfora, metonímia e ironia não são declaradas por regra nesta etapa.
      </p>
    </section>
  )
}
