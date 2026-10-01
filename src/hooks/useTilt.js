import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from './useReducedMotion.js'

// Tilts an element slightly toward the pointer and moves a soft glare with it.
// Mouse/trackpad only; skipped for touch and reduced motion.
export function useTilt(maxDegrees = 5) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!element || !finePointer || prefersReducedMotion()) return

    let frame = 0
    const onMove = (event) => {
      const rect = element.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        element.style.setProperty('--rx', `${((0.5 - y) * maxDegrees).toFixed(2)}deg`)
        element.style.setProperty('--ry', `${((x - 0.5) * maxDegrees).toFixed(2)}deg`)
        element.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
        element.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
        element.dataset.tilt = 'on'
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      element.dataset.tilt = 'off'
      element.style.setProperty('--rx', '0deg')
      element.style.setProperty('--ry', '0deg')
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
    }
  }, [maxDegrees])

  return ref
}
