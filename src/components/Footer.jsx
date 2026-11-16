import { profile } from '../data/profile.js'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import ThemeToggle from './ThemeToggle.jsx'
import ViewCount from './ViewCount.jsx'
import './Footer.css'

// The fine print under the form.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        {/* Always rendered, so the footer keeps its three columns while the count loads */}
        <div className="footer__count">
          <ViewCount />
        </div>
        <div className="footer__end">
          <ThemeToggle />
          <a
            className="footer__top"
            href="#top"
            onClick={(event) => {
              event.preventDefault()
              window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
            }}
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  )
}
