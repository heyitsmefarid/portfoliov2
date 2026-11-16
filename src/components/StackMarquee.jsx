import { skillGroups } from '../data/skills.js'
import './StackMarquee.css'

// A ticker strip across the form: the whole stack, scrolling slowly, like the
// repeated microprint line on security paper. Decorative; the stack has its
// own cell. Hovering pauses it.
const WORDS = skillGroups.flatMap((group) => group.items.map((item) => item.name))

export default function StackMarquee() {
  // Two identical halves so the loop is seamless at -50%.
  const half = [...WORDS, ...WORDS]
  return (
    <div className="cell cell--ticker marquee" aria-hidden="true" data-cursor="Paused">
      <div className="marquee__track">
        {[...half, ...half].map((word, index) => (
          <span key={index} className="marquee__word">
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}
