import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'

// A field of dots on a rolling 3D surface, drawn in perspective behind the
// hero — like flying low over a wave of data. Amber marks the peaks. The
// camera drifts with the pointer and rises as you scroll away. Plain canvas,
// no 3D library; it pauses when off screen or in a background tab.

const COLS = 72
const ROWS = 34
const Z_NEAR = 160
const DEPTH = 1500
const BUCKETS = 5

function readColors() {
  const styles = getComputedStyle(document.documentElement)
  return {
    dot: styles.getPropertyValue('--text').trim() || '#f2f2f2',
    peak: styles.getPropertyValue('--amber').trim() || '#ffb000',
  }
}

export default function HeroField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = prefersReducedMotion()
    let colors = readColors()
    let width = 0
    let height = 0
    let frame = 0
    let visible = true
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (time) => {
      const t = reduced ? 0 : time * 0.00042
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04

      const scroll = Math.min(window.scrollY / Math.max(height, 1), 1)
      const focal = height * 0.95
      const horizon = height * (0.5 - scroll * 0.12) + pointer.y * 14
      const camHeight = 150 + scroll * 170
      const camX = pointer.x * 90
      const spread = ((width / 2) * (Z_NEAR + DEPTH)) / focal
      const amplitude = 34 + scroll * 26

      // Group dots into a few colour/opacity buckets so each frame only needs
      // a handful of fill calls.
      const plain = Array.from({ length: BUCKETS }, () => new Path2D())
      const peaks = Array.from({ length: BUCKETS }, () => new Path2D())

      for (let r = ROWS - 1; r >= 0; r -= 1) {
        const depth = r / (ROWS - 1)
        const z = Z_NEAR + depth * DEPTH
        const scale = focal / z
        const fade = Math.min(1, (1 - depth) * 1.6) * Math.min(1, depth * 6 + 0.25)
        const bucket = Math.min(BUCKETS - 1, Math.floor(fade * BUCKETS))
        const size = Math.max(0.7, 2.6 * scale * 0.9)

        for (let c = 0; c < COLS; c += 1) {
          const x = (c / (COLS - 1) - 0.5) * 2 * spread
          const wave =
            Math.sin(x * 0.0042 + t * 1.3) * 0.55 +
            Math.cos(z * 0.0055 - t * 1.1) * 0.5 +
            Math.sin((x + z) * 0.0026 + t * 0.7) * 0.45
          // A soft bump that follows the pointer
          const dx = x - pointer.x * spread * 0.55
          const dz = z - (Z_NEAR + DEPTH * 0.28)
          const bump = Math.exp(-(dx * dx + dz * dz) / 90000) * 1.4 * (Math.abs(pointer.x) + Math.abs(pointer.y) > 0.01 ? 1 : 0)
          const y = (wave + bump) * amplitude

          const sx = width / 2 + (x - camX) * scale
          const sy = horizon + (camHeight - y) * scale
          if (sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue

          const target = wave + bump > 0.95 ? peaks[bucket] : plain[bucket]
          target.rect(sx - size / 2, sy - size / 2, size, size)
        }
      }

      ctx.clearRect(0, 0, width, height)
      for (let b = 0; b < BUCKETS; b += 1) {
        const alpha = (b + 1) / BUCKETS
        ctx.globalAlpha = alpha * 0.34
        ctx.fillStyle = colors.dot
        ctx.fill(plain[b])
        ctx.globalAlpha = alpha * 0.95
        ctx.fillStyle = colors.peak
        ctx.fill(peaks[b])
      }
      ctx.globalAlpha = 1
    }

    const loop = (time) => {
      draw(time)
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0
    }
    const start = () => {
      if (!reduced && !frame && visible && !document.hidden) frame = requestAnimationFrame(loop)
    }

    const onPointer = (event) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
    }
    const onResize = () => {
      resize()
      if (reduced) draw(0)
    }
    const onVisibility = () => start()

    // Re-read colours when the theme changes
    const themeObserver = new MutationObserver(() => {
      colors = readColors()
      if (reduced) draw(0)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })
    viewObserver.observe(canvas)

    resize()
    if (reduced) draw(0)
    else start()

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      themeObserver.disconnect()
      viewObserver.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__field" aria-hidden="true" />
}
