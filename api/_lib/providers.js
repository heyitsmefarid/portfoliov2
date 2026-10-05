// AI providers for the portfolio assistant. Pick one with AI_PROVIDER:
// "anthropic" (default) or "gemini". To add another provider, add a function
// with the same shape — ({ apiKey, model, system, messages }) => Promise<string>
// — to `providers`.

import Anthropic from '@anthropic-ai/sdk'

export class ProviderError extends Error {
  constructor(message, code, status = 502) {
    super(message)
    this.code = code
    this.status = status
  }
}

const REFUSAL_REPLY =
  "I can only help with questions about Fred's portfolio — his projects, skills, education, experience, and how to contact him."

// Models that accept the server-side refusal fallback / the effort setting.
const SUPPORTS_FALLBACKS = /^claude-(opus-5|fable-5)/
const SUPPORTS_EFFORT = /^claude-(opus-(4-[5-9]|5)|sonnet-(4-[6-9]|5)|fable-|mythos-)/

async function anthropic({ apiKey, model, effort, system, messages }) {
  const client = new Anthropic({ apiKey, timeout: 30_000, maxRetries: 1 })

  const params = {
    model,
    max_tokens: 4096,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages,
  }
  if (effort && SUPPORTS_EFFORT.test(model)) params.output_config = { effort }

  let response
  try {
    response = SUPPORTS_FALLBACKS.test(model)
      ? await client.beta.messages.create({
          ...params,
          // If a safety classifier declines, retry on Anthropic's recommended fallback model.
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        })
      : await client.messages.create(params)
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      throw new ProviderError('The AI provider rejected the API key.', 'provider_auth', 503)
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new ProviderError('The AI provider is rate limiting requests.', 'provider_busy', 429)
    }
    if (error instanceof Anthropic.BadRequestError) {
      throw new ProviderError(`The AI provider rejected the request: ${error.message}`, 'provider_request', 502)
    }
    if (error instanceof Anthropic.APIError) {
      throw new ProviderError(`The AI provider failed (${error.status ?? 'network'}).`, 'provider_error', 502)
    }
    throw error
  }

  if (response.stop_reason === 'refusal') return REFUSAL_REPLY

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim()

  if (!text) throw new ProviderError('The AI provider returned an empty answer.', 'provider_empty', 502)
  return text
}

// Google Gemini through the plain REST API (no SDK). Get a free key at
// https://aistudio.google.com/apikey. AI_EFFORT isn't used here — each model
// keeps its default amount of thinking.
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const GEMINI_BLOCKED = new Set(['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION'])

async function gemini({ apiKey, model, system, messages }) {
  let response
  try {
    response = await fetch(`${GEMINI_URL}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: 4096 },
      }),
      signal: AbortSignal.timeout(30_000),
    })
  } catch {
    throw new ProviderError('The AI provider failed (network).', 'provider_error', 502)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error?.message || `HTTP ${response.status}`
    const badKey = data?.error?.details?.some((detail) => /API_KEY/.test(detail?.reason ?? ''))
    if (response.status === 401 || response.status === 403 || badKey) {
      throw new ProviderError('The AI provider rejected the API key.', 'provider_auth', 503)
    }
    if (response.status === 429) {
      throw new ProviderError('The AI provider is rate limiting requests.', 'provider_busy', 429)
    }
    if (response.status === 400 || response.status === 404) {
      throw new ProviderError(`The AI provider rejected the request: ${message}`, 'provider_request', 502)
    }
    throw new ProviderError(`The AI provider failed (${response.status}).`, 'provider_error', 502)
  }

  const candidate = data?.candidates?.[0]
  if (data?.promptFeedback?.blockReason || GEMINI_BLOCKED.has(candidate?.finishReason)) return REFUSAL_REPLY

  const text = (candidate?.content?.parts ?? [])
    .filter((part) => typeof part.text === 'string' && !part.thought)
    .map((part) => part.text)
    .join('')
    .trim()

  if (!text) throw new ProviderError('The AI provider returned an empty answer.', 'provider_empty', 502)
  return text
}

export const providers = { anthropic, gemini }

export const DEFAULT_MODELS = { anthropic: 'claude-opus-5', gemini: 'gemini-3.5-flash-lite' }
