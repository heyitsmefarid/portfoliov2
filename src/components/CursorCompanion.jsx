import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import './CursorCompanion.css'

// An amber ring that trails the mouse (the normal cursor stays visible). It
// grows over anything clickable, and over elements with data-cursor="…" it
// becomes a small label.
// Mouse only; off for touch and reduced motion.
const INTERACTIVE = 'a, button, [role="switch"], summary, label'
const TEXT_FIELDS = 'input, textarea, [contenteditable="true"]'

export default function CursorCompanion() {
  const rootRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!root || !finePointer || prefersReducedMotion()) return

    let x = -100
    let y = -100
    let targetX = -100
    let targetY = -100
    let frame = 0

    const loop = () => {
      x += (targetX - x) * 0.22
      y += (targetY - y) * 0.22
      root.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.2 ? requestAnimationFrame(loop) : 0
    }

    const onMove = (event) => {
      targetX = event.clientX
      targetY = event.clientY
      if (root.dataset.visible !== 'true') {
        x = targetX
        y = targetY
        root.dataset.visible = 'true'
      }

      const element = event.target instanceof Element ? event.target : null
      const labelled = element?.closest('[data-cursor]')
      const label = labelled?.dataset.cursor ?? ''
      let mode = 'idle'
      if (element?.closest(TEXT_FIELDS)) mode = 'text'
      else if (label) mode = 'label'
      else if (element?.closest(INTERACTIVE)) mode = 'hover'
      if (root.dataset.mode !== mode) root.dataset.mode = mode
      if (labelRef.current && labelRef.current.textContent !== label) labelRef.current.textContent = label

      if (!frame) frame = requestAnimationFrame(loop)
    }
    const onLeave = () => {
      root.dataset.visible = 'false'
    }
    const onDown = () => {
      root.dataset.pressed = 'true'
    }
    const onUp = () => {
      root.dataset.pressed = 'false'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="cursor" ref={rootRef} data-visible="false" data-mode="idle" aria-hidden="true">
      <span className="cursor__ring">
        <span className="cursor__label" ref={labelRef} />
      </span>
    </div>
  )
}
