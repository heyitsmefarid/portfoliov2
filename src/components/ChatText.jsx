import { splitInternalLinks } from '../lib/chatLinks.js'
import Link from './Link.jsx'

// Renders assistant replies safely (no HTML injection): paragraphs, "- " bullet
// lists, **bold**, plain URLs turned into links, and portfolio paths such as
// /projects/studyspace turned into in-app links.

const TOKEN = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]+)/g

function Plain({ text, onLinkClick }) {
  return splitInternalLinks(text).map((part, index) =>
    typeof part === 'string' ? (
      part
    ) : (
      <Link key={index} href={part.path} onClick={onLinkClick}>
        {part.path}
      </Link>
    ),
  )
}

function Inline({ text, onLinkClick }) {
  return text.split(TOKEN).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    if (/^https?:\/\//.test(part)) {
      const trailing = part.match(/[.,;:!?]+$/)?.[0] ?? ''
      const url = trailing ? part.slice(0, -trailing.length) : part
      return (
        <span key={index}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url.replace(/^https?:\/\//, '')}
          </a>
          {trailing}
        </span>
      )
    }
    return <Plain key={index} text={part} onLinkClick={onLinkClick} />
  })
}

// onLinkClick runs when a portfolio link is followed (the chat closes itself on phones).
export default function ChatText({ text, onLinkClick }) {
  const blocks = text.trim().split(/\n{2,}/)

  return blocks.map((block, index) => {
    const lines = block.split('\n')
    if (lines.every((line) => /^\s*[-•*]\s+/.test(line))) {
      return (
        <ul key={index}>
          {lines.map((line, i) => (
            <li key={i}>
              <Inline text={line.replace(/^\s*[-•*]\s+/, '')} onLinkClick={onLinkClick} />
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={index}>
        {lines.map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            <Inline text={line} onLinkClick={onLinkClick} />
          </span>
        ))}
      </p>
    )
  })
}
