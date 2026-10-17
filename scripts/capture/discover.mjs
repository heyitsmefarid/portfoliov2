// Prints what's on each route (title, headings, buttons, inputs, links) so a
// capture script can use real labels. Usage: node scripts/capture/discover.mjs <base> <route>...
import { chromium } from 'playwright'

const [base, ...routes] = process.argv.slice(2)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
for (const route of routes) {
  // Not 'networkidle': apps with live listeners (Firestore, maps) never go idle.
  await page.goto(base + route, { waitUntil: 'load' }).catch(() => {})
  await page.waitForTimeout(3000)
  const info = await page.evaluate(() => {
    const text = (el) => (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 50)
    const pick = (selector) => [...new Set([...document.querySelectorAll(selector)].filter((el) => el.offsetParent !== null).map(text).filter(Boolean))].slice(0, 25)
    return {
      url: location.pathname + location.search,
      title: document.title,
      headings: pick('h1, h2, h3'),
      buttons: pick('button, [role="button"]'),
      inputs: pick('input, select, textarea'),
      links: pick('a[href^="/"]'),
    }
  })
  console.log(`\n== ${route} → ${info.url} | ${info.title}`)
  for (const [key, values] of Object.entries(info)) if (Array.isArray(values)) console.log(`${key}: ${values.join(' | ')}`)
}
await browser.close()
