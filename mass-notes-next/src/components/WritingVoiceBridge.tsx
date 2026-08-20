import { useEffect } from 'react'

function findLanguageSection(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.analysis-panel .language-section')
}

function ensureLauncher(): HTMLElement | null {
  const section = findLanguageSection()
  if (!section) return null

  let launcher = section.querySelector<HTMLElement>('.reference-voice-launcher')
  if (launcher) return launcher

  launcher = document.createElement('div')
  launcher.className = 'reference-voice-launcher'
  launcher.innerHTML = `
    <button type="button" class="reference-voice-open" aria-controls="text-tools" aria-expanded="false">
      Escutar voz
    </button>
    <p class="reference-voice-summary" role="status">Leitura ainda não executada.</p>
  `
  section.append(launcher)
  return launcher
}

function findToolsRail(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail')
}

function findVoicePanel(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.reference-mobile-legacy #panel-voz')
}

function openVoiceTab(): boolean {
  const rail = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail.open')
  const tab = rail?.querySelector<HTMLButtonElement>('#tab-voz')
  if (!rail || !tab) return false
  if (tab.getAttribute('aria-selected') !== 'true') tab.click()
  return true
}

function currentDocumentSignature(): string {
  const title = document.querySelector<HTMLInputElement>('.document-title input')?.value ?? ''
  const text = document.querySelector<HTMLElement>('.ProseMirror')?.innerText ?? ''
  return `${title}\u0000${text}`
}

export function WritingVoiceBridge() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    let lastSummary = ''
    let lastSignature = ''
    let railObserver: MutationObserver | null = null
    let panelObserver: MutationObserver | null = null
    let rootObserver: MutationObserver | null = null

    const syncVoiceProjection = () => {
      const launcher = ensureLauncher()
      if (!launcher) return

      const button = launcher.querySelector<HTMLButtonElement>('.reference-voice-open')
      const summary = launcher.querySelector<HTMLElement>('.reference-voice-summary')
      const railOpen = Boolean(findToolsRail()?.classList.contains('open'))
      const voiceOpen = document.body.classList.contains('reference-voice-open') && railOpen
      const signature = currentDocumentSignature()

      button?.setAttribute('aria-expanded', String(voiceOpen))
      if (!railOpen) document.body.classList.remove('reference-voice-open')

      const panel = findVoicePanel()
      const title = panel?.querySelector<HTMLElement>('.voice-card h2')?.textContent?.trim()
      const gesture = panel?.querySelector<HTMLElement>('.voice-gesture')?.textContent?.trim()
      const confidence = panel?.querySelector<HTMLElement>('.voice-confidence strong')?.textContent?.trim()
      const message = panel?.querySelector<HTMLElement>('.voice-message')?.textContent?.trim()

      if (!summary) return

      if (title) {
        const parts = [title]
        if (gesture && gesture !== 'indefinido') parts.push(gesture)
        if (confidence) parts.push(`confiança ${confidence}`)
        lastSummary = parts.join(' · ')
        lastSignature = signature
        summary.textContent = lastSummary
        summary.dataset.voiceReading = 'ready'
        return
      }

      if (lastSummary && lastSignature === signature) {
        summary.textContent = lastSummary
        summary.dataset.voiceReading = 'ready'
        return
      }

      if (lastSignature && lastSignature !== signature) {
        lastSummary = ''
        lastSignature = ''
      }
      summary.textContent = message || 'Leitura ainda não executada.'
      delete summary.dataset.voiceReading
    }

    const installObservers = () => {
      const launcher = ensureLauncher()
      const rail = findToolsRail()
      const panel = findVoicePanel()
      if (!launcher || !rail || !panel) return false

      if (!railObserver) {
        railObserver = new MutationObserver(syncVoiceProjection)
        railObserver.observe(rail, { attributes: true, attributeFilter: ['class'] })
      }
      if (!panelObserver) {
        panelObserver = new MutationObserver(syncVoiceProjection)
        panelObserver.observe(panel, { childList: true, subtree: true, characterData: true })
      }
      syncVoiceProjection()
      return true
    }

    const revealVoice = () => {
      document.body.classList.remove('reference-tools-open', 'reference-research-open', 'reference-tags-open', 'reference-lexical-open')
      document.body.classList.add('reference-voice-open')
      document.querySelector<HTMLButtonElement>('.mobile-tools')?.click()

      let attempts = 0
      const settle = () => {
        attempts += 1
        if (openVoiceTab() || attempts >= 8) {
          syncVoiceProjection()
          return
        }
        requestAnimationFrame(settle)
      }
      requestAnimationFrame(settle)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('button.reference-voice-open')) revealVoice()
    }

    const bodyObserver = new MutationObserver(syncVoiceProjection)
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    if (!installObservers()) {
      rootObserver = new MutationObserver(() => {
        if (installObservers()) {
          rootObserver?.disconnect()
          rootObserver = null
        }
      })
      rootObserver.observe(root, { childList: true, subtree: true })
    }

    root.addEventListener('click', onClick)
    root.addEventListener('input', syncVoiceProjection)
    requestAnimationFrame(syncVoiceProjection)

    return () => {
      railObserver?.disconnect()
      panelObserver?.disconnect()
      rootObserver?.disconnect()
      bodyObserver.disconnect()
      root.removeEventListener('click', onClick)
      root.removeEventListener('input', syncVoiceProjection)
      document.body.classList.remove('reference-voice-open')
      document.querySelector('.reference-voice-launcher')?.remove()
    }
  }, [])

  return null
}
