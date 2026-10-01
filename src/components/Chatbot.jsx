import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { answerLocally } from '../lib/localAssistant.js'
import ChatText from './ChatText.jsx'
import './Chatbot.css'

const GREETING = {
  id: 'greeting',
  role: 'assistant',
  content: "Hi! I'm Fred's portfolio assistant.\n\nAsk me about his projects, skills, education, or experience.",
}

const SUGGESTIONS = [
  'What technologies does Fred use?',
  'Tell me about ISKONNECT.',
  'What projects has Fred built?',
  'What is Fred studying?',
  'How can I contact Fred?',
]

let messageId = 0
let availability = null

// Checked once per visit: is /api/chat there and does it have an AI key?
function aiAvailable() {
  availability ??= fetch('/api/chat', { signal: AbortSignal.timeout(8_000) })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => data?.configured === true)
    .catch(() => false)
  return availability
}

// Asks /api/chat; falls back to local answers from the portfolio data when the
// AI isn't configured, the route doesn't exist (static hosting), or a request fails.
async function getReply(history, question, modeRef) {
  if (modeRef.current !== 'local' && !(await aiAvailable())) modeRef.current = 'local'

  if (modeRef.current !== 'local') {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history
            .filter((message) => message.id !== GREETING.id)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: AbortSignal.timeout(40_000),
      })
      const data = await response.json().catch(() => null)

      if (response.ok && data?.reply) return { text: data.reply, mode: 'ai' }
      // Not configured or no API here: stay local for the rest of the visit.
      if (!data || response.status === 503 || response.status === 404 || response.status === 405) {
        modeRef.current = 'local'
      }
    } catch {
      // Network error or timeout — answer locally this time.
    }
  }
  return { text: answerLocally(question), mode: 'local' }
}

export default function Chatbot({ ref }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [mode, setMode] = useState('unknown')

  const messagesRef = useRef([GREETING])
  const pendingRef = useRef(false)
  const modeRef = useRef('unknown')
  const launcherRef = useRef(null)
  const inputRef = useRef(null)
  const logRef = useRef(null)

  const commit = (next) => {
    messagesRef.current = next
    setMessages(next)
  }

  const send = async (text, { refocus = false } = {}) => {
    const question = text.trim().slice(0, 500)
    if (!question || pendingRef.current) return
    // A clicked suggestion disappears once asked — keep focus in the panel.
    if (refocus) inputRef.current?.focus()

    pendingRef.current = true
    setPending(true)
    setInput('')
    const history = [...messagesRef.current, { id: messageId++, role: 'user', content: question }]
    commit(history)

    const reply = await getReply(history, question, modeRef)
    setMode(reply.mode)
    commit([...messagesRef.current, { id: messageId++, role: 'assistant', content: reply.text }])
    pendingRef.current = false
    setPending(false)
  }

  const close = () => {
    setOpen(false)
    launcherRef.current?.focus()
  }

  const reset = () => {
    commit([GREETING])
    inputRef.current?.focus()
  }

  // Other components (the hero terminal) can open the assistant and ask a question.
  useImperativeHandle(ref, () => ({
    ask(question) {
      setOpen(true)
      if (question) send(question)
    },
  }))

  // While open: focus the input, close on Escape from anywhere, and on phones
  // (full-screen panel) lock page scroll.
  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
    aiAvailable().then((available) => {
      if (!available) {
        modeRef.current = 'local'
        setMode('local')
      }
    })
    const small = window.matchMedia('(max-width: 640px)').matches
    if (small) document.body.style.overflow = 'hidden'

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        launcherRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      if (small) document.body.style.overflow = ''
    }
  }, [open])

  // Keep the latest message in view.
  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, pending])

  const showSuggestions = messages.length === 1 && !pending

  return (
    <div className="chat">
      <div
        id="chat-panel"
        className="chat__panel"
        role="dialog"
        aria-labelledby="chat-title"
        data-open={open}
        inert={!open}
      >
        <header className="chat__header">
          <div>
            <h2 id="chat-title" className="chat__title">
              Fred's portfolio assistant
            </h2>
            <p className="chat__mode">
              <span className={`chat__mode-dot chat__mode-dot--${mode}`} aria-hidden="true" />
              {mode === 'local' ? 'Offline mode: answers from portfolio data' : 'Answers only from portfolio info'}
            </p>
          </div>
          <div className="chat__actions">
            {messages.length > 1 && (
              <button type="button" className="chat__icon-btn" onClick={reset} aria-label="Start a new conversation" disabled={pending}>
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <button type="button" className="chat__icon-btn" onClick={close} aria-label="Close assistant">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        <div className="chat__log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation">
          {messages.map((message) => (
            <div key={message.id} className={`chat__msg chat__msg--${message.role}`}>
              <span className="visually-hidden">{message.role === 'user' ? 'You said:' : 'Assistant:'}</span>
              <ChatText text={message.content} />
            </div>
          ))}

          {pending && (
            <div className="chat__msg chat__msg--assistant chat__msg--pending">
              <span className="visually-hidden">Assistant is typing</span>
              <span className="chat__caret" aria-hidden="true" />
            </div>
          )}

          {showSuggestions && (
            <div className="chat__suggestions">
              <p className="chat__suggestions-label">Try asking</p>
              <ul>
                {SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion}>
                    <button type="button" className="chat__chip" onClick={() => send(suggestion, { refocus: true })}>
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form
          className="chat__form"
          onSubmit={(event) => {
            event.preventDefault()
            send(input)
          }}
        >
          <label htmlFor="chat-input" className="visually-hidden">
            Ask a question about Fred
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            className="chat__input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about Fred's projects, skills…"
            maxLength={500}
            autoComplete="off"
            enterKeyHint="send"
          />
          <button type="submit" className="chat__send" aria-label="Send question" disabled={!input.trim() || pending}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>

      <button
        ref={launcherRef}
        type="button"
        className="chat__launcher"
        data-open={open}
        data-magnetic
        data-cursor={open ? '' : 'Ask'}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? 'Close portfolio assistant' : 'Ask about Fred'}
        onClick={() => setOpen((value) => !value)}
      >
        <svg className="chat__launcher-icon chat__launcher-icon--chat" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8.5 10h.01M12 10h.01M15.5 10h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <svg className="chat__launcher-icon chat__launcher-icon--close" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="chat__tooltip" aria-hidden="true">
          Ask about Fred
        </span>
      </button>
    </div>
  )
}
