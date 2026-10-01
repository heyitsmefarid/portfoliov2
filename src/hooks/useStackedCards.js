import { useEffect } from 'react'
import { prefersReducedMotion } from './useReducedMotion.js'

// Drives the stacked project cards: while a card is stuck and the next one
// slides over it, sets --covered (0 → 1) on the card so CSS can tilt, shrink
// and dim it. Only runs on wide screens and while the list is on screen.
export function useStackedCards(listRef) {
  useEffect(() => {
    const list = listRef.current
    if (!list || prefersReducedMotion()) return

    const wide = window.matchMedia('(min-width: 900px)')
    const cards = [...list.children]
    let frame = 0
    let visible = false

    const update = () => {
      frame = 0
      if (!wide.matches) {
        cards.forEach((card) => card.style.removeProperty('--covered'))
        return
      }
      for (let i = 0; i < cards.length - 1; i += 1) {
        const current = cards[i].getBoundingClientRect()
        const next = cards[i + 1].getBoundingClientRect()
        const covered = Math.min(Math.max((current.bottom - next.top) / current.height, 0), 1)
        cards[i].style.setProperty('--covered', covered.toFixed(3))
      }
    }

    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      schedule()
    })
    observer.observe(list)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    wide.addEventListener('change', schedule)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      wide.removeEventListener('change', schedule)
    }
  }, [listRef])
}
