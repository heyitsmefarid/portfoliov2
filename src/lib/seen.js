import { useSyncExternalStore } from 'react'

// Which project pages this visitor has opened, kept in their browser only.
// The projects table stamps those rows "Seen".
const KEY = 'seen-projects'
const listeners = new Set()
let cache = null

function read() {
  if (cache) return cache
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(cache)) cache = []
  } catch {
    cache = []
  }
  return cache
}

export function markSeen(id) {
  const seen = read()
  if (seen.includes(id)) return
  cache = [...seen, id]
  try {
    localStorage.setItem(KEY, JSON.stringify(cache))
  } catch {
    // Storage blocked: the stamp just lasts for this visit.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const EMPTY = []

export function useSeen() {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}
