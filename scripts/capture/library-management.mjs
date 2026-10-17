// Library Management System: stills + demo clip on the sample data in
// database.sql (fictional students and staff).
//
// Start (Laragon):
//   mysqld --defaults-file=C:/laragon/bin/mysql/mysql-8.0.30-winx64/my.ini
//   mysqldump -uroot --databases library_management_system > before.sql   (backup)
//   php setup/create_admin.php portfolio_shot <temp-password> "Librarian"
//   UPDATE admins SET must_change_password=0 WHERE username='portfolio_shot'
//   php -S 127.0.0.1:8090 -t .   (with pdo_mysql, see .vscode/tasks.json)
// Afterwards: restore before.sql, DELETE the portfolio_shot admin, stop 8090,
// mysqladmin -uroot shutdown.
//
// This script adds fake activity (time-ins and loans for the sample users) so
// the screens aren't empty; restoring the backup removes it.
import { chromium } from 'playwright'
import { clip, still, tap } from './lib.mjs'

const BASE = 'http://127.0.0.1:8090'
const OUT = 'scripts/capture/out/library-management'
const PASSWORD = process.env.LIB_PASSWORD

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

await page.goto(BASE + '/login.php')
await page.fill('#username', 'portfolio_shot')
await page.fill('#password', PASSWORD)
await Promise.all([page.waitForURL('**/dashboard.php'), page.press('#password', 'Enter')])

async function timeIn(idNumber, purpose, { slow = false } = {}) {
  await page.goto(BASE + '/attendance/index.php')
  const field = page.locator('input[name="id_number"]')
  if (slow) {
    await tap(page, field)
    await field.pressSequentially(idNumber, { delay: 110 })
  } else {
    await field.fill(idNumber)
  }
  await page.selectOption('#purpose', { label: purpose })
  await page.waitForTimeout(slow ? 500 : 0)
  const record = page.getByRole('button', { name: 'Record' })
  if (slow) await tap(page, record)
  else await record.click()
  await page.waitForLoadState('load')
}

async function lend(userPrefix, bookPrefix, { slow = false } = {}) {
  await page.goto(BASE + '/borrowing/create.php')
  const user = await page.locator('#user_id option').filter({ hasText: userPrefix }).first().getAttribute('value')
  const book = await page.locator('#book_id option').filter({ hasText: bookPrefix }).first().getAttribute('value')
  if (slow) await page.locator('#user_id').hover()
  await page.selectOption('#user_id', user)
  await page.waitForTimeout(slow ? 900 : 0)
  if (slow) await page.locator('#book_id').hover()
  await page.selectOption('#book_id', book)
  await page.waitForTimeout(slow ? 900 : 0)
  const confirm = page.getByRole('button', { name: 'Confirm borrowing' })
  if (slow) await tap(page, confirm)
  else await confirm.click()
  await page.waitForLoadState('load')
}

// Fake activity so the dashboard and lists have something to show.
await timeIn('2024-00002', 'Study / Reading')
await timeIn('EMP-0101', 'Research')
await lend('2024-00002', 'A Brief History of Time')
await lend('EMP-0101', 'Clean Code')

// Stills
for (const [route, name] of [
  ['/dashboard.php', 'dashboard'],
  ['/attendance/index.php', 'attendance'],
  ['/borrowing/index.php', 'borrowing'],
  ['/books/index.php', 'books'],
  ['/returning/index.php', 'returning'],
]) {
  await page.goto(BASE + route)
  await page.waitForTimeout(1200)
  await still(page, OUT, name)
}
await page.goto(BASE + '/reports/index.php')
await page.selectOption('#type', { label: 'Book Inventory Report' })
await page.getByRole('button', { name: 'Generate' }).click()
await page.waitForLoadState('load')
await page.waitForTimeout(800)
await still(page, OUT, 'reports')

// Demo clip: dashboard → time a student in → lend a book → dashboard updated
await page.goto(BASE + '/dashboard.php')
await page.waitForTimeout(800)
await clip(page, OUT, 'demo', async () => {
  await page.waitForTimeout(1200)
  await timeIn('2024-00001', 'Borrow / Return books', { slow: true })
  await page.waitForTimeout(1800)
  await lend('2024-00001', 'A Brief History of Time', { slow: true })
  await page.waitForTimeout(1800)
  await tap(page, page.getByRole('link', { name: 'Dashboard' }).first())
  await page.waitForLoadState('load')
  await page.waitForTimeout(2500)
})

await browser.close()
console.log('captured', OUT)
