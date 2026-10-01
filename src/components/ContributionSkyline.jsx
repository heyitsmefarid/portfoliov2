import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import { useTheme } from '../lib/theme.js'

// The last year of contributions as a 3D skyline: one bar per day, height by
// contribution count, coloured like the grid. Bars grow in the first time it
// appears; it sways slowly, and can be dragged to turn. Canvas, no library.

const FOOT = 0.36 // half the width of a bar, in grid cells
const MAX_HEIGHT = 4.4 // tallest bar, in grid cells
const PITCH = 0.95 // camera angle: 0 = top-down, higher = flatter
const DEPTH_SQUASH = Math.sin(PITCH) * 0.5 // how much the grid's depth is foreshortened
const HEIGHT_SCALE = Math.cos(PITCH) + 0.35 // how tall bars look
const SWAY = 0.18 // radians either side of the resting angle
const YAW_LIMITS = [-0.55, 0.22]

function hexToRgb(value) {
  const hex = value.trim().replace('#', '')
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function shade([r, g, b], factor) {
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`
}

function readPalette() {
  const styles = getComputedStyle(document.documentElement)
  return [0, 1, 2, 3, 4].map((level) => hexToRgb(styles.getPropertyValue(`--gh-${level}`) || '#333333'))
}

export default function ContributionSkyline({ weeks, total }) {
  const canvasRef = useRef(null)
  const theme = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = prefersReducedMotion()
    const palette = readPalette()
    const columns = weeks.length
    const maxCount = Math.max(1, ...weeks.flat().map((day) => day?.count ?? 0))

    const bars = []
    weeks.forEach((week, w) => {
      week.forEach((day, d) => {
        if (!day) return
        const height = day.count ? 0.25 + (Math.log(1 + day.count) / Math.log(1 + maxCount)) * MAX_HEIGHT : 0.06
        bars.push({ gx: w - (columns - 1) / 2, gz: d - 3, height, level: day.level, week: w })
      })
    })

    let width = 0
    let height = 0
    let unit = 10
    let frame = 0
    let visible = false
    let startTime = null
    let baseYaw = -0.28
    let yaw = baseYaw
    let dragging = null
    let lastElapsed = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Fit the grid at its widest and deepest turn, bars included
      const maxSin = Math.max(...YAW_LIMITS.map(Math.abs).map(Math.sin))
      const across = columns + 7 * maxSin
      const tall = (columns * maxSin + 7) * DEPTH_SQUASH + MAX_HEIGHT * HEIGHT_SCALE
      unit = Math.min((width * 0.94) / across, (height * 0.92) / tall)
    }

    const draw = (time) => {
      if (startTime === null) startTime = time
      const elapsed = reduced ? 1e6 : time - startTime
      lastElapsed = elapsed
      if (!dragging && !reduced) yaw = baseYaw + Math.sin(elapsed * 0.00025) * SWAY

      const cos = Math.cos(yaw)
      const sin = Math.sin(yaw)
      const cx = width / 2
      const cy = height / 2 + MAX_HEIGHT * HEIGHT_SCALE * unit * 0.42
      const sinPitch = DEPTH_SQUASH
      const cosPitch = HEIGHT_SCALE

      const project = (x, y, z) => {
        const rx = x * cos - z * sin
        const rz = x * sin + z * cos
        return [cx + rx * unit, cy + rz * unit * sinPitch - y * unit * cosPitch, rz]
      }

      // Painter's algorithm: far bars first
      const ordered = bars
        .map((bar) => ({ bar, depth: bar.gx * sin + bar.gz * cos }))
        .sort((a, b) => a.depth - b.depth)

      ctx.clearRect(0, 0, width, height)

      for (const { bar } of ordered) {
        // Grow in, week by week, the first time it appears
        const grow = Math.min(Math.max((elapsed - bar.week * 14) / 700, 0), 1)
        const eased = 1 - Math.pow(1 - grow, 3)
        const h = Math.max(0.04, bar.height * eased)
        const rgb = palette[bar.level] ?? palette[0]

        const x0 = bar.gx - FOOT
        const x1 = bar.gx + FOOT
        const z0 = bar.gz - FOOT
        const z1 = bar.gz + FOOT
        const corners = [
          [x0, z0],
          [x1, z0],
          [x1, z1],
          [x0, z1],
        ]
        const bottom = corners.map(([x, z]) => project(x, 0, z))
        const top = corners.map(([x, z]) => project(x, h, z))

        // Side faces whose outward normal points at the camera
        const faces = [
          { a: 1, b: 2, facing: sin, light: 0.62 }, // +x
          { a: 3, b: 0, facing: -sin, light: 0.62 }, // -x
          { a: 2, b: 3, facing: cos, light: 0.8 }, // +z
          { a: 0, b: 1, facing: -cos, light: 0.8 }, // -z
        ]
        for (const face of faces) {
          if (face.facing <= 0) continue
          ctx.beginPath()
          ctx.moveTo(bottom[face.a][0], bottom[face.a][1])
          ctx.lineTo(bottom[face.b][0], bottom[face.b][1])
          ctx.lineTo(top[face.b][0], top[face.b][1])
          ctx.lineTo(top[face.a][0], top[face.a][1])
          ctx.closePath()
          ctx.fillStyle = shade(rgb, face.light)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.moveTo(top[0][0], top[0][1])
        for (let i = 1; i < 4; i += 1) ctx.lineTo(top[i][0], top[i][1])
        ctx.closePath()
        ctx.fillStyle = shade(rgb, 1)
        ctx.fill()
      }
    }

    const loop = (time) => {
      draw(time)
      frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0
    }
    const start = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop)
    }

    const onDown = (event) => {
      dragging = { x: event.clientX, yaw }
      canvas.setPointerCapture(event.pointerId)
    }
    const onMove = (event) => {
      if (!dragging) return
      yaw = Math.min(Math.max(dragging.yaw + (event.clientX - dragging.x) * 0.008, YAW_LIMITS[0]), YAW_LIMITS[1])
      if (reduced) draw(performance.now())
    }
    const onUp = () => {
      if (!dragging) return
      dragging = null
      // Keep swaying around wherever it was left, without a jump
      baseYaw = yaw - Math.sin(lastElapsed * 0.00025) * SWAY
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })

    resize()
    observer.observe(canvas)
    const onResize = () => {
      resize()
      draw(performance.now())
    }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', start)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', start)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [weeks, theme])

  return (
    <canvas
      ref={canvasRef}
      className="gh__skyline"
      data-cursor="Drag"
      role="img"
      aria-label={`3D skyline of GitHub contributions: ${total.toLocaleString('en-US')} in the last year. Drag to turn it.`}
    />
  )
}
