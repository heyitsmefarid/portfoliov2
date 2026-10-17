import { useEffect, useRef, useState } from 'react'
import { navigate } from '../lib/router.js'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import Badge from './Badge.jsx'
import LaptopShot from './LaptopShot.jsx'
import Link from './Link.jsx'
import './ProjectDeck.css'

// 800k-style fan: the front card is flat, the others lean out behind it.
// Click a back card (or ← →, or swipe) to bring it forward; click the front
// card to open its page. Reduced motion: CSS lays the cards out in a row.
export default function ProjectDeck({ projects }) {
  const [front, setFront] = useState(0)
  const swipe = useRef(null)
  const stageRef = useRef(null)
  const focusFront = useRef(false)
  const count = projects.length
  const fanned = !prefersReducedMotion()
  const step = (delta) => setFront((index) => (index + delta + count) % count)

  // Arrow keys unmount the focused link (only the front card has one), so hand
  // focus to the new front card's link.
  useEffect(() => {
    if (!focusFront.current) return
    focusFront.current = false
    stageRef.current?.querySelector('.deck__card[data-offset="0"] .deck__name a')?.focus()
  }, [front])

  return (
    <div
      className="deck"
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        focusFront.current = Boolean(event.target.closest('.deck__card'))
        step(event.key === 'ArrowLeft' ? -1 : 1)
      }}
      onPointerDown={(event) => {
        swipe.current = event.clientX
      }}
      onPointerUp={(event) => {
        const dx = swipe.current === null ? 0 : event.clientX - swipe.current
        swipe.current = null
        if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
      }}
    >
      <div className="deck__stage" ref={stageRef}>
        {projects.map((project, index) => {
          // -1 = left, 0 = front, 1 = right (for three cards)
          const offset = ((index - front + count + 1) % count) - 1
          const isFront = offset === 0 || !fanned
          return (
            <article
              key={project.id}
              className="deck__card"
              data-offset={offset}
              aria-hidden={isFront ? undefined : true}
              onClick={(event) => {
                if (event.target.closest('a')) return
                if (isFront) navigate(`/projects/${project.id}`)
                else setFront(index)
              }}
            >
              <ul className="deck__badges" aria-label="Highlights">
                {project.badges.map((badge) => (
                  <li key={badge}>
                    <Badge>{badge}</Badge>
                  </li>
                ))}
              </ul>
              <LaptopShot {...project.image} eager={offset === 0} />
              <h3 className="deck__name">
                {isFront ? <Link href={`/projects/${project.id}`}>{project.name}</Link> : project.name}
              </h3>
              <p className="deck__pitch">{project.pitch}</p>
            </article>
          )
        })}
      </div>

      {fanned && (
        <div className="deck__controls">
          <button type="button" onClick={() => step(-1)} aria-label="Previous project">
            ←
          </button>
          <span aria-live="polite">
            {String(front + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
          <button type="button" onClick={() => step(1)} aria-label="Next project">
            →
          </button>
        </div>
      )}
    </div>
  )
}
