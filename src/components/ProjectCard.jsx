import { useTilt } from '../hooks/useTilt.js'
import ProjectCover from './ProjectCover.jsx'

function ExternalLink({ href, children, label }) {
  return (
    <a className="project__link" href={href} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden="true">↗</span>
      <span className="visually-hidden"> — {label} (opens in a new tab)</span>
    </a>
  )
}

export default function ProjectCard({ project, index }) {
  const titleId = `project-${project.id}-title`
  const tiltRef = useTilt(8)
  const links = [
    project.liveUrl && (
      <ExternalLink key="live" href={project.liveUrl} label={project.name}>
        View project
      </ExternalLink>
    ),
    project.codeUrl && (
      <ExternalLink key="code" href={project.codeUrl} label={`${project.name} source code`}>
        View code
      </ExternalLink>
    ),
  ].filter(Boolean)

  return (
    <article
      id={`project-${project.id}`}
      className="project"
      aria-labelledby={titleId}
      style={{ '--i': index }}
    >
      <div className="project__media">
        <div className="project__tilt" ref={tiltRef}>
          {project.image ? (
            // Real screenshot, shown on a simple laptop frame
            <div className="laptop">
              <div className="laptop__screen">
                <img
                  src={project.image.src}
                  alt={project.image.alt}
                  width={project.image.width}
                  height={project.image.height}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
              <div className="laptop__base" aria-hidden="true" />
            </div>
          ) : (
            <div className="project__cover">
              <ProjectCover variant={project.cover} />
            </div>
          )}
        </div>
      </div>

      <div className="project__info">
        <div className="project__heading">
          <h3 id={titleId} className="project__name">
            {project.name}
          </h3>
          <span className="project__meta">
            {project.kind}
            <span className="project__index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          </span>
        </div>
        <p className="project__subtitle">{project.subtitle}</p>
        <p className="project__desc">{project.description}</p>

        <ul className="project__tech" aria-label="Technologies">
          {project.tech.map((tech) => (
            <li key={tech} className="chip">
              {tech}
            </li>
          ))}
        </ul>

        <div className="project__links">
          {links.map((link, i) => [
            i > 0 && (
              <span key={`sep-${i}`} className="project__sep" aria-hidden="true">
                |
              </span>
            ),
            link,
          ])}
          {project.note && <span className="project__note">{project.note}</span>}
        </div>
      </div>
    </article>
  )
}
