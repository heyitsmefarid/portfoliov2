# Project Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scroll-stacked project list with an 800k.dev-style fanned deck, an "All projects" page and a page per project, filled with real screenshots and demo clips captured from each app running locally on fake data.

**Architecture:** A tiny History-API router (`src/lib/routes.js` pure parser + `src/lib/router.jsx` hooks/Link) swaps the page body in `App.jsx` while the shared chrome stays mounted. All project content comes from `src/data/projects.js`. Media is captured by Playwright scripts in `scripts/capture/` and encoded by a PIL script into `public/projects/<id>/`.

**Tech Stack:** React 19, Vite 8, plain CSS with the existing tokens, Node's built-in test runner, Playwright 1.63.0 (dev only), Python 3.11 + Pillow 12 (already installed) for encoding.

**Spec:** `docs/superpowers/specs/2026-10-17-project-pages-design.md`

## Global Constraints

- Keep the portfolio's theme: tokens from `src/styles/global.css` only (`--accent`, `--panel`, `--panel-line`, `--chip-bg`, `--font-mono`, …). No new colors outside tokens.
- No new runtime dependency. Dev-only: `playwright@1.63.0` (same version as the browsers already cached in `%LOCALAPPDATA%\ms-playwright`).
- Badges must be true. No awards, rankings or claims not backed by the project's own README/STATUS.
- Every screenshot/clip comes from an app running locally on fake or demo data. Never the real StudySpace Supabase, never real ISKONNECT student data.
- Temporary accounts created for capture are deleted, and every server/emulator started for capture is stopped, in the same task.
- Media size: ≤ 150 KB per still (WebP), ≤ 2 MB per animated WebP clip.
- Reduced motion (`prefers-reduced-motion: reduce`): no autoplay, no fan animation, deck becomes a static row.
- Routes: `/`, `/projects`, `/projects/<id>`; anything else renders the not-found page.
- Commit messages: imperative sentence, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Don't push until Fred has seen the screenshots in Task 9.

## Review Focus

- Opening `/projects/studyspace` directly (fresh tab, refresh) must render the page, not a Vercel 404 → covered by `vercel.json` (Task 1) and the smoke test's direct loads (Task 9).
- Clicking a section in the side index or command palette while on a project page must land on that section of the home page → test in Task 2 (smoke step "section link from project page").
- `[data-reveal]` content on a page reached by client navigation must become visible (the reveal observer only ran once before) → test in Task 2 (smoke checks headings are visible, opacity > 0.9).
- Ctrl/Cmd-click or middle-click on an internal link must open a new tab, not navigate in place → unit test of `shouldHandleClick` in Task 1.
- `/projects/unknown-id` and trailing slashes (`/projects/`) must behave (not-found page / list page) → unit tests in Task 1.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/routes.js` | Pure: `parseRoute(pathname)`, `shouldHandleClick(event, anchor)`. Unit-tested. |
| `src/lib/router.jsx` | `usePathname()`, `useRoute()`, `navigate(href)`, `<Link>`. |
| `src/pages/HomePage.jsx` | Today's home content moved out of `App.jsx`. |
| `src/pages/ProjectsPage.jsx/.css` | `/projects`. |
| `src/pages/ProjectPage.jsx/.css` | `/projects/<id>`. |
| `src/pages/NotFoundPage.jsx` | Unknown routes. |
| `src/components/ProjectDeck.jsx/.css` | Home fanned deck. |
| `src/components/Badge.jsx/.css` | Pill used by deck, list and page. |
| `src/components/FeatureIcon.jsx` | Small inline icon set used by feature cards. |
| `src/components/DemoPlayer.jsx/.css` | Laptop-framed animated WebP with play/pause. |
| `src/components/Gallery.jsx/.css` | Screenshot grid + `<dialog>` lightbox. |
| `src/components/LaptopShot.jsx` | The laptop frame markup reused by deck, list, page (CSS stays in `Projects.css`, renamed `Laptop.css`). |
| `src/data/projects.js` | All project content (new fields). |
| `tests/routes.test.js`, `tests/projects.test.js` | `node --test`. |
| `scripts/smoke.mjs` | Playwright smoke test against `vite preview`. |
| `scripts/capture/lib.mjs` | Capture helpers (launch, stills, clip frames). |
| `scripts/capture/<id>.mjs` | One capture script per project. |
| `scripts/capture/encode.py` | PNG/JPEG frames → WebP stills + animated WebP. |
| `vercel.json` | SPA rewrite. |

Removed at the end of Task 5: `src/components/ProjectCard.jsx`, `src/hooks/useStackedCards.js`.

---

## Phase 1 — Pages

### Task 1: Router, routes tests and SPA rewrite

**Files:**
- Create: `src/lib/routes.js`, `src/lib/router.jsx`, `tests/routes.test.js`, `vercel.json`
- Modify: `package.json` (add `test` script), `eslint.config.js` only if it rejects `tests/` (Node globals)

**Interfaces:**
- Produces: `parseRoute(pathname) → { name: 'home'|'projects'|'project'|'notFound', id?: string }`; `shouldHandleClick(event, anchor) → boolean`; `usePathname() → string`; `useRoute() → route`; `navigate(href: string) → void`; `<Link href ...anchorProps>`.

- [ ] **Step 1: Write the failing tests** — `tests/routes.test.js`

```js
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
```

- [ ] **Step 2: Add the test script and run it** — in `package.json` scripts add `"test": "node --test \"tests/*.test.js\""`.

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/routes.js'`.

- [ ] **Step 3: Implement** — `src/lib/routes.js`

```js
// URL → page. Pure so it can be unit-tested with `npm test`.
//   /                  home
//   /projects          all projects
//   /projects/<id>     one project (id: lowercase letters, digits, dashes)
export function parseRoute(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return { name: 'home' }
  if (path === '/projects') return { name: 'projects' }
  const match = /^\/projects\/([a-z0-9-]+)$/.exec(path)
  if (match) return { name: 'project', id: match[1] }
  return { name: 'notFound' }
}

// True when a click on `anchor` should be handled in-app instead of by the
// browser: plain left click, same origin, no target/download.
export function shouldHandleClick(event, anchor, currentOrigin) {
  if (event.defaultPrevented || event.button !== 0) return false
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false
  if (anchor.target || anchor.hasAttribute('download')) return false
  return anchor.origin === currentOrigin
}
```

`src/lib/router.jsx`

```jsx
import { useMemo, useSyncExternalStore } from 'react'
import { parseRoute, shouldHandleClick } from './routes.js'
import { scrollToId } from './scroll.js'

// A minimal History-API router: the URL is the state. navigate() pushes a new
// entry and tells subscribers; back/forward arrive as popstate.
const listeners = new Set()

function subscribe(listener) {
  listeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

const getPathname = () => window.location.pathname

export function usePathname() {
  return useSyncExternalStore(subscribe, getPathname, () => '/')
}

export function useRoute() {
  const pathname = usePathname()
  return useMemo(() => parseRoute(pathname), [pathname])
}

export function navigate(href) {
  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href)
    return
  }
  const samePath = url.pathname === window.location.pathname
  const target = url.pathname + url.search + url.hash
  if (target !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.pushState(null, '', target)
  }
  listeners.forEach((listener) => listener())
  // Let React render the new page first, then scroll.
  requestAnimationFrame(() => {
    if (url.hash) scrollToId(decodeURIComponent(url.hash.slice(1)))
    else if (!samePath) window.scrollTo(0, 0)
  })
}

export function Link({ href, onClick, ...props }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)
        if (!shouldHandleClick(event, event.currentTarget, window.location.origin)) return
        event.preventDefault()
        navigate(href)
      }}
      {...props}
    />
  )
}
```

`vercel.json`

