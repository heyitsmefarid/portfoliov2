// Opens every route directly in Chromium at phone and desktop width and fails
// on missing headings, console errors, hidden content or sideways scrolling;
// then walks home → /projects → a project → back, and a section link from a
// project page. Usage: npm run build && npm run smoke
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
import { projects } from '../src/data/projects.js'

const PORT = 4183
const BASE = `http://localhost:${PORT}`
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' })
const failures = []

try {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE)
      break
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }
  const browser = await chromium.launch()
  const routes = ['/', '/projects', ...projects.map((p) => `/projects/${p.id}`), '/projects/nope']

  for (const [label, width, height] of [
    ['phone', 375, 812],
    ['desktop', 1280, 800],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } })
    await page.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
    const errors = []
    page.on('pageerror', (error) => errors.push(String(error)))
    // /api/* only exists on Vercel; `vite preview` answers it with 503.
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) errors.push(message.text())
    })
    page.on('response', (response) => {
      if (response.status() >= 400 && !new URL(response.url()).pathname.startsWith('/api/')) {
        errors.push(`HTTP ${response.status()} ${response.url()}`)
      }
    })

    for (const route of routes) {
      errors.length = 0
      await page.goto(BASE + route, { waitUntil: 'networkidle' })
      if (!(await page.locator('h1, h2').first().isVisible())) failures.push(`${label} ${route}: no visible heading`)
      if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) {
        failures.push(`${label} ${route}: horizontal overflow`)
      }
      if (errors.length) failures.push(`${label} ${route}: ${errors[0]}`)
    }

    // Client-side navigation and back.
    await page.goto(BASE + '/')
    await page.locator('.panel-link[href="/projects"]').click()
    await page.waitForURL('**/projects')
    await page.locator(`.project-row__name a[href="/projects/${projects[0].id}"]`).click()
    await page.waitForURL(`**/projects/${projects[0].id}`)
    // Sections fade in as they enter the viewport. After jumping to the bottom,
    // what's on screen must be visible, and scrolling back up must reveal the
    // sections the jump skipped.
    const hiddenOnScreen = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-reveal]')].some((el) => {
          const r = el.getBoundingClientRect()
          const onScreen = r.bottom > 0 && r.top < window.innerHeight
          return onScreen && Number(getComputedStyle(el).opacity) < 0.9
        }),
      )
    await page.locator('.project-page__section').last().scrollIntoViewIfNeeded()
    await page.waitForTimeout(900)
    let hidden = await hiddenOnScreen()
    for (const section of await page.locator('.project-page__section').all()) {
      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(900)
      hidden ||= await hiddenOnScreen()
    }
    if (hidden) failures.push(`${label}: on-screen content still hidden after client navigation`)
    await page.goBack()
    await page.waitForTimeout(300)
    if (!page.url().endsWith('/projects')) failures.push(`${label}: back went to ${page.url()}`)

    // Section link from a project page lands on that home section.
    await page.goto(BASE + `/projects/${projects[1].id}`)
    await page.locator('.side-index__link[href="/#projects"]').evaluate((link) => link.click())
    await page.waitForTimeout(900)
    const inView = await page.evaluate(() => {
      const section = document.getElementById('projects')
      return Boolean(section) && Math.abs(section.getBoundingClientRect().top) < 200
    })
    if (!inView) failures.push(`${label}: section link from a project page did not reach #projects`)
    await page.close()
  }
  await browser.close()
} finally {
  server.kill()
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('smoke: all routes ok')
process.exit(0)
