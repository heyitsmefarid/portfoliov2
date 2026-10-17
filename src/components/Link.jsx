import { navigate } from '../lib/router.js'
import { shouldHandleClick } from '../lib/routes.js'

// An <a> that changes pages without a reload. Ctrl/Cmd/middle clicks, target
// and download links, and other sites are left to the browser.
export default function Link({ href, onClick, ...props }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (!shouldHandleClick(event, event.currentTarget, window.location.origin)) return
        event.preventDefault()
        navigate(href)
      }}
      {...props}
    />
  )
}
