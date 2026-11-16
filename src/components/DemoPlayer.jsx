import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import Printout from './Printout.jsx'
import './DemoPlayer.css'

// An animated WebP clip as a printout. The poster still is always there
// underneath; the clip fades in over it once it has loaded and plays while on
// screen (never on its own with reduced motion). If the clip can't load, the
// poster stays. Without a clip at all, shows the project's screenshot.
export default function DemoPlayer({ demo, fallback, label }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!demo || failed || prefersReducedMotion() || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting && !userPaused), {
      threshold: 0.4,
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [demo, failed, userPaused])

  if (!demo) {
    return fallback ? <Printout {...fallback} eager /> : null
  }

  const toggle = () => {
    setUserPaused(playing)
    setPlaying(!playing)
  }

  return (
    <figure className="demo" ref={ref}>
      <Printout>
        <span className="demo__screen">
          <img src={demo.poster} alt={`${label} demo`} width={demo.width} height={demo.height} />
          {playing && !failed && (
            <img
              className="demo__clip"
              data-loaded={loaded}
              src={demo.src}
              alt=""
              width={demo.width}
              height={demo.height}
              onLoad={() => setLoaded(true)}
              onError={() => {
                setFailed(true)
                setPlaying(false)
              }}
            />
          )}
        </span>
      </Printout>
      {!failed && (
        <button type="button" className="demo__toggle" onClick={toggle}>
          {playing ? 'Pause demo' : 'Play demo'}
        </button>
      )}
    </figure>
  )
}
