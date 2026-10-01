import { useRef } from 'react'
import { projects } from '../data/projects.js'
import { profile } from '../data/profile.js'
import { useStackedCards } from '../hooks/useStackedCards.js'
import Panel from './Panel.jsx'
import ProjectCard from './ProjectCard.jsx'
import './Projects.css'

// On wide screens the cards stack as you scroll: each one sticks near the top
// and the next slides over it (see useStackedCards). The page scrolls normally
// throughout — there is no scroll box inside the panel.
export default function Projects() {
  const listRef = useRef(null)
  useStackedCards(listRef)

  return (
    <Panel
      id="projects"
      title="Featured projects"
      aside={
        <a className="panel-link" href={`${profile.contact.github}?tab=repositories`} target="_blank" rel="noopener noreferrer">
          All repositories <span aria-hidden="true">↗</span>
          <span className="visually-hidden"> on GitHub (opens in a new tab)</span>
        </a>
      }
    >
      <div className="projects" ref={listRef}>
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </Panel>
  )
}