```json
{
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

(Vercel serves files that exist — `/assets/*`, `/projects/<id>/x.webp` — before it applies rewrites, so only paths with no file fall through to `index.html`. `/api/*` stays with the serverless functions. Local `vite preview` already falls back to `index.html`, so this rewrite is only exercised on Vercel: after the Task 9 push, open `https://fredanthonyyy.vercel.app/projects/studyspace` directly and expect the page.)

- [ ] **Step 4: Run tests and lint**

Run: `npm test && npm run lint`
Expected: 5 tests pass; lint clean. If ESLint flags `tests/` for Node globals, add `{ files: ['tests/**', 'scripts/**'], languageOptions: { globals: globals.node } }` to `eslint.config.js`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/routes.js src/lib/router.jsx tests/routes.test.js vercel.json package.json eslint.config.js
git commit -m "Add a small router and SPA rewrite"
```

---

### Task 2: App shell routes between pages

**Files:**
- Create: `src/pages/HomePage.jsx`, `src/pages/NotFoundPage.jsx`, `src/lib/pageTitle.js`
- Modify: `src/App.jsx`, `src/components/SideIndex.jsx`, `src/components/Footer.jsx`, `src/components/CommandPalette.jsx`, `src/hooks/useRevealOnScroll.js`, `src/hooks/usePointerEffects.js`, `src/hooks/useMotionFx.js`, `index.html`

**Interfaces:**
- Consumes: `useRoute`, `usePathname`, `navigate`, `Link` (Task 1).
- Produces: `usePageTitle(title?: string)`; `HomePage({ onContact })`; `NotFoundPage({ message? })`; hooks `useRevealOnScroll(key)`, `usePointerEffects(key)`, `useMotionFx(key)` re-run when `key` changes.

- [ ] **Step 1: Move home content** — `src/pages/HomePage.jsx` gets exactly the JSX now inside `<main id="main">` in `App.jsx` (Hero, StackMarquee, `.page-body` with bento, dividers, Projects, GithubActivity, duo) with the same imports, taking `onContact` as a prop.

- [ ] **Step 2: Titles** — `src/lib/pageTitle.js`

```js
import { useEffect } from 'react'

export const SITE_TITLE = 'Fred Anthony Gallano — Aspiring Full-Stack Developer'

// Sets document.title for the current page; no argument = the site title.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Fred Anthony Gallano` : SITE_TITLE
  }, [title])
}
```

- [ ] **Step 3: Not found page** — `src/pages/NotFoundPage.jsx`

```jsx
import { Link } from '../lib/router.jsx'
import { usePageTitle } from '../lib/pageTitle.js'

export default function NotFoundPage({ message = 'This page does not exist.' }) {
  usePageTitle('Not found')
  return (
    <div className="container page-body not-found">
      <h1 className="not-found__title">404</h1>
      <p className="not-found__text">{message}</p>
      <p>
        <Link className="text-link" href="/projects">All projects <span aria-hidden="true">→</span></Link>{' '}
        <Link className="text-link" href="/">Home <span aria-hidden="true">→</span></Link>
      </p>
    </div>
  )
}
```

Add to `src/styles/layout.css`:

```css
.not-found { padding-block: 120px; text-align: center; }
.not-found__title { font-family: var(--font-mono); font-size: 4rem; color: var(--accent); }
.not-found__text { margin-block: 8px 20px; color: var(--muted); }
```

- [ ] **Step 4: App switches pages** — in `src/App.jsx`: import `useRoute`, `usePathname`; `const route = useRoute(); const pathname = usePathname()`; pass `pathname` to `useRevealOnScroll(pathname)`, `usePointerEffects(pathname)`, `useMotionFx(pathname)`; replace the `<main>` children with:

```jsx
<main id="main" key={pathname}>
  {route.name === 'home' && <HomePage onContact={openContact} />}
  {route.name === 'projects' && <ProjectsPage />}
  {route.name === 'project' && <ProjectPage id={route.id} />}
  {route.name === 'notFound' && <NotFoundPage />}
</main>
```

Until Tasks 6–7 exist, import placeholders that render `<NotFoundPage message="Coming soon" />` — create `src/pages/ProjectsPage.jsx` and `src/pages/ProjectPage.jsx` with exactly that body so the app builds. HomePage calls `usePageTitle()`.

- [ ] **Step 5: Hooks re-run per page** — in each of the three hooks add a `key` parameter and put it in the effect's dependency array (`useEffect(() => { … }, [key])`). In `useRevealOnScroll` keep the early return for reduced motion; the effect already only observes `[data-reveal]:not(.is-revealed)`.

- [ ] **Step 6: Section links work from any page**
  - `SideIndex.jsx`: replace the two `<a>` with `<Link>`: logo `href="/#top"`, sections `href={`/#${section.id}`}`. Only compute `aria-current` when `usePathname() === '/'`.
  - `Footer.jsx` "Back to top": keep `<a href="#top">` but add `onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }) }}`.
  - `CommandPalette.jsx`: section items `run: () => navigate(`/#${section.id}`)`; project items `run: () => navigate(`/projects/${project.id}`)`; add `{ id: 'all-projects', group: 'Projects', label: 'All projects', hint: '/projects', run: () => navigate('/projects') }` before the project items; "Back to top" `run: () => window.scrollTo({ top: 0 })`.

- [ ] **Step 7: Intro only on `/`** — in `index.html` change the intro condition to `if (!reduced && location.pathname === '/' && !sessionStorage.getItem('intro-seen'))`.

- [ ] **Step 8: Verify in the browser** — `npm run dev`, then with the Playwright helper from Task 9 not available yet, run this one-off check:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:5173/projects/nope'); console.log(await p.textContent('h1'));
  await p.goto('http://localhost:5173/'); await p.click('.side-index__link[href=\"/#projects\"]', { force: true });
  console.log(p.url()); await b.close();
})()"
```

(Install first: `npm i -D playwright@1.63.0`.) Expected: prints `404`, then a URL ending in `/#projects`.

- [ ] **Step 9: Lint, build, commit**

Run: `npm run lint && npm run build && npm test`

```bash
git add -A src index.html package.json package-lock.json
git commit -m "Route between home, projects and project pages"
```

---

### Task 3: Project data fields + data test

**Files:**
- Modify: `src/data/projects.js`
- Create: `tests/projects.test.js`

**Interfaces:**
- Produces (per project, in addition to existing fields): `featured: boolean`, `badges: string[]`, `pitch: string`, `role?: string`, `year?: string`, `platform: ('web'|'mobile'|'desktop'|'ai')[]`, `features: { icon: FeatureIconName, title: string, text: string }[]`, `gallery: { src, alt, caption, width, height }[]`, `demo: { src, poster, width, height } | null`, `build: string[]`.
- `FeatureIconName` is one of: `map route ai bell users chart shield book calendar card camera offline game store paw wrench clock list star`.

- [ ] **Step 1: Write the failing test** — `tests/projects.test.js`

```js
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
    const files = [project.image?.src, ...project.gallery.map((g) => g.src), project.demo?.src, project.demo?.poster].filter(Boolean)
    files.forEach((src) => assert.ok(existsSync(publicFile(src)), src))
    project.gallery.forEach((g) => assert.ok(g.alt && g.caption && g.width && g.height, g.src))
  })
}
```

- [ ] **Step 2: Run it** — `npm test` → FAIL (`pitch` undefined).

- [ ] **Step 3: Fill the data.** Add to every project object (keep existing fields; `gallery` starts as `[{ ...image, caption }]` using the existing screenshot; `demo: null`). Content, verbatim:

**iskonnect** — `featured: true`, `badges: ['CAPSTONE', 'MOBILE + WEB']`, `platform: ['mobile', 'web']`, `pitch: 'Scholarship management for applicants, scholars and the office that runs them.'`, features:
`users` Applicants & scholars — "Applications, scholar records and statuses in one place." · `list` Requirements — "Track submitted and missing requirements per scholar." · `book` Academic records — "Grades and academic standing kept with each scholar." · `calendar` Attendance — "Attendance for scholar activities, recorded and reviewed." · `bell` Announcements — "Post updates that reach scholars on their phones." · `chart` Monitoring — "Reports that show how the program is doing."
build: "Flutter mobile app for scholars." · "React admin panel for the scholarship office." · "NestJS API with PostgreSQL through Prisma."

**bahadvisory** — `featured: true`, `badges: ['TEAM PROJECT', 'AI-POWERED']`, `role: 'Extended an existing flood map'`, `platform: ['web', 'ai']`, `pitch: 'Flood safety for Oriental Mindoro: live flood map, safe routes and an AI assistant.'`, features:
`map` Live flood map — "DRRM-verified flood zones, road passability, water levels and evacuation centers." · `route` Safe route — "Turn-by-turn routes on real roads that avoid verified floods for your vehicle." · `ai` Ask Baha AI — "An assistant that answers from verified records, with Gemini and Groq as fallback." · `camera` Community reports — "Photo reports with AI-suggested severity, verified by DRRM staff first." · `card` Subscriptions — "LGU and business plans with PayMongo and Xendit checkout." · `offline` Offline kit — "Works without signal and syncs reports when you're back online."
build: "React + TypeScript PWA on Firebase Auth and Firestore." · "Serverless API with role-based access and tenant isolation." · "93 unit, 57 Firestore-rules/API and 13 browser tests passing."

**studyspace** — `featured: true`, `badges: ['AI-POWERED', 'TYPESCRIPT']`, `platform: ['web', 'ai']`, `pitch: 'A private study space for two, with an AI tutor and a sky that fills with stars.'`, features:
`book` Notes — "Rich-text notes with images and highlights." · `list` Flashcards — "Spaced-repetition cards that come back when you're about to forget." · `star` Quizzes — "Quick quizzes made from your own material." · `calendar` Planner — "Plan study sessions and deadlines together." · `clock` Focus timer — "A timer that turns every session into a star in your shared sky." · `ai` Nova — "An AI tutor that runs server-side on Gemini, with Groq as fallback."
build: "React + TypeScript + Tailwind on Vite." · "Supabase Auth, Postgres with row-level security, Storage and an Edge Function." · "AI keys stay server-side; a bundle check fails the build if one leaks."

**tailfinder** — `featured: false`, `badges: ['WEB APP']`, `platform: ['web']`, `pitch: 'Pet adoption that connects adopters with pets and gives admins the tools to manage it.'`, features:
`paw` Browse pets — "Available pets with photos, breeds and details." · `list` Adoption requests — "Request a pet and follow it from pending to approved." · `users` Accounts — "Register, sign in and manage your profile." · `bell` Inquiries — "Message the shelter admin for questions." · `shield` Admin tools — "Manage pets, users and adoption requests." · `chart` Reports — "Reports on pets, users, adoptions and inquiries."
build: "PHP with CodeIgniter and MySQL." · "Email verification with PHPMailer." · "Static portfolio build rendered from a demo database."

**meu-gear-up** — `featured: false`, `badges: ['MULTI-BRANCH', 'MULTI-ROLE']`, `platform: ['web']`, `pitch: 'Motorcycle shop system with portals for customers, mechanics, suppliers and admins.'`, features:
`calendar` Service booking — "Customers book repairs at any branch." · `wrench` Roadside assistance — "Request help and get a mechanic assigned." · `store` Point of sale — "Sell parts and record payments." · `route` Stock transfers — "Move inventory between the three branches." · `users` Job assignment — "Assign mechanics and track their work." · `chart` Sales reports — "Sales and performance reports per branch."
build: "PHP and MySQL with Bootstrap." · "Charts with Chart.js, email with PHPMailer." · "Separate portals per role."

**library-management** — `featured: false`, `badges: ['SCHOOL LIBRARY']`, `platform: ['web']`, `pitch: 'Attendance, lending, returns and penalties for a school library, in one desk app.'`, features:
`clock` Attendance — "Time users in and out by ID number." · `book` Lending — "Lend books with automatic transaction numbers and printable slips." · `list` Returns — "Returns calculate overdue days and penalties." · `bell` Notifications — "Due today, due soon and overdue, generated from loans." · `card` Penalties — "Record payments with receipt numbers." · `chart` Reports — "Printable attendance, inventory and penalty reports."
build: "Plain PHP + MySQL with PDO prepared statements." · "CSRF protection on every form, throttled sign-ins." · "Borrowing rules enforced in transactions and by the database."

**checkers** — `featured: false`, `badges: ['GAME AI', 'DESKTOP + WEB']`, `platform: ['desktop', 'web', 'ai']`, `pitch: 'Checkers with a computer opponent that searches five moves ahead.'`, features:
`game` Two modes — "Play a friend or the computer." · `ai` Three AI levels — "Hard uses minimax with alpha-beta pruning, five moves deep." · `users` Accounts — "Sign up and keep your own record." · `star` Best-of series — "Play a series, not just one game." · `chart` Leaderboard — "Results stored in MySQL and ranked." · `wrench` Web version — "A browser version with the AI in a Web Worker."
build: "C# .NET 8 WinForms desktop app." · "MySQL for accounts, matches and the leaderboard." · "Web port with the search running off the main thread."

(Verify the last feature and build line against `checkers/public/js/ai-worker.js` before committing; drop them if the web version differs.)

**guhit-arts** — `featured: false`, `badges: ['ACADEMIC PROTOTYPE']`, `platform: ['web']`, `pitch: 'Arts and printing shop prototype: design studio, online shop and admin panel.'`, features:
`camera` Design studio — "Preview your own text on a mug or shirt." · `store` Online shop — "Browse products, add to cart and check out." · `route` Order tracking — "Track an order by its reference." · `shield` Admin roles — "Role-based access for the shop team." · `chart` Sales reports — "Reports for the admin." · `list` Service requests — "Request printing and art services."
build: "React + Vite with React Router." · "All data simulated in the browser — no backend." · "Built for an academic business proposal."

Set `year` from each repo's first commit year (`git -C <repo> log --reverse --format=%ad --date=format:%Y | head -1`); omit `year` if the repo isn't available. Reorder the array: iskonnect, bahadvisory, studyspace, tailfinder, meu-gear-up, library-management, checkers, guhit-arts. Update the header comment to document the new fields.

- [ ] **Step 4: Run** — `npm test` → all pass. `npm run lint`.

- [ ] **Step 5: Commit**

```bash
git add src/data/projects.js tests/projects.test.js
git commit -m "Add page content to every project"
```

---

### Task 4: Shared pieces — Badge, FeatureIcon, LaptopShot, DemoPlayer, Gallery

**Files:**
- Create: `src/components/Badge.jsx`, `src/components/Badge.css`, `src/components/FeatureIcon.jsx`, `src/components/LaptopShot.jsx`, `src/components/Laptop.css`, `src/components/DemoPlayer.jsx`, `src/components/DemoPlayer.css`, `src/components/Gallery.jsx`, `src/components/Gallery.css`

**Interfaces:**
- Produces: `<Badge>{text}</Badge>`; `<FeatureIcon name size=20 />`; `<LaptopShot src alt width height eager? />`; `<DemoPlayer demo={project.demo} fallback={project.image} label={project.name} />`; `<Gallery items={project.gallery} title={project.name} />`.

- [ ] **Step 1: Badge**

```jsx
import './Badge.css'

export default function Badge({ children }) {
  return <span className="badge">{children}</span>
}
```

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border: 1px solid var(--chip-line);
  border-radius: 999px;
  background: var(--chip-bg);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent);
  white-space: nowrap;
}
.badge::before { content: '❮'; opacity: 0.7; }
.badge::after { content: '❯'; opacity: 0.7; }
```

- [ ] **Step 2: FeatureIcon** — one 24×24 stroke path per name:

```jsx
const PATHS = {
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a3 3 0 0 1 3-3h1m8 3v6a3 3 0 0 1-3 3h-1',
  ai: 'M12 3v3m0 12v3M3 12h3m12 0h3M7 7l2 2m6 6 2 2M7 17l2-2m6-6 2-2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4a2 2 0 0 0 4 0',
  users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2 15a6 6 0 0 0-3-5.2',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  shield: 'M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3Zm-3 9 2 2 4-4',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h13',
  calendar: 'M4 6h16v14H4V6Zm0 4h16M8 3v4m8-4v4',
  card: 'M3 6h18v12H3V6Zm0 4h18M7 15h4',
  camera: 'M4 8h4l2-3h4l2 3h4v11H4V8Zm8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  offline: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 4-2.6m6 .1A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 5-3m5-1a15 15 0 0 1 10 4M12 20h.01',
  game: 'M6 9h12a3 3 0 0 1 3 3v3a3 3 0 0 1-5.2 2L14 15h-4l-1.8 2A3 3 0 0 1 3 15v-3a3 3 0 0 1 3-3Zm2 2v4m-2-2h4m6-1h.01M17 14h.01',
  store: 'M4 9 5 4h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6',
  paw: 'M12 13c-3 0-5 3-5 5 0 1.5 1.5 2 2.5 2 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1 0 2.5-.5 2.5-2 0-2-2-5-5-5ZM6.5 11a1.5 2 0 1 0 0-.01M17.5 11a1.5 2 0 1 0 0-.01M9.5 7a1.5 2 0 1 0 0-.01M14.5 7a1.5 2 0 1 0 0-.01',
  wrench: 'M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17v3h3l5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z',
}

export default function FeatureIcon({ name, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d={PATHS[name] ?? PATHS.star} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
```

- [ ] **Step 3: LaptopShot + Laptop.css** — move the `/* Laptop frame for real screenshots */` block (`.laptop__screen`, `.laptop__screen img`, `.laptop__base`, `.laptop__base::before`) from `Projects.css` into `src/components/Laptop.css` unchanged.

```jsx
import './Laptop.css'

