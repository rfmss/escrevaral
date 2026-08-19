const COLORS = ['#087fc3', '#ff5317', '#11120f', '#f3efe4', '#d5b96f']

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  color: string
  shape: 'rect' | 'circle' | 'strip'
}

export const WRITING_GOAL_ACHIEVED_EVENT = 'escrevaral:writing-goal-achieved'

export function celebrateWritingGoal(words: number, goal: number): void {
  window.dispatchEvent(new CustomEvent(WRITING_GOAL_ACHIEVED_EVENT, {
    detail: { words, goal },
  }))

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  document.querySelector('[data-writing-goal-confetti]')?.remove()

  const canvas = document.createElement('canvas')
  canvas.dataset.writingGoalConfetti = 'true'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:9999;pointer-events:none;'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.append(canvas)

  const context = canvas.getContext('2d')
  if (!context) {
    canvas.remove()
    return
  }

  const origins = [
    { x: canvas.width * 0.5, y: canvas.height * 0.54, min: 5, max: 15, full: true },
    { x: canvas.width * 0.12, y: canvas.height, min: 9, max: 18, full: false },
    { x: canvas.width * 0.88, y: canvas.height, min: 9, max: 18, full: false },
  ]
  const shapes: Particle['shape'][] = ['rect', 'circle', 'strip']
  const particleCount = Math.min(180, Math.max(90, Math.round(canvas.width / 8)))

  const particles: Particle[] = Array.from({ length: particleCount }, (_, index) => {
    const origin = origins[index % origins.length]
    const angle = origin.full
      ? Math.random() * Math.PI * 2
      : -Math.PI + Math.random() * Math.PI
    const speed = origin.min + Math.random() * (origin.max - origin.min)

    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 7,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.24,
      color: COLORS[index % COLORS.length],
      shape: shapes[index % shapes.length],
    }
  })

  let frame = 0
  const duration = 135

  const draw = () => {
    if (!canvas.isConnected) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    const alpha = frame < 85 ? 1 : Math.max(0, 1 - (frame - 85) / (duration - 85))

    for (const particle of particles) {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vx *= 0.992
      particle.vy = particle.vy * 0.992 + 0.2
      particle.rotation += particle.spin

      context.save()
      context.globalAlpha = alpha
      context.translate(particle.x, particle.y)
      context.rotate(particle.rotation)
      context.fillStyle = particle.color

      if (particle.shape === 'circle') {
        context.beginPath()
        context.arc(0, 0, particle.size * 0.48, 0, Math.PI * 2)
        context.fill()
      } else if (particle.shape === 'strip') {
        context.fillRect(-particle.size * 0.2, -particle.size, particle.size * 0.4, particle.size * 2)
      } else {
        context.fillRect(-particle.size * 0.6, -particle.size * 0.35, particle.size * 1.2, particle.size * 0.7)
      }
      context.restore()
    }

    frame += 1
    if (frame < duration) {
      window.requestAnimationFrame(draw)
    } else {
      canvas.remove()
    }
  }

  window.requestAnimationFrame(draw)
}
