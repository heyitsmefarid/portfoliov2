// Finds portfolio paths ("/projects", "/projects/<id>") in assistant text so
// they can render as in-app links. Paths inside full URLs are left alone.
const INTERNAL = /(^|[\s(])(\/projects(?:\/[a-z0-9-]+)?)(?=$|[\s).,;:!?])/g

// 'See /projects/x.' → ['See ', { path: '/projects/x' }, '.']
export function splitInternalLinks(text) {
  const parts = []
  let last = 0
  for (const match of text.matchAll(INTERNAL)) {
    const start = match.index + match[1].length
    if (start > last) parts.push(text.slice(last, start))
    parts.push({ path: match[2] })
    last = start + match[2].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
