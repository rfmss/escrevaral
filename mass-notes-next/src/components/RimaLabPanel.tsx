import { useEffect, useRef, useState } from 'react'
import type { EscrevaralDocument } from '../domain/document'
import { readLiveEditorSnapshot, subscribeLiveEditorSnapshot } from '../editor/editorSnapshotBridge'
import {
  analyzeRimaLab,
  createRimaLabReport,
  createRimaLabSource,
  findRimaLabRhymes,
  getRimaLabEncyclopedia,
  type RimaEncyclopediaEntry,
  type RimaFinderResult,
  type RimaLabReading,
  type RimaVerseScan,
} from '../engines/rimaLabAdapter'

type Props = {
  document: EscrevaralDocument
}

function syllableLabel(count: number): string {
  return `${count} ${count === 1 ? 'sílaba poética' : 'sílabas poéticas'}`
}

function slugifyFilename(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'rimalab'
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

function VerseScan({ scan }: { scan: RimaVerseScan }) {
  return (
    <article className="rima-scan">
      <div className="rima-scan-head">
        <span>Verso {scan.index + 1}</span>
        <strong>{syllableLabel(scan.totalSyllables)}</strong>
      </div>
      <p className="rima-verse">{scan.verse}</p>
      <div className="rima-scan-meta">
        {scan.name && <span>{scan.name}</span>}
        {scan.finalWord && <span>final: {scan.finalWord}{scan.finalTonicity ? ` · ${scan.finalTonicity}` : ''}</span>}
      </div>
      {scan.ellisions.length > 0 && (
        <p className="rima-elision">Junções consideradas: {scan.ellisions.join(' · ')}</p>
      )}
    </article>
  )
}

export function RimaLabPanel({ document }: Props) {
  const [reading, setReading] = useState<RimaLabReading | null>(null)
  const [message, setMessage] = useState('Aguardando uma escuta sonora.')
  const [analyzing, setAnalyzing] = useState(false)
  const [toolMessage, setToolMessage] = useState('')
  const [finderWord, setFinderWord] = useState('')
  const [finderResults, setFinderResults] = useState<RimaFinderResult[]>([])
  const [finderMessage, setFinderMessage] = useState('')
  const [finderBusy, setFinderBusy] = useState(false)
  const [showReference, setShowReference] = useState(false)
  const [referenceEntries, setReferenceEntries] = useState<RimaEncyclopediaEntry[]>([])
  const [referenceBusy, setReferenceBusy] = useState(false)
  const tokenRef = useRef(0)
  const sourceRef = useRef('')

  useEffect(() => {
    tokenRef.current += 1
    sourceRef.current = ''
    setReading(null)
    setAnalyzing(false)
    setToolMessage('')
    setMessage('O texto mudou. Escute novamente quando quiser.')

    return subscribeLiveEditorSnapshot((snapshot) => {
      if (snapshot.documentId !== document.id) return
      tokenRef.current += 1
      sourceRef.current = ''
      setReading(null)
      setAnalyzing(false)
      setToolMessage('')
      setMessage('O texto mudou. Escute novamente quando quiser.')
    })
  }, [document.id])

  const run = async () => {
    const live = readLiveEditorSnapshot(document.id)
    const content = live?.content ?? document.content
    const plainText = live?.plainText ?? document.plainText
    const signature = live?.contentSignature ?? JSON.stringify(document.content)
    const source = createRimaLabSource(content, plainText)
    const token = ++tokenRef.current
    setAnalyzing(true)
    setToolMessage('')
    setMessage('O RimaLab está escutando ritmo, finais e repetições sonoras localmente…')

    try {
      const result = await analyzeRimaLab(source)
      const current = readLiveEditorSnapshot(document.id)
      if (token !== tokenRef.current || (current && current.contentSignature !== signature)) return
      sourceRef.current = result ? source : ''
      setReading(result)
      setMessage(
        !source.trim()
          ? 'A página está vazia. Escreva um pouco antes de abrir a oficina sonora.'
          : !result
            ? 'Não foi possível formar uma leitura sonora deste recorte.'
            : result.kind === 'prose'
              ? result.soundPatterns.length
                ? `${result.soundPatterns.length} ${result.soundPatterns.length === 1 ? 'padrão sonoro foi percebido' : 'padrões sonoros foram percebidos'} na prosa.`
                : 'O texto parece ser prosa e não apresentou um padrão sonoro recorrente neste recorte.'
              : `${result.totalVerses} ${result.totalVerses === 1 ? 'verso foi lido' : 'versos foram lidos'} como estrutura poética aproximada.`,
      )
    } catch (error) {
      console.error('[Escrevaral] RimaLab não concluído.', error)
      if (token !== tokenRef.current) return
      sourceRef.current = ''
      setReading(null)
      setMessage('A oficina sonora não pôde concluir a leitura agora. O editor continua disponível.')
    } finally {
      if (token === tokenRef.current) setAnalyzing(false)
    }
  }

  const runFinder = async () => {
    const word = finderWord.trim()
    if (word.length < 2) {
      setFinderResults([])
      setFinderMessage('Digite ao menos duas letras.')
      return
    }

    setFinderBusy(true)
    setFinderMessage('Buscando no vocabulário local…')
    try {
      const results = await findRimaLabRhymes(word)
      setFinderResults(results)
      setFinderMessage(results.length ? `${results.length} possibilidade${results.length === 1 ? '' : 's'} encontrada${results.length === 1 ? '' : 's'}.` : 'Nenhuma rima encontrada no vocabulário.')
    } catch (error) {
      console.error('[Escrevaral] Busca de rimas não concluída.', error)
      setFinderResults([])
      setFinderMessage('O buscador de rimas não pôde concluir a consulta agora.')
    } finally {
      setFinderBusy(false)
    }
  }

  const toggleReference = async () => {
    if (showReference) {
      setShowReference(false)
      return
    }
    setShowReference(true)
    if (referenceEntries.length) return

    setReferenceBusy(true)
    try {
      setReferenceEntries(await getRimaLabEncyclopedia())
    } catch (error) {
      console.error('[Escrevaral] Referência métrica não concluída.', error)
      setReferenceEntries([])
    } finally {
      setReferenceBusy(false)
    }
  }

  const copyReport = async () => {
    if (!sourceRef.current) return
    try {
      const report = await createRimaLabReport(sourceRef.current, document.title.trim() || 'RimaLab')
      if (!navigator.clipboard) throw new Error('Clipboard indisponível')
      await navigator.clipboard.writeText(report)
      setToolMessage('Análise copiada.')
    } catch (error) {
      console.error('[Escrevaral] Cópia do RimaLab não concluída.', error)
      setToolMessage('Não foi possível copiar. Use Baixar TXT.')
    }
  }

  const downloadReport = async () => {
    if (!sourceRef.current) return
    try {
      const report = await createRimaLabReport(sourceRef.current, document.title.trim() || 'RimaLab')
      downloadText(report, `${slugifyFilename(document.title)}-rimalab.txt`)
      setToolMessage('Análise baixada em TXT.')
    } catch (error) {
      console.error('[Escrevaral] Exportação do RimaLab não concluída.', error)
      setToolMessage('Não foi possível gerar o TXT agora.')
    }
  }

  return (
    <section className="rimalab-panel">
      <p className="panel-intro">
        O RimaLab escuta repetições sonoras, finais de verso e pulso métrico. Prosa e verso recebem leituras diferentes; ausência de rima não é defeito.
      </p>
      <button className="action primary" type="button" onClick={() => { void run() }} disabled={analyzing}>
        {analyzing ? 'Escutando ritmo e rimas…' : 'Abrir oficina sonora'}
      </button>
      <p className="rima-message" role="status">{message}</p>

      {reading && (
        <div className="rail-actions" aria-label="Ações da análise sonora">
          <div className="section-label">Levar análise</div>
          <button className="action subtle" type="button" onClick={() => { void copyReport() }}>Copiar análise</button>
          <button className="action subtle" type="button" onClick={() => { void downloadReport() }}>Baixar TXT</button>
          {toolMessage && <p className="rima-message" role="status">{toolMessage}</p>}
        </div>
      )}

      <section className="rima-section" aria-labelledby="rima-finder-title">
        <h3 id="rima-finder-title">Buscar rimas</h3>
        <input
          className="search"
          type="search"
          value={finderWord}
          onChange={(event) => setFinderWord(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void runFinder()
            }
          }}
          placeholder="palavra"
          aria-label="Palavra para buscar rimas"
        />
        <button className="action subtle" type="button" onClick={() => { void runFinder() }} disabled={finderBusy || finderWord.trim().length < 2}>
          {finderBusy ? 'Buscando…' : 'Buscar no vocabulário'}
        </button>
        {finderMessage && <p className="rima-message" role="status">{finderMessage}</p>}
        {finderResults.length > 0 && (
          <div className="rima-pairs" aria-label="Resultados do buscador de rimas">
            {finderResults.map((result) => (
              <article key={`${result.type}-${result.word}`}>
                <span>rima {result.type}</span>
                <strong>{result.word}</strong>
                {result.grammaticalClass && <small>{result.grammaticalClass}</small>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rima-section" aria-labelledby="rima-reference-title">
        <h3 id="rima-reference-title">Referência métrica</h3>
        <button className="action subtle" type="button" onClick={() => { void toggleReference() }} disabled={referenceBusy} aria-expanded={showReference}>
          {referenceBusy ? 'Abrindo referência…' : showReference ? 'Fechar referência' : 'Abrir referência'}
        </button>
        {showReference && referenceEntries.length > 0 && (
          <div className="rima-patterns">
            {referenceEntries.map((entry) => (
              <details className="rima-pattern" key={entry.title}>
                <summary><strong>{entry.title}</strong></summary>
                {entry.tags.length > 0 && <span>{entry.tags.join(' · ')}</span>}
                {entry.body && <p className="rima-neutral">{entry.body}</p>}
                {entry.sample && <p className="rima-verse">{entry.sample}</p>}
              </details>
            ))}
          </div>
        )}
      </section>

      {reading?.kind === 'prose' && (
        <div className="rima-reading rima-prose-reading">
          <article className="rima-mode-card">
            <span className="rima-kicker">Leitura de prosa</span>
            <h2>Ecos dentro da frase</h2>
            <p>{reading.proseNote}</p>
          </article>

          {reading.soundPatterns.length > 0 && (
            <section className="rima-section">
              <h3>Padrões percebidos</h3>
              <div className="rima-patterns">
                {reading.soundPatterns.map((pattern, index) => (
                  <article className="rima-pattern" key={`${pattern.sound}-${index}`}>
                    <span>eco {index + 1}{pattern.sound ? ` · /${pattern.sound}/` : ''}</span>
                    <strong>{pattern.words.join(' · ')}</strong>
                  </article>
                ))}
              </div>
            </section>
          )}

          <p className="rima-disclaimer">
            Esta é uma escuta de ecos internos, não uma exigência de rima. A prosa pode trabalhar ritmo sem se comportar como verso.
          </p>
        </div>
      )}

      {reading?.kind === 'verse' && (
        <div className="rima-reading rima-verse-reading">
          <div className="rima-summary" aria-label="Resumo sonoro">
            <div><strong>{reading.totalVerses}</strong><span>versos</span></div>
            <div><strong>{reading.dominantMetric ?? '—'}</strong><span>metro dominante</span></div>
            <div><strong>{reading.rhymes.length}</strong><span>pares percebidos</span></div>
          </div>

          <article className="rima-mode-card">
            <span className="rima-kicker">Leitura de verso</span>
            <h2>{reading.dominantName || 'Pulso métrico variável'}</h2>
            <p>
              {reading.isIsometric
                ? 'Os versos receberam a mesma contagem automática neste recorte.'
                : reading.uniqueMetrics.length > 1
                  ? `A leitura encontrou variação entre ${reading.uniqueMetrics.join(', ')} sílabas poéticas.`
                  : 'A medida ainda não forma um padrão dominante claro.'}
            </p>
          </article>

          {reading.rhymeScheme && (
            <section className="rima-section rima-scheme">
              <h3>Esquema percebido</h3>
              <strong>{reading.rhymeScheme}</strong>
              {reading.rhymeSchemeName && <span>{reading.rhymeSchemeName}</span>}
            </section>
          )}

          {reading.stanzas.length > 0 && (
            <section className="rima-section">
              <h3>Estrofes</h3>
              <div className="rima-stanzas">
                {reading.stanzas.map((stanza) => (
                  <article key={`${stanza.index}-${stanza.scheme}`}>
                    <span>Estrofe {stanza.index + 1} · {stanza.verses.length} versos</span>
                    <strong>{stanza.scheme || 'sem esquema definido'}</strong>
                    {stanza.schemeName && <small>{stanza.schemeName}</small>}
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="rima-section">
            <h3>Escansão aproximada</h3>
            <div className="rima-scans">
              {reading.scans.slice(0, 24).map((scan) => <VerseScan scan={scan} key={`${scan.index}-${scan.verse}`} />)}
            </div>
            {reading.scans.length > 24 && <p className="rima-limit">Mostrando os primeiros 24 versos deste recorte.</p>}
          </section>

          <section className="rima-section">
            <h3>Pares de rima percebidos</h3>
            {reading.rhymes.length ? (
              <div className="rima-pairs">
                {reading.rhymes.slice(0, 20).map((pair, index) => (
                  <article key={`${pair.from}-${pair.to}-${index}`}>
                    <span>v.{pair.from + 1} × v.{pair.to + 1}</span>
                    <strong>{pair.wordA} / {pair.wordB}</strong>
                    <small>
                      {pair.classification}
                      {pair.soundA && pair.soundB ? ` · /${pair.soundA}/ · /${pair.soundB}/` : ''}
                      {pair.classA && pair.classB ? ` · ${pair.classA} + ${pair.classB}` : ''}
                    </small>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rima-neutral">Nenhum par de rima foi percebido. Verso livre continua sendo verso.</p>
            )}
          </section>

          <p className="rima-disclaimer">{reading.note}</p>
        </div>
      )}
    </section>
  )
}
