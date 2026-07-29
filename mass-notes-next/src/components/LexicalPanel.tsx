import { useEffect, useState } from 'react'
import type { EscrevaralDocument } from '../domain/document'
import { readLexicalWord, type LexicalReading } from '../engines/lexicalAdapter'

type LexicalSelectionEvent = CustomEvent<{
  documentId: string
  text: string
  from: number
  to: number
}>

type Props = {
  document: EscrevaralDocument
}

const DECISION_LABELS = {
  classificado: 'Leitura local direta',
  provavel: 'Leitura provável pelo contexto',
  ambiguo: 'Mais de uma leitura possível',
  indeterminado: 'Leitura ainda indeterminada',
} as const

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, 120)
}

export function LexicalPanel({ document }: Props) {
  const [query, setQuery] = useState('')
  const [reading, setReading] = useState<LexicalReading | null>(null)
  const [message, setMessage] = useState('Selecione uma palavra no texto ou faça uma busca local.')
  const [busy, setBusy] = useState(false)

  const run = async (value: string) => {
    const clean = normalizeQuery(value)
    setQuery(clean)
    if (!clean) {
      setReading(null)
      setMessage('Selecione uma palavra no texto ou faça uma busca local.')
      return
    }
    setBusy(true)
    setMessage('Consultando o vocabulário local…')
    try {
      const result = await readLexicalWord(clean, document.plainText)
      setReading(result)
      setMessage(result ? 'Leitura lexical concluída.' : 'Não encontrei uma leitura local para este recorte.')
    } catch (error) {
      console.error('[Escrevaral] Leitura lexical não concluída.', error)
      setReading(null)
      setMessage('O vocabulário local não pôde ser aberto nesta sessão.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    const onSelection = (event: Event) => {
      const detail = (event as LexicalSelectionEvent).detail
      if (!detail || detail.documentId !== document.id) return
      const selected = normalizeQuery(detail.text)
      if (!selected || selected.split(/\s+/).length > 4) return
      void run(selected)
    }
    window.addEventListener('escrevaral:lexical-selection', onSelection)
    return () => window.removeEventListener('escrevaral:lexical-selection', onSelection)
  }, [document.id, document.plainText])

  useEffect(() => {
    setReading(null)
    setQuery('')
    setMessage('Selecione uma palavra no texto ou faça uma busca local.')
  }, [document.id])

  return (
    <section className="lexical-panel" aria-labelledby="lexical-panel-title">
      <h3 id="lexical-panel-title" className="sr-only">Palavras</h3>
      <p className="panel-intro">Significado, classe e outras leituras são calculados no navegador. Nada é substituído no manuscrito.</p>
      <form className="lexical-search" onSubmit={(event) => { event.preventDefault(); void run(query) }}>
        <label htmlFor="lexical-query">Palavra ou expressão curta</label>
        <div>
          <input
            id="lexical-query"
            type="search"
            value={query}
            maxLength={120}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex.: melancolia"
          />
          <button className="action primary" type="submit" disabled={busy || !query.trim()}>{busy ? 'Lendo…' : 'Consultar'}</button>
        </div>
      </form>
      <p className="lexical-message" role="status" aria-live="polite">{message}</p>

      {reading && (
        <article className="lexical-reading">
          <div className="lexical-heading">
            <h2>{reading.displayWord}</h2>
            <span>{reading.className}</span>
          </div>
          <p className="lexical-decision">{DECISION_LABELS[reading.decision]}</p>
          {reading.definition && <p className="lexical-definition">{reading.definition}</p>}
          {reading.note && <p>{reading.note}</p>}
          <dl>
            {reading.syntacticFunction && <div><dt>Função no contexto</dt><dd>{reading.syntacticFunction}</dd></div>}
            {reading.functionName && <div><dt>Função gramatical</dt><dd>{reading.functionName}</dd></div>}
            {reading.field && <div><dt>Campo</dt><dd>{reading.field}</dd></div>}
            <div><dt>Ocorrências</dt><dd>{reading.count}</dd></div>
          </dl>
          {reading.alternatives.length > 0 && (
            <section className="lexical-alternatives" aria-labelledby="lexical-alternatives-title">
              <h3 id="lexical-alternatives-title">Outras leituras possíveis</h3>
              <ul>{reading.alternatives.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}
          <p className="lexical-disclaimer">A classificação é uma hipótese linguística local. Contexto, registro, oralidade e intenção autoral podem mudar a leitura.</p>
        </article>
      )}
    </section>
  )
}
