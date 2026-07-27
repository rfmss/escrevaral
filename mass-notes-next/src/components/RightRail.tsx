import { useState } from 'react'
import { averageSentenceLength, countWords, type DocumentStatus, type EscrevaralDocument } from '../domain/document'
import type { ReviewIssue } from '../engines/reviewAdapter'
import { useModalDrawer } from './useModalDrawer'

type Tab = 'pulso' | 'revisao' | 'ferramentas'

type Props = {
  document: EscrevaralDocument
  open: boolean
  analyzing: boolean
  issues: ReviewIssue[]
  reviewMessage: string
  onClose: () => void
  onAnalyze: () => void
  onStatus: (status: DocumentStatus) => void
  onDuplicate: () => void
  onExport: () => void
  onFocus: () => void
  onTheme: () => void
}

export function RightRail({
  document,
  open,
  analyzing,
  issues,
  reviewMessage,
  onClose,
  onAnalyze,
  onStatus,
  onDuplicate,
  onExport,
  onFocus,
  onTheme,
}: Props) {
  const [tab, setTab] = useState<Tab>('pulso')
  const panelRef = useModalDrawer<HTMLElement>(open, onClose)
  const words = countWords(document.plainText)
  const pulse = averageSentenceLength(document.plainText)

  const readText = () => {
    setTab('revisao')
    onAnalyze()
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
        {(['pulso', 'revisao', 'ferramentas'] as const).map((item) => (
          <button
            key={item}
            id={`tab-${item}`}
            type="button"
            role="tab"
            className={`tab ${tab === item ? 'active' : ''}`}
            aria-selected={tab === item}
            aria-controls={`panel-${item}`}
            tabIndex={tab === item ? 0 : -1}
            onClick={() => setTab(item)}
          >
            {item}
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
              <button className="action subtle" type="button" onClick={onExport}>Exportar cena</button>
            </div>
          </section>
        )}

        {tab === 'revisao' && (
          <section id="panel-revisao" role="tabpanel" aria-labelledby="tab-revisao" className="panel active">
            <p className="panel-intro">A primeira engine real do Escrevaral lê o texto localmente, sem enviar seu rascunho para fora.</p>
            <button className="action primary" type="button" onClick={onAnalyze} disabled={analyzing}>
              {analyzing ? 'Lendo o texto…' : 'Analisar em português brasileiro'}
            </button>
            <p className="review-message" role="status">{reviewMessage}</p>
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

        {tab === 'ferramentas' && (
          <section id="panel-ferramentas" role="tabpanel" aria-labelledby="tab-ferramentas" className="panel active">
            <button className="action primary" type="button" onClick={onExport}>Exportar .txt</button>
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
