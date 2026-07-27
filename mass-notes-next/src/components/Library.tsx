import { displayTitle, type EscrevaralDocument } from '../domain/document'
import { useModalDrawer } from './useModalDrawer'

type Props = {
  documents: EscrevaralDocument[]
  activeId: string | null
  search: string
  open: boolean
  onSearch: (value: string) => void
  onSelect: (id: string) => void
  onNew: () => void
  onClose: () => void
}

function relativeTime(timestamp: number): string {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} d`
}

export function Library({ documents, activeId, search, open, onSearch, onSelect, onNew, onClose }: Props) {
  const panelRef = useModalDrawer<HTMLElement>(open, onClose)
  const query = search.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
  const visible = documents.filter((document) => {
    if (!query) return true
    const haystack = `${document.title} ${document.plainText} ${document.tags.join(' ')}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
    return haystack.includes(query)
  })

  return (
    <aside
      ref={panelRef}
      id="document-library"
      className={`sidebar ${open ? 'open' : ''}`}
      aria-label="Arquivo de documentos"
      role={open ? 'dialog' : undefined}
      aria-modal={open || undefined}
      tabIndex={-1}
    >
      <header className="brand">
        <div className="eyebrow">Oficina de escrita brasileira</div>
        <h1>Escreva<span>ral</span></h1>
        <div className="issue">MOTOR TIPTAP // FUNDAÇÃO 01</div>
        <button className="drawer-close" data-drawer-initial type="button" onClick={onClose} aria-label="Fechar arquivo">×</button>
      </header>

      <div className="side-tools">
        <label className="sr-only" htmlFor="document-search">Buscar documentos</label>
        <input
          className="search"
          id="document-search"
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Buscar no arquivo…"
        />
        <button className="icon-btn" type="button" onClick={onNew} aria-label="Novo documento">＋</button>
      </div>

      <nav className="notes" aria-label="Documentos">
        {visible.map((document, index) => (
          <button
            key={document.id}
            type="button"
            className={`note-card ${document.id === activeId ? 'active' : ''}`}
            aria-current={document.id === activeId ? 'page' : undefined}
            onClick={() => onSelect(document.id)}
          >
            <span className="note-stripe" aria-hidden="true" />
            <span className="note-copy">
              <span className="note-title">{displayTitle(document)}</span>
              <span className="note-meta">{document.status} · {relativeTime(document.updatedAt)}</span>
            </span>
            <span className="note-num">{String(index + 1).padStart(2, '0')}</span>
          </button>
        ))}
        {!visible.length && <p className="empty-library">Nenhum texto encontrado.</p>}
      </nav>

      <footer className="sidebar-footer">
        <span>{documents.length} {documents.length === 1 ? 'página' : 'páginas'}</span>
        <span>local</span>
      </footer>
    </aside>
  )
}
