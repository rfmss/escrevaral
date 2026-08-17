import { useEffect } from 'react'

const STATUSES = ['Rascunho', 'Em corte', 'Pronto'] as const

function ensureHost(): HTMLElement | null {
  const analysis = document.querySelector<HTMLElement>('.analysis-panel')
  if (!analysis) return null

  const existing = analysis.querySelector<HTMLElement>('.reference-editorial-state')
  if (existing) return existing

  const host = document.createElement('section')
  host.className = 'reference-editorial-state'
  host.setAttribute('aria-labelledby', 'reference-editorial-state-title')
  host.innerHTML = `
    <div class="reference-editorial-heading">
      <h3 id="reference-editorial-state-title">ESTADO EDITORIAL</h3>
      <button class="reference-editorial-favorite" type="button" aria-pressed="false" aria-label="Marcar documento como favorito">☆</button>
    </div>
    <div class="reference-editorial-status" role="group" aria-label="Estado editorial do documento">
      ${STATUSES.map((status) => `<button type="button" data-editorial-status="${status}">${status}</button>`).join('')}
    </div>
  `

  const tags = analysis.querySelector('.tags')
  analysis.insertBefore(host, tags ?? analysis.lastElementChild)
  return host
}

function sourceRailIsOpen(): boolean {
  return document.querySelector('#text-tools')?.classList.contains('open') ?? false
}

function ensurePulseSource() {
  if (sourceRailIsOpen()) return
  const pulseTab = document.querySelector<HTMLButtonElement>('.reference-mobile-legacy #tab-pulso')
  if (pulseTab && pulseTab.getAttribute('aria-selected') !== 'true') pulseTab.click()
}

function syncFromRealMetadata() {
  const host = ensureHost()
  if (!host) return

  ensurePulseSource()

  const sourceStatuses = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.reference-mobile-legacy #panel-pulso .chip-row .chip'),
  )

  for (const status of STATUSES) {
    const source = sourceStatuses.find((button) => button.textContent?.trim() === status)
    const target = host.querySelector<HTMLButtonElement>(`[data-editorial-status="${status}"]`)
    if (!target || !source) continue
    const active = source.classList.contains('active')
    target.classList.toggle('active', active)
    target.setAttribute('aria-pressed', String(active))
  }

  const sourceFavorite = document.querySelector<HTMLButtonElement>('.reference-mobile-legacy #panel-pulso .metadata-favorite')
  const targetFavorite = host.querySelector<HTMLButtonElement>('.reference-editorial-favorite')
  if (sourceFavorite && targetFavorite) {
    const favorite = sourceFavorite.getAttribute('aria-pressed') === 'true'
    targetFavorite.classList.toggle('active', favorite)
    targetFavorite.setAttribute('aria-pressed', String(favorite))
    targetFavorite.setAttribute('aria-label', favorite ? 'Remover documento dos favoritos' : 'Marcar documento como favorito')
    targetFavorite.textContent = favorite ? '★' : '☆'
  }
}

export function WritingEditorialStateBridge() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return

      const statusButton = target.closest<HTMLButtonElement>('.reference-editorial-state [data-editorial-status]')
      if (statusButton) {
        ensurePulseSource()
        const status = statusButton.dataset.editorialStatus
        const source = Array.from(
          document.querySelectorAll<HTMLButtonElement>('.reference-mobile-legacy #panel-pulso .chip-row .chip'),
        ).find((button) => button.textContent?.trim() === status)
        source?.click()
        requestAnimationFrame(syncFromRealMetadata)
        return
      }

      const favorite = target.closest<HTMLButtonElement>('.reference-editorial-favorite')
      if (favorite) {
        ensurePulseSource()
        document.querySelector<HTMLButtonElement>('.reference-mobile-legacy #panel-pulso .metadata-favorite')?.click()
        requestAnimationFrame(syncFromRealMetadata)
      }
    }

    const timer = window.setInterval(syncFromRealMetadata, 300)
    root.addEventListener('click', onClick)
    requestAnimationFrame(syncFromRealMetadata)

    return () => {
      window.clearInterval(timer)
      root.removeEventListener('click', onClick)
      document.querySelector('.reference-editorial-state')?.remove()
    }
  }, [])

  return null
}
