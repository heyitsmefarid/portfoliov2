---
name: portfolio-form
description: Use when changing anything visual in this portfolio (layout, a new section, a new project field, colours, type, motion, a new overlay). Keeps the work inside the "registration form" design, keeps the home page compact and multi-column, and says how to verify it.
---

# Working on the registration-form portfolio

This site is designed as one printed registration form. Read `DESIGN.md` at the
repo root before any UI change; it is the source of truth for colour, type and
the objects on the form. This skill is the working method.

## Rules that are easy to break

1. **Everything is a cell.** New content goes in a `Panel` (`src/components/Panel.jsx`)
   with a title bar, and gets a place on the 12-column grid in
   `src/styles/layout.css` (`grid-template-areas` of `.form--home`). No floating
   cards, no rounded panels, no sections outside the form.
2. **Stay compact and multi-column.** The owner rejected a one-column,
   long-scroll version. Prefer a new cell beside an existing one over a new
   full-width row. `npm run check:home` fails if desktop cells stack or the home
   page grows past its height budget.
3. **Two voices.** Printed parts of the form (labels, title bars, prose) are
   Archivo. Anything "typed in" (names, values, project titles, tech) is Courier
   Prime: use `.blank__value` or `.typed`. Labels are sentence case
   (`.blank__label`), never tracked capitals. The only capitals are the rubber
   stamps.
4. **Red is the stamp ink.** `--pen` is for the stamp, the control number,
   hover and focus. Not for decoration.
5. **Overlays are slips.** Dialogs, menus and toasts use `.slip`.
6. **One authored sequence**: the name is typed, then the stamp lands. Add motion only as a response to the
   visitor (hover, tick, open). No scroll reveals.
7. **Playful means physical.** New fun details must be things a paper form
   really has or does (paperclip, highlighter, stamps, tear-off stub, a sticky
   note). If it couldn't happen on a desk, it doesn't belong.
8. **Content is data.** Text lives in `src/data/`. Don't write claims about
   Fred's work that the data doesn't support.

## Avoid (these read as generated)

Eyebrow labels above headings, section numbers that aren't real numbering,
gradient or glow accents, identical icon cards, arrows or middle dots glued
into link text, a spaced em dash between a label and a fragment.

## Verify every visual change

```bash
npm run lint && npm test && npm run build
npm run check:home          # overflow at 11 widths, side-by-side cells, height budget
node scripts/smoke.mjs      # every route, navigation, responsive inner pages
```

Then look at it. Start `npx vite --port 5179` and, from a temp folder, run
`node <repo>/scripts/shots.mjs <prefix>`. It captures the home page (light,
dark, phone), a project page, /projects, every overlay and the intro. Open the
images and check both themes and the phone width before saying it's done.

If a change alters the visual system itself (a new token, a new kind of
object), update `DESIGN.md` in the same change.