export default function LaptopShot({ src, alt, width, height, eager = false, children }) {
  return (
    <div className="laptop">
      <div className="laptop__screen">
        {children ?? <img src={src} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" />}
      </div>
      <div className="laptop__base" aria-hidden="true" />
    </div>
  )
}
```

- [ ] **Step 4: DemoPlayer**

```jsx
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../hooks/useReducedMotion.js'
import LaptopShot from './LaptopShot.jsx'
import './DemoPlayer.css'

// An animated WebP clip in the laptop frame. Paused = the poster still.
// Plays while on screen (never on its own with reduced motion).
export default function DemoPlayer({ demo, fallback, label }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!demo || prefersReducedMotion() || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting && !userPaused), { threshold: 0.4 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [demo, userPaused])

  if (!demo || failed) {
    return fallback ? <LaptopShot {...fallback} eager /> : null
  }

  const toggle = () => {
    setUserPaused(playing)
    setPlaying(!playing)
  }

  return (
    <figure className="demo" ref={ref}>
      <LaptopShot>
        <img
          key={playing ? 'clip' : 'poster'}
          src={playing ? demo.src : demo.poster}
          alt={`${label} demo${playing ? '' : ' (paused)'}`}
          width={demo.width}
          height={demo.height}
          onError={() => setFailed(true)}
        />
      </LaptopShot>
      <button type="button" className="demo__toggle" onClick={toggle} aria-pressed={playing}>
        {playing ? 'Pause demo' : 'Play demo'}
      </button>
    </figure>
  )
}
```

```css
.demo { position: relative; margin: 0; }
.demo__toggle {
  position: absolute;
  right: 12px;
  bottom: 22px;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--chip-line);
  border-radius: 999px;
  background: var(--glass);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--accent);
  cursor: pointer;
}
.demo__toggle:hover { border-color: var(--accent); }
```

- [ ] **Step 5: Gallery** — grid of buttons opening a native `<dialog>`, same behavior as `CertificateViewer` in `src/components/Certifications.jsx` (showModal, click backdrop closes, ← → step, Esc closes, focus returns):

```jsx
import { useEffect, useRef, useState } from 'react'
import './Gallery.css'

