import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import LaptopShot from './LaptopShot.jsx'
import './DemoPlayer.css'

// An animated WebP clip in the laptop frame. Paused = the poster still.
// Plays while on screen (never on its own with reduced motion). Without a
// clip, or if it fails to load, shows the project's screenshot instead.
export default function DemoPlayer({ demo, fallback, label }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!demo || prefersReducedMotion() || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting && !userPaused), {
      threshold: 0.4,
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [demo, userPaused])

  if (!demo || failed) {
    return fallback ? <LaptopShot {...fallback} eager /> : null
  }

  const toggle = () => {
    setUserPaused(playing)
    setPlaying(!playing)
  }

  return (
    <figure className="demo" ref={ref}>
      <LaptopShot>
        <img
          key={playing ? 'clip' : 'poster'}
          src={playing ? demo.src : demo.poster}
          alt={`${label} demo${playing ? '' : ' (paused)'}`}
          width={demo.width}
          height={demo.height}
          onError={() => setFailed(true)}
        />
      </LaptopShot>
      <button type="button" className="demo__toggle" onClick={toggle} aria-pressed={playing}>
        {playing ? 'Pause demo' : 'Play demo'}
      </button>
    </figure>
  )
}
