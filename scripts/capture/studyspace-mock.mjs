// Fake Supabase for capturing StudySpace screens. The dev server is started
// with VITE_SUPABASE_URL=https://mock.supabase.invalid, so the real project is
// never contacted; every request to the fake host is answered here with made-up
// data for a fake user "Demo". Realtime websockets are mocked and never connect.
const HOST = 'https://mock.supabase.invalid'
const NOW = new Date('2026-10-17T09:00:00+08:00')
const iso = (offsetHours = 0) => new Date(NOW.getTime() + offsetHours * 3600_000).toISOString()

export const USER_ID = '00000000-0000-4000-8000-000000000001'
const PARTNER_ID = '00000000-0000-4000-8000-000000000002'
const user = {
  id: USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@studyspace.invalid',
  email_confirmed_at: iso(-500),
  app_metadata: { provider: 'email' },
  user_metadata: { display_name: 'Demo' },
  created_at: iso(-500),
  updated_at: iso(-1),
}

function base64url(object) {
  return Buffer.from(JSON.stringify(object)).toString('base64url')
}
const ACCESS_TOKEN = `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url({
  sub: USER_ID,
  role: 'authenticated',
  aud: 'authenticated',
  email: user.email,
  exp: 4102444800,
  iat: 1790000000,
  session_id: 'mock-session',
})}.mock-signature`
const session = {
  access_token: ACCESS_TOKEN,
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 4102444800,
  refresh_token: 'mock-refresh',
  user,
}

const subjects = [
  { id: 's-bio', name: 'Biology', color: '#7c6cf0', icon: 'leaf' },
  { id: 's-math', name: 'Calculus', color: '#f0a35c', icon: 'sigma' },
  { id: 's-hist', name: 'History', color: '#4fb3a9', icon: 'landmark' },
].map((s) => ({ ...s, owner_id: USER_ID, created_at: iso(-300), updated_at: iso(-2) }))

const doc = (...paragraphs) => ({
  type: 'doc',
  content: paragraphs.map((text) =>
    text.startsWith('# ')
      ? { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: text.slice(2) }] }
      : { type: 'paragraph', content: [{ type: 'text', text }] },
  ),
})

const notes = [
  {
    id: 'n-photo',
    title: 'Photosynthesis',
    subject_id: 's-bio',
    is_pinned: true,
    is_favorite: true,
    content: doc(
      '# Light-dependent reactions',
      'In the thylakoid membranes, light energy splits water and makes ATP and NADPH. Oxygen is released as a by-product.',
      '# Calvin cycle',
      'In the stroma, ATP and NADPH from the light reactions fix carbon dioxide into G3P, which builds glucose.',
      'Remember: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂',
    ),
  },
  {
    id: 'n-cell',
    title: 'Cell respiration',
    subject_id: 's-bio',
    content: doc('Glycolysis → Krebs cycle → electron transport chain. Most ATP comes from the electron transport chain.'),
  },
  { id: 'n-limits', title: 'Limits and continuity', subject_id: 's-math', content: doc('A function is continuous at a point if the limit equals the value there.') },
  { id: 'n-deriv', title: 'Derivative rules', subject_id: 's-math', content: doc('Power, product, quotient and chain rules, with one worked example each.') },
  { id: 'n-rev', title: 'Philippine Revolution timeline', subject_id: 's-hist', content: doc('1872 Cavite Mutiny, 1892 La Liga Filipina and the Katipunan, 1896 Cry of Pugad Lawin, 1898 independence declared.') },
].map((n, i) => ({
  is_pinned: false,
  is_favorite: false,
  is_shared: i % 2 === 0,
  folder_id: null,
  owner_id: USER_ID,
  content_text: n.content.content.map((block) => block.content?.[0]?.text ?? '').join('\n'),
  search: null,
  created_at: iso(-200 + i * 10),
  updated_at: iso(-3 - i * 5),
  ...n,
}))

const decks = [
  { id: 'd-bio', title: 'Photosynthesis', subject_id: 's-bio', description: 'Light reactions and the Calvin cycle', source_note_id: 'n-photo' },
  { id: 'd-math', title: 'Derivatives', subject_id: 's-math', description: 'Rules and quick checks' },
].map((d) => ({ is_shared: true, owner_id: USER_ID, tags: [], source_note_id: null, created_at: iso(-150), updated_at: iso(-4), ...d }))

