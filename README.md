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
| `profile.js` | name, headline, about text, facts, **email / LinkedIn / Facebook** (empty = hidden) |
| `projects.js` | projects in display order (the first one is featured) |
| `skills.js` | tech stack groups; `tier` controls prominence |
| `experience.js` | timeline entries (replace the OJT entry once you have a placement) |
| `education.js` | schools; add `years` if you want dates shown |
| `certifications.js` | certificates; add `issuer`, `year`, `url` when you have them |
| `sections.js` | section order and nav labels |

The chat assistant reads the same files, so anything you add here is something it can answer about.

**Adding a project:** copy an entry in `projects.js`. For a screenshot, put a `.webp` (about 1400px wide) in `public/projects/` and set `image: { src, alt, width, height }`. With `image: null` the card shows cover art (`cover: 'board' | 'gear' | 'paw' | 'halftone' | 'grid'`). Empty `liveUrl` / `codeUrl` hide those links.

## API routes (`api/`)

Written as Vercel functions (`export function GET/POST(request)`), deployed automatically on Vercel. Keys go in environment variables only. Nothing is prefixed with `VITE_`, so no key ever reaches the browser. See `.env.example`.

| Route | Needs | Without it |
| --- | --- | --- |
| `/api/chat` | `AI_API_KEY` and `AI_PROVIDER` (`anthropic` or `gemini`). Optional: `AI_MODEL` (default `claude-opus-5` / `gemini-3.5-flash-lite`), `AI_EFFORT` (Anthropic only, default `low`) | chat answers offline from `src/data` |
| `/api/github` | optional `GITHUB_TOKEN` for GitHub's official API | uses a public no-key contributions API |
| `/api/contact` | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | opens the visitor's email app if `profile.contact.email` is set, otherwise shows a notice |

Local development: copy `.env.example` to `.env.local` and fill it in. On this machine Avast intercepts HTTPS, so Node may reject api.anthropic.com or generativelanguage.googleapis.com. If chat requests fail locally, start dev with `NODE_EXTRA_CA_CERTS=C:/Users/galla/avast-root.pem npm run dev`.

On static hosting (e.g. GitHub Pages) the API routes don't exist. The site still works: chat runs offline, GitHub loads from the public API, and the contact form uses email.
