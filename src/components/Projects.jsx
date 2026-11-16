import { projects } from '../data/projects.js'
import { projectNumbers } from '../lib/projectShot.js'
import Link from './Link.jsx'
import Panel from './Panel.jsx'
import ProjectsTable from './ProjectsTable.jsx'

// Home: every project in one table.
export default function Projects() {
  return (
    <Panel
      id="projects"
      title={`Projects (${projects.length})`}
      flush
      aside={<Link href="/projects">Filter by platform</Link>}
    >
      <ProjectsTable projects={projects} numbers={projectNumbers} />
    </Panel>
  )
}
