// GET /api/github — contribution calendar for the GitHub section.
//
// With GITHUB_TOKEN set (a fine-grained token with no extra permissions is
// enough) this reads GitHub's official GraphQL API. Without it, it reads the
// public github-contributions-api.jogruber.de service, which needs no key.
// The browser falls back to that public service directly if this route is
// unavailable (e.g. on static hosting).

import { json } from './_lib/http.js'
import { profile } from '../src/data/profile.js'

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

async function fromGraphQL(username, token) {
  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount contributionLevel } }
        }
      }
    }
  }`

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: username } }),
  })
  if (!response.ok) throw new Error(`GitHub GraphQL responded ${response.status}`)

  const payload = await response.json()
  const calendar = payload?.data?.user?.contributionsCollection?.contributionCalendar
  if (!calendar) throw new Error('GitHub GraphQL returned no calendar')

  return {
    total: calendar.totalContributions,
    days: calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      })),
    ),
    source: 'github',
  }
}

async function fromPublicApi(username) {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
  )
  if (!response.ok) throw new Error(`Public contributions API responded ${response.status}`)
  const payload = await response.json()
  if (!Array.isArray(payload?.contributions)) throw new Error('Public contributions API returned no data')

  return {
    total: payload.total?.lastYear ?? payload.contributions.reduce((sum, day) => sum + day.count, 0),
    days: payload.contributions,
    source: 'public',
  }
}

export async function GET() {
  const username = profile.contact.githubUsername
  const token = process.env.GITHUB_TOKEN

  try {
    const data = token ? await fromGraphQL(username, token) : await fromPublicApi(username)
    return json(
      { username, ...data },
      200,
      { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
    )
  } catch (error) {
    console.error('[api/github]', error.message)
    return json({ error: 'unavailable' }, 502)
  }
}
