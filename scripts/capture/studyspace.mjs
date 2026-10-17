// StudySpace: stills + demo clip with every Supabase request answered by
// studyspace-mock.mjs (fake user "Demo", made-up notes, cards and plans).
//
// Start (Desktop/StudySpace) — the URL override keeps the real project out of reach:
//   VITE_SUPABASE_URL=https://mock.supabase.invalid VITE_SUPABASE_ANON_KEY=mock-anon-key npx vite --port 5186 --strictPort
// Stop afterwards: whatever listens on 5186.
//
// The script fails if any request goes to a host other than localhost or the
// fake Supabase host.
import { chromium } from 'playwright'
import { clip, still, tap } from './lib.mjs'
import { installMocks } from './studyspace-mock.mjs'

const BASE = 'http://localhost:5186'
const OUT = 'scripts/capture/out/studyspace'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark', timezoneId: 'Asia/Manila' })
await installMocks(context)
const outside = new Set()
context.on('request', (request) => {
  const host = new URL(request.url()).host
  if (!/^(localhost(:\d+)?|mock\.supabase\.invalid)$/.test(host)) outside.add(host)
})
const page = await context.newPage()

async function open(path) {
  await page.goto(BASE + path, { waitUntil: 'load' })
  await page.getByRole('button', { name: 'Skip intro' }).click({ timeout: 1500 }).catch(() => {})
  await page.waitForTimeout(2500)
}

for (const [path, name] of [
  ['/', 'dashboard'],
  ['/notes', 'notes'],
  ['/notes/n-photo', 'note-editor'],
  ['/decks', 'decks'],
  ['/tutor/conv-1', 'nova'],
  ['/planner', 'planner'],
  ['/stats', 'stats'],
  ['/space', 'space'],
]) {
  await open(path)
  await still(page, OUT, name)
}

// Demo clip: dashboard → notes → a note → its flashcards → review → Nova
await open('/')
await clip(page, OUT, 'demo', async () => {
  await page.waitForTimeout(1500)
  await tap(page, page.getByRole('link', { name: 'Notes', exact: true }).first())
  await page.waitForTimeout(1500)
  await tap(page, page.getByText('Photosynthesis', { exact: true }).first())
  await page.waitForTimeout(2200)
  await tap(page, page.getByRole('link', { name: 'Flashcards', exact: true }).first())
  await page.waitForTimeout(1500)
  await open('/decks/d-bio/study')
  const card = page.getByText('Where do the light-dependent reactions happen?').first()
  if (await card.isVisible().catch(() => false)) {
    await tap(page, card)
    await page.waitForTimeout(1800)
  }
  await tap(page, page.getByRole('link', { name: 'Nova', exact: true }).first())
  await page.waitForTimeout(1200)
  await open('/tutor/conv-1')
  await page.waitForTimeout(1500)
})

await browser.close()
if (outside.size) {
  console.error('requests left the machine:', [...outside].join(', '))
  process.exit(1)
}
console.log('captured', OUT, '(no outside requests)')
