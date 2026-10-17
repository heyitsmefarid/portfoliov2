// Bahadvisory: stills + demo clip, on the seeded demo data (all "Simulated").
//
// Start (in the bahadvisory repo, branch `stabilization`):
//   JAVA_HOME="C:/Program Files/Android/Android Studio/jbr" firebase emulators:start --project demo-bahadvisory --only auth,firestore
//   npm run seed -- --emulator
//   npx vite --port 5181 --strictPort
// Stop afterwards: everything listening on 5181, 8080, 9099, 9150, 4400, 4500.
//
// The browser's location is set to Calapan Port, so "My location" is the start.
import { chromium } from 'playwright'
import { clip, still, tap } from './lib.mjs'

const BASE = 'http://localhost:5181'
const OUT = 'scripts/capture/out/bahadvisory'

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  geolocation: { latitude: 13.4186, longitude: 121.1858 },
  permissions: ['geolocation'],
})
const page = await context.newPage()

async function openMap() {
  await page.goto(BASE + '/', { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: 'Skip' }).click({ timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(1500)
}

async function planRoute({ slow }) {
  const pause = slow ? 700 : 100
  const act = slow ? (locator) => tap(page, locator) : (locator) => locator.click()
  await act(page.getByRole('button', { name: /My location/ }))
  await page.waitForTimeout(pause)
  const search = page.getByPlaceholder('Search a place, barangay or landmark')
  if (slow) {
    await search.click()
    await search.pressSequentially('Bucayao', { delay: 90 })
  } else {
    await search.fill('Bucayao')
  }
  await act(page.getByRole('button', { name: 'Search', exact: true }))
  const result = page.locator('li button').filter({ hasText: /^\s*Bucayao, Calapan/ }).first()
  await result.waitFor({ timeout: 15000 })
  await page.waitForTimeout(pause)
  await act(result)
  await page.waitForTimeout(pause)
  await act(page.getByRole('button', { name: 'Find a safe route' }))
  await page.waitForTimeout(7000)
}

async function askAssistant({ slow }) {
  const question = page.getByRole('button', { name: 'Is it safe to drive to Bucayao now?' })
  await question.waitFor()
  if (slow) await tap(page, question)
  else await question.click()
  await page.waitForTimeout(6000)
}

// Stills
await openMap()
await still(page, OUT, 'map')

await page.goto(BASE + '/navigate', { waitUntil: 'load' })
await page.waitForTimeout(2000)
await planRoute({ slow: false })
await still(page, OUT, 'safe-route')

await page.goto(BASE + '/assistant', { waitUntil: 'load' })
await page.waitForTimeout(2000)
await askAssistant({ slow: false })
await still(page, OUT, 'assistant')

for (const [route, name] of [
  ['/report', 'report'],
  ['/evacuation', 'evacuation'],
  ['/pricing', 'pricing'],
]) {
  await page.goto(BASE + route, { waitUntil: 'load' })
  await page.waitForTimeout(3000)
  await still(page, OUT, name)
}

// Demo clip: map → Safe route → flood-checked route → nearest evacuation center.
// (Ask Baha AI is left out: without API keys locally it shows its offline
// fallback, which is in the gallery with that caption instead.)
await openMap()
await clip(page, OUT, 'demo', async () => {
  await page.waitForTimeout(1200)
  await tap(page, page.getByRole('button', { name: 'Safe route' }).or(page.getByRole('link', { name: 'Safe route' })).first())
  await page.waitForTimeout(1500)
  await planRoute({ slow: true })
  await tap(page, page.getByRole('link', { name: 'Evacuate', exact: true }).first())
  await page.waitForTimeout(2000)
  await tap(page, page.getByRole('button', { name: 'Find the nearest safe center' }))
  await page.waitForTimeout(4500)
})

await browser.close()
console.log('captured', OUT)
