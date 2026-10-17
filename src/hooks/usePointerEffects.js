import { useEffect } from 'react'
import { prefersReducedMotion } from './useReducedMotion.js'

const GLOW_TARGETS = '.panel, .deck__card, .tile, .cert, .gallery__item, .project-row'
const MAGNET_RADIUS = 90

// Two small pointer effects, mouse only:
//  - Glow: sets --gx / --gy on the panel or card under the cursor, so its
//    border can light up where the cursor is (see Panel.css).
//  - Magnet: elements with [data-magnetic] lean towards a nearby cursor.
//    Uses the `translate` property so it never fights their own transforms.
export function usePointerEffects(key) {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!finePointer) return

    const magnets = prefersReducedMotion() ? [] : [...document.querySelectorAll('[data-magnetic]')]
    let frame = 0
    let event = null

    const update = () => {
      frame = 0
      if (!event) return
      const { clientX: x, clientY: y, target } = event

      const glow = target instanceof Element ? target.closest(GLOW_TARGETS) : null
      if (glow) {
        const rect = glow.getBoundingClientRect()
        glow.style.setProperty('--gx', `${x - rect.left}px`)
        glow.style.setProperty('--gy', `${y - rect.top}px`)
      }

      for (const magnet of magnets) {
        const rect = magnet.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = x - cx
        const dy = y - cy
        const reach = Math.max(rect.width, rect.height) / 2 + MAGNET_RADIUS
        const distance = Math.hypot(dx, dy)
        if (distance < reach) {
          const pull = (1 - distance / reach) * 0.35
          magnet.style.translate = `${(dx * pull).toFixed(1)}px ${(dy * pull).toFixed(1)}px`
          magnet.dataset.magnet = 'on'
        } else if (magnet.dataset.magnet === 'on') {
          magnet.style.translate = ''
          magnet.dataset.magnet = 'off'
        }
      }
    }

    const onMove = (next) => {
      event = next
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      magnets.forEach((magnet) => {
        magnet.style.translate = ''
      })
    }
  }, [key])
}
