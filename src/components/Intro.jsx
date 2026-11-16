import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/profile.js'
import FredLogo from './FredLogo.jsx'
import './Intro.css'

// Once per visit, on the home page: the logo draws itself large on a screen
// the colour of the header bar, then shrinks into its place in the header
// while the screen rolls up into the bar. The page's own entrance (the name
// being typed, the stamp) starts as it lands.
//
// index.html decides whether it plays (adds html.intro-playing before the
// first paint); it never plays with reduced motion. Any click or key skips
// straight to the landing.
const DRAW_MS = 2150 // the logo's own draw-on finishes at ~1.95s
const LAND_MS = 800

function finish() {
  document.documentElement.classList.remove('intro-playing')
  try {
    sessionStorage.setItem('intro-seen', '1')
  } catch {
    // Storage blocked: the intro may simply play again next visit.
  }
}

export default function Intro() {
  const [phase, setPhase] = useState(() =>
    document.documentElement.classList.contains('intro-playing') ? 'draw' : 'done',
  )
  const logoRef = useRef(null)

  // Draw, then land. Clicking or pressing a key lands early.
  useEffect(() => {
    if (phase !== 'draw') return
    const timer = setTimeout(() => setPhase('land'), DRAW_MS)
    const skip = () => setPhase('land')
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [phase])

  // Land: fly the big logo onto the header logo (same shape, same colour),
  // then hand over to the page.
  useEffect(() => {
    if (phase !== 'land') return
    const logo = logoRef.current?.querySelector('svg')
    const target = document.querySelector('.binding__name svg')
    if (logo && target) {
      const from = logo.getBoundingClientRect()
      const to = target.getBoundingClientRect()
      const scale = to.height / from.height
      logo.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})`
    }
    const timer = setTimeout(() => {
      finish()
      setPhase('done')
    }, LAND_MS)
    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div className={`intro intro--${phase}`} aria-hidden="true">
      <div className="intro__stage">
        <div className="intro__logo" ref={logoRef}>
          <FredLogo height={140} replayOnHover={false} decorative />
        </div>
        <p className="intro__name">{profile.name}</p>
      </div>
      <p className="intro__skip">Click or press any key to skip</p>
    </div>
  )
}
