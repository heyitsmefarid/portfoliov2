import { useEffect, useMemo, useRef, useState } from 'react'
import { sections } from '../data/sections.js'
import { projects } from '../data/projects.js'
import { profile } from '../data/profile.js'
import { navigate } from '../lib/router.js'
import { getTheme, toggleTheme } from '../lib/theme.js'
import './CommandPalette.css'

// Site navigation in place of a top bar: press ⌘K / Ctrl+K or "/" (or the
// Menu button), type to filter, arrows to move, Enter to go.

const STATIC_ITEMS = [
  ...sections.map((section) => ({
    id: `go-${section.id}`,
    group: 'Go to',
    label: section.label,
    hint: 'on this page',
    run: () => navigate(`/#${section.id}`),
  })),
  {
    id: 'all-projects',
    group: 'Projects',
    label: 'All projects',
    hint: '/projects',
    run: () => navigate('/projects'),
  },
  ...projects.map((project) => ({
    id: `project-${project.id}`,
    group: 'Projects',
    label: project.name,
    hint: project.subtitle,
    run: () => navigate(`/projects/${project.id}`),
  })),
  {
    id: 'github',
    group: 'Links',
    label: 'GitHub profile',
    hint: `github.com/${profile.contact.githubUsername}`,
    run: () => window.open(profile.contact.github, '_blank', 'noopener,noreferrer'),
  },
  {
    id: 'top',
    group: 'Links',
    label: 'Back to top',
    hint: 'top',
    run: () => window.scrollTo({ top: 0 }),
  },
  {
    id: 'theme',
    group: 'Settings',
    get label() {
      return getTheme() === 'dark' ? 'Switch to the light form' : 'Switch to the carbon copy'
    },
    hint: 'theme',
    run: () => toggleTheme(),
  },
]

function matches(item, query) {
  const haystack = `${item.label} ${item.hint} ${item.group}`.toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

function isTypingTarget(target) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

export default function CommandPalette({ open, onOpenChange }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const returnFocus = useRef(null)

  const items = useMemo(() => {
    const trimmed = query.trim()
    const found = trimmed ? STATIC_ITEMS.filter((item) => matches(item, trimmed)) : STATIC_ITEMS
    return found
  }, [query])

  // Global shortcuts: ⌘K / Ctrl+K toggles, "/" opens (unless typing somewhere).
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange(!open)
      } else if (event.key === '/' && !open && !isTypingTarget(event.target)) {
        event.preventDefault()
        onOpenChange(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  // Opening: remember focus, lock scroll, focus the input. Closing: restore.
  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = ''
    }
  }, [open])

  // Keep the active option scrolled into view.
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, items])

  if (!open) return null

  const close = ({ restoreFocus = true } = {}) => {
    onOpenChange(false)
    setQuery('')
    setActiveIndex(0)
    if (restoreFocus) returnFocus.current?.focus?.()
  }

  const choose = (item) => {
    close({ restoreFocus: false })
    // Run after the menu is gone so scrolling and focus land correctly.
    requestAnimationFrame(() => item.run())
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % items.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + items.length) % items.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(items.length - 1)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (items[activeIndex]) choose(items[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'Tab') {
      // Only the input takes focus; options are chosen with the arrow keys.
      event.preventDefault()
    }
  }

  const active = items[activeIndex]

  return (
    <div className="palette" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div className="palette__panel slip" role="dialog" aria-modal="true" aria-label="Command menu">
        <div className="palette__search">
          <svg className="palette__prompt" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5.3-2.2L21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="palette__input"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={active ? `palette-${active.id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search sections and projects"
            placeholder="Go to a section or project…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck="false"
          />
          <button type="button" className="palette__esc" onClick={() => close()} aria-label="Close menu">
            esc
          </button>
        </div>

        <ul id="palette-list" className="palette__list" role="listbox" ref={listRef} aria-label="Results">
          {items.map((item, index) => {
            // A group heading before the first item of each group
            const header = item.group !== items[index - 1]?.group ? item.group : null
            return [
              header && (
                <li key={`group-${header}`} className="palette__group" role="presentation">
                  {header}
                </li>
              ),
              <li
                key={item.id}
                id={`palette-${item.id}`}
                className="palette__option"
                role="option"
                aria-selected={index === activeIndex}
                onMouseMove={() => index !== activeIndex && setActiveIndex(index)}
                onClick={() => choose(item)}
              >
                <span className="palette__label">{item.label}</span>
                <span className="palette__hint">{item.hint}</span>
              </li>,
            ]
          })}
        </ul>

        <p className="palette__footer" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
        </p>
      </div>
    </div>
  )
}
