import { useEffect, useMemo, useRef, useState } from 'react'
import { countWords, type EscrevaralDocument } from '../domain/document'
import { readLiveEditorSnapshot, subscribeLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import {
  analyzePrecision,
  listPrecisionTemplates,
  type PrecisionCheck,
  type PrecisionReading,
} from '../engines/precisionAdapter'

type Props = {
  document: EscrevaralDocument
  onTemplateId: (templateId: string | null) => void
}

function Checks({ title, items }: { title: string; items: PrecisionCheck[] }) {
  if (!items.length) return null
  return (
    <section className="precision-checks">
      <h4 className="section-label">{title}</h4>
      <div className="review-list">
        {items.map((item) => (
          <article className={`review-card ${item.passed ? 'severity-baixo' : 'severity-moderado'}`} key={item.label}>
            <strong>{item.label}</strong>
            <p>{item.score}/100{item.hint ? ` · ${item.hint}` : ''}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function PrecisionPanel({ document, onTemplateId }: Props) {
  const templates = useMemo(() => listPrecisionTemplates(), [])
  const grouped = useMemo(() => {
    const result = new Map<string, typeof templates>()
    templates.forEach((template) => {
      const group = result.get(template.oficioLabel) ?? []
      group.push(template)
      result.set(template.oficioLabel, group)
    })
    return result
  }, [templates])
  const [reading, setReading] = useState<PrecisionReading | null>(null)
  const [message, setMessage] = useState('Associe um guia editorial ao documento para avaliar sua aderência.')
  const [busy, setBusy] = useState(false)
  const tokenRef = useRef(0)
  const templateId = document.templateId?.trim() || ''
  const selectedTemplate = templates.find((template) => template.id === templateId) ?? null
  const words = countWords(document.plainText)

  useEffect(() => {
    tokenRef.current += 1
    setReading(null)
    setBusy(false)
    setMessage(
      !templateId
        ? 'Associe um guia editorial ao documento para avaliar sua aderência.'
        : words < 50
          ? 'O guia já está associado. A avaliação abre a partir de 50 palavras.'
          : 'Guia associado. Avalie quando quiser.',
    )

    return subscribeLiveEditorSnapshot((snapshot) => {
      if (snapshot.documentId !== document.id) return
      tokenRef.current += 1
      setReading(null)
      setBusy(false)
      setMessage('O texto mudou. Avalie novamente para usar a versão atual.')
    })
  }, [document.id, templateId, words])

  const run = async () => {
    if (!templateId) return
    const live = readLiveEditorSnapshot(document.id)
    const sourceText = live?.plainText ?? document.plainText
    const signature = live?.contentSignature ?? JSON.stringify(document.content)
    if (countWords(sourceText) < 50) {
      setMessage('Escreva ao menos 50 palavras antes de avaliar a aderência ao guia.')
      return
    }

    const token = ++tokenRef.current
    setBusy(true)
    setMessage('Comparando o texto ao guia editorial localmente…')
    try {
      const result = await analyzePrecision(templateId, sourceText)
      const current = readLiveEditorSnapshot(document.id)
      if (token !== tokenRef.current || (current && current.contentSignature !== signature)) return
      setReading(result)
      setMessage(result ? result.status : 'Não foi possível formar uma leitura para este guia.')
    } catch (error) {
      console.error('[Escrevaral] Aderência ao guia não concluída.', error)
      if (token !== tokenRef.current) return
      setReading(null)
      setMessage('A leitura de aderência não pôde ser concluída agora.')
    } finally {
      if (token === tokenRef.current) setBusy(false)
    }
  }

  return (
    <section className="precision-panel" aria-labelledby="precision-title">
      <div className="section-label" id="precision-title">Forma editorial</div>
      <p className="panel-intro">O guia avalia estrutura e expectativas do gênero. Não é correção ortográfica nem gramatical.</p>

      <label className="section-label" htmlFor="precision-template">Guia do documento</label>
      <select
        id="precision-template"
        className="search"
        value={templateId}
        onChange={(event) => onTemplateId(event.target.value || null)}
      >
        <option value="">Sem guia associado</option>
        {[...grouped.entries()].map(([label, options]) => (
          <optgroup label={label} key={label}>
            {options.map((template) => <option value={template.id} key={template.id}>{template.label}</option>)}
          </optgroup>
        ))}
      </select>

      {templateId && !selectedTemplate && <p className="review-message">O guia legado “{templateId}” não existe mais na base atual.</p>}
      {selectedTemplate && (
        <p className="review-message">{selectedTemplate.oficioLabel} · {selectedTemplate.kind || selectedTemplate.title || selectedTemplate.label}</p>
      )}

      <button className="action primary" type="button" onClick={() => { void run() }} disabled={busy || !selectedTemplate || words < 50}>
        {busy ? 'Avaliando aderência…' : 'Avaliar aderência ao guia'}
      </button>
      <p className="review-message" role="status">{message}</p>

      {reading && (
        <div className="precision-reading">
          <div className="metric">
            <div className="metric-label">Aderência</div>
            <div className="metric-value">{reading.score}</div>
            <small>{reading.status}</small>
          </div>
          <Checks title="Elementos já cobertos" items={reading.strengths} />
          <Checks title="Pontos do guia ainda abertos" items={reading.gaps} />
          <p className="context-disclaimer">Leitura heurística do gênero. O guia orienta; não obriga o texto a caber numa fórmula.</p>
        </div>
      )}
    </section>
  )
}
