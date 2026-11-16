# Design: the registration form

The whole site is one printed registration form, the single sheet every
Filipino college student is handed each semester: security paper, boxed cells,
a photo box, a table of subjects, a control number, a rubber stamp. Here the
"subjects" are projects.

The form is the reason the site is compact. A form puts everything on one
sheet, side by side, in labelled boxes. If a change makes the home page a long
single column again, it has left the design.

## Colour

Tokens live in `src/styles/global.css`; components never hard-code colours
(photos, printouts and the intro envelope are physical objects and keep fixed
values).

| Token | Form (light) | Carbon copy (dark) | Use |
| --- | --- | --- | --- |
| `--paper` | `#d3ead9` | `#0c2b22` | security paper (cells) |
| `--paper-deep` | `#c3dfcb` | `#08211a` | the desk around the form |
| `--field` | `#eaf5ec` | `#11382c` | the part of a cell that gets filled in; row hover |
| `--ink` | `#0e3a2d` | `#cfeedb` | print, borders, title bars |
| `--ink-soft` | `#33614f` | `#9ccab2` | secondary print (tinted ink, never grey) |
| `--pen` | `#b3221a` | `#ff8a7d` | stamp ink: stamp, control number, hover, focus |
| `--card` | `#fbfdf9` | `#133d30` | white slips (overlays) |

Cells carry a faint wave pattern (`--wave`), the guilloche of security paper.
Dark mode is the same form as a carbon copy, not a different palette.

## Type

- **Archivo** (`@fontsource-variable/archivo/wdth.css`) is what the form is
  printed in: labels (`'wdth' 82`, narrow), prose (`'wdth' 100`), title bars
  and buttons (`'wdth' 112`), the masthead and stamps (`'wdth' 118–125`).
- **Courier Prime** (`var(--typed)`) is what's typed into it: the name, values
  in blanks, project titles, tech, dates, numbers.

Labels are small sentence case, never tracked capitals. The only capitals are
the rubber stamps.

## Structure

- `.form` is a 12-column grid with `gap: 1px` over an ink background, so the
  gaps are the printed lines and every border is drawn once.
- `.cell` is one box. `Panel` renders a cell with an ink title bar
  (`.cell__title`) and a body (`.cell__body`, or `flush` for tables and media).
- `.blank` is a labelled blank: `.blank__label` over `.blank__value`.
- `src/styles/layout.css` places the home cells with `grid-template-areas`:
  photo, details and status across the top; the projects table beside About,
  Tech stack and the walkthrough; Experience, Education, Certifications and
  Contact in four columns; GitHub full width; a signature line.
- 641–1080px: cells pair up two per row. ≤640px: one cell per row, cells stay
  dense inside (two-column blanks, table drops columns via container queries).
- `npm run check:home` enforces no overflow at 11 widths, the side-by-side
  cells on desktop, and a height budget (2.8 screens at 1440×900).

## Objects on the form

- **Header strip**: ink bar with the name, section links, Ctrl K menu, switch.
- **Control number**: the visit count, red, zero-padded.
- **Photo box**, **blanks**, and the **status box** with the stamp.
- **Ticker**: one ink strip of the stack, like a repeated microprint line.
- **Projects table**: number, screenshot, name, pitch, type, built with, live.
- **Tick boxes**: the filters on /projects.
- **Slips** (`.slip`): every overlay (Ctrl K menu, contact form, chat,
  certificate viewer, easter-egg note) is a white slip with a printed head line.
- **Data sketch** (`SystemSketch`): crow's-foot entity diagram on project
  pages, from `src/data/systems.js`.
- **Paperclip**: the ID photo hangs from one, slightly crooked.
- **Highlighter** (`--marker`): swipes under a project name when its row is
  hovered.
- **"Seen" stamps**: rows the visitor has already opened get stamped
  (`src/lib/seen.js`, their browser only).
- **Tear-off stub**: the Contact cell has a perforated edge and saves a vCard.
- **"Received by" line** (`SignPad`): visitors can sign it; nothing is stored.
- **Sticky note** (`StickyNote`): one draggable yellow note with a tip. It is
  a real object, so it keeps its yellow in both themes.
- **Brown envelope**: the once-per-visit intro.
- **Void stamp**: the 404 page.

## Motion

One authored sequence on load: the envelope slides away, the name is typed in
key by key, then the rubber stamp comes down on the status box. Everything else answers the visitor (row hover, ticks,
slips sliding in). No scroll reveals. Reduced motion skips the intro and shows
the stamp already down.
