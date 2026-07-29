import { useEffect, useRef, useState } from 'react'
import { averageSentenceLength, countWords, type DocumentStatus, type EscrevaralDocument } from '../domain/document'
import type { LocatedReviewIssue, ReviewIssue } from '../engines/reviewAdapter'
import { analyzeVoice, type VoiceReading } from '../engines/voiceAdapter'
import type { ExportFormat } from '../export/documentExport'
import { ContextPanel } from './ContextPanel'
import { ExportPanel } from './ExportPanel'
import { LexicalPanel } from './LexicalPanel'
import { RimaLabPanel } from './RimaLabPanel'
import { useModalDrawer } from './useModalDrawer'

const TABS = [
  { id: 'pulso', label: 'pulso' },
  { id: 'revisao', label: 'revisao' },
  { id: 'palavras', label: 'palavras' },
  { id: 'voz', label: 'voz' },
  { id: 'contexto', label: 'contexto' },
  { id: 'rimalab', label: 'rimalab' },
  { id: 'ferramentas', label: 'ferramentas' },
] as const

type Tab = typeof TABS[number]['id']

type LocatedReviewPresentation = LocatedReviewIssue & {
  positionRange: { from: number; to: number }
}

type Props = {
  document: EscrevaralDocument
  open: boolean
  analyzing: boolean
  issues: ReviewIssue[]
  locatedIssues: LocatedReviewPresentation[]
  reviewMessage: string
  onClose: () => void
  onAnalyze: () => void
  onNavigateIssue: (issue: LocatedReviewPresentation) => void
  onStatus: (status: DocumentStatus) => void
  onDuplicate: () => void
  onExport: (format: ExportFormat) => void
  onFocus: () => void
  onTheme: () => void
}

function VoiceList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <section className="voice-section">
      <h3>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
  )
}

