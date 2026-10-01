import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const root = process.cwd()
const FORWARDED_HEADERS = ['content-type', 'user-agent', 'x-forwarded-for', 'accept']

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Serves the files in /api (written as Vercel-style `export function POST(request)`
// handlers) during `vite dev` and `vite preview`, so the chat, GitHub and contact
// routes work locally exactly as they do when deployed.
function apiRoutes() {
  const attach = (server, load) => {
    server.middlewares.use(async (req, res, next) => {
      const match = req.url?.match(/^\/api\/([a-z0-9-]+)\/?(\?.*)?$/)
      if (!match) return next()

      const file = path.join(root, 'api', `${match[1]}.js`)
      if (!fs.existsSync(file)) return next()

      try {
        const mod = await load(match[1], file)
        const handler = mod[req.method]
        if (typeof handler !== 'function') {
          res.statusCode = 405
          return res.end()
        }

        const headers = new Headers()
        for (const name of FORWARDED_HEADERS) {
          if (typeof req.headers[name] === 'string') headers.set(name, req.headers[name])
        }
        const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req)
        const request = new Request(`http://${req.headers.host}${req.url}`, {
          method: req.method,
          headers,
          body,
        })

        const response = await handler(request)
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(Buffer.from(await response.arrayBuffer()))
      } catch (error) {
        server.config.logger.error(`[api] ${req.url}: ${error.stack || error}`)
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'server_error' }))
      }
    })
  }

  return {
    name: 'local-api-routes',
    configureServer(server) {
      attach(server, (name) => server.ssrLoadModule(`/api/${name}.js`))
    },
    configurePreviewServer(server) {
      attach(server, (_name, file) => import(pathToFileURL(file).href))
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make .env / .env.local values available to the API handlers during local
  // development. They stay server-side: only VITE_* variables reach the browser.
  const env = loadEnv(mode, root, '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    plugins: [react(), apiRoutes()],
  }
})
