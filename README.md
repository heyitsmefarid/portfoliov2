# fredport

Personal portfolio of Fred Anthony Gallano. React 19 + Vite, plain CSS, and three small serverless API routes.

```bash
npm install
npm run dev       # http://localhost:5173 (the /api routes work in dev too)
npm run build     # production build in dist/
npm run lint
```

## Editing content

All text lives in `src/data/`, so you don't need to touch the components:

| File | What it holds |
| --- | --- |
| `profile.js` | name, role, about text, availability, **email / LinkedIn / Facebook** (empty = hidden) |
| `projects.js` | projects in display order (the first one is featured) |
| `skills.js` | tech stack groups; `tier` controls prominence |
| `experience.js` | timeline entries (replace the OJT entry once you have a placement) |
| `education.js` | schools; add `years` if you want dates shown |
| `certifications.js` | certificates; add `issuer`, `year`, `url` when you have them |
| `sections.js` | section order and header labels |
| `systems.js` | the simplified data sketch drawn on each project page |


**Adding a project:** copy an entry in `projects.js`. For a screenshot, put a `.webp` (about 1400px wide) in `public/projects/` and set `image: { src, alt, width, height }`. Lists show the project's first gallery shot. Empty `liveUrl` / `codeUrl` hide those links. To give it a data sketch (the small entity diagram on its page), add an entry to `src/data/systems.js`.

## Design

The site is designed as one printed registration form. `DESIGN.md` describes the system; `.claude/skills/portfolio-form` is the working method for changing it. `npm run check:home` guards the compact multi-column layout, and `node scripts/shots.mjs <prefix>` screenshots every page and state for review.

## API routes (`api/`)

Written as Vercel functions (`export function GET/POST(request)`), deployed automatically on Vercel. Keys go in environment variables only. Nothing is prefixed with `VITE_`, so no key ever reaches the browser. See `.env.example`.

| Route | Needs | Without it |
| --- | --- | --- |
| `/api/views` | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (added by Vercel → Storage → Upstash for Redis) | the hero leaves out the visit count |
| `/api/github` | optional `GITHUB_TOKEN` for GitHub's official API | uses a public no-key contributions API |
| `/api/contact` | `RESEND_API_KEY` (optional `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) | the form says it isn't connected yet and shows your email address |

Local development: copy `.env.example` to `.env.local` and fill it in. On this machine Avast intercepts HTTPS, so Node may reject outside APIs. If the API routes fail locally, start dev with `NODE_EXTRA_CA_CERTS=C:/Users/galla/avast-root.pem npm run dev`.

On static hosting (e.g. GitHub Pages) the API routes don't exist. The site still works: GitHub loads from the public API; the contact form shows your email address instead of sending.
