import { type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'

type Props = {
  children: ReactNode
}

export function EditorToolbarDock({ children }: Props) {
  const slotRef = useRef<HTMLDivElement>(null)
  const detachedRef = useRef(false)
  const [dock, setDock] = useState<HTMLDivElement | null>(null)
  const [detached, setDetached] = useState(false)

  useEffect(() => {
    const element = document.createElement('div')
    element.className = 'editor-toolbar-dock'
    element.hidden = true
    element.dataset.toolbarDocked = 'false'
    document.body.append(element)
    setDock(element)
    return () => element.remove()
  }, [])

  useEffect(() => {
    const slot = slotRef.current
    if (!slot || !dock) return
    const viewport = slot.closest<HTMLElement>('.editor-viewport')
    if (!viewport) return

    const update = () => {
      const viewportRect = viewport.getBoundingClientRect()
      const slotRect = slot.getBoundingClientRect()
      const shouldDetach = viewport.scrollTop > 0 && slotRect.top <= viewportRect.top
      const availableLeft = Math.max(viewportRect.left, slotRect.left)
      const availableRight = Math.min(viewportRect.right, slotRect.right)

      dock.style.top = `${Math.round(viewportRect.top)}px`
      dock.style.left = `${Math.round(availableLeft)}px`
      dock.style.width = `${Math.max(0, Math.round(availableRight - availableLeft))}px`
      dock.hidden = !shouldDetach
      dock.dataset.toolbarDocked = String(shouldDetach)

      if (detachedRef.current !== shouldDetach) {
        detachedRef.current = shouldDetach
        flushSync(() => setDetached(shouldDetach))
      }
    }

    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(viewport)
    resizeObserver.observe(slot)
    viewport.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()

    return () => {
      resizeObserver.disconnect()
      viewport.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      dock.hidden = true
      dock.dataset.toolbarDocked = 'false'
      detachedRef.current = false
    }
  }, [dock])

  return (
    <div ref={slotRef} className={`editor-toolbar-slot ${detached ? 'is-detached' : ''}`}>
      {detached && dock ? createPortal(children, dock) : children}
    </div>
  )
}
