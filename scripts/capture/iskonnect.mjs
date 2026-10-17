// ISKONNECT admin panel: stills + demo clip on the Firebase emulator with the
// repo's own test seed (backend/functions/scripts/seedEmulator.js: fictional
// @test.com users). Every request that isn't to localhost/127.0.0.1 is
// blocked, so the real project can't be reached.
//
// Start (Desktop/iskonnect-caps-new-main-main):
//   firebase emulators:start --project demo-capstone --only auth,firestore
//   node backend/functions/scripts/seedEmulator.js          (firebase-admin on NODE_PATH)
//   set users/admin_1.passwordHash = sha256("admin123")     (emulator only)
//   cd admin-ui && VITE_USE_EMULATORS=true npx vite --port 5187 --strictPort
// Stop afterwards: 5187, 8080, 9099, 9150, 4000, 4400, 4500.
import { chromium } from 'playwright'
import { clip, still, tap } from './lib.mjs'

const BASE = 'http://localhost:5187'
const OUT = 'scripts/capture/out/iskonnect'
const ROUTES = (process.env.ROUTES ?? 'Dashboard,Applications,Announcements,Reports').split(',')

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const blocked = new Set()
await context.route('**/*', (route) => {
  const host = new URL(route.request().url()).hostname
  if (host === 'localhost' || host === '127.0.0.1') return route.continue()
  blocked.add(host)
  return route.abort()
})
const page = await context.newPage()

await page.goto(BASE + '/login', { waitUntil: 'load' })
await page.waitForTimeout(1500)
await still(page, OUT, 'login')
await page.getByPlaceholder('Enter username or email').fill('admin@test.com')
await page.getByPlaceholder('Enter password').fill('admin123')
await page.locator('button.login-btn').click()
await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 })
await page.waitForTimeout(2500)

// A full page load sends the app back to the dashboard, so move around by
// clicking the sidebar like a user would (submenus are opened first).
async function go(label) {
  const link = page.locator('aside, nav').getByText(label, { exact: true }).first()
  if (!(await link.isVisible().catch(() => false))) {
    for (const group of ['Scholars', 'History', 'Administration']) {
      await page.locator('aside, nav').getByText(group, { exact: true }).first().click().catch(() => {})
      await page.waitForTimeout(300)
      if (await link.isVisible().catch(() => false)) break
    }
  }
  await link.click()
  await page.waitForTimeout(2500)
}

for (const label of ROUTES) {
  await go(label)
  await still(page, OUT, label.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
}

if (!process.env.ROUTES) {
  await go('Dashboard')
  await clip(page, OUT, 'demo', async () => {
    await page.waitForTimeout(1500)
    for (const label of ['Applications', 'Announcements', 'Reports', 'Dashboard']) {
      await tap(page, page.locator('aside, nav').getByText(label, { exact: true }).first())
      await page.waitForTimeout(1800)
    }
  })
}

await browser.close()
console.log('captured', OUT, blocked.size ? `(blocked: ${[...blocked].join(', ')})` : '(nothing blocked)')
