import { useEffect } from 'react'

const WRITING_INPUT = /^(insert|delete|history)/

function asElement(node: Node | null): Element | null {
  if (!node) return null
  return node instanceof Element ? node : node.parentElement
}

function clearFocusLine() {
  document.querySelectorAll('.ProseMirror p.focus-line').forEach((paragraph) => paragraph.classList.remove('focus-line'))
}

function setFocusLine() {
  const selection = window.getSelection()
  const editor = asElement(selection?.anchorNode ?? null)?.closest<HTMLElement>('.ProseMirror')
  if (!editor || document.activeElement !== editor) return

  const paragraph = asElement(selection?.anchorNode ?? null)?.closest('p')
  editor.querySelectorAll('p').forEach((item) => item.classList.toggle('focus-line', item === paragraph))
}

function enterFocusMode() {
  if (document.body.classList.contains('focus-mode')) return
  document.querySelector<HTMLButtonElement>('.paper-shell .statusbar .play')?.click()
}

export function WritingAutoFocusBridge() {
  useEffect(() => {
    const onInput = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('.ProseMirror')) return

      const inputType = (event as InputEvent).inputType || 'insertText'
      if (!WRITING_INPUT.test(inputType)) return

      enterFocusMode()
      window.requestAnimationFrame(setFocusLine)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || !document.body.classList.contains('focus-mode')) return
      const target = event.target
      if (target instanceof Element && target.closest('.ProseMirror')) setFocusLine()
    }

    const onSelectionChange = () => {
      if (!document.body.classList.contains('focus-mode')) return
      if (document.activeElement?.closest('.ProseMirror')) setFocusLine()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.body.classList.contains('focus-mode')) clearFocusLine()
    }

    const bodyObserver = new MutationObserver(() => {
      if (document.body.classList.contains('focus-mode')) window.requestAnimationFrame(setFocusLine)
      else clearFocusLine()
    })

    document.addEventListener('input', onInput)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('selectionchange', onSelectionChange)
    document.addEventListener('keydown', onKeyDown)
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    return () => {
      document.removeEventListener('input', onInput)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('selectionchange', onSelectionChange)
      document.removeEventListener('keydown', onKeyDown)
      bodyObserver.disconnect()
      clearFocusLine()
    }
  }, [])

  return null
}
