import { Fragment } from 'react'
import { profile } from '../data/profile.js'
import { dividers } from '../data/sections.js'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import Divider from './Divider.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import Portrait from './Portrait.jsx'
import LocalTime from './LocalTime.jsx'
import ViewCount from './ViewCount.jsx'
import './Hero.css'

const WIPE = [
  { transform: 'scaleX(0)', transformOrigin: 'left' },
  { transform: 'scaleX(1)', transformOrigin: 'left', offset: 0.45 },
  { transform: 'scaleX(1)', transformOrigin: 'right', offset: 0.55 },
  { transform: 'scaleX(0)', transformOrigin: 'right' },
]

// Hovering a word of the name runs the amber cursor block across it again.
function replayWipe(event) {
  const word = event.currentTarget
  if (prefersReducedMotion() || word.dataset.wiping || typeof word.animate !== 'function') return
  word.dataset.wiping = 'true'
  const animation = word.animate(WIPE, {
    duration: 420,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    pseudoElement: '::after',
  })
  animation.onfinish = animation.oncancel = () => delete word.dataset.wiping
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path
        d="M12 21s-6.5-6.1-6.5-11A6.5 6.5 0 0 1 18.5 10c0 4.9-6.5 11-6.5 11z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.3" fill="currentColor" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function Hero({ onContact }) {
  const { photo } = profile
  const words = profile.name.split(' ')

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <Divider label={dividers.top} />

      <div className="container hero__inner">
        {photo && (
          <div className="hero__visual">
            <Portrait photo={photo} video={photo.video} />
          </div>
        )}

        <div className="hero__copy">
          <h1 id="hero-title" className="hero__name">
            {words.map((word, index) => (
              <Fragment key={index}>
                <span className="hero__word" style={{ '--i': index }} onPointerEnter={replayWipe}>
                  <span className="hero__word-text">{word}</span>
                </span>{' '}
              </Fragment>
            ))}
          </h1>

          <p className="hero__role">{profile.role}</p>

          <ul className="hero__meta">
            {profile.location && (
              <li>
                <PinIcon />
                {profile.location}
              </li>
            )}
            {profile.timeZone && (
              <li>
                <ClockIcon />
                <LocalTime timeZone={profile.timeZone} place={profile.location.split(',')[0]} />
              </li>
            )}
            {profile.availability.open && (
              <li>
                <span className="status-dot" aria-hidden="true" />
                {profile.availability.label} — {profile.availability.detail}
              </li>
            )}
            <ViewCount />
          </ul>

          <p className="hero__headline">{profile.headline}</p>

          <div className="hero__actions">
            {profile.resumeUrl ? (
              <a className="hero-btn hero-btn--solid" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" data-magnetic>
                Get resume
              </a>
            ) : (
              <a className="hero-btn hero-btn--solid" href="#projects" data-magnetic>
                View projects
              </a>
            )}
            {/* The form sends from any device; email links need a desktop mail app. */}
            <button type="button" className="hero-btn" onClick={onContact} data-magnetic>
              Contact me
            </button>
          </div>

          <div className="hero__theme">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <Divider label={dividers.afterHero} />
    </section>
  )
}
