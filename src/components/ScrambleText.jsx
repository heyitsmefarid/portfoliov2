import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*<>/{}'

function scrambled(text, settled) {
  return [...text]
    .map((char, index) => {
      if (index < settled || char === ' ') return char
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    })
    .join('')
}

// Mono text that "decodes" into place the first time it scrolls into view.
// Screen readers always get the real text; the animated copy is hidden from them.
export default function ScrambleText({ text, duration = 650, className = '' }) {
  const [display, setDisplay] = useState(text)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element || prefersReducedMotion() || !('IntersectionObserver' in window)) return

    let frame = 0
    const run = () => {
      const start = performance.now()
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        const settled = Math.floor(progress * text.length)
        setDisplay(progress >= 1 ? text : scrambled(text, settled))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          run()
        }
      },
      { threshold: 0.6 },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [text, duration])

  return (
    <span className={className} ref={ref}>
      <span aria-hidden="true">{display}</span>
      <span className="visually-hidden">{text}</span>
    </span>
  )
}
