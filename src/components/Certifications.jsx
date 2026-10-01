import { certifications } from '../data/certifications.js'
import Panel from './Panel.jsx'
import './Certifications.css'

function Seal() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="12" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 13.8 7 21l5-2.6 5 2.6-1.5-7.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export default function Certifications() {
  return (
    <Panel id="certifications" title="Certifications">
      <ul className="certs">
        {certifications.map((cert, index) => {
          const details = [cert.kind, cert.issuer, cert.year].filter(Boolean).join(' · ')
          const body = (
            <>
              <span className="cert__seal">
                <Seal />
              </span>
              <span className="cert__body">
                <span className="cert__name">{cert.name}</span>
                <span className="cert__kind">{details}</span>
              </span>
            </>
          )
          return (
            <li key={cert.id} className="stagger" style={{ '--i': index * 2 }}>
              {cert.url ? (
                <a className="cert cert--link" href={cert.url} target="_blank" rel="noopener noreferrer">
                  {body}
                  <span className="cert__open" aria-hidden="true">
                    ↗
                  </span>
                  <span className="visually-hidden"> — view certificate (opens in a new tab)</span>
                </a>
              ) : (
                <div className="cert">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
