// Task 5 check: the home deck shows three cards, ← → change the front card,
// clicking the front card opens its page. Saves screenshots for review.
// Usage: node scripts/deck-check.mjs [base] [outDir]
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5191'
const OUT = process.argv[3] ?? '.superpowers/sdd/2026-10-17-project-pages'
const browser = await chromium.launch()
const fail = []

for (const [label, width, height, reducedMotion] of [
  ['desktop', 1280, 800, 'no-preference'],
  ['phone', 375, 812, 'no-preference'],
  ['reduced', 1280, 800, 'reduce'],
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion })
  await page.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
  await page.goto(BASE + '/')
  const cards = page.locator('.deck__card')
  const count = await cards.count()
  if (count !== 3) fail.push(`${label}: expected 3 deck cards, got ${count}`)
  if (count) {
    await page.locator('#projects').scrollIntoViewIfNeeded()
    await page.waitForTimeout(700)
    await page.screenshot({ path: `${OUT}/deck-${label}.png` })
  }
  if (label === 'desktop' && count === 3) {
    const frontName = async () => page.locator('.deck__card[data-offset="0"] .deck__name').textContent()
    const before = await frontName()
    await page.getByRole('button', { name: 'Next project' }).click()
    await page.waitForTimeout(600)
    const after = await frontName()
    if (before === after) fail.push('next button did not change the front card')
    await page.locator('.deck__card[data-offset="0"]').click({ position: { x: 40, y: 40 } })
    await page.waitForTimeout(400)
    if (!/\/projects\/[a-z0-9-]+$/.test(page.url())) fail.push(`front card click went to ${page.url()}`)
  }
  await page.close()
}
await browser.close()
console.log(fail.length ? fail.join('\n') : 'deck: ok')
process.exitCode = fail.length ? 1 : 0
