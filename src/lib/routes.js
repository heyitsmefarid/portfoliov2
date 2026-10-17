// URL → page. Pure so it can be unit-tested with `npm test`.
//   /                  home
//   /projects          all projects
//   /projects/<id>     one project (id: lowercase letters, digits, dashes)
export function parseRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return { name: 'home' }
  if (path === '/projects') return { name: 'projects' }
  const match = /^\/projects\/([a-z0-9-]+)$/.exec(path)
  if (match) return { name: 'project', id: match[1] }
  return { name: 'notFound' }
}

// True when a click on `anchor` should be handled in-app instead of by the
// browser: plain left click, same origin, no target/download.
export function shouldHandleClick(event, anchor, currentOrigin) {
  if (event.defaultPrevented || event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  if (anchor.target || anchor.hasAttribute('download')) return false
  return anchor.origin === currentOrigin
}
