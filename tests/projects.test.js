import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { projects } from '../src/data/projects.js'

const ICONS = 'map route ai bell users chart shield book calendar card camera offline game store paw wrench clock list star'.split(' ')
const PLATFORMS = ['web', 'mobile', 'desktop', 'ai']
const publicFile = (src) => new URL(`../public${src}`, import.meta.url)

test('ids are unique url slugs', () => {
  const ids = projects.map((p) => p.id)
  assert.equal(new Set(ids).size, ids.length)
  ids.forEach((id) => assert.match(id, /^[a-z0-9-]+$/))
})

test('exactly three featured projects', () => {
  assert.equal(projects.filter((p) => p.featured).length, 3)
})

for (const project of projects) {
  test(`${project.id} has page content`, () => {
    assert.ok(project.pitch && project.pitch.length <= 110, 'pitch ≤ 110 chars')
    assert.ok(project.badges.length >= 1 && project.badges.length <= 3, '1–3 badges')
    project.badges.forEach((badge) => assert.equal(badge, badge.toUpperCase()))
    assert.ok(project.platform.length >= 1)
    project.platform.forEach((p) => assert.ok(PLATFORMS.includes(p), p))
    assert.ok(project.features.length >= 4 && project.features.length <= 6, '4–6 features')
    project.features.forEach((f) => assert.ok(ICONS.includes(f.icon), f.icon))
    assert.ok(project.build.length >= 2 && project.build.length <= 4, '2–4 build notes')
    assert.ok(Array.isArray(project.gallery))
  })

  test(`${project.id} media files exist`, () => {
    const files = [project.image?.src, ...(project.gallery ?? []).map((g) => g.src), project.demo?.src, project.demo?.poster].filter(Boolean)
    files.forEach((src) => assert.ok(existsSync(publicFile(src)), src))
    ;(project.gallery ?? []).forEach((g) => assert.ok(g.alt && g.caption && g.width && g.height, g.src))
  })
}
