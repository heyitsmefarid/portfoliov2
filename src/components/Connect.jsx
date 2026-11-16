import { useState } from 'react'
import { profile } from '../data/profile.js'
import Panel from './Panel.jsx'

// A vCard built from the profile, so the stub can be saved straight to a
// phone's contacts.
function saveContact() {
  const { contact } = profile
  const parts = profile.name.split(' ')
  const family = parts.pop()
  // vCard address order: city; region; postal code; country
  const [city = '', region = '', country = ''] = profile.location.split(',').map((part) => part.trim())
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${family};${parts.join(' ')};;;`,
    `FN:${profile.name}`,
    `TITLE:${profile.role}`,
    contact.email && `EMAIL;TYPE=INTERNET:${contact.email}`,
    contact.phone && `TEL;TYPE=CELL:${contact.phoneIntl || contact.phone}`,
    contact.github && `URL:${contact.github}`,
    profile.location && `ADR;TYPE=HOME:;;;${city};${region};;${country}`,
    'END:VCARD',
  ].filter(Boolean)
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/vcard' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: `${profile.name.replace(/\s+/g, '-')}.vcf` })
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Scissors() {
  return (
    <svg className="stub__scissors" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.1 7.9 20 18M8.1 16.1 20 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

const strip = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

// Copies the address instead of relying on a mailto: link, which does nothing
// on devices without a mail app set up (most people use webmail).
function Email({ email }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <>
      <a className="link" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="connect__copy" onClick={copy} aria-live="polite">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </>
  )
}

function Line({ label, children }) {
  return (
    <div className="blank connect__line">
      <dt className="blank__label">{label}</dt>
      <dd className="blank__value">{children}</dd>
    </div>
  )
}

function External({ href }) {
  return (
    <a className="link" href={href} target="_blank" rel="noopener noreferrer">
      {strip(href)}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

export default function Connect({ onContact }) {
  const { contact } = profile

  return (
    <Panel id="contact" title="Contact stub" flush className="stub" aside={<span className="stack__key">detach and keep</span>}>
      <Scissors />
      <dl className="connect">
        {contact.email && (
          <Line label="Email">
            <Email email={contact.email} />
          </Line>
        )}
        {contact.phone && (
          <Line label="Mobile">
            <a className="link" href={`tel:${contact.phoneIntl || contact.phone}`}>
              {contact.phone}
            </a>
          </Line>
        )}
        <Line label="GitHub">
          <External href={contact.github} />
        </Line>
        {contact.linkedin && (
          <Line label="LinkedIn">
            <External href={contact.linkedin} />
          </Line>
        )}
        {contact.facebook && (
          <Line label="Facebook">
            <External href={contact.facebook} />
          </Line>
        )}
      </dl>
      <div className="connect__actions">
        <button type="button" className="btn btn--ink" onClick={onContact}>
          Write me a note
        </button>
        <button type="button" className="btn stub__save" onClick={saveContact}>
          Tear off: save me to your contacts
        </button>
      </div>
    </Panel>
  )
}
