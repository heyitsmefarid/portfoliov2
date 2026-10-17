// Guhit Arts Center: stills + demo clip. There is no backend: all data is the
// app's own simulated sample data in the browser, and the logins used are the
// app's built-in demo accounts (src/data/credentials.js).
//
// Start (Desktop/BIPROJ/guhit-arts-center): npx vite --port 5182 --strictPort
// Stop afterwards: whatever listens on 5182.
import { chromium } from 'playwright'
import { clip, glide, still, tap } from './lib.mjs'

const BASE = 'http://localhost:5182'
const OUT = 'scripts/capture/out/guhit-arts'

const browser = await chromium.launch()

async function newPage() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  return context.newPage()
}

async function login(page, path, email, password, landing) {
  await page.goto(BASE + path)
  await page.getByPlaceholder('you@email.com').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Login', exact: true }).click()
  await page.waitForURL(landing)
  await page.waitForTimeout(1500)
}

async function studio(page) {
  await page.getByRole('heading', { name: 'Try your idea on something real' }).scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -40))
  await page.waitForTimeout(800)
}

async function pick(page, group, value) {
  await page.locator(`input[name="studio-${group}"][value="${value}"]`).check({ force: true })
}

// Landing + studio
const page = await newPage()
await page.goto(BASE + '/', { waitUntil: 'load' })
await page.waitForTimeout(2500)
await still(page, OUT, 'home')

await studio(page)
await page.locator('#studio-main').fill('FRED')
await page.locator('#studio-sub').fill('Portfolio 2026')
await pick(page, 'item', 'shirt')
await pick(page, 'color', 'black')
await pick(page, 'ink', 'yellow')
await page.getByRole('button', { name: 'Print it' }).click()
await page.waitForTimeout(2500)
await still(page, OUT, 'studio')

// Customer: shop and order tracking (demo customer account)
const customer = await newPage()
await login(customer, '/login', 'demo@guhitarts.ph', 'guhit1979', '**/app**')
await customer.goto(BASE + '/app/shop')
await customer.waitForTimeout(1500)
await still(customer, OUT, 'shop')
await customer.goto(BASE + '/app/orders')
await customer.waitForTimeout(1500)
await still(customer, OUT, 'orders')

// Admin: dashboard and reports (demo administrator account)
const admin = await newPage()
await login(admin, '/admin/login', 'admin@guhitarts.ph', 'admin1979', '**/admin**')
// Let the "Welcome back" toast clear before the screenshot.
await admin.getByText('Welcome back', { exact: false }).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
await admin.waitForTimeout(500)
await still(admin, OUT, 'admin')
await admin.goto(BASE + '/admin/reports')
await admin.waitForTimeout(2000)
await still(admin, OUT, 'reports')

// Demo clip: the design studio — type a name, switch products and colors, print
const demo = await newPage()
await demo.goto(BASE + '/', { waitUntil: 'load' })
await demo.waitForTimeout(2000)
await studio(demo)
await clip(demo, OUT, 'demo', async () => {
  await demo.waitForTimeout(900)
  const field = demo.locator('#studio-main')
  await tap(demo, field)
  await field.fill('')
  await field.pressSequentially('FRED', { delay: 160 })
  await demo.waitForTimeout(600)
  for (const [product, color, ink] of [
    ['mug', 'white', 'magenta'],
    ['shirt', 'black', 'yellow'],
    ['pin', 'white', 'cyan'],
  ]) {
    const label = demo.locator(`label:has(input[name="studio-item"][value="${product}"])`).first()
    if (await label.count()) await glide(demo, label)
    await pick(demo, 'item', product)
    await demo.waitForTimeout(700)
    await pick(demo, 'color', color)
    await pick(demo, 'ink', ink)
    await demo.waitForTimeout(500)
    await tap(demo, demo.getByRole('button', { name: 'Print it' }))
    await demo.waitForTimeout(1800)
  }
})

await browser.close()
console.log('captured', OUT)
