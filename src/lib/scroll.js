import { prefersReducedMotion } from '../hooks/useReducedMotion.js'

// Scrolls to a section or card and moves keyboard focus to its heading, so
// keyboard and screen reader users land in the same place they see.
export function scrollToId(id) {
  const element = document.getElementById(id)
  if (!element) return
  element.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  const target = element.querySelector('h1, h2, h3') ?? element
  target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}
