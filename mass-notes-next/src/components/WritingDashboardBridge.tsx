import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { WritingDashboardFields } from './WritingDashboard'

export function WritingDashboardBridge() {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const findHost = () => {
      const target = document.querySelector<HTMLElement>('.registration')
      if (target) setHost((current) => current === target ? current : target)
      return Boolean(target)
    }

    if (findHost()) return
    const root = document.getElementById('root')
    if (!root) return

    const observer = new MutationObserver(() => {
      if (findHost()) observer.disconnect()
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!host) return
    host.classList.add('writing-dashboard')
    host.setAttribute('role', 'region')
    host.setAttribute('aria-label', 'Painel da sessão de escrita')
    return () => {
      host.classList.remove('writing-dashboard')
      host.removeAttribute('role')
      host.removeAttribute('aria-label')
    }
  }, [host])

  return host ? createPortal(<WritingDashboardFields />, host) : null
}
