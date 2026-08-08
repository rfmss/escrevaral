import { useEffect, useState } from 'react'

type Props = {
  onBack: () => void
}

type LoadState = 'loading' | 'ready' | 'slow'

export function AnatomyPage({ onBack }: Props) {
  const [loadState, setLoadState] = useState<LoadState>('loading')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoadState((current) => current === 'loading' ? 'slow' : current)
    }, 8_000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="anatomy-host" aria-label="Anatomia do Livro">
      <header className="anatomy-host__bar">
        <div>
          <span>OBJETO EDITORIAL / 01</span>
          <strong>Anatomia do Livro</strong>
        </div>
        <button type="button" onClick={onBack}>← Voltar à mesa de escrita</button>
      </header>
      <section className="anatomy-host__stage">
        {loadState !== 'ready' && (
          <div className="anatomy-host__loading" role="status">
            <strong>{loadState === 'slow' ? 'A prancha está demorando mais que o esperado.' : 'Abrindo a prancha interativa…'}</strong>
            <span>O arquivo original permanece isolado e sem alterações.</span>
          </div>
        )}
        <iframe
          className="anatomy-host__frame"
          src="./anatomia-do-livro.html"
          title="Anatomia interativa de um livro"
          onLoad={() => setLoadState('ready')}
        />
      </section>
    </main>
  )
}
