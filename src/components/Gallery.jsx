import { useEffect, useRef, useState } from 'react'
import './Gallery.css'

// Screenshot grid. A shot opens in a native <dialog> (focus trap, Esc to
// close, focus returns to the thumbnail); ← → step through, like the
// certificate viewer.
export default function Gallery({ items, title }) {
  const [active, setActive] = useState(null)
  const dialogRef = useRef(null)
  const item = active === null ? null : items[active]

  useEffect(() => {
    const dialog = dialogRef.current
    if (item && dialog && !dialog.open) dialog.showModal()
  }, [item])

  if (!items.length) return null
  const step = (delta) => setActive((index) => (index + delta + items.length) % items.length)
  const close = () => dialogRef.current?.close()

  return (
    <>
      <ul className="gallery">
        {items.map((shot, index) => (
          <li key={shot.src}>
            <button type="button" className="gallery__item" onClick={() => setActive(index)}>
              <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
              <span className="gallery__caption">{shot.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="gallery-viewer"
        aria-label={`${title} screenshots`}
        onClose={() => setActive(null)}
        onClick={(event) => event.target === dialogRef.current && close()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') step(-1)
          if (event.key === 'ArrowRight') step(1)
        }}
      >
        {item && (
          <>
            <img key={item.src} src={item.src} alt={item.alt} />
            <footer className="gallery-viewer__bar">
              <button type="button" onClick={() => step(-1)}>
                <span aria-hidden="true">←</span> Prev
              </button>
              <span aria-live="polite">
                {item.caption} · {active + 1} / {items.length}
              </span>
              <button type="button" onClick={() => step(1)}>
                Next <span aria-hidden="true">→</span>
              </button>
              <button type="button" onClick={close} aria-label="Close">
                ✕
              </button>
            </footer>
          </>
        )}
      </dialog>
    </>
  )
}
