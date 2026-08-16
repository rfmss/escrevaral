import { useEffect } from 'react'

const WRITING_INPUT = /^(insert|delete|history)/
const SYNC_FOCUS_LINE_EVENT = 'escrevaral:sync-focus-line'

function clearFocusLine() {
  document.querySelectorAll('.ProseMirror p.focus-line').forEach((paragraph) => paragraph.classList.remove('focus-line'))
}

function syncFocusLine() {
  document.dispatchEvent(new CustomEvent(SYNC_FOCUS_LINE_EVENT))
}

function focusToggleButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('.paper-shell .statusbar .play')
}

function enterFocusMode() {
  if (document.body.classList.contains('focus-mode')) return
  focusToggleButton()?.click()
}

function leaveFocusMode() {
  if (!document.body.classList.contains('focus-mode')) return
  focusToggleButton()?.click()
  clearFocusLine()
  window.requestAnimationFrame(() => document.querySelector<HTMLElement>('.ProseMirror')?.focus())
}

export function WritingAutoFocusBridge() {
  useEffect(() => {
    const onInput = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('.ProseMirror')) return

      const inputType = (event as InputEvent).inputType || 'insertText'
      if (!WRITING_INPUT.test(inputType)) return

      enterFocusMode()
      window.requestAnimationFrame(syncFocusLine)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || !document.body.classList.contains('focus-mode')) return
      const target = event.target
      if (target instanceof Element && target.closest('.ProseMirror')) syncFocusLine()
    }

    const onSelectionChange = () => {
      if (document.body.classList.contains('focus-mode')) syncFocusLine()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !document.body.classList.contains('focus-mode')) return
      event.preventDefault()
      event.stopPropagation()
      leaveFocusMode()
    }

    const bodyObserver = new MutationObserver(() => {
      if (document.body.classList.contains('focus-mode')) window.requestAnimationFrame(syncFocusLine)
      else clearFocusLine()
    })

    document.addEventListener('input', onInput)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('keydown', onKeyDown, true)
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => {
      document.removeEventListener('input', onInput)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('selectionchange', onSelectionChange)
      document.removeEventListener('keydown', onKeyDown, true)
      bodyObserver.disconnect()
      clearFocusLine()
    }
  }, [])

  return null
}
