import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { WritingAutoFocusBridge } from './components/WritingAutoFocusBridge'
import { WritingConfigBridge } from './components/WritingConfigBridge'
import { WritingDashboardBridge } from './components/WritingDashboardBridge'
import { WritingExportBridge } from './components/WritingExportBridge'
import { WritingGoalsBridge } from './components/WritingGoalsBridge'
import { WritingIntegrityBridge } from './components/WritingIntegrityBridge'
import { WritingLexicalBridge } from './components/WritingLexicalBridge'
import { WritingLocalFeedbackBridge } from './components/WritingLocalFeedbackBridge'
import { WritingOfflineBridge } from './components/WritingOfflineBridge'
import { WritingProofStatusBridge } from './components/WritingProofStatusBridge'
import { WritingReaderBridge } from './components/WritingReaderBridge'
import { WritingResearchBridge } from './components/WritingResearchBridge'
import { WritingRestChrome } from './components/WritingRestChrome'
import { WritingTagsBridge } from './components/WritingTagsBridge'
import { WritingToolsBridge } from './components/WritingToolsBridge'
import { WritingVoiceBridge } from './components/WritingVoiceBridge'
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
import './styles/proof-panel.css'
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
import './styles/theme-escrevaral-fonts.css'
import './styles/theme-escrevaral-paper-home.css'
import './styles/theme-escrevaral-paper-home-editor.css'
import './styles/theme-escrevaral-paper-home-tools.css'
import './styles/theme-escrevaral-paper-home-states.css'
import './styles/theme-escrevaral-reference.css'
import './styles/theme-escrevaral-reference-bridge.css'
import './styles/theme-escrevaral-paper-home-goals.css'
import './styles/theme-escrevaral-paper-home-export.css'
import './styles/theme-escrevaral-paper-home-config.css'
import './styles/theme-escrevaral-paper-home-research.css'
import './styles/theme-escrevaral-paper-home-tags.css'
import './styles/theme-escrevaral-paper-home-editorial.css'
import './styles/theme-escrevaral-paper-home-voice.css'
import './styles/theme-escrevaral-paper-home-lexical.css'
import './styles/theme-escrevaral-paper-home-library.css'
import './styles/theme-escrevaral-paper-home-integrity.css'
import './styles/theme-escrevaral-shell-centering.css'
import './styles/theme-escrevaral-paper-home-local-feedback.css'
import './styles/theme-escrevaral-paper-home-reader.css'
import './styles/theme-escrevaral-paper-home-proof-status.css'
import './styles/theme-escrevaral-ux-stabilization.css'
import './styles/theme-escrevaral-contextual-rail-visual-qa.css'
import './styles/theme-escrevaral-helena-gate.css'

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
    <WritingLocalFeedbackBridge />
    <WritingOfflineBridge />
    <WritingProofStatusBridge />
    <WritingReaderBridge />
    <WritingExportBridge />
    <WritingConfigBridge />
    <WritingResearchBridge />
    <WritingTagsBridge />
    <WritingVoiceBridge />
    <WritingLexicalBridge />
    <WritingToolsBridge />
    <WritingIntegrityBridge />
    <WritingRestChrome />
  </StrictMode>,
)
