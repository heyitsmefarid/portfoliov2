import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { profile } from '../data/profile.js'
import './ContactDialog.css'

const EMPTY = { name: '', email: '', message: '', website: '' }

function mailtoLink({ name, email, message }) {
  const subject = encodeURIComponent(`Portfolio message from ${name}`)
  const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`)
  return `mailto:${profile.contact.email}?subject=${subject}&body=${body}`
}

// How the form can deliver a message: through /api/contact, by opening the
// visitor's email app (needs an email in profile.js), or not at all yet.
function useDelivery() {
  const [delivery, setDelivery] = useState('checking')

  useEffect(() => {
    let cancelled = false
    const offline = profile.contact.email ? 'mailto' : 'none'
    fetch('/api/contact', { signal: AbortSignal.timeout(8_000) })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => !cancelled && setDelivery(data?.configured ? 'api' : offline))
      .catch(() => !cancelled && setDelivery(offline))
    return () => {
      cancelled = true
    }
  }, [])

  return delivery
}

// The contact form in a modal dialog. The native <dialog> element handles
// focus trapping, Escape to close, and returning focus to the opener.
export default function ContactDialog({ ref }) {
  const dialogRef = useRef(null)
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const delivery = useDelivery()
  const { contact } = profile

  useImperativeHandle(ref, () => ({
    open() {
      dialogRef.current?.showModal()
    },
  }))

  const close = () => dialogRef.current?.close()
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const openEmailApp = () => {
    window.location.href = mailtoLink(form)
    setStatus({
      state: 'fallback',
      message: `Your email app should open with the message ready. If it doesn't, email ${contact.email} directly.`,
    })
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (status.state === 'sending' || delivery === 'none') return
    if (delivery === 'mailto') {
      openEmailApp()
      return
    }
    setStatus({ state: 'sending', message: 'Sending…' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(15_000),
      })
      const data = await response.json().catch(() => null)

      if (response.ok && data?.ok) {
        setForm(EMPTY)
        setStatus({ state: 'sent', message: 'Message sent. Fred will reply to you by email.' })
        return
      }
      if (response.status === 400 || response.status === 429) {
        setStatus({ state: 'error', message: data?.message ?? 'Check the form and try again.' })
        return
      }
      // Not configured, missing (static hosting) or failing: fall through.
    } catch {
      // Network error: fall through.
    }

    if (contact.email) {
      openEmailApp()
    } else {
      setStatus({ state: 'error', message: "The form couldn't send your message. Try again later, or reach Fred on GitHub." })
    }
  }

  const unavailable = delivery === 'none'

  return (
    <dialog
      ref={dialogRef}
      className="contact-dialog slip"
      aria-labelledby="contact-dialog-title"
      onClick={(event) => event.target === dialogRef.current && close()}
    >
      <form className="contact-dialog__form" onSubmit={onSubmit}>
        <header className="contact-dialog__head">
          <div>
            <h2 id="contact-dialog-title" className="contact-dialog__title">
              Send a message
            </h2>
            <p className="contact-dialog__lead">Have a project, opportunity, or just want to talk?</p>
          </div>
          <button type="button" className="contact-dialog__close" onClick={close} aria-label="Close">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {unavailable && (
          <p className="contact-dialog__notice">
            The contact form isn't connected yet. Until it is, the quickest way to reach Fred is on{' '}
            <a href={contact.github} target="_blank" rel="noopener noreferrer">
              GitHub
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            .
          </p>
        )}

        <div className="field">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={update('name')} />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={200} value={form.email} onChange={update('email')} />
        </div>
        <div className="field">
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows={5} required minLength={10} maxLength={5000} value={form.message} onChange={update('message')} />
        </div>

        {/* Spam trap: hidden from people, often filled in by bots. */}
        <div className="contact-dialog__trap" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={update('website')} />
        </div>

        <div className="contact-dialog__submit">
          <button className="btn btn--ink" type="submit" disabled={status.state === 'sending' || unavailable}>
            {status.state === 'sending' ? 'Sending…' : delivery === 'mailto' ? 'Send via email app' : 'Send message'}
          </button>
          <p className={`contact-dialog__status contact-dialog__status--${status.state}`} role="status">
            {status.state !== 'sending' && status.message}
          </p>
        </div>
      </form>
    </dialog>
  )
}
