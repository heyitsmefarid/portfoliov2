// Helpers for the per-project capture scripts: stills are PNG screenshots,
// clips are timed JPEG frames (+ frames.json) that encode.py turns into an
// animated WebP.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'

export async function openBrowser({ width = 1280, height = 800, colorScheme = 'dark' } = {}) {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width, height }, colorScheme })
  const page = await context.newPage()
  return { browser, context, page }
}

export async function still(page, outDir, name) {
  mkdirSync(outDir, { recursive: true })
  await page.screenshot({ path: join(outDir, `${name}.png`) })
}

// Screenshots as fast as the page allows (≈ fps) while `steps` runs.
export async function clip(page, outDir, name, steps, { fps = 8 } = {}) {
  const dir = join(outDir, name)
  mkdirSync(dir, { recursive: true })
  const frames = []
  let running = true
  const started = Date.now()
  const grab = (async () => {
    while (running) {
      const at = Date.now()
      const file = `${String(frames.length).padStart(4, '0')}.jpg`
      await page.screenshot({ path: join(dir, file), type: 'jpeg', quality: 85 })
      frames.push({ file, ms: at - started })
      const wait = 1000 / fps - (Date.now() - at)
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
    }
  })()
  try {
    await steps(page)
  } finally {
    running = false
    await grab
  }
  writeFileSync(join(dir, 'frames.json'), JSON.stringify(frames))
}

// Moves the mouse in visible steps so clips show where the click happens.
export async function glide(page, locator) {
  const box = await locator.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 })
}

// Glide to an element, pause so viewers can see it, then click.
export async function tap(page, locator, pause = 350) {
  await glide(page, locator)
  await page.waitForTimeout(pause)
  await locator.click()
}
