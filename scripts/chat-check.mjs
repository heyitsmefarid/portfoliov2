// Task 8 check: ask the assistant about a project, click the page link in its
// answer, and expect to land on that project page without a reload.
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5191'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
await page.goto(BASE + '/')
await page.evaluate(() => {
  window.__noReload = true
})
await page.keyboard.press('Control+k')
await page.keyboard.type('tell me about studyspace')
await page.keyboard.press('Enter')
const link = page.locator('.chat__log a[href="/projects/studyspace"]').first()
await link.waitFor({ timeout: 20000 })
await link.click()
await page.waitForTimeout(500)
const ok = page.url().endsWith('/projects/studyspace') && (await page.evaluate(() => window.__noReload === true))
console.log(ok ? 'chat link: ok' : `chat link: failed (${page.url()})`)
await browser.close()
process.exitCode = ok ? 0 : 1
