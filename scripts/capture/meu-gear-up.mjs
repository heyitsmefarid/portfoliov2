// MEU Gear Up: stills + demo clip from the repo's static portfolio build
// (dist/, rendered from a demo database; demo.js stands in for the server and
// nothing can be saved).
//
// Start (Desktop/meu_gearup-master): python -m http.server 5183 --directory dist
// Stop afterwards: whatever listens on 5183.
import { chromium } from 'playwright'
import { clip, still } from './lib.mjs'

const BASE = 'http://localhost:5183'
const OUT = 'scripts/capture/out/meu-gear-up'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

async function open(path) {
  await page.goto(BASE + path, { waitUntil: 'load' })
  await page.waitForTimeout(1500)
}

for (const [path, name] of [
  ['/index.html', 'home'],
  ['/user/book.html', 'booking'],
  ['/admin/index.html', 'admin'],
  ['/admin/transfer.html', 'transfer'],
  ['/admin/sales_report.html', 'sales'],
  ['/admin/inventory.html', 'inventory'],
]) {
  await open(path)
  await still(page, OUT, name)
}

// Demo clip: customer side → admin dashboard → stock transfer → sales report
await open('/index.html')
await clip(page, OUT, 'demo', async () => {
  await page.waitForTimeout(1500)
  await page.mouse.wheel(0, 500)
  await page.waitForTimeout(1200)
  await open('/user/book.html')
  await page.waitForTimeout(1500)
  await open('/admin/index.html')
  await page.waitForTimeout(1800)
  await page.mouse.wheel(0, 450)
  await page.waitForTimeout(1500)
  // The sidebar links sit in collapsed menus, so go to the pages directly.
  await open('/admin/transfer.html')
  await page.waitForTimeout(1800)
  await open('/admin/sales_report.html')
  await page.waitForTimeout(1200)
  await page.mouse.wheel(0, 300)
  await page.waitForTimeout(2000)
})

await browser.close()
console.log('captured', OUT)
