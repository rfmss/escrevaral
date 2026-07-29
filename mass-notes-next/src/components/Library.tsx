import { useMemo, useState } from 'react'
import { displayTitle, type EscrevaralDocument } from '../domain/document'
import {
  collectLibraryTags,
  DEFAULT_LIBRARY_QUERY,
  hasActiveLibraryFilters,
  queryLibraryDocuments,
  type LibrarySort,
  type LibraryStatusFilter,
} from '../library/libraryQuery'
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

const STATUS_FILTERS: Array<{ value: LibraryStatusFilter; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'Rascunho', label: 'Rascunho' },
  { value: 'Em corte', label: 'Em corte' },
  { value: 'Pronto', label: 'Pronto' },
]

const SORT_OPTIONS: Array<{ value: LibrarySort; label: string }> = [
  { value: 'updated-desc', label: 'Alteração recente' },
  { value: 'created-desc', label: 'Criação recente' },
  { value: 'title-asc', label: 'Título (A–Z)' },
]

function relativeTime(timestamp: number): string {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} d`
}

function absoluteTime(timestamp: number): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp)
}

export function Library({ documents, activeId, search, open, onSearch, onSelect, onNew, onClose }: Props) {
  const panelRef = useModalDrawer<HTMLElement>(open, onClose)
  const [status, setStatus] = useState<LibraryStatusFilter>(DEFAULT_LIBRARY_QUERY.status)
  const [favoritesOnly, setFavoritesOnly] = useState(DEFAULT_LIBRARY_QUERY.favoritesOnly)
  const [tag, setTag] = useState(DEFAULT_LIBRARY_QUERY.tag)
  const [sort, setSort] = useState<LibrarySort>(DEFAULT_LIBRARY_QUERY.sort)
  const activeDocument = documents.find((document) => document.id === activeId) ?? null

  const tags = useMemo(() => collectLibraryTags(documents), [documents])
  const query = useMemo(() => ({ search, status, favoritesOnly, tag, sort }), [favoritesOnly, search, sort, status, tag])
  const visible = useMemo(() => queryLibraryDocuments(documents, query), [documents, query])
  const filtersActive = hasActiveLibraryFilters(query)
  const activeVisible = activeId ? visible.some((document) => document.id === activeId) : true

  const clearFilters = () => {
    onSearch('')
    setStatus(DEFAULT_LIBRARY_QUERY.status)
    setFavoritesOnly(DEFAULT_LIBRARY_QUERY.favoritesOnly)
    setTag(DEFAULT_LIBRARY_QUERY.tag)
    setSort(DEFAULT_LIBRARY_QUERY.sort)
  }

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

      <section className="library-filters" aria-label="Controles da biblioteca">
        <div className="library-filter-label">Estado</div>
        <div className="library-status-filters" role="group" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={status === item.value ? 'active' : ''}
              aria-pressed={status === item.value}
              onClick={() => setStatus(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          className={`library-favorites-filter ${favoritesOnly ? 'active' : ''}`}
          type="button"
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly((value) => !value)}
        >
          <span aria-hidden="true">★</span> Somente favoritas
        </button>

        <div className="library-select-field">
          <label htmlFor="library-tag-filter">Tag</label>
          <select
            id="library-tag-filter"
            aria-label="Filtrar por tag"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
          >
            <option value="">Todas as tags</option>
            {tags.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div className="library-select-field">
          <label htmlFor="library-sort">Ordenar</label>
          <select
            id="library-sort"
            aria-label="Ordenar páginas"
            value={sort}
            onChange={(event) => setSort(event.target.value as LibrarySort)}
          >
            {SORT_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        <div className="library-filter-summary" aria-live="polite">
          <span>{visible.length} de {documents.length} {documents.length === 1 ? 'página' : 'páginas'}</span>
          {filtersActive && <button type="button" onClick={clearFilters}>Limpar filtros</button>}
        </div>
      </section>

      {!activeVisible && activeDocument && (
        <p className="library-active-outside" role="status">
          A página ativa continua aberta, mas está fora deste recorte.
        </p>
      )}

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
              <span className="note-title">
                {document.favorite && <span className="note-favorite" aria-hidden="true">★</span>}
                <span className="note-title-text">{displayTitle(document)}</span>
              </span>
              <span className="note-meta" title={`Alterada em ${absoluteTime(document.updatedAt)}`}>{document.status} · {relativeTime(document.updatedAt)}</span>
              {document.tags.length > 0 && (
                <span className="note-tags" aria-label={`Marcadores: ${document.tags.join(', ')}`}>
                  {document.tags.slice(0, 2).map((item) => <span key={item}>{item}</span>)}
                  {document.tags.length > 2 && <span>+{document.tags.length - 2}</span>}
                </span>
              )}
            </span>
            <span className="note-num">{String(index + 1).padStart(2, '0')}</span>
          </button>
        ))}
        {!visible.length && (
          <div className="empty-library" role="status">
            <strong>Nenhuma página neste recorte.</strong>
            <span>Altere a busca ou limpe os filtros para rever a biblioteca.</span>
            {filtersActive && <button type="button" onClick={clearFilters}>Limpar filtros</button>}
          </div>
        )}
      </nav>

      <footer className="sidebar-footer">
        <span>{visible.length} visíveis</span>
        <span>{documents.length} no arquivo · local</span>
      </footer>
    </aside>
  )
}
