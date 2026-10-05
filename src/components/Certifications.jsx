import { useEffect, useRef, useState } from 'react'
import { certifications } from '../data/certifications.js'
import Panel from './Panel.jsx'
import './Certifications.css'

// Certificates with an image open in a viewer on the page (no new tab).
const viewable = certifications.filter((cert) => cert.url)

const detailsOf = (cert) => [cert.kind, cert.issuer, cert.year].filter(Boolean).join(' · ')

function Seal() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 13.8 7 21l5-2.6 5 2.6-1.5-7.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// The native <dialog> handles focus trapping, Escape to close, and returning
// focus to the certificate that opened it.
function CertificateViewer({ active, onClose, onStep }) {
  const dialogRef = useRef(null)
  const cert = active === null ? null : viewable[active]

  useEffect(() => {
    const dialog = dialogRef.current
    if (cert && dialog && !dialog.open) dialog.showModal()
  }, [cert])

  const close = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      className="cert-viewer"
      aria-labelledby="cert-viewer-title"
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && close()}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') onStep(-1)
        if (event.key === 'ArrowRight') onStep(1)
      }}
    >
      {cert && (
        <>
          <header className="cert-viewer__head">
            <div>
              <h2 id="cert-viewer-title" className="cert-viewer__title">
                {cert.name}
              </h2>
              <p className="cert-viewer__meta">{detailsOf(cert)}</p>
            </div>
            <button type="button" className="cert-viewer__close" onClick={close} aria-label="Close">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="cert-viewer__stage">
            <img key={cert.url} src={cert.url} alt={`${cert.name} certificate`} />
          </div>

          {viewable.length > 1 && (
            <footer className="cert-viewer__nav">
              <button type="button" className="cert-viewer__step" onClick={() => onStep(-1)}>
                <span aria-hidden="true">←</span> Prev
              </button>
              <span aria-live="polite">
                {active + 1} / {viewable.length}
              </span>
              <button type="button" className="cert-viewer__step" onClick={() => onStep(1)}>
                Next <span aria-hidden="true">→</span>
              </button>
            </footer>
          )}
        </>
      )}
    </dialog>
  )
}

export default function Certifications() {
  const [active, setActive] = useState(null)
  const step = (delta) => setActive((index) => (index + delta + viewable.length) % viewable.length)

  return (
    <Panel id="certifications" title="Certifications">
      <ul className="certs">
        {certifications.map((cert, index) => {
          const body = (
            <>
              <span className="cert__seal">
                <Seal />
              </span>
              <span className="cert__body">
                <span className="cert__name">{cert.name}</span>
                <span className="cert__kind">{detailsOf(cert)}</span>
              </span>
            </>
          )
          return (
            <li key={cert.id} className="stagger" style={{ '--i': index * 2 }}>
              {cert.url ? (
                <button type="button" className="cert cert--link" onClick={() => setActive(viewable.indexOf(cert))}>
                  {body}
                  <span className="cert__open">
                    <ExpandIcon />
                  </span>
                  <span className="visually-hidden"> — view certificate</span>
                </button>
              ) : (
                <div className="cert">{body}</div>
              )}
            </li>
          )
        })}
      </ul>

      <CertificateViewer active={active} onClose={() => setActive(null)} onStep={step} />
    </Panel>
  )
}
