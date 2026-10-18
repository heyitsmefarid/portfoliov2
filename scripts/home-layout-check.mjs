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

  const reel = page.locator('.bento__column--primary > .portfolio-reel > video')
  if ((await reel.count()) !== 1) throw new Error('The left column must contain one standalone portfolio reel')
  if (!(await reel.isVisible())) throw new Error('Portfolio reel is not visible')
  if ((await page.locator('#experience video').count()) !== 0) throw new Error('Portfolio reel must not be inside Experience')

  const reelContract = await reel.evaluate((video) => ({
    controls: video.controls,
    downloadDisabled: video.controlsList.contains('nodownload'),
    preload: video.preload,
    src: new URL(video.currentSrc || video.src).pathname,
    poster: new URL(video.poster, window.location.href).pathname,
    aboveExperience: video.closest('.portfolio-reel')?.nextElementSibling?.id === 'experience',
    hasFallbackLink: Boolean(video.querySelector('a[href]')),
  }))
  if (!reelContract.controls) throw new Error('Experience reel must expose playback controls')
  if (!reelContract.downloadDisabled) throw new Error('Portfolio reel must hide the native download control')
  if (reelContract.hasFallbackLink) throw new Error('Portfolio reel must not expose a fallback download link')
  if (reelContract.preload !== 'metadata') throw new Error('Experience reel must preload metadata only')
  if (reelContract.src !== '/profile/portfolio-walkthrough.mp4') throw new Error(`Unexpected video source: ${reelContract.src}`)
  if (reelContract.poster !== '/profile/portfolio-walkthrough-poster.png') {
    throw new Error(`Unexpected poster source: ${reelContract.poster}`)
  }
  if (!reelContract.aboveExperience) throw new Error('Portfolio reel must appear directly above Experience')

  const contextMenuBlocked = await reel.evaluate((video) => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    video.dispatchEvent(event)
    return event.defaultPrevented
  })
  if (!contextMenuBlocked) throw new Error('Portfolio reel must block its context menu')

  const mediaResponses = await Promise.all([
    page.request.get(`${BASE}${reelContract.src}`),
    page.request.get(`${BASE}${reelContract.poster}`),
  ])
  if (mediaResponses.some((response) => !response.ok())) throw new Error('Experience reel media is missing')

  const boxes = await page.evaluate(() => {
    const box = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect()
      return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
    }
    return {
      reel: box('.portfolio-reel'),
      experience: box('#experience'),
      education: box('#education'),
      about: box('#about'),
      stack: box('#stack'),
    }
  })
  const near = (a, b, tolerance = 2) => Math.abs(a - b) <= tolerance
  if (!near(boxes.experience.left, boxes.education.left) || !near(boxes.about.left, boxes.stack.left)) {
    throw new Error('Desktop panels are not grouped into stable left and right columns')
  }
  if (!near(boxes.experience.right - boxes.experience.left, boxes.about.right - boxes.about.left)) {
    throw new Error('Desktop panel columns must have equal widths')
  }
  if (!near(boxes.reel.right - boxes.reel.left, boxes.experience.right - boxes.experience.left)) {
    throw new Error('Portfolio reel must match the left column width')
  }
  if (!near(boxes.education.top - boxes.experience.bottom, 14) || !near(boxes.stack.top - boxes.about.bottom, 14)) {
    throw new Error(
      `Desktop columns must pack panels with a 14px gap (left ${boxes.education.top - boxes.experience.bottom}, right ${boxes.stack.top - boxes.about.bottom})`,
    )
  }
  if (!near(boxes.education.bottom, boxes.stack.bottom)) {
    throw new Error(`Education and Tech Stack must share a bottom edge (${boxes.education.bottom} vs ${boxes.stack.bottom})`)
  }

  await page.setViewportSize({ width: 375, height: 812 })
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) {
    throw new Error('Home page overflows horizontally on mobile')
  }

  await browser.close()
  console.log('home layout: standalone reel and equal packed columns ok')
} finally {
  server.kill()
}
