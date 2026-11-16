import { useEffect, useState } from 'react'
import { profile } from '../data/profile.js'
import './Intro.css'

// Once per visit: the long brown envelope every Filipino student carries
// their requirements in, labelled by hand, slides away to show the form
// inside. index.html decides whether it plays (adds html.intro-playing before
// the first paint); it never plays with reduced motion. Any click or key
// skips it.
const HOLD_MS = 1300
const SLIDE_MS = 900

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
    document.documentElement.classList.contains('intro-playing') ? 'hold' : 'done',
  )

  useEffect(() => {
    if (phase === 'hold') {
      const timer = setTimeout(() => setPhase('flip'), HOLD_MS)
      const skip = () => setPhase('flip')
      window.addEventListener('pointerdown', skip)
      window.addEventListener('keydown', skip)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('pointerdown', skip)
        window.removeEventListener('keydown', skip)
      }
    }
    if (phase === 'flip') {
      finish()
      const timer = setTimeout(() => setPhase('done'), SLIDE_MS + 100)
      return () => clearTimeout(timer)
    }
  }, [phase])

  if (phase === 'done') return null

  return (
    <div className={`intro intro--${phase}`} aria-hidden="true">
      <div className="intro__cover">
        <div className="intro__label">
          <p>
            <span>Name</span>
            <strong>{profile.name}</strong>
          </p>
          <p>
            <span>Contents</span>
            <strong>Portfolio, 1 form</strong>
          </p>
          <p>
            <span>Course &amp; year</span>
            <strong>BSIS 4</strong>
          </p>
        </div>
        <p className="intro__skip">Click or press any key to open</p>
      </div>
    </div>
  )
}
