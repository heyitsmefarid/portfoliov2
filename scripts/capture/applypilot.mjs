// ApplyPilot: stills + demo clip with every Supabase and Worker request
// answered by applypilot-mock.mjs (fictional job seeker, invented companies).
//
// Start (Desktop/applypilot/apps/web) — the URL overrides keep any real project out of reach:
//   VITE_SUPABASE_URL=https://mock.supabase.invalid VITE_SUPABASE_PUBLISHABLE_KEY=mock-key VITE_API_URL=https://mock-api.invalid npx vite --port 5187 --strictPort
// Stop afterwards: whatever listens on 5187.
//
// The script fails if any request goes to a host other than localhost or the
// fake hosts.
import { chromium } from 'playwright'
import { clip, still, tap } from './lib.mjs'
import { installMocks } from './applypilot-mock.mjs'

const BASE = 'http://localhost:5187'
const OUT = 'scripts/capture/out/applypilot'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark', timezoneId: 'Asia/Manila' })
await installMocks(context, (line) => console.log('mock:', line))
const outside = new Set()
context.on('request', (request) => {
  const host = new URL(request.url()).host
  if (!/^(localhost(:\d+)?|mock\.supabase\.invalid|mock-api\.invalid)$/.test(host)) outside.add(host)
})
const page = await context.newPage()

async function open(path) {
  await page.goto(BASE + path, { waitUntil: 'load' })
  await page.waitForTimeout(2500)
}

for (const [path, name] of [
  ['/', 'dashboard'],
  ['/recommended', 'recommended'],
  ['/jobs/j-northwind', 'match'],
  ['/applications', 'applications'],
  ['/inbox?message=msg-interview', 'inbox'],
  ['/automation', 'automation'],
]) {
  await open(path)
  // At 1280 px the board shows four columns; the table shows every application.
  if (name === 'applications') {
    await page.getByRole('button', { name: 'Table' }).click()
    await page.waitForTimeout(500)
  }
  await still(page, OUT, name)
}

// Demo clip: dashboard → recommended → a job's match breakdown → applications → inbox → automation
await open('/')
await clip(page, OUT, 'demo', async () => {
  await page.waitForTimeout(1800)
  await tap(page, page.getByRole('link', { name: 'Recommended', exact: false }).first())
  await page.waitForTimeout(1500)
  await tap(page, page.getByRole('link', { name: 'Junior React Developer' }).first())
  await page.waitForTimeout(1800)
  await page.mouse.wheel(0, 500)
  await page.waitForTimeout(1500)
  await tap(page, page.getByRole('link', { name: /^Applications/ }).first())
  await page.waitForTimeout(1800)
  await tap(page, page.getByRole('link', { name: /^Recruitment inbox/ }).first())
  await page.waitForTimeout(800)
  await tap(page, page.getByRole('button', { name: /Bea Villanueva/ }).first())
  await page.waitForTimeout(2200)
  await tap(page, page.getByRole('link', { name: /^Automation center/ }).first())
  await page.waitForTimeout(2000)
})

await browser.close()
if (outside.size) {
  console.error('requests left the machine:', [...outside].join(', '))
  process.exit(1)
}
console.log('captured', OUT, '(no outside requests)')
