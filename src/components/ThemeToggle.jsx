import { toggleTheme, useTheme } from '../lib/theme.js'
import './ThemeToggle.css'

// Light form / carbon copy switch. The new page spreads out from the switch.
export default function ThemeToggle({ className = '' }) {
  const dark = useTheme() === 'dark'

  const onClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? 'Switch to the light form' : 'Switch to the carbon copy'}
      className={`theme-toggle ${className}`}
      onClick={onClick}
    >
      <span className="theme-toggle__knob" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="12" height="12">
          {dark ? (
            <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" fill="currentColor" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4.2" fill="currentColor" />
              <path
                d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </span>
    </button>
  )
}
