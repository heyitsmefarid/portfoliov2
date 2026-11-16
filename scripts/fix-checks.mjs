// Checks for the final-review fixes. Usage: node scripts/fix-checks.mjs [base]
//  1. a new page starts at the top immediately (no smooth scroll from the old position)
//  2. the demo poster stays visible while the clip loads, and a failed clip falls back to the poster
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:5191'
const browser = await chromium.launch()
const fail = []

async function open(path, viewport = { width: 1280, height: 800 }) {
  const page = await browser.newPage({ viewport })
  await page.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
  await page.goto(BASE + path)
  return page
}

// 1
{
  const page = await open('/projects')
  await page.locator('.ptable__name').last().scrollIntoViewIfNeeded()
  await page.locator('.ptable__name').last().click()
  await page.waitForTimeout(80)
  const y = await page.evaluate(() => window.scrollY)
  if (y > 50) fail.push(`1: new page started at scrollY=${y}, expected the top`)
  await page.close()
}

// 2
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
  await page.route('**/projects/bahadvisory/demo.webp', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await route.continue()
  })
  await page.goto(BASE + '/projects/bahadvisory')
  await page.waitForTimeout(1200)
  const posterShown = await page.evaluate(() =>
    [...document.querySelectorAll('.demo img')].some((img) => img.src.includes('demo-poster') && img.complete && img.naturalWidth > 0 && getComputedStyle(img).visibility !== 'hidden' && Number(getComputedStyle(img).opacity) > 0.5),
  )
  if (!posterShown) fail.push('4a: no visible poster while the clip is loading')
  await page.close()

  const broken = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await broken.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
  await broken.route('**/projects/iskonnect/demo.webp', (route) => route.abort())
  await broken.goto(BASE + '/projects/iskonnect')
  await broken.waitForTimeout(1500)
  const shown = await broken.evaluate(() => [...document.querySelectorAll('.project-page__demo img')].map((img) => img.src.split('/').pop()))
  if (!shown.includes('demo-poster.webp')) fail.push(`4b: failed clip fell back to ${shown.join(',') || 'nothing'}, expected the poster`)
  await broken.close()
}

await browser.close()
console.log(fail.length ? fail.join('\n') : 'fix checks: ok')
process.exitCode = fail.length ? 1 : 0
