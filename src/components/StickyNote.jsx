import { useRef, useState } from 'react'
import './StickyNote.css'

const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

// A sticky note left on the form. Drag it anywhere; peel it off with the
// corner button (it stays off for the rest of the visit).
export default function StickyNote() {
  const [gone, setGone] = useState(() => {
    try {
      return sessionStorage.getItem('note-peeled') === '1'
    } catch {
      return false
    }
  })
  const noteRef = useRef(null)
  const drag = useRef(null)
  const offset = useRef({ x: 0, y: 0 })

  if (gone) return null

  const onPointerDown = (event) => {
    if (event.target.closest('button')) return
    drag.current = { x: event.clientX - offset.current.x, y: event.clientY - offset.current.y }
    noteRef.current.setPointerCapture(event.pointerId)
    noteRef.current.dataset.dragging = 'true'
  }
  const onPointerMove = (event) => {
    if (!drag.current) return
    offset.current = { x: event.clientX - drag.current.x, y: event.clientY - drag.current.y }
    noteRef.current.style.translate = `${offset.current.x}px ${offset.current.y}px`
  }
  const onPointerUp = () => {
    drag.current = null
    if (noteRef.current) noteRef.current.dataset.dragging = 'false'
  }

  const peel = () => {
    try {
      sessionStorage.setItem('note-peeled', '1')
    } catch {
      // Storage blocked: it will be back on the next page load.
    }
    setGone(true)
  }

  return (
    <aside
      ref={noteRef}
      className="sticky"
      aria-label="Tip"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <p>
        In a hurry? Press <kbd>{IS_MAC ? '⌘K' : 'Ctrl K'}</kbd> to jump anywhere, or ask the assistant about my work.
      </p>
      <p className="sticky__sub">(You can drag this note.)</p>
      <button type="button" className="sticky__peel" onClick={peel} aria-label="Remove this note">
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </button>
    </aside>
  )
}
