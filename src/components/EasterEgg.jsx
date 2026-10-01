import { useCallback, useEffect, useRef, useState } from 'react'
import { skillGroups } from '../data/skills.js'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import './EasterEgg.css'

// Type "fred" anywhere (outside a text field), or the Konami code, for an
// amber rain of code glyphs and a small secret message.
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const WORD = ['f', 'r', 'e', 'd']
const GLYPHS = '01{}<>/=;[]()#$*+ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const WORDS = skillGroups.flatMap((group) => group.items.map((item) => item.name.toUpperCase()))
const RAIN_MS = 5200

function isTyping(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

function endsWith(list, pattern) {
  return pattern.every((key, i) => list[list.length - pattern.length + i]?.toLowerCase() === key.toLowerCase())
}

function Rain({ onDone }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const size = 16
    const columns = Math.ceil(width / size)
    const drops = Array.from({ length: columns }, () => ({
      y: -Math.random() * height,
      speed: 4 + Math.random() * 7,
      word: Math.random() < 0.12 ? WORDS[Math.floor(Math.random() * WORDS.length)] : null,
      index: 0,
    }))
    const amber = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim() || '#ffb000'
    const start = performance.now()
    let frame = 0

    const draw = (now) => {
      const elapsed = now - start
      ctx.clearRect(0, 0, width, height)
      ctx.font = `700 ${size - 2}px 'JetBrains Mono Variable', monospace`
      const fadeOut = Math.max(0, Math.min(1, (RAIN_MS - elapsed) / 900))

      drops.forEach((drop, column) => {
        drop.y += drop.speed
        const x = column * size
        // A short trail behind each drop head
        for (let t = 0; t < 12; t += 1) {
          const y = drop.y - t * size
          if (y < -size || y > height + size) continue
          const char = drop.word
            ? drop.word[(drop.index + t) % drop.word.length]
            : GLYPHS[(column * 7 + t * 13 + Math.floor(drop.y / size)) % GLYPHS.length]
          ctx.globalAlpha = (t === 0 ? 1 : 0.7 * (1 - t / 12)) * fadeOut
          ctx.fillStyle = t === 0 ? '#ffffff' : amber
          ctx.fillText(char, x, y)
        }
        if (drop.y - 12 * size > height && elapsed < RAIN_MS - 1200) {
          drop.y = -Math.random() * 200
          drop.index += 1
        }
      })
      ctx.globalAlpha = 1

      if (elapsed < RAIN_MS) frame = requestAnimationFrame(draw)
      else onDone()
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [onDone])

  return <canvas ref={canvasRef} className="egg__rain" aria-hidden="true" />
}

export default function EasterEgg({ onContact }) {
  const [raining, setRaining] = useState(false)
  const [toast, setToast] = useState(false)
  const keys = useRef([])
  const stopRain = useCallback(() => setRaining(false), [])

  useEffect(() => {
    const onKey = (event) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
      keys.current = [...keys.current, event.key].slice(-KONAMI.length)
      if (endsWith(keys.current, WORD) || endsWith(keys.current, KONAMI)) {
        keys.current = []
        if (!prefersReducedMotion()) setRaining(true)
        setToast(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(false), 9000)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <>
      {raining && <Rain onDone={stopRain} />}
      {toast && (
        <div className="egg__toast" role="status">
          <span className="egg__spark" aria-hidden="true">
            ✦
          </span>
          <p>
            <strong>Easter egg found.</strong> You explore the details — Fred does too.
          </p>
          <button
            type="button"
            className="egg__action"
            onClick={() => {
              setToast(false)
              onContact()
            }}
          >
            Say hi
          </button>
          <button type="button" className="egg__close" onClick={() => setToast(false)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
    </>
  )
}
