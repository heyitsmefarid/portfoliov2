import { useEffect, useRef } from 'react'
import { sections, sectionNumber } from '../data/sections.js'
import { useScrollSpy } from '../hooks/useScrollSpy.js'
import './SideIndex.css'

const SECTION_IDS = sections.map((section) => section.id)
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const SHORTCUT = IS_MAC ? '⌘K' : 'Ctrl K'

// Replaces a top nav bar. Wide screens: a slim index of section numbers on the
// left edge with a scroll-progress line (names appear on hover/focus).
// Smaller screens: a Menu button in the bottom-left that opens the command menu.
export default function SideIndex({ onOpenMenu }) {
  const active = useScrollSpy(SECTION_IDS)
  const progressRef = useRef(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      progressRef.current?.style.setProperty('--progress', progress.toFixed(4))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <>
      <nav className="side-index" aria-label="Sections">
        <a className="side-index__logo" href="#top" aria-label="Fred Anthony Gallano, back to top">
          F<span aria-hidden="true" />
        </a>

        <div className="side-index__rail">
          <span className="side-index__progress" ref={progressRef} aria-hidden="true" />
          <ol>
            {sections.map((section, index) => (
              <li key={section.id} style={{ '--i': index }}>
                <a
                  className="side-index__link"
                  href={`#${section.id}`}
                  aria-current={active === section.id ? 'location' : undefined}
                >
                  <span className="side-index__num">{sectionNumber(section.id)}</span>
                  <span className="side-index__label">{section.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        <button type="button" className="side-index__menu" onClick={onOpenMenu} aria-label={`Open command menu (${SHORTCUT})`}>
          <kbd>{SHORTCUT}</kbd>
        </button>
      </nav>

      <button type="button" className="menu-fab" onClick={onOpenMenu} aria-label="Open menu" data-magnetic>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M5 7h14M5 12h9M5 17h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span>Menu</span>
      </button>
    </>
  )
}
