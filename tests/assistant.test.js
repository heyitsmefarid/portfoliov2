import { test } from 'node:test'
import assert from 'node:assert/strict'
import { answerLocally } from '../src/lib/localAssistant.js'
import { buildPortfolioContext } from '../src/lib/knowledge.js'
import { splitInternalLinks } from '../src/lib/chatLinks.js'

test('offline answers about a project link to its page', () => {
  assert.match(answerLocally('tell me about studyspace'), /\/projects\/studyspace\b/)
})

test('the AI context names each project page', () => {
  assert.match(buildPortfolioContext(), /Page in this portfolio: \/projects\/bahadvisory\b/)
})

test('finds /projects paths in text, leaving full URLs alone', () => {
  assert.deepEqual(splitInternalLinks('See /projects/studyspace.'), ['See ', { path: '/projects/studyspace' }, '.'])
  assert.deepEqual(splitInternalLinks('Live: https://x.dev/projects/a'), ['Live: https://x.dev/projects/a'])
  assert.deepEqual(splitInternalLinks('All at /projects'), ['All at ', { path: '/projects' }])
})
