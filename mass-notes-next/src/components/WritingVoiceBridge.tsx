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

function openVoiceTab(): boolean {
  const rail = document.querySelector<HTMLElement>('.reference-mobile-legacy #text-tools.rail.open')
  const tab = rail?.querySelector<HTMLButtonElement>('#tab-voz')
  if (!rail || !tab) return false
  if (tab.getAttribute('aria-selected') !== 'true') tab.click()
  return true
}

function syncVoiceProjection() {
  const launcher = ensureLauncher()
  if (!launcher) return

  const button = launcher.querySelector<HTMLButtonElement>('.reference-voice-open')
  const summary = launcher.querySelector<HTMLElement>('.reference-voice-summary')
  const railOpen = Boolean(document.querySelector('.reference-mobile-legacy #text-tools.rail.open'))
  const voiceOpen = document.body.classList.contains('reference-voice-open') && railOpen

  button?.setAttribute('aria-expanded', String(voiceOpen))
  if (!railOpen) document.body.classList.remove('reference-voice-open')

  const title = document.querySelector<HTMLElement>('.reference-mobile-legacy #panel-voz .voice-card h2')?.textContent?.trim()
  const gesture = document.querySelector<HTMLElement>('.reference-mobile-legacy #panel-voz .voice-gesture')?.textContent?.trim()
  const confidence = document.querySelector<HTMLElement>('.reference-mobile-legacy #panel-voz .voice-confidence strong')?.textContent?.trim()
  const message = document.querySelector<HTMLElement>('.reference-mobile-legacy #panel-voz .voice-message')?.textContent?.trim()

  if (summary) {
    if (title) {
      const parts = [title]
      if (gesture && gesture !== 'indefinido') parts.push(gesture)
      if (confidence) parts.push(`confiança ${confidence}`)
      summary.textContent = parts.join(' · ')
      summary.dataset.voiceReading = 'ready'
    } else {
      summary.textContent = message || 'Leitura ainda não executada.'
      delete summary.dataset.voiceReading
    }
  }
}

export function WritingVoiceBridge() {
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return

    const revealVoice = () => {
      document.body.classList.remove('reference-research-open', 'reference-tags-open')
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

    const timer = window.setInterval(syncVoiceProjection, 250)
    root.addEventListener('click', onClick)
    requestAnimationFrame(syncVoiceProjection)

    return () => {
      window.clearInterval(timer)
      root.removeEventListener('click', onClick)
      document.body.classList.remove('reference-voice-open')
      document.querySelector('.reference-voice-launcher')?.remove()
    }
  }, [])

  return null
}
