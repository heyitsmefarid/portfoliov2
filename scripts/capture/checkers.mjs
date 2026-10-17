// Checkers (web version): stills + demo clip. Accounts and results live in the
// browser's localStorage; this uses a throwaway browser profile with a made-up
// player, so nothing persists.
//
// Start (Desktop/checkers): python -m http.server 5185 --directory public
// Stop afterwards: whatever listens on 5185.
import { chromium } from 'playwright'
import { clip, glide, still, tap } from './lib.mjs'

const BASE = 'http://localhost:5185'
const OUT = 'scripts/capture/out/checkers'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.goto(BASE + '/', { waitUntil: 'load' })
await page.waitForTimeout(1500)
await still(page, OUT, 'login')

// Sign up a made-up local player (stored only in this throwaway profile).
await page.click('#btn-goto-signup')
await page.fill('#signup-username', 'demo_player')
await page.fill('#signup-fullname', 'Demo Player')
await page.fill('#signup-password', 'demo-pass-2026')
await page.locator('#signup-form button[type="submit"]').click()
await page.waitForTimeout(800)
const dismiss = () => page.locator('#message-dialog[open] button').first().click({ timeout: 1500 }).catch(() => {})
await dismiss() // e.g. "Account created"
await page.waitForTimeout(500)
// Sign-up may return to the login screen; log in if so.
if (!(await page.locator('#screen-menu').isVisible())) {
  if (await page.locator('#screen-signup').isVisible()) await page.click('#btn-signup-back')
  await page.fill('#login-username', 'demo_player')
  await page.fill('#login-password', 'demo-pass-2026')
  await page.locator('#login-form button[type="submit"]').click()
  await page.waitForTimeout(800)
  await dismiss()
}
await page.locator('#screen-menu').waitFor({ timeout: 5000 }).catch(async (error) => {
  await page.screenshot({ path: `${OUT}/debug.png` })
  throw error
})
await page.waitForTimeout(800)
await still(page, OUT, 'menu')

// Settings: switch to the Classic Wood board (the app's own option).
await page.click('#btn-settings')
await page.selectOption('#set-theme', 'ClassicWood')
await page.waitForTimeout(500)
await still(page, OUT, 'settings')
await page.locator('#settings-form button[type="submit"]').click()
await page.waitForTimeout(500)
await dismiss()
await page.click('#btn-settings-close').catch(() => {})
await page.locator('#screen-menu').waitFor()

async function startVsComputer(difficulty, { slow = false } = {}) {
  if (slow) await tap(page, page.locator('#btn-play-ai'))
  else await page.click('#btn-play-ai')
  await page.locator('#setup-dialog[open]').waitFor()
  await page.waitForTimeout(slow ? 600 : 100)
  await page.selectOption('#setup-difficulty', difficulty)
  await page.selectOption('#setup-bestof', '3')
  await page.waitForTimeout(slow ? 700 : 100)
  const start = page.locator('#setup-dialog button[value="start"]')
  if (slow) await tap(page, start)
  else await start.click()
  await page.locator('#screen-game').waitFor()
  await page.waitForTimeout(800)
}

// Finds a piece that has a legal move (clicking it highlights .target squares)
// and plays its first target. Returns false if no move was found.
async function playOneMove({ slow = false } = {}) {
  const squares = page.locator('.square.dark')
  const count = await squares.count()
  for (let i = count - 1; i >= 0; i--) {
    const square = squares.nth(i)
    const hasPiece = await square.evaluate((el) => /piece\s+\S/.test(el.firstElementChild?.className ?? ''))
    if (!hasPiece) continue
    await square.click()
    await page.waitForTimeout(150)
    const target = page.locator('.square.target').first()
    if (await target.count()) {
      if (slow) {
        await glide(page, square)
        await page.waitForTimeout(500)
        await glide(page, target)
        await page.waitForTimeout(400)
      }
      await target.click()
      return true
    }
  }
  return false
}

async function waitForComputer() {
  // The computer thinks in a Web Worker; wait until a piece can move again.
  await page.waitForTimeout(1200)
  await page.waitForFunction(() => !/thinking/i.test(document.querySelector('#game-turn')?.textContent ?? ''), null, { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(600)
}

// Stills: the new-match dialog, then a game in progress against the Hard AI
await page.click('#btn-play-ai')
await page.locator('#setup-dialog[open]').waitFor()
await page.selectOption('#setup-difficulty', 'Hard')
await page.selectOption('#setup-bestof', '3')
await page.waitForTimeout(400)
await still(page, OUT, 'new-match')
await page.locator('#setup-dialog button[value="cancel"]').click()
await startVsComputer('Hard')
for (let move = 0; move < 4; move++) {
  if (!(await playOneMove())) break
  await waitForComputer()
}
await still(page, OUT, 'game')

// Back to the menu for the clip
await page.click('#btn-leave')
await dismiss()
await page.locator('#screen-menu').waitFor()

// Demo clip: menu → VS Computer (Hard, best of 3) → a few moves and replies
await clip(page, OUT, 'demo', async () => {
  await page.waitForTimeout(1000)
  await startVsComputer('Hard', { slow: true })
  for (let move = 0; move < 3; move++) {
    if (!(await playOneMove({ slow: true }))) break
    await waitForComputer()
  }
  await page.waitForTimeout(1500)
})

await browser.close()
console.log('captured', OUT)