const cards = [
  ['d-bio', 'Where do the light-dependent reactions happen?', 'In the thylakoid membranes of the chloroplast.'],
  ['d-bio', 'What are the products of the light reactions?', 'ATP, NADPH and oxygen.'],
  ['d-bio', 'What does the Calvin cycle produce?', 'G3P, which is used to build glucose.'],
  ['d-bio', 'Which molecule is split to release oxygen?', 'Water (H₂O).'],
  ['d-math', 'Derivative of xⁿ', 'n·xⁿ⁻¹'],
  ['d-math', 'Product rule', '(fg)′ = f′g + fg′'],
  ['d-math', 'Chain rule', '(f∘g)′ = f′(g(x))·g′(x)'],
].map(([deck_id, front, back], i) => ({
  id: `c-${i}`,
  deck_id,
  front,
  back,
  type: 'basic',
  position: i,
  options: null,
  correct_answer: null,
  difficulty: null,
  topic: null,
  front_image_path: null,
  back_image_path: null,
  owner_id: USER_ID,
  created_at: iso(-140),
  updated_at: iso(-4),
}))

const progress = cards.map((card, i) => ({
  card_id: card.id,
  user_id: USER_ID,
  state: i % 3 === 0 ? 'new' : 'review',
  due_at: iso(-1),
  ease: 2.5,
  interval_minutes: 1440,
  repetitions: i % 3,
  review_count: i % 4,
  correct_count: i % 3,
  incorrect_count: i % 2,
  last_reviewed_at: iso(-30),
}))

const tasks = [
  ['Review photosynthesis cards', 'study', 's-bio', 2, 30, 'high'],
  ['Calculus problem set 4', 'assignment', 's-math', 5, 60, 'high'],
  ['Read chapter 7: Revolution', 'study', 's-hist', 26, 45, 'medium'],
  ['Biology quiz', 'exam', 's-bio', 50, 60, 'high'],
  ['Group study call', 'study', null, 30, 90, 'low'],
].map(([title, kind, subject_id, inHours, minutes, priority], i) => ({
  id: `t-${i}`,
  title,
  kind,
  subject_id,
  start_at: iso(inHours),
  due_at: iso(inHours + minutes / 60),
  duration_minutes: minutes,
  priority,
  all_day: false,
  description: '',
  is_shared: true,
  owner_id: i === 4 ? PARTNER_ID : USER_ID,
  plan_id: null,
  recurrence: 'none',
  recurrence_until: null,
  source: 'manual',
  created_at: iso(-48),
  updated_at: iso(-3),
}))

const sessions = Array.from({ length: 12 }, (_, i) => ({
  id: `ss-${i}`,
  user_id: i % 3 === 2 ? PARTNER_ID : USER_ID,
  mode: i % 2 ? 'focus' : 'flashcards',
  started_at: iso(-24 * (i + 1)),
  ended_at: iso(-24 * (i + 1) + 1),
  focus_seconds: 1500 + i * 120,
  cards_studied: i % 2 ? 0 : 20,
  correct_answers: i % 2 ? 0 : 16,
  questions_answered: 0,
  xp_earned: 40 + i * 3,
  subject_id: subjects[i % 3].id,
  task_id: null,
  room_id: null,
  together: i % 4 === 0,
  created_at: iso(-24 * (i + 1)),
}))

const conversation = {
  id: 'conv-1',
  user_id: USER_ID,
  title: 'Photosynthesis questions',
  mode: 'tutor',
  difficulty: 'normal',
  context_id: 'n-photo',
  context_title: 'Photosynthesis',
  context_type: 'note',
  created_at: iso(-2),
  updated_at: iso(-1),
}
const aiMessages = [
  ['user', 'Can you explain the Calvin cycle simply?'],
  [
    'assistant',
    'Sure! Think of the Calvin cycle as the "sugar factory" of the chloroplast.\n\n1. **Carbon fixation**: CO₂ from the air is attached to a 5-carbon sugar (RuBP).\n2. **Reduction**: ATP and NADPH from the light reactions turn it into G3P.\n3. **Regeneration**: most G3P rebuilds RuBP so the cycle keeps going; the rest becomes glucose.\n\nWant me to quiz you on it?',
  ],
].map(([role, content], i) => ({
  id: `m-${i}`,
  conversation_id: 'conv-1',
  user_id: USER_ID,
  role,
  content,
  provider: role === 'assistant' ? 'gemini' : null,
  model: null,
  fell_back: false,
  created_at: iso(-2 + i * 0.01),
}))

