import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ExperienceShell } from './ExperienceShell'
import './styles/app.css'
import './styles/polish.css'
import './styles/design-stabilization.css'
import './styles/design-stabilization-mobile.css'
import './styles/theme-blueprint.tokens.css'
import './styles/theme-blueprint.css'
import './styles/theme-blueprint-composition.css'
import './styles/review-decorations.css'
import './styles/export-panel.css'
import './styles/lexical-panel.css'
import './styles/library-organization.css'
import './styles/document-metadata.css'
import './styles/legacy-import.css'
import './styles/anatomy-host.css'
import './styles/page-press-transition.css'
import './styles/m1-usability.css'

function RightRailAccessibilityBridge() {
  useEffect(() => {
    const enhance = () => {
      const scroller = document.querySelector<HTMLElement>('.rail-scroll')
      if (!scroller) return false
      scroller.tabIndex = 0
      scroller.setAttribute('aria-label', 'Conteúdo das ferramentas')
      return true
    }

    if (enhance()) return

    const root = document.getElementById('root')
    if (!root) return

    const observer = new MutationObserver(() => {
      if (enhance()) observer.disconnect()
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExperienceShell />
    <RightRailAccessibilityBridge />
  </StrictMode>,
)
