// TailFinder: stills + demo clip from the repo's static portfolio build
// (dist/, rendered from static-build/demo_seed.sql: fictional people and the
// pet photos in uploads/; demo.js stands in for the server).
//
// Start (Desktop/tailfinder-master): python -m http.server 5184 --directory dist
// Stop afterwards: whatever listens on 5184.
import { chromium } from 'playwright'
import { clip, still } from './lib.mjs'

const BASE = 'http://localhost:5184'
const OUT = 'scripts/capture/out/tailfinder'
const CANDIDATES = process.argv.includes('--candidates')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

async function open(path) {
  await page.goto(BASE + path, { waitUntil: 'load' })
  await page.waitForTimeout(1500)
}

const shots = CANDIDATES
  ? [
      ['/index.html', 'home'],
      ['/adopter/home.html', 'adopter-home'],
      ['/adopter/browse.html', 'browse'],
      ['/adopter/adoption_request.html', 'my-requests'],
      ['/adopter/messages.html', 'messages'],
      ['/admin/index.html', 'admin'],
      ['/admin/pet.html', 'pets'],
      ['/admin/adoption_request.html', 'requests'],
      ['/admin/report_adoptions.html', 'report'],
      ['/admin/manage_users.html', 'users'],
    ]
  : JSON.parse(process.env.SHOTS)

for (const [path, name] of shots) {
  await open(path)
  await still(page, OUT, name)
}

if (!CANDIDATES) {
  // Demo clip: landing → browse pets → admin requests → adoption report
  await open('/index.html')
  await clip(page, OUT, 'demo', async () => {
    await page.waitForTimeout(1500)
    await page.mouse.wheel(0, 450)
    await page.waitForTimeout(1300)
    await open('/adopter/browse.html')
    await page.waitForTimeout(800)
    await page.mouse.wheel(0, 350)
    await page.waitForTimeout(1500)
    await open('/admin/index.html')
    await page.waitForTimeout(1800)
    await open('/admin/adoption_request.html')
    await page.waitForTimeout(1800)
    await open('/admin/report_adoptions.html')
    await page.waitForTimeout(2200)
  })
}

await browser.close()
console.log('captured', OUT)
