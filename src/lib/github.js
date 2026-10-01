// Loads the contribution calendar. Tries this site's /api/github route first
// (official GitHub API when GITHUB_TOKEN is set), then the public no-key API
// directly from the browser — so it also works on static hosting.

const PUBLIC_API = 'https://github-contributions-api.jogruber.de/v4/'

function isCalendar(data) {
  return Array.isArray(data?.days) && data.days.length > 0 && typeof data.total === 'number'
}

async function getJson(url, timeoutMs) {
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!response.ok) throw new Error(`${url} responded ${response.status}`)
  return response.json()
}

export async function fetchContributions(username) {
  try {
    const data = await getJson('/api/github', 8_000)
    if (isCalendar(data)) return data
  } catch {
    // Route missing (static hosting) or failing — use the public API below.
  }

  const payload = await getJson(`${PUBLIC_API}${encodeURIComponent(username)}?y=last`, 10_000)
  const data = {
    username,
    total: payload?.total?.lastYear,
    days: payload?.contributions,
    source: 'public',
  }
  if (!isCalendar(data)) throw new Error('No contribution data')
  return data
}

// Groups days into Sunday-first weeks (columns), padding the first week.
export function toWeeks(days) {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  const firstDay = new Date(`${sorted[0].date}T00:00:00Z`).getUTCDay()
  const cells = [...Array(firstDay).fill(null), ...sorted]
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Month label for each week column where a new month starts. A label with
// fewer than 3 columns before the next one is dropped so labels never overlap.
export function monthLabels(weeks) {
  let previous = -1
  const labels = weeks.map((week) => {
    const firstReal = week.find(Boolean)
    if (!firstReal) return null
    const month = Number(firstReal.date.slice(5, 7)) - 1
    if (month === previous) return null
    previous = month
    return MONTHS[month]
  })

  let next = Infinity
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    if (!labels[i]) continue
    if (next - i < 3) labels[i] = null
    else next = i
  }
  return labels
}

export function formatDay(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
