import { lazy, Suspense } from 'react'
import type { RightRailProps } from './RightRailImpl'

const RightRailImpl = lazy(() => import('./RightRailImpl').then((module) => ({ default: module.RightRail })))

export function RightRail(props: RightRailProps) {
  if (!props.open) return null
  return (
    <Suspense fallback={<div className="rail open" aria-label="Ferramentas do texto" role="dialog" aria-modal="true" />}>
      <RightRailImpl {...props} />
    </Suspense>
  )
}
