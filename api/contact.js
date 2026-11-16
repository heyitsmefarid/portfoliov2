// POST /api/contact — sends contact-form messages by email through Resend
// (https://resend.com, free tier).
//
// Environment (server-side only):
//   RESEND_API_KEY      required: your Resend API key
//   CONTACT_TO_EMAIL    optional: where messages arrive. Defaults to the email
//                       in src/data/profile.js.
//   CONTACT_FROM_EMAIL  optional: a sender on a domain you verified in Resend.
//                       Defaults to Resend's shared test sender, which can only
//                       deliver to the address you signed up to Resend with, so
//                       sign up with the same email as CONTACT_TO_EMAIL.
//
// Without the key the route answers 503 { error: "not_configured" } and the
// form says it isn't connected yet.

import { profile } from '../src/data/profile.js'
import { json, readJson, rateLimit, RequestError } from './_lib/http.js'

const DEFAULT_FROM = 'Portfolio contact form <onboarding@resend.dev>'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function settings() {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env
  return {
    key: RESEND_API_KEY,
    to: CONTACT_TO_EMAIL || profile.contact.email,
    from: CONTACT_FROM_EMAIL || DEFAULT_FROM,
  }
}

function isConfigured() {
  const { key, to } = settings()
  return Boolean(key && to)
}

// Lets the form know up front whether it can send (without revealing any settings).
export function GET() {
  return json({ configured: isConfigured() })
}

export async function POST(request) {
  if (!isConfigured()) {
    return json({ error: 'not_configured' }, 503)
  }

  if (!rateLimit(request, { key: 'contact', limit: 5, windowMs: 10 * 60_000 })) {
    return json({ error: 'rate_limited', message: 'Too many messages. Try again in a few minutes.' }, 429)
  }

  try {
    const body = await readJson(request)

    // Hidden "website" field: people never fill it in, bots usually do.
    if (clean(body.website, 200)) return json({ ok: true })

    const name = clean(body.name, 100)
    const email = clean(body.email, 200)
    const message = clean(body.message, 5_000)

    if (!name || !EMAIL_PATTERN.test(email) || message.length < 10) {
      throw new RequestError('Add your name, a valid email, and a message of at least 10 characters.')
    }

    const { key, to, from } = settings()
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `${message}\n\n— ${name} <${email}>\n\nSent from your portfolio's contact form. Reply to this email to answer ${name}.`,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      console.error('[api/contact] Resend responded', response.status, await response.text())
      return json({ error: 'send_failed' }, 502)
    }
    return json({ ok: true })
  } catch (error) {
    if (error instanceof RequestError) return json({ error: 'bad_request', message: error.message }, error.status)
    console.error('[api/contact] unexpected error', error)
    return json({ error: 'server_error' }, 500)
  }
}
