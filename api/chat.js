// POST /api/chat — the portfolio assistant.
//
// Environment (server-side only, never exposed to the browser):
//   AI_API_KEY   required — your provider API key
//   AI_PROVIDER  optional — "anthropic" (default)
//   AI_MODEL     optional — defaults to the provider's model in DEFAULT_MODELS
//   AI_EFFORT    optional — "low" (default) | "medium" | "high"
//
// With no AI_API_KEY the route answers 503 { error: "not_configured" } and the
// chat widget switches to its offline answers.

import { json, readJson, rateLimit, RequestError } from './_lib/http.js'
import { providers, DEFAULT_MODELS, ProviderError } from './_lib/providers.js'
import { buildPortfolioContext, SYSTEM_PROMPT } from '../src/lib/knowledge.js'

const MAX_MESSAGES = 12
const MAX_CHARS = 1_000

const system = `${SYSTEM_PROMPT}\n\n<portfolio>\n${buildPortfolioContext()}\n</portfolio>`

function cleanMessages(input) {
  if (!Array.isArray(input?.messages)) throw new RequestError('Expected a "messages" array.')

  const messages = input.messages
    .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .filter((m) => m.content)
    .slice(-MAX_MESSAGES)

  // The conversation must start with the visitor and end with their question.
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (!messages.length || messages.at(-1).role !== 'user') {
    throw new RequestError('The last message must be a question from the visitor.')
  }
  return messages
}

function providerConfig() {
  const name = (process.env.AI_PROVIDER || 'anthropic').toLowerCase()
  return { name, apiKey: process.env.AI_API_KEY, provider: providers[name] }
}

// Lets the chat widget know up front whether AI answers are available.
export function GET() {
  const { apiKey, provider } = providerConfig()
  return json({ configured: Boolean(apiKey && provider) })
}

export async function POST(request) {
  const { name: providerName, apiKey, provider } = providerConfig()

  if (!apiKey || !provider) {
    return json({ error: 'not_configured' }, 503)
  }

  if (!rateLimit(request, { key: 'chat', limit: 20, windowMs: 60_000 })) {
    return json({ error: 'rate_limited', message: 'Too many questions at once. Try again in a minute.' }, 429)
  }

  try {
    const messages = cleanMessages(await readJson(request))
    const reply = await provider({
      apiKey,
      model: process.env.AI_MODEL || DEFAULT_MODELS[providerName],
      effort: process.env.AI_EFFORT || 'low',
      system,
      messages,
    })
    return json({ reply, mode: 'ai' })
  } catch (error) {
    if (error instanceof RequestError) return json({ error: 'bad_request', message: error.message }, error.status)
    if (error instanceof ProviderError) {
      console.error(`[api/chat] ${error.code}: ${error.message}`)
      return json({ error: error.code }, error.status)
    }
    console.error('[api/chat] unexpected error', error)
    return json({ error: 'server_error' }, 500)
  }
}
