import { useEffect } from 'react'
import { prefersReducedMotion } from './useReducedMotion.js'

// Fades [data-reveal] elements in the first time they scroll into view.
// Skipped entirely for visitors who prefer reduced motion — content is visible
// by default and only hidden once this has run.
export function useRevealOnScroll() {
  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return

    const root = document.documentElement
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    )

    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((element) => {
      observer.observe(element)
    })
    root.classList.add('reveal-ready')

    return () => observer.disconnect()
  }, [])
}
