import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { GET, POST } from '../api/contact.js'
import { profile } from '../src/data/profile.js'

const realFetch = globalThis.fetch
let sent
let ip = 0

beforeEach(() => {
  sent = []
  delete process.env.RESEND_API_KEY
  delete process.env.CONTACT_TO_EMAIL
  delete process.env.CONTACT_FROM_EMAIL
  globalThis.fetch = async (url, init) => {
    sent.push({ url, init, body: JSON.parse(init.body) })
    return new Response(JSON.stringify({ id: 'x' }), { status: 200 })
  }
})

afterEach(() => {
  globalThis.fetch = realFetch
})

// A fresh client address per request, so the rate limit never kicks in.
const post = (body) =>
  POST(
    new Request('http://x.dev/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${++ip}` },
      body: JSON.stringify(body),
    }),
  )

const valid = { name: 'Ana', email: 'ana@example.com', message: 'Hello, I have a project for you.' }

test('is not configured without a Resend key', async () => {
  assert.deepEqual(await GET().json(), { configured: false })
  assert.equal((await post(valid)).status, 503)
  assert.equal(sent.length, 0)
})

test('the key alone is enough: sends to the profile email from the Resend test sender', async () => {
  process.env.RESEND_API_KEY = 're_test'
  assert.deepEqual(await GET().json(), { configured: true })

  const response = await post(valid)
  assert.equal(response.status, 200)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].url, 'https://api.resend.com/emails')
  assert.equal(sent[0].init.headers.Authorization, 'Bearer re_test')
  assert.deepEqual(sent[0].body.to, [profile.contact.email])
  assert.match(sent[0].body.from, /onboarding@resend\.dev/)
  assert.equal(sent[0].body.reply_to, 'ana@example.com')
  assert.match(sent[0].body.text, /Hello, I have a project/)
})

test('rejects incomplete messages without sending', async () => {
  process.env.RESEND_API_KEY = 're_test'
  const response = await post({ ...valid, message: 'hi' })
  assert.equal(response.status, 400)
  assert.equal(sent.length, 0)
})

test('silently drops messages that fill the spam trap', async () => {
  process.env.RESEND_API_KEY = 're_test'
  const response = await post({ ...valid, website: 'spam.example' })
  assert.equal(response.status, 200)
  assert.equal(sent.length, 0)
})

test('reports a failed send', async () => {
  process.env.RESEND_API_KEY = 're_test'
  globalThis.fetch = async () => new Response('nope', { status: 403 })
  const original = console.error
  console.error = () => {}
  try {
    assert.equal((await post(valid)).status, 502)
  } finally {
    console.error = original
  }
})
