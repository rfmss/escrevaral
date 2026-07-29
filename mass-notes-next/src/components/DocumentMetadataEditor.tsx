import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { EscrevaralDocument } from '../domain/document'
import { normalizeLibraryText, parseLibraryTags } from '../library/libraryQuery'

type Props = {
  document: EscrevaralDocument
  onFavorite: (favorite: boolean) => void
  onTags: (tags: string[]) => void
}

function sameTags(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false
  return left.every((tag, index) => normalizeLibraryText(tag) === normalizeLibraryText(right[index] ?? ''))
}

export function DocumentMetadataEditor({ document, onFavorite, onTags }: Props) {
  const [tagDraft, setTagDraft] = useState(document.tags.join(', '))
  const [message, setMessage] = useState('')
  const parsedTags = useMemo(() => parseLibraryTags(tagDraft), [tagDraft])
  const tagsChanged = !sameTags(parsedTags, document.tags)

  useEffect(() => {
    setTagDraft(document.tags.join(', '))
  }, [document.id, document.tags])

  useEffect(() => {
    setMessage('')
  }, [document.id])

  const applyTags = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!tagsChanged) {
      setMessage('Os marcadores já estão atualizados.')
      return
    }
    onTags(parsedTags)
    setTagDraft(parsedTags.join(', '))
    setMessage(parsedTags.length ? 'Marcadores atualizados.' : 'Marcadores removidos.')
  }

  const removeTag = (tag: string) => {
    const normalized = normalizeLibraryText(tag)
    const next = document.tags.filter((item) => normalizeLibraryText(item) !== normalized)
    onTags(next)
    setTagDraft(next.join(', '))
    setMessage(`Marcador “${tag}” removido.`)
  }

  return (
    <section className="metadata-editor" aria-labelledby="metadata-editor-title">
      <div className="section-label" id="metadata-editor-title">Organização editorial</div>

      <button
        className={`metadata-favorite ${document.favorite ? 'active' : ''}`}
        type="button"
        aria-pressed={document.favorite}
        onClick={() => onFavorite(!document.favorite)}
      >
        <span aria-hidden="true">★</span>
        <span>{document.favorite ? 'Página favorita' : 'Marcar como favorita'}</span>
      </button>

      <form className="metadata-tags-form" onSubmit={applyTags}>
        <label htmlFor="document-tags">Marcadores da página</label>
        <input
          id="document-tags"
          type="text"
          value={tagDraft}
          maxLength={320}
          autoComplete="off"
          placeholder="poesia, memória, ensaio"
          onChange={(event) => {
            setTagDraft(event.target.value)
            setMessage('')
          }}
        />
        <small>Separe por vírgulas. Até 8 marcadores, com 32 caracteres cada.</small>
        <button className="metadata-apply" type="submit" disabled={!tagsChanged}>Salvar marcadores</button>
      </form>

      {document.tags.length > 0 && (
        <div className="metadata-tag-list" aria-label="Marcadores atuais">
          {document.tags.map((tag) => (
            <button key={normalizeLibraryText(tag)} type="button" onClick={() => removeTag(tag)} aria-label={`Remover marcador ${tag}`}>
              <span>{tag}</span><span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      <p className="metadata-message" role="status" aria-live="polite">{message}</p>
      <p className="metadata-note">Favorito e marcadores usam o mesmo autosave e o mesmo controle de conflito do manuscrito.</p>
    </section>
  )
}
