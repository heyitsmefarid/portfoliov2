import { useEffect, useMemo, useRef, useState } from 'react'
import { sections, sectionNumber } from '../data/sections.js'
import { projects } from '../data/projects.js'
import { profile } from '../data/profile.js'
import { useAskAssistant } from '../lib/assistantContext.js'
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
    hint: sectionNumber(section.id),
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
    hint: '↑',
    run: () => window.scrollTo({ top: 0 }),
  },
  {
    id: 'theme',
    group: 'Settings',
    get label() {
      return getTheme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
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
  const ask = useAskAssistant()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const returnFocus = useRef(null)

  const items = useMemo(() => {
    const trimmed = query.trim()
    const found = trimmed ? STATIC_ITEMS.filter((item) => matches(item, trimmed)) : STATIC_ITEMS
    const askItem = {
      id: 'ask',
      group: 'Assistant',
      label: trimmed ? `Ask: “${trimmed}”` : 'Ask the portfolio assistant',
      hint: '↵',
      run: () => ask(trimmed || undefined),
    }
    return [...found, askItem]
  }, [query, ask])

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
  let previousGroup = null

  return (
    <div className="palette" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div className="palette__panel" role="dialog" aria-modal="true" aria-label="Command menu">
        <div className="palette__search">
          <span className="palette__prompt" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={inputRef}
            className="palette__input"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={active ? `palette-${active.id}` : undefined}
            aria-autocomplete="list"
            aria-label="Search sections and projects, or type a question"
            placeholder="Go to a section, or ask…"
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
            const header = item.group !== previousGroup ? item.group : null
            previousGroup = item.group
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
