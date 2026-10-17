# Project pages — design

Date: 2026-10-17 · Status: approved in chat, awaiting spec review

## Goal

Recruiters and clients should be able to see what each project actually does
without leaving the portfolio. Borrow the structure of 800k.dev (fanned card
deck on the home page, an "All projects" list, a page per project) and keep the
portfolio's own look: dark theme, amber accent, Geist + JetBrains Mono.

Success means:

- The home page shows a fanned deck of three featured projects with an
  "All projects →" link.
- `/projects` lists all nine projects.
- `/projects/<id>` shows a project's pitch, a short demo clip, its features,
  a screenshot gallery, how it was built, and links.
- Every screenshot and clip is real, captured from the app running locally on
  fake or demo data. Nothing personal or private appears.
- Direct links, back/forward, phone widths and reduced motion all work.

## Non-goals

- Restyling the rest of the site.
- Hosting any project that isn't hosted yet.
- Badges that claim things that aren't true (no invented awards or rankings).

## Routing

A small router in `src/lib/router.js` (no new dependency):

- `useRoute()` returns `{ name: 'home' | 'projects' | 'project' | 'notFound', id? }`
  parsed from `location.pathname`.
- `navigate(path)` calls `history.pushState`, notifies subscribers, and scrolls
  to the top (or to `#hash` when the path has one).
- `<Link href>` renders a real `<a>`; plain left-clicks call `navigate`,
  modified clicks (Ctrl/Cmd/middle) behave like normal links.
- `popstate` restores the previous route; the browser restores scroll position
  (`history.scrollRestoration` stays `auto`).
- An unknown `/projects/<id>` renders a short "Project not found" page with a
  link back to `/projects`.
- `vercel.json` rewrites every path that isn't a file or `/api/*` to
  `/index.html`.
- `document.title` is set per route, e.g. `StudySpace — Fred Anthony Gallano`.

`App.jsx` keeps the shared chrome (Backdrop, SideIndex, CommandPalette, Chatbot,
ContactDialog, Footer, CursorCompanion, EasterEgg) and swaps the page body by
route. The Intro splash plays only on the first load of `/`. Section links
(`#about`, `#projects`, …) used from a project page navigate to `/` and then
scroll to the section.

## Data (`src/data/projects.js`)

Existing fields stay. New fields per project:

| Field | Type | Notes |
|---|---|---|
| `featured` | boolean | The three featured projects appear in the home deck, in array order. |
| `badges` | string[] | 1–3 short, true labels, e.g. `CAPSTONE`, `AI-POWERED`, `TEAM PROJECT`. |
| `pitch` | string | One line for cards and the list. |
| `role` | string | e.g. "Solo developer", "Extended the existing app". |
| `year` | string | e.g. "2026". |
| `platform` | string[] | Used by filters: `web`, `mobile`, `desktop`, `ai`. |
| `features` | `{ icon, title, text }[]` | 4–6 items. `icon` is a name from a small inline icon set. |
| `gallery` | `{ src, alt, caption, width, height }[]` | 3–6 screenshots. |
| `demo` | `{ src, poster, width, height } \| null` | Animated WebP clip plus a still poster. |
| `build` | string[] | 2–4 "how it's built" bullets. |

The existing `image` stays as the card thumbnail. Media lives in
`public/projects/<id>/` (WebP stills, animated WebP clips). Target ≤ 2 MB per
clip, ≤ 150 KB per still.

## Components

| File | Purpose |
|---|---|
| `components/ProjectDeck.jsx` + `.css` | Home deck: three fanned cards; front card shows badges, icon, name, pitch, links. Click / ← → / swipe brings a card to the front; clicking the front card opens its page. Hovering the front card plays its demo muted. Reduced motion: static row, no autoplay. |
| `pages/ProjectsPage.jsx` + `.css` | Header, filter chips (All · Web · Mobile · Desktop · AI), one row per project, each linking to its page. |
| `pages/ProjectPage.jsx` + `.css` | Hero, demo, features, gallery, build notes, previous/next. |
| `components/DemoPlayer.jsx` | Laptop-framed animated WebP that plays only while visible (paused = poster still), with a play/pause button; never autoplays under reduced motion. |
| `components/Gallery.jsx` | Screenshot grid opening a lightbox; reuses the certificate viewer's dialog pattern (focus trap, Esc, arrow keys). |
| `components/Badge.jsx` | Pill used by the deck, list and page. |
| `lib/router.js` | As above. |

`Projects.jsx` (the home section) becomes a thin wrapper around `ProjectDeck`
with the "All projects →" link. `ProjectCard.jsx` and `useStackedCards.js` are
removed once nothing uses them. The command palette gains entries for
`/projects` and each project page. The chatbot's local answers link to project
pages.

## Media capture

All capture is scripted with Playwright and runs on the local machine. Clips
are captured as timed screenshot frames and encoded to animated WebP with
Python's PIL (Playwright's bundled ffmpeg can only record, not trim or convert,
and no new tools are installed).
Temporary accounts are removed and every server started for capture is stopped
afterwards.

| Project | Source |
|---|---|
| Bahadvisory | Firebase emulators + `npm run seed -- --emulator` |
| Library Management System | Laragon MySQL + PHP built-in server, temporary admin |
| Guhit Arts Center | Its Vite dev server (data simulated in the browser) |
| MEU Gear Up | Its static demo build (`dist/`, `demo.js`) |
| TailFinder | Its static demo build (`static-build/`, `demo_seed.sql`) |
| Checkers | The web version in `checkers/public` |
| StudySpace | Local dev server with every Supabase request answered by Playwright network mocks serving fake data (Docker, needed for a local Supabase, isn't installed). Never the real Supabase project. If mocking can't reach the main screens: public pages only, after asking. |
| ISKONNECT | Its admin UI against the emulator if it runs locally; otherwise a selection from the existing `Screenshots/` folder containing no real student data, shown to Fred before use. |

## Error handling

- A missing `demo` hides the demo block; a missing `gallery` hides the gallery;
  a project with neither still renders hero, features and build notes.
- A clip that fails to load falls back to its poster.
- Unknown routes render the not-found page instead of a blank screen.

## Testing

- `npm run lint` and `npm run build`.
- A Playwright smoke script that opens `/`, `/projects` and every
  `/projects/<id>` directly, checks for the heading, no console errors and no
  horizontal overflow at 375 px and 1280 px, and checks back/forward between
  pages.
- Manual check with `prefers-reduced-motion: reduce`.
- Screenshots of each page are shown to Fred before pushing.

## Delivery order

1. Router, `vercel.json`, data fields, deck, list page and project page, using
   the screenshots that already exist.
2. Media per project, one at a time; each project goes live when its media is
   done.
