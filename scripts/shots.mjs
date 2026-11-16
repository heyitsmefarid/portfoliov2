// Screenshots of every page and state for reviewing design changes by eye.
// Start the dev server on port 5179 first (npx vite --port 5179), then:
//   node scripts/shots.mjs <output-prefix> [job ...]
// Jobs: homeLight homeDark homeMobile project projects overlays intro notfound (default: all).
// Paths are written relative to the current directory; use a temp folder, not the repo.
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const out = process.argv[2] || 's'
const BASE = 'http://localhost:5179/'
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(existsSync)
const browser = await chromium.launch(exe ? { executablePath: exe } : undefined)
const errors = []

async function open(path, { vp = { width: 1440, height: 900 }, scheme = 'light', intro = false, reduced = true } = {}) {
  const page = await browser.newPage({ viewport: vp, reducedMotion: reduced ? 'reduce' : 'no-preference', colorScheme: scheme })
  if (!intro) await page.addInitScript(() => { try { sessionStorage.setItem('intro-seen', '1') } catch {} })
  page.on('pageerror', (e) => errors.push(path + ': ' + e.message))
  page.on('console', (m) => m.type() === 'error' && !/503|Failed to load resource/.test(m.text()) && errors.push(path + ': ' + m.text()))
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  return page
}

async function loadAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(700)
}

const jobs = {
  async homeDark() {
    const p = await open('', { scheme: 'dark' }); await loadAll(p)
    await p.screenshot({ path: `${out}-home-dark-full.png`, fullPage: true }); await p.close()
  },
  async homeLight() {
    const p = await open(''); await loadAll(p)
    await p.screenshot({ path: `${out}-home-full.png`, fullPage: true })
    await p.screenshot({ path: `${out}-home-zoom.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } })
    await p.close()
  },
  async homeMobile() {
    const p = await open('', { vp: { width: 390, height: 844 } }); await loadAll(p)
    await p.screenshot({ path: `${out}-home-mobile-full.png`, fullPage: true }); await p.close()
  },
  async project() {
    const p = await open('projects/bahadvisory'); await loadAll(p)
    await p.screenshot({ path: `${out}-project-full.png`, fullPage: true }); await p.close()
    const m = await open('projects/bahadvisory', { vp: { width: 390, height: 844 } }); await loadAll(m)
    await m.screenshot({ path: `${out}-project-mobile-full.png`, fullPage: true }); await m.close()
  },
  async projects() {
    const p = await open('projects'); await loadAll(p)
    await p.click('text=Uses AI'); await p.waitForTimeout(400)
    await p.screenshot({ path: `${out}-projects-full.png`, fullPage: true }); await p.close()
  },
  async overlays() {
    const p = await open('')
    await p.keyboard.press('Control+k'); await p.waitForTimeout(300)
    await p.screenshot({ path: `${out}-palette.png` })
    await p.keyboard.press('Escape'); await p.waitForTimeout(200)
    await p.click('.chat__launcher'); await p.waitForTimeout(500)
    await p.screenshot({ path: `${out}-chat.png` })
    await p.click('.chat__launcher'); await p.waitForTimeout(300)
    await p.click('text=Send me a message'); await p.waitForTimeout(400)
    await p.screenshot({ path: `${out}-contact.png` })
    await p.keyboard.press('Escape'); await p.waitForTimeout(200)
    await p.evaluate(() => document.querySelector('.cert__name--link')?.scrollIntoView())
    await p.click('.cert__name--link'); await p.waitForTimeout(500)
    await p.screenshot({ path: `${out}-cert.png` })
    await p.keyboard.press('Escape'); await p.waitForTimeout(200)
    await p.keyboard.type('fred'); await p.waitForTimeout(400)
    await p.screenshot({ path: `${out}-egg.png` })
    await p.close()
  },
  async intro() {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' })
    await p.goto(BASE, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(700)
    await p.screenshot({ path: `${out}-intro.png` })
    await p.waitForTimeout(1050)
    await p.screenshot({ path: `${out}-intro-flip.png` })
    await p.waitForTimeout(2500)
    await p.screenshot({ path: `${out}-intro-after.png` })
    await p.close()
  },
  async notfound() {
    const p = await open('nope')
    await p.screenshot({ path: `${out}-404.png` }); await p.close()
  },
}

const pick = process.argv.slice(3)
for (const [name, job] of Object.entries(jobs)) {
  if (pick.length && !pick.includes(name)) continue
  try { await job() } catch (e) { errors.push(name + ' FAILED: ' + e.message.split('\n')[0]) }
}
await browser.close()
console.log(errors.length ? errors.join('\n') : 'no errors')
