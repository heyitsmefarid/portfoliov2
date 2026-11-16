import { useEffect, useState } from 'react'

// The portfolio's visit count in the footer, from /api/views.
// Each browser counts once a day; after that the page only reads the total.
// Renders nothing until the count arrives, or at all when the counter isn't
// set up.
const COUNTED_KEY = 'visit-counted-on'

function shouldCount() {
  const today = new Date().toISOString().slice(0, 10)
  try {
    if (localStorage.getItem(COUNTED_KEY) === today) return false
    localStorage.setItem(COUNTED_KEY, today)
    return true
  } catch {
    // Storage blocked: read the total without counting, so refreshes can't inflate it.
    return false
  }
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

  // Printed like a control number: zero-padded.
  return (
    <p className="control" title={`${count.toLocaleString('en-US')} portfolio ${count === 1 ? 'visit' : 'visits'}`}>
      <span className="control__label">Visitor no.</span>
      <span className="control__no">{String(count).padStart(6, '0')}</span>
    </p>
  )
}
