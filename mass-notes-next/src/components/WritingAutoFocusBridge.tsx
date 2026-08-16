import { useEffect } from 'react'

const WRITING_INPUT = /^(insert|delete|history)/

function editorElement(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.ProseMirror')
}

function clearFocusLine() {
  editorElement()?.querySelectorAll('p.focus-line').forEach((paragraph) => paragraph.classList.remove('focus-line'))
}

function setFocusLine() {
  const editor = editorElement()
  if (!editor) return

  const selection = window.getSelection()
  const node = selection?.anchorNode ?? null
  const element = node instanceof Element ? node : node?.parentElement ?? null
  const paragraph = element?.closest<HTMLParagraphElement>('p') ?? null

  editor.querySelectorAll('p').forEach((item) => item.classList.toggle('focus-line', item === paragraph))
}

function scheduleFocusLine() {
  window.requestAnimationFrame(() => window.requestAnimationFrame(setFocusLine))
}

function focusToggleButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>('.paper-shell .statusbar .play')
}

function enterFocusMode() {
  if (!document.body.classList.contains('focus-mode')) focusToggleButton()?.click()
  scheduleFocusLine()
}

function leaveFocusMode() {
  if (!document.body.classList.contains('focus-mode')) return
  focusToggleButton()?.click()
  clearFocusLine()
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

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && document.body.classList.contains('focus-mode')) setFocusLine()
    }

    const onSelectionChange = () => {
      if (document.body.classList.contains('focus-mode')) setFocusLine()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !document.body.classList.contains('focus-mode')) return
      event.preventDefault()
      event.stopPropagation()
      leaveFocusMode()
    }

    const bodyObserver = new MutationObserver(() => {
      if (document.body.classList.contains('focus-mode')) scheduleFocusLine()
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
