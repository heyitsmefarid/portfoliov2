import ScrambleText from './ScrambleText.jsx'
import './Panel.css'

// A bordered panel with a mono title — the building block of the page.
// `aside` sits at the right of the title row (a link, a status, etc.).
export default function Panel({ id, title, aside, className = '', children }) {
  return (
    <section id={id} className={`panel ${className}`} aria-labelledby={`${id}-title`} data-reveal>
      <header className="panel__head">
        <h2 id={`${id}-title`} className="panel__title">
          <ScrambleText text={title} />
        </h2>
        {aside && <div className="panel__aside">{aside}</div>}
      </header>
      {children}
    </section>
  )
}
