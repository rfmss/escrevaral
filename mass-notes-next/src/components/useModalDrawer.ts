import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && style.visibility !== 'hidden' && !element.hasAttribute('inert')
  })
}

export function useModalDrawer<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const panelRef = useRef<T>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const initial = panel.querySelector<HTMLElement>('[data-drawer-initial]') ?? focusableElements(panel)[0]
    window.requestAnimationFrame(() => initial?.focus())

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const elements = focusableElements(panel)
      if (!elements.length) {
        event.preventDefault()
        panel.focus()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    panel.addEventListener('keydown', onKeyDown)
    return () => {
      panel.removeEventListener('keydown', onKeyDown)
      const target = returnFocusRef.current
      window.requestAnimationFrame(() => target?.focus())
    }
  }, [open])

  return panelRef
}
