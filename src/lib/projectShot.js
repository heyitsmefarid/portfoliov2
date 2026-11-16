import { projects } from '../data/projects.js'

// The screenshot to show for a project in lists: the first gallery shot (a
// real screen of the app), else the project's main image.
export function projectShot(project) {
  return project.gallery?.[0] ?? project.image
}

// Each project's row number in the full list (1-based), so numbering stays
// the same when the list is filtered.
export const projectNumbers = Object.fromEntries(projects.map((project, index) => [project.id, index + 1]))
