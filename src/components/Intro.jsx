import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile.js'
import { projects } from '../data/projects.js'
import { skillGroups } from '../data/skills.js'
import './Intro.css'

// A short start-up sequence, once per visit: boot lines and a counter, then
// the screen slices away diagonally (the same blade motion as the portrait).
// index.html decides whether it plays (adds html.intro-playing before the
// first paint); it is skipped for reduced motion. Any click or key skips it.

const TECH_COUNT = skillGroups.reduce((sum, group) => sum + group.items.length, 0)
const LINES = [
  ['mounting profile', 'ok'],
  ['indexing projects', String(projects.length)],
  ['loading tech stack', String(TECH_COUNT)],
  ['warming up the assistant', 'ok'],
]
const BOOT_MS = 1500
const EXIT_MS = 900

function finish() {
  document.documentElement.classList.remove('intro-playing')
  try {
    sessionStorage.setItem('intro-seen', '1')
  } catch {
    // Storage blocked — the intro may simply play again next visit.
  }
}

export default function Intro() {
  const [phase, setPhase] = useState(() =>
    document.documentElement.classList.contains('intro-playing') ? 'boot' : 'done',
  )
  const counterRef = useRef(null)
  const barRef = useRef(null)

  // Boot: count to 100, then slice away.
  useEffect(() => {
    if (phase !== 'boot') return
    let frame = 0
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / BOOT_MS, 1)
      const eased = 1 - Math.pow(1 - progress, 2)
      if (counterRef.current) counterRef.current.textContent = String(Math.round(eased * 100)).padStart(3, '0')
      if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const timer = setTimeout(() => setPhase('exit'), BOOT_MS + 150)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [phase])

  // Exit: let the page start its own entrance underneath, then unmount.
  useEffect(() => {
    if (phase !== 'exit') return
    finish()
    const timer = setTimeout(() => setPhase('done'), EXIT_MS + 150)
    return () => clearTimeout(timer)
  }, [phase])

  // Skip on any click or key
  useEffect(() => {
    if (phase !== 'boot') return
    const skip = () => setPhase('exit')
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [phase])

  if (phase === 'done') return null

  return (
    <div className={`intro intro--${phase}`} aria-hidden="true">
      <div className="intro__blade" />
      <div className="intro__screen">
        <div className="intro__center">
          <p className="intro__kicker">fred.portfolio — {new Date().getFullYear()}</p>
          <p className="intro__name">
            {profile.name.split('').map((char, index) => (
              <span key={index} style={{ '--i': index }}>
                {char === ' ' ? ' ' : char}
              </span>
            ))}
          </p>
          <ul className="intro__lines">
            {LINES.map(([label, value], index) => (
              <li key={label} style={{ '--i': index }}>
                <span className="intro__prompt">&gt;</span> {label}
                <span className="intro__dots" />
                <span className="intro__value">{value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="intro__footer">
          <span className="intro__skip">click or press any key to skip</span>
          <span className="intro__counter" ref={counterRef}>
            000
          </span>
        </div>
        <span className="intro__bar" ref={barRef} />
      </div>
    </div>
  )
}
