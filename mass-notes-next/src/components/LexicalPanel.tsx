import { useCallback, useEffect, useRef, useState } from 'react'
import type { EscrevaralDocument } from '../domain/document'
import { readLiveEditorSnapshot, subscribeLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import { readLexicalWord, type LexicalReading } from '../engines/lexicalAdapter'
import { analyzeVerbMorphology } from '../engines/verbMorphology/verbMorphologyAdapter'
import type { VerbAnalysis } from '../engines/verbMorphology/types'
import {
  readLatestLexicalSelection,
  subscribeLexicalSelection,
  type LexicalSelectionSnapshot,
} from '../editor/lexicalSelectionBridge'
import { VerbAnalysisCard } from './VerbAnalysisCard'

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

function comparable(value: string): string {
  return normalizeQuery(value).toLocaleLowerCase('pt-BR').replace(/[‐‑‒–—―]/g, '-')
}

function isUsableSelection(snapshot: LexicalSelectionSnapshot | null): snapshot is LexicalSelectionSnapshot {
  if (!snapshot) return false
  const selected = normalizeQuery(snapshot.text)
  return Boolean(selected) && selected.split(/\s+/).length <= 4
}

function lexicalSupportsVerb(reading: LexicalReading | null): boolean {
  if (!reading) return false
  const contract = [reading.className, reading.functionName, reading.syntacticFunction, reading.note].join(' ')
  return /\b(verbo|verbal|particípio|gerúndio|infinitivo|auxiliar)\b/iu.test(contract)
}

function isExplicitVerbConstruction(analysis: VerbAnalysis): boolean {
  return analysis.clitics.length > 0 || analysis.primary.formType === 'locução verbal'
}

function presentableVerbAnalysis(
  reading: LexicalReading | null,
  analysis: VerbAnalysis | null,
): VerbAnalysis | null {
  if (!analysis) return null
  if (!reading || lexicalSupportsVerb(reading) || isExplicitVerbConstruction(analysis)) return analysis
  return null
}

export function LexicalPanel({ document }: Props) {
  const [query, setQuery] = useState('')
  const [reading, setReading] = useState<LexicalReading | null>(null)
  const [verbAnalysis, setVerbAnalysis] = useState<VerbAnalysis | null>(null)
  const [message, setMessage] = useState('Selecione uma palavra no texto ou faça uma busca local.')
  const [busy, setBusy] = useState(false)
  const requestToken = useRef(0)
  const selectionRef = useRef<LexicalSelectionSnapshot | null>(null)

  const run = useCallback(async (value: string, suppliedSelection?: LexicalSelectionSnapshot | null) => {
    const clean = normalizeQuery(value)
    const token = ++requestToken.current
    setQuery(clean)

    if (!clean) {
      setReading(null)
      setVerbAnalysis(null)
      setMessage('Selecione uma palavra no texto ou faça uma busca local.')
      setBusy(false)
      return
    }

    const live = readLiveEditorSnapshot(document.id)
    const context = live?.plainText ?? document.plainText
    const signature = live?.contentSignature ?? JSON.stringify(document.content)
    const selected = suppliedSelection && comparable(suppliedSelection.text) === comparable(clean)
      ? suppliedSelection
      : selectionRef.current && comparable(selectionRef.current.text) === comparable(clean)
        ? selectionRef.current
        : null
    const verbal = analyzeVerbMorphology(clean, {
      text: clean,
      before: selected?.before,
      after: selected?.after,
      fullText: context,
    })

    setBusy(true)
    setMessage('Consultando as leituras locais…')
    try {
      const lexical = await readLexicalWord(clean, context)
      const current = readLiveEditorSnapshot(document.id)
      if (token !== requestToken.current || (current && current.contentSignature !== signature)) return
      const presentedVerb = presentableVerbAnalysis(lexical, verbal)
      setReading(lexical)
      setVerbAnalysis(presentedVerb)
      if (lexical && presentedVerb) setMessage('Leitura lexical concluída. Leitura verbal disponível.')
      else if (lexical) setMessage('Leitura lexical concluída.')
      else if (presentedVerb) setMessage('Leitura verbal concluída.')
      else setMessage('Não encontrei uma leitura local para este recorte.')
    } catch (error) {
      if (token !== requestToken.current) return
      console.error('[Escrevaral] Leitura lexical não concluída.', error)
      setReading(null)
      setVerbAnalysis(verbal)
      setMessage(verbal
        ? 'A leitura verbal local foi concluída; o vocabulário geral não pôde ser aberto nesta sessão.'
        : 'O vocabulário local não pôde ser aberto nesta sessão.')
    } finally {
      if (token === requestToken.current) setBusy(false)
    }
  }, [document.content, document.id, document.plainText])

  useEffect(() => {
    requestToken.current += 1
    selectionRef.current = null
    setReading(null)
    setVerbAnalysis(null)
    setQuery('')
    setBusy(false)
    setMessage('Selecione uma palavra no texto ou faça uma busca local.')

    return subscribeLiveEditorSnapshot((snapshot) => {
      if (snapshot.documentId !== document.id) return
      requestToken.current += 1
      setReading(null)
      setVerbAnalysis(null)
      setBusy(false)
      setMessage('O texto mudou. Consulte novamente para usar o contexto atual.')
    })
  }, [document.id])

  useEffect(() => {
    const consume = (snapshot: LexicalSelectionSnapshot) => {
      if (snapshot.documentId !== document.id) return
      selectionRef.current = snapshot
      if (!isUsableSelection(snapshot)) return
      void run(snapshot.text, snapshot)
    }

    const latest = readLatestLexicalSelection(document.id)
    if (latest) selectionRef.current = latest
    if (isUsableSelection(latest)) void run(latest.text, latest)
    return subscribeLexicalSelection(consume)
  }, [document.id, run])

  const hasResult = Boolean(reading || verbAnalysis)
  const displayWord = reading?.displayWord || query
  const displayClass = verbAnalysis ? 'Verbo — forma analisada' : reading?.className || 'Classe não determinada'

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

      {hasResult && (
        <article className="lexical-reading">
          <div className="lexical-heading">
            <h2>{displayWord}</h2>
            <span>{displayClass}</span>
          </div>
          {!verbAnalysis && reading && <p className="lexical-decision">{DECISION_LABELS[reading.decision]}</p>}
          {!verbAnalysis && reading?.definition && <p className="lexical-definition">{reading.definition}</p>}
          {!verbAnalysis && reading?.note && <p>{reading.note}</p>}

          {verbAnalysis && <VerbAnalysisCard analysis={verbAnalysis} />}

          {reading && (
            <dl>
              {!verbAnalysis && reading.syntacticFunction && <div><dt>Função no contexto</dt><dd>{reading.syntacticFunction}</dd></div>}
              {!verbAnalysis && reading.functionName && <div><dt>Função gramatical</dt><dd>{reading.functionName}</dd></div>}
              {!verbAnalysis && reading.field && <div><dt>Campo</dt><dd>{reading.field}</dd></div>}
              <div><dt>Ocorrências</dt><dd>{reading.count}</dd></div>
            </dl>
          )}
          {!verbAnalysis && reading && reading.alternatives.length > 0 && (
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
