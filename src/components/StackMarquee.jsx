import { skillGroups } from '../data/skills.js'
import './StackMarquee.css'

// Two tilted ribbons of Fred's stack crossing each other and scrolling in
// opposite directions. Decorative — the stack is listed in its own panel.
const MAIN = skillGroups.filter((g) => g.tier === 'primary').flatMap((g) => g.items.map((i) => i.name))
const REST = skillGroups.filter((g) => g.tier !== 'primary').flatMap((g) => g.items.map((i) => i.name))

function Track({ words }) {
  // Two identical halves so the loop is seamless at -50%; each half repeats
  // the list so it is always wider than the screen.
  const half = [...words, ...words].flatMap((word) => [word, '✦'])
  return (
    <div className="marquee__track">
      {[...half, ...half].map((text, index) => (
        <span key={index} className={text === '✦' ? 'marquee__star' : 'marquee__word'}>
          {text}
        </span>
      ))}
    </div>
  )
}

export default function StackMarquee() {
  return (
    <div className="marquee" aria-hidden="true" data-cursor="Paused">
      <div className="marquee__band marquee__band--back">
        <Track words={REST} />
      </div>
      <div className="marquee__band marquee__band--front">
        <Track words={MAIN} />
      </div>
    </div>
  )
}
