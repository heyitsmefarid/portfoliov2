import { useEffect, useState } from 'react'

// Returns the id of the section currently under the upper part of the viewport.
// `ids` must be a stable array (define it outside the component).
export function useScrollSpy(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.35
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4

      let current = null
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element && element.getBoundingClientRect().top <= line) current = id
      }
      setActive(atBottom ? ids[ids.length - 1] : current)
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
  }, [ids])

  return active
}
