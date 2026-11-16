// One boxed cell of the form: a printed title bar and the area under it.
// `area` names its place in the page's grid (see styles/layout.css); `aside`
// sits at the right end of the title bar; `flush` drops the inner padding for
// content that runs edge to edge (tables, the photo).
export default function Panel({ id, title, aside, area, flush = false, className = '', children }) {
  return (
    <section id={id} className={`cell cell--${area ?? id} ${className}`} aria-labelledby={`${id}-title`}>
      <div className="cell__title">
        <h2 id={`${id}-title`}>{title}</h2>
        {aside}
      </div>
      <div className={flush ? 'cell__flush' : 'cell__body'}>{children}</div>
    </section>
  )
}
