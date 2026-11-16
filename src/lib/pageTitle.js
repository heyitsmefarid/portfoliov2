import { useEffect } from 'react'

export const SITE_TITLE = 'Fred Anthony Gallano — Full-Stack Developer'

// Sets document.title for the current page; no argument = the site title.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Fred Anthony Gallano` : SITE_TITLE
  }, [title])
}
