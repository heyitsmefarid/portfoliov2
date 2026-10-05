import { useEffect, useState } from 'react'

// "1,234 portfolio visits" in the hero, from /api/views. Each browser counts
// once a day; after that the page only reads the total. Renders nothing until
// the count arrives, or at all when the counter isn't set up.
const COUNTED_KEY = 'visit-counted-on'

function shouldCount() {
  const today = new Date().toISOString().slice(0, 10)
  try {
    if (localStorage.getItem(COUNTED_KEY) === today) return false
    localStorage.setItem(COUNTED_KEY, today)
    return true
  } catch {
    // Storage blocked — read the total without counting, so refreshes can't inflate it.
    return false
  }
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  )
}

export default function ViewCount() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/views', { method: shouldCount() ? 'POST' : 'GET', signal: AbortSignal.timeout(8_000) })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.count === 'number' && data.count > 0) setCount(data.count)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!count) return null

  return (
    <li className="view-count">
      <EyeIcon />
      {count.toLocaleString('en-US')} portfolio {count === 1 ? 'visit' : 'visits'}
    </li>
  )
}
