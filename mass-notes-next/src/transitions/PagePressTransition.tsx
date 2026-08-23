type ViewId = 'editor' | 'anatomia'

type Props = {
  target: ViewId
}

const COPY: Record<ViewId, { eyebrow: string; title: string; register: string }> = {
  editor: {
    eyebrow: 'OFICINA / ESCRITA 01',
    title: 'Mesa de escrita',
    register: 'PROVA AZUL → TINTA → PÁGINA',
  },
  anatomia: {
    eyebrow: 'OBJETO / ANATOMIA 01',
    title: 'Anatomia do Livro',
    register: 'CAPA → LOMBADA → MIOLO',
  },
}

function AnatomyStamp() {
  return (
    <svg viewBox="0 0 360 240" role="img" aria-label="Desenho técnico de um livro em camadas">
      <g className="page-press__draft" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M72 57 178 24l111 41-106 35Z" />
        <path d="m72 57 2 26 108 39 107-35V65" />
        <path d="m86 99 96 35 94-31" />
        <path d="m91 117 91 34 89-30" />
        <path d="m96 135 86 33 84-29" />
        <path d="m102 154 80 31 78-27" />
        <path d="m109 174 73 29 71-25" />
        <path d="M73 83 40 99l140 54 139-49-30-17" />
        <path d="m40 99 2 22 138 53 139-49v-21" />
        <path d="M182 100v103" />
        <path d="M52 212h260M64 219h235" />
        <path d="M42 37h34M59 20v34M286 30h34M303 13v34" />
      </g>
      <g className="page-press__ink" fill="currentColor" opacity=".96">
        <path d="m72 57 106-33 111 41-106 35Z" />
        <path d="m73 83 109 39 107-35v17l-107 38L74 103Z" opacity=".72" />
        <path d="m40 99 140 54 139-49v21l-139 49-138-53Z" opacity=".45" />
      </g>
    </svg>
  )
}

function EditorStamp() {
  return (
    <svg viewBox="0 0 360 240" role="img" aria-label="Desenho técnico de uma folha de escrita">
      <g className="page-press__draft" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M86 26h188v188H86z" />
        <path d="M113 60h134M113 84h134M113 108h95M113 144h134M113 168h111" />
        <path d="M100 26v188M86 48h188" />
        <path d="M68 26h8M72 22v8M284 26h8M288 22v8M68 214h8M72 210v8M284 214h8M288 210v8" />
        <path d="m220 126 31-17 13 14-30 19-19 3Z" />
      </g>
      <g className="page-press__ink" fill="currentColor" opacity=".96">
        <path d="M113 60h134v6H113zM113 84h134v6H113zM113 108h95v6h-95zM113 144h134v6H113zM113 168h111v6H113z" />
        <path d="m220 126 31-17 13 14-30 19-19 3Z" />
      </g>
    </svg>
  )
}

export function PagePressTransition({ target }: Props) {
  const copy = COPY[target]
  return (
    <div className={`page-press page-press--${target}`} role="status" aria-live="polite" aria-label={`Abrindo ${copy.title}`}>
      <div className="page-press__sheet" aria-hidden="true">
        <span className="page-press__crop page-press__crop--tl" />
        <span className="page-press__crop page-press__crop--tr" />
        <span className="page-press__crop page-press__crop--bl" />
        <span className="page-press__crop page-press__crop--br" />
        <div className="page-press__register">
          <span>{copy.eyebrow}</span>
          <span>ESCREVARAL / PRELOADER</span>
        </div>
        <div className="page-press__stamp">
          {target === 'anatomia' ? <AnatomyStamp /> : <EditorStamp />}
        </div>
        <div className="page-press__caption">
          <strong>{copy.title}</strong>
          <span>{copy.register}</span>
        </div>
      </div>
      <div className="page-press__whip" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
    </div>
  )
}
