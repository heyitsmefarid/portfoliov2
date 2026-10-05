import { useEffect, useRef, useState } from 'react'
import './Portrait.css'

// Hero portrait with a hidden video. Hovering (mouse) or tapping / pressing
// Enter (touch, keyboard) sweeps three slanted layers across the photo from the
// bottom-right corner — an amber blade, a dark blade, then the video — and the
// video plays. Leaving slides them back out. The video only downloads the first
// time it is opened.
export default function Portrait({ photo, video }) {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const lastPointer = useRef('')

  const show = () => {
    setLoaded(true)
    setOpen(true)
  }
  const hide = () => setOpen(false)

  // Play from the start when opened and drive the progress bar; pause once the
  // layers have slid back out.
  useEffect(() => {
    const element = videoRef.current
    const root = rootRef.current
    if (!element || !root || !loaded) return

    if (!open) {
      const timer = setTimeout(() => element.pause(), 800)
      return () => clearTimeout(timer)
    }

    element.currentTime = 0
    element.play().catch(() => {})
    let frame = 0
    const tick = () => {
      const progress = element.duration ? element.currentTime / element.duration : 0
      root.style.setProperty('--video-progress', progress.toFixed(4))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [open, loaded])

  if (!video) {
    return (
      <figure className="portrait">
        <span className="portrait__stage">
          <img className="portrait__photo" src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} fetchPriority="high" />
        </span>
        <span className="portrait__corner portrait__corner--tl" aria-hidden="true" />
        <span className="portrait__corner portrait__corner--br" aria-hidden="true" />
      </figure>
    )
  }

  return (
    <button
      ref={rootRef}
      type="button"
      className="portrait"
      data-open={open}
      aria-pressed={open}
      aria-label={`${photo.alt}. ${open ? 'Hide the video' : 'Play a short video'}`}
      onPointerDown={(event) => {
        lastPointer.current = event.pointerType
      }}
      onPointerEnter={(event) => event.pointerType === 'mouse' && show()}
      onPointerLeave={(event) => event.pointerType === 'mouse' && hide()}
      onClick={() => {
        // Mouse users already opened it by hovering; taps and Enter toggle.
        if (lastPointer.current === 'mouse') {
          lastPointer.current = ''
          return
        }
        if (open) hide()
        else show()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) hide()
      }}
    >
      <span className="portrait__stage">
        <img className="portrait__photo" src={photo.src} alt="" width={photo.width} height={photo.height} fetchPriority="high" />

        <span className="portrait__blade portrait__blade--amber" aria-hidden="true" />
        <span className="portrait__blade portrait__blade--ink" aria-hidden="true" />
        <span className="portrait__blade portrait__blade--video" aria-hidden="true">
          <video
            ref={videoRef}
            className="portrait__video"
            src={loaded ? video.src : undefined}
            poster={video.poster}
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
          />
          <span className="portrait__progress" />
        </span>

        <span className="portrait__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="10" height="10">
            <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
          </svg>
        </span>
      </span>
      <span className="portrait__corner portrait__corner--tl" aria-hidden="true" />
      <span className="portrait__corner portrait__corner--br" aria-hidden="true" />
    </button>
  )
}
