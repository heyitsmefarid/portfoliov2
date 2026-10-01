// POST /api/contact — sends contact-form messages by email through Resend
// (https://resend.com, free tier).
//
// Environment (server-side only):
//   RESEND_API_KEY      your Resend API key
//   CONTACT_TO_EMAIL    where messages should arrive (your inbox)
//   CONTACT_FROM_EMAIL  a sender on a domain verified in Resend,
//                       e.g. "Portfolio <portfolio@yourdomain.com>"
//
// Without them the route answers 503 { error: "not_configured" } and the form
// offers to open the visitor's email app instead (when an email is set in
// src/data/profile.js).

import { json, readJson, rateLimit, RequestError } from './_lib/http.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function isConfigured() {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env
  return Boolean(RESEND_API_KEY && CONTACT_TO_EMAIL && CONTACT_FROM_EMAIL)
}

// Lets the form know up front whether it can send (without revealing any settings).
export function GET() {
  return json({ configured: isConfigured() })
}

export async function POST(request) {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env
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

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `${message}\n\n— ${name} <${email}>`,
      }),
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
