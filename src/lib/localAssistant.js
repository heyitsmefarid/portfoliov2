// Offline answers for the portfolio assistant. Used when /api/chat is not
// configured (no AI key) or unreachable, so the chat still works — it only ever
// answers from the portfolio data files.

import { profile } from '../data/profile.js'
import { experience } from '../data/experience.js'
import { education } from '../data/education.js'
import { skillGroups } from '../data/skills.js'
import { projects } from '../data/projects.js'
import { certifications } from '../data/certifications.js'

const FALLBACK_HINT =
  'You can ask about his projects, tech stack, education, experience, certifications, or how to contact him.'

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escape(word) {
  return word.replace(/[.+#]/g, '\\$&')
}

// True when any word starts a word in `text` ("tech" matches "technologies").
function hasAny(text, words) {
  return words.some((word) => new RegExp(`(^|[^a-z0-9])${escape(word)}`).test(text))
}

// True when any word appears as a whole word ("git" does not match "github").
function hasWord(text, words) {
  return words.some((word) => new RegExp(`(^|[^a-z0-9])${escape(word)}($|[^a-z0-9+#])`).test(text))
}

const PROJECT_ALIASES = {
  iskonnect: ['iskonnect', 'iskonek', 'scholarship', 'capstone'],
  tailfinder: ['tailfinder', 'tail finder', 'pet', 'pets', 'adoption'],
  'meu-gear-up': ['meu', 'gear up', 'gearup', 'motorcycle'],
  checkers: ['checkers', 'checker'],
  'guhit-arts': ['guhit', 'arts center', 'printing'],
}

function findProject(text) {
  return projects.find((project) =>
    hasWord(text, PROJECT_ALIASES[project.id] ?? [project.name.toLowerCase()]),
  )
}

function findSkill(text) {
  for (const group of skillGroups) {
    for (const item of group.items) {
      const name = item.name.toLowerCase()
      if (hasWord(text, [name, name.replace(/\.js$/, '')])) return { item, group }
    }
  }
  return null
}

// Personal topics the portfolio deliberately doesn't cover.
const UNKNOWN_PERSONAL = [
  'age', 'old', 'birthday', 'born', 'phone', 'number', 'address', 'hobby', 'hobbies',
  'girlfriend', 'boyfriend', 'married', 'family', 'religion', 'salary', 'rate', 'gpa',
  'grades', 'favorite', 'favourite',
]

function describeProject(project) {
  const lines = [`**${project.name}** — ${project.subtitle}.`, project.description]
  lines.push(`Built with: ${project.tech.join(', ')}.`)
  const links = []
  if (project.liveUrl) links.push(`Live: ${project.liveUrl}`)
  if (project.codeUrl) links.push(`Code: ${project.codeUrl}`)
  if (links.length) lines.push(links.join('\n'))
  else if (project.note) lines.push(project.note + '.')
  return lines.join('\n\n')
}

function listProjects() {
  const items = projects.map((p) => `- **${p.name}** — ${p.subtitle}`)
  return `Fred has built ${projects.length} projects shown in this portfolio:\n\n${items.join('\n')}\n\nAsk about any of them by name for details.`
}

function describeStack() {
  const lines = skillGroups.map(
    (group) => `- **${group.title}:** ${group.items.map((item) => item.name).join(', ')}`,
  )
  return `Here's Fred's tech stack:\n\n${lines.join('\n')}`
}

function describeSkill({ item, group }) {
  const usedIn = projects.filter((project) =>
    project.tech.some((tech) => tech.toLowerCase().replace(/\.js$/, '') === item.name.toLowerCase().replace(/\.js$/, '')),
  )
  let answer = `Yes — ${item.name} is part of Fred's stack (${group.title.toLowerCase()}).`
  if (usedIn.length) {
    answer += ` It appears in: ${usedIn.map((project) => project.name).join(', ')}.`
  }
  return answer
}

function describeEducation() {
  const lines = education.map((item) => {
    const detail = item.detailTitle ? `${item.detail} (${item.detailTitle})` : item.detail
    return `- **${item.program}** — ${item.school}, ${detail}${item.years ? `, ${item.years}` : ''}`
  })
  return `Fred is currently a ${profile.status}.\n\n${lines.join('\n')}`
}

function describeExperience() {
  const lines = experience.map(
    (item) => `- **${item.title}**${item.org ? ` — ${item.org}` : ''} (${item.period})`,
  )
  return `${lines.join('\n')}\n\nThe portfolio doesn't list any company internship or job yet — Fred is actively looking for an internship / OJT.`
}

function describeCertifications() {
  const lines = certifications.map((cert) => {
    const extra = [cert.issuer, cert.year].filter(Boolean).join(', ')
    return `- ${cert.name}${extra ? ` (${extra})` : ''}`
  })
  return `Fred's certifications:\n\n${lines.join('\n')}`
}

function describeContact() {
  const { contact } = profile
  const lines = []
  if (contact.email) lines.push(`- Email: ${contact.email}`)
  lines.push(`- GitHub: ${contact.github}`)
  if (contact.linkedin) lines.push(`- LinkedIn: ${contact.linkedin}`)
  if (contact.facebook) lines.push(`- Facebook: ${contact.facebook}`)
  lines.push('- The contact form at the bottom of this page')
  return `You can reach Fred through:\n\n${lines.join('\n')}`
}

function describeAbout() {
  return `${profile.name} is a ${profile.status} focused on full-stack web and mobile development.\n\nIn his own words: "${profile.about[0]}"`
}

// Returns an answer string for a visitor question, built only from portfolio data.
export function answerLocally(question) {
  const text = normalize(question)
  if (!text) return FALLBACK_HINT

  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(text) && text.split(' ').length <= 4) {
    return `Hi! I can tell you about Fred's projects, skills, education, or experience. ${FALLBACK_HINT}`
  }

  if (hasWord(text, UNKNOWN_PERSONAL)) {
    return `The portfolio does not currently provide that information. ${FALLBACK_HINT}`
  }

  if (hasAny(text, ['contact', 'email', 'reach', 'hire', 'linkedin', 'facebook', 'get in touch'])) {
    return describeContact()
  }

  const project = findProject(text)
  if (project && !hasWord(text, ['projects'])) return describeProject(project)

  if (hasAny(text, ['project', 'built', 'build', 'portfolio', 'made', 'apps', 'work samples'])) {
    return listProjects()
  }

  if (hasAny(text, ['cert', 'nc ii', 'nc iii', 'tesda', 'microsoft', 'cyber'])) {
    return describeCertifications()
  }

  if (hasAny(text, ['study', 'studying', 'student', 'school', 'college', 'degree', 'education', 'course', 'senior high', 'university', 'graduate'])) {
    return describeEducation()
  }

  if (hasAny(text, ['experience', 'intern', 'internship', 'ojt', 'job', 'work', 'company', 'employ'])) {
    return describeExperience()
  }

  const skill = findSkill(text)
  if (skill) return describeSkill(skill)

  if (hasAny(text, ['tech', 'stack', 'skill', 'skills', 'language', 'languages', 'framework', 'frameworks', 'tools', 'use', 'know'])) {
    return describeStack()
  }

  if (hasAny(text, ['github', 'repo', 'repos', 'repository', 'contribution', 'contributions', 'code'])) {
    return `Fred's code is on GitHub: ${profile.contact.github}. The GitHub section of this page shows his contribution activity.`
  }

  if (hasAny(text, ['where', 'location', 'based', 'live', 'from'])) {
    return profile.location
      ? `Fred is based in ${profile.location}.`
      : 'The portfolio does not currently provide that information.'
  }

  if (hasAny(text, ['who', 'about', 'yourself', 'introduce'])) {
    return describeAbout()
  }

  return `The portfolio does not currently provide that information. ${FALLBACK_HINT}`
}
