import { profile } from '../data/profile.js'
import ThemeToggle from './ThemeToggle.jsx'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="footer__built">
          Built with React &amp; Vite <span className="footer__hint">· psst, type “fred”</span>
        </p>
        <div className="footer__end">
          <ThemeToggle />
          <a className="text-link footer__top" href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