export default function Gallery({ items, title }) {
  const [active, setActive] = useState(null)
  const dialogRef = useRef(null)
  const item = active === null ? null : items[active]

  useEffect(() => {
    const dialog = dialogRef.current
    if (item && dialog && !dialog.open) dialog.showModal()
  }, [item])

  if (!items.length) return null
  const step = (delta) => setActive((index) => (index + delta + items.length) % items.length)
  const close = () => dialogRef.current?.close()

  return (
    <>
      <ul className="gallery">
        {items.map((shot, index) => (
          <li key={shot.src}>
            <button type="button" className="gallery__item" onClick={() => setActive(index)}>
              <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading="lazy" decoding="async" />
              <span className="gallery__caption">{shot.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="gallery-viewer"
        aria-label={`${title} screenshots`}
        onClose={() => setActive(null)}
        onClick={(event) => event.target === dialogRef.current && close()}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') step(-1)
          if (event.key === 'ArrowRight') step(1)
        }}
      >
        {item && (
          <>
            <img key={item.src} src={item.src} alt={item.alt} />
            <footer className="gallery-viewer__bar">
              <button type="button" onClick={() => step(-1)}><span aria-hidden="true">←</span> Prev</button>
              <span aria-live="polite">{item.caption} · {active + 1} / {items.length}</span>
              <button type="button" onClick={() => step(1)}>Next <span aria-hidden="true">→</span></button>
              <button type="button" onClick={close} aria-label="Close">✕</button>
            </footer>
          </>
        )}
      </dialog>
    </>
  )
}
```

```css
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.gallery__item {
  display: grid; gap: 8px; width: 100%; padding: 8px;
  border: 1px solid var(--panel-line); border-radius: var(--radius-s);
  background: var(--surface-sunken); text-align: left; cursor: zoom-in;
}
.gallery__item:hover, .gallery__item:focus-visible { border-color: var(--accent); }
.gallery__item img { width: 100%; height: auto; aspect-ratio: 16 / 10; object-fit: cover; object-position: top; border-radius: 3px; }
.gallery__caption { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--text-soft); }
.gallery-viewer {
  width: min(1200px, 94vw); max-height: 92vh; padding: 12px;
  border: 1px solid var(--panel-line); border-radius: var(--radius-s);
  background: var(--panel); color: var(--text);
}
.gallery-viewer::backdrop { background: var(--overlay); }
.gallery-viewer img { display: block; width: 100%; max-height: 78vh; object-fit: contain; }
.gallery-viewer__bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;
  margin-top: 10px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-soft);
}
.gallery-viewer__bar button { min-height: 36px; padding: 0 12px; border: 1px solid var(--line); border-radius: 6px; background: var(--elevated); color: var(--text); cursor: pointer; }
```

- [ ] **Step 6: Lint + build, commit**

Run: `npm run lint && npm run build`

```bash
git add src/components/Badge.* src/components/FeatureIcon.jsx src/components/LaptopShot.jsx src/components/Laptop.css src/components/DemoPlayer.* src/components/Gallery.* src/components/Projects.css
git commit -m "Add badge, icons, laptop frame, demo player and gallery"
```

---

### Task 5: Home deck

**Files:**
- Create: `src/components/ProjectDeck.jsx`, `src/components/ProjectDeck.css`
- Modify: `src/components/Projects.jsx`, `src/hooks/usePointerEffects.js` (GLOW_TARGETS)
- Delete: `src/components/ProjectCard.jsx`, `src/hooks/useStackedCards.js`, the `.project*` rules in `src/components/Projects.css` (delete the file if empty; remove its import)

**Interfaces:**
- Consumes: `Badge`, `LaptopShot`, `Link`, `navigate` (Tasks 1, 4); `projects` with `featured` (Task 3).
- Produces: `<ProjectDeck projects={featured} />`.

- [ ] **Step 1: Deck component**

```jsx
import { useRef, useState } from 'react'
import { navigate, Link } from '../lib/router.jsx'
import Badge from './Badge.jsx'
import LaptopShot from './LaptopShot.jsx'
import './ProjectDeck.css'

