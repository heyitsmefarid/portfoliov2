import { useMemo, useSyncExternalStore } from 'react'
import { parseRoute } from './routes.js'
import { scrollToId } from './scroll.js'

// A minimal History-API router: the URL is the state. navigate() pushes a new
// entry and tells subscribers; back/forward arrive as popstate.
const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

const getPathname = () => window.location.pathname

export function usePathname() {
  return useSyncExternalStore(subscribe, getPathname, () => '/')
}

export function useRoute() {
  const pathname = usePathname()
  return useMemo(() => parseRoute(pathname), [pathname])
}

export function navigate(href) {
  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href)
    return
  }
  const samePath = url.pathname === window.location.pathname
  const target = url.pathname + url.search + url.hash
  if (target !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.pushState(null, '', target)
  }
  listeners.forEach((listener) => listener())
  // Let React render the new page first, then scroll.
  requestAnimationFrame(() => {
    if (url.hash) scrollToId(decodeURIComponent(url.hash.slice(1)))
    // 'instant': the page sets scroll-behavior: smooth, which would otherwise
    // animate up from wherever the previous page was scrolled.
    else if (!samePath) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  })
}
