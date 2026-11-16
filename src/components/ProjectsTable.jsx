import { extraBadges, projectShot } from '../lib/projectShot.js'
import { useSeen } from '../lib/seen.js'
import Badge from './Badge.jsx'
import Link from './Link.jsx'
import './ProjectsTable.css'

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path d="M9 5h10v10M19 5 6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// The form's main table, laid out like a list of enrolled subjects: one row
// per project with its screenshot, what it is, and what it was built with.
// `numbers` are each project's position in the full list, so they stay the
// same when the list is filtered.
export default function ProjectsTable({ projects, numbers }) {
  const seen = useSeen()

  return (
    <>
      <table className="ptable">
        <thead>
          <tr>
            <th scope="col" className="ptable__no">
              No.
            </th>
            <th scope="col">Project</th>
            <th scope="col" className="ptable__type">
              Type
            </th>
            <th scope="col" className="ptable__tech">
              Built with
            </th>
            <th scope="col" className="ptable__live">
              Live
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const shot = projectShot(project)
            const badges = extraBadges(project)
            return (
              <tr key={project.id} id={`project-${project.id}`}>
                <td className="ptable__no">{String(numbers[project.id]).padStart(2, '0')}</td>
                <th scope="row">
                  <div className="ptable__project">
                    <Link className="ptable__shot" href={`/projects/${project.id}`} tabIndex={-1} aria-hidden="true">
                      <img src={shot.src} alt="" width={shot.width} height={shot.height} loading="lazy" decoding="async" />
                      {seen.includes(project.id) && <span className="ptable__seen">Seen</span>}
                    </Link>
                    <div>
                      <Link className="ptable__name" href={`/projects/${project.id}`}>
                        {project.name}
                      </Link>
                      <p className="ptable__pitch">{project.pitch}</p>
                    </div>
                  </div>
                </th>
                <td className="ptable__type">
                  {project.kind}
                  {badges.map((badge) => (
                    <span key={badge} className="ptable__badge">
                      <Badge>{badge}</Badge>
                    </span>
                  ))}
                </td>
                <td className="ptable__tech">{project.tech.join(', ')}</td>
                <td className="ptable__live">
                  {project.liveUrl ? (
                    <a className="link" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      Visit
                      <ExternalIcon />
                      <span className="visually-hidden"> {project.name} live site (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span className="ptable__none">Not public</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
