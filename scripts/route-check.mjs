// Task 2 check: a direct 404 route, then a section link from that page.
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5191'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
await page.goto(BASE + '/projects/nope')
console.log('h1:', await page.locator('h1').first().textContent({ timeout: 3000 }).catch(() => 'none'))
await page.locator('.side-index__link').nth(4).evaluate((link) => link.click())
await page.waitForTimeout(900)
console.log('url:', page.url())
console.log('#projects in view:', await page.evaluate(() => {
  const el = document.getElementById('projects')
  return Boolean(el) && Math.abs(el.getBoundingClientRect().top) < 200
}))
await browser.close()
