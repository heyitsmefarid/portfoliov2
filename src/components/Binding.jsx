import { sections } from '../data/sections.js'
import { profile } from '../data/profile.js'
import { useScrollSpy } from '../hooks/useScrollSpy.js'
import { usePathname } from '../lib/router.js'
import Link from './Link.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import './Binding.css'

const NAV = sections.filter((section) => section.nav)
const SPY_IDS = sections.map((section) => section.id)
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const SHORTCUT = IS_MAC ? '⌘K' : 'Ctrl K'

// The strip across the top of the form: name, section links,
// the Ctrl K menu and the page switch. Sticks to the top while scrolling.
export default function Binding({ onOpenMenu }) {
  const onHome = usePathname() === '/'
  const spied = useScrollSpy(SPY_IDS)
  const active = onHome ? spied : null

  return (
    <header className="binding">
      <div className="binding__inner">
        <Link className="binding__name" href="/" aria-label={`${profile.name}, home`}>
          {profile.firstName} Gallano
        </Link>

        <nav className="binding__nav" aria-label="Sections">
          <ul>
            {NAV.map((section) => (
              <li key={section.id}>
                <Link
                  className="binding__link"
                  href={`/#${section.id}`}
                  aria-current={active === section.id ? 'location' : undefined}
                >
                  {section.nav}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="binding__tools">
          <button type="button" className="binding__menu" onClick={onOpenMenu} aria-label={`Open menu (${SHORTCUT})`}>
            <span>Menu</span>
            <kbd>{SHORTCUT}</kbd>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
