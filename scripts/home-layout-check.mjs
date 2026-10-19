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

  const responsiveViewports = [
    { label: 'small phone', width: 320, height: 568, stackedHero: true, stackedPanels: true },
    { label: 'phone', width: 375, height: 812, stackedHero: true, stackedPanels: true },
    { label: 'tablet portrait', width: 768, height: 1024, stackedHero: true, stackedPanels: true },
    { label: 'hero breakpoint', width: 820, height: 1180, stackedHero: true, stackedPanels: true },
    { label: 'above hero breakpoint', width: 821, height: 1180, stackedHero: false, stackedPanels: true },
    { label: 'large tablet portrait', width: 960, height: 1280, stackedHero: false, stackedPanels: true },
    { label: 'panel breakpoint', width: 1024, height: 1366, stackedHero: false, stackedPanels: true },
    { label: 'above panel breakpoint', width: 1025, height: 900, stackedHero: false, stackedPanels: false },
    { label: 'small laptop', width: 1280, height: 800, stackedHero: false, stackedPanels: false },
    { label: 'wide desktop', width: 1920, height: 1080, stackedHero: false, stackedPanels: false },
    { label: 'ultrawide desktop', width: 3440, height: 1440, stackedHero: false, stackedPanels: false },
  ]

  for (const viewport of responsiveViewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })

    const layout = await page.evaluate(() => {
      const rect = (selector) => {
        const box = document.querySelector(selector)?.getBoundingClientRect()
        return box ? { top: box.top, right: box.right, bottom: box.bottom, left: box.left, width: box.width } : null
      }
      const checkedSelectors = ['.hero__inner', '.page-body', '.bento', '#projects', '#github', '.duo', '.footer__inner']
      const outsideViewport = checkedSelectors.flatMap((selector) => {
        const box = rect(selector)
        return box && (box.left < -1 || box.right > window.innerWidth + 1) ? [`${selector} (${box.left}, ${box.right})`] : []
      })

      return {
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        outsideViewport,
        heroDirection: getComputedStyle(document.querySelector('.hero__inner')).flexDirection,
        reel: rect('.portfolio-reel'),
        about: rect('#about'),
        certs: rect('.duo > :first-child'),
        connect: rect('.duo > :last-child'),
      }
    })

    if (layout.scrollWidth > layout.viewportWidth + 1) {
      throw new Error(`${viewport.label}: home page overflows horizontally (${layout.scrollWidth}px > ${layout.viewportWidth}px)`)
    }
    if (layout.outsideViewport.length) {
      throw new Error(`${viewport.label}: content is clipped outside the viewport: ${layout.outsideViewport.join(', ')}`)
    }

    const heroIsStacked = layout.heroDirection === 'column'
    if (heroIsStacked !== viewport.stackedHero) {
      throw new Error(`${viewport.label}: expected hero flex-direction ${viewport.stackedHero ? 'column' : 'row'}, got ${layout.heroDirection}`)
    }

    const bentoIsStacked = layout.about.top > layout.reel.bottom + 10
    const duoIsStacked = layout.connect.top > layout.certs.top + 20
    if (bentoIsStacked !== viewport.stackedPanels || duoIsStacked !== viewport.stackedPanels) {
      throw new Error(
        `${viewport.label}: expected ${viewport.stackedPanels ? 'stacked' : 'two-column'} content panels ` +
          `(bento stacked: ${bentoIsStacked}, closing pair stacked: ${duoIsStacked})`,
      )
    }
  }

  await browser.close()
  console.log('home layout: media, packed columns, and responsive breakpoints ok')
} finally {
  server.kill()
}
