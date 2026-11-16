import { useState } from 'react'
import { projects } from '../data/projects.js'
import { usePageTitle } from '../lib/pageTitle.js'
import { projectNumbers } from '../lib/projectShot.js'
import Link from '../components/Link.jsx'
import ProjectsTable from '../components/ProjectsTable.jsx'
import './ProjectsPage.css'

const FILTERS = [
  ['all', 'Everything'],
  ['web', 'Web'],
  ['mobile', 'Mobile'],
  ['desktop', 'Desktop'],
  ['ai', 'Uses AI'],
]

export default function ProjectsPage() {
  usePageTitle('Projects')
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? projects : projects.filter((project) => project.platform.includes(filter))

  return (
    <div className="form projects-page">
      <header className="cell projects-page__head">
        <div>
          <Link className="backlink" href="/#projects">
            Back to the form
          </Link>
          <h1 className="page-title">Projects</h1>
          <p className="projects-page__lede">
            Everything I&apos;ve designed and built, from my capstone system to a checkers game. Open one to see it
            running.
          </p>
        </div>
        <div className="projects-page__filter">
          <p className="blank__label" id="filter-label">
            Tick one to show only
          </p>
          <div className="ticks" role="group" aria-labelledby="filter-label">
            {FILTERS.map(([value, label]) => (
              <button key={value} type="button" className="tick" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                <svg className="tick__box" viewBox="0 0 20 20" aria-hidden="true">
                  <rect x="2" y="2" width="16" height="16" />
                  <path d="M5.5 10.5 9 14l6-8.5" />
                </svg>
                {label}
              </button>
            ))}
          </div>
          <p className="projects-page__count typed" aria-live="polite">
            {shown.length === projects.length ? `All ${projects.length} projects` : `${shown.length} of ${projects.length} projects`}
          </p>
        </div>
      </header>

      <section className="cell cell--projects" aria-label="Projects">
        <div className="cell__flush">
          <ProjectsTable projects={shown} numbers={projectNumbers} />
        </div>
      </section>
    </div>
  )
}
