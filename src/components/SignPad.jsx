import { useEffect, useRef, useState } from 'react'
import './SignPad.css'

// "Received by": a line the visitor can actually sign, with a mouse, pen or
// finger. Nothing is sent or saved; it's ink on their copy of the form.
export default function SignPad() {
  const canvasRef = useRef(null)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let drawing = false
    let last = null

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      setSigned(false)
    }
    fit()

    const point = (event) => {
      const rect = canvas.getBoundingClientRect()
      return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    const down = (event) => {
      drawing = true
      last = point(event)
      canvas.setPointerCapture(event.pointerId)
      ctx.strokeStyle = getComputedStyle(canvas).color
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    const move = (event) => {
      if (!drawing) return
      const next = point(event)
      // Faster strokes are thinner, like a real pen.
      const speed = Math.hypot(next.x - last.x, next.y - last.y)
      ctx.lineWidth = Math.max(1.1, 2.6 - speed * 0.06)
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(next.x, next.y)
      ctx.stroke()
      last = next
      setSigned(true)
    }
    const up = () => {
      drawing = false
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    window.addEventListener('resize', fit)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      window.removeEventListener('resize', fit)
    }
  }, [])

  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setSigned(false)
  }

  return (
    <div className="signpad">
      <div className="signpad__line">
        <canvas ref={canvasRef} className="signpad__canvas" aria-label="Signature area: draw with a mouse or finger" />
        {!signed && (
          <span className="signpad__hint" aria-hidden="true">
            sign here
          </span>
        )}
      </div>
      <p className="signpad__foot">
        <span className="blank__label">Received by (it stays on your screen, nothing is sent)</span>
        {signed && (
          <button type="button" className="signpad__clear" onClick={clear}>
            Erase
          </button>
        )}
      </p>
    </div>
  )
}
