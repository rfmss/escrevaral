import { useEffect } from 'react'
import { FOCUS_LINE_MODE_EVENT } from '../editor/focusLineDecoration'

const WRITING_INPUT = /^(insert|delete|history)/

function editorElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.ProseMirror')
}

function publishFocusLineMode(enabled: boolean) {
  document.dispatchEvent(new CustomEvent(FOCUS_LINE_MODE_EVENT, { detail: { enabled } }))
}

function focusToggleButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('.paper-shell .statusbar .play')
}

function enterFocusMode() {
  if (document.body.classList.contains('focus-mode')) {
    publishFocusLineMode(true)
    return
  }
  focusToggleButton()?.click()
}

function leaveFocusMode() {
  if (!document.body.classList.contains('focus-mode')) return
  publishFocusLineMode(false)
  focusToggleButton()?.click()
  window.requestAnimationFrame(() => editorElement()?.focus())
}

export function WritingAutoFocusBridge() {
  useEffect(() => {
    const onInput = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('.ProseMirror')) return

      const inputType = (event as InputEvent).inputType || 'insertText'
      if (!WRITING_INPUT.test(inputType)) return

      enterFocusMode()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !document.body.classList.contains('focus-mode')) return
      event.preventDefault()
      event.stopPropagation()
      leaveFocusMode()
    }

    const bodyObserver = new MutationObserver(() => {
      publishFocusLineMode(document.body.classList.contains('focus-mode'))
    })

    document.addEventListener('input', onInput)
    document.addEventListener('keydown', onKeyDown, true)
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => {
      document.removeEventListener('input', onInput)
      document.removeEventListener('keydown', onKeyDown, true)
      bodyObserver.disconnect()
      publishFocusLineMode(false)
    }
  }, [])

  return null
}
