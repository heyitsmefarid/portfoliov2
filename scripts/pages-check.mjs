// Task 6–7 check: the /projects list and its filters, and every project page.
// Usage: node scripts/pages-check.mjs [list|project|all] [base] [outDir]
import { chromium } from 'playwright'
import { projects } from '../src/data/projects.js'

const WHAT = process.argv[2] ?? 'all'
const BASE = process.argv[3] ?? 'http://localhost:5191'
const OUT = process.argv[4] ?? '.superpowers/sdd/2026-10-17-project-pages'
const browser = await chromium.launch()
const fail = []

async function open(path, width = 1280, height = 800) {
  const page = await browser.newPage({ viewport: { width, height } })
  await page.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
  await page.goto(BASE + path)
  return page
}

if (WHAT !== 'project') {
  for (const [label, width] of [['desktop', 1280], ['phone', 375]]) {
    const page = await open('/projects', width, 800)
    const rows = await page.locator('.project-row').count()
    if (rows !== projects.length) fail.push(`${label} /projects: ${rows} rows, expected ${projects.length}`)
    const expected = { Mobile: projects.filter((p) => p.platform.includes('mobile')).length, AI: projects.filter((p) => p.platform.includes('ai')).length }
    for (const [name, n] of Object.entries(expected)) {
      await page.getByRole('button', { name, exact: true }).click({ timeout: 3000 }).catch(() => {})
      const shown = await page.locator('.project-row').count()
      if (shown !== n) fail.push(`${label} filter ${name}: ${shown} rows, expected ${n}`)
    }
    await page.getByRole('button', { name: 'All', exact: true }).click({ timeout: 3000 }).catch(() => {})
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) fail.push(`${label} /projects: sideways scroll`)
    await page.screenshot({ path: `${OUT}/list-${label}.png`, fullPage: label === 'desktop' })
    if (label === 'desktop') {
      await page.locator('.project-row__name a').first().click()
      await page.waitForTimeout(300)
      if (!page.url().endsWith(`/projects/${projects[0].id}`)) fail.push(`row link went to ${page.url()}`)
    }
    await page.close()
  }
}

if (WHAT !== 'list') {
  for (const project of projects) {
    const page = await open(`/projects/${project.id}`)
    const title = await page.locator('h1').first().textContent().catch(() => '')
    if (title !== project.name) fail.push(`/projects/${project.id}: h1 "${title}"`)
    const features = await page.locator('.feature').count()
    if (features !== project.features.length) fail.push(`/projects/${project.id}: ${features} features`)
    if ((await page.title()) !== `${project.name} — Fred Anthony Gallano`) fail.push(`/projects/${project.id}: title "${await page.title()}"`)
    if (project.id === 'bahadvisory') await page.screenshot({ path: `${OUT}/page-desktop.png`, fullPage: true })
    await page.close()
  }
  const phone = await open('/projects/bahadvisory', 375, 812)
  if (await phone.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) fail.push('phone project page: sideways scroll')
  await phone.screenshot({ path: `${OUT}/page-phone.png`, fullPage: true })
  await phone.close()
  const missing = await open('/projects/nope')
  if ((await missing.locator('h1').first().textContent()) !== '404') fail.push('/projects/nope is not a 404')
  await missing.close()
}

await browser.close()
console.log(fail.length ? fail.join('\n') : `pages (${WHAT}): ok`)
process.exitCode = fail.length ? 1 : 0
