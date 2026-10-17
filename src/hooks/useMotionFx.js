import { useEffect } from 'react'
import { prefersReducedMotion } from './useReducedMotion.js'

// Two motion effects driven by one pointer/scroll loop:
//  - Hero depth: sets --hx / --hy (-1…1, eased) on .hero so its layers can
//    drift at different depths as the mouse moves (mouse only).
//  - Scroll lean: sets --skew on <html> from scroll speed; the panel grid
//    leans a little while you scroll fast and settles when you stop.
export function useMotionFx(key) {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const root = document.documentElement
    const hero = document.querySelector('.hero')
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    let skew = 0
    let lastY = window.scrollY
    let lastTime = performance.now()
    let frame = 0

    const loop = (now) => {
      frame = 0
      let busy = false

      // Hero depth
      if (hero) {
        pointer.x += (pointer.tx - pointer.x) * 0.08
        pointer.y += (pointer.ty - pointer.y) * 0.08
        hero.style.setProperty('--hx', pointer.x.toFixed(3))
        hero.style.setProperty('--hy', pointer.y.toFixed(3))
        busy ||= Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.002
      }

      // Scroll lean: speed in px/ms → a small angle, eased back to 0
      const y = window.scrollY
      const dt = Math.max(now - lastTime, 1)
      const target = Math.max(-1.6, Math.min(1.6, ((y - lastY) / dt) * 0.9))
      lastY = y
      lastTime = now
      skew += (target - skew) * 0.12
      if (Math.abs(skew) < 0.005) skew = 0
      root.style.setProperty('--skew', `${skew.toFixed(3)}deg`)
      busy ||= skew !== 0 || target !== 0

      if (busy) frame = requestAnimationFrame(loop)
    }

    const wake = () => {
      if (!frame) {
        lastTime = performance.now()
        frame = requestAnimationFrame(loop)
      }
    }
    const onPointer = (event) => {
      pointer.tx = (event.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (event.clientY / window.innerHeight) * 2 - 1
      wake()
    }

    if (finePointer) window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', wake, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', wake)
      root.style.removeProperty('--skew')
    }
  }, [key])
}
