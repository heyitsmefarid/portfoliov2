import { toggleTheme, useTheme } from '../lib/theme.js'
import './ThemeToggle.css'

// Sun/moon switch. The new theme spreads out from the switch itself.
export default function ThemeToggle({ className = '' }) {
  const theme = useTheme()
  const light = theme === 'light'

  const onClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label="Light mode"
      title={light ? 'Switch to dark mode' : 'Switch to light mode'}
      className={`theme-toggle ${className}`}
      onClick={onClick}
    >
      <span className="theme-toggle__knob" aria-hidden="true">
        {light ? (
          <svg viewBox="0 0 24 24" width="12" height="12">
            <circle cx="12" cy="12" r="4.5" fill="currentColor" />
            <path
              d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor" />
          </svg>
        )}
      </span>
    </button>
  )
}
