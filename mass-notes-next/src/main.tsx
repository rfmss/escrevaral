import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { WritingAutoFocusBridge } from './components/WritingAutoFocusBridge'
import { WritingConfigBridge } from './components/WritingConfigBridge'
import { WritingDashboardBridge } from './components/WritingDashboardBridge'
import { WritingExportBridge } from './components/WritingExportBridge'
import { WritingGoalsBridge } from './components/WritingGoalsBridge'
import { WritingRestChrome } from './components/WritingRestChrome'
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
import './styles/pagination.css'
import './styles/pagination-controls.css'
import './styles/m1-density.css'
import './styles/theme-escrevaral-verniz-material.css'
import './styles/brand-official.css'
import './styles/writing-rest.css'
import './styles/theme-escrevaral-paper-home.css'
import './styles/theme-escrevaral-paper-home-editor.css'
import './styles/theme-escrevaral-paper-home-tools.css'
import './styles/theme-escrevaral-paper-home-states.css'
import './styles/theme-escrevaral-reference.css'
import './styles/theme-escrevaral-reference-bridge.css'
import './styles/theme-escrevaral-paper-home-goals.css'
import './styles/theme-escrevaral-paper-home-export.css'
import './styles/theme-escrevaral-paper-home-config.css'

function ApplicationAccessibilityBridge() {
  useEffect(() => {
    const enhance = () => {
      const editorViewport = document.querySelector<HTMLElement>('.editor-shell')
      const railScroller = document.querySelector<HTMLElement>('.rail-scroll')

      if (editorViewport) {
        editorViewport.classList.add('editor-viewport')
        editorViewport.tabIndex = 0
        editorViewport.setAttribute('role', 'region')
        editorViewport.setAttribute('aria-label', 'Viewport do manuscrito')
        editorViewport.dataset.scrollOwner = 'manuscript'
      }

      if (railScroller) {
        railScroller.tabIndex = 0
        railScroller.setAttribute('aria-label', 'Conteúdo das ferramentas')
      }

      return Boolean(editorViewport && railScroller)
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
    <ApplicationAccessibilityBridge />
    <WritingAutoFocusBridge />
    <WritingDashboardBridge />
    <WritingGoalsBridge />
    <WritingExportBridge />
    <WritingConfigBridge />
    <WritingRestChrome />
  </StrictMode>,
)
