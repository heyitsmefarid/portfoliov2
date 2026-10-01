// Small helpers shared by the API routes. Files under api/_lib are not deployed
// as routes (Vercel skips paths starting with an underscore).

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

export async function readJson(request, maxBytes = 16_000) {
  const text = await request.text()
  if (text.length > maxBytes) throw new RequestError('Request body is too large.', 413)
  try {
    return JSON.parse(text)
  } catch {
    throw new RequestError('Request body must be JSON.', 400)
  }
}

export class RequestError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'local'
}

// Best-effort, per-instance rate limit. Serverless instances don't share memory,
// so this slows down abuse rather than stopping it outright.
const buckets = new Map()

export function rateLimit(request, { key, limit, windowMs }) {
  const id = `${key}:${clientIp(request)}`
  const now = Date.now()
  const bucket = buckets.get(id)

  if (!bucket || now - bucket.start > windowMs) {
    buckets.set(id, { start: now, count: 1 })
    if (buckets.size > 5_000) buckets.clear()
    return true
  }

  bucket.count += 1
  return bucket.count <= limit
}
