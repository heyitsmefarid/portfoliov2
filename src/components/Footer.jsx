import { profile } from '../data/profile.js'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import ThemeToggle from './ThemeToggle.jsx'
import './Footer.css'

// The fine print under the form.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="footer__built">Built with React and Vite. Psst: type “fred” anywhere.</p>
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