const profile = (id, name, color) => ({
  id,
  display_name: name,
  bio: '',
  avatar_path: null,
  star_color: color,
  timezone: 'Asia/Manila',
  preferences: {},
  xp: id === USER_ID ? 2340 : 2110,
  current_streak: id === USER_ID ? 12 : 9,
  longest_streak: 21,
  last_active_date: iso(0).slice(0, 10),
  onboarded_at: iso(-400),
  created_at: iso(-500),
  updated_at: iso(-1),
})

const TABLES = {
  profiles: [profile(USER_ID, 'Demo', '#8b7cf6'), profile(PARTNER_ID, 'Partner', '#f5b45a')],
  subjects,
  notes,
  decks,
  flashcards: cards,
  flashcard_progress: progress,
  tasks,
  study_sessions: sessions,
  ai_conversations: [conversation],
  ai_messages: aiMessages,
}

// Applies the simple PostgREST filters the app uses: col=eq.x, col=in.(a,b), col=is.null.
function filterRows(rows, params) {
  return rows.filter((row) =>
    [...params].every(([key, value]) => {
      if (['select', 'order', 'limit', 'offset', 'or', 'and'].includes(key) || !(key in row)) return true
      if (value.startsWith('eq.')) return String(row[key]) === value.slice(3)
      if (value.startsWith('in.(')) return value.slice(4, -1).split(',').map((v) => v.replace(/"/g, '')).includes(String(row[key]))
      if (value === 'is.null') return row[key] === null
      return true
    }),
  )
}

export async function installMocks(context, log = () => {}) {
  await context.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    ['sb-mock-auth-token', JSON.stringify(session)],
  )
  await context.routeWebSocket(/mock\.supabase\.invalid/, () => {
    // Mocked: never connects anywhere, never sends anything.
  })
  await context.route(`${HOST}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    const json = (body, status = 200, headers = {}) =>
      route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', ...headers }, body: JSON.stringify(body) })

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 204,
        headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' },
      })
    }
    if (path.startsWith('/auth/v1/user')) return json(user)
    if (path.startsWith('/auth/v1/token')) return json(session)
    if (path.startsWith('/auth/v1/')) return json({})

    if (path.startsWith('/rest/v1/rpc/')) {
      log(`rpc ${path.slice(13)}`)
      return json(null)
    }
    if (path.startsWith('/rest/v1/')) {
      const table = path.slice(9)
      const known = table in TABLES
      if (!known) log(`empty ${method} ${table}`)
      if (method !== 'GET' && method !== 'HEAD') return json([], 201)
      let rows = filterRows(TABLES[table] ?? [], url.searchParams)
      // Embedded counts, e.g. decks?select=*,flashcards(count)
      const embeds = [...(url.searchParams.get('select') ?? '').matchAll(/(\w+)\(count\)/g)].map((m) => m[1])
      if (embeds.length) {
        const key = `${table.replace(/s$/, '')}_id`
        rows = rows.map((row) => ({
          ...row,
          ...Object.fromEntries(embeds.map((child) => [child, [{ count: (TABLES[child] ?? []).filter((c) => c[key] === row.id).length }]])),
        }))
      }
      const single = (request.headers().accept ?? '').includes('vnd.pgrst.object')
      const headers = { 'content-range': `0-${Math.max(rows.length - 1, 0)}/${rows.length}` }
      if (single) return rows.length ? json(rows[0], 200, headers) : json({ code: 'PGRST116', message: 'No rows' }, 406)
      return json(rows, 200, headers)
    }
    if (path.startsWith('/functions/v1/')) {
      log(`function ${path}`)
      return json({ error: 'not available in the capture' }, 503)
    }
    if (path.startsWith('/storage/v1/')) return json({ message: 'not found' }, 404)
    log(`unhandled ${method} ${path}`)
    return json({}, 404)
  })
}
