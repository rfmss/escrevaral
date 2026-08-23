import { useEffect, useRef, useState } from 'react'
import type { EscrevaralDocument } from '../domain/document'
import { readLiveEditorSnapshot, subscribeLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import {
  detectContextTerms,
  listContextCategories,
  searchContextEntries,
  type ContextCategory,
  type ContextEntry,
  type ContextTerm,
} from '../engines/decolonialAdapter'

type Props = {
  document: EscrevaralDocument
}

function occurrenceLabel(count: number): string {
  return `${count} ${count === 1 ? 'ocorrência' : 'ocorrências'}`
}

function slugifyFilename(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'contexto'
}

function contextReport(title: string, terms: ContextTerm[]): string {
  const lines = ['VOCABULÁRIO DE CONTEXTO — Escrevaral', '═'.repeat(52), `Manuscrito: ${title || 'sem título'}`, `Termos detectados: ${terms.length}`, '']
  terms.forEach((entry, index) => {
    lines.push(`${index + 1}. ${entry.term} — ${occurrenceLabel(entry.count)}`)
    if (entry.categoryLabel) lines.push(`   Categoria: ${entry.categoryLabel}`)
    if (entry.reason) lines.push(`   Motivo: ${entry.reason}`)
    if (entry.context) lines.push(`   Contexto: ${entry.context}`)
    if (entry.alternatives.length) lines.push(`   Alternativas: ${entry.alternatives.join(', ')}`)
    lines.push('')
  })
  lines.push('═'.repeat(52), 'Leitura local. Nenhuma alternativa é aplicada automaticamente.')
  return lines.join('\n')
}

function downloadText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function ContextPanel({ document }: Props) {
  const [terms, setTerms] = useState<ContextTerm[]>([])
  const [message, setMessage] = useState('Aguardando uma leitura contextual.')
  const [analyzing, setAnalyzing] = useState(false)
  const [toolMessage, setToolMessage] = useState('')
  const [showGlossary, setShowGlossary] = useState(false)
  const [categories, setCategories] = useState<ContextCategory[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [entries, setEntries] = useState<ContextEntry[]>([])
  const [glossaryBusy, setGlossaryBusy] = useState(false)
  const [glossaryMessage, setGlossaryMessage] = useState('')
  const tokenRef = useRef(0)

  useEffect(() => {
    tokenRef.current += 1
    setTerms([])
    setAnalyzing(false)
    setToolMessage('')
    setMessage('O texto mudou. Examine o contexto novamente quando quiser.')

    return subscribeLiveEditorSnapshot((snapshot) => {
      if (snapshot.documentId !== document.id) return
      tokenRef.current += 1
      setTerms([])
      setAnalyzing(false)
      setToolMessage('')
      setMessage('O texto mudou. Examine o contexto novamente quando quiser.')
    })
  }, [document.id])

  const run = async () => {
    const live = readLiveEditorSnapshot(document.id)
    const plainText = live?.plainText ?? document.plainText
    const signature = live?.contentSignature ?? JSON.stringify(document.content)
    const token = ++tokenRef.current
    setAnalyzing(true)
    setToolMessage('')
    setMessage('Examinando termos e contextos localmente…')

    try {
      const result = await detectContextTerms(plainText)
      const current = readLiveEditorSnapshot(document.id)
      if (token !== tokenRef.current || (current && current.contentSignature !== signature)) return
      setTerms(result)
      setMessage(
        !plainText.trim()
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

  const copyAlternative = async (alternative: string) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard indisponível')
      await navigator.clipboard.writeText(alternative)
      setToolMessage(`“${alternative}” copiado.`)
    } catch {
      setToolMessage('Não foi possível copiar a alternativa agora.')
    }
  }

  const exportDetected = () => {
    if (!terms.length) return
    downloadText(contextReport(document.title.trim(), terms), `${slugifyFilename(document.title)}-contexto.txt`)
    setToolMessage('Leitura contextual baixada em TXT.')
  }

  const openGlossary = async () => {
    if (showGlossary) {
      setShowGlossary(false)
      return
    }
    setShowGlossary(true)
    if (categories.length) return
    setGlossaryBusy(true)
    setGlossaryMessage('Abrindo vocabulário local…')
    try {
      const [nextCategories, nextEntries] = await Promise.all([listContextCategories(), searchContextEntries()])
      setCategories(nextCategories)
      setEntries(nextEntries)
      setGlossaryMessage(`${nextEntries.length} entradas disponíveis.`)
    } catch (error) {
      console.error('[Escrevaral] Vocabulário contextual não concluído.', error)
      setGlossaryMessage('O vocabulário não pôde ser aberto agora.')
    } finally {
      setGlossaryBusy(false)
    }
  }

  const searchGlossary = async () => {
    setGlossaryBusy(true)
    setGlossaryMessage('Consultando vocabulário local…')
    try {
      const result = await searchContextEntries(query, category)
      setEntries(result)
      setGlossaryMessage(result.length ? `${result.length} ${result.length === 1 ? 'entrada encontrada' : 'entradas encontradas'}.` : 'Nenhuma entrada encontrada.')
    } catch (error) {
      console.error('[Escrevaral] Consulta contextual não concluída.', error)
      setEntries([])
      setGlossaryMessage('A consulta não pôde ser concluída agora.')
    } finally {
      setGlossaryBusy(false)
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

      {terms.length > 0 && (
        <div className="rail-actions" aria-label="Ações da leitura contextual">
          <div className="section-label">Levar leitura</div>
          <button className="action subtle" type="button" onClick={exportDetected}>Baixar TXT</button>
          {toolMessage && <p className="context-message" role="status">{toolMessage}</p>}
        </div>
      )}

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
                    <button className="context-chip" type="button" key={alternative} onClick={() => { void copyAlternative(alternative) }} aria-label={`Copiar alternativa ${alternative}`}>
                      {alternative}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </article>
        ))}
      </div>

      <section className="context-section" aria-labelledby="context-glossary-title">
        <h3 id="context-glossary-title">Consultar vocabulário</h3>
        <button className="action subtle" type="button" onClick={() => { void openGlossary() }} disabled={glossaryBusy} aria-expanded={showGlossary}>
          {glossaryBusy ? 'Abrindo vocabulário…' : showGlossary ? 'Fechar vocabulário' : 'Abrir vocabulário'}
        </button>

        {showGlossary && (
          <>
            <input className="search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="buscar termo ou alternativa" aria-label="Buscar no vocabulário contextual" />
            <select className="search" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filtrar categoria contextual">
              <option value="all">Todas as categorias</option>
              {categories.map((item) => <option value={item.id} key={item.id}>{item.label} ({item.count})</option>)}
            </select>
            <button className="action subtle" type="button" onClick={() => { void searchGlossary() }} disabled={glossaryBusy}>Buscar no vocabulário</button>
            {glossaryMessage && <p className="context-message" role="status">{glossaryMessage}</p>}
            <div className="context-list" aria-label="Entradas do vocabulário contextual">
              {entries.map((entry) => (
                <article className="context-card" key={`glossary-${entry.id}`}>
                  <div className="context-card-head">
                    <div>
                      <span className="context-kicker">Entrada do vocabulário</span>
                      <h2>{entry.term}</h2>
                    </div>
                  </div>
                  <div className="context-category">{entry.categoryLabel}</div>
                  {entry.reason && <section className="context-section"><h3>Por que observar</h3><p>{entry.reason}</p></section>}
                  {entry.context && <section className="context-section context-note"><h3>Leitura de contexto</h3><p>{entry.context}</p></section>}
                  {entry.alternatives.length > 0 && (
                    <section className="context-section">
                      <h3>Alternativas possíveis</h3>
                      <div className="context-alternatives">
                        {entry.alternatives.map((alternative) => (
                          <button className="context-chip" type="button" key={alternative} onClick={() => { void copyAlternative(alternative) }} aria-label={`Copiar alternativa ${alternative}`}>
                            {alternative}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <p className="context-disclaimer">
        Considere narrador, personagem, época, citação e intenção crítica. A decisão final é de quem escreve; nenhuma alternativa é aplicada automaticamente.
      </p>
    </section>
  )
}
