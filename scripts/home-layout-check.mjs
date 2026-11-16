import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { chromium } from 'playwright'

const PORT = 4184
const BASE = `http://localhost:${PORT}`
const chromeCandidates = [
  process.env.PLAYWRIGHT_CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean)
const executablePath = chromeCandidates.find(existsSync)

const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
})

try {
  let ready = false
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(BASE)
      ready = response.ok
      if (ready) break
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }
  if (!ready) throw new Error('Vite did not start')

  const browser = await chromium.launch(executablePath ? { executablePath } : undefined)
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' })
  await page.addInitScript(() => sessionStorage.setItem('intro-seen', '1'))
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // The ID photo keeps its 4:5 shape at every width instead of stretching to
  // the height of the cells beside it.
  const photoShape = async () =>
    page.locator('.idphoto img').evaluate((img) => {
      const { width, height } = img.getBoundingClientRect()
      return height / width
    })

  const viewports = [
    { label: 'small phone', width: 320, height: 568 },
    { label: 'phone', width: 375, height: 812 },
    { label: 'large phone', width: 412, height: 915 },
    { label: 'phone breakpoint', width: 640, height: 900 },
    { label: 'above phone breakpoint', width: 641, height: 900 },
    { label: 'tablet portrait', width: 768, height: 1024 },
    { label: 'tablet breakpoint', width: 1080, height: 900 },
    { label: 'above tablet breakpoint', width: 1081, height: 900, desktop: true },
    { label: 'small laptop', width: 1280, height: 800, desktop: true },
    { label: 'laptop', width: 1440, height: 900, desktop: true, maxScreens: 2.8 },
    { label: 'wide desktop', width: 1920, height: 1080, desktop: true, maxScreens: 2.4 },
    { label: 'ultrawide desktop', width: 3440, height: 1440, desktop: true },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(150)

    const layout = await page.evaluate(() => {
      const box = (selector) => document.querySelector(selector).getBoundingClientRect()
      const outsideViewport = [...document.querySelectorAll('.binding__inner, .form, .cell, .footer__inner')].flatMap((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width && (rect.left < -1 || rect.right > window.innerWidth + 1) ? [`${element.className} (${rect.left}, ${rect.right})`] : []
      })
      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        outsideViewport,
        // Cells that must sit beside each other on a desktop form
        beside: {
          'photo / details / status': box('.cell--photo').top === box('.cell--info').top && box('.cell--info').top === box('.cell--status').top,
          'projects / about': box('.cell--projects').top === box('.cell--about').top,
          'experience / education / certifications':
            new Set(['experience', 'education', 'certifications'].map((name) => Math.round(box(`.cell--${name}`).top))).size === 1,
        },
      }
    })

    const shape = await photoShape()
    if (Math.abs(shape - 1.25) > 0.03) {
      throw new Error(`${viewport.label}: ID photo is stretched (height/width ${shape.toFixed(2)}, expected 1.25)`)
    }
    if (layout.scrollWidth > layout.viewportWidth + 1) {
      throw new Error(`${viewport.label}: home page overflows horizontally (${layout.scrollWidth}px > ${layout.viewportWidth}px)`)
    }
    if (layout.outsideViewport.length) {
      throw new Error(`${viewport.label}: content is clipped outside the viewport: ${layout.outsideViewport.join(', ')}`)
    }
    if (viewport.desktop) {
      const stacked = Object.entries(layout.beside).filter(([, ok]) => !ok).map(([name]) => name)
      if (stacked.length) throw new Error(`${viewport.label}: these cells should sit side by side: ${stacked.join('; ')}`)
    }
    // The point of the form: the whole portfolio in a few screens, not a long scroll.
    if (viewport.maxScreens && layout.pageHeight > viewport.height * viewport.maxScreens) {
      throw new Error(`${viewport.label}: home page is ${layout.pageHeight}px tall, more than ${viewport.maxScreens} screens`)
    }
  }

  await browser.close()
  console.log('home layout: photo shape, responsive widths, side-by-side cells and compact height ok')
} finally {
  server.kill()
}
