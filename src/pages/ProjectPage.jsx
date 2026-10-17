import { projects } from '../data/projects.js'
import { usePageTitle } from '../lib/pageTitle.js'
import Badge from '../components/Badge.jsx'
import DemoPlayer from '../components/DemoPlayer.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'
import Gallery from '../components/Gallery.jsx'
import Link from '../components/Link.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import './ProjectPage.css'

function ExternalLink({ href, children }) {
  return (
    <a className="project-page__link" href={href} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden="true">↗</span>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

export default function ProjectPage({ id }) {
  const index = projects.findIndex((project) => project.id === id)
  const project = projects[index]
  usePageTitle(project?.name ?? 'Not found')
  if (!project) return <NotFoundPage message="That project isn't in this portfolio." />

  const previous = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  const meta = [project.kind, project.role, project.year].filter(Boolean)

  return (
    <article className="container page-body project-page" aria-labelledby="project-title">
      <Link className="text-link" href="/projects">
        <span aria-hidden="true">←</span> All projects
      </Link>

      <header className="project-page__hero">
        <div className="project-page__intro">
          <ul className="project-page__badges" aria-label="Highlights">
            {project.badges.map((badge) => (
              <li key={badge}>
                <Badge>{badge}</Badge>
              </li>
            ))}
          </ul>
          <h1 id="project-title" className="project-page__title">
            {project.name}
          </h1>
          <p className="project-page__subtitle">{project.subtitle}</p>
          <p className="project-page__desc">{project.description}</p>
          <p className="project-page__meta">{meta.join(' · ')}</p>
          <div className="project-page__links">
            {project.liveUrl && <ExternalLink href={project.liveUrl}>View project</ExternalLink>}
            {project.codeUrl && <ExternalLink href={project.codeUrl}>View code</ExternalLink>}
            {project.note && <span className="project-page__note">{project.note}</span>}
          </div>
          <ul className="project-page__tech" aria-label="Technologies">
            {project.tech.map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
          </ul>
        </div>
        <div className="project-page__demo">
          <DemoPlayer demo={project.demo} fallback={project.image} label={project.name} />
        </div>
      </header>

      <section className="project-page__section" aria-labelledby="features-title" data-reveal>
        <h2 id="features-title" className="project-page__heading">
          Features
        </h2>
        <ul className="features">
          {project.features.map((feature) => (
            <li key={feature.title} className="feature">
              <span className="feature__icon">
                <FeatureIcon name={feature.icon} />
              </span>
              <h3 className="feature__title">{feature.title}</h3>
              <p className="feature__text">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {project.gallery.length > 0 && (
        <section className="project-page__section" aria-labelledby="gallery-title" data-reveal>
          <h2 id="gallery-title" className="project-page__heading">
            Screenshots
          </h2>
          <Gallery items={project.gallery} title={project.name} />
        </section>
      )}

      <section className="project-page__section" aria-labelledby="build-title" data-reveal>
        <h2 id="build-title" className="project-page__heading">
          How it&apos;s built
        </h2>
        <ul className="build">
          {project.build.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <nav className="project-page__pager" aria-label="More projects">
        <Link href={`/projects/${previous.id}`} className="pager__link">
          <span>← Previous</span>
          {previous.name}
        </Link>
        <Link href={`/projects/${next.id}`} className="pager__link pager__link--next">
          <span>Next →</span>
          {next.name}
        </Link>
      </nav>
    </article>
  )
}
