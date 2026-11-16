// /api/views — the portfolio visit counter shown in the footer.
//   GET  returns the total: { count }
//   POST counts one visit and returns the new total (the page posts at most
//        once per browser per day; bots and bursts only read the total)
//
// Environment (added automatically when Upstash for Redis is connected to the
// project in Vercel → Storage):
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
//   (or the older KV_REST_API_URL / KV_REST_API_TOKEN names)
//
// Without them the route answers 503 { error: "not_configured" } and the footer
// leaves the count out.

import { json, rateLimit } from './_lib/http.js'

const KEY = 'portfolio:visits'
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor/i

function storeConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  return url && token ? { url, token } : null
}

// One Redis command over Upstash's REST API, e.g. ['INCR', 'key'].
async function redis({ url, token }, command) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(5_000),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || data?.error) throw new Error(data?.error || `HTTP ${response.status}`)
  return Number(data.result) || 0
}

async function respond(command) {
  const config = storeConfig()
  if (!config) return json({ error: 'not_configured' }, 503)

  try {
    return json({ count: await redis(config, command) }, 200, { 'Cache-Control': 'no-store' })
  } catch (error) {
    console.error(`[api/views] ${error.message}`)
    return json({ error: 'store_error' }, 502)
  }
}

export function GET() {
  return respond(['GET', KEY])
}

export function POST(request) {
  const human = !BOT.test(request.headers.get('user-agent') ?? '')
  const counts = human && rateLimit(request, { key: 'views', limit: 10, windowMs: 60_000 })
  return respond(counts ? ['INCR', KEY] : ['GET', KEY])
}
