import { useEffect } from 'react'
import { projects } from '../data/projects.js'
import { usePageTitle } from '../lib/pageTitle.js'
import { projectNumbers } from '../lib/projectShot.js'
import { markSeen } from '../lib/seen.js'
import Badge from '../components/Badge.jsx'
import DemoPlayer from '../components/DemoPlayer.jsx'
import FeatureIcon from '../components/FeatureIcon.jsx'
import Gallery from '../components/Gallery.jsx'
import Link from '../components/Link.jsx'
import SystemSketch from '../components/SystemSketch.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import './ProjectPage.css'

function ExternalLink({ href, children }) {
  return (
    <a className="link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
        <path d="M9 5h10v10M19 5 6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

function Blank({ label, children }) {
  return (
    <div className="blank">
      <dt className="blank__label">{label}</dt>
      <dd className="blank__value">{children}</dd>
    </div>
  )
}

function Cell({ id, title, className = '', children }) {
  return (
    <section className={`cell ${className}`} aria-labelledby={id}>
      <div className="cell__title">
        <h2 id={id}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

export default function ProjectPage({ id }) {
  const index = projects.findIndex((project) => project.id === id)
  const project = projects[index]
  usePageTitle(project?.name ?? 'Not found')
  // Stamps this project "Seen" in the projects table (this browser only).
  useEffect(() => {
    if (project) markSeen(project.id)
  }, [project])
  if (!project) return <NotFoundPage message="That project isn't in this portfolio." />

  const previous = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  const badges = project.badges.filter((badge) => badge.toLowerCase() !== project.kind.toLowerCase())

  return (
    <article className="form project-page" aria-labelledby="project-title">
      <header className="cell project-page__head">
        <div>
          <Link className="backlink" href="/projects">
            All projects
          </Link>
          <h1 id="project-title" className="page-title">
            {project.name}
          </h1>
          <p className="project-page__subtitle">{project.subtitle}</p>
        </div>
        <p className="control">
          <span className="control__label">Project no.</span>
          <span className="control__no">{String(projectNumbers[project.id]).padStart(2, '0')}</span>
        </p>
      </header>

      <dl className="cell project-page__blanks">
        <Blank label="Type">{project.kind}</Blank>
        {project.role && <Blank label="My part">{project.role}</Blank>}
        {project.year && <Blank label="Year">{project.year}</Blank>}
        {badges.length > 0 && (
          <Blank label="Notes">
            {badges.map((badge, i) => (
              <span key={badge}>
                {i > 0 && ', '}
                <Badge>{badge}</Badge>
              </span>
            ))}
          </Blank>
        )}
        <Blank label="Built with">{project.tech.join(', ')}</Blank>
        <Blank label="Links">
          <span className="project-page__links">
            {project.liveUrl && <ExternalLink href={project.liveUrl}>Live site</ExternalLink>}
            {project.codeUrl && <ExternalLink href={project.codeUrl}>Code</ExternalLink>}
            {project.note && <span className="project-page__note">{project.note}</span>}
          </span>
        </Blank>
      </dl>

      <div className="cell project-page__demo">
        <DemoPlayer demo={project.demo} fallback={project.image} label={project.name} />
      </div>

      <Cell id="about-title" title="What it is" className="project-page__about">
        <div className="cell__body">
          <p className="project-page__desc">{project.description}</p>
          <SystemSketch id={project.id} className="project-page__sketch" />
        </div>
      </Cell>

      <Cell id="features-title" title="What it does" className="project-page__features">
        <ul className="features">
          {project.features.map((feature) => (
            <li key={feature.title} className="feature">
              <span className="feature__icon">
                <FeatureIcon name={feature.icon} size={18} />
              </span>
              <p>
                <strong className="feature__title">{feature.title}.</strong> {feature.text}
              </p>
            </li>
          ))}
        </ul>
      </Cell>

      {project.gallery.length > 0 && (
        <Cell id="gallery-title" title={`Screens (${project.gallery.length})`} className="project-page__gallery">
          <div className="cell__body">
            <Gallery items={project.gallery} title={project.name} />
          </div>
        </Cell>
      )}

      <Cell id="build-title" title="How it's built" className="project-page__build">
        <ol className="build">
          {project.build.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </Cell>

      <nav className="cell project-page__pager" aria-label="More projects">
        <Link href={`/projects/${previous.id}`} className="pager__link">
          <span className="blank__label">Previous project</span>
          <span className="pager__name">{previous.name}</span>
        </Link>
        <Link href={`/projects/${next.id}`} className="pager__link pager__link--next">
          <span className="blank__label">Next project</span>
          <span className="pager__name">{next.name}</span>
        </Link>
      </nav>
    </article>
  )
}
