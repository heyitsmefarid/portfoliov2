import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { profile } from '../data/profile.js'
import './ContactDialog.css'

const EMPTY = { name: '', email: '', message: '', website: '' }

// Whether /api/contact can send mail: 'checking', 'api', or 'none' (no key set,
// or static hosting with no API). Messages are always sent from the site; the
// visitor's email app is never opened.
function useDelivery() {
  const [delivery, setDelivery] = useState('checking')

  useEffect(() => {
    let cancelled = false
    fetch('/api/contact', { signal: AbortSignal.timeout(8_000) })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => !cancelled && setDelivery(data?.configured ? 'api' : 'none'))
      .catch(() => !cancelled && setDelivery('none'))
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

  const onSubmit = async (event) => {
    event.preventDefault()
    if (status.state === 'sending' || delivery === 'none') return
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
        setStatus({ state: 'sent', message: `Message sent. Fred will reply to ${form.email}.` })
        setForm(EMPTY)
        return
      }
      if (response.status === 400 || response.status === 429) {
        setStatus({ state: 'error', message: data?.message ?? 'Check the form and try again.' })
        return
      }
    } catch {
      // Network error or timeout: handled below.
    }

    // The message stays in the form, so trying again doesn't mean retyping it.
    setStatus({
      state: 'error',
      message: contact.email
        ? `Your message didn't send. Try again in a minute, or write to ${contact.email}.`
        : "Your message didn't send. Try again in a minute.",
    })
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
            The contact form isn&apos;t connected yet.{' '}
            {contact.email ? (
              <>Until it is, write to Fred at {contact.email}.</>
            ) : (
              <>
                Until it is, reach Fred on{' '}
                <a href={contact.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                .
              </>
            )}
          </p>
        )}

        <div className="field">
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={update('name')} />
        </div>
        <div className="field">
          <label htmlFor="contact-email">Your email</label>
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
            {status.state === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          <p className={`contact-dialog__status contact-dialog__status--${status.state}`} role="status">
            {status.state !== 'sending' && status.message}
          </p>
        </div>
      </form>
    </dialog>
  )
}
