import { icons } from '../lib/icons.js'

function monogram(name) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/)
  return words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2)
}

// Brand glyph for a technology, or a small monogram / API brace when there
// is no brand icon available. Always decorative — the name is shown beside it.
export default function TechIcon({ icon, name, size = 20 }) {
  const glyph = icons[icon]

  if (glyph) {
    return (
      <svg className="tech-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
        <path d={glyph.path} fill="currentColor" />
      </svg>
    )
  }

  return (
    <span className="tech-icon tech-icon--mono" style={{ width: size, height: size }} aria-hidden="true">
      {icon === 'api' ? '{}' : monogram(name)}
    </span>
  )
}
