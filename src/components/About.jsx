import { profile } from '../data/profile.js'
import { projects } from '../data/projects.js'
import { certifications } from '../data/certifications.js'
import Panel from './Panel.jsx'

// Counted from the data, so they stay true as projects and certificates are added.
const platforms = new Set(projects.flatMap((project) => project.platform.filter((p) => p !== 'ai')))
const FACTS = [
  { value: projects.length, label: 'projects built' },
  { value: certifications.length, label: 'certifications' },
  { value: platforms.size, label: `platforms (${[...platforms].join(', ')})` },
]

export default function About() {
  return (
    <Panel id="about" title="About me">
      <div className="about__text">
        {profile.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <dl className="about__facts">
        {FACTS.map((fact) => (
          <div key={fact.label} className="blank">
            <dt className="blank__label">{fact.label}</dt>
            <dd className="blank__value about__count">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}