// 800k-style fan: the front card is flat, the others lean out behind it.
// Click a back card (or ← →, or swipe) to bring it forward; click the front
// card to open its page. Reduced motion: CSS lays the cards out in a row.
export default function ProjectDeck({ projects }) {
  const [front, setFront] = useState(0)
  const swipe = useRef(null)
  const count = projects.length
  const step = (delta) => setFront((index) => (index + delta + count) % count)

  return (
    <div
      className="deck"
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') step(-1)
        if (event.key === 'ArrowRight') step(1)
      }}
      onPointerDown={(event) => { swipe.current = event.clientX }}
      onPointerUp={(event) => {
        const dx = swipe.current === null ? 0 : event.clientX - swipe.current
        swipe.current = null
        if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
      }}
    >
      <div className="deck__stage">
        {projects.map((project, index) => {
          // -1 = left, 0 = front, 1 = right (for three cards)
          const offset = ((index - front + count + 1) % count) - 1
          const isFront = offset === 0
          return (
            <article
              key={project.id}
              className="deck__card"
              data-offset={offset}
              aria-hidden={!isFront}
              onClick={() => (isFront ? navigate(`/projects/${project.id}`) : setFront(index))}
            >
              <ul className="deck__badges" aria-label="Highlights">
                {project.badges.map((badge) => <li key={badge}><Badge>{badge}</Badge></li>)}
              </ul>
              <LaptopShot {...project.image} eager={isFront} />
              <h3 className="deck__name">
                {isFront ? <Link href={`/projects/${project.id}`}>{project.name}</Link> : project.name}
              </h3>
              <p className="deck__pitch">{project.pitch}</p>
            </article>
          )
        })}
      </div>

      <div className="deck__controls">
        <button type="button" onClick={() => step(-1)} aria-label="Previous project">←</button>
        <span aria-live="polite">{String(front + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
        <button type="button" onClick={() => step(1)} aria-label="Next project">→</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Deck CSS**

```css
.deck { display: grid; gap: 18px; padding-block: 12px 4px; touch-action: pan-y; }
.deck__stage { position: relative; display: grid; place-items: center; min-height: 470px; perspective: 1600px; }
.deck__card {
  position: absolute;
  width: min(440px, 86%);
  padding: 18px;
  border: 1px solid var(--panel-line);
  border-radius: 16px;
  background: var(--panel-raised);
  box-shadow: var(--shadow-pop);
  cursor: pointer;
  transition: transform 520ms var(--ease-out), filter 520ms var(--ease-out), opacity 520ms;
}
.deck__card[data-offset='0'] { z-index: 3; transform: none; }
.deck__card[data-offset='-1'] { z-index: 1; transform: translateX(-46%) translateY(28px) rotate(-11deg) scale(0.9); filter: brightness(0.55); }
.deck__card[data-offset='1'] { z-index: 2; transform: translateX(46%) translateY(28px) rotate(9deg) scale(0.9); filter: brightness(0.55); }
.deck__card:not([data-offset='0']):hover { filter: brightness(0.8); }
.deck__badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.deck__name { margin-top: 14px; font-family: var(--font-mono); font-size: 1.125rem; color: var(--text); }
.deck__name a { color: inherit; }
.deck__name a::after { content: ' →'; color: var(--accent); }
.deck__pitch { margin-top: 6px; font-size: 0.875rem; line-height: 1.6; color: var(--muted); }
.deck__controls { display: flex; justify-content: center; align-items: center; gap: 14px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
.deck__controls button { width: 40px; height: 40px; border: 1px solid var(--line); border-radius: 999px; background: var(--elevated); color: var(--text); cursor: pointer; }
.deck__controls button:hover { border-color: var(--accent); color: var(--accent); }

@media (max-width: 640px) {
  .deck__stage { min-height: 420px; }
  .deck__card[data-offset='-1'], .deck__card[data-offset='1'] { opacity: 0; pointer-events: none; }
}

@media (prefers-reduced-motion: reduce) {
  .deck__stage { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; min-height: 0; }
  .deck__card, .deck__card[data-offset] { position: static; width: auto; transform: none; filter: none; opacity: 1; pointer-events: auto; transition: none; }
  .deck__controls { display: none; }
}
```

(Under reduced motion every card is visible, so `aria-hidden` must not hide them: in the JSX use `aria-hidden={!isFront && !prefersReducedMotion() ? true : undefined}` — import `prefersReducedMotion`.)

- [ ] **Step 3: Projects section** — `src/components/Projects.jsx`

```jsx
import { projects } from '../data/projects.js'
import { Link } from '../lib/router.jsx'
import Panel from './Panel.jsx'
import ProjectDeck from './ProjectDeck.jsx'

const featured = projects.filter((project) => project.featured)

export default function Projects() {
  return (
    <Panel
      id="projects"
      title="Featured projects"
      aside={
        <Link className="panel-link" href="/projects">
          All projects <span aria-hidden="true">→</span>
        </Link>
      }
    >
      <ProjectDeck projects={featured} />
    </Panel>
  )
}
```

- [ ] **Step 4: Clean up** — delete `ProjectCard.jsx`, `useStackedCards.js`, the `.projects`/`.project*` CSS; in `usePointerEffects.js` set `GLOW_TARGETS = '.panel, .deck__card, .tile, .cert, .gallery__item, .project-row'`. `grep -rn "ProjectCard\|useStackedCards\|project__" src` must print nothing.

- [ ] **Step 5: Check visually** — `npm run dev`, screenshot `/` at 1280×800 and 375×812 with Playwright (`#projects` scrolled into view), and with `reducedMotion: 'reduce'`. Expected: three fanned cards; one card on phone; a row of three under reduced motion.

- [ ] **Step 6: Lint, build, test, commit**

```bash
git add -A src
git commit -m "Show featured projects as a fanned deck"
```

---

### Task 6: All projects page

**Files:**
- Modify (replace placeholder): `src/pages/ProjectsPage.jsx`
- Create: `src/pages/ProjectsPage.css`

**Interfaces:**
- Consumes: `projects`, `Badge`, `LaptopShot`, `Link`, `usePageTitle`.

- [ ] **Step 1: Page**

```jsx
import { useState } from 'react'
import { projects } from '../data/projects.js'
import { Link } from '../lib/router.jsx'
import { usePageTitle } from '../lib/pageTitle.js'
import Badge from '../components/Badge.jsx'
import LaptopShot from '../components/LaptopShot.jsx'
import './ProjectsPage.css'

const FILTERS = [
  ['all', 'All'],
  ['web', 'Web'],
  ['mobile', 'Mobile'],
  ['desktop', 'Desktop'],
  ['ai', 'AI'],
]

export default function ProjectsPage() {
  usePageTitle('Projects')
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? projects : projects.filter((project) => project.platform.includes(filter))

  return (
    <div className="container page-body projects-page">
      <header className="projects-page__head" data-reveal>
        <Link className="text-link" href="/#projects"><span aria-hidden="true">←</span> Home</Link>
        <h1 className="projects-page__title">Projects</h1>
        <p className="projects-page__lede">Apps I've designed and built, from capstone systems to games. Open one to see it in action.</p>
        <div className="projects-page__filters" role="group" aria-label="Filter projects">
          {FILTERS.map(([value, label]) => (
            <button key={value} type="button" className="chip" aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <ol className="project-rows">
        {shown.map((project) => (
          <li key={project.id}>
            <article className="project-row" aria-labelledby={`row-${project.id}`}>
              <Link className="project-row__shot" href={`/projects/${project.id}`} tabIndex={-1} aria-hidden="true">
                <LaptopShot {...project.image} />
              </Link>
              <div className="project-row__body">
                <ul className="project-row__badges" aria-label="Highlights">
                  {project.badges.map((badge) => <li key={badge}><Badge>{badge}</Badge></li>)}
                </ul>
                <h2 id={`row-${project.id}`} className="project-row__name">
                  <Link href={`/projects/${project.id}`}>{project.name}</Link>
                </h2>
                <p className="project-row__pitch">{project.pitch}</p>
                <p className="project-row__tech">{project.tech.join(' · ')}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  )
}
```

- [ ] **Step 2: CSS**

```css
.projects-page { padding-top: 48px; }
.projects-page__head { display: grid; gap: 10px; justify-items: start; }
.projects-page__title { font-family: var(--font-mono); font-size: clamp(2rem, 5vw, 3rem); color: var(--text); }
.projects-page__lede { max-width: 60ch; color: var(--muted); line-height: 1.65; }
.projects-page__filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.projects-page__filters .chip { cursor: pointer; }
.projects-page__filters .chip[aria-pressed='true'] { border-color: var(--accent); color: var(--accent); }
.project-rows { display: grid; gap: 14px; margin-top: 18px; }
.project-row {
  display: grid; grid-template-columns: minmax(0, 280px) minmax(0, 1fr); gap: 24px; align-items: center;
  padding: 18px; border: 1px solid var(--panel-line); border-radius: 16px; background: var(--panel);
  transition: border-color 200ms ease, transform 200ms var(--ease-out);
}
.project-row:hover, .project-row:focus-within { border-color: rgba(255, 176, 0, 0.36); transform: translateY(-2px); }
.project-row__badges { display: flex; flex-wrap: wrap; gap: 6px; }
.project-row__name { margin-top: 10px; font-family: var(--font-mono); font-size: 1.25rem; }
.project-row__name a { color: var(--text); }
.project-row__name a::after { content: ' →'; color: var(--accent); }
.project-row__pitch { margin-top: 6px; color: var(--text-soft); line-height: 1.6; }
.project-row__tech { margin-top: 10px; font-family: var(--font-mono); font-size: 0.6875rem; color: var(--muted); }
@media (max-width: 720px) { .project-row { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Check** — `/projects` at 1280 and 375 wide: 8 rows, filters change the list ("Mobile" shows only ISKONNECT; "AI" shows Bahadvisory, StudySpace, Checkers).

- [ ] **Step 4: Lint, build, commit** — `git commit -m "Add the all projects page"`.

---

### Task 7: Project page

**Files:**
- Modify (replace placeholder): `src/pages/ProjectPage.jsx`
- Create: `src/pages/ProjectPage.css`

**Interfaces:**
- Consumes: everything from Tasks 3–4; `NotFoundPage`.

- [ ] **Step 1: Page**

```jsx
import { projects } from '../data/projects.js'
import { Link } from '../lib/router.jsx'
import { usePageTitle } from '../lib/pageTitle.js'
import Badge from '../components/Badge.jsx'
import DemoPlayer from '../components/DemoPlayer.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'
import Gallery from '../components/Gallery.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import './ProjectPage.css'

function ExternalLink({ href, children }) {
  return (
    <a className="project-page__link" href={href} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden="true">↗</span>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

export default function ProjectPage({ id }) {
  const index = projects.findIndex((project) => project.id === id)
  const project = projects[index]
  usePageTitle(project?.name ?? 'Not found')
  if (!project) return <NotFoundPage message="That project isn't in this portfolio." />

  const previous = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  const meta = [project.kind, project.role, project.year].filter(Boolean)

  return (
    <article className="container page-body project-page" aria-labelledby="project-title">
      <Link className="text-link" href="/projects"><span aria-hidden="true">←</span> All projects</Link>

      <header className="project-page__hero">
        <div className="project-page__intro">
          <ul className="project-page__badges" aria-label="Highlights">
            {project.badges.map((badge) => <li key={badge}><Badge>{badge}</Badge></li>)}
          </ul>
          <h1 id="project-title" className="project-page__title">{project.name}</h1>
          <p className="project-page__subtitle">{project.subtitle}</p>
          <p className="project-page__pitch">{project.description}</p>
          <p className="project-page__meta">{meta.join(' · ')}</p>
          <div className="project-page__links">
            {project.liveUrl && <ExternalLink href={project.liveUrl}>View project</ExternalLink>}
            {project.codeUrl && <ExternalLink href={project.codeUrl}>View code</ExternalLink>}
            {project.note && <span className="project-page__note">{project.note}</span>}
          </div>
          <ul className="project-page__tech" aria-label="Technologies">
            {project.tech.map((tech) => <li key={tech} className="chip">{tech}</li>)}
          </ul>
        </div>
        <div className="project-page__demo">
          <DemoPlayer demo={project.demo} fallback={project.image} label={project.name} />
        </div>
      </header>

      <section className="project-page__section" aria-labelledby="features-title" data-reveal>
        <h2 id="features-title" className="project-page__heading">Features</h2>
        <ul className="features">
          {project.features.map((feature) => (
            <li key={feature.title} className="feature">
              <span className="feature__icon"><FeatureIcon name={feature.icon} /></span>
              <h3 className="feature__title">{feature.title}</h3>
              <p className="feature__text">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {project.gallery.length > 0 && (
        <section className="project-page__section" aria-labelledby="gallery-title" data-reveal>
          <h2 id="gallery-title" className="project-page__heading">Screenshots</h2>
          <Gallery items={project.gallery} title={project.name} />
        </section>
      )}

      <section className="project-page__section" aria-labelledby="build-title" data-reveal>
        <h2 id="build-title" className="project-page__heading">How it's built</h2>
        <ul className="build">
          {project.build.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>

      <nav className="project-page__pager" aria-label="More projects">
        <Link href={`/projects/${previous.id}`} className="pager__link"><span>← Previous</span>{previous.name}</Link>
        <Link href={`/projects/${next.id}`} className="pager__link pager__link--next"><span>Next →</span>{next.name}</Link>
      </nav>
    </article>
  )
}
```

- [ ] **Step 2: CSS**

```css
.project-page { padding-top: 40px; }
.project-page__hero { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 36px; align-items: center; margin-top: 18px; }
.project-page__badges { display: flex; flex-wrap: wrap; gap: 6px; }
.project-page__title { margin-top: 14px; font-family: var(--font-mono); font-size: clamp(2rem, 5vw, 3.25rem); line-height: 1.05; color: var(--accent); }
.project-page__subtitle { margin-top: 6px; font-family: var(--font-mono); font-size: 0.875rem; color: var(--text-soft); }
.project-page__pitch { margin-top: 14px; line-height: 1.7; color: var(--muted); }
.project-page__meta { margin-top: 12px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-soft); }
.project-page__links { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 16px; margin-top: 8px; }
.project-page__link { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700; color: var(--accent); }
.project-page__link:hover { color: var(--accent-hover); }
.project-page__note { font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); }
.project-page__tech { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.project-page__section { margin-top: 56px; }
.project-page__heading { margin-bottom: 16px; font-family: var(--font-mono); font-size: 0.8125rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-soft); }
.features { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px; }
.feature { padding: 18px; border: 1px solid var(--panel-line); border-radius: 14px; background: var(--panel); }
.feature__icon { display: inline-grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; background: var(--chip-bg); color: var(--accent); }
.feature__title { margin-top: 12px; font-family: var(--font-mono); font-size: 0.9375rem; color: var(--text); }
.feature__text { margin-top: 6px; font-size: 0.875rem; line-height: 1.6; color: var(--muted); }
.build { display: grid; gap: 8px; padding-left: 1.1em; list-style: square; color: var(--text-soft); line-height: 1.6; }
.build li::marker { color: var(--accent); }
.project-page__pager { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 64px; }
.pager__link { display: grid; gap: 4px; padding: 16px; border: 1px solid var(--line); border-radius: 14px; font-family: var(--font-mono); color: var(--text); }
.pager__link span { font-size: 0.6875rem; color: var(--muted); }
.pager__link:hover { border-color: var(--accent); }
.pager__link--next { text-align: right; }
@media (max-width: 860px) { .project-page__hero { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Check** — `/projects/bahadvisory`, `/projects/studyspace`, `/projects/nope` at 1280 and 375 wide; open and step through the gallery lightbox with ← →; Esc closes and focus returns to the thumbnail.

- [ ] **Step 4: Lint, build, test, commit** — `git commit -m "Add a page for each project"`.

---

### Task 8: Command palette and chatbot point at project pages

**Files:**
- Modify: `src/lib/localAssistant.js` (`describeProject`), `src/components/ChatText.jsx` (internal links), `src/lib/knowledge.js` (project lines)

- [ ] **Step 1: Local answers link the page** — in `describeProject` add `lines.push(`Details: ${window.location.origin}/projects/${project.id}`)` before the live/code links; in `knowledge.js` add a line `   Page in this portfolio: /projects/${project.id}` per project, so the AI can mention it.

- [ ] **Step 2: Same-origin links stay in the app** — in `ChatText.jsx` `Inline`, when `url` starts with `window.location.origin`, render `<Link href={url.slice(window.location.origin.length) || '/'}>` (import from `../lib/router.jsx`) showing the path, instead of a new-tab `<a>`.

- [ ] **Step 3: Check** — ask the offline assistant "tell me about studyspace"; the reply shows a `/projects/studyspace` link that opens the page in place.

- [ ] **Step 4: Lint, build, commit** — `git commit -m "Link project pages from the menu and assistant"`.

---

### Task 9: Smoke test, review screenshots with Fred, push

**Files:**
- Create: `scripts/smoke.mjs`
- Modify: `package.json` (`"smoke": "node scripts/smoke.mjs"`)

- [ ] **Step 1: Smoke script**

```js
// Opens every route directly in Chromium at phone and desktop width and fails
// on missing headings, console errors, hidden content or sideways scrolling.
// Usage: npm run build && npm run smoke
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'
import { projects } from '../src/data/projects.js'

const PORT = 4183
const BASE = `http://localhost:${PORT}`
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' })
const failures = []

try {
  const browser = await chromium.launch()
  for (let i = 0; i < 40; i++) {
    try { await fetch(BASE); break } catch { await new Promise((r) => setTimeout(r, 250)) }
  }
  const routes = ['/', '/projects', ...projects.map((p) => `/projects/${p.id}`), '/projects/nope']
  for (const [label, width, height] of [['phone', 375, 812], ['desktop', 1280, 800]]) {
    const page = await browser.newPage({ viewport: { width, height } })
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    for (const route of routes) {
      errors.length = 0
      await page.goto(BASE + route, { waitUntil: 'networkidle' })
      await page.evaluate(() => sessionStorage.setItem('intro-seen', '1'))
      const heading = page.locator('h1, h2').first()
      if (!(await heading.isVisible())) failures.push(`${label} ${route}: no visible heading`)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
      if (overflow) failures.push(`${label} ${route}: horizontal overflow`)
      if (errors.length) failures.push(`${label} ${route}: ${errors[0]}`)
    }
    // Client-side navigation: home → all projects → a project → back, then a section link from a project page.
    await page.goto(BASE + '/')
    await page.click('a[href="/projects"]')
    await page.waitForURL('**/projects')
    await page.click(`a[href="/projects/${projects[0].id}"] >> nth=0`)
    await page.waitForURL(`**/projects/${projects[0].id}`)
    const revealed = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every((el) => getComputedStyle(el).opacity !== '0'))
    await page.goBack()
    if (!page.url().endsWith('/projects')) failures.push(`${label}: back did not return to /projects`)
    await page.goto(BASE + `/projects/${projects[0].id}`)
    await page.locator('a[href="/#projects"]').first().click({ force: true })
    await page.waitForURL('**/#projects')
    await page.waitForTimeout(800)
    const sectionInView = await page.evaluate(() => Math.abs(document.getElementById('projects').getBoundingClientRect().top) < 200)
    if (!sectionInView) failures.push(`${label}: section link from project page did not scroll to #projects`)
    if (!revealed) failures.push(`${label}: content hidden after client navigation`)
    await page.close()
  }
  await browser.close()
} finally {
  server.kill()
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log('smoke: all routes ok')
```

(On Windows `server.kill()` may leave Vite running; after the run, stop anything listening on 4183 with PowerShell `Get-NetTCPConnection -LocalPort 4183 -State Listen | % { Stop-Process -Id $_.OwningProcess -Force }`.)

- [ ] **Step 2: Run** — `npm run build && npm run smoke` → `smoke: all routes ok`. Fix and re-run until it passes.

- [ ] **Step 3: Show Fred** — screenshot `/` (deck in view), `/projects`, `/projects/bahadvisory` at desktop and phone; show them and wait for OK.

- [ ] **Step 4: Commit and push**

```bash
git add scripts/smoke.mjs package.json
git commit -m "Add a smoke test for every route"
git push
```

---

## Phase 2 — Media

### Task 10: Capture tooling

**Files:**
- Create: `scripts/capture/lib.mjs`, `scripts/capture/encode.py`, `scripts/capture/README.md`
- Modify: `.gitignore` (add `scripts/capture/out/`)

**Interfaces:**
- Produces: `openBrowser({ width=1280, height=800, colorScheme='dark' }) → { browser, context, page }`; `still(page, outDir, name)` writes `<name>.png`; `clip(page, outDir, name, steps: (page) => Promise<void>, { fps = 8 })` writes `<name>/0000.jpg…` and `<name>/frames.json` (`[{ file, ms }]`); `encode.py <outDir> <publicDir>` converts every `*.png` to `<name>.webp` (≤150 KB, 1280 wide) and every clip folder to `<name>.webp` (animated, 960 wide) plus `<name>-poster.webp`.

- [ ] **Step 1: `lib.mjs`**

```js
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'

export async function openBrowser({ width = 1280, height = 800, colorScheme = 'dark' } = {}) {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width, height }, colorScheme })
  const page = await context.newPage()
  return { browser, context, page }
}

export async function still(page, outDir, name) {
  mkdirSync(outDir, { recursive: true })
  await page.screenshot({ path: join(outDir, `${name}.png`) })
}

// Screenshots as fast as the page allows (≈ fps) while `steps` runs.
export async function clip(page, outDir, name, steps, { fps = 8 } = {}) {
  const dir = join(outDir, name)
  mkdirSync(dir, { recursive: true })
  const frames = []
  let running = true
  const started = Date.now()
  const grab = (async () => {
    while (running) {
      const at = Date.now()
      const file = `${String(frames.length).padStart(4, '0')}.jpg`
      await page.screenshot({ path: join(dir, file), type: 'jpeg', quality: 85 })
      frames.push({ file, ms: at - started })
      const wait = 1000 / fps - (Date.now() - at)
      if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    }
  })()
  try {
    await steps(page)
  } finally {
    running = false
    await grab
  }
  writeFileSync(join(dir, 'frames.json'), JSON.stringify(frames))
}

// Moves the mouse in visible steps so clips show where the click happens.
export async function glide(page, locator) {
  const box = await locator.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 12 })
}
```

- [ ] **Step 2: `encode.py`**

```python
"""Encode capture output into public/projects/<id>/.

  python -I scripts/capture/encode.py <out_dir> <public_dir>

*.png         -> <name>.webp      (1280 wide, quality lowered until <= 150 KB)
<clip>/       -> <clip>.webp      (animated, 960 wide, timing from frames.json, <= 2 MB)
                 <clip>-poster.webp (first frame)
"""
import json
import sys
from pathlib import Path
from PIL import Image

STILL_MAX = 150_000
CLIP_MAX = 2_000_000


def fit(image, width):
    if image.width <= width:
        return image
    return image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)


def save_still(image, path, width=1280):
    image = fit(image.convert('RGB'), width)
    for quality in (82, 75, 68, 60, 52):
        image.save(path, 'WEBP', quality=quality, method=6)
        if path.stat().st_size <= STILL_MAX:
            return
    print(f'warning: {path.name} is {path.stat().st_size} bytes')


def save_clip(folder, out):
    meta = json.loads((folder / 'frames.json').read_text())
    frames = [fit(Image.open(folder / f['file']).convert('RGB'), 960) for f in meta]
    stamps = [f['ms'] for f in meta]
    durations = [max(60, b - a) for a, b in zip(stamps, stamps[1:])] + [1200]
    save_still(frames[0], out.with_name(out.stem + '-poster.webp'), 960)
    for quality in (60, 50, 42, 35):
        frames[0].save(out, 'WEBP', save_all=True, append_images=frames[1:], duration=durations,
                       loop=0, quality=quality, method=4)
        if out.stat().st_size <= CLIP_MAX:
            break
    print(f'{out.name}: {len(frames)} frames, {out.stat().st_size // 1024} KB, {sum(durations) / 1000:.1f}s')


def main(src, dst):
    src, dst = Path(src), Path(dst)
    dst.mkdir(parents=True, exist_ok=True)
    for png in sorted(src.glob('*.png')):
        save_still(Image.open(png), dst / f'{png.stem}.webp')
        print(f'{png.stem}.webp: {(dst / f"{png.stem}.webp").stat().st_size // 1024} KB')
    for folder in sorted(p for p in src.iterdir() if p.is_dir()):
        save_clip(folder, dst / f'{folder.name}.webp')


if __name__ == '__main__':
    main(*sys.argv[1:3])
```

- [ ] **Step 3: Prove it on Bahadvisory's existing screenshot** — copy any PNG into `scripts/capture/out/test/a.png`, run `python -I scripts/capture/encode.py scripts/capture/out/test scripts/capture/out/test-public`; expect `a.webp` ≤ 150 KB. Delete the test folders.

- [ ] **Step 4: README** — document the per-project start/stop commands from Tasks 11–18 and that capture uses fake data only.

- [ ] **Step 5: Commit** — `git commit -m "Add screenshot and demo clip capture tools"`.

---

### Tasks 11–18: Capture each project

Every capture task follows the same steps; the table after them gives each project's specifics.

- [ ] **Step 1: Start** the app with the project's *Start* commands. Wait until its URL answers (`curl --retry 30 --retry-connrefused --retry-delay 2 -s -o /dev/null <url>`).
- [ ] **Step 2: Discover** the screens: run `node -e` with Playwright to visit each *Route* and print `document.title`, the `h1/h2` texts and button/link names, so the capture script uses real labels, not guesses.
- [ ] **Step 3: Write `scripts/capture/<id>.mjs`** using `openBrowser`, `still` and `clip` from `lib.mjs`: one `still` per *Stills* entry (dismiss tours/toasts first), one `clip` named `demo` following the *Clip* storyboard (10–15 s, `glide` before each click, `page.waitForTimeout(600–900)` between steps so viewers can follow). Output to `scripts/capture/out/<id>/`.
- [ ] **Step 4: Run it**, then `python -I scripts/capture/encode.py scripts/capture/out/<id> public/projects/<id>`. Open the stills and the demo poster with the Read tool and check: no real personal data, no error screens, no dev overlays, tour popups closed.
- [ ] **Step 5: Stop and clean up** with the project's *Cleanup* commands; confirm with `Get-NetTCPConnection -LocalPort <ports> -State Listen` that nothing is left listening.
- [ ] **Step 6: Wire the data** in `src/data/projects.js`: `gallery` = the stills in order with `alt` (what's on screen, specific), `caption` (2–5 words), `width: 1280, height: 800`; `demo = { src: '/projects/<id>/demo.webp', poster: '/projects/<id>/demo-poster.webp', width: 960, height: 600 }`; set `image` to the best still (the deck/list thumbnail). Remove the old single screenshot file from `public/projects/` if nothing references it.
- [ ] **Step 7: Verify and ship** — `npm test && npm run lint && npm run build && npm run smoke`; screenshot `/projects/<id>`, show Fred; then `git add public/projects/<id> src/data/projects.js scripts/capture/<id>.mjs` and `git commit -m "Add screenshots and demo for <Name>"`, `git push`.

| Task | Project (`id`) | Start | Routes / Stills | Clip storyboard | Cleanup |
|---|---|---|---|---|---|
| 11 | Bahadvisory (`bahadvisory`) | In `Desktop/New folder/bahadvisory` (branch `stabilization`): `JAVA_HOME="C:/Program Files/Android/Android Studio/jbr"`, `firebase emulators:start --project demo-bahadvisory --only auth,firestore` (background), `npm run seed -- --emulator`, `npx vite --port 5181 --strictPort` (5173 is the portfolio) | `/` map (tour skipped), `/navigate` with a route computed, `/assistant` with one answered question, `/report`, `/evacuation`, `/pricing` | Map → click **Safe route** → pick origin/destination from the demo guide (`docs/DEMO.md`) → route draws around a flood → open **Ask Baha AI** and send "Is Bucayao Road passable?" | Stop listeners on 5181, 8080, 9099, 9150, 4400, 4500 |
| 12 | Library (`library-management`) | Laragon MySQL (`mysqld --defaults-file=C:/laragon/bin/mysql/mysql-8.0.30-winx64/my.ini`), `php setup/create_admin.php portfolio_shot <temp-pass> "Librarian"` + `UPDATE admins SET must_change_password=0`, PHP 8.2 built-in server on 8090 (see `.vscode/tasks.json`) | `dashboard.php`, attendance, books, borrowing (active tab), reports | Dashboard → Attendance: time in a sample user by ID → Borrowing: lend a book → Dashboard counts update | Delete `portfolio_shot` admin + its login_attempts, delete the attendance/borrowing rows the clip created (by the transaction number shown), stop 8090, `mysqladmin -uroot shutdown` |
| 13 | Guhit Arts (`guhit-arts`) | `Desktop/BIPROJ/guhit-arts-center`: `npx vite --port 5182 --strictPort` | `/`, `/shop`, design studio (`/services` or the studio route found in Step 2), `/track/<demo ref>`, `/admin` dashboard (demo admin login from its simulated data), `/admin` reports | Home → design studio: type "FRED" onto a mug → add to cart → checkout → order tracking | Stop 5182 |
| 14 | MEU Gear Up (`meu-gear-up`) | `python -m http.server 5183 --directory dist` in `Desktop/meu_gearup-master` | `index.html`, `user/` booking, `admin/index.html`, `admin/transfer.html`, `admin/sales_report.html`, `mechanics/` | Home → customer booking page → admin dashboard → stock transfer → sales report | Stop 5183 |
| 15 | TailFinder (`tailfinder`) | `python -m http.server 5184 --directory dist` in `Desktop/tailfinder-master` | `index.html`, adopter `home.html`, `browse.html`, admin `index.html`, `adoption_request.html`, `report_pets.html` | Landing → adopter browse → open a pet → admin adoption requests → reports | Stop 5184 |
| 16 | Checkers (`checkers`) | `python -m http.server 5185 --directory public` in `Desktop/checkers` | Login screen, board at start, mid-game vs Hard AI, leaderboard / result screen (whatever exists in Step 2) | Start a game vs the computer on Hard → play 3–4 moves (click piece, click target; read legal squares from the DOM) → AI replies each time | Stop 5185 |
| 17 | StudySpace (`studyspace`) | `Desktop/StudySpace`: `npx vite --port 5174`. In the capture script, `page.route('**/*.supabase.co/**', fulfil)` answers **every** Supabase request with fake data built from `src` types (auth session for a fake user "Demo", notes, decks, cards, sky stars); requests that aren't mocked are **aborted** so nothing reaches the real project. Check `page.on('request')` logs: zero requests to the real Supabase host may complete. | `/login`, home sky, notes editor, flashcard review, planner, Nova chat (mock the `ai` function response with a short canned tutor reply labelled in the script) | Home sky → open a note → review two flashcards → ask Nova "Quiz me on photosynthesis" (canned reply) | Stop 5174. **If** the app can't reach these screens under mocks within a reasonable effort: stop, tell Fred, and use `/login` and the intro only, with his OK |
| 18 | ISKONNECT (`iskonnect`) | First try `Desktop/iskonnect-caps-new-main-main/admin-ui`: check for emulator support (`connectFirestoreEmulator`); if present, start the Firestore/Auth emulators and seed **fake** scholars with a small script; else don't run it | Admin dashboard, scholars list, requirements, attendance, announcements | Dashboard → scholars list → open a fake scholar → requirements | Stop the dev server and emulators. **If it can't run on fake data**: pick 4–6 candidates from `Screenshots/`, check each for real names/IDs/photos, show the picks to Fred, and use only what he approves (crop/blur anything personal with PIL) |

---

## Self-review notes

- Spec coverage: routing (T1–2), data (T3), deck (T5), list (T6), page with demo/features/gallery/build/pager (T4, T7), command palette + chatbot (T2, T8), media per project (T10–18), error handling (DemoPlayer fallback T4, missing gallery T7, not-found T2/T7), testing (T1, T3, T9, per-media Step 7).
- Names used across tasks: `parseRoute`, `shouldHandleClick`, `useRoute`, `usePathname`, `navigate`, `Link`, `usePageTitle`, `LaptopShot`, `DemoPlayer`, `Gallery`, `Badge`, `FeatureIcon`, `ProjectDeck`, `openBrowser`, `still`, `clip`, `glide` — consistent.
