import { projects } from '../data/projects.js'

// The screenshot to show for a project in lists: the first gallery shot (a
// real screen of the app), else the project's main image.
export function projectShot(project) {
  return project.gallery?.[0] ?? project.image
}

// Each project's row number in the full list (1-based), so numbering stays
// the same when the list is filtered.
export const projectNumbers = Object.fromEntries(projects.map((project, index) => [project.id, index + 1]))

// Badges that add something: not a repeat of the type ("Capstone" next to
// "Capstone project") or of the stack ("TypeScript").
export function extraBadges(project) {
  const said = `${project.kind} ${project.tech.join(' ')}`.toLowerCase()
  return project.badges.filter((badge) => !said.includes(badge.toLowerCase()))
}
