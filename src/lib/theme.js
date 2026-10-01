import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'

// The theme lives on <html data-theme="dark|light">. index.html sets it from
// localStorage before the first paint, so there is no flash of the wrong theme.

const STORAGE_KEY = 'theme'
const THEME_COLORS = { dark: '#080808', light: '#f5f4f1' }
const listeners = new Set()

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage blocked (private mode etc.) — the theme still applies for this visit.
  }
  listeners.forEach((listener) => listener())
}

// Switches theme. With an origin point (e.g. the toggle's centre) the new
// theme spreads out from there in a circle, where the browser supports it.
export function setTheme(theme, origin) {
  const update = () => flushSync(() => applyTheme(theme))

  if (!document.startViewTransition || prefersReducedMotion()) {
    update()
    return
  }

  const transition = document.startViewTransition(update)
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => {})
}

export function toggleTheme(origin) {
  setTheme(getTheme() === 'light' ? 'dark' : 'light', origin)
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => 'dark')
}
