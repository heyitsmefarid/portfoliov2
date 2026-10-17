import { useState } from 'react'
import { projects } from '../data/projects.js'
import { usePageTitle } from '../lib/pageTitle.js'
import Badge from '../components/Badge.jsx'
import LaptopShot from '../components/LaptopShot.jsx'
import Link from '../components/Link.jsx'
import './ProjectsPage.css'

const FILTERS = [
  ['all', 'All'],
  ['web', 'Web'],
  ['mobile', 'Mobile'],
  ['desktop', 'Desktop'],
  ['ai', 'AI'],
]

export default function ProjectsPage() {
  usePageTitle('Projects')
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? projects : projects.filter((project) => project.platform.includes(filter))

  return (
    <div className="container page-body projects-page">
      <header className="projects-page__head">
        <Link className="text-link" href="/#projects">
          <span aria-hidden="true">←</span> Home
        </Link>
        <h1 className="projects-page__title">Projects</h1>
        <p className="projects-page__lede">
          Apps I&apos;ve designed and built, from capstone systems to games. Open one to see it in action.
        </p>
        <div className="projects-page__filters" role="group" aria-label="Filter projects">
          {FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="chip"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <ol className="project-rows">
        {shown.map((project) => (
          <li key={project.id}>
            <article className="project-row" aria-labelledby={`row-${project.id}`}>
              <Link className="project-row__shot" href={`/projects/${project.id}`} tabIndex={-1} aria-hidden="true">
                <LaptopShot {...project.image} />
              </Link>
              <div className="project-row__body">
                <ul className="project-row__badges" aria-label="Highlights">
                  {project.badges.map((badge) => (
                    <li key={badge}>
                      <Badge>{badge}</Badge>
                    </li>
                  ))}
                </ul>
                <h2 id={`row-${project.id}`} className="project-row__name">
                  <Link href={`/projects/${project.id}`}>{project.name}</Link>
                </h2>
                <p className="project-row__pitch">{project.pitch}</p>
                <p className="project-row__tech">{project.tech.join(' · ')}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  )
}
