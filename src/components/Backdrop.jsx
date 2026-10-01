import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import './Backdrop.css'

// A fixed dot grid behind the page that only shows around the cursor, with a
// faint amber glow — like shining a light across a workbench. On touch
// screens (and with reduced motion) it stays as a still glow near the top.
export default function Backdrop() {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!element || !finePointer || prefersReducedMotion()) return

    let frame = 0
    let x = 0
    let y = 0

    const onMove = (event) => {
      x = event.clientX
      y = event.clientY
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        element.style.setProperty('--mx', `${x}px`)
        element.style.setProperty('--my', `${y}px`)
        element.dataset.active = 'true'
      })
    }
    const onLeave = () => {
      element.dataset.active = 'false'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="backdrop" ref={ref} aria-hidden="true">
      <div className="backdrop__dots" />
      <div className="backdrop__glow" />
    </div>
  )
}
