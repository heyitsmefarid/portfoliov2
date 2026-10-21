// Fake Supabase + Worker for capturing ApplyPilot screens. The dev server is
// started with VITE_SUPABASE_URL=https://mock.supabase.invalid and
// VITE_API_URL=https://mock-api.invalid, so no real project or Worker is ever
// contacted; every request is answered here with made-up data for a fictional
// job seeker "Alex Santos". Companies, people and emails are all invented.
const HOST = 'https://mock.supabase.invalid'
const API = 'https://mock-api.invalid'
const NOW = Date.now()
const ago = (hours) => new Date(NOW - hours * 3600_000).toISOString()
const ahead = (hours) => new Date(NOW + hours * 3600_000).toISOString()

const USER_ID = '00000000-0000-4000-8000-0000000000a1'
const user = {
  id: USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'alex@applypilot.invalid',
  email_confirmed_at: ago(900),
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: ago(900),
  updated_at: ago(1),
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

const profile = {
  id: USER_ID,
  email: user.email,
  full_name: 'Alex Santos',
  phone: '',
  location: 'Pasig, Metro Manila',
  headline: 'Junior full-stack developer',
  timezone: 'Asia/Manila',
  portfolio_url: '',
  linkedin_url: '',
  github_url: '',
  verified_resume_version_id: 'rv-1',
  onboarded_at: ago(800),
}

const rules = {
  id: 'rules-1',
  mode: 'approval',
  paused: false,
  paused_at: null,
  paused_reason: null,
  auto_apply_enabled: false,
  auto_apply_opt_in_at: null,
  allowed_sources: ['demo'],
  min_match_score: 80,
  min_salary_hourly_usd: 4,
  preferred_categories: ['frontend', 'full-stack', 'react'],
  max_daily_submissions: 5,
  excluded_companies: [],
  resume_selection: 'tailored',
  require_document_approval: true,
  auto_prepare_min_score: 80,
  follow_up_after_days: 7,
  notify_min_score: 75,
  ai_daily_request_budget: 200,
  email_notifications: true,
  telegram_notifications: false,
  n8n_last_seen_at: ago(0.02),
}

const CRITERIA = ['technical_skills', 'experience', 'education', 'projects', 'responsibilities', 'qualifications', 'location', 'work_arrangement', 'compensation', 'eligibility']

function breakdown(scores, notes = {}) {
  return Object.fromEntries(
    CRITERIA.map((k, i) => [k, { score: scores[i], source: ['location', 'work_arrangement', 'compensation', 'eligibility'].includes(k) ? 'deterministic' : 'blended', note: notes[k] ?? '' }]),
  )
}

const pass = (rule, detail, mandatory = true) => ({ rule, outcome: 'pass', mandatory, detail })

function job(id, fields, match) {
  const row = {
    id,
    external_id: id,
    company_url: null,
    salary_min: null,
    salary_max: null,
    salary_currency: null,
    salary_period: null,
    salary_text: null,
    candidate_locations: null,
    requirements: [],
    tags: [],
    apply_url: `https://example.com/jobs/${id}`,
    expires_at: null,
    status: 'active',
    is_hidden: false,
    description: '',
    ...fields,
    discovered_at: fields.discovered_at ?? fields.posted_at,
  }
  row.job_matches = match
    ? [
        {
          id: `m-${id}`,
          job_id: id,
          preference_id: 'pref-remote',
          status: 'scored',
          deterministic_score: match.score - 3,
          ai_score: match.score + 2,
          eligible: true,
          matched_skills: [],
          missing_skills: [],
          missing_qualifications: [],
          suggestions: [],
          recommendation: match.score >= 80 ? 'apply' : 'consider',
          model: 'gemini-2.5-flash',
          scored_at: fields.posted_at,
          breakdown: breakdown(match.scores ?? Array(10).fill(match.score)),
          eligibility: { passed: true, checks: [], failures: [], warnings: [], profile: 'Remote — Philippines' },
          ...match,
        },
      ]
    : []
  row.saved_jobs = fields.saved ? [{ id: `s-${id}` }] : []
  delete row.saved
  row.applications = []
  return row
}

const jobs = [
  job(
    'j-northwind',
    {
      source_key: 'greenhouse',
      title: 'Junior React Developer',
      company: 'Northwind Labs',
      location: 'Remote (Philippines)',
      work_arrangement: 'remote',
      employment_type: 'full_time',
      experience_level: 'junior',
      salary_min: 45000,
      salary_max: 60000,
      salary_currency: 'PHP',
      salary_period: 'month',
      candidate_locations: 'Philippines',
      ph_eligibility: 'eligible',
      posted_at: ago(9),
      saved: true,
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
      description:
        'Northwind Labs builds scheduling software for clinics across Southeast Asia. We are hiring a Junior React Developer to join our product squad.\n\nWhat you will do\n• Build and polish features in our React + TypeScript web app\n• Turn Figma designs into accessible, responsive components with Tailwind CSS\n• Work with our API team on REST endpoints and Postgres-backed features\n• Write tests and take part in code review\n\nWhat we are looking for\n• 0–2 years of professional or project experience with React\n• Comfortable with TypeScript, Git and pull requests\n• Experience with a SQL database (Postgres preferred)\n• Bonus: Jest or Vitest, GraphQL\n\nFully remote for applicants based in the Philippines. Monthly salary of ₱45,000–₱60,000, HMO from day one.',
    },
    {
      score: 86,
      scores: [90, 78, 85, 92, 84, 80, 100, 100, 85, 100],
      matched_skills: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Git', 'REST APIs'],
      missing_skills: ['Jest', 'GraphQL'],
      missing_qualifications: [],
      suggestions: [
        'Lead with the React + TypeScript projects that use Supabase and Postgres.',
        'Mention the automated tests you wrote for your capstone, even if they used Vitest.',
      ],
      explanation:
        'Strong fit: your verified resume shows React, TypeScript and Tailwind across several shipped projects, and the role is remote for Philippine applicants within your salary range. Testing with Jest is the main gap.',
      breakdown: breakdown([90, 78, 85, 92, 84, 80, 100, 100, 85, 100], {
        technical_skills: '6 of 8 listed skills appear on your verified resume.',
        experience: 'Project and capstone work fits the 0–2 year range.',
        projects: 'Several React + TypeScript web apps with a database behind them.',
        location: 'Remote, open to applicants in the Philippines.',
        compensation: '₱45k–₱60k a month meets your ₱35k floor.',
      }),
      eligibility: {
        passed: true,
        profile: 'Remote — Philippines',
        warnings: [],
        failures: [],
        checks: [
          pass('role', 'Title matches "React developer".'),
          pass('expired', 'Posted 9 hours ago, no closing date.'),
          pass('work_arrangement', 'Remote matches your remote profile.'),
          pass('ph_eligibility', 'Candidates: Philippines.'),
          pass('experience', 'Junior level fits your 0–2 year target.'),
          pass('salary', '₱45,000–₱60,000 / month is above your floor.'),
          pass('freshness', 'Within the 14-day window.', false),
        ],
      },
    },
  ),
  job(
    'j-brightpath',
    { source_key: 'lever', title: 'Frontend Engineer (React)', company: 'Brightpath Health', location: 'Remote (APAC)', work_arrangement: 'remote', employment_type: 'full_time', experience_level: 'junior', salary_min: 1400, salary_max: 1900, salary_currency: 'USD', salary_period: 'month', candidate_locations: 'APAC', ph_eligibility: 'eligible', posted_at: ago(20), saved: true },
    { score: 82, explanation: 'Good fit on React and TypeScript, remote across APAC including the Philippines. Asks for some accessibility experience, which your projects show.' },
  ),
  job(
    'j-sampaguita',
    { source_key: 'gmail_alert:jobstreet', title: 'Full-Stack Developer (Node.js / React)', company: 'Sampaguita Software', location: 'Ortigas, Pasig', work_arrangement: 'hybrid', employment_type: 'full_time', experience_level: 'junior', salary_min: 40000, salary_max: 55000, salary_currency: 'PHP', salary_period: 'month', ph_eligibility: 'unknown', posted_at: ago(30) },
    { score: 79, explanation: 'Hybrid in Ortigas, within your Pasig district. Node.js and React match; NestJS experience from your capstone covers the backend side.' },
  ),
  job(
    'j-lumen',
    { source_key: 'himalayas', title: 'Junior Software Engineer', company: 'Lumen Analytics', location: 'Remote', work_arrangement: 'remote', employment_type: 'full_time', experience_level: 'entry', salary_text: 'Competitive', candidate_locations: 'Worldwide', ph_eligibility: 'eligible', posted_at: ago(44) },
    { score: 74, explanation: 'Entry-level and open worldwide. Mostly Python and data pipelines, which your resume shows less of than JavaScript.' },
  ),
  job(
    'j-bayanihan',
    { source_key: 'jobicy', title: 'Web Developer', company: 'Bayanihan Cloud', location: 'Remote (Philippines)', work_arrangement: 'remote', employment_type: 'contract', experience_level: 'junior', salary_min: 6, salary_max: 9, salary_currency: 'USD', salary_period: 'hour', candidate_locations: 'Philippines', ph_eligibility: 'eligible', posted_at: ago(55) },
    { score: 77, explanation: 'Contract web role for Philippine applicants at $6–$9 an hour. PHP and MySQL experience from your shop and library systems fits well.' },
  ),
  job(
    'j-pinecrest',
    { source_key: 'remotive', title: 'QA Automation Engineer', company: 'Pinecrest Digital', location: 'Remote', work_arrangement: 'remote', employment_type: 'full_time', experience_level: 'junior', ph_eligibility: 'eligible', candidate_locations: 'Asia', posted_at: ago(70) },
    { score: 68, explanation: 'Playwright experience matches, but the role is mostly test planning rather than building features.' },
  ),
  job(
    'j-quillstack',
    { source_key: 'ashby', title: 'Associate Product Engineer', company: 'Quillstack', location: 'Makati City', work_arrangement: 'onsite', employment_type: 'full_time', experience_level: 'entry', salary_min: 38000, salary_max: 48000, salary_currency: 'PHP', salary_period: 'month', ph_eligibility: 'unknown', posted_at: ago(96) },
    { score: 72, explanation: 'On-site in Makati, one of your allowed districts. Product work across React and Supabase suits your projects.' },
  ),
  job(
    'j-harbor',
    { source_key: 'gmail_alert:linkedin', title: 'React Native Developer', company: 'Harbor & Pine', location: 'Remote (Philippines)', work_arrangement: 'remote', employment_type: 'full_time', experience_level: 'mid', ph_eligibility: 'eligible', candidate_locations: 'Philippines', posted_at: ago(120) },
    { score: 63, explanation: 'Mobile role; your Flutter work transfers, but it asks for 3+ years of React Native.' },
  ),
]

const applications = [
  ['a-northwind', 'awaiting_approval', 'Junior React Developer', 'Northwind Labs', 86, 3, 'greenhouse'],
  ['a-brightpath', 'draft_prepared', 'Frontend Engineer (React)', 'Brightpath Health', 82, 6, 'lever'],
  ['a-bayanihan', 'draft_prepared', 'Web Developer', 'Bayanihan Cloud', 77, 12, 'jobicy'],
  ['a-sampaguita', 'saved', 'Full-Stack Developer (Node.js / React)', 'Sampaguita Software', 79, 20, 'gmail_alert:jobstreet'],
  ['a-lumen', 'saved', 'Junior Software Engineer', 'Lumen Analytics', 74, 40, 'himalayas'],
  ['a-quillstack', 'discovered', 'Associate Product Engineer', 'Quillstack', 72, 50, 'ashby'],
  ['a-orbitly', 'applied', 'Junior Frontend Developer', 'Orbitly', 81, 100, 'demo'],
  ['a-kalye', 'applied', 'Software Engineer I', 'Kalye Commerce', 76, 140, 'greenhouse'],
  ['a-mabuhay', 'assessment', 'Web Application Developer', 'Mabuhay Logistics', 78, 30, 'lever'],
  ['a-tidewater', 'interview', 'Junior Full-Stack Engineer', 'Tidewater Systems', 84, 18, 'greenhouse'],
  ['a-cobalt', 'rejected', 'Frontend Developer', 'Cobalt Row', 70, 200, 'remotive'],
  ['a-pinecrest', 'submission_failed', 'QA Automation Engineer', 'Pinecrest Digital', 68, 8, 'remotive'],
].map(([id, status, job_title, company, match_score, hours, source_key]) => ({
  id,
  job_id: null,
  status,
  status_source: 'user',
  mode: 'approval',
  channel: source_key === 'demo' ? 'playwright' : 'manual',
  company,
  job_title,
  apply_url: null,
  company_domain: null,
  source_key,
  match_score,
  resume_version_id: null,
  cover_letter_document_id: null,
  documents_approved_at: null,
  submission_approved_at: null,
  submitted_at: ['applied', 'assessment', 'interview', 'rejected'].includes(status) ? ago(hours + 48) : null,
  confirmed_by: null,
  submission_evidence: null,
  last_error: status === 'submission_failed' ? 'The form asked for a CAPTCHA, so the runner stopped.' : null,
  needs_manual_action: status === 'submission_failed',
  manual_action_reason: status === 'submission_failed' ? 'CAPTCHA on the application form — apply on the original site.' : null,
  follow_up_interval_days: 7,
  next_follow_up_at: status === 'applied' ? ahead(72) : null,
  last_follow_up_at: null,
  follow_ups_sent: 0,
  recruiter_name: null,
  recruiter_email: null,
  notes: '',
  created_at: ago(hours + 72),
  updated_at: ago(hours),
}))

const linkedApp = Object.fromEntries(applications.map((a) => [a.company, a.id]))
jobs.forEach((j) => {
  const app = applications.find((a) => a.company === j.company)
  if (app) j.applications = [{ id: app.id, status: app.status }]
})

function message(id, fields) {
  return {
    id,
    gmail_message_id: id,
    thread_id: id,
    snippet: '',
    body_text: '',
    confidence: 0.93,
    classification: null,
    classified_by: 'ai',
    application_id: null,
    status_update: null,
    sender_verified: true,
    processed_status: 'classified',
    suggested_reply: null,
    is_important: false,
    is_read: true,
    ...fields,
  }
}

const messages = [
  message('msg-interview', {
    from_name: 'Bea Villanueva',
    from_email: 'talent@tidewater.example',
    subject: 'Interview invitation: Junior Full-Stack Engineer',
    received_at: ago(5),
    category: 'interview',
    is_important: true,
    is_read: false,
    application_id: linkedApp['Tidewater Systems'],
    status_update: { update: true, to: 'interview', reason: 'Verified employer sender, interview invitation at 0.95 confidence.' },
    classification: {
      summary: 'Tidewater Systems invites you to a 45-minute technical interview over Google Meet and asks you to confirm a slot.',
      instructions: ['Reply with your preferred slot', 'Prepare a short walkthrough of one project you built'],
      // Two days out, 5 PM Manila time.
      deadline_iso: new Date(new Date(ahead(48)).setUTCHours(9, 0, 0, 0)).toISOString(),
    },
    body_text:
      'Hi Alex,\n\nThank you for applying for the Junior Full-Stack Engineer role at Tidewater Systems. We enjoyed reading your application and would like to invite you to a 45-minute technical interview with our engineering lead.\n\nPlease reply with the slot that works best for you:\n• Thursday, 10:00 AM (PHT)\n• Thursday, 2:00 PM (PHT)\n• Friday, 11:00 AM (PHT)\n\nIt would help to prepare a short walkthrough of one project you built.\n\nBest regards,\nBea Villanueva\nTalent Partner, Tidewater Systems',
    suggested_reply:
      'Hi Bea,\n\nThank you for the invitation. Thursday at 2:00 PM (PHT) works well for me. I will prepare a short walkthrough of one of my projects.\n\nBest regards,\nAlex Santos',
  }),
  message('msg-assessment', {
    from_name: 'Mabuhay Logistics Careers',
    from_email: 'careers@mabuhay-logistics.example',
    subject: 'Next step: take-home assessment',
    received_at: ago(30),
    category: 'assessment',
    application_id: linkedApp['Mabuhay Logistics'],
    status_update: { update: true, to: 'assessment', reason: 'Verified employer sender.' },
  }),
  message('msg-ack', {
    from_name: 'Orbitly Hiring',
    from_email: 'no-reply@orbitly.example',
    subject: 'We received your application',
    received_at: ago(98),
    category: 'acknowledgment',
    application_id: linkedApp.Orbitly,
  }),
  message('msg-outreach', {
    from_name: 'Carlo Mendoza',
    from_email: 'carlo.mendoza@recruit.example',
    subject: 'Frontend roles for junior developers',
    received_at: ago(52),
    category: 'recruiter_outreach',
    sender_verified: false,
    is_read: false,
  }),
  message('msg-alert', {
    from_name: 'JobStreet',
    from_email: 'alerts@jobstreet.example',
    subject: '12 new jobs match "react developer"',
    received_at: ago(26),
    category: 'job_alert',
  }),
  message('msg-reject', {
    from_name: 'Cobalt Row Recruiting',
    from_email: 'jobs@cobaltrow.example',
    subject: 'Update on your application',
    received_at: ago(190),
    category: 'rejection',
    application_id: linkedApp['Cobalt Row'],
    status_update: { update: true, to: 'rejected', reason: 'Verified employer sender.' },
  }),
]

function run(id, workflow, status, hours, extra = {}) {
  const started = ago(hours)
  return {
    id,
    workflow,
    status,
    trigger: 'schedule',
    input: {},
    output: null,
    stats: {},
    item_errors: [],
    error: null,
    attempt: 1,
    max_attempts: 3,
    parent_run_id: null,
    n8n_execution_id: String(4800 + Math.round(hours * 7)),
    cancel_requested: false,
    queued_at: started,
    started_at: started,
    finished_at: status === 'running' ? null : new Date(Date.parse(started) + 42_000).toISOString(),
    created_at: started,
    ...extra,
  }
}

const runs = [
  run('r1', 'gmail_sync', 'running', 0.05),
  run('r2', 'job_matching', 'succeeded', 0.6, { stats: { scored: 14, eligible: 6, ai_calls: 6 } }),
  run('r3', 'job_discovery', 'succeeded', 0.7, { stats: { fetched: 212, new: 31, duplicates: 18 } }),
  run('r4', 'application_prep', 'succeeded', 3, { stats: { prepared: 1 } }),
  run('r5', 'application_submit', 'failed', 8, { trigger: 'dashboard', error: 'CAPTCHA detected on the form — moved to the manual queue.' }),
  run('r6', 'follow_up', 'succeeded', 10, { stats: { drafts: 2 } }),
  run('r7', 'reports', 'succeeded', 14),
  run('r8', 'job_discovery', 'partial', 6.7, { stats: { fetched: 180, new: 22 }, item_errors: [{ source: 'arbeitnow', error: 'HTTP 503' }] }),
]

const notifications = [
  { id: 'n1', type: 'interview', severity: 'success', title: 'Interview invitation from Tidewater Systems', body: 'Moved Junior Full-Stack Engineer to Interview.', link: '/inbox?message=msg-interview', read_at: null, created_at: ago(5) },
  { id: 'n2', type: 'approval_needed', severity: 'info', title: 'Documents ready for approval', body: 'Junior React Developer at Northwind Labs', link: '/applications/a-northwind', read_at: null, created_at: ago(3) },
  { id: 'n3', type: 'high_match', severity: 'info', title: '86% match: Junior React Developer', body: 'Northwind Labs · Remote (Philippines)', link: '/jobs/j-northwind', read_at: ago(2), created_at: ago(9) },
]

const sources = [
  ['remotive', 'Remotive'],
  ['jobicy', 'Jobicy'],
  ['himalayas', 'Himalayas'],
  ['greenhouse', 'Greenhouse boards'],
  ['lever', 'Lever boards'],
  ['demo', 'Demo application site'],
].map(([key, name], i) => ({ id: `src-${i}`, key, kind: 'api', name, enabled: true, config: {}, automation_allowed: key === 'demo', last_run_at: ago(0.7), last_status: 'ok', last_error: null, last_job_count: 30 - i * 4 }))

// The "Jobs discovered" chart only needs timestamps: a plausible 14-day spread.
const discoveredSpread = [18, 24, 9, 31, 27, 12, 6, 22, 35, 29, 14, 19, 26, 31].flatMap((count, day) =>
  Array.from({ length: count }, (_, i) => ({ discovered_at: ago((13 - day) * 24 + (i % 12)) })),
)

const stats = {
  jobs_total: 284,
  jobs_new_24h: 31,
  high_matches: 6,
  saved: 2,
  submitted: 5,
  pending: 3,
  awaiting_action: 3,
  interviews_upcoming: 1,
  rejected: 1,
  offers: 0,
  runs_failed_24h: 1,
  runs_active: 1,
  unread_notifications: 2,
  unread_messages: 2,
}

const integrations = {
  supabase: true,
  gemini: true,
  gmail_oauth: true,
  token_encryption: true,
  n8n_push: true,
  github_runner: true,
  models: { fast: 'gemini-2.5-flash-lite', quality: 'gemini-2.5-flash', api: 'v1beta' },
  model_checks: null,
  gmail: { email: user.email, status: 'connected', last_sync_at: ago(0.4), last_error: null, scopes: [] },
  n8n_last_seen_at: rules.n8n_last_seen_at,
}

const TABLES = {
  profiles: [profile],
  automation_rules: [rules],
  job_listings: jobs,
  applications,
  recruitment_messages: messages,
  automation_runs: runs,
  notifications,
  job_sources: sources,
  interview_schedules: [],
  application_documents: [],
  application_events: [],
  resumes: [],
  resume_versions: [],
  skills: [],
  job_preferences: [],
  ai_usage_logs: [],
}

// Applies the simple PostgREST filters the app uses on its own columns:
// col=eq.x and col=is.null. Filters on embedded tables are handled below.
function filterRows(rows, params) {
  return rows.filter((row) =>
    [...params].every(([key, value]) => {
      if (!(key in row)) return true
      if (value.startsWith('eq.')) return String(row[key]) === value.slice(3)
      if (value === 'is.null') return row[key] === null
      return true
    }),
  )
}

export async function installMocks(context, log = () => {}) {
  await context.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    ['applypilot-auth', JSON.stringify(session)],
  )
  await context.routeWebSocket(/mock\.supabase\.invalid/, () => {
    // Mocked: never connects anywhere, never sends anything.
  })

  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' }
  const reply = (route, body, status = 200, headers = {}) =>
    route.fulfill({ status, contentType: 'application/json', headers: { ...cors, ...headers }, body: body === undefined ? '' : JSON.stringify(body) })

  await context.route(`${API}/**`, async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    const path = new URL(request.url()).pathname
    if (path === '/api/integrations/status') return reply(route, integrations)
    if (path === '/api/bootstrap') return reply(route, { ok: true })
    log(`api ${request.method()} ${path}`)
    return reply(route, { error: { message: 'Not available in the capture', code: 'capture' } }, 503)
  })

  await context.route(`${HOST}/**`, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })
    if (path.startsWith('/auth/v1/user')) return reply(route, user)
    if (path.startsWith('/auth/v1/token')) return reply(route, session)
    if (path.startsWith('/auth/v1/')) return reply(route, {})

    if (path === '/rest/v1/rpc/dashboard_stats') return reply(route, stats)
    if (path.startsWith('/rest/v1/rpc/')) {
      log(`rpc ${path.slice(13)}`)
      return reply(route, null)
    }
    if (path.startsWith('/rest/v1/')) {
      const table = path.slice(9)
      if (!(table in TABLES)) log(`empty ${method} ${table}`)
      if (method !== 'GET' && method !== 'HEAD') return reply(route, undefined, 204)
      // AI requests in the last 24 hours (the status bar's "AI n/200" lamp).
      if (table === 'ai_usage_logs' && method === 'HEAD') return reply(route, undefined, 200, { 'content-range': '0-36/37' })
      const select = url.searchParams.get('select') ?? '*'
      if (table === 'job_listings' && select === 'discovered_at') return reply(route, discoveredSpread)
      let rows = filterRows(TABLES[table] ?? [], url.searchParams)
      if (table === 'job_listings') {
        if (select.includes('job_matches!inner')) rows = rows.filter((j) => j.job_matches[0]?.eligible && j.job_matches[0].score >= 60)
        if (select.includes('saved_jobs!inner')) rows = rows.filter((j) => j.saved_jobs.length)
      }
      const single = (request.headers().accept ?? '').includes('vnd.pgrst.object')
      const headers = { 'content-range': `0-${Math.max(rows.length - 1, 0)}/${rows.length}` }
      if (single) return rows.length ? reply(route, rows[0], 200, headers) : reply(route, { code: 'PGRST116', message: 'No rows' }, 406)
      return reply(route, rows, 200, headers)
    }
    if (path.startsWith('/storage/v1/')) return reply(route, { message: 'not found' }, 404)
    log(`unhandled ${method} ${path}`)
    return reply(route, {}, 404)
  })
}
