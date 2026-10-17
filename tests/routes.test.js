import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseRoute, shouldHandleClick } from '../src/lib/routes.js'

test('parses the three route shapes', () => {
  assert.deepEqual(parseRoute('/'), { name: 'home' })
  assert.deepEqual(parseRoute('/projects'), { name: 'projects' })
  assert.deepEqual(parseRoute('/projects/studyspace'), { name: 'project', id: 'studyspace' })
})

test('ignores trailing slashes', () => {
  assert.deepEqual(parseRoute('/projects/'), { name: 'projects' })
  assert.deepEqual(parseRoute('/projects/meu-gear-up/'), { name: 'project', id: 'meu-gear-up' })
})

test('anything else is not found', () => {
  assert.deepEqual(parseRoute('/about'), { name: 'notFound' })
  assert.deepEqual(parseRoute('/projects/a/b'), { name: 'notFound' })
  assert.deepEqual(parseRoute('/projects/Bad_ID'), { name: 'notFound' })
})

const click = (overrides = {}) => ({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, ...overrides })
const anchor = (overrides = {}) => ({ target: '', hasAttribute: () => false, origin: 'https://x.dev', ...overrides })

test('handles plain left clicks on same-origin links', () => {
  assert.equal(shouldHandleClick(click(), anchor(), 'https://x.dev'), true)
})

test('leaves modified, middle, targeted, download and external clicks to the browser', () => {
  for (const key of ['metaKey', 'ctrlKey', 'shiftKey', 'altKey']) {
    assert.equal(shouldHandleClick(click({ [key]: true }), anchor(), 'https://x.dev'), false, key)
  }
  assert.equal(shouldHandleClick(click({ button: 1 }), anchor(), 'https://x.dev'), false)
  assert.equal(shouldHandleClick(click({ defaultPrevented: true }), anchor(), 'https://x.dev'), false)
  assert.equal(shouldHandleClick(click(), anchor({ target: '_blank' }), 'https://x.dev'), false)
  assert.equal(shouldHandleClick(click(), anchor({ hasAttribute: (name) => name === 'download' }), 'https://x.dev'), false)
  assert.equal(shouldHandleClick(click(), anchor({ origin: 'https://github.com' }), 'https://x.dev'), false)
})
