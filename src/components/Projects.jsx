import { projects } from '../data/projects.js'
import Link from './Link.jsx'
import Panel from './Panel.jsx'
import ProjectDeck from './ProjectDeck.jsx'

const featured = projects.filter((project) => project.featured)

// Home section: the featured projects as a fanned deck, and a link to them all.
export default function Projects() {
  return (
    <Panel
      id="projects"
      title="Featured projects"
      aside={
        <Link className="panel-link" href="/projects">
          All projects <span aria-hidden="true">→</span>
        </Link>
      }
    >
      <ProjectDeck projects={featured} />
    </Panel>
  )
}