export function RightRail({
  document,
  open,
  analyzing,
  issues,
  locatedIssues,
  reviewMessage,
  onClose,
  onAnalyze,
  onNavigateIssue,
  onStatus,
  onDuplicate,
  onExport,
  onFocus,
  onTheme,
}: Props) {
  const [tab, setTab] = useState<Tab>('pulso')
  const [voiceReading, setVoiceReading] = useState<VoiceReading | null>(null)
  const [voiceMessage, setVoiceMessage] = useState('Aguardando uma escuta.')
  const [voiceAnalyzing, setVoiceAnalyzing] = useState(false)
  const [reviewMarksVisible, setReviewMarksVisible] = useState(true)
  const voiceToken = useRef(0)
  const panelRef = useModalDrawer<HTMLElement>(open, onClose)
  const words = countWords(document.plainText)
  const pulse = averageSentenceLength(document.plainText)

  useEffect(() => {
    voiceToken.current += 1
    setVoiceReading(null)
    setVoiceAnalyzing(false)
    setVoiceMessage('O texto mudou. Faça uma nova escuta quando quiser.')
  }, [document.id, document.plainText])

  useEffect(() => {
    setReviewMarksVisible(true)
    window.document.body.classList.remove('review-marks-hidden')
  }, [document.id, locatedIssues])

  useEffect(() => () => window.document.body.classList.remove('review-marks-hidden'), [])

  const readText = () => {
    setTab('revisao')
    onAnalyze()
  }

  const toggleReviewMarks = () => {
    setReviewMarksVisible((visible) => {
      const next = !visible
      window.document.body.classList.toggle('review-marks-hidden', !next)
      return next
    })
  }

  const openAnatomy = () => {
    window.dispatchEvent(new Event('escrevaral:open-anatomy'))
  }

  const runVoice = async () => {
    const token = ++voiceToken.current
    setVoiceAnalyzing(true)
    setVoiceMessage('O Espelho de Voz está escutando o rascunho localmente…')

    try {
      const result = await analyzeVoice(document.plainText, { formato: 'prosa' })
      if (token !== voiceToken.current) return
      setVoiceReading(result)
      setVoiceMessage(
        result
          ? `Leitura concluída com confiança ${result.confidence}.`
          : 'A página está vazia. Escreva um pouco antes de escutar a voz.',
      )
    } catch (error) {
      console.error('[Escrevaral] Espelho de Voz não concluído.', error)
      if (token !== voiceToken.current) return
      setVoiceReading(null)
      setVoiceMessage('O Espelho de Voz não pôde concluir a leitura agora.')
    } finally {
      if (token === voiceToken.current) setVoiceAnalyzing(false)
    }
  }

  return (
    <aside
      ref={panelRef}
      id="text-tools"
      className={`rail ${open ? 'open' : ''}`}
      aria-label="Ferramentas do texto"
      role={open ? 'dialog' : undefined}
      aria-modal={open || undefined}
      tabIndex={-1}
    >
      <div className="rail-title">
        <span>Copiar / Desenvolver / Aprovar</span>
        <button className="drawer-close" data-drawer-initial type="button" onClick={onClose} aria-label="Fechar ferramentas">×</button>
      </div>
      <div className="tabs" role="tablist" aria-label="Ferramentas">
        {TABS.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            className={`tab ${tab === item.id ? 'active' : ''}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rail-scroll">
        {tab === 'pulso' && (
          <section id="panel-pulso" role="tabpanel" aria-labelledby="tab-pulso" className="panel active">
            <div className="metric">
              <div className="metric-label">Palavras</div>
              <div className="metric-value">{words}</div>
              <small>{words < 180 ? 'menos de 1 min de leitura' : `${Math.ceil(words / 180)} min de leitura`}</small>
            </div>
            <div className="metric">
              <div className="metric-label">Caracteres</div>
              <div className="metric-value">{document.plainText.length}</div>
              <small>com espaços</small>
            </div>
            <div className="metric">
              <div className="metric-label">Pulso</div>
              <div className="metric-value">{pulse || '—'}</div>
              <small>palavras por frase, em média</small>
            </div>
            <div className="section-label">Estado da página</div>
            <div className="chip-row">
              {(['Rascunho', 'Em corte', 'Pronto'] as DocumentStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`chip ${document.status === status ? 'active' : ''}`}
                  onClick={() => onStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="rail-actions" aria-label="Ações rápidas">
              <div className="section-label">Ações</div>
              <button className="action reading" type="button" onClick={readText} disabled={analyzing}>
                {analyzing ? 'Lendo o texto…' : 'Ler o texto'}
              </button>
              <button className="action subtle" type="button" onClick={() => setTab('palavras')}>Consultar palavras</button>
              <button className="action subtle" type="button" onClick={() => setTab('ferramentas')}>Exportar documento</button>
            </div>
          </section>
        )}

        {tab === 'revisao' && (
          <section id="panel-revisao" role="tabpanel" aria-labelledby="tab-revisao" className="panel active">
            <p className="panel-intro">A engine de Revisão lê o texto localmente, sem enviar seu rascunho para fora.</p>
            <button className="action primary" type="button" onClick={onAnalyze} disabled={analyzing}>
              {analyzing ? 'Lendo o texto…' : 'Analisar em português brasileiro'}
            </button>
            <p className="review-message" role="status">{reviewMessage}</p>

            {locatedIssues.length > 0 && (
              <section className="review-located" aria-labelledby="review-located-title">
                <div className="review-located-heading">
                  <h3 id="review-located-title">Trechos localizados</h3>
                  <button type="button" className="review-visibility" aria-pressed={!reviewMarksVisible} onClick={toggleReviewMarks}>
                    {reviewMarksVisible ? 'Ocultar marcas' : 'Mostrar marcas'}
                  </button>
                </div>
                <p>A marca apenas aponta o trecho. O texto não será alterado.</p>
                <div className="review-located-list">
                  {locatedIssues.map((issue) => (
                    <article key={issue.id} className={`review-located-card severity-${issue.severity}`}>
                      <span className="review-source">{issue.ruleId}</span>
                      <strong>{issue.title}</strong>
                      <blockquote>{issue.fragment}</blockquote>
                      {issue.detail && <p>{issue.detail}</p>}
                      <button type="button" className="review-jump" onClick={() => onNavigateIssue(issue)} aria-label={`Ir ao trecho: ${issue.fragment}`}>
                        Ir ao trecho
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {issues.length > 0 && <h3 className="review-general-title">Observações gerais</h3>}
            <div className="review-list">
              {issues.map((issue) => (
                <article key={issue.id} className={`review-card severity-${issue.severity}`}>
                  <strong>{issue.title}</strong>
                  {issue.detail && <p>{issue.detail}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'palavras' && (
          <section id="panel-palavras" role="tabpanel" aria-labelledby="tab-palavras" className="panel active">
            <LexicalPanel document={document} />
          </section>
        )}

        {tab === 'voz' && (
          <section id="panel-voz" role="tabpanel" aria-labelledby="tab-voz" className="panel active voice-panel">
            <p className="panel-intro">O Espelho de Voz procura padrões de frase, vocabulário, repetição e pontuação. A leitura é local e serve como hipótese de trabalho.</p>
            <button className="action primary" type="button" onClick={() => { void runVoice() }} disabled={voiceAnalyzing}>
              {voiceAnalyzing ? 'Escutando o texto…' : 'Escutar minha voz'}
            </button>
            <p className="voice-message" role="status">{voiceMessage}</p>

            {voiceReading && (
              <div className="voice-reading">
                <div className={`voice-confidence confidence-${voiceReading.confidence}`}>
                  <span>Confiança</span>
                  <strong>{voiceReading.confidence}</strong>
                </div>
                {voiceReading.confidenceNote && <p className="voice-caution">{voiceReading.confidenceNote}</p>}

                <article className="voice-card">
                  <span className="voice-gesture">{voiceReading.voice.gesture}</span>
                  <h2>{voiceReading.voice.title}</h2>
                  <p>{voiceReading.voice.description}</p>
                </article>

                <div className="voice-metrics" aria-label="Métricas de voz">
                  <div><strong>{voiceReading.metrics.ttr}%</strong><span>variedade</span></div>
                  <div><strong>{voiceReading.metrics.lexicalDensity}%</strong><span>densidade</span></div>
                  <div><strong>{voiceReading.metrics.avgSentence}</strong><span>palavras/frase</span></div>
                </div>

                <VoiceList title="Forças percebidas" items={voiceReading.strengths} />
                <VoiceList title="Pontos para observar" items={voiceReading.blindSpots} />
                <VoiceList title="Exercícios" items={voiceReading.exercises} />
                <VoiceList title="Ecos para leitura" items={voiceReading.voice.echoes} />

                {(voiceReading.audience.core || voiceReading.audience.secondary || voiceReading.audience.risk) && (
                  <section className="voice-section audience-reading">
                    <h3>Leitores possíveis</h3>
                    {voiceReading.audience.core && <p>{voiceReading.audience.core}</p>}
                    {voiceReading.audience.secondary && <p>{voiceReading.audience.secondary}</p>}
                    {voiceReading.audience.risk && <p><strong>Atenção:</strong> {voiceReading.audience.risk}</p>}
                  </section>
                )}

                <p className="voice-disclaimer">{voiceReading.disclaimer}</p>
              </div>
            )}
          </section>
        )}

        {tab === 'contexto' && (
          <section id="panel-contexto" role="tabpanel" aria-labelledby="tab-contexto" className="panel active">
            <ContextPanel document={document} />
          </section>
        )}

        {tab === 'rimalab' && (
          <section id="panel-rimalab" role="tabpanel" aria-labelledby="tab-rimalab" className="panel active">
            <RimaLabPanel document={document} />
          </section>
        )}

        {tab === 'ferramentas' && (
          <section id="panel-ferramentas" role="tabpanel" aria-labelledby="tab-ferramentas" className="panel active">
            <div className="section-label">Objeto editorial</div>
            <button className="action anatomy-action" type="button" onClick={openAnatomy}>Abrir Anatomia do Livro</button>
            <div className="section-label">Exportar documento</div>
            <ExportPanel document={document} onExport={onExport} />
            <div className="section-label">Arquivo e ambiente</div>
            <button className="action" type="button" onClick={onDuplicate}>Duplicar página</button>
            <button className="action" type="button" onClick={onFocus}>Modo concentração</button>
            <button className="action" type="button" onClick={onTheme}>Alternar papel / noite</button>
            <div className="section-label">Atalhos</div>
            <div className="shortcut"><span>Nova página</span><kbd>Ctrl N</kbd></div>
            <div className="shortcut"><span>Salvar agora</span><kbd>Ctrl S</kbd></div>
            <div className="shortcut"><span>Concentração</span><kbd>Alt F</kbd></div>
          </section>
        )}
      </div>
    </aside>
  )
}
